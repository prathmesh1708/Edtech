// Server-side client for the Google Gemini API (generativelanguage.googleapis.com).
// Uses the REST streaming endpoint directly (no SDK dependency):
//   POST /v1beta/models/{model}:streamGenerateContent?alt=sse
// The API key is read from the backend .env only and is never sent to the browser.

export class GeminiError extends Error {
  /**
   * @param {'NOT_CONFIGURED'|'TIMEOUT'|'BAD_REQUEST'|'UPSTREAM_AUTH'|'QUOTA'|'UPSTREAM'|'BAD_RESPONSE'|'ABORTED'|'BLOCKED'} kind
   * @param {number|null} status upstream HTTP status, when there was one
   */
  constructor(kind, status = null, retryAfter = null) {
    super(`Gemini request failed: ${kind}`);
    this.name = 'GeminiError';
    this.kind = kind;
    this.status = status;
    this.retryAfter = retryAfter;
  }
}

// Read lazily: server.js loads dotenv after its imports are evaluated.
const config = () => {
  const retryDelay = Number(process.env.GEMINI_RETRY_DELAY_MS);
  return {
    base: (process.env.GEMINI_API_BASE_URL || 'https://generativelanguage.googleapis.com').trim().replace(/\/+$/, ''),
    key: (process.env.GEMINI_API_KEY || '').trim(),
    model: (process.env.GEMINI_MODEL || 'gemini-3.5-flash').trim(),
    // Used when the main model is out of quota or overloaded. Each model has its own
    // free-tier quota, so this keeps the tutor answering after the main one runs out.
    fallbackModel: (process.env.GEMINI_FALLBACK_MODEL || '').trim(),
    timeoutMs: Number(process.env.GEMINI_TIMEOUT_MS) || 60000,
    // Chat only: give up if Gemini has not started answering by then (overload), instead of
    // leaving the student staring at dots until the full timeout.
    firstByteTimeoutMs: Number(process.env.GEMINI_FIRST_BYTE_TIMEOUT_MS) || 25000,
    quizTimeoutMs: Number(process.env.GEMINI_QUIZ_TIMEOUT_MS) || 90000,
    maxOutputTokens: Number(process.env.GEMINI_MAX_OUTPUT_TOKENS) || 4096,
    chatThinkingLevel: (process.env.GEMINI_THINKING_LEVEL || '').trim().toLowerCase(),
    retryDelayMs: Number.isFinite(retryDelay) && retryDelay >= 0 ? retryDelay : 1500,
  };
};

// Gemini 3.x models take thinkingLevel ('low' | 'high'); older models reject it with a 400,
// so it is only sent to 3.x models. Lower thinking = faster answers.
const thinkingConfigFor = (model, level) =>
  level && /^gemini-3/.test(model) ? { thinkingConfig: { thinkingLevel: level } } : {};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const OVERLOADED = new Set([500, 503]);

const modelsToTry = ({ model, fallbackModel }) =>
  fallbackModel && fallbackModel !== model ? [model, fallbackModel] : [model];

// Google answers 500/503 ("high demand") during load spikes; one retry usually succeeds.
// If the model is still overloaded, or out of quota (429), the fallback model is tried.
// Only used before anything has been streamed to the student.
// `request(model)` returns the [url, init] pair for that model.
const fetchWithFallback = async (models, request, retryDelayMs) => {
  let res;
  for (const [i, model] of models.entries()) {
    const [url, init] = request(model);
    res = await fetch(url, init);
    if (OVERLOADED.has(res.status) && !init.signal?.aborted) {
      res.body?.cancel().catch(() => {});
      console.warn(`[gemini] ${model} answered ${res.status}, retrying once`);
      await sleep(retryDelayMs);
      res = await fetch(url, init);
    }
    const next = models[i + 1];
    if (!next || init.signal?.aborted || !(res.status === 429 || OVERLOADED.has(res.status))) return res;
    res.body?.cancel().catch(() => {});
    console.warn(`[gemini] ${model} answered ${res.status}, falling back to ${next}`);
  }
  return res;
};

export const isGeminiConfigured = () => Boolean(config().key);
export const getGeminiModel = () => config().model;

// Users are school students (Class 1-12), so every category blocks at the strictest level.
const SAFETY_SETTINGS = [
  'HARM_CATEGORY_HARASSMENT',
  'HARM_CATEGORY_HATE_SPEECH',
  'HARM_CATEGORY_SEXUALLY_EXPLICIT',
  'HARM_CATEGORY_DANGEROUS_CONTENT',
].map((category) => ({ category, threshold: 'BLOCK_LOW_AND_ABOVE' }));

const BLOCKED_FINISH_REASONS = new Set(['SAFETY', 'PROHIBITED_CONTENT', 'BLOCKLIST', 'SPII', 'RECITATION']);

// Pulls the visible text, finish reason and block reason out of one streamed chunk.
// Thought parts (thinking models) are never shown to students.
export const parseChunk = (json) => {
  const candidate = Array.isArray(json?.candidates) ? json.candidates[0] : undefined;
  const parts = Array.isArray(candidate?.content?.parts) ? candidate.content.parts : [];
  const text = parts
    .filter((p) => p && typeof p.text === 'string' && !p.thought)
    .map((p) => p.text)
    .join('');
  const finishReason = candidate?.finishReason || null;
  const blockReason = json?.promptFeedback?.blockReason || null;
  return {
    text,
    finishReason,
    blocked: Boolean(blockReason) || BLOCKED_FINISH_REASONS.has(finishReason),
  };
};

