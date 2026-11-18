/**
 * XiaoZhi Theme Studio — Client-side Theme Builder & WebSerial Flasher
 * Compatible with GitHub Pages (100% static ES Module, zero backend)
 */

const STANDARD_EMOTIONS = [
  "neutral", "happy", "laughing", "funny", "sad", "angry", "crying",
  "loving", "embarrassed", "surprised", "shocked", "thinking", "winking",
  "cool", "relaxed", "delicious", "kissy", "confident", "sleepy", "silly", "confused"
];

const KEYWORD_MAP = {
  // Tiếng Việt
  "binhthuong": ["neutral"],
  "macdinh": ["neutral"],
  "vuive": ["happy", "relaxed"],
  "cuoito": ["laughing", "funny"],
  "vuimung": ["happy", "laughing"],
  "buon": ["sad"],
  "buon2": ["sad", "crying"],
  "tucgian": ["angry"],
  "buonngu": ["sleepy"],
  "nhaymat": ["winking"],
  "nheomat": ["silly", "winking"],
  "chamhoi": ["confused"],
  "suynghi": ["thinking"],
  "ngacnhien": ["surprised"],
  "doxet": ["shocked"],
  "hoamat": ["shocked"],
  "camlang": ["embarrassed"],
  "domohoi": ["embarrassed"],
  "duamat": ["cool", "confident"],
  "khongchiudau": ["angry"],
  // Tiếng Trung
  "开心": ["happy", "laughing", "funny", "relaxed"],
  "心动喜欢": ["loving", "kissy"],
  "思考": ["thinking", "confused"],
  "挑逗使坏": ["winking", "silly", "cool", "confident"],
  "晕": ["surprised", "shocked", "embarrassed"],
  "生气": ["angry", "sad", "crying"],
  "眨眼": ["neutral", "delicious"],
  "睡觉": ["sleepy"]
};

// State
const state = {
  width: 320,
  height: 240,
  fitMode: "cover",
  noBg: true,
  hideSubtitle: true,
  includeSrmodels: true,
  wakeWordId: "wn9_hitelly_tts",
  omitFont: false,
  emoDragMode: "copy", // "copy" | "swap"
  previewSkin: "light", // "light" | "dark"
  activeEmotion: "neutral",
  skin: {
    light: { text_color: "#FFFFFF", background_color: "#000000" },
    dark: { text_color: "#FFFFFF", background_color: "#000000" }
  },
  bgLightFile: null, // { name, file/blob, url }
  bgDarkFile: null,
  srmodelsBytes: null,
  fontBytes: null,
  fontName: "font_noto_sans_common_20_4.bin",
  fontMeta: { charset: "common", size: 20, bpp: 4, bundle: "noto-v1" },
  emojis: {}, // { [emotion]: { filename, rawBytes, bytes: Uint8Array, url, width, height, offsetX, offsetY } }
  defaultEmojis: {}, // snapshot của preset hiện tại để Reset mặc định
  donorPresetId: "",
  donorEmojis: {} // { [emotion]: { filename, rawBytes, bytes, url, width, height, presetId } }
};

// DOM elements
const els = {
  resolutionSelect: document.getElementById("resolutionSelect"),
  fitModeSelect: document.getElementById("fitModeSelect"),
  noBgCheck: document.getElementById("noBgCheck"),
  hideSubtitleCheck: document.getElementById("hideSubtitleCheck"),
  includeSrmodelsCheck: document.getElementById("includeSrmodelsCheck"),
  wakeWordBox: document.getElementById("wakeWordBox"),
  wakeWordSelect: document.getElementById("wakeWordSelect"),
  customSrmodelInput: document.getElementById("customSrmodelInput"),
  omitFontCheck: document.getElementById("omitFontCheck"),
  lightTextColor: document.getElementById("lightTextColor"),
  lightTextHex: document.getElementById("lightTextHex"),
  lightBgColor: document.getElementById("lightBgColor"),
  lightBgHex: document.getElementById("lightBgHex"),
  darkTextColor: document.getElementById("darkTextColor"),
  darkTextHex: document.getElementById("darkTextHex"),
  darkBgColor: document.getElementById("darkBgColor"),
  darkBgHex: document.getElementById("darkBgHex"),
  bgUploadSection: document.getElementById("bgUploadSection"),
  bgLightDrop: document.getElementById("bgLightDrop"),
  bgLightInput: document.getElementById("bgLightInput"),
  bgLightName: document.getElementById("bgLightName"),
  bgDarkDrop: document.getElementById("bgDarkDrop"),
  bgDarkInput: document.getElementById("bgDarkInput"),
  bgDarkName: document.getElementById("bgDarkName"),
  emotionGrid: document.getElementById("emotionGrid"),
  toggleDonorBtn: document.getElementById("toggleDonorBtn"),
  donorDrawer: document.getElementById("donorDrawer"),
  donorPresetSelect: document.getElementById("donorPresetSelect"),
  donorCopyMatchBtn: document.getElementById("donorCopyMatchBtn"),
  closeDonorBtn: document.getElementById("closeDonorBtn"),
  donorTargetEmoLabel: document.getElementById("donorTargetEmoLabel"),
  donorEmotionGrid: document.getElementById("donorEmotionGrid"),
  emoDragModeBtn: document.getElementById("emoDragModeBtn"),
  resetAllEmoBtn: document.getElementById("resetAllEmoBtn"),
  bulkEmojiInput: document.getElementById("bulkEmojiInput"),
  bulkDropZone: document.getElementById("bulkDropZone"),
  importBinInput: document.getElementById("importBinInput"),
  presetSelect: document.getElementById("presetSelect"),
  loadPresetBtn: document.getElementById("loadPresetBtn"),
  resBadge: document.getElementById("resBadge"),
  toggleSkinBtn: document.getElementById("toggleSkinBtn"),
  virtualScreen: document.getElementById("virtualScreen"),
  virtualBgImg: document.getElementById("virtualBgImg"),
  virtualTopBar: document.getElementById("virtualTopBar"),
  vWifi: document.getElementById("vWifi"),
  vStatusText: document.getElementById("vStatusText"),
  vBattery: document.getElementById("vBattery"),
  virtualEmojiImg: document.getElementById("virtualEmojiImg"),
  virtualEmojiPlaceholder: document.getElementById("virtualEmojiPlaceholder"),
  virtualBottomBar: document.getElementById("virtualBottomBar"),
  activeEmotionLabel: document.getElementById("activeEmotionLabel"),
  packageStats: document.getElementById("packageStats"),
  alignTargetLabel: document.getElementById("alignTargetLabel"),
  shiftStepSelect: document.getElementById("shiftStepSelect"),
  shiftLeftBtn: document.getElementById("shiftLeftBtn"),
  shiftUpBtn: document.getElementById("shiftUpBtn"),
  shiftDownBtn: document.getElementById("shiftDownBtn"),
  shiftRightBtn: document.getElementById("shiftRightBtn"),
  shiftResetBtn: document.getElementById("shiftResetBtn"),
  shiftXRange: document.getElementById("shiftXRange"),
  shiftXVal: document.getElementById("shiftXVal"),
  shiftYRange: document.getElementById("shiftYRange"),
  shiftYVal: document.getElementById("shiftYVal"),
  applyShiftAllBtn: document.getElementById("applyShiftAllBtn"),
  resetShiftAllBtn: document.getElementById("resetShiftAllBtn"),
  exportBinBtn: document.getElementById("exportBinBtn"),
  flashUsbBtn: document.getElementById("flashUsbBtn"),
  flashOffsetInput: document.getElementById("flashOffsetInput"),
  baudRateSelect: document.getElementById("baudRateSelect"),
  progressWrap: document.getElementById("progressWrap"),
  progressFill: document.getElementById("progressFill"),
  progressText: document.getElementById("progressText"),
  terminalLog: document.getElementById("terminalLog")
};

// Logging helper
function log(msg, type = "") {
  const div = document.createElement("div");
  div.className = `log-line ${type}`;
  const time = new Date().toLocaleTimeString("vi-VN", { hour12: false });
  div.textContent = `[${time}] ${msg}`;
  els.terminalLog.appendChild(div);
  els.terminalLog.scrollTop = els.terminalLog.scrollHeight;
}

// ==========================================
// 1. ESP_MMAP_ASSETS BINARY PACKER & UNPACKER
// ==========================================

const MAX_BIN_IMPORT_BYTES = 16 * 1024 * 1024; // 16 MB
const MAX_IMAGE_FILE_BYTES = 5 * 1024 * 1024;  // 5 MB / ảnh
const MAX_SRMODEL_FILE_BYTES = 4 * 1024 * 1024; // 4 MB / model
const MAX_PACKED_ASSETS_BYTES = 8 * 1024 * 1024; // 8 MB tối đa cho phân vùng assets
const MAX_GIF_DIM = 1024;
const MAX_GIF_FRAMES = 120;
const MIN_SAFE_FLASH_OFFSET = 0x100000; // >= 1MB (bảo vệ Bootloader 0x0, Partition 0x8000, App0 0x10000)
const MAX_SAFE_FLASH_OFFSET = 0x1f00000;
const FLASH_SECTOR_ALIGNMENT = 0x1000; // 4KB sector alignment
const SAFE_FILENAME_RE = /^[a-zA-Z0-9_.-]{1,31}$/;
const HEX_COLOR_RE = /^#[0-9a-fA-F]{6}$/;

function sanitizeHexColor(val, fallback = "#000000") {
  const s = String(val || "").trim();
  return HEX_COLOR_RE.test(s) ? s.toUpperCase() : fallback;
}

