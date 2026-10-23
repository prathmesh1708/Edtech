// Prepares photos and voice recordings for the AI tutor: shrinks photos in the browser
// so uploads stay small on mobile data, and converts files to base64 for the API.

const MAX_IMAGE_DIMENSION = 1600;
const JPEG_QUALITY = 0.85;
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const MAX_AUDIO_BYTES = 6 * 1024 * 1024;
const RAW_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];

export const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1] || '');
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });

const loadImage = (url) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });

/**
 * @param {File} file
 * @returns {Promise<{ mimeType: string, data: string, previewUrl: string }>}
 */
export const prepareImage = async (file) => {
  if (!file.type.startsWith('image/')) throw new Error('Please choose a photo.');
  const previewUrl = URL.createObjectURL(file);
  try {
    const img = await loadImage(previewUrl);
    const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff'; // transparent PNGs become white, not black, as JPEG
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
    if (!blob) throw new Error('compress failed');
    return { mimeType: 'image/jpeg', data: await blobToBase64(blob), previewUrl };
  } catch {
    // The browser can't decode it (e.g. HEIC outside Safari): send the original if allowed.
    if (!RAW_IMAGE_TYPES.includes(file.type) || file.size > MAX_IMAGE_BYTES) {
      URL.revokeObjectURL(previewUrl);
      throw new Error('This photo could not be read. Please try a JPG or PNG.');
    }
    return { mimeType: file.type, data: await blobToBase64(file), previewUrl };
  }
};

/**
 * @param {Blob} blob audio recorded with MediaRecorder
 * @returns {Promise<{ mimeType: string, data: string }>}
 */
export const prepareAudio = async (blob) => {
  if (blob.size > MAX_AUDIO_BYTES) throw new Error('That recording is too long. Please keep it under a minute.');
  return { mimeType: (blob.type || 'audio/webm').split(';')[0], data: await blobToBase64(blob) };
};
