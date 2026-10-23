import { useState, useRef, useCallback, useEffect } from 'react';

const MAX_RECORDING_MS = 60 * 1000;

const supported =
  typeof window !== 'undefined' && typeof window.MediaRecorder !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);

/**
 * Records a short voice clip (fallback for browsers without speech recognition, e.g. Firefox).
 * The clip is sent to the AI tutor, which transcribes and answers it.
 * onComplete(blob) is called when recording stops; recordings auto-stop after 60 seconds.
 */
const useAudioRecorder = ({ onComplete } = {}) => {
  const [recording, setRecording] = useState(false);
  const [error, setError] = useState(null);
  const recorderRef = useRef(null);
  const timerRef = useRef(null);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const stop = useCallback(() => {
    clearTimeout(timerRef.current);
    if (recorderRef.current?.state === 'recording') recorderRef.current.stop();
  }, []);

  const start = useCallback(async () => {
    if (!supported || recorderRef.current?.state === 'recording') return;
    setError(null);
    let stream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      setError('Microphone access is blocked. Allow it in your browser settings to ask by voice.');
      return;
    }

    const recorder = new MediaRecorder(stream);
    const chunks = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size) chunks.push(e.data);
    };
    recorder.onstop = () => {
      stream.getTracks().forEach((t) => t.stop());
      setRecording(false);
      recorderRef.current = null;
      if (chunks.length) onCompleteRef.current?.(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }));
    };

    recorderRef.current = recorder;
    recorder.start();
    setRecording(true);
    timerRef.current = setTimeout(stop, MAX_RECORDING_MS);
  }, [stop]);

  useEffect(
    () => () => {
      clearTimeout(timerRef.current);
      const recorder = recorderRef.current;
      if (recorder?.state === 'recording') {
        recorder.onstop = () => recorder.stream.getTracks().forEach((t) => t.stop());
        recorder.stop();
      }
    },
    []
  );

  return { supported, recording, error, start, stop };
};

export default useAudioRecorder;