function validateFlashOffset(offsetStr) {
  const clean = String(offsetStr || "").trim();
  if (!/^0x[0-9a-fA-F]{5,7}$/.test(clean)) {
    throw new Error(`Địa chỉ Offset "${clean}" không hợp lệ (ví dụ chuẩn: 0x800000 hoặc 0x400000).`);
  }
  const addr = parseInt(clean, 16);
  if (!Number.isInteger(addr) || addr < MIN_SAFE_FLASH_OFFSET || addr > MAX_SAFE_FLASH_OFFSET) {
    throw new Error(
      `Địa chỉ Offset ${clean} nằm trong vùng nguy hiểm (< 0x100000 có thể ghi đè hỏng Bootloader/Firmware ESP32). Đã chặn để bảo vệ mạch!`
    );
  }
  if (addr % FLASH_SECTOR_ALIGNMENT !== 0) {
    throw new Error(`Địa chỉ Offset ${clean} phải chia hết cho 4KB (0x1000).`);
  }
  return addr;
}

function unpackMmapAssets(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  const bytes = new Uint8Array(arrayBuffer);
  if (bytes.length < 12) throw new Error("File .bin quá nhỏ hoặc không hợp lệ.");
  if (bytes.length > MAX_BIN_IMPORT_BYTES) {
    throw new Error(`File .bin vượt quá giới hạn an toàn (${Math.round(MAX_BIN_IMPORT_BYTES / 1024 / 1024)} MB).`);
  }

  const numFiles = view.getUint32(0, true);
  const totalLen = view.getUint32(8, true);
  const tableEnd = 12 + numFiles * 44;
  if (numFiles === 0 || numFiles > 500 || tableEnd > bytes.length || 12 + totalLen > bytes.length) {
    throw new Error(`Header esp_mmap_assets không hợp lệ (numFiles=${numFiles}).`);
  }

  const decoder = new TextDecoder("utf-8");
  const files = Object.create(null);
  const dimensions = Object.create(null);

  for (let i = 0; i < numFiles; i++) {
    const entryOff = 12 + i * 44;
    const rawName = bytes.slice(entryOff, entryOff + 32);
    const nullIdx = rawName.indexOf(0);
    const name = decoder.decode(nullIdx >= 0 ? rawName.slice(0, nullIdx) : rawName).trim();
    if (!SAFE_FILENAME_RE.test(name)) {
      continue;
    }

    const size = view.getUint32(entryOff + 32, true);
    const offset = view.getUint32(entryOff + 36, true);
    const w = view.getUint16(entryOff + 40, true);
    const h = view.getUint16(entryOff + 42, true);

    let start = tableEnd + offset;
    if (start < tableEnd || start + 2 > bytes.length) {
      throw new Error(`Offset của file '${name}' nằm ngoài phạm vi gói .bin.`);
    }
    if (bytes[start] === 0x5a && bytes[start + 1] === 0x5a) { // 'ZZ'
      start += 2;
    }
    if (size > MAX_BIN_IMPORT_BYTES || start + size > bytes.length) {
      throw new Error(`Kích thước của file '${name}' vượt quá phạm vi gói .bin.`);
    }
    files[name] = bytes.slice(start, start + size);
    dimensions[name] = [Math.min(w, MAX_GIF_DIM), Math.min(h, MAX_GIF_DIM)];
  }

  return { files, dimensions };
}

function packMmapAssets(filesMap, dimensionsMap = {}) {
  const entries = Object.entries(filesMap);
  const encoder = new TextEncoder();
  const tableLen = entries.length * 44;

  let mergedLen = 0;
  for (const [, content] of entries) {
    mergedLen += 2 + content.length; // 'ZZ' + content
  }

  const payload = new Uint8Array(tableLen + mergedLen);
  const payloadView = new DataView(payload.buffer);

  let dataCursor = 0;
  entries.forEach(([name, content], idx) => {
    const encodedName = encoder.encode(name);
    if (encodedName.length > 32) {
      throw new Error(`Tên file '${name}' vượt quá 32 bytes!`);
    }
    const entryOff = idx * 44;
    payload.set(encodedName, entryOff);

    const [w, h] = dimensionsMap[name] || [0, 0];
    payloadView.setUint32(entryOff + 32, content.length, true);
    payloadView.setUint32(entryOff + 36, dataCursor, true);
    payloadView.setUint16(entryOff + 40, w, true);
    payloadView.setUint16(entryOff + 42, h, true);

    const dataAbs = tableLen + dataCursor;
    payload[dataAbs] = 0x5a; // 'Z'
    payload[dataAbs + 1] = 0x5a; // 'Z'
    payload.set(content, dataAbs + 2);
    dataCursor += 2 + content.length;
  });

  // 16-bit checksum
  let chksum = 0;
  for (let i = 0; i < payload.length; i++) {
    chksum = (chksum + payload[i]) & 0xffff;
  }

  const finalBuf = new Uint8Array(12 + payload.length);
  const headerView = new DataView(finalBuf.buffer);
  headerView.setUint32(0, entries.length, true);
  headerView.setUint32(4, chksum, true);
  headerView.setUint32(8, payload.length, true);
  finalBuf.set(payload, 12);

  return finalBuf;
}

// ==========================================
// 2. IMAGE TO LVGL CBIN (RGB565) CONVERTER
// ==========================================

async function fileToLvglCBin(file, targetW, targetH, fitMode = "cover") {
  const img = new Image();
  const url = URL.createObjectURL(file);
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = url;
  });
  URL.revokeObjectURL(url);

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, targetW, targetH);

  const srcW = img.naturalWidth;
  const srcH = img.naturalHeight;

  if (fitMode === "stretch") {
    ctx.drawImage(img, 0, 0, targetW, targetH);
  } else if (fitMode === "pad") {
    const scale = Math.min(targetW / srcW, targetH / srcH);
    const dw = Math.round(srcW * scale);
    const dh = Math.round(srcH * scale);
    ctx.drawImage(img, (targetW - dw) / 2, (targetH - dh) / 2, dw, dh);
  } else {
    // cover
    const scale = Math.max(targetW / srcW, targetH / srcH);
    const dw = srcW * scale;
    const dh = srcH * scale;
    ctx.drawImage(img, (targetW - dw) / 2, (targetH - dh) / 2, dw, dh);
  }

  const rgba = ctx.getImageData(0, 0, targetW, targetH).data;
  const dataSize = targetW * targetH * 2;
  const out = new Uint8Array(28 + dataSize);
  const view = new DataView(out.buffer);

  // LVGL v9 lv_image_dsc_t header (28 bytes)
  view.setUint8(0, 0x19); // magic
  view.setUint8(1, 0x12); // LV_COLOR_FORMAT_RGB565
  view.setUint16(2, 0, true); // flags
  view.setUint16(4, targetW, true);
  view.setUint16(6, targetH, true);
  view.setUint16(8, targetW * 2, true); // stride
  view.setUint16(10, 0, true);
  view.setUint32(12, dataSize, true);
  view.setUint32(16, 28, true); // data pointer offset
  view.setUint32(20, 0, true);
  view.setUint32(24, 0, true);

  let pIdx = 28;
  for (let i = 0; i < rgba.length; i += 4) {
    const r = rgba[i];
    const g = rgba[i + 1];
    const b = rgba[i + 2];
    const rgb565 = ((r & 0xf8) << 8) | ((g & 0xfc) << 3) | (b >> 3);
    out[pIdx++] = rgb565 & 0xff;
    out[pIdx++] = (rgb565 >> 8) & 0xff;
  }

  return out;
}

// Đọc kích thước thực của GIF / PNG
function getImageDimensions(bytes, mime = "image/gif") {
  return new Promise((resolve) => {
    const blob = new Blob([bytes], { type: mime });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      resolve([img.naturalWidth, img.naturalHeight]);
      URL.revokeObjectURL(url);
    };
    img.onerror = () => {
      resolve([state.width, state.height]);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  });
}

// ==========================================
// 2B. LOSSLESS GIF89a & IMAGE POSITION SHIFTER
// ==========================================

function lzwDecode(minCodeSize, data, pixelCount) {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let dict = [];
  function resetDict() {
    dict = [];
    for (let i = 0; i < clearCode; i++) dict[i] = [i];
    dict[clearCode] = [];
    dict[eoiCode] = null;
    codeSize = minCodeSize + 1;
  }
  resetDict();

  const out = new Uint8Array(pixelCount);
  let outPos = 0;
  let bitPos = 0;
  let prev = null;

  function readCode() {
    let code = 0;
    for (let i = 0; i < codeSize; i++) {
      const byteIdx = bitPos >> 3;
      if (byteIdx >= data.length) return eoiCode;
      const bit = (data[byteIdx] >> (bitPos & 7)) & 1;
      code |= bit << i;
      bitPos++;
    }
    return code;
  }

  while (outPos < pixelCount) {
    const code = readCode();
    if (code === eoiCode) break;
    if (code === clearCode) {
      resetDict();
      prev = null;
      continue;
    }
    let entry;
    if (code < dict.length && dict[code]) {
      entry = dict[code];
    } else if (code === dict.length && prev) {
      entry = prev.concat(prev[0]);
    } else {
      break;
    }
    for (let i = 0; i < entry.length && outPos < pixelCount; i++) {
      out[outPos++] = entry[i];
    }
    if (prev && dict.length < 4096) {
      dict.push(prev.concat(entry[0]));
      if (dict.length === (1 << codeSize) && codeSize < 12) {
        codeSize++;
      }
    }
    prev = entry;
  }
  return out;
}

