/**
 * XiaoZhi Firmware Studio — Board Configurator, Multi-Slot Flasher, NVS Generator & Serial Doctor
 * 100% Client-Side ES Module (Self-hosted esptool-js, CSP compliant)
 */

const MAX_BIN_FILE_BYTES = 16 * 1024 * 1024; // 16 MB
const FLASH_SECTOR_SIZE = 0x1000; // 4 KB

const PARTITION_PRESETS = [
  { label: "🚀 Firmware App (ota_0 @ 0x20000)", offset: "0x20000", color: "#3b82f6" },
  { label: "📦 Full Merged Binary (@ 0x0)", offset: "0x0", color: "#10b981" },
  { label: "🎨 Theme & Wake Word (assets @ 0x800000)", offset: "0x800000", color: "#a855f7" },
  { label: "🎨 Theme 8MB Flash (assets @ 0x400000)", offset: "0x400000", color: "#a855f7" },
  { label: "⚙️ Cấu hình WiFi / NVS (@ 0x9000)", offset: "0x9000", color: "#f59e0b" },
  { label: "🧭 Partition Table (@ 0x8000)", offset: "0x8000", color: "#06b6d4" },
  { label: "🔖 OTA Data (otadata @ 0xd000)", offset: "0xd000", color: "#eab308" },
  { label: "🧱 Bootloader ESP32-S3/C3 (@ 0x0)", offset: "0x0", color: "#ef4444" },
  { label: "🧱 Bootloader ESP32 (@ 0x1000)", offset: "0x1000", color: "#ef4444" },
  { label: "🚀 Firmware App C3/ESP32 (@ 0x10000)", offset: "0x10000", color: "#3b82f6" },
  { label: "✏️ Tự nhập Offset Hex...", offset: "custom", color: "#64748b" }
];

const FALLBACK_CATALOG = [
  {
    id: "esp32s3_xiaozhi_28_320x240",
    name: "ESP32-S3 N16R8 — Màn 2.8\" / 2.4\" Ngang (320×240)",
    chip: "ESP32-S3",
    flashSizeMB: 16,
    psram: "8MB Octal PSRAM",
    screen: "320×240 (ILI9341 / ST7789)",
    badge: "Phổ biến nhất",
    defaultAppOffset: "0x20000",
    defaultAssetsOffset: "0x800000",
    description: "Cấu hình chuẩn cho mạch XiaoZhi ESP32-S3 16MB Flash (N16R8) dùng màn hình 2.4\"/2.8\" 320×240, mic INMP441, loa MAX98357A.",
    pinout: "Mic INMP441 (WS:4, SCK:5, SD:6) • Loa MAX98357 (BCLK:15, LRC:16, DIN:7) • LCD SPI (MOSI:11, SCLK:12, CS:10, DC:9, RST:8, BL:13)"
  }
];

const state = {
  activeTab: "tabCatalog",
  catalog: [],
  selectedBoardId: "",
  chipFilter: "ALL",
  searchQuery: "",
  flashSizeMB: 16,
  chipType: "esp32s3",
  baudRate: 460800,
  eraseAll: false,
  logLevelFilter: "ALL",
  slots: [
    { id: 1, enabled: true, preset: "0x20000", offset: "0x20000", name: "", bytes: null }
  ],
  nextSlotId: 2,
  logHistory: []
};

