import { useState, useRef, useCallback, useEffect } from 'react';

const Recognition = typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null;

const ERROR_MESSAGES = {
  'not-allowed': 'Microphone access is blocked. Allow it in your browser settings to ask by voice.',
  'service-not-allowed': 'Microphone access is blocked. Allow it in your browser settings to ask by voice.',
  'no-speech': "I didn't hear anything. Tap the mic and try again.",
  'audio-capture': 'No microphone was found on this device.',
  network: 'Voice typing needs an internet connection.',
};

/**
 * Browser speech-to-text (Web Speech API). Free, runs in Chrome, Edge and Safari.
 * Stops by itself after a pause. onResult(text) receives the running transcript.
 */
const useSpeechRecognition = ({ lang = 'en-IN', onResult } = {}) => {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);
  const onResultRef = useRef(onResult);

  useEffect(() => {
    onResultRef.current = onResult;
  }, [onResult]);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  const start = useCallback(() => {
    if (!Recognition) return;
    recognitionRef.current?.abort();
    setError(null);

    const recognition = new Recognition();
    recognition.lang = lang;
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map((result) => result[0]?.transcript || '')
        .join('');
      onResultRef.current?.(transcript.trim());
    };
    recognition.onerror = (event) => {
      if (event.error !== 'aborted') setError(ERROR_MESSAGES[event.error] || 'Voice input stopped. Please try again.');
    };
    recognition.onend = () => {
      setListening(false);
      if (recognitionRef.current === recognition) recognitionRef.current = null;
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
      setListening(true);
    } catch {
      setError('Voice input could not start. Please try again.');
    }
  }, [lang]);

  useEffect(() => () => recognitionRef.current?.abort(), []);

  return { supported: Boolean(Recognition), listening, error, start, stop };
};

export default useSpeechRecognition;