function lzwEncode(minCodeSize, indexStream) {
  const clearCode = 1 << minCodeSize;
  const eoiCode = clearCode + 1;
  let codeSize = minCodeSize + 1;
  let nextCode = eoiCode + 1;
  const table = new Int32Array(4096 * 256).fill(-1);

  const bytes = [];
  let bitBuf = 0;
  let bitCnt = 0;

  function writeCode(c) {
    bitBuf |= c << bitCnt;
    bitCnt += codeSize;
    while (bitCnt >= 8) {
      bytes.push(bitBuf & 0xff);
      bitBuf >>= 8;
      bitCnt -= 8;
    }
  }

  function resetTable() {
    table.fill(-1);
    codeSize = minCodeSize + 1;
    nextCode = eoiCode + 1;
  }

  writeCode(clearCode);
  if (indexStream.length === 0) {
    writeCode(eoiCode);
    if (bitCnt > 0) bytes.push(bitBuf & 0xff);
    return new Uint8Array(bytes);
  }

  let prefix = indexStream[0];
  for (let i = 1; i < indexStream.length; i++) {
    const k = indexStream[i];
    const idx = (prefix << 8) | k;
    const hit = table[idx];
    if (hit !== -1) {
      prefix = hit;
    } else {
      writeCode(prefix);
      if (nextCode < 4096) {
        table[idx] = nextCode++;
        if (nextCode > (1 << codeSize) && codeSize < 12) {
          codeSize++;
        }
      } else {
        writeCode(clearCode);
        resetTable();
      }
      prefix = k;
    }
  }
  writeCode(prefix);
  writeCode(eoiCode);
  if (bitCnt > 0) bytes.push(bitBuf & 0xff);
  return new Uint8Array(bytes);
}

function shiftGifBytes(u8, dx, dy) {
  dx = Math.round(dx) || 0;
  dy = Math.round(dy) || 0;
  if (dx === 0 && dy === 0) return u8;
  if (!u8 || u8.length < 14 || u8.length > MAX_IMAGE_FILE_BYTES) return u8;
  if (u8[0] !== 0x47 || u8[1] !== 0x49 || u8[2] !== 0x46) return u8;

  const view = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const width = view.getUint16(6, true);
  const height = view.getUint16(8, true);
  if (width < 1 || width > MAX_GIF_DIM || height < 1 || height > MAX_GIF_DIM) return u8;
  const packed = u8[10];
  const bgIndex = u8[11];
  const gctFlag = (packed & 0x80) !== 0;
  const gctSize = gctFlag ? 3 * (1 << ((packed & 7) + 1)) : 0;
  let pos = 13 + gctSize;
  if (pos > u8.length) return u8;
  const headerAndGct = u8.slice(0, pos);

  const canvas = new Uint8Array(width * height);
  let bgFillIdx = bgIndex;
  let firstFrameDecoded = false;
  const frames = [];
  let gce = null;

  function readSubBlocks() {
    const chunks = [];
    let total = 0;
    while (pos < u8.length) {
      const sz = u8[pos++];
      if (sz === 0) break;
      chunks.push(u8.subarray(pos, pos + sz));
      total += sz;
      pos += sz;
    }
    const merged = new Uint8Array(total);
    let off = 0;
    for (const c of chunks) {
      merged.set(c, off);
      off += c.length;
    }
    return merged;
  }

  while (pos < u8.length) {
    const blockId = u8[pos++];
    if (blockId === 0x3b) break;
    if (blockId === 0x21) {
      const label = u8[pos++];
      if (label === 0xf9) {
        const blockSize = u8[pos++];
        const gcePacked = u8[pos];
        const delay = view.getUint16(pos + 1, true);
        const transIdx = u8[pos + 3];
        pos += blockSize + 1;
        gce = {
          disposal: (gcePacked >> 2) & 7,
          transFlag: (gcePacked & 1) !== 0,
          delay: delay || 7,
          transIdx
        };
      } else {
        readSubBlocks();
      }
    } else if (blockId === 0x2c) {
      if (pos + 9 > u8.length || frames.length >= MAX_GIF_FRAMES) break;
      const fLeft = view.getUint16(pos, true);
      const fTop = view.getUint16(pos + 2, true);
      const fW = view.getUint16(pos + 4, true);
      const fH = view.getUint16(pos + 6, true);
      const fPacked = u8[pos + 8];
      pos += 9;
      if (fW < 1 || fW > MAX_GIF_DIM || fH < 1 || fH > MAX_GIF_DIM) break;
      let lct = null;
      if (fPacked & 0x80) {
        const lctLen = 3 * (1 << ((fPacked & 7) + 1));
        if (pos + lctLen > u8.length) break;
        lct = u8.slice(pos, pos + lctLen);
        pos += lctLen;
      }
      const minCodeSize = u8[pos++];
      const lzwData = readSubBlocks();
      if (minCodeSize < 2 || minCodeSize > 8) break;
      const indices = lzwDecode(minCodeSize, lzwData, fW * fH);

      const prevCanvas = canvas.slice();
      const transFlag = gce ? gce.transFlag : false;
      const transIdx = gce ? gce.transIdx : -1;

      for (let y = 0; y < fH; y++) {
        const cy = fTop + y;
        if (cy < 0 || cy >= height) continue;
        for (let x = 0; x < fW; x++) {
          const cx = fLeft + x;
          if (cx < 0 || cx >= width) continue;
          const idx = indices[y * fW + x];
          if (!transFlag || idx !== transIdx) {
            canvas[cy * width + cx] = idx;
          }
        }
      }

      if (!firstFrameDecoded) {
        bgFillIdx = canvas[0];
        firstFrameDecoded = true;
      }

      const shifted = new Uint8Array(width * height);
      shifted.fill(bgFillIdx);
      for (let y = 0; y < height; y++) {
        const sy = y - dy;
        if (sy < 0 || sy >= height) continue;
        const dstRow = y * width;
        const srcRow = sy * width;
        for (let x = 0; x < width; x++) {
          const sx = x - dx;
          if (sx >= 0 && sx < width) {
            shifted[dstRow + x] = canvas[srcRow + sx];
          }
        }
      }

      frames.push({
        pixels: shifted,
        delay: gce ? gce.delay : 7,
        fPacked: lct ? fPacked : 0,
        lct,
        minCodeSize: Math.max(2, minCodeSize)
      });

      if (gce) {
        if (gce.disposal === 2) {
          for (let y = 0; y < fH; y++) {
            const cy = fTop + y;
            if (cy >= 0 && cy < height) {
              canvas.fill(bgFillIdx, cy * width + fLeft, cy * width + Math.min(width, fLeft + fW));
            }
          }
        } else if (gce.disposal === 3) {
          canvas.set(prevCanvas);
        }
      }
      gce = null;
    } else {
      break;
    }
  }

  if (frames.length === 0) return u8;

  const outParts = [headerAndGct];
  outParts.push(new Uint8Array([
    0x21, 0xff, 0x0b,
    0x4e, 0x45, 0x54, 0x53, 0x43, 0x41, 0x50, 0x45, 0x32, 0x2e, 0x30,
    0x03, 0x01, 0x00, 0x00, 0x00
  ]));

  const gctCount = gctFlag ? 1 << ((packed & 7) + 1) : 0;
  const usedIdx = new Uint8Array(256);
  for (const fr of frames) {
    for (let k = 0; k < fr.pixels.length; k++) usedIdx[fr.pixels[k]] = 1;
  }
  let unusedTransIdx = -1;
  for (let c = gctCount - 1; c >= 0; c--) {
    if (!usedIdx[c]) {
      unusedTransIdx = c;
      break;
    }
  }

  let prevPixels = null;
  for (let i = 0; i < frames.length; i++) {
    const fr = frames[i];
    let rx = 0, ry = 0, rw = width, rh = height;
    if (prevPixels) {
      let minX = width, minY = height, maxX = -1, maxY = -1;
      for (let y = 0; y < height; y++) {
        const row = y * width;
        for (let x = 0; x < width; x++) {
          if (fr.pixels[row + x] !== prevPixels[row + x]) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX >= minX) {
        rx = minX;
        ry = minY;
        rw = maxX - minX + 1;
        rh = maxY - minY + 1;
      } else {
        rx = 0; ry = 0; rw = 1; rh = 1;
      }
    }

    const useTrans = i > 0 && unusedTransIdx >= 0 && !fr.lct;
    const gceBuf = new Uint8Array(8);
    const gceView = new DataView(gceBuf.buffer);
    gceBuf[0] = 0x21; gceBuf[1] = 0xf9; gceBuf[2] = 0x04;
    gceBuf[3] = useTrans ? 0x05 : 0x04;
    gceView.setUint16(4, fr.delay, true);
    gceBuf[6] = useTrans ? unusedTransIdx : 0x00;
    gceBuf[7] = 0x00;
    outParts.push(gceBuf);

    const descBuf = new Uint8Array(10);
    const descView = new DataView(descBuf.buffer);
    descBuf[0] = 0x2c;
    descView.setUint16(1, rx, true);
    descView.setUint16(3, ry, true);
    descView.setUint16(5, rw, true);
    descView.setUint16(7, rh, true);
    descBuf[9] = fr.lct ? (fr.fPacked & 0x87) : 0x00;
    outParts.push(descBuf);
    if (fr.lct) outParts.push(fr.lct);

    const subPixels = new Uint8Array(rw * rh);
    for (let y = 0; y < rh; y++) {
      const srcOff = (ry + y) * width + rx;
      const dstOff = y * rw;
      if (useTrans && prevPixels) {
        for (let x = 0; x < rw; x++) {
          const cur = fr.pixels[srcOff + x];
          subPixels[dstOff + x] = cur === prevPixels[srcOff + x] ? unusedTransIdx : cur;
        }
      } else {
        subPixels.set(fr.pixels.subarray(srcOff, srcOff + rw), dstOff);
      }
    }
    prevPixels = fr.pixels;

    const compressed = lzwEncode(fr.minCodeSize, subPixels);
    const subBlocks = [fr.minCodeSize];
    for (let p = 0; p < compressed.length; p += 255) {
      const chunk = compressed.subarray(p, Math.min(compressed.length, p + 255));
      subBlocks.push(chunk.length);
      for (let k = 0; k < chunk.length; k++) subBlocks.push(chunk[k]);
    }
    subBlocks.push(0x00);
    outParts.push(new Uint8Array(subBlocks));
  }

  outParts.push(new Uint8Array([0x3b]));
  let totalLen = 0;
  for (const p of outParts) totalLen += p.length;
  const result = new Uint8Array(totalLen);
  let off = 0;
  for (const p of outParts) {
    result.set(p, off);
    off += p.length;
  }
  return result;
}

async function shiftStaticImageBytes(rawBytes, dx, dy, mime = "image/png") {
  dx = Math.round(dx) || 0;
  dy = Math.round(dy) || 0;
  if (dx === 0 && dy === 0) return rawBytes;
  const blob = new Blob([rawBytes], { type: mime });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  await new Promise((res, rej) => {
    img.onload = res;
    img.onerror = rej;
    img.src = url;
  });
  URL.revokeObjectURL(url);
  const w = img.naturalWidth || state.width;
  const h = img.naturalHeight || state.height;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = state.skin[state.previewSkin]?.background_color || "#000000";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, dx, dy);
  const outBlob = await new Promise((r) => canvas.toBlob(r, "image/png"));
  return new Uint8Array(await outBlob.arrayBuffer());
}

