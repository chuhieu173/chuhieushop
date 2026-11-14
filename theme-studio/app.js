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
  omitFont: false,
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
  emojis: {} // { [emotion]: { filename, bytes: Uint8Array, url, width, height } }
};

// DOM elements
const els = {
  resolutionSelect: document.getElementById("resolutionSelect"),
  fitModeSelect: document.getElementById("fitModeSelect"),
  noBgCheck: document.getElementById("noBgCheck"),
  hideSubtitleCheck: document.getElementById("hideSubtitleCheck"),
  includeSrmodelsCheck: document.getElementById("includeSrmodelsCheck"),
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

function unpackMmapAssets(arrayBuffer) {
  const view = new DataView(arrayBuffer);
  const bytes = new Uint8Array(arrayBuffer);
  if (bytes.length < 12) throw new Error("File .bin quá nhỏ hoặc không hợp lệ.");

  const numFiles = view.getUint32(0, true);
  const totalLen = view.getUint32(8, true);
  if (numFiles === 0 || numFiles > 500 || 12 + totalLen > bytes.length) {
    throw new Error(`Header esp_mmap_assets không hợp lệ (numFiles=${numFiles}).`);
  }

  const tableEnd = 12 + numFiles * 44;
  const decoder = new TextDecoder("utf-8");
  const files = {};
  const dimensions = {};

  for (let i = 0; i < numFiles; i++) {
    const entryOff = 12 + i * 44;
    const rawName = bytes.slice(entryOff, entryOff + 32);
    const nullIdx = rawName.indexOf(0);
    const name = decoder.decode(nullIdx >= 0 ? rawName.slice(0, nullIdx) : rawName);

    const size = view.getUint32(entryOff + 32, true);
    const offset = view.getUint32(entryOff + 36, true);
    const w = view.getUint16(entryOff + 40, true);
    const h = view.getUint16(entryOff + 42, true);

    let start = tableEnd + offset;
    if (bytes[start] === 0x5a && bytes[start + 1] === 0x5a) { // 'ZZ'
      start += 2;
    }
    files[name] = bytes.slice(start, start + size);
    dimensions[name] = [w, h];
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

function renderEmotionGrid() {
  els.emotionGrid.innerHTML = "";
  for (const emo of STANDARD_EMOTIONS) {
    const card = document.createElement("div");
    card.className = `emo-card ${state.activeEmotion === emo ? "active" : ""}`;
    card.dataset.emo = emo;

    const item = state.emojis[emo];
    const thumbHtml = item
      ? `<img class="emo-thumb" src="${item.url}" alt="${emo}" />`
      : `<div class="emo-thumb" style="display:grid;place-items:center;color:#475569;font-size:10px;">Trống</div>`;

    const sizeText = item ? `${Math.max(1, Math.round(item.bytes.length / 1024))} KB` : "Kéo thả GIF";

    card.innerHTML = `
      ${thumbHtml}
      <div class="emo-name">${emo}</div>
      <div class="emo-meta">${sizeText}</div>
      <input type="file" accept=".gif,.png,.jpg,.jpeg" hidden />
    `;

    const fileInput = card.querySelector("input");

    card.addEventListener("click", (e) => {
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

    // Drag & Drop vào từng ô
    card.addEventListener("dragover", (e) => {
      e.preventDefault();
      card.classList.add("dragover");
    });
    card.addEventListener("dragleave", () => card.classList.remove("dragover"));
    card.addEventListener("drop", async (e) => {
      e.preventDefault();
      card.classList.remove("dragover");
      if (e.dataTransfer.files[0]) {
        await assignEmotionFile(emo, e.dataTransfer.files[0]);
      }
    });

    els.emotionGrid.appendChild(card);
  }
}

async function assignEmotionFile(emo, file) {
  const buf = await file.arrayBuffer();
  const bytes = new Uint8Array(buf);
  const [w, h] = await getImageDimensions(bytes, file.type || "image/gif");

  if (state.emojis[emo]?.url?.startsWith("blob:")) {
    URL.revokeObjectURL(state.emojis[emo].url);
  }

  state.emojis[emo] = {
    filename: file.name,
    bytes,
    url: URL.createObjectURL(new Blob([bytes], { type: file.type || "image/gif" })),
    width: w,
    height: h
  };
  state.activeEmotion = emo;
  renderEmotionGrid();
  updateVirtualScreen();
  updateStats();
}

async function handleBulkFiles(fileList) {
  let matchedCount = 0;
  for (const file of fileList) {
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
        state.emojis[emo] = { filename: file.name, bytes, url, width: w, height: h };
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

async function loadBaseAssetsAndPreset(presetId = els.presetSelect?.value || "robot_cyan") {
  const myToken = ++presetLoadToken;
  try {
    if (!state.srmodelsBytes || !state.fontBytes) {
      log("Đang tải Wake Word (srmodels.bin) & Font tiếng Việt mặc định...", "info");
      const [srRes, fontRes] = await Promise.all([
        fetch("presets/srmodels.bin"),
        fetch("presets/font_noto_sans_common_20_4.bin")
      ]);
      if (srRes.ok) state.srmodelsBytes = new Uint8Array(await srRes.arrayBuffer());
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
      if (state.emojis[emo]?.url?.startsWith("blob:")) {
        URL.revokeObjectURL(state.emojis[emo].url);
      }
      const url = URL.createObjectURL(new Blob([bytes], { type: "image/gif" }));
      state.emojis[emo] = {
        filename: `${emo}.gif`,
        bytes,
        url,
        width: 320,
        height: 240
      };
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
    log(`Đang giải nén ${file.name}...`, "info");
    const buf = await file.arrayBuffer();
    const { files, dimensions } = unpackMmapAssets(buf);

    if (!files["index.json"]) throw new Error("Không tìm thấy index.json trong gói .bin");
    const idxJson = JSON.parse(new TextDecoder().decode(files["index.json"]));

    if (idxJson.srmodels && files[idxJson.srmodels]) {
      state.srmodelsBytes = files[idxJson.srmodels];
      state.includeSrmodels = true;
      els.includeSrmodelsCheck.checked = true;
    }

    if (idxJson.text_font && files[idxJson.text_font]) {
      state.fontName = idxJson.text_font;
      state.fontBytes = files[idxJson.text_font];
      state.fontMeta = idxJson.text_font_meta || state.fontMeta;
      state.omitFont = false;
      els.omitFontCheck.checked = false;
    }

    state.hideSubtitle = Boolean(idxJson.hide_subtitle);
    els.hideSubtitleCheck.checked = state.hideSubtitle;

    if (idxJson.skin?.light) {
      state.skin.light.text_color = idxJson.skin.light.text_color || "#FFFFFF";
      state.skin.light.background_color = idxJson.skin.light.background_color || "#000000";
    }
    if (idxJson.skin?.dark) {
      state.skin.dark.text_color = idxJson.skin.dark.text_color || "#FFFFFF";
      state.skin.dark.background_color = idxJson.skin.dark.background_color || "#000000";
    }
    syncColorInputs();

    if (Array.isArray(idxJson.emoji_collection)) {
      for (const item of idxJson.emoji_collection) {
        if (files[item.file]) {
          const bytes = files[item.file];
          const mime = item.file.endsWith(".png") ? "image/png" : "image/gif";
          const [w, h] = dimensions[item.file] || [state.width, state.height];
          state.emojis[item.name] = {
            filename: item.file,
            bytes,
            url: URL.createObjectURL(new Blob([bytes], { type: mime })),
            width: w,
            height: h
          };
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
    const packedBytes = await buildAssetsBinary();
    const offsetStr = els.flashOffsetInput.value.trim() || "0x800000";
    const flashAddr = parseInt(offsetStr, 16);
    const baudRate = parseInt(els.baudRateSelect.value, 10) || 921600;

    log(`Đang yêu cầu chọn cổng USB Serial (nạp vào ${offsetStr}, ${packedBytes.length} bytes)...`, "info");
    const port = await navigator.serial.requestPort();

    const { ESPLoader, Transport } = await import("https://esm.sh/esptool-js@0.4.5");
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

    const bstr = uint8ToBinaryString(packedBytes);

    log(`Đang ghi ${packedBytes.length} bytes xuống địa chỉ ${offsetStr}...`, "info");
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

  renderEmotionGrid();
  loadBaseAssetsAndPreset();
}

init();