// Splits an SSE byte stream into parsed `data:` JSON payloads.
async function* readSse(body) {
  const decoder = new TextDecoder();
  let buffer = '';
  for await (const bytes of body) {
    buffer += decoder.decode(bytes, { stream: true }).replace(/\r\n/g, '\n');
    let sep;
    while ((sep = buffer.indexOf('\n\n')) !== -1) {
      const event = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);
      const data = event
        .split('\n')
        .filter((line) => line.startsWith('data:'))
        .map((line) => line.slice(5).trimStart())
        .join('\n');
      if (!data) continue;
      try {
        yield JSON.parse(data);
      } catch {
        throw new GeminiError('BAD_RESPONSE');
      }
    }
  }
}

/**
 * One-shot structured generation (used for practice quizzes). Gemini is asked to reply
 * with JSON matching `responseSchema`; the parsed object is returned. The caller still
 * validates it, since the schema constrains shape but not content.
 *
 * @param {{ systemInstruction: string, prompt: string, responseSchema: object }} params
 */
export const generateJson = async ({ systemInstruction, prompt, responseSchema }) => {
  const cfg = config();
  const { base, key, quizTimeoutMs, retryDelayMs } = cfg;
  if (!key) throw new GeminiError('NOT_CONFIGURED');

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), quizTimeoutMs);
  let res;
  try {
    res = await fetchWithFallback(modelsToTry(cfg), (model) => [`${base}/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        safetySettings: SAFETY_SETTINGS,
        // Quiz JSON is long; low thinking keeps a 10-question quiz well under the timeout
        // (measured on gemini-3.8-flash: ~51 s for 5 questions at the default level,
        // 17-35 s for 10 at 'low').
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
          responseSchema,
          ...thinkingConfigFor(model, 'low'),
        },
      }),
      signal: ctrl.signal,
      redirect: 'error',
    }], retryDelayMs);
  } catch (err) {
    throw new GeminiError(err?.name === 'AbortError' ? 'TIMEOUT' : 'UPSTREAM');
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 400) throw new GeminiError('BAD_REQUEST', 400);
  if (res.status === 401 || res.status === 403) throw new GeminiError('UPSTREAM_AUTH', res.status);
  if (res.status === 429) throw new GeminiError('QUOTA', 429, res.headers.get('retry-after'));
  if (!res.ok) throw new GeminiError('UPSTREAM', res.status);

  let chunk;
  try {
    chunk = parseChunk(await res.json());
  } catch {
    throw new GeminiError('BAD_RESPONSE', res.status);
  }
  if (chunk.blocked) throw new GeminiError('BLOCKED');
  try {
    return JSON.parse(chunk.text);
  } catch {
    throw new GeminiError('BAD_RESPONSE', res.status);
  }
};

/**
 * Opens a streaming generation. Resolves once Gemini has accepted the request, so
 * auth / quota / validation failures surface here as a GeminiError before the caller
 * has started its own response. Returns an async iterator of { text, finishReason, blocked }.
 *
 * @param {{ systemInstruction: string, contents: object[], signal?: AbortSignal }} params
 */
export const openChatStream = async ({ systemInstruction, contents, signal }) => {
  const cfg = config();
  const { base, key, timeoutMs, firstByteTimeoutMs, maxOutputTokens, chatThinkingLevel, retryDelayMs } = cfg;
  if (!key) throw new GeminiError('NOT_CONFIGURED');

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(new GeminiError('TIMEOUT')), timeoutMs);
  const firstByteTimer = setTimeout(() => ctrl.abort(new GeminiError('TIMEOUT')), Math.min(firstByteTimeoutMs, timeoutMs));
  const combined = signal ? AbortSignal.any([ctrl.signal, signal]) : ctrl.signal;
  const abortKind = () => (ctrl.signal.aborted ? 'TIMEOUT' : 'ABORTED');

  let res;
  try {
    res = await fetchWithFallback(modelsToTry(cfg), (model) => [`${base}/v1beta/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
        safetySettings: SAFETY_SETTINGS,
        generationConfig: { temperature: 0.4, maxOutputTokens, ...thinkingConfigFor(model, chatThinkingLevel) },
      }),
      signal: combined,
      redirect: 'error',
    }], retryDelayMs);
  } catch (err) {
    clearTimeout(timer);
    throw new GeminiError(err?.name === 'AbortError' || combined.aborted ? abortKind() : 'UPSTREAM');
  } finally {
    clearTimeout(firstByteTimer);
  }

  if (!res.ok) {
    clearTimeout(timer);
    res.body?.cancel().catch(() => {});
    if (res.status === 400) throw new GeminiError('BAD_REQUEST', 400);
    if (res.status === 401 || res.status === 403) throw new GeminiError('UPSTREAM_AUTH', res.status);
    if (res.status === 429) throw new GeminiError('QUOTA', 429, res.headers.get('retry-after'));
    throw new GeminiError('UPSTREAM', res.status);
  }
  if (!res.body) {
    clearTimeout(timer);
    throw new GeminiError('BAD_RESPONSE', res.status);
  }

  return (async function* chunks() {
    try {
      for await (const json of readSse(res.body)) yield parseChunk(json);
    } catch (err) {
      if (err instanceof GeminiError) throw err;
      throw new GeminiError(combined.aborted ? abortKind() : 'UPSTREAM');
    } finally {
      clearTimeout(timer);
    }
  })();
};