async function computeShiftedBytes(rawBytes, filename, dx, dy) {
  if (!dx && !dy) return rawBytes;
  const isGif = filename.toLowerCase().endsWith(".gif") || (rawBytes[0] === 0x47 && rawBytes[1] === 0x49);
  if (isGif) return shiftGifBytes(rawBytes, dx, dy);
  return shiftStaticImageBytes(rawBytes, dx, dy, "image/png");
}

// ==========================================
// 3. BUILD FINAL ASSETS.BIN IN BROWSER
// ==========================================

async function buildAssetsBinary() {
  const files = {};
  const dimensions = {};

  const indexJson = {
    version: 1,
    emoji_collection: [],
    skin: {
      light: { ...state.skin.light },
      dark: { ...state.skin.dark }
    }
  };

  if (state.hideSubtitle) {
    indexJson.hide_subtitle = true;
  }

  if (state.includeSrmodels && state.srmodelsBytes) {
    files["srmodels.bin"] = state.srmodelsBytes;
    indexJson.srmodels = "srmodels.bin";
  }

  if (!state.omitFont && state.fontBytes) {
    files[state.fontName] = state.fontBytes;
    indexJson.text_font = state.fontName;
    if (state.fontMeta) indexJson.text_font_meta = state.fontMeta;
  }

  // Đóng gói 21 cảm xúc (nếu thiếu cảm xúc nào thì fallback về neutral)
  const neutralData = state.emojis["neutral"];
  const packedFileMap = new Map(); // tránh đóng gói trùng nếu nhiều cảm xúc trỏ cùng 1 file

  let emoCounter = 0;
  for (const emo of STANDARD_EMOTIONS) {
    const item = state.emojis[emo] || neutralData;
    if (!item) continue;

    let packedName = packedFileMap.get(item.bytes);
    if (!packedName) {
      emoCounter++;
      const ext = item.filename.toLowerCase().endsWith(".png") ? ".png" : ".gif";
      packedName = `emo_${String(emoCounter).padStart(2, "0")}_${emo}${ext}`.slice(0, 31);
      packedFileMap.set(item.bytes, packedName);
      files[packedName] = item.bytes;
      dimensions[packedName] = [item.width || state.width, item.height || state.height];
    }
    indexJson.emoji_collection.push({ name: emo, file: packedName });
  }

  // Ảnh nền (nếu tắt --no-bg)
  if (!state.noBg) {
    if (state.bgLightFile?.file) {
      log(`Đang chuyển đổi ảnh nền Light sang CBin RGB565 (${state.width}x${state.height})...`, "info");
      const cbin = await fileToLvglCBin(state.bgLightFile.file, state.width, state.height, state.fitMode);
      files["bg_light.bin"] = cbin;
      dimensions["bg_light.bin"] = [state.width, state.height];
      indexJson.skin.light.background_image = "bg_light.bin";
    }
    if (state.bgDarkFile?.file) {
      log(`Đang chuyển đổi ảnh nền Dark sang CBin RGB565 (${state.width}x${state.height})...`, "info");
      const cbin = await fileToLvglCBin(state.bgDarkFile.file, state.width, state.height, state.fitMode);
      files["bg_dark.bin"] = cbin;
      dimensions["bg_dark.bin"] = [state.width, state.height];
      indexJson.skin.dark.background_image = "bg_dark.bin";
    }
  }

  const encoder = new TextEncoder();
  files["index.json"] = encoder.encode(JSON.stringify(indexJson, null, 2));

  return packMmapAssets(files, dimensions);
}

// ==========================================
// 4. UI RENDERING & PREVIEW SYNC
// ==========================================

let draggedEmotion = null;
let draggedDonorEmo = null;

function safeRevokeBlobUrl(url) {
  if (!url || !url.startsWith("blob:")) return;
  const inUse =
    Object.values(state.emojis).some((it) => it?.url === url) ||
    Object.values(state.defaultEmojis).some((it) => it?.url === url) ||
    Object.values(state.donorEmojis).some((it) => it?.url === url);
  if (!inUse) {
    URL.revokeObjectURL(url);
  }
}

function assignFromDonor(targetEmo, donorEmo) {
  const donorItem = state.donorEmojis[donorEmo];
  if (!donorItem) return;
  const prevUrl = state.emojis[targetEmo]?.url;
  const rawBytes = donorItem.rawBytes || donorItem.bytes;
  const url = URL.createObjectURL(new Blob([rawBytes], { type: "image/gif" }));
  state.emojis[targetEmo] = {
    filename: `${targetEmo}.gif`,
    rawBytes,
    bytes: rawBytes,
    url,
    width: donorItem.width || state.width,
    height: donorItem.height || state.height,
    offsetX: 0,
    offsetY: 0
  };
  safeRevokeBlobUrl(prevUrl);
  state.activeEmotion = targetEmo;
  log(`Đã lấy biểu cảm "${donorEmo}" (từ Theme ${state.donorPresetId}) gán vào ô "${targetEmo}".`, "ok");
  renderEmotionGrid();
  updateVirtualScreen();
  updateStats();
}

function renderDonorGrid() {
  if (!els.donorEmotionGrid) return;
  els.donorEmotionGrid.innerHTML = "";
  for (const emo of STANDARD_EMOTIONS) {
    const item = state.donorEmojis[emo];
    const card = document.createElement("div");
    card.className = "emo-card donor-card";
    card.dataset.emo = emo;
    card.draggable = Boolean(item);
    card.title = `Kéo thả xuống bộ 21 biểu cảm chính, hoặc bấm để gán vào ô "${state.activeEmotion}"`;

    const thumbHtml = item
      ? `<img class="emo-thumb" src="${item.url}" alt="${emo}" draggable="false" />`
      : `<div class="emo-thumb" style="display:grid;place-items:center;color:#475569;font-size:10px;">...</div>`;
    const sizeText = item ? `${Math.max(1, Math.round(item.bytes.length / 1024))} KB` : "";

    card.innerHTML = `
      ${thumbHtml}
      <div class="emo-name">${emo}</div>
      <div class="emo-meta">${sizeText}</div>
    `;

    card.addEventListener("click", () => {
      if (item) assignFromDonor(state.activeEmotion, emo);
    });

    card.addEventListener("dragstart", (e) => {
      if (!item) {
        e.preventDefault();
        return;
      }
      draggedDonorEmo = emo;
      draggedEmotion = null;
      card.classList.add("dragging");
      e.dataTransfer.effectAllowed = "copy";
      e.dataTransfer.setData("text/plain", `donor:${emo}`);
    });

    card.addEventListener("dragend", () => {
      draggedDonorEmo = null;
      card.classList.remove("dragging");
    });

    els.donorEmotionGrid.appendChild(card);
  }
}

async function loadDonorPreset(presetId) {
  if (!presetId) return;
  state.donorPresetId = presetId;
  try {
    const loaded = await Promise.all(
      STANDARD_EMOTIONS.map(async (emo) => {
        const res = await fetch(`presets/${presetId}/${emo}.gif`, { cache: "no-store" });
        if (!res.ok) return null;
        const bytes = new Uint8Array(await res.arrayBuffer());
        return { emo, bytes };
      })
    );
    for (const item of loaded) {
      if (!item) continue;
      const { emo, bytes } = item;
      const prevUrl = state.donorEmojis[emo]?.url;
      const url = URL.createObjectURL(new Blob([bytes], { type: "image/gif" }));
      state.donorEmojis[emo] = {
        filename: `${emo}.gif`,
        rawBytes: bytes,
        bytes,
        url,
        width: 320,
        height: 240,
        presetId
      };
      safeRevokeBlobUrl(prevUrl);
    }
    renderDonorGrid();
  } catch (err) {
    log(`Lỗi tải kho Theme phụ: ${err.message}`, "err");
  }
}