const els = {
  tabBtnCatalog: document.getElementById("tabBtnCatalog"),
  tabBtnSlots: document.getElementById("tabBtnSlots"),
  tabBtnNvs: document.getElementById("tabBtnNvs"),
  tabBtnDrivers: document.getElementById("tabBtnDrivers"),
  tabCatalog: document.getElementById("tabCatalog"),
  tabSlots: document.getElementById("tabSlots"),
  tabNvs: document.getElementById("tabNvs"),
  tabDrivers: document.getElementById("tabDrivers"),
  boardSearchInput: document.getElementById("boardSearchInput"),
  chipFilterSelect: document.getElementById("chipFilterSelect"),
  boardCatalogGrid: document.getElementById("boardCatalogGrid"),
  selectedBoardBox: document.getElementById("selectedBoardBox"),
  sbTitle: document.getElementById("sbTitle"),
  sbFlashBadge: document.getElementById("sbFlashBadge"),
  sbDesc: document.getElementById("sbDesc"),
  sbPinoutText: document.getElementById("sbPinoutText"),
  presetFlashModeSelect: document.getElementById("presetFlashModeSelect"),
  presetFirmwareFileInput: document.getElementById("presetFirmwareFileInput"),
  presetFwFileName: document.getElementById("presetFwFileName"),
  presetAssetsRow: document.getElementById("presetAssetsRow"),
  presetAssetsFileInput: document.getElementById("presetAssetsFileInput"),
  presetAssetsFileName: document.getElementById("presetAssetsFileName"),
  addSlotBtn: document.getElementById("addSlotBtn"),
  loadStandardLayoutBtn: document.getElementById("loadStandardLayoutBtn"),
  clearSlotsBtn: document.getElementById("clearSlotsBtn"),
  multiBinDropZone: document.getElementById("multiBinDropZone"),
  multiBinInput: document.getElementById("multiBinInput"),
  slotTableBody: document.getElementById("slotTableBody"),
  cliCommandPreview: document.getElementById("cliCommandPreview"),
  copyCliBtn: document.getElementById("copyCliBtn"),
  nvsWifiSsid: document.getElementById("nvsWifiSsid"),
  nvsWifiPass: document.getElementById("nvsWifiPass"),
  nvsServerUrl: document.getElementById("nvsServerUrl"),
  nvsNamespaceInput: document.getElementById("nvsNamespaceInput"),
  nvsVolumeRange: document.getElementById("nvsVolumeRange"),
  nvsVolumeVal: document.getElementById("nvsVolumeVal"),
  nvsBrightnessRange: document.getElementById("nvsBrightnessRange"),
  nvsBrightnessVal: document.getElementById("nvsBrightnessVal"),
  generateNvsBtn: document.getElementById("generateNvsBtn"),
  downloadNvsBtn: document.getElementById("downloadNvsBtn"),
  nvsStatusMsg: document.getElementById("nvsStatusMsg"),
  flashSummaryBadge: document.getElementById("flashSummaryBadge"),
  flashMapMaxLabel: document.getElementById("flashMapMaxLabel"),
  flashMapBar: document.getElementById("flashMapBar"),
  flashMapLegend: document.getElementById("flashMapLegend"),
  overlapAlertBox: document.getElementById("overlapAlertBox"),
  chipTypeSelect: document.getElementById("chipTypeSelect"),
  flashSizeSelect: document.getElementById("flashSizeSelect"),
  flashBaudSelect: document.getElementById("flashBaudSelect"),
  eraseAllCheck: document.getElementById("eraseAllCheck"),
  startFlashBtn: document.getElementById("startFlashBtn"),
  eraseFlashBtn: document.getElementById("eraseFlashBtn"),
  flashProgressWrap: document.getElementById("flashProgressWrap"),
  flashProgressFill: document.getElementById("flashProgressFill"),
  flashProgressText: document.getElementById("flashProgressText"),
  toggleMonitorBtn: document.getElementById("toggleMonitorBtn"),
  resetBoardBtn: document.getElementById("resetBoardBtn"),
  diagChipInfo: document.getElementById("diagChipInfo"),
  diagHealthStatus: document.getElementById("diagHealthStatus"),
  diagBanner: document.getElementById("diagBanner"),
  lvlAllBtn: document.getElementById("lvlAllBtn"),
  lvlErrBtn: document.getElementById("lvlErrBtn"),
  lvlWarnBtn: document.getElementById("lvlWarnBtn"),
  lvlInfoBtn: document.getElementById("lvlInfoBtn"),
  saveLogBtn: document.getElementById("saveLogBtn"),
  clearLogBtn: document.getElementById("clearLogBtn"),
  terminalLog: document.getElementById("terminalLog")
};

function log(msg, type = "info") {
  const time = new Date().toLocaleTimeString("vi-VN", { hour12: false });
  const text = `[${time}] ${msg}`;
  state.logHistory.push({ text, type });
  if (state.logHistory.length > 800) state.logHistory.shift();
  renderTerminalLogs();
}

function renderTerminalLogs() {
  if (!els.terminalLog) return;
  els.terminalLog.innerHTML = "";
  const flt = state.logLevelFilter;
  for (const item of state.logHistory) {
    if (flt === "E" && item.type !== "err") continue;
    if (flt === "W" && item.type !== "warn") continue;
    if (flt === "I" && item.type !== "info" && item.type !== "ok") continue;
    const div = document.createElement("div");
    div.className = `log-line ${item.type}`;
    div.textContent = item.text;
    els.terminalLog.appendChild(div);
  }
  els.terminalLog.scrollTop = els.terminalLog.scrollHeight;
}

// ==========================================
// 1. AUTO OFFSET DETECTION & OVERLAP GUARD
// ==========================================

function parseHexOffset(offsetStr) {
  const clean = String(offsetStr || "").trim();
  if (!/^0x[0-9a-fA-F]{1,7}$/.test(clean)) return NaN;
  return parseInt(clean, 16);
}

function autoDetectOffsetFromFilename(filename) {
  const lower = String(filename || "").toLowerCase();
  if (lower.includes("bootloader")) return "0x0";
  if (lower.includes("partition")) return "0x8000";
  if (lower.includes("nvs")) return "0x9000";
  if (lower.includes("ota_data") || lower.includes("otadata")) return "0xd000";
  if (lower.includes("assets") || lower.includes("spiffs") || lower.includes("theme")) return "0x800000";
  if (lower.includes("merged") || lower.includes("full") || lower.includes("factory")) return "0x0";
  return "0x20000";
}

function detectFlashOverlaps(slots, flashSizeBytes) {
  const errors = [];
  const active = [];

  for (const s of slots) {
    if (!s.enabled || !s.bytes || s.bytes.length === 0) continue;
    const addr = parseHexOffset(s.offset);
    if (Number.isNaN(addr) || addr < 0) {
      errors.push(`Khe "${s.name || s.offset}": Địa chỉ Offset "${s.offset}" không hợp lệ.`);
      continue;
    }
    if (addr % FLASH_SECTOR_SIZE !== 0) {
      errors.push(`Khe "${s.name || s.offset}": Offset ${s.offset} phải chia hết cho 4KB (0x1000).`);
    }
    const end = addr + s.bytes.length;
    if (end > flashSizeBytes) {
      errors.push(
        `File "${s.name}" (${Math.round(s.bytes.length / 1024)} KB tại ${s.offset}) vượt quá dung lượng Flash (${Math.round(flashSizeBytes / 1024 / 1024)} MB).`
      );
    }
    active.push({ ...s, start: addr, end });
  }

  active.sort((a, b) => a.start - b.start);
  for (let i = 0; i < active.length - 1; i++) {
    const cur = active[i];
    const nxt = active[i + 1];
    if (cur.end > nxt.start) {
      errors.push(
        `Chồng lấn bộ nhớ Flash: "${cur.name}" (${cur.offset}..0x${cur.end.toString(16)}) đè lên "${nxt.name}" (${nxt.offset})!`
      );
    }
  }
  return { errors, active };
}

