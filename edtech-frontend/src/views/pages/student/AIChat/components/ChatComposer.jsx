import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Square, Mic, MicOff, ImagePlus, Camera, X, Loader2 } from 'lucide-react';
import useSpeechRecognition from '../../../../../hooks/useSpeechRecognition';
import useAudioRecorder from '../../../../../hooks/useAudioRecorder';
import { prepareImage, prepareAudio } from '../../../../../utils/aiAttachments';
import styles from '../AIChat.module.css';

const VOICE_LANGS = [
  { code: 'en-IN', label: 'EN', name: 'English' },
  { code: 'hi-IN', label: 'हिं', name: 'Hindi' },
];

const isTouchDevice = () => typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;

/**
 * Text / voice / photo input for the AI chat.
 * onSend({ text, attachment, inputMode }) — attachment is { mimeType, data, previewUrl? }.
 */
const ChatComposer = ({ disabled, streaming, onSend, onStop, prefill, placeholder }) => {
  const [text, setText] = useState('');
  const [image, setImage] = useState(null);
  const [preparing, setPreparing] = useState(false);
  const [localError, setLocalError] = useState(null);
  const [langIndex, setLangIndex] = useState(0);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const textRef = useRef('');
  const fromVoiceRef = useRef(false);
  const wasListeningRef = useRef(false);
  const touch = isTouchDevice();

  const updateText = useCallback((value) => {
    textRef.current = value;
    setText(value);
  }, []);

  useEffect(() => {
    if (prefill?.text) {
      updateText(prefill.text);
      textareaRef.current?.focus();
    }
  }, [prefill, updateText]);

  // Grow the textarea with its content, up to a limit.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  }, [text]);

  const submit = useCallback(
    (inputMode) => {
      const value = textRef.current.trim();
      if (disabled || streaming || preparing || (!value && !image)) return;
      onSend({ text: value, attachment: image, inputMode: inputMode || (image ? 'image' : 'text') });
      updateText('');
      setImage(null);
      fromVoiceRef.current = false;
    },
    [disabled, streaming, preparing, image, onSend, updateText]
  );

  const recognition = useSpeechRecognition({
    lang: VOICE_LANGS[langIndex].code,
    onResult: (transcript) => {
      fromVoiceRef.current = true;
      updateText(transcript);
    },
  });

  // Hands-free: when the student stops speaking, send what was heard.
  useEffect(() => {
    if (wasListeningRef.current && !recognition.listening && fromVoiceRef.current && textRef.current.trim()) {
      submit('voice');
    }
    wasListeningRef.current = recognition.listening;
  }, [recognition.listening, submit]);

  const recorder = useAudioRecorder({
    onComplete: async (blob) => {
      try {
        const audio = await prepareAudio(blob);
        onSend({ text: '', attachment: audio, inputMode: 'voice' });
      } catch (err) {
        setLocalError(err.message);
      }
    },
  });

  const voiceMode = recognition.supported ? 'dictation' : recorder.supported ? 'recording' : null;
  const voiceActive = recognition.listening || recorder.recording;
  const voiceError = recognition.error || recorder.error;

  const toggleVoice = () => {
    setLocalError(null);
    if (voiceMode === 'dictation') {
      if (recognition.listening) recognition.stop();
      else recognition.start();
    } else if (voiceMode === 'recording') {
      if (recorder.recording) recorder.stop();
      else recorder.start();
    }
  };

  const handleFile = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setLocalError(null);
    setPreparing(true);
    try {
      if (image?.previewUrl) URL.revokeObjectURL(image.previewUrl);
      setImage(await prepareImage(file));
      textareaRef.current?.focus();
    } catch (err) {
      setLocalError(err.message);
    } finally {
      setPreparing(false);
    }
  };

  const removeImage = () => {
    if (image?.previewUrl) URL.revokeObjectURL(image.previewUrl);
    setImage(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !touch && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  const busy = disabled || streaming;
  const canSend = !busy && !preparing && (text.trim() || image);

  return (
    <div className={styles.composer}>
      {(image || preparing) && (
        <div className={styles.imagePreview}>
          {preparing ? (
            <span className={styles.preparing}><Loader2 size={16} className={styles.spin} /> Preparing photo...</span>
          ) : (
            <>
              <img src={image.previewUrl} alt="Selected question" />
              <button type="button" onClick={removeImage} className={styles.removeImage} aria-label="Remove photo">
                <X size={14} />
              </button>
            </>
          )}
        </div>
      )}

      {(localError || voiceError) && <p className={styles.composerError}>{localError || voiceError}</p>}
      {recorder.recording && <p className={styles.recordingNote}><span className={styles.recDot} /> Recording... tap the mic again to send</p>}
      {recognition.listening && <p className={styles.recordingNote}><span className={styles.recDot} /> Listening ({VOICE_LANGS[langIndex].name})...</p>}

      <form
        className={styles.composerRow}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <div className={styles.toolButtons}>
          <button type="button" className={styles.toolButton} onClick={() => fileInputRef.current?.click()} disabled={busy || preparing} aria-label="Add a photo of your question" title="Add photo">
            <ImagePlus size={20} />
          </button>
          {touch && (
            <button type="button" className={styles.toolButton} onClick={() => cameraInputRef.current?.click()} disabled={busy || preparing} aria-label="Take a photo of your question" title="Camera">
              <Camera size={20} />
            </button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={handleFile} />
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" hidden onChange={handleFile} />
        </div>

        <textarea
          ref={textareaRef}
          className={styles.textarea}
          rows={1}
          value={text}
          maxLength={4000}
          onChange={(e) => {
            fromVoiceRef.current = false;
            updateText(e.target.value);
          }}
          onKeyDown={handleKeyDown}
          placeholder={image ? 'Add a note (optional) — e.g. "Solve Q3"' : placeholder}
          disabled={disabled}
          aria-label="Your question"
        />

        <div className={styles.toolButtons}>
          {voiceMode === 'dictation' && (
            <button
              type="button"
              className={styles.langButton}
              onClick={() => setLangIndex((i) => (i + 1) % VOICE_LANGS.length)}
              disabled={voiceActive}
              aria-label={`Voice language: ${VOICE_LANGS[langIndex].name}. Tap to switch.`}
              title="Voice language"
            >
              {VOICE_LANGS[langIndex].label}
            </button>
          )}
          {voiceMode && (
            <button
              type="button"
              className={`${styles.toolButton} ${voiceActive ? styles.micActive : ''}`}
              onClick={toggleVoice}
              disabled={busy || (voiceMode === 'recording' && Boolean(image))}
              aria-label={voiceActive ? 'Stop voice input' : 'Ask by voice'}
              title={voiceActive ? 'Stop' : 'Ask by voice'}
            >
              {voiceActive ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
          )}
          {streaming ? (
            <button type="button" className={`${styles.sendButton} ${styles.stopButton}`} onClick={onStop} aria-label="Stop answer" title="Stop">
              <Square size={18} />
            </button>
          ) : (
            <button type="submit" className={styles.sendButton} disabled={!canSend} aria-label="Send question" title="Send">
              <Send size={18} />
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default ChatComposer;