async function applyEmotionOffset(emo, newX, newY, silent = false) {
  const item = state.emojis[emo];
  if (!item) return;
  const dx = Math.max(-120, Math.min(120, Math.round(newX) || 0));
  const dy = Math.max(-120, Math.min(120, Math.round(newY) || 0));
  const raw = item.rawBytes || item.bytes;
  const shiftedBytes = await computeShiftedBytes(raw, item.filename || `${emo}.gif`, dx, dy);
  const mime = (item.filename || "").toLowerCase().endsWith(".png") ? "image/png" : "image/gif";
  const prevUrl = item.url;
  item.rawBytes = raw;
  item.bytes = shiftedBytes;
  item.offsetX = dx;
  item.offsetY = dy;
  item.url = URL.createObjectURL(new Blob([shiftedBytes], { type: mime }));
  safeRevokeBlobUrl(prevUrl);

  if (!silent) {
    renderEmotionGrid();
    updateVirtualScreen();
    updateStats();
  }
}

async function applyShiftToAll(dx, dy) {
  dx = Math.max(-120, Math.min(120, Math.round(dx) || 0));
  dy = Math.max(-120, Math.min(120, Math.round(dy) || 0));
  log(`Đang căn chỉnh vị trí (X=${dx >= 0 ? "+" : ""}${dx}px, Y=${dy >= 0 ? "+" : ""}${dy}px) cho toàn bộ 21 biểu cảm...`, "info");
  // Tránh xử lý lặp nếu nhiều biểu cảm dùng chung cùng 1 rawBytes
  const cache = new Map();
  for (const emo of STANDARD_EMOTIONS) {
    const item = state.emojis[emo];
    if (!item) continue;
    const raw = item.rawBytes || item.bytes;
    let cached = cache.get(raw);
    if (!cached) {
      const shiftedBytes = await computeShiftedBytes(raw, item.filename || `${emo}.gif`, dx, dy);
      const mime = (item.filename || "").toLowerCase().endsWith(".png") ? "image/png" : "image/gif";
      const url = URL.createObjectURL(new Blob([shiftedBytes], { type: mime }));
      cached = { shiftedBytes, url };
      cache.set(raw, cached);
    }
    const prevUrl = item.url;
    item.rawBytes = raw;
    item.bytes = cached.shiftedBytes;
    item.offsetX = dx;
    item.offsetY = dy;
    item.url = cached.url;
    safeRevokeBlobUrl(prevUrl);
  }
  log(`Đã cập nhật vị trí (X=${dx >= 0 ? "+" : ""}${dx}px, Y=${dy >= 0 ? "+" : ""}${dy}px) cho cả 21 biểu cảm!`, "ok");
  renderEmotionGrid();
  updateVirtualScreen();
  updateStats();
}

function syncAlignControls() {
  const emo = state.activeEmotion;
  const item = state.emojis[emo];
  const ox = item?.offsetX || 0;
  const oy = item?.offsetY || 0;
  if (els.alignTargetLabel) els.alignTargetLabel.textContent = emo;
  if (els.donorTargetEmoLabel) els.donorTargetEmoLabel.textContent = emo;
  if (els.shiftXRange) els.shiftXRange.value = ox;
  if (els.shiftYRange) els.shiftYRange.value = oy;
  if (els.shiftXVal) els.shiftXVal.textContent = `${ox > 0 ? "+" : ""}${ox}px`;
  if (els.shiftYVal) els.shiftYVal.textContent = `${oy > 0 ? "+" : ""}${oy}px`;
}

function renderEmotionGrid() {
  els.emotionGrid.innerHTML = "";
  for (const emo of STANDARD_EMOTIONS) {
    const item = state.emojis[emo];
    const defItem = state.defaultEmojis[emo];
    const isModified = Boolean(defItem && item && item.bytes !== defItem.bytes);
    const hasOffset = Boolean(item && (item.offsetX || item.offsetY));

    const card = document.createElement("div");
    card.className = `emo-card ${state.activeEmotion === emo ? "active" : ""} ${isModified ? "modified" : ""}`;
    card.dataset.emo = emo;
    card.draggable = Boolean(item);

    const thumbHtml = item
      ? `<img class="emo-thumb" src="${item.url}" alt="${emo}" draggable="false" />`
      : `<div class="emo-thumb" style="display:grid;place-items:center;color:#475569;font-size:10px;">Trống</div>`;

    const sizeText = item ? `${Math.max(1, Math.round(item.bytes.length / 1024))} KB` : "Kéo thả GIF";
    const offsetBadgeHtml = hasOffset
      ? `<span class="emo-offset-badge" title="Đã dịch chuyển vị trí">${item.offsetX || 0},${item.offsetY || 0}</span>`
      : "";
    const resetBtnHtml = isModified
      ? `<button type="button" class="emo-reset-btn" title="Khôi phục '${emo}' về mặc định">↺</button>`
      : "";

    card.innerHTML = `
      ${offsetBadgeHtml}
      ${resetBtnHtml}
      ${thumbHtml}
      <div class="emo-name">${emo}</div>
      <div class="emo-meta">${sizeText}</div>
      <input type="file" accept=".gif,.png,.jpg,.jpeg" hidden />
    `;

    const fileInput = card.querySelector("input");
    const resetBtn = card.querySelector(".emo-reset-btn");

    if (resetBtn) {
      resetBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const prevUrl = state.emojis[emo]?.url;
        state.emojis[emo] = { ...defItem };
        safeRevokeBlobUrl(prevUrl);
        state.activeEmotion = emo;
        log(`Đã khôi phục biểu cảm "${emo}" về mặc định.`, "info");
        renderEmotionGrid();
        updateVirtualScreen();
        updateStats();
      });
    }

    card.addEventListener("click", (e) => {
      if (e.target === resetBtn) return;
      if (state.activeEmotion === emo && e.target !== fileInput) {
        fileInput.click();
      } else {
        state.activeEmotion = emo;
        renderEmotionGrid();
        updateVirtualScreen();
      }
    });

    card.addEventListener("dblclick", () => fileInput.click());

    fileInput.addEventListener("change", async (e) => {
      if (e.target.files[0]) {
        await assignEmotionFile(emo, e.target.files[0]);
      }
    });

    // Kéo thả từ ô này sang ô khác
    card.addEventListener("dragstart", (e) => {
      if (!state.emojis[emo]) {
        e.preventDefault();
        return;
      }
      draggedEmotion = emo;
      card.classList.add("dragging");
      e.dataTransfer.effectAllowed = "copyMove";
      e.dataTransfer.setData("text/plain", emo);
    });

    card.addEventListener("dragend", () => {
      draggedEmotion = null;
      card.classList.remove("dragging");
    });

    // Drag & Drop vào từng ô (file ngoài hoặc ô khác)
    card.addEventListener("dragover", (e) => {
      e.preventDefault();
      card.classList.add("dragover");
    });
    card.addEventListener("dragleave", () => card.classList.remove("dragover"));
    card.addEventListener("drop", async (e) => {
      e.preventDefault();
      card.classList.remove("dragover");
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        await assignEmotionFile(emo, e.dataTransfer.files[0]);
      } else if (draggedDonorEmo && state.donorEmojis[draggedDonorEmo]) {
        const donorSrc = draggedDonorEmo;
        draggedDonorEmo = null;
        assignFromDonor(emo, donorSrc);
      } else if (draggedEmotion && draggedEmotion !== emo && state.emojis[draggedEmotion]) {
        const src = draggedEmotion;
        if (state.emoDragMode === "swap") {
          const tmp = state.emojis[emo];
          state.emojis[emo] = state.emojis[src];
          if (tmp) state.emojis[src] = tmp;
          else delete state.emojis[src];
          log(`Đã đổi chỗ biểu cảm "${src}" ↔ "${emo}".`, "ok");
        } else {
          const prevUrl = state.emojis[emo]?.url;
          state.emojis[emo] = { ...state.emojis[src] };
          safeRevokeBlobUrl(prevUrl);
          log(`Đã sao chép mặt "${src}" sang "${emo}".`, "ok");
        }
        draggedEmotion = null;
        state.activeEmotion = emo;
        renderEmotionGrid();
        updateVirtualScreen();
        updateStats();
      }
    });

    els.emotionGrid.appendChild(card);
  }
}

async function assignEmotionFile(emo, file) {
  if (!STANDARD_EMOTIONS.includes(emo)) return;
  if (file.size > MAX_IMAGE_FILE_BYTES) {
    log(`File "${file.name}" quá lớn (tối đa ${Math.round(MAX_IMAGE_FILE_BYTES / 1024 / 1024)} MB).`, "err");
    return;
  }
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  const [w, h] = await getImageDimensions(bytes, file.type || "image/gif");

  const prevUrl = state.emojis[emo]?.url;
  state.emojis[emo] = {
    filename: file.name,
    rawBytes: bytes,
    bytes,
    url: URL.createObjectURL(new Blob([bytes], { type: file.type || "image/gif" })),
    width: w,
    height: h,
    offsetX: 0,
    offsetY: 0
  };
  safeRevokeBlobUrl(prevUrl);
  state.activeEmotion = emo;
  renderEmotionGrid();
  updateVirtualScreen();
  updateStats();
}

