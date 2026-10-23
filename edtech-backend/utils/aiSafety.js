// Flags student messages that may need a safeguarding check by staff.
// Deliberately narrow phrases (first person, explicit intent) so ordinary study questions
// such as "what is drug abuse?" are not flagged. This is a triage aid for human review,
// not a classifier: every flag is checked by an admin in AI Safety Review.

const PATTERNS = {
  self_harm: [
    /\b(suicidal|commit(ting)? suicide|suicide note|attempt(ed)? suicide|thinking (of|about) suicide)\b/i,
    /\b(kill(ing)? my ?self|end(ing)? my (own )?life|take my (own )?life|want(ed)? to die|wanna die|don'?t want to (live|be alive)|no reason to live|better off dead)\b/i,
    /\b(self[- ]?harm(ing)?|cut(ting)? my ?self|hurt(ing)? my ?self)\b/i,
    /\b(khud ?kushi|aatm ?hatya|atmhatya|mar ?jana chaht[aie]|marna chaht[aie]|jeena nahi chaht[aie])\b/i,
    /(आत्महत्या|खुदकुशी|ख़ुदकुशी|मरना चाहत|मर जाना चाहत|जीना नहीं चाहत)/,
  ],
  abuse: [
    /\b(abus(es|ed|ing) me|being abused|abused by|molest(s|ed|ing)?( me)?|sexually harass(ed|ing)? me)\b/i,
    /\b(touch(es|ed)? me (in a )?(bad|wrong|private|inappropriate)\w*|touches my private)\b/i,
    /\b((beats?|beating|hits?|hitting) me (every|daily|always|a lot)|threaten(s|ed|ing)? (to )?(hurt|kill) me)\b/i,
    /\b(mujhe (maart|peet)|galat tarike se chhu)\w*/i,
    /(मुझे मारत|मुझे पीटत|गलत तरीके से छू|मेरा शोषण)/,
  ],
};

/**
 * @param {string} text
 * @returns {'self_harm'|'abuse'|null}
 */
export const detectSafetyConcern = (text) => {
  if (typeof text !== 'string' || !text.trim()) return null;
  for (const [reason, patterns] of Object.entries(PATTERNS)) {
    if (patterns.some((re) => re.test(text))) return reason;
  }
  return null;
};

export const URGENT_REASONS = ['self_harm', 'abuse'];
