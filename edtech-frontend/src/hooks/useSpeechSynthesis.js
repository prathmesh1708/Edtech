import { useState, useCallback, useEffect } from 'react';

const synth = typeof window !== 'undefined' ? window.speechSynthesis : null;
const MAX_CHUNK = 200; // Chrome cuts off long utterances, so speak sentence-sized pieces

// Turns Markdown into plain text that reads naturally aloud.
export const toSpeakableText = (markdown) =>
  markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/^[ \t]*\|?[ \t]*:?-{3,}.*$/gm, '')
    .replace(/\|/g, ', ')
    .replace(/^[ \t]*(#{1,6}|>|[-*+]|\d+[.)])[ \t]+/gm, '')
    .replace(/[*_~]+/g, '')
    .replace(/\n{2,}/g, '. ')
    .replace(/\s+/g, ' ')
    .trim();

const splitIntoChunks = (text) => {
  const sentences = text.match(/[^.!?।]+[.!?।]*\s*/g) || [text];
  const chunks = [];
  let current = '';
  for (const sentence of sentences) {
    if ((current + sentence).length > MAX_CHUNK && current) {
      chunks.push(current.trim());
      current = '';
    }
    current += sentence;
  }
  if (current.trim()) chunks.push(current.trim());
  return chunks;
};

/** Reads AI answers aloud with the browser's built-in voices (Indian English or Hindi). */
const useSpeechSynthesis = () => {
  const [speakingId, setSpeakingId] = useState(null);

  const stop = useCallback(() => {
    synth?.cancel();
    setSpeakingId(null);
  }, []);

  const speak = useCallback((id, markdown) => {
    if (!synth) return;
    synth.cancel();
    const text = toSpeakableText(markdown);
    if (!text) return;

    const lang = /[ऀ-ॿ]/.test(text) ? 'hi-IN' : 'en-IN';
    const voice = synth.getVoices().find((v) => v.lang === lang) || synth.getVoices().find((v) => v.lang.startsWith(lang.slice(0, 2)));
    const chunks = splitIntoChunks(text);

    chunks.forEach((chunk, i) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utterance.lang = lang;
      if (voice) utterance.voice = voice;
      utterance.rate = 0.95;
      if (i === chunks.length - 1) {
        utterance.onend = () => setSpeakingId((current) => (current === id ? null : current));
      }
      utterance.onerror = () => setSpeakingId((current) => (current === id ? null : current));
      synth.speak(utterance);
    });
    setSpeakingId(id);
  }, []);

  useEffect(() => () => synth?.cancel(), []);

  return { supported: Boolean(synth), speakingId, speak, stop };
};

export default useSpeechSynthesis;