async function handleBulkFiles(fileList) {
  let matchedCount = 0;
  for (const file of fileList) {
    if (file.size > MAX_IMAGE_FILE_BYTES) {
      log(`Bỏ qua "${file.name}": vượt quá ${Math.round(MAX_IMAGE_FILE_BYTES / 1024 / 1024)} MB.`, "err");
      continue;
    }
    const stem = file.name.replace(/\.[^/.]+$/, "").toLowerCase();
    const matchedEmos = [];

    for (const emo of STANDARD_EMOTIONS) {
      if (stem.includes(emo)) matchedEmos.push(emo);
    }
    for (const [key, emoList] of Object.entries(KEYWORD_MAP)) {
      if (stem.includes(key)) {
        for (const e of emoList) {
          if (!matchedEmos.includes(e)) matchedEmos.push(e);
        }
      }
    }

    if (matchedEmos.length > 0) {
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);
      const [w, h] = await getImageDimensions(bytes, file.type || "image/gif");
      const url = URL.createObjectURL(new Blob([bytes], { type: file.type || "image/gif" }));

      for (const emo of matchedEmos) {
        state.emojis[emo] = { filename: file.name, rawBytes: bytes, bytes, url, width: w, height: h, offsetX: 0, offsetY: 0 };
      }
      matchedCount++;
    }
  }
  if (matchedCount > 0) {
    log(`Đã tự động gán ${matchedCount} file ảnh vào bộ cảm xúc.`, "ok");
    renderEmotionGrid();
    updateVirtualScreen();
    updateStats();
  } else {
    log("Không nhận diện được tên cảm xúc nào từ các file vừa thả.", "err");
  }
}

function updateVirtualScreen() {
  els.virtualScreen.className = `virtual-screen size-${state.width}x${state.height}`;
  els.resBadge.textContent = `${state.width}×${state.height}`;

  const skinCfg = state.skin[state.previewSkin];
  els.virtualScreen.style.backgroundColor = skinCfg.background_color;
  els.virtualTopBar.style.color = skinCfg.text_color;
  const bgHex = (skinCfg.background_color || "#000000").replace("#", "");
  const r = parseInt(bgHex.slice(0, 2), 16) || 0;
  const g = parseInt(bgHex.slice(2, 4), 16) || 0;
  const b = parseInt(bgHex.slice(4, 6), 16) || 0;
  const isLightBg = (r * 299 + g * 587 + b * 114) / 1000 > 128;
  els.virtualTopBar.style.backgroundColor = isLightBg
    ? `rgba(${r},${g},${b},0.88)`
    : `rgba(${r},${g},${b},0.85)`;

  // Background image preview
  const bgItem = state.previewSkin === "light" ? state.bgLightFile : state.bgDarkFile;
  if (!state.noBg && bgItem?.url) {
    els.virtualBgImg.src = bgItem.url;
    els.virtualBgImg.classList.remove("hidden");
  } else {
    els.virtualBgImg.classList.add("hidden");
  }

  // Emoji preview
  const emoItem = state.emojis[state.activeEmotion] || state.emojis["neutral"];
  if (emoItem) {
    els.virtualEmojiImg.src = emoItem.url;
    els.virtualEmojiImg.classList.remove("hidden");
    els.virtualEmojiPlaceholder.classList.add("hidden");
  } else {
    els.virtualEmojiImg.classList.add("hidden");
    els.virtualEmojiPlaceholder.classList.remove("hidden");
  }

  // Subtitle preview
  if (state.hideSubtitle) {
    els.virtualBottomBar.classList.add("hidden");
  } else {
    els.virtualBottomBar.classList.remove("hidden");
    els.virtualBottomBar.style.color = skinCfg.text_color;
  }

  els.activeEmotionLabel.textContent = state.activeEmotion;
  els.toggleSkinBtn.textContent = state.previewSkin === "light" ? "☀️ Đang xem: Light" : "🌙 Đang xem: Dark";
  syncAlignControls();
}

function updateStats() {
  let totalBytes = 2048; // index.json + header
  let count = 1;
  if (state.includeSrmodels && state.srmodelsBytes) {
    totalBytes += state.srmodelsBytes.length;
    count++;
  }
  if (!state.omitFont && state.fontBytes) {
    totalBytes += state.fontBytes.length;
    count++;
  }
  const seen = new Set();
  for (const emo of STANDARD_EMOTIONS) {
    const item = state.emojis[emo];
    if (item && !seen.has(item.bytes)) {
      seen.add(item.bytes);
      totalBytes += item.bytes.length;
      count++;
    }
  }
  if (!state.noBg) {
    if (state.bgLightFile?.file) { totalBytes += state.width * state.height * 2; count++; }
    if (state.bgDarkFile?.file) { totalBytes += state.width * state.height * 2; count++; }
  }
  const kb = (totalBytes / 1024).toFixed(1);
  const mb = (totalBytes / (1024 * 1024)).toFixed(2);
  els.packageStats.textContent = `Ước tính: ${kb} KB (${mb} MB) • ${count} files`;
}

// ==========================================
// 5. LOAD PRESETS & IMPORT .BIN
// ==========================================

let presetLoadToken = 0;

async function loadWakeWordModel(modelId) {
  state.wakeWordId = modelId;
  try {
    let res = await fetch(`presets/srmodels/${modelId}.bin`);
    if (!res.ok && modelId === "wn9_hitelly_tts") {
      res = await fetch("presets/srmodels.bin");
    }
    if (!res.ok) throw new Error(`Không tải được model ${modelId}`);
    state.srmodelsBytes = new Uint8Array(await res.arrayBuffer());
    const label = els.wakeWordSelect?.selectedOptions?.[0]?.text || modelId;
    log(`Đã chọn Wake Word: ${label} (${Math.round(state.srmodelsBytes.length / 1024)} KB).`, "ok");
    updateStats();
  } catch (err) {
    log(`Lỗi tải Wake Word: ${err.message}`, "err");
  }
}

async function loadBaseAssetsAndPreset(presetId = els.presetSelect?.value || "robot_cyan") {
  const myToken = ++presetLoadToken;
  try {
    if (!state.srmodelsBytes) {
      await loadWakeWordModel(state.wakeWordId);
    }
    if (!state.fontBytes) {
      log("Đang tải Font tiếng Việt mặc định...", "info");
      const fontRes = await fetch("presets/font_noto_sans_common_20_4.bin");
      if (fontRes.ok) state.fontBytes = new Uint8Array(await fontRes.arrayBuffer());
    }

    if (myToken !== presetLoadToken) return;

    const presetLabel = els.presetSelect?.selectedOptions?.[0]?.text || presetId;
    log(`Đang nạp bộ 21 biểu cảm: ${presetLabel}...`, "info");

    if (presetId.startsWith("light_")) {
      state.skin.light = { text_color: "#0F172A", background_color: "#FFFFFF" };
      state.previewSkin = "light";
      syncColorInputs();
    } else {
      state.skin.light = { text_color: "#FFFFFF", background_color: "#000000" };
      syncColorInputs();
    }

    const loaded = await Promise.all(
      STANDARD_EMOTIONS.map(async (emo) => {
        const res = await fetch(`presets/${presetId}/${emo}.gif`, { cache: "no-store" });
        if (!res.ok) return null;
        const bytes = new Uint8Array(await res.arrayBuffer());
        return { emo, bytes };
      })
    );

    if (myToken !== presetLoadToken) return;

    for (const item of loaded) {
      if (!item) continue;
      const { emo, bytes } = item;
      const prevUrl = state.emojis[emo]?.url;
      const prevDefUrl = state.defaultEmojis[emo]?.url;
      const url = URL.createObjectURL(new Blob([bytes], { type: "image/gif" }));
      const entry = {
        filename: `${emo}.gif`,
        rawBytes: bytes,
        bytes,
        url,
        width: 320,
        height: 240,
        offsetX: 0,
        offsetY: 0
      };
      state.emojis[emo] = entry;
      state.defaultEmojis[emo] = { ...entry };
      safeRevokeBlobUrl(prevUrl);
      safeRevokeBlobUrl(prevDefUrl);
    }

    log(`Đã nạp xong Theme "${presetLabel}"! Bạn có thể xem trước hoặc bấm Nạp thẳng vào ESP32.`, "ok");
    renderEmotionGrid();
    updateVirtualScreen();
    updateStats();
  } catch (err) {
    log(`Lỗi tải preset: ${err.message}`, "err");
  }
}

async function importBinFile(file) {
  try {
    if (file.size > MAX_BIN_IMPORT_BYTES) {
      throw new Error(`File .bin vượt quá giới hạn an toàn (${Math.round(MAX_BIN_IMPORT_BYTES / 1024 / 1024)} MB).`);
    }
    log(`Đang giải nén ${file.name}...`, "info");
    const buf = await file.arrayBuffer();
    const { files, dimensions } = unpackMmapAssets(buf);

    if (!files["index.json"]) throw new Error("Không tìm thấy index.json trong gói .bin");
    const idxJson = JSON.parse(new TextDecoder().decode(files["index.json"]));

    if (typeof idxJson.srmodels === "string" && SAFE_FILENAME_RE.test(idxJson.srmodels) && files[idxJson.srmodels]) {
      state.srmodelsBytes = files[idxJson.srmodels];
      state.includeSrmodels = true;
      els.includeSrmodelsCheck.checked = true;
    }

    if (typeof idxJson.text_font === "string" && SAFE_FILENAME_RE.test(idxJson.text_font) && files[idxJson.text_font]) {
      state.fontName = idxJson.text_font;
      state.fontBytes = files[idxJson.text_font];
      state.fontMeta = idxJson.text_font_meta || state.fontMeta;
      state.omitFont = false;
      els.omitFontCheck.checked = false;
    }

    state.hideSubtitle = Boolean(idxJson.hide_subtitle);
    els.hideSubtitleCheck.checked = state.hideSubtitle;

    if (idxJson.skin?.light) {
      state.skin.light.text_color = sanitizeHexColor(idxJson.skin.light.text_color, "#FFFFFF");
      state.skin.light.background_color = sanitizeHexColor(idxJson.skin.light.background_color, "#000000");
    }
    if (idxJson.skin?.dark) {
      state.skin.dark.text_color = sanitizeHexColor(idxJson.skin.dark.text_color, "#FFFFFF");
      state.skin.dark.background_color = sanitizeHexColor(idxJson.skin.dark.background_color, "#000000");
    }
    syncColorInputs();

    if (Array.isArray(idxJson.emoji_collection)) {
      for (const item of idxJson.emoji_collection) {
        if (
          item &&
          typeof item.name === "string" &&
          STANDARD_EMOTIONS.includes(item.name) &&
          typeof item.file === "string" &&
          SAFE_FILENAME_RE.test(item.file) &&
          files[item.file]
        ) {
          const bytes = files[item.file];
          const mime = item.file.endsWith(".png") ? "image/png" : "image/gif";
          const [w, h] = dimensions[item.file] || [state.width, state.height];
          const prevUrl = state.emojis[item.name]?.url;
          state.emojis[item.name] = {
            filename: item.file,
            rawBytes: bytes,
            bytes,
            url: URL.createObjectURL(new Blob([bytes], { type: mime })),
            width: w,
            height: h,
            offsetX: 0,
            offsetY: 0
          };
          safeRevokeBlobUrl(prevUrl);
        }
      }
    }

    log(`Giải nén thành công ${Object.keys(files).length} files từ ${file.name}!`, "ok");
    renderEmotionGrid();
    updateVirtualScreen();
    updateStats();
  } catch (err) {
    log(`Lỗi giải nén .bin: ${err.message}`, "err");
  }
}

