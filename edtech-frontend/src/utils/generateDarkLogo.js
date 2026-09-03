import fs from 'fs';
import zlib from 'zlib';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, '../../public');
const logoPath = path.join(publicDir, 'assets/images/logo.png');
const outDarkPath = path.join(publicDir, 'assets/images/logo-dark.png');

// CRC32 Table
const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let crc = 0 ^ (-1);
  for (let i = 0; i < buf.length; i++) {
    crc = (crc >>> 8) ^ crcTable[(crc ^ buf[i]) & 0xFF];
  }
  return (crc ^ (-1)) >>> 0;
}

function makeChunk(type, data) {
  const len = data.length;
  const chunk = Buffer.alloc(12 + len);
  chunk.writeUInt32BE(len, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const typeAndData = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = crc32(typeAndData);
  chunk.writeUInt32BE(crc, 8 + len);
  return chunk;
}

function encodePNG(width, height, rgbaBuffer) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8;
  ihdrData[9] = 6;
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  const stride = width * 4;
  const rawData = Buffer.alloc(height * (stride + 1));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter type 0
    rgbaBuffer.copy(rawData, offset, y * stride, (y + 1) * stride);
    offset += stride;
  }

  const compressed = zlib.deflateSync(rawData, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function unfilterPNG(buf) {
  let pos = 8;
  let width, height;
  let idatChunks = [];
  while (pos < buf.length) {
    const length = buf.readUInt32BE(pos);
    const type = buf.toString('ascii', pos + 4, pos + 8);
    const data = buf.slice(pos + 8, pos + 8 + length);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
    } else if (type === 'IDAT') {
      idatChunks.push(data);
    }
    pos += 12 + length;
  }
  const raw = zlib.inflateSync(Buffer.concat(idatChunks));
  const bpp = 4;
  const stride = width * bpp;
  const pixels = Buffer.alloc(width * height * bpp);
  let rawOffset = 0;
  let prevRow = Buffer.alloc(stride);
  for (let y = 0; y < height; y++) {
    const filterType = raw[rawOffset++];
    const curRow = Buffer.alloc(stride);
    for (let x = 0; x < stride; x++) {
      const val = raw[rawOffset++];
      const a = x >= bpp ? curRow[x - bpp] : 0;
      const b = prevRow[x];
      const c = x >= bpp ? prevRow[x - bpp] : 0;
      let orig = 0;
      if (filterType === 0) orig = val;
      else if (filterType === 1) orig = (val + a) & 0xff;
      else if (filterType === 2) orig = (val + b) & 0xff;
      else if (filterType === 3) orig = (val + Math.floor((a + b) / 2)) & 0xff;
      else if (filterType === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        let pr = (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
        orig = (val + pr) & 0xff;
      }
      curRow[x] = orig;
    }
    curRow.copy(pixels, y * stride);
    prevRow = curRow;
  }
  return { width, height, pixels };
}

const origBuf = fs.readFileSync(logoPath);
const { width, height, pixels } = unfilterPNG(origBuf);

const darkPixels = Buffer.alloc(pixels.length);

for (let i = 0; i < pixels.length; i += 4) {
  const r = pixels[i];
  const g = pixels[i + 1];
  const b = pixels[i + 2];
  const a = pixels[i + 3];

  if (a === 0) {
    darkPixels[i] = 0;
    darkPixels[i + 1] = 0;
    darkPixels[i + 2] = 0;
    darkPixels[i + 3] = 0;
    continue;
  }

  const y = Math.floor((i / 4) / width);
  const isBannerText = y > 480 && r > 180 && g > 180 && b > 180;

  if (isBannerText) {
    // Letters WWW.STUDYWISELY.IN inside the bottom banner bar
    darkPixels[i] = 10;     // #0A
    darkPixels[i + 1] = 25; // #19
    darkPixels[i + 2] = 47; // #2F
    darkPixels[i + 3] = a;
  } else if (r > 30 && g > 90 && b > 130 && (r + g < b * 1.6)) {
    // "Study" letters & light blue highlights -> Vibrant Sky Blue #38BDF8
    const brightness = (b / 185);
    darkPixels[i] = Math.min(255, Math.round(56 * brightness));
    darkPixels[i + 1] = Math.min(255, Math.round(189 * brightness));
    darkPixels[i + 2] = Math.min(255, Math.round(248 * brightness));
    darkPixels[i + 3] = a;
  } else {
    // Graduation Cap, Tassel, "Wisely", and Banner background -> Crisp Off-White #F8FAFC
    const alphaFactor = a / 255;
    darkPixels[i] = Math.round(248 * alphaFactor);
    darkPixels[i + 1] = Math.round(250 * alphaFactor);
    darkPixels[i + 2] = Math.round(252 * alphaFactor);
    darkPixels[i + 3] = a;
  }
}

const outBuf = encodePNG(width, height, darkPixels);
fs.writeFileSync(outDarkPath, outBuf);
console.log('Successfully created high-res logo-dark.png (' + outBuf.length + ' bytes, ' + width + 'x' + height + ')');