// ==========================================
// 2. PURE-JS ESP-IDF NVS BINARY GENERATOR
// ==========================================

const CRC32_TABLE = (() => {
  const tbl = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
    tbl[i] = c >>> 0;
  }
  return tbl;
})();

function crc32EspIdf(bytes, init = 0xffffffff) {
  let crc = init >>> 0;
  for (let i = 0; i < bytes.length; i++) {
    crc = CRC32_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function generateNvsPartitionBinary({ namespace = "wifi", ssid = "", password = "", otaUrl = "", volume = 80, brightness = 85 }) {
  // Tạo phân vùng NVS 16KB (4 trang x 4096 bytes) chuẩn ESP-IDF NVS v2
  const totalBytes = 0x4000;
  const buf = new Uint8Array(totalBytes);
  buf.fill(0xff);
  const view = new DataView(buf.buffer);
  const encoder = new TextEncoder();

  // Page 0 Header (32 bytes)
  view.setUint32(0, 0xfffffffe, true); // Page state: ACTIVE
  view.setUint32(4, 0, true);          // Sequence number: 0
  buf[8] = 0xfe;                       // Version: NVS v2 (0xFE)
  // Header CRC32 covers bytes [4..27]
  const hdrCrc = crc32EspIdf(buf.subarray(4, 28));
  view.setUint32(28, hdrCrc, true);

  let entryIdx = 0;
  function markEntryWritten(idx) {
    // 2 bits per entry in bitmap at [32..63]; WRITTEN = 0b10 (clear bit 0 of the pair)
    const bitOffset = idx * 2;
    const bytePos = 32 + (bitOffset >> 3);
    const shift = bitOffset & 7;
    buf[bytePos] &= ~(1 << shift);
  }

  function writeEntryHeaderAndCrc(entryPos, nsIdx, type, span, chunkIdx, keyStr, data8Bytes) {
    const eOff = 64 + entryPos * 32;
    buf[eOff] = nsIdx;
    buf[eOff + 1] = type;
    buf[eOff + 2] = span;
    buf[eOff + 3] = chunkIdx;
    // Key (16 bytes null-padded)
    const keyBytes = encoder.encode(keyStr.slice(0, 15));
    buf.fill(0x00, eOff + 8, eOff + 24);
    buf.set(keyBytes, eOff + 8);
    // Data (8 bytes)
    buf.set(data8Bytes, eOff + 24);

    // Entry CRC32 covers [0..3] + [8..31] (28 bytes)
    const crcInput = new Uint8Array(28);
    crcInput.set(buf.subarray(eOff, eOff + 4), 0);
    crcInput.set(buf.subarray(eOff + 8, eOff + 32), 4);
    view.setUint32(eOff + 4, crc32EspIdf(crcInput), true);
  }

  function addU8Entry(nsIdx, key, val) {
    const data8 = new Uint8Array(8).fill(0xff);
    data8[0] = val & 0xff;
    markEntryWritten(entryIdx);
    writeEntryHeaderAndCrc(entryIdx, nsIdx, 0x01, 1, 0xff, key, data8);
    entryIdx++;
  }

  function addStringEntry(nsIdx, key, strVal) {
    const strBytes = encoder.encode(strVal);
    const payloadLen = strBytes.length + 1; // null-terminated
    const dataEntries = Math.ceil(payloadLen / 32);
    const span = 1 + dataEntries;

    // Write string payload first so we can compute data CRC32
    const payloadBuf = new Uint8Array(dataEntries * 32).fill(0xff);
    payloadBuf.set(strBytes, 0);
    payloadBuf[strBytes.length] = 0x00;
    const dataCrc = crc32EspIdf(payloadBuf.subarray(0, payloadLen));

    const data8 = new Uint8Array(8).fill(0xff);
    const dView = new DataView(data8.buffer);
    dView.setUint16(0, payloadLen, true);
    dView.setUint32(4, dataCrc, true);

    markEntryWritten(entryIdx);
    writeEntryHeaderAndCrc(entryIdx, nsIdx, 0x21, span, 0xff, key, data8);
    entryIdx++;

    for (let i = 0; i < dataEntries; i++) {
      markEntryWritten(entryIdx);
      const eOff = 64 + entryIdx * 32;
      buf.set(payloadBuf.subarray(i * 32, (i + 1) * 32), eOff);
      entryIdx++;
    }
  }

  // Namespace entry (nsIdx = 0, assigned namespace ID = 1)
  addU8Entry(0, namespace || "wifi", 1);
  if (ssid) addStringEntry(1, "ssid", ssid);
  if (password) addStringEntry(1, "password", password);
  if (otaUrl) addStringEntry(1, "ota_url", otaUrl);
  addU8Entry(1, "volume", Number(volume) || 80);
  addU8Entry(1, "brightness", Number(brightness) || 85);

  return buf;
}

// ==========================================
// 3. UI RENDERING: CATALOG, SLOTS, FLASH MAP
// ==========================================

function switchTab(tabId) {
  state.activeTab = tabId;
  const map = [
    [els.tabBtnCatalog, els.tabCatalog, "tabCatalog"],
    [els.tabBtnSlots, els.tabSlots, "tabSlots"],
    [els.tabBtnNvs, els.tabNvs, "tabNvs"],
    [els.tabBtnDrivers, els.tabDrivers, "tabDrivers"]
  ];
  for (const [btn, pane, id] of map) {
    btn?.classList.toggle("active", id === tabId);
    pane?.classList.toggle("hidden", id !== tabId);
  }
}

function renderCatalog() {
  if (!els.boardCatalogGrid) return;
  els.boardCatalogGrid.innerHTML = "";
  const q = state.searchQuery.trim().toLowerCase();
  const filtered = state.catalog.filter((b) => {
    if (state.chipFilter !== "ALL" && b.chip !== state.chipFilter) return false;
    if (!q) return true;
    const hay = `${b.name} ${b.chip} ${b.screen} ${b.description} ${b.pinout}`.toLowerCase();
    return hay.includes(q);
  });

  for (const b of filtered) {
    const card = document.createElement("div");
    card.className = `board-card ${state.selectedBoardId === b.id ? "active" : ""}`;
    card.innerHTML = `
      <div class="bc-top">
        <span class="bc-chip">${b.chip}</span>
        <span class="bc-badge">${b.badge || `${b.flashSizeMB}MB`}</span>
      </div>
      <div class="bc-title">${b.name}</div>
      <div class="bc-meta">🖥️ ${b.screen} • 💾 ${b.flashSizeMB}MB</div>
    `;
    card.addEventListener("click", () => selectBoard(b.id));
    els.boardCatalogGrid.appendChild(card);
  }
}

function selectBoard(boardId) {
  const board = state.catalog.find((b) => b.id === boardId);
  if (!board) return;
  state.selectedBoardId = board.id;
  state.flashSizeMB = board.flashSizeMB || 16;
  state.chipType = board.chip.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (els.flashSizeSelect) els.flashSizeSelect.value = String(state.flashSizeMB);
  if (els.chipTypeSelect) els.chipTypeSelect.value = state.chipType;

  if (els.sbTitle) els.sbTitle.textContent = board.name;
  if (els.sbFlashBadge) els.sbFlashBadge.textContent = `Flash ${board.flashSizeMB}MB • ${board.psram}`;
  if (els.sbDesc) els.sbDesc.textContent = board.description;
  if (els.sbPinoutText) els.sbPinoutText.textContent = board.pinout;

  syncBoardModeToSlots();
  renderCatalog();
}

function syncBoardModeToSlots() {
  const board = state.catalog.find((b) => b.id === state.selectedBoardId) || FALLBACK_CATALOG[0];
  const mode = els.presetFlashModeSelect?.value || "app_only";
  els.presetAssetsRow?.classList.toggle("hidden", mode !== "app_and_assets");

  const mainSlot = state.slots[0] || { id: 1, enabled: true, name: "", bytes: null };
  if (mode === "full_merged") {
    mainSlot.preset = "0x0";
    mainSlot.offset = "0x0";
  } else {
    mainSlot.preset = board.defaultAppOffset || "0x20000";
    mainSlot.offset = board.defaultAppOffset || "0x20000";
  }
  state.slots[0] = mainSlot;
  renderSlotsTable();
  updateFlashMapAndCli();
}

function renderSlotsTable() {
  if (!els.slotTableBody) return;
  els.slotTableBody.innerHTML = "";

  state.slots.forEach((slot, idx) => {
    const tr = document.createElement("tr");

    const optionsHtml = PARTITION_PRESETS.map(
      (p) => `<option value="${p.offset}" ${slot.preset === p.offset ? "selected" : ""}>${p.label}</option>`
    ).join("");

    const sizeText = slot.bytes ? `${(slot.bytes.length / 1024).toFixed(1)} KB` : "Chưa chọn";
    const fileLabel = slot.name || "📂 Chọn file .bin...";

    tr.innerHTML = `
      <td><input type="checkbox" class="slot-enable" ${slot.enabled ? "checked" : ""} /></td>
      <td><select class="slot-preset">${optionsHtml}</select></td>
      <td><input type="text" class="slot-offset" value="${slot.offset}" /></td>
      <td>
        <label class="slot-file-label ${slot.bytes ? "has-file" : ""}">
          <span>${fileLabel}</span>
          <input type="file" class="slot-file" accept=".bin" hidden />
        </label>
      </td>
      <td><code>${sizeText}</code></td>
      <td>
        ${state.slots.length > 1 ? `<button type="button" class="btn btn-sm btn-secondary slot-del" title="Xóa dòng này">✕</button>` : ""}
      </td>
    `;

    tr.querySelector(".slot-enable").addEventListener("change", (e) => {
      slot.enabled = e.target.checked;
      updateFlashMapAndCli();
    });

    tr.querySelector(".slot-preset").addEventListener("change", (e) => {
      slot.preset = e.target.value;
      if (e.target.value !== "custom") {
        slot.offset = e.target.value;
        tr.querySelector(".slot-offset").value = slot.offset;
      }
      updateFlashMapAndCli();
    });

    tr.querySelector(".slot-offset").addEventListener("input", (e) => {
      slot.offset = e.target.value.trim();
      slot.preset = "custom";
      updateFlashMapAndCli();
    });

    tr.querySelector(".slot-file").addEventListener("change", async (e) => {
      const f = e.target.files?.[0];
      if (!f) return;
      await assignFileToSlot(idx, f, false);
    });

    const delBtn = tr.querySelector(".slot-del");
    if (delBtn) {
      delBtn.addEventListener("click", () => {
        state.slots.splice(idx, 1);
        renderSlotsTable();
        updateFlashMapAndCli();
      });
    }

    els.slotTableBody.appendChild(tr);
  });
}

async function assignFileToSlot(slotIdx, file, autoOffset = false) {
  if (file.size > MAX_BIN_FILE_BYTES) {
    log(`File "${file.name}" vượt quá giới hạn 16 MB!`, "err");
    return;
  }
  const bytes = new Uint8Array(await file.arrayBuffer());
  const slot = state.slots[slotIdx];
  if (!slot) return;
  slot.name = file.name;
  slot.bytes = bytes;
  slot.enabled = true;
  if (autoOffset) {
    const guessed = autoDetectOffsetFromFilename(file.name);
    slot.offset = guessed;
    slot.preset = guessed;
  }
  if (slotIdx === 0 && els.presetFwFileName) {
    els.presetFwFileName.textContent = `${file.name} (${(bytes.length / 1024).toFixed(1)} KB)`;
  }
  log(`Đã nạp file "${file.name}" (${(bytes.length / 1024).toFixed(1)} KB) vào Offset ${slot.offset}.`, "ok");
  renderSlotsTable();
  updateFlashMapAndCli();
}

function updateFlashMapAndCli() {
  const flashSizeBytes = state.flashSizeMB * 1024 * 1024;
  if (els.flashMapMaxLabel) {
    els.flashMapMaxLabel.textContent = `${state.flashSizeMB} MB (0x${flashSizeBytes.toString(16).toUpperCase()})`;
  }

  const { errors, active } = detectFlashOverlaps(state.slots, flashSizeBytes);

  if (els.flashSummaryBadge) {
    const totalKB = active.reduce((acc, s) => acc + s.bytes.length, 0) / 1024;
    els.flashSummaryBadge.textContent = `${active.length} file • ${totalKB.toFixed(1)} KB`;
  }

  if (els.overlapAlertBox) {
    if (errors.length > 0) {
      els.overlapAlertBox.textContent = `⚠️ ${errors.join(" | ")}`;
      els.overlapAlertBox.classList.remove("hidden");
    } else {
      els.overlapAlertBox.classList.add("hidden");
    }
  }

  if (els.flashMapBar && els.flashMapLegend) {
    els.flashMapBar.innerHTML = "";
    els.flashMapLegend.innerHTML = "";
    const palette = ["#3b82f6", "#10b981", "#a855f7", "#f59e0b", "#06b6d4", "#ec4899"];
    active.forEach((seg, i) => {
      const color = palette[i % palette.length];
      const leftPct = Math.max(0, Math.min(99, (seg.start / flashSizeBytes) * 100));
      const widthPct = Math.max(1.5, Math.min(100 - leftPct, ((seg.end - seg.start) / flashSizeBytes) * 100));

      const div = document.createElement("div");
      div.className = "flash-seg";
      div.style.left = `${leftPct}%`;
      div.style.width = `${widthPct}%`;
      div.style.backgroundColor = color;
      div.title = `${seg.name} @ ${seg.offset} (${(seg.bytes.length / 1024).toFixed(1)} KB)`;
      els.flashMapBar.appendChild(div);

      const leg = document.createElement("span");
      leg.className = "legend-item";
      leg.innerHTML = `<i class="legend-dot" style="background:${color}"></i><span>${seg.offset}: ${seg.name}</span>`;
      els.flashMapLegend.appendChild(leg);
    });
  }

  if (els.cliCommandPreview) {
    const parts = active.length
      ? active.map((s) => `${s.offset} "${s.name}"`).join(" ")
      : "0x20000 firmware.bin";
    els.cliCommandPreview.textContent = `esptool.py --chip ${state.chipType} --baud ${state.baudRate} write_flash ${parts}`;
  }
}

// ==========================================
// 4. WEBSERIAL FLASHING & LIVE MONITOR
// ==========================================

let activePort = null;
let activeTransport = null;
let monitorReader = null;
let isMonitoring = false;

async function releaseSerialPort() {
  isMonitoring = false;
  if (monitorReader) {
    try { await monitorReader.cancel(); } catch (_) {}
    try { monitorReader.releaseLock(); } catch (_) {}
    monitorReader = null;
  }
  if (activeTransport) {
    try { await activeTransport.disconnect(); } catch (_) {}
    if (typeof activeTransport.waitForUnlock === "function") {
      try { await activeTransport.waitForUnlock(1200); } catch (_) {}
    }
    activeTransport = null;
  }
  if (activePort) {
    try {
      if (activePort.readable || activePort.writable) await activePort.close();
    } catch (_) {}
    activePort = null;
  }
  if (els.toggleMonitorBtn) els.toggleMonitorBtn.textContent = "🖥️ Mở Monitor";
  if (els.resetBoardBtn) els.resetBoardBtn.disabled = true;
}

function uint8ToBinaryString(u8) {
  const CHUNK = 0x8000;
  let str = "";
  for (let i = 0; i < u8.length; i += CHUNK) {
    str += String.fromCharCode.apply(null, u8.subarray(i, i + CHUNK));
  }
  return str;
}

async function flashAllActiveSlots() {
  if (!("serial" in navigator)) {
    alert("Trình duyệt không hỗ trợ WebSerial! Hãy mở bằng Chrome hoặc Edge trên máy tính.");
    return;
  }

  const flashSizeBytes = state.flashSizeMB * 1024 * 1024;
  const { errors, active } = detectFlashOverlaps(state.slots, flashSizeBytes);
  if (errors.length > 0) {
    alert(`Không thể nạp do lỗi cấu hình phân vùng:\n- ${errors.join("\n- ")}`);
    return;
  }
  if (active.length === 0) {
    alert("Vui lòng chọn ít nhất 1 file .bin để nạp!");
    return;
  }

  await releaseSerialPort();
  try {
    els.startFlashBtn.disabled = true;
    els.eraseFlashBtn.disabled = true;

    activePort = await navigator.serial.requestPort();
    const { ESPLoader, Transport } = await import("../theme-studio/vendor/esptool-js.bundle.js");
    activeTransport = new Transport(activePort, true);

    const terminal = {
      clean: () => {},
      writeLine: (d) => log(d, "info"),
      write: (d) => { if (d && d.trim()) log(d.trim(), "info"); }
    };

    const esploader = new ESPLoader({
      transport: activeTransport,
      baudrate: state.baudRate,
      terminal
    });

    log("Đang kết nối tới ESP32...", "info");
    const chip = await esploader.main();
    log(`Đã kết nối thành công: ${chip}`, "ok");
    if (els.diagChipInfo) els.diagChipInfo.textContent = chip;

    els.flashProgressWrap.classList.remove("hidden");
    els.flashProgressFill.style.width = "0%";
    els.flashProgressText.textContent = "0%";

    const fileArray = active.map((slot) => {
      const paddedLen = Math.ceil(slot.bytes.length / 4) * 4;
      let flashBytes = slot.bytes;
      if (paddedLen !== slot.bytes.length) {
        flashBytes = new Uint8Array(paddedLen);
        flashBytes.fill(0xff);
        flashBytes.set(slot.bytes);
      }
      return {
        data: uint8ToBinaryString(flashBytes),
        address: slot.start
      };
    });

    await esploader.writeFlash({
      fileArray,
      flashSize: "keep",
      eraseAll: state.eraseAll,
      compress: true,
      reportProgress: (fileIndex, written, total) => {
        const pct = Math.min(100, Math.round((written / total) * 100));
        els.flashProgressFill.style.width = `${pct}%`;
        els.flashProgressText.textContent = `File ${fileIndex + 1}/${fileArray.length}: ${pct}%`;
      }
    });

    log("Ghi Firmware thành công! Đang khởi động lại mạch (Hard Reset)...", "ok");
    await activeTransport.setDTR(false);
    await new Promise((r) => setTimeout(r, 100));
    await activeTransport.setRTS(true);
    await new Promise((r) => setTimeout(r, 100));
    await activeTransport.setRTS(false);
    log("🎉 HOÀN TẤT NẠP FIRMWARE! Bạn có thể bấm 'Mở Monitor' để xem log khởi động.", "ok");
  } catch (err) {
    log(`Lỗi nạp Firmware: ${err.message || err}`, "err");
  } finally {
    await releaseSerialPort();
    els.startFlashBtn.disabled = false;
    els.eraseFlashBtn.disabled = false;
  }
}

async function eraseEntireChipFlash() {
  if (!("serial" in navigator)) {
    alert("Trình duyệt không hỗ trợ WebSerial!");
    return;
  }
  if (!confirm("⚠️ CẢNH BÁO: Thao tác này sẽ XÓA TRẮNG toàn bộ bộ nhớ Flash của mạch ESP32 (bao gồm Firmware, WiFi và Theme). Bạn có chắc chắn muốn tiếp tục?")) {
    return;
  }

  await releaseSerialPort();
  try {
    els.startFlashBtn.disabled = true;
    els.eraseFlashBtn.disabled = true;
    activePort = await navigator.serial.requestPort();
    const { ESPLoader, Transport } = await import("../theme-studio/vendor/esptool-js.bundle.js");
    activeTransport = new Transport(activePort, true);
    const esploader = new ESPLoader({
      transport: activeTransport,
      baudrate: state.baudRate,
      terminal: { clean: () => {}, writeLine: (d) => log(d, "info"), write: () => {} }
    });
    log("Đang kết nối để xóa trắng Flash...", "warn");
    const chip = await esploader.main();
    if (els.diagChipInfo) els.diagChipInfo.textContent = chip;
    log("Đang thực hiện Erase Flash (vui lòng đợi 10–25 giây)...", "warn");
    await esploader.eraseFlash();
    log("✅ Đã xóa trắng toàn bộ Flash thành công! Hãy nạp lại gói Full Merged .bin từ 0x0.", "ok");
  } catch (err) {
    log(`Lỗi xóa Flash: ${err.message || err}`, "err");
  } finally {
    await releaseSerialPort();
    els.startFlashBtn.disabled = false;
    els.eraseFlashBtn.disabled = false;
  }
}

function inspectLogForDiagnostics(line) {
  const lower = line.toLowerCase();
  let bannerMsg = "";
  if (lower.includes("brownout detector")) {
    bannerMsg = "⚡ Phát hiện sụt áp nguồn (Brownout)! Hãy đổi cáp Type-C khác hoặc cắm vào cổng USB sau máy tính.";
  } else if (lower.includes("psram") && (lower.includes("fail") || lower.includes("not found"))) {
    bannerMsg = "⚠️ Lỗi PSRAM: Mạch không nhận PSRAM hoặc nạp sai chế độ Octal/Quad PSRAM.";
  } else if (lower.includes("invalid header") || lower.includes("no bootable app")) {
    bannerMsg = "🚫 Mạch chưa có Bootloader / Partition Table hợp lệ! Hãy nạp bản Full Merged .bin tại địa chỉ 0x0.";
  } else if (lower.includes("wifi") && lower.includes("connected")) {
    if (els.diagHealthStatus) els.diagHealthStatus.textContent = "Đã kết nối WiFi ✅";
  }
  if (bannerMsg && els.diagBanner) {
    els.diagBanner.textContent = bannerMsg;
    els.diagBanner.classList.remove("hidden");
  }
}

async function toggleSerialMonitor() {
  if (isMonitoring) {
    await releaseSerialPort();
    log("Đã ngắt kết nối Serial Monitor.", "info");
    return;
  }
  if (!("serial" in navigator)) {
    alert("Trình duyệt không hỗ trợ WebSerial!");
    return;
  }
  await releaseSerialPort();
  try {
    activePort = await navigator.serial.requestPort();
    await activePort.open({ baudRate: 115200 });
    isMonitoring = true;
    els.toggleMonitorBtn.textContent = "⏹️ Ngắt Monitor";
    els.resetBoardBtn.disabled = false;
    if (els.diagHealthStatus) els.diagHealthStatus.textContent = "Đang đọc log (115200)";
    log("Đã mở Serial Monitor (115200 bps)...", "ok");

    const decoder = new TextDecoder();
    monitorReader = activePort.readable.getReader();
    let buffer = "";
    while (isMonitoring) {
      const { value, done } = await monitorReader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split(/\r?\n/);
      buffer = lines.pop() || "";
      for (const ln of lines) {
        const clean = ln.replace(/\x1b\[[0-9;]*m/g, "").trim();
        if (!clean) continue;
        let lvl = "info";
        if (/^E\s*\(|error|fail|panic|guru meditation/i.test(clean)) lvl = "err";
        else if (/^W\s*\(|warn/i.test(clean)) lvl = "warn";
        inspectLogForDiagnostics(clean);
        log(clean, lvl);
      }
    }
  } catch (err) {
    if (isMonitoring) log(`Monitor dừng: ${err.message || err}`, "err");
  } finally {
    await releaseSerialPort();
  }
}

// ==========================================
// 5. INITIALIZATION & EVENT LISTENERS
// ==========================================

async function init() {
  try {
    const res = await fetch("catalog.json", { cache: "no-store" });
    state.catalog = res.ok ? await res.json() : FALLBACK_CATALOG;
  } catch (_) {
    state.catalog = FALLBACK_CATALOG;
  }
  state.selectedBoardId = state.catalog[0]?.id || "";

  // Tabs
  [els.tabBtnCatalog, els.tabBtnSlots, els.tabBtnNvs, els.tabBtnDrivers].forEach((btn) => {
    btn?.addEventListener("click", () => switchTab(btn.dataset.tab));
  });

  // Catalog filters
  els.boardSearchInput?.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    renderCatalog();
  });
  els.chipFilterSelect?.addEventListener("change", (e) => {
    state.chipFilter = e.target.value;
    renderCatalog();
  });

  els.presetFlashModeSelect?.addEventListener("change", syncBoardModeToSlots);

  els.presetFirmwareFileInput?.addEventListener("change", async (e) => {
    const f = e.target.files?.[0];
    if (f) await assignFileToSlot(0, f, false);
  });

  els.presetAssetsFileInput?.addEventListener("change", async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const board = state.catalog.find((b) => b.id === state.selectedBoardId) || FALLBACK_CATALOG[0];
    const assetsOff = board.defaultAssetsOffset || "0x800000";
    let idx = state.slots.findIndex((s) => s.offset === assetsOff);
    if (idx === -1) {
      state.slots.push({ id: state.nextSlotId++, enabled: true, preset: assetsOff, offset: assetsOff, name: "", bytes: null });
      idx = state.slots.length - 1;
    }
    if (els.presetAssetsFileName) els.presetAssetsFileName.textContent = f.name;
    await assignFileToSlot(idx, f, false);
  });

  // Multi-slot controls
  els.addSlotBtn?.addEventListener("click", () => {
    if (state.slots.length >= 6) return;
    state.slots.push({ id: state.nextSlotId++, enabled: true, preset: "0x800000", offset: "0x800000", name: "", bytes: null });
    renderSlotsTable();
    updateFlashMapAndCli();
  });

  els.loadStandardLayoutBtn?.addEventListener("click", () => {
    state.slots = [
      { id: state.nextSlotId++, enabled: true, preset: "0x0", offset: "0x0", name: "", bytes: null },
      { id: state.nextSlotId++, enabled: true, preset: "0x8000", offset: "0x8000", name: "", bytes: null },
      { id: state.nextSlotId++, enabled: true, preset: "0xd000", offset: "0xd000", name: "", bytes: null },
      { id: state.nextSlotId++, enabled: true, preset: "0x20000", offset: "0x20000", name: "", bytes: null },
      { id: state.nextSlotId++, enabled: true, preset: "0x800000", offset: "0x800000", name: "", bytes: null }
    ];
    renderSlotsTable();
    updateFlashMapAndCli();
  });

  els.clearSlotsBtn?.addEventListener("click", () => {
    state.slots = [{ id: state.nextSlotId++, enabled: true, preset: "0x20000", offset: "0x20000", name: "", bytes: null }];
    renderSlotsTable();
    updateFlashMapAndCli();
  });

  const handleMultiBinFiles = async (fileList) => {
    for (const file of fileList) {
      const guessed = autoDetectOffsetFromFilename(file.name);
      let idx = state.slots.findIndex((s) => !s.bytes || s.offset === guessed);
      if (idx === -1 && state.slots.length < 6) {
        state.slots.push({ id: state.nextSlotId++, enabled: true, preset: guessed, offset: guessed, name: "", bytes: null });
        idx = state.slots.length - 1;
      }
      if (idx >= 0) await assignFileToSlot(idx, file, true);
    }
  };

  els.multiBinDropZone?.addEventListener("click", () => els.multiBinInput?.click());
  els.multiBinInput?.addEventListener("change", (e) => {
    if (e.target.files?.length) handleMultiBinFiles(e.target.files);
  });
  els.multiBinDropZone?.addEventListener("dragover", (e) => {
    e.preventDefault();
    els.multiBinDropZone.classList.add("dragover");
  });
  els.multiBinDropZone?.addEventListener("dragleave", () => els.multiBinDropZone.classList.remove("dragover"));
  els.multiBinDropZone?.addEventListener("drop", (e) => {
    e.preventDefault();
    els.multiBinDropZone.classList.remove("dragover");
    if (e.dataTransfer.files?.length) handleMultiBinFiles(e.dataTransfer.files);
  });

  els.copyCliBtn?.addEventListener("click", () => {
    navigator.clipboard?.writeText(els.cliCommandPreview.textContent || "");
    log("Đã sao chép câu lệnh esptool.py vào Clipboard!", "ok");
  });

  // NVS Generator
  els.nvsVolumeRange?.addEventListener("input", (e) => {
    if (els.nvsVolumeVal) els.nvsVolumeVal.textContent = `${e.target.value}%`;
  });
  els.nvsBrightnessRange?.addEventListener("input", (e) => {
    if (els.nvsBrightnessVal) els.nvsBrightnessVal.textContent = `${e.target.value}%`;
  });

  const buildCurrentNvsBytes = () =>
    generateNvsPartitionBinary({
      namespace: els.nvsNamespaceInput?.value.trim() || "wifi",
      ssid: els.nvsWifiSsid?.value.trim() || "",
      password: els.nvsWifiPass?.value || "",
      otaUrl: els.nvsServerUrl?.value.trim() || "",
      volume: parseInt(els.nvsVolumeRange?.value || "80", 10),
      brightness: parseInt(els.nvsBrightnessRange?.value || "85", 10)
    });

  els.generateNvsBtn?.addEventListener("click", () => {
    const bytes = buildCurrentNvsBytes();
    let idx = state.slots.findIndex((s) => s.offset.toLowerCase() === "0x9000");
    if (idx === -1) {
      state.slots.push({ id: state.nextSlotId++, enabled: true, preset: "0x9000", offset: "0x9000", name: "nvs_wifi_config.bin", bytes });
    } else {
      state.slots[idx].name = "nvs_wifi_config.bin";
      state.slots[idx].bytes = bytes;
      state.slots[idx].enabled = true;
    }
    if (els.nvsStatusMsg) {
      els.nvsStatusMsg.textContent = "✅ Đã tạo gói nvs_wifi_config.bin (16 KB) và gắn tự động vào khe nạp 0x9000!";
      els.nvsStatusMsg.classList.remove("hidden");
    }
    log("Đã tạo phân vùng NVS (16 KB) và gắn vào Offset 0x9000.", "ok");
    renderSlotsTable();
    updateFlashMapAndCli();
  });

  els.downloadNvsBtn?.addEventListener("click", () => {
    const bytes = buildCurrentNvsBytes();
    const url = URL.createObjectURL(new Blob([bytes], { type: "application/octet-stream" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "nvs_wifi_config_0x9000.bin";
    a.click();
    URL.revokeObjectURL(url);
    log("Đã tải xuống file nvs_wifi_config_0x9000.bin (16 KB).", "ok");
  });

  // Right panel settings
  els.chipTypeSelect?.addEventListener("change", (e) => {
    state.chipType = e.target.value;
    updateFlashMapAndCli();
  });
  els.flashSizeSelect?.addEventListener("change", (e) => {
    state.flashSizeMB = parseInt(e.target.value, 10) || 16;
    updateFlashMapAndCli();
  });
  els.flashBaudSelect?.addEventListener("change", (e) => {
    state.baudRate = parseInt(e.target.value, 10) || 460800;
    updateFlashMapAndCli();
  });
  els.eraseAllCheck?.addEventListener("change", (e) => {
    state.eraseAll = e.target.checked;
  });

  els.startFlashBtn?.addEventListener("click", flashAllActiveSlots);
  els.eraseFlashBtn?.addEventListener("click", eraseEntireChipFlash);
  els.toggleMonitorBtn?.addEventListener("click", toggleSerialMonitor);

  els.resetBoardBtn?.addEventListener("click", async () => {
    if (!activePort) return;
    try {
      await activePort.setSignals({ dataTerminalReady: false, requestToSend: true });
      await new Promise((r) => setTimeout(r, 120));
      await activePort.setSignals({ dataTerminalReady: false, requestToSend: false });
      log("Đã gửi tín hiệu Reset mạch (RTS).", "info");
    } catch (err) {
      log(`Không thể Reset mạch: ${err.message}`, "err");
    }
  });

  [els.lvlAllBtn, els.lvlErrBtn, els.lvlWarnBtn, els.lvlInfoBtn].forEach((btn) => {
    btn?.addEventListener("click", () => {
      state.logLevelFilter = btn.dataset.level || "ALL";
      [els.lvlAllBtn, els.lvlErrBtn, els.lvlWarnBtn, els.lvlInfoBtn].forEach((b) =>
        b?.classList.toggle("active", b === btn)
      );
      renderTerminalLogs();
    });
  });

  els.clearLogBtn?.addEventListener("click", () => {
    state.logHistory = [];
    if (els.diagBanner) els.diagBanner.classList.add("hidden");
    renderTerminalLogs();
  });

  els.saveLogBtn?.addEventListener("click", () => {
    const content = state.logHistory.map((l) => l.text).join("\n");
    const url = URL.createObjectURL(new Blob([content], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = `xiaozhi_serial_log_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  });

  selectBoard(state.selectedBoardId);
}

init();