// ==========================================
// 6. WEBSERIAL FLASHING WITH ESPTOOL-JS
// ==========================================

function uint8ToBinaryString(u8) {
  const CHUNK = 0x8000;
  let str = "";
  for (let i = 0; i < u8.length; i += CHUNK) {
    str += String.fromCharCode.apply(null, u8.subarray(i, i + CHUNK));
  }
  return str;
}

async function flashViaWebSerial() {
  if (!("serial" in navigator)) {
    alert("Trình duyệt của bạn không hỗ trợ WebSerial! Vui lòng dùng Google Chrome hoặc Microsoft Edge trên máy tính.");
    return;
  }

  let transport = null;
  try {
    els.flashUsbBtn.disabled = true;
    els.exportBinBtn.disabled = true;

    log("Đang đóng gói assets.bin trong trình duyệt...", "info");
    const offsetStr = els.flashOffsetInput.value.trim() || "0x800000";
    const flashAddr = validateFlashOffset(offsetStr);
    if (flashAddr < 0x200000) {
      const ok = confirm(
        `⚠️ Cảnh báo: Địa chỉ Offset ${offsetStr} khá thấp (< 0x200000). Offset chuẩn của XiaoZhi thường là 0x800000 (16MB Flash) hoặc 0x400000 (8MB Flash).\nBạn có chắc chắn muốn tiếp tục nạp vào ${offsetStr} không?`
      );
      if (!ok) {
        log("Đã hủy thao tác nạp theo yêu cầu người dùng.", "info");
        return;
      }
    }

    const packedBytes = await buildAssetsBinary();
    if (packedBytes.length > MAX_PACKED_ASSETS_BYTES) {
      throw new Error(
        `Gói assets.bin quá lớn (${(packedBytes.length / 1024 / 1024).toFixed(2)} MB > giới hạn 8 MB). Hãy bật "Lược bỏ Font mở rộng" hoặc giảm dung lượng GIF.`
      );
    }
    const baudRate = parseInt(els.baudRateSelect.value, 10) || 460800;

    log(`Đang yêu cầu chọn cổng USB Serial (nạp vào ${offsetStr}, ${packedBytes.length} bytes)...`, "info");
    const port = await navigator.serial.requestPort();

    const { ESPLoader, Transport } = await import("./vendor/esptool-js.bundle.js");
    transport = new Transport(port, true);

    const terminal = {
      clean: () => {},
      writeLine: (data) => log(data),
      write: (data) => {
        if (data && data.trim()) log(data.trim());
      }
    };

    const esploader = new ESPLoader({
      transport,
      baudrate: baudRate,
      terminal
    });

    log("Đang kết nối tới ESP32-S3...", "info");
    const chip = await esploader.main();
    log(`Đã kết nối: ${chip}`, "ok");

    els.progressWrap.classList.remove("hidden");
    els.progressFill.style.width = "0%";
    els.progressText.textContent = "0%";

    const paddedLen = Math.ceil(packedBytes.length / 4) * 4;
    let flashBytes = packedBytes;
    if (paddedLen !== packedBytes.length) {
      flashBytes = new Uint8Array(paddedLen);
      flashBytes.fill(0xff);
      flashBytes.set(packedBytes);
    }

    const bstr = uint8ToBinaryString(flashBytes);

    log(`Đang ghi ${flashBytes.length} bytes (${(flashBytes.length / 1024 / 1024).toFixed(2)} MB) xuống ${offsetStr}...`, "info");
    await esploader.writeFlash({
      fileArray: [{ data: bstr, address: flashAddr }],
      flashSize: "keep",
      eraseAll: false,
      compress: true,
      reportProgress: (fileIndex, written, total) => {
        const pct = Math.min(100, Math.round((written / total) * 100));
        els.progressFill.style.width = `${pct}%`;
        els.progressText.textContent = `${pct}%`;
      }
    });

    log("Ghi dữ liệu thành công! Đang khởi động lại mạch (Hard Reset)...", "ok");
    await transport.setDTR(false);
    await new Promise((r) => setTimeout(r, 100));
    await transport.setRTS(true);
    await new Promise((r) => setTimeout(r, 100));
    await transport.setRTS(false);

    log("🎉 HOÀN TẤT! Hãy kiểm tra giao diện mới trên màn hình XiaoZhi.", "ok");
  } catch (err) {
    log(`Lỗi nạp USB: ${err.message || err}`, "err");
  } finally {
    if (transport) {
      try { await transport.disconnect(); } catch (_) {}
    }
    els.flashUsbBtn.disabled = false;
    els.exportBinBtn.disabled = false;
  }
}

// ==========================================
// 7. EVENT LISTENERS
// ==========================================

function syncColorInputs() {
  els.lightTextColor.value = state.skin.light.text_color;
  els.lightTextHex.textContent = state.skin.light.text_color.toUpperCase();
  els.lightBgColor.value = state.skin.light.background_color;
  els.lightBgHex.textContent = state.skin.light.background_color.toUpperCase();
  els.darkTextColor.value = state.skin.dark.text_color;
  els.darkTextHex.textContent = state.skin.dark.text_color.toUpperCase();
  els.darkBgColor.value = state.skin.dark.background_color;
  els.darkBgHex.textContent = state.skin.dark.background_color.toUpperCase();
}

function setupBgDropzone(dropEl, inputEl, nameEl, key) {
  dropEl.addEventListener("click", () => inputEl.click());
  dropEl.addEventListener("dragover", (e) => {
    e.preventDefault();
    dropEl.classList.add("dragover");
  });
  dropEl.addEventListener("dragleave", () => dropEl.classList.remove("dragover"));
  dropEl.addEventListener("drop", (e) => {
    e.preventDefault();
    dropEl.classList.remove("dragover");
    if (e.dataTransfer.files[0]) setBgFile(e.dataTransfer.files[0], nameEl, key);
  });
  inputEl.addEventListener("change", (e) => {
    if (e.target.files[0]) setBgFile(e.target.files[0], nameEl, key);
  });
}

function setBgFile(file, nameEl, key) {
  if (state[key]?.url) URL.revokeObjectURL(state[key].url);
  state[key] = { name: file.name, file, url: URL.createObjectURL(file) };
  nameEl.textContent = file.name;
  updateVirtualScreen();
  updateStats();
}

function init() {
  els.resolutionSelect.addEventListener("change", (e) => {
    const [w, h] = e.target.value.split("x").map(Number);
    state.width = w;
    state.height = h;
    updateVirtualScreen();
    updateStats();
  });

  els.fitModeSelect.addEventListener("change", (e) => {
    state.fitMode = e.target.value;
    updateVirtualScreen();
  });

  els.noBgCheck.addEventListener("change", (e) => {
    state.noBg = e.target.checked;
    els.bgUploadSection.classList.toggle("hidden", state.noBg);
    updateVirtualScreen();
    updateStats();
  });

  els.hideSubtitleCheck.addEventListener("change", (e) => {
    state.hideSubtitle = e.target.checked;
    updateVirtualScreen();
  });

  els.includeSrmodelsCheck.addEventListener("change", (e) => {
    state.includeSrmodels = e.target.checked;
    els.wakeWordBox?.classList.toggle("hidden", !state.includeSrmodels);
    updateStats();
  });

  els.wakeWordSelect?.addEventListener("change", (e) => {
    loadWakeWordModel(e.target.value);
  });

  els.customSrmodelInput?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_SRMODEL_FILE_BYTES) {
      log(`File srmodels "${file.name}" vượt quá giới hạn an toàn (${Math.round(MAX_SRMODEL_FILE_BYTES / 1024 / 1024)} MB).`, "err");
      return;
    }
    state.srmodelsBytes = new Uint8Array(await file.arrayBuffer());
    log(`Đã nạp file Wake Word tùy chỉnh: ${file.name} (${Math.round(state.srmodelsBytes.length / 1024)} KB).`, "ok");
    updateStats();
  });

  els.emoDragModeBtn?.addEventListener("click", () => {
    state.emoDragMode = state.emoDragMode === "copy" ? "swap" : "copy";
    els.emoDragModeBtn.textContent =
      state.emoDragMode === "copy" ? "🔀 Kéo thả: Sao chép" : "🔄 Kéo thả: Đổi chỗ";
  });

  els.resetAllEmoBtn?.addEventListener("click", () => {
    const keys = Object.keys(state.defaultEmojis);
    if (!keys.length) return;
    for (const emo of keys) {
      const prevUrl = state.emojis[emo]?.url;
      state.emojis[emo] = { ...state.defaultEmojis[emo] };
      safeRevokeBlobUrl(prevUrl);
    }
    log("Đã khôi phục toàn bộ 21 biểu cảm về mặc định của Preset.", "ok");
    renderEmotionGrid();
    updateVirtualScreen();
    updateStats();
  });

  els.omitFontCheck.addEventListener("change", (e) => {
    state.omitFont = e.target.checked;
    updateStats();
  });

  // Color pickers
  els.lightTextColor.addEventListener("input", (e) => {
    state.skin.light.text_color = e.target.value.toUpperCase();
    els.lightTextHex.textContent = state.skin.light.text_color;
    updateVirtualScreen();
  });
  els.lightBgColor.addEventListener("input", (e) => {
    state.skin.light.background_color = e.target.value.toUpperCase();
    els.lightBgHex.textContent = state.skin.light.background_color;
    updateVirtualScreen();
  });
  els.darkTextColor.addEventListener("input", (e) => {
    state.skin.dark.text_color = e.target.value.toUpperCase();
    els.darkTextHex.textContent = state.skin.dark.text_color;
    updateVirtualScreen();
  });
  els.darkBgColor.addEventListener("input", (e) => {
    state.skin.dark.background_color = e.target.value.toUpperCase();
    els.darkBgHex.textContent = state.skin.dark.background_color;
    updateVirtualScreen();
  });

  setupBgDropzone(els.bgLightDrop, els.bgLightInput, els.bgLightName, "bgLightFile");
  setupBgDropzone(els.bgDarkDrop, els.bgDarkInput, els.bgDarkName, "bgDarkFile");

  els.toggleSkinBtn.addEventListener("click", () => {
    state.previewSkin = state.previewSkin === "light" ? "dark" : "light";
    updateVirtualScreen();
  });

  // Bulk drop & import
  els.bulkEmojiInput.addEventListener("change", (e) => {
    if (e.target.files.length) handleBulkFiles(e.target.files);
  });
  els.bulkDropZone.addEventListener("dragover", (e) => {
    e.preventDefault();
    els.bulkDropZone.classList.add("dragover");
  });
  els.bulkDropZone.addEventListener("dragleave", () => els.bulkDropZone.classList.remove("dragover"));
  els.bulkDropZone.addEventListener("drop", (e) => {
    e.preventDefault();
    els.bulkDropZone.classList.remove("dragover");
    if (e.dataTransfer.files.length) handleBulkFiles(e.dataTransfer.files);
  });

  els.importBinInput.addEventListener("change", (e) => {
    if (e.target.files[0]) importBinFile(e.target.files[0]);
  });

  els.presetSelect.addEventListener("change", () => {
    loadBaseAssetsAndPreset(els.presetSelect.value);
  });
  els.loadPresetBtn.addEventListener("click", () => {
    loadBaseAssetsAndPreset(els.presetSelect.value);
  });

  els.exportBinBtn.addEventListener("click", async () => {
    try {
      els.exportBinBtn.disabled = true;
      log("Đang đóng gói assets.bin...", "info");
      const bytes = await buildAssetsBinary();
      const blob = new Blob([bytes], { type: "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `xiaozhi_assets_${state.width}x${state.height}.bin`;
      a.click();
      URL.revokeObjectURL(url);
      log(`Xuất file thành công (${(bytes.length / 1024).toFixed(1)} KB)!`, "ok");
    } catch (err) {
      log(`Lỗi xuất file: ${err.message}`, "err");
    } finally {
      els.exportBinBtn.disabled = false;
    }
  });

  els.flashUsbBtn.addEventListener("click", flashViaWebSerial);

  // ==========================================
  // KHO BIỂU CẢM PHỤ (DONOR THEME DRAWER)
  // ==========================================
  if (els.donorPresetSelect && els.presetSelect) {
    els.donorPresetSelect.innerHTML = els.presetSelect.innerHTML;
    const firstDiff = Array.from(els.donorPresetSelect.options).find((o) => o.value !== els.presetSelect.value);
    if (firstDiff) els.donorPresetSelect.value = firstDiff.value;
    els.donorPresetSelect.addEventListener("change", (e) => {
      loadDonorPreset(e.target.value);
    });
  }

  els.toggleDonorBtn?.addEventListener("click", () => {
    const isHidden = els.donorDrawer.classList.toggle("hidden");
    if (!isHidden && !Object.keys(state.donorEmojis).length && els.donorPresetSelect) {
      loadDonorPreset(els.donorPresetSelect.value);
    }
  });

  els.closeDonorBtn?.addEventListener("click", () => {
    els.donorDrawer.classList.add("hidden");
  });

  els.donorCopyMatchBtn?.addEventListener("click", () => {
    const emo = state.activeEmotion;
    if (state.donorEmojis[emo]) {
      assignFromDonor(emo, emo);
    }
  });

  // ==========================================
  // CĂN CHỈNH VỊ TRÍ ẢNH (DỊCH TRÁI/PHẢI, LÊN/XUỐNG)
  // ==========================================
  const getStep = () => parseInt(els.shiftStepSelect?.value || "5", 10) || 5;
  const nudgeActive = async (dx, dy) => {
    const emo = state.activeEmotion;
    const item = state.emojis[emo];
    if (!item) return;
    await applyEmotionOffset(emo, (item.offsetX || 0) + dx, (item.offsetY || 0) + dy);
  };

  els.shiftLeftBtn?.addEventListener("click", () => nudgeActive(-getStep(), 0));
  els.shiftRightBtn?.addEventListener("click", () => nudgeActive(getStep(), 0));
  els.shiftUpBtn?.addEventListener("click", () => nudgeActive(0, -getStep()));
  els.shiftDownBtn?.addEventListener("click", () => nudgeActive(0, getStep()));
  els.shiftResetBtn?.addEventListener("click", () => applyEmotionOffset(state.activeEmotion, 0, 0));

  els.shiftXRange?.addEventListener("input", (e) => {
    const v = parseInt(e.target.value, 10) || 0;
    if (els.shiftXVal) els.shiftXVal.textContent = `${v > 0 ? "+" : ""}${v}px`;
  });
  els.shiftXRange?.addEventListener("change", (e) => {
    const v = parseInt(e.target.value, 10) || 0;
    const item = state.emojis[state.activeEmotion];
    if (item) applyEmotionOffset(state.activeEmotion, v, item.offsetY || 0);
  });

  els.shiftYRange?.addEventListener("input", (e) => {
    const v = parseInt(e.target.value, 10) || 0;
    if (els.shiftYVal) els.shiftYVal.textContent = `${v > 0 ? "+" : ""}${v}px`;
  });
  els.shiftYRange?.addEventListener("change", (e) => {
    const v = parseInt(e.target.value, 10) || 0;
    const item = state.emojis[state.activeEmotion];
    if (item) applyEmotionOffset(state.activeEmotion, item.offsetX || 0, v);
  });

  els.applyShiftAllBtn?.addEventListener("click", () => {
    const item = state.emojis[state.activeEmotion];
    if (!item) return;
    applyShiftToAll(item.offsetX || 0, item.offsetY || 0);
  });

  els.resetShiftAllBtn?.addEventListener("click", () => {
    applyShiftToAll(0, 0);
  });

  // Kéo trực tiếp biểu cảm trên màn hình ảo (#virtualEmojiImg)
  let panState = null;
  els.virtualEmojiImg?.addEventListener("pointerdown", (e) => {
    const item = state.emojis[state.activeEmotion];
    if (!item) return;
    e.preventDefault();
    els.virtualEmojiImg.setPointerCapture(e.pointerId);
    panState = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      origX: item.offsetX || 0,
      origY: item.offsetY || 0,
      dx: 0,
      dy: 0
    };
  });

  els.virtualEmojiImg?.addEventListener("pointermove", (e) => {
    if (!panState || e.pointerId !== panState.pointerId) return;
    panState.dx = Math.round(e.clientX - panState.startX);
    panState.dy = Math.round(e.clientY - panState.startY);
    els.virtualEmojiImg.style.transform = `translate(${panState.dx}px, ${panState.dy}px)`;
    const nx = Math.max(-120, Math.min(120, panState.origX + panState.dx));
    const ny = Math.max(-120, Math.min(120, panState.origY + panState.dy));
    if (els.shiftXRange) els.shiftXRange.value = nx;
    if (els.shiftYRange) els.shiftYRange.value = ny;
    if (els.shiftXVal) els.shiftXVal.textContent = `${nx > 0 ? "+" : ""}${nx}px`;
    if (els.shiftYVal) els.shiftYVal.textContent = `${ny > 0 ? "+" : ""}${ny}px`;
  });

  const finishPan = async (e) => {
    if (!panState || e.pointerId !== panState.pointerId) return;
    const { origX, origY, dx, dy } = panState;
    panState = null;
    els.virtualEmojiImg.style.transform = "";
    if (dx !== 0 || dy !== 0) {
      await applyEmotionOffset(state.activeEmotion, origX + dx, origY + dy);
    }
  };
  els.virtualEmojiImg?.addEventListener("pointerup", finishPan);
  els.virtualEmojiImg?.addEventListener("pointercancel", finishPan);

  renderEmotionGrid();
  loadBaseAssetsAndPreset();
}

init();
