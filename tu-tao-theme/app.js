const CDN_BASE = "https://cdn.jsdelivr.net/gh/78/xiaozhi-assets-generator@main/web/public/static";
const LOCAL_PRESETS_BASE = "../theme-studio/presets";
const STORAGE_KEY = "chuhieu_tu_tao_theme_draft_v1";
const PARTITION_MAX_BYTES = 6656 * 1024; // 6.5 MB chuẩn phổ biến trên ESP32-S3 Xiaozhi (hiển thị cảnh báo nếu vượt)

const STANDARD_SCREENS = [
  { w: 240, h: 240, label: "240×240 Vuông", sub: "TFT 1.3″ / 1.54″ ST7789, Tròn 1.28″ GC9A01, màn nhỏ 1.54″" },
  { w: 240, h: 320, label: "240×320 Dọc", sub: "TFT 2.0″ / 2.4″ / 2.8″ / 3.2″ ILI9341/ST7789 dựng đứng" },
  { w: 320, h: 240, label: "320×240 Ngang", sub: "TFT 2.0″–3.2″ nằm ngang, ESP32-S3-BOX-3, CoreS3" },
  { w: 320, h: 480, label: "320×480 Dọc", sub: "TFT 3.5″ ILI9488, 3.5″ / 4.0″ ST7796 dựng đứng" },
  { w: 480, h: 320, label: "480×320 Ngang", sub: "TFT 3.5″ / 4.0″ nằm ngang (ILI9488 · ST7796)" }
];

const EXTRA_SCREENS = [
  { w: 240, h: 280, label: "240×280 (1.69″ dọc)" },
  { w: 280, h: 240, label: "280×240 (1.69″ ngang)" },
  { w: 172, h: 320, label: "172×320 (1.47″)" },
  { w: 135, h: 240, label: "135×240 (1.14″ dọc)" },
  { w: 240, h: 135, label: "240×135 (1.14″ ngang)" },
  { w: 128, h: 160, label: "128×160 (1.8″ ST7735)" },
  { w: 128, h: 128, label: "128×128 (1.44″ ST7735)" },
  { w: 360, h: 360, label: "360×360 (1.85″ tròn)" },
  { w: 466, h: 466, label: "466×466 (1.43″ AMOLED)" },
  { w: 368, h: 448, label: "368×448 (1.8″ AMOLED)" },
  { w: 480, h: 480, label: "480×480 (4.0″ / 2.1″ tròn)" },
  { w: 800, h: 480, label: "800×480 (4.3″–7″ RGB)" }
];

const CHIPS = [
  { id: "esp32s3", label: "ESP32-S3 (phổ biến nhất)" },
  { id: "esp32c3", label: "ESP32-C3" },
  { id: "esp32c6", label: "ESP32-C6" },
  { id: "esp32p4", label: "ESP32-P4" }
];

const WAKE_WORDS = [
  { id: "wn9_hitelly_tts", label: "Hi Telly (mặc định)" },
  { id: "wn9_hiesp", label: "Hi ESP" },
  { id: "wn9_alexa", label: "Alexa" },
  { id: "wn9_jarvis_tts", label: "Jarvis" },
  { id: "wn9_computer_tts", label: "Computer" },
  { id: "wn9_hijason_tts2", label: "Hi Jason" },
  { id: "wn9_sophia_tts", label: "Sophia" },
  { id: "wn9_hijoy_tts", label: "Hi Joy" },
  { id: "wn9_hilili_tts", label: "Hi Lily" },
  { id: "wn9_hiwalle_tts2", label: "Hi Wall-E" },
  { id: "wn9_hiandy_tts2", label: "Hi Andy" },
  { id: "wn9_hijolly_tts2", label: "Hi Jolly" },
  { id: "wn9_heywillow_tts", label: "Hey Willow" },
  { id: "wn9_heywanda_tts", label: "Hey Wanda" },
  { id: "wn9_heyivy_tts2", label: "Hey Ivy" },
  { id: "wn9_heyily_tts2", label: "Hey Ily" },
  { id: "wn9_heykira_tts3", label: "Hey Kira" },
  { id: "wn9_mycroft_tts", label: "Mycroft" },
  { id: "wn9_nihaoxiaozhi_tts", label: "Nǐ hǎo Xiǎozhì" },
  { id: "wn9_hilexin", label: "Hi Lexin" },
  { id: "wn9_xiaoaitongxue", label: "Xiao Ai" }
];

const FONT_PRESETS = [
  { id: "font_noto_qwen_14_1.bin", label: "Nhỏ 14px", sub: "Nét mảnh, nhẹ nhất · 626 KB", sizePx: 14, estBytes: 641000, url: `${CDN_BASE}/fonts/font_noto_qwen_14_1.bin` },
  { id: "font_noto_sans_common_20_4.bin", label: "Chuẩn Shop 20px", sub: "Tải nội bộ siêu nhanh · 1,2 MB", sizePx: 20, estBytes: 1287460, url: `${LOCAL_PRESETS_BASE}/font_noto_sans_common_20_4.bin` },
  { id: "font_noto_qwen_16_4.bin", label: "Vừa 16px (Noto)", sub: "Hợp màn 1.54″–2.4″ · 2,0 MB", sizePx: 16, estBytes: 2051896, url: `${CDN_BASE}/fonts/font_noto_qwen_16_4.bin` },
  { id: "font_noto_qwen_20_4.bin", label: "To 20px (Noto)", sub: "Hợp màn 2.8″ trở lên · 2,9 MB", sizePx: 20, estBytes: 2950000, url: `${CDN_BASE}/fonts/font_noto_qwen_20_4.bin` },
  { id: "font_noto_qwen_30_4.bin", label: "Rất to 30px (Noto)", sub: "Màn lớn, file nặng · 5,8 MB", sizePx: 30, estBytes: 5850000, url: `${CDN_BASE}/fonts/font_noto_qwen_30_4.bin` }
];

const BUILTIN_EMOTION_PACKS = [
  { id: "twemoji64", label: "Twemoji 64px", sub: "PNG tĩnh sắc nét · ~57 KB", ext: "png", estBytes: 60000, size: 64, baseUrl: `${CDN_BASE}/emojis/twemoji64` },
  { id: "twemoji32", label: "Twemoji 32px", sub: "PNG tĩnh siêu nhẹ · ~28 KB", ext: "png", estBytes: 30000, size: 32, baseUrl: `${CDN_BASE}/emojis/twemoji32` },
  { id: "noto-emoji_64", label: "Noto động 64px", sub: "GIF động mượt · ~1,5 MB", ext: "gif", estBytes: 1550000, size: 64, baseUrl: `${CDN_BASE}/emojis/noto-emoji_64` },
  { id: "noto-emoji_128", label: "Noto động 128px", sub: "GIF động nét cao · ~4,5 MB", ext: "gif", estBytes: 4600000, size: 128, baseUrl: `${CDN_BASE}/emojis/noto-emoji_128` }
];

const SHOP_EMOTION_PACKS = [
  { id: "mat_cyber_320", label: "Mắt Cyber", hasBg: true, estBytes: 2470000, badge: "✨ Mới · Có nền" },
  { id: "mat_mau_plus_320", label: "Mắt Màu Plus", hasBg: true, estBytes: 2740000, badge: "✨ Mới · Có nền" },
  { id: "mat_robot_pro_320", label: "Mắt Robot Pro", hasBg: true, estBytes: 1490000, badge: "✨ Mới · Có nền" },
  { id: "mochi_cau_vong_320", label: "Mochi Cầu Vồng", hasBg: true, estBytes: 2120000, badge: "✨ Mới · Có nền" },
  { id: "mochi_doi_mau_320", label: "Mochi Đổi Màu", hasBg: true, estBytes: 2000000, badge: "✨ Mới · Có nền" },
  { id: "mochi_neon_320", label: "Mochi Neon", hasBg: true, estBytes: 2170000, badge: "✨ Mới · Có nền" },
  { id: "mochi_nhieu_mau_320", label: "Mochi Nhiều Màu", hasBg: true, estBytes: 2140000, badge: "✨ Mới · Có nền" },
  { id: "robot_cyan", label: "Mắt Robot Cyan" },
  { id: "robot_amber", label: "Mắt Robot Amber" },
  { id: "robot_purple", label: "Mắt Robot Tím" },
  { id: "robot_eve", label: "Mắt Eve" },
  { id: "robot_kawaii", label: "Mắt Kawaii" },
  { id: "robot_cyber_glitch", label: "Mắt Cyber Glitch" },
  { id: "robot_matrix", label: "Mắt Matrix" },
  { id: "robot_jarvis_hud", label: "Mắt Jarvis HUD" },
  { id: "robot_mecha", label: "Mắt Mecha" },
  { id: "robot_neko", label: "Mắt Neko" },
  { id: "robot_visor", label: "Mắt Visor" },
  { id: "robot_dotmatrix", label: "Mắt Dot Matrix" },
  { id: "robot_astro_3d", label: "Mắt Astro 3D" },
  { id: "robot_pixel_pet", label: "Mắt Pixel Pet" },
  { id: "robot_white_hands", label: "Robot White Hands" },
  { id: "dasai_mochi", label: "Dasai Mochi" },
  { id: "doi_mat", label: "Đôi Mắt" },
  { id: "light_natra", label: "Na Tra 3D" },
  { id: "light_baymax", label: "Baymax" },
  { id: "shiba", label: "Cún Shiba" },
  { id: "shadow_ninja", label: "Ninja Bóng Đêm" },
  { id: "otto_robot", label: "Otto Robot" },
  { id: "stackchan_cyan", label: "Stack-chan Cyan" },
  { id: "ai_minimalist", label: "AI Minimalist" },
  { id: "pixel_retro", label: "Pixel Retro" },
  { id: "doomguy", label: "Doomguy" },
  { id: "light_cute", label: "Cute Sáng" },
  { id: "light_cute_faces", label: "Cute Faces" },
  { id: "anime_chibi", label: "Anime Chibi" },
  { id: "anime_chelsea", label: "Anime Chelsea" },
  { id: "anime_chelsea_doc", label: "Anime Chelsea Dọc" },
  { id: "anime_female1", label: "Anime Female" },
  { id: "anime_df", label: "Anime DF" }
];

const EMOTIONS = [
  { id: "neutral", num: "01", vi: "Trung lập", icon: "😐", aliases: ["trunglap", "normal", "idle", "default"] },
  { id: "happy", num: "02", vi: "Vui vẻ", icon: "😊", aliases: ["vuive", "vui", "smile"] },
  { id: "laughing", num: "03", vi: "Cười lớn", icon: "😆", aliases: ["cuoilon", "cuoi", "laugh"] },
  { id: "funny", num: "04", vi: "Hài hước", icon: "😜", aliases: ["haihuoc", "fun"] },
  { id: "sad", num: "05", vi: "Buồn", icon: "😢", aliases: ["buon"] },
  { id: "angry", num: "06", vi: "Giận dữ", icon: "😠", aliases: ["giandu", "gian", "mad"] },
  { id: "crying", num: "07", vi: "Khóc", icon: "😭", aliases: ["khoc", "cry"] },
  { id: "loving", num: "08", vi: "Yêu thương", icon: "😍", aliases: ["yeuthuong", "love", "heart"] },
  { id: "embarrassed", num: "09", vi: "Xấu hổ", icon: "😳", aliases: ["xauho", "shy"] },
  { id: "surprised", num: "10", vi: "Bất ngờ", icon: "😮", aliases: ["batngo", "surprise"] },
  { id: "shocked", num: "11", vi: "Sốc", icon: "😱", aliases: ["soc", "shock"] },
  { id: "thinking", num: "12", vi: "Suy nghĩ", icon: "🤔", aliases: ["suynghi", "think"] },
  { id: "winking", num: "13", vi: "Nháy mắt", icon: "😉", aliases: ["nhaymat", "wink"] },
  { id: "cool", num: "14", vi: "Ngầu", icon: "😎", aliases: ["ngau"] },
  { id: "relaxed", num: "15", vi: "Thoải mái", icon: "😌", aliases: ["thoaimai", "relax"] },
  { id: "delicious", num: "16", vi: "Ngon miệng", icon: "😋", aliases: ["ngonmieng", "yummy"] },
  { id: "kissy", num: "17", vi: "Hôn", icon: "😘", aliases: ["hon", "kiss"] },
  { id: "confident", num: "18", vi: "Tự tin", icon: "😏", aliases: ["tutin"] },
  { id: "sleepy", num: "19", vi: "Buồn ngủ", icon: "😴", aliases: ["buonngu", "sleep"] },
  { id: "silly", num: "20", vi: "Ngớ ngẩn", icon: "🤪", aliases: ["ngongan"] },
  { id: "confused", num: "21", vi: "Bối rối", icon: "😕", aliases: ["boiroi", "confuse"] }
];

const BG_GRADIENT_PRESETS = [
  { id: "none", label: "Màu trơn", css: "linear-gradient(135deg,#1e293b,#0f172a)", stops: null },
  { id: "midnight", label: "Đêm Xanh", css: "linear-gradient(135deg,#090d1f,#172554,#0f172a)", stops: ["#090d1f", "#172554", "#0f172a"] },
  { id: "cyber", label: "Cyber", css: "linear-gradient(135deg,#0f172a,#312e81,#064e3b)", stops: ["#0f172a", "#312e81", "#064e3b"] },
  { id: "nebula", label: "Tinh Vân", css: "linear-gradient(135deg,#1e1b4b,#581c87,#831843)", stops: ["#1e1b4b", "#581c87", "#831843"] },
  { id: "sunset", label: "Hoàng Hôn", css: "linear-gradient(135deg,#431407,#9a3412,#be123c)", stops: ["#431407", "#9a3412", "#be123c"] },
  { id: "aurora", label: "Cực Quang", css: "linear-gradient(135deg,#042f2e,#0f766e,#1d4ed8)", stops: ["#042f2e", "#0f766e", "#1d4ed8"] },
  { id: "sky", label: "Trời Sáng", css: "linear-gradient(135deg,#e0f2fe,#bae6fd,#e0e7ff)", stops: ["#e0f2fe", "#bae6fd", "#e0e7ff"] },
  { id: "pastel", label: "Pastel", css: "linear-gradient(135deg,#fdf2f8,#ede9fe,#dbeafe)", stops: ["#fdf2f8", "#ede9fe", "#dbeafe"] }
];

function getDefaultState() {
  return {
    themeName: "Theme của tôi",
    screenW: 240,
    screenH: 240,
    chip: "esp32s3",
    wakeWord: "wn9_hitelly_tts",
    fontSource: "preset", // 'preset' | 'custom'
    fontPresetId: "font_noto_sans_common_20_4.bin",
    hideSubtitle: false,
    emotionSource: "builtin", // 'builtin' | 'shop' | 'custom'
    builtinPackId: "twemoji64",
    shopPackId: "robot_cyan",
    frameMode: "large", // 'small' | 'medium' | 'large' | 'near_full' | 'custom'
    customFrameW: 240,
    customFrameH: 240,
    shareBg: true,
    darkBgColor: "#121212",
    darkTxColor: "#ffffff",
    darkBgPreset: "none",
    lightBgColor: "#ffffff",
    lightTxColor: "#1e293b",
    lightBgPreset: "none",
    previewMode: "dark",
    previewEmotion: "neutral"
  };
}

let state = getDefaultState();
let customFontFile = null; // { name, bytes: Uint8Array }
let customEmotions = {}; // { [emoId]: { name, ext, bytes: Uint8Array, url: string, width, height } }
let customBgImages = { dark: null, light: null }; // { dataUrl, img }
let pendingSingleSlotId = null;
let builtResult = null; // { bytes: Uint8Array, filename, size, meta, thumbUrl }
let isBuildStale = false;

// Serial Monitor state
let serialPort = null;
let serialReader = null;
let serialKeepReading = false;
let serialLogBuffer = "";

// ---------- Persistence ----------
function loadDraft() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state = Object.assign(getDefaultState(), parsed);
    }
  } catch (e) {}
  try {
    const uiTheme = localStorage.getItem("chuhieu_tt_ui_theme");
    if (uiTheme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
    }
  } catch (e) {}
}

function saveDraft() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {}
}

function markStale() {
  if (builtResult) {
    isBuildStale = true;
    const banner = document.getElementById("out-stale-banner");
    if (banner) banner.classList.add("visible");
  }
}

// ---------- UI Theme ----------
function toggleUiTheme() {
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  if (isDark) {
    document.documentElement.removeAttribute("data-theme");
    localStorage.setItem("chuhieu_tt_ui_theme", "light");
  } else {
    document.documentElement.setAttribute("data-theme", "dark");
    localStorage.setItem("chuhieu_tt_ui_theme", "dark");
  }
  updateUiThemeBtn();
}

function updateUiThemeBtn() {
  const btn = document.getElementById("btn-ui-theme");
  if (!btn) return;
  const isDark = document.documentElement.getAttribute("data-theme") === "dark";
  btn.textContent = isDark ? "☀️ Sáng" : "🌙 Tối";
}

// ---------- Accordion & Quick Presets ----------
function toggleStep(n) {
  const card = document.getElementById(`step-${n}`);
  if (card) card.classList.toggle("open");
}

function applyQuickPreset(kind) {
  if (kind === "twemoji") {
    state.emotionSource = "builtin";
    state.builtinPackId = "twemoji64";
    state.fontSource = "preset";
    state.fontPresetId = "font_noto_qwen_16_4.bin";
    state.hideSubtitle = false;
    state.shareBg = true;
    state.darkBgColor = "#121212";
    state.darkTxColor = "#ffffff";
    state.darkBgPreset = "none";
  } else if (kind === "noto_anim") {
    state.emotionSource = "builtin";
    state.builtinPackId = "noto-emoji_128";
    state.fontSource = "preset";
    state.fontPresetId = "font_noto_qwen_16_4.bin";
    state.hideSubtitle = false;
    state.shareBg = true;
    state.darkBgColor = "#121212";
    state.darkTxColor = "#ffffff";
  } else if (kind === "full_eyes") {
    state.emotionSource = "shop";
    state.shopPackId = "robot_cyan";
    state.frameMode = "near_full";
    state.hideSubtitle = true;
    state.shareBg = true;
    state.darkBgColor = "#000000";
    state.darkTxColor = "#ffffff";
    state.darkBgPreset = "none";
  }
  markStale();
  saveDraft();
  renderAll();
}

function confirmResetAll() {
  if (!confirm("Xóa hết các lựa chọn hiện tại và quay về mặc định?")) return;
  Object.values(customEmotions).forEach(e => { if (e && e.url) URL.revokeObjectURL(e.url); });
  customEmotions = {};
  customFontFile = null;
  customBgImages = { dark: null, light: null };
  builtResult = null;
  isBuildStale = false;
  state = getDefaultState();
  saveDraft();
  const outCard = document.getElementById("step6-output");
  if (outCard) outCard.classList.remove("visible");
  renderAll();
}

function onThemeNameInput(val) {
  state.themeName = val;
  markStale();
  saveDraft();
}

// ---------- Step 1: Screen & Chip ----------
function selectScreen(w, h) {
  state.screenW = Math.max(64, Math.min(1024, parseInt(w, 10) || 240));
  state.screenH = Math.max(64, Math.min(1024, parseInt(h, 10) || 240));
  markStale();
  saveDraft();
  renderAll();
}

function toggleCustomScreenPanel() {
  const panel = document.getElementById("custom-screen-panel");
  if (!panel) return;
  panel.style.display = panel.style.display === "none" ? "block" : "none";
}

function onCustomSizeInput() {
  const w = parseInt(document.getElementById("custom-width-input").value, 10) || 240;
  const h = parseInt(document.getElementById("custom-height-input").value, 10) || 240;
  state.screenW = Math.max(64, Math.min(1024, w));
  state.screenH = Math.max(64, Math.min(1024, h));
  markStale();
  saveDraft();
  renderStep1();
  renderStep4FramePills();
  updatePreview();
  updateSummaries();
}

function selectChip(id) {
  state.chip = id;
  markStale();
  saveDraft();
  renderStep1();
  updateSummaries();
}

function renderStep1() {
  const stdGrid = document.getElementById("standard-screens-grid");
  stdGrid.innerHTML = STANDARD_SCREENS.map(s => {
    const active = state.screenW === s.w && state.screenH === s.h ? "active" : "";
    return `<button type="button" class="option-card ${active}" onclick="selectScreen(${s.w}, ${s.h})">
      <span class="oc-title">${s.label}</span>
      <span class="oc-sub">${s.sub}</span>
    </button>`;
  }).join("");

  const extraPills = document.getElementById("extra-screens-pills");
  extraPills.innerHTML = EXTRA_SCREENS.map(s => {
    const active = state.screenW === s.w && state.screenH === s.h ? "active" : "";
    return `<button type="button" class="pill-btn ${active}" onclick="selectScreen(${s.w}, ${s.h})">${s.label}</button>`;
  }).join("");

  document.getElementById("custom-width-input").value = state.screenW;
  document.getElementById("custom-height-input").value = state.screenH;

  const chipPills = document.getElementById("chip-pills");
  chipPills.innerHTML = CHIPS.map(c => {
    const active = state.chip === c.id ? "active" : "";
    return `<button type="button" class="pill-btn ${active}" onclick="selectChip('${c.id}')">${c.label}</button>`;
  }).join("");
}

// ---------- Step 2: Wake Word ----------
function selectWakeWord(id) {
  state.wakeWord = id;
  markStale();
  saveDraft();
  renderStep2();
  updateSummaries();
}

function renderStep2() {
  const wrap = document.getElementById("wakeword-pills");
  wrap.innerHTML = WAKE_WORDS.map(w => {
    const active = state.wakeWord === w.id ? "active" : "";
    return `<button type="button" class="pill-btn ${active}" onclick="selectWakeWord('${w.id}')">${w.label}</button>`;
  }).join("");
}

// ---------- Step 3: Font & Subtitle ----------
function setFontSource(src) {
  state.fontSource = src;
  markStale();
  saveDraft();
  renderStep3();
  updateSummaries();
}

function selectFontPreset(id) {
  state.fontPresetId = id;
  state.fontSource = "preset";
  markStale();
  saveDraft();
  renderStep3();
  renderStep4FramePills();
  updatePreview();
  updateSummaries();
}

async function onCustomFontUpload(input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const buf = await file.arrayBuffer();
  customFontFile = { name: file.name, bytes: new Uint8Array(buf) };
  state.fontSource = "custom";
  markStale();
  saveDraft();
  renderStep3();
  updateSummaries();
}

function onHideSubtitleChange(checked) {
  state.hideSubtitle = checked;
  markStale();
  saveDraft();
  renderStep4FramePills();
  updatePreview();
  updateSummaries();
}

function renderStep3() {
  document.getElementById("tab-font-preset").classList.toggle("active", state.fontSource === "preset");
  document.getElementById("tab-font-custom").classList.toggle("active", state.fontSource === "custom");
  document.getElementById("font-preset-panel").style.display = state.fontSource === "preset" ? "block" : "none";
  document.getElementById("font-custom-panel").style.display = state.fontSource === "custom" ? "block" : "none";

  const grid = document.getElementById("font-presets-grid");
  grid.innerHTML = FONT_PRESETS.map(f => {
    const active = state.fontPresetId === f.id ? "active" : "";
    return `<button type="button" class="option-card ${active}" onclick="selectFontPreset('${f.id}')">
      <span class="oc-title">${f.label}</span>
      <span class="oc-sub">${f.sub}</span>
    </button>`;
  }).join("");

  document.getElementById("custom-font-filename").textContent = customFontFile
    ? `${customFontFile.name} (${formatBytes(customFontFile.bytes.length)})`
    : "Chưa chọn file";

  document.getElementById("chk-hide-subtitle").checked = !!state.hideSubtitle;
}

// ---------- Step 4: Emotions ----------
function getSafeEmotionBounds() {
  const sw = state.screenW;
  const sh = state.screenH;
  const fPreset = FONT_PRESETS.find(f => f.id === state.fontPresetId);
  const fontPx = fPreset ? fPreset.sizePx : 16;
  // Xiaozhi LVGL status_bar_ (Wi-Fi, Pin, trạng thái) nằm ở trên cùng
  const statusBarH = Math.max(28, fontPx + 12);
  // Khi hiện chữ trò chuyện, chừa đủ chỗ cho 2 dòng chữ tiếng Việt ở đáy
  const subtitleH = state.hideSubtitle ? 4 : Math.max(48, fontPx * 2 + 16);
  const safeH = Math.max(32, sh - statusBarH - subtitleH);
  return { sw, sh, statusBarH, subtitleH, safeW: sw, safeH };
}

function getEmotionFrameDimensions() {
  const { sw, sh, safeH } = getSafeEmotionBounds();
  const minSide = Math.min(sw, sh);
  if (state.frameMode === "small") {
    const s = Math.min(Math.round(minSide * 0.34), safeH);
    return { w: s, h: s };
  }
  if (state.frameMode === "medium") {
    const s = Math.min(Math.round(minSide * 0.5), safeH);
    return { w: s, h: s };
  }
  if (state.frameMode === "large") {
    const s = Math.round(minSide * 0.7);
    return { w: s, h: Math.min(s, safeH) };
  }
  if (state.frameMode === "near_full") {
    return { w: sw, h: safeH };
  }
  return {
    w: Math.max(24, Math.min(sw, parseInt(state.customFrameW, 10) || sw)),
    h: Math.max(24, Math.min(sh, parseInt(state.customFrameH, 10) || safeH))
  };
}

function setEmotionSource(src) {
  state.emotionSource = src;
  markStale();
  saveDraft();
  renderStep4();
  updatePreview();
  updateSummaries();
}

function selectBuiltinPack(id) {
  state.builtinPackId = id;
  state.emotionSource = "builtin";
  markStale();
  saveDraft();
  renderStep4();
  updatePreview();
  updateSummaries();
}

async function selectShopPack(id) {
  state.shopPackId = id;
  state.emotionSource = "shop";
  const pack = SHOP_EMOTION_PACKS.find(p => p.id === id);
  if (pack && pack.hasBg) {
    state.frameMode = "near_full";
    try {
      const bgUrl = `${LOCAL_PRESETS_BASE}/${id}/bg.png`;
      const img = await loadImage(bgUrl);
      customBgImages.dark = { dataUrl: bgUrl, img };
      state.darkBgPreset = "none";
      state.shareBg = true;
    } catch (e) {}
  }
  markStale();
  saveDraft();
  renderStep4();
  renderStep5();
  updatePreview();
  updateSummaries();
}

function selectFrameMode(mode) {
  state.frameMode = mode;
  markStale();
  saveDraft();
  renderStep4FramePills();
  updatePreview();
}

function onCustomFrameSizeInput() {
  state.customFrameW = parseInt(document.getElementById("emo-frame-w").value, 10) || state.screenW;
  state.customFrameH = parseInt(document.getElementById("emo-frame-h").value, 10) || state.screenH;
  markStale();
  saveDraft();
  updatePreview();
}

function renderStep4FramePills() {
  const { sw, sh, safeH } = getSafeEmotionBounds();
  const minSide = Math.min(sw, sh);
  const modes = [
    { id: "small", label: `Nhỏ (${Math.min(Math.round(minSide * 0.34), safeH)}×${Math.min(Math.round(minSide * 0.34), safeH)})` },
    { id: "medium", label: `Vừa (${Math.min(Math.round(minSide * 0.5), safeH)}×${Math.min(Math.round(minSide * 0.5), safeH)})` },
    { id: "large", label: `To (${Math.round(minSide * 0.7)}×${Math.min(Math.round(minSide * 0.7), safeH)})` },
    { id: "near_full", label: `Gần full màn (${sw}×${safeH})` },
    { id: "custom", label: "Tự nhập" }
  ];
  const wrap = document.getElementById("emo-frame-pills");
  wrap.innerHTML = modes.map(m =>
    `<button type="button" class="pill-btn ${state.frameMode === m.id ? "active" : ""}" onclick="selectFrameMode('${m.id}')">${m.label}</button>`
  ).join("");

  const cInputs = document.getElementById("emo-frame-custom-inputs");
  cInputs.style.display = state.frameMode === "custom" ? "flex" : "none";
  document.getElementById("emo-frame-w").value = state.customFrameW;
  document.getElementById("emo-frame-h").value = state.customFrameH;
}

function renderShopPacksGrid() {
  const kw = (document.getElementById("shop-pack-search")?.value || "").trim().toLowerCase();
  const grid = document.getElementById("emo-shop-grid");
  const list = SHOP_EMOTION_PACKS.filter(p => !kw || p.label.toLowerCase().includes(kw) || p.id.toLowerCase().includes(kw));
  grid.innerHTML = list.map(p => {
    const active = state.emotionSource === "shop" && state.shopPackId === p.id ? "active" : "";
    const badgeHtml = p.badge ? `<span style="font-size:10px;font-weight:800;color:var(--accent);background:var(--accent-soft);padding:1px 6px;border-radius:999px;">${p.badge}</span>` : "";
    return `<div class="preset-card ${active}" onclick="selectShopPack('${p.id}')">
      <div class="preset-thumb"><img loading="lazy" src="${LOCAL_PRESETS_BASE}/${p.id}/neutral.gif" alt="${p.label}"></div>
      <div class="preset-name">${p.label}</div>
      ${badgeHtml}
    </div>`;
  }).join("");
}

function renderCustomEmotionSlots() {
  const grid = document.getElementById("emo-slots-grid");
  grid.innerHTML = EMOTIONS.map(e => {
    const entry = customEmotions[e.id];
    const hasFile = !!entry;
    return `<div class="emo-slot ${hasFile ? "has-file" : ""}" onclick="openSingleSlotPicker('${e.id}')">
      ${hasFile ? `<button type="button" class="emo-slot-clear" onclick="event.stopPropagation(); clearSingleSlot('${e.id}')" title="Xóa">×</button>` : ""}
      <div class="emo-slot-preview">${hasFile ? `<img src="${entry.url}" alt="${e.vi}">` : e.icon}</div>
      <div class="emo-slot-label">${e.num} ${e.vi}</div>
    </div>`;
  }).join("");
}

function renderStep4() {
  document.getElementById("tab-emo-builtin").classList.toggle("active", state.emotionSource === "builtin");
  document.getElementById("tab-emo-shop").classList.toggle("active", state.emotionSource === "shop");
  document.getElementById("tab-emo-custom").classList.toggle("active", state.emotionSource === "custom");

  document.getElementById("emo-builtin-panel").style.display = state.emotionSource === "builtin" ? "block" : "none";
  document.getElementById("emo-shop-panel").style.display = state.emotionSource === "shop" ? "block" : "none";
  document.getElementById("emo-custom-panel").style.display = state.emotionSource === "custom" ? "block" : "none";
  const frameBox = document.getElementById("emo-frame-config-box");
  if (frameBox) {
    frameBox.style.display = (state.emotionSource === "shop" || state.emotionSource === "custom") ? "block" : "none";
  }

  const bGrid = document.getElementById("emo-builtin-grid");
  bGrid.innerHTML = BUILTIN_EMOTION_PACKS.map(p => {
    const active = state.emotionSource === "builtin" && state.builtinPackId === p.id ? "active" : "";
    return `<button type="button" class="option-card ${active}" onclick="selectBuiltinPack('${p.id}')">
      <span class="oc-title">${p.label}</span>
      <span class="oc-sub">${p.sub}</span>
    </button>`;
  }).join("");

  renderShopPacksGrid();
  renderStep4FramePills();
  renderCustomEmotionSlots();
}

function openSingleSlotPicker(emoId) {
  pendingSingleSlotId = emoId;
  const inp = document.getElementById("emo-single-slot-input");
  inp.value = "";
  inp.click();
}

function clearSingleSlot(emoId) {
  if (customEmotions[emoId]?.url) URL.revokeObjectURL(customEmotions[emoId].url);
  delete customEmotions[emoId];
  markStale();
  renderCustomEmotionSlots();
  updatePreview();
  updateSummaries();
}

function clearAllCustomEmotions() {
  Object.values(customEmotions).forEach(e => { if (e && e.url) URL.revokeObjectURL(e.url); });
  customEmotions = {};
  markStale();
  renderCustomEmotionSlots();
  updatePreview();
  updateSummaries();
}

function normalizeNameForMatch(filename) {
  return String(filename || "")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[^a-z0-9]/g, "");
}

function matchEmotionIdByFilename(filename) {
  const base = filename.split("/").pop();
  const clean = normalizeNameForMatch(base);
  // Check leading index 01..21
  const numMatch = base.match(/(?:^|[^0-9])(0?[1-9]|1[0-9]|2[0-1])(?:[^0-9]|$)/);
  if (numMatch) {
    const idx = parseInt(numMatch[1], 10) - 1;
    if (EMOTIONS[idx]) return EMOTIONS[idx].id;
  }
  for (const e of EMOTIONS) {
    if (clean.includes(e.id)) return e.id;
    for (const al of e.aliases) {
      if (clean.includes(al)) return e.id;
    }
  }
  return null;
}

async function ingestImageBytesForEmotion(emoId, filename, rawBytes) {
  const isGif = rawBytes[0] === 0x47 && rawBytes[1] === 0x49 && rawBytes[2] === 0x46; // GIF8
  const isPng = rawBytes[0] === 0x89 && rawBytes[1] === 0x50 && rawBytes[2] === 0x4E && rawBytes[3] === 0x47;
  let ext = isGif ? "gif" : "png";
  let finalBytes = rawBytes;
  let width = 0, height = 0;

  if (isGif) {
    const dims = parseGifDimensions(rawBytes);
    width = dims.w;
    height = dims.h;
  } else {
    // Convert JPG/WebP/PNG to resized PNG fitting frame
    const frame = getEmotionFrameDimensions();
    const res = await resizeImageToPng(rawBytes, frame.w, frame.h);
    finalBytes = res.bytes;
    width = res.w;
    height = res.h;
    ext = "png";
  }

  if (customEmotions[emoId]?.url) URL.revokeObjectURL(customEmotions[emoId].url);
  const blob = new Blob([finalBytes], { type: ext === "gif" ? "image/gif" : "image/png" });
  customEmotions[emoId] = {
    name: filename,
    ext,
    bytes: finalBytes,
    url: URL.createObjectURL(blob),
    width,
    height
  };
}

async function handleSingleSlotUpload(input) {
  const file = input.files && input.files[0];
  if (!file || !pendingSingleSlotId) return;
  const buf = new Uint8Array(await file.arrayBuffer());
  await ingestImageBytesForEmotion(pendingSingleSlotId, file.name, buf);
  state.emotionSource = "custom";
  markStale();
  renderCustomEmotionSlots();
  updatePreview();
  updateSummaries();
}

async function handleCustomEmotionFiles(fileList) {
  const files = Array.from(fileList || []).filter(f => /\.(png|gif|jpe?g|webp)$/i.test(f.name));
  if (files.length === 0) return;

  // Check for background file nen-*
  const emoFiles = [];
  for (const f of files) {
    const norm = normalizeNameForMatch(f.name);
    if (norm.startsWith("nen") || norm.startsWith("bg") || norm.includes("background")) {
      const dataUrl = await readFileAsDataUrl(f);
      await setBgImageFromDataUrl("dark", dataUrl);
    } else {
      emoFiles.push(f);
    }
  }

  if (emoFiles.length === 1) {
    // Single image applies to all 21 slots
    const buf = new Uint8Array(await emoFiles[0].arrayBuffer());
    for (const e of EMOTIONS) {
      await ingestImageBytesForEmotion(e.id, emoFiles[0].name, buf);
    }
  } else {
    let fallbackIdx = 0;
    for (const f of emoFiles) {
      let targetId = matchEmotionIdByFilename(f.name);
      if (!targetId) {
        while (fallbackIdx < EMOTIONS.length && customEmotions[EMOTIONS[fallbackIdx].id]) fallbackIdx++;
        if (fallbackIdx < EMOTIONS.length) targetId = EMOTIONS[fallbackIdx++].id;
      }
      if (targetId) {
        const buf = new Uint8Array(await f.arrayBuffer());
        await ingestImageBytesForEmotion(targetId, f.name, buf);
      }
    }
  }

  state.emotionSource = "custom";
  markStale();
  renderCustomEmotionSlots();
  updatePreview();
  updateSummaries();
}

async function handleCustomEmotionZip(file) {
  if (!file || typeof window.JSZip === "undefined") return;
  const zip = await window.JSZip.loadAsync(file);
  const extracted = [];
  for (const [path, entry] of Object.entries(zip.files)) {
    if (entry.dir || path.startsWith("__MACOSX") || !/\.(png|gif|jpe?g|webp)$/i.test(path)) continue;
    const u8 = await entry.async("uint8array");
    extracted.push({ name: path.split("/").pop(), bytes: u8 });
  }
  if (extracted.length === 0) {
    alert("Không tìm thấy ảnh PNG/GIF hợp lệ bên trong file ZIP!");
    return;
  }
  const emoItems = [];
  for (const it of extracted) {
    const norm = normalizeNameForMatch(it.name);
    if (norm.startsWith("nen") || norm.startsWith("bg") || norm.includes("background")) {
      const blob = new Blob([it.bytes]);
      const dataUrl = await readFileAsDataUrl(blob);
      await setBgImageFromDataUrl("dark", dataUrl);
    } else {
      emoItems.push(it);
    }
  }
  if (emoItems.length === 1) {
    for (const e of EMOTIONS) {
      await ingestImageBytesForEmotion(e.id, emoItems[0].name, emoItems[0].bytes);
    }
  } else {
    let fallbackIdx = 0;
    for (const it of emoItems) {
      let targetId = matchEmotionIdByFilename(it.name);
      if (!targetId) {
        while (fallbackIdx < EMOTIONS.length && customEmotions[EMOTIONS[fallbackIdx].id]) fallbackIdx++;
        if (fallbackIdx < EMOTIONS.length) targetId = EMOTIONS[fallbackIdx++].id;
      }
      if (targetId) {
        await ingestImageBytesForEmotion(targetId, it.name, it.bytes);
      }
    }
  }
  state.emotionSource = "custom";
  markStale();
  renderCustomEmotionSlots();
  updatePreview();
  updateSummaries();
}

// ---------- Step 5: Background & Colors ----------
function onShareBgChange(checked) {
  state.shareBg = checked;
  markStale();
  saveDraft();
  renderStep5();
  updatePreview();
  updateSummaries();
}

function onBgColorChange(mode, val) {
  if (mode === "dark") state.darkBgColor = val;
  else state.lightBgColor = val;
  markStale();
  saveDraft();
  updatePreview();
  updateSummaries();
}

function onTxColorChange(mode, val) {
  if (mode === "dark") state.darkTxColor = val;
  else state.lightTxColor = val;
  markStale();
  saveDraft();
  updatePreview();
}

function selectBgPreset(mode, presetId) {
  if (mode === "dark") state.darkBgPreset = presetId;
  else state.lightBgPreset = presetId;
  customBgImages[mode] = null;
  markStale();
  saveDraft();
  renderStep5();
  updatePreview();
}

function readFileAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(blob);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function setBgImageFromDataUrl(mode, dataUrl) {
  const img = await loadImage(dataUrl);
  customBgImages[mode] = { dataUrl, img };
  if (mode === "dark") state.darkBgPreset = "none";
  else state.lightBgPreset = "none";
  markStale();
  renderStep5();
  updatePreview();
}

async function onBgImageUpload(mode, input) {
  const file = input.files && input.files[0];
  if (!file) return;
  const dataUrl = await readFileAsDataUrl(file);
  await setBgImageFromDataUrl(mode, dataUrl);
}

function clearBgImage(mode) {
  customBgImages[mode] = null;
  markStale();
  renderStep5();
  updatePreview();
}

function renderStep5() {
  document.getElementById("chk-share-bg").checked = !!state.shareBg;
  document.getElementById("dark-shared-tag").style.display = state.shareBg ? "inline" : "none";
  document.getElementById("bg-light-box").style.display = state.shareBg ? "none" : "block";

  document.getElementById("bg-color-dark").value = state.darkBgColor;
  document.getElementById("tx-color-dark").value = state.darkTxColor;
  document.getElementById("bg-color-light").value = state.lightBgColor;
  document.getElementById("tx-color-light").value = state.lightTxColor;

  document.getElementById("btn-clear-bg-dark").style.display = customBgImages.dark ? "inline-block" : "none";
  document.getElementById("btn-clear-bg-light").style.display = customBgImages.light ? "inline-block" : "none";

  const renderStrip = (mode, containerId, activeId) => {
    const el = document.getElementById(containerId);
    el.innerHTML = BG_GRADIENT_PRESETS.map(p =>
      `<button type="button" class="bg-swatch ${!customBgImages[mode] && activeId === p.id ? "active" : ""}" style="background:${p.css};" onclick="selectBgPreset('${mode}', '${p.id}')">${p.label}</button>`
    ).join("");
  };
  renderStrip("dark", "bg-presets-dark", state.darkBgPreset);
  renderStrip("light", "bg-presets-light", state.lightBgPreset);
}

// ---------- Live Preview (.tt-scr 1:1 scaling) ----------
function setPreviewMode(mode) {
  state.previewMode = mode;
  document.getElementById("pv-mode-dark").classList.toggle("active", mode === "dark");
  document.getElementById("pv-mode-light").classList.toggle("active", mode === "light");
  updatePreview();
}

function selectPreviewEmotion(emoId) {
  state.previewEmotion = emoId;
  renderPreviewEmoBar();
  updatePreview();
}

function renderPreviewEmoBar() {
  const bar = document.getElementById("ttPvEmo");
  bar.innerHTML = EMOTIONS.map(e =>
    `<button type="button" class="pv-emo-btn ${state.previewEmotion === e.id ? "active" : ""}" title="${e.num} ${e.vi}" onclick="selectPreviewEmotion('${e.id}')">${e.icon}</button>`
  ).join("");
}

function getPreviewEmotionUrl(emoId) {
  if (state.emotionSource === "custom") {
    const entry = customEmotions[emoId] || customEmotions["neutral"];
    if (entry) return entry.url;
    return `${CDN_BASE}/emojis/twemoji64/${emoId}.png`;
  }
  if (state.emotionSource === "shop") {
    return `${LOCAL_PRESETS_BASE}/${state.shopPackId}/${emoId}.gif`;
  }
  const pack = BUILTIN_EMOTION_PACKS.find(p => p.id === state.builtinPackId) || BUILTIN_EMOTION_PACKS[0];
  return `${pack.baseUrl}/${emoId}.${pack.ext}`;
}

function updatePreview() {
  const w = state.screenW;
  const h = state.screenH;
  const maxDisplayW = 290;
  const maxDisplayH = 310;
  const scale = Math.min(maxDisplayW / w, maxDisplayH / h, 1.35);

  const wrap = document.getElementById("pv-scale-wrap");
  const scr = document.getElementById("tt-scr");
  wrap.style.width = `${Math.round(w * scale)}px`;
  wrap.style.height = `${Math.round(h * scale)}px`;
  scr.style.width = `${w}px`;
  scr.style.height = `${h}px`;
  scr.style.transform = `scale(${scale})`;

  // Skin mode
  const effectiveMode = state.shareBg ? "dark" : state.previewMode;
  const bgColor = effectiveMode === "dark" ? state.darkBgColor : state.lightBgColor;
  const txColor = effectiveMode === "dark" ? state.darkTxColor : state.lightTxColor;
  const bgPresetId = effectiveMode === "dark" ? state.darkBgPreset : state.lightBgPreset;
  const customBg = customBgImages[effectiveMode];

  scr.style.backgroundColor = bgColor;
  scr.style.color = txColor;
  if (customBg) {
    scr.style.backgroundImage = `url("${customBg.dataUrl}")`;
  } else {
    const preset = BG_GRADIENT_PRESETS.find(p => p.id === bgPresetId);
    scr.style.backgroundImage = preset && preset.stops ? preset.css : "none";
  }

  // Subtitle visibility, safe status bar height & font size
  const { statusBarH, subtitleH } = getSafeEmotionBounds();
  const sbEl = scr.querySelector(".tt-sb");
  if (sbEl) sbEl.style.height = `${statusBarH}px`;
  const emBox = document.getElementById("tt-em");
  const txBox = document.getElementById("tt-tx");
  emBox.style.top = `${statusBarH}px`;
  emBox.style.bottom = `${subtitleH}px`;
  emBox.classList.toggle("full-height", !!state.hideSubtitle);
  txBox.classList.toggle("hidden", !!state.hideSubtitle);
  const fPreset = FONT_PRESETS.find(f => f.id === state.fontPresetId);
  txBox.style.fontSize = `${fPreset ? fPreset.sizePx : 16}px`;

  // Emotion image sizing
  const imgEl = document.getElementById("pv-emo-img");
  imgEl.src = getPreviewEmotionUrl(state.previewEmotion);
  if (state.emotionSource === "builtin") {
    const pack = BUILTIN_EMOTION_PACKS.find(p => p.id === state.builtinPackId) || BUILTIN_EMOTION_PACKS[0];
    imgEl.style.maxWidth = `${Math.min(pack.size, w)}px`;
    imgEl.style.maxHeight = `${Math.min(pack.size, h - 24)}px`;
  } else {
    const fr = getEmotionFrameDimensions();
    imgEl.style.maxWidth = `${fr.w}px`;
    imgEl.style.maxHeight = `${fr.h}px`;
  }

  const emoObj = EMOTIONS.find(e => e.id === state.previewEmotion) || EMOTIONS[0];
  document.getElementById("pv-dim-caption").textContent = `${w}×${h} px · ${emoObj.vi} (${emoObj.id})`;
}

// ---------- Summaries & Size Estimation ----------
function estimateBuildBytes() {
  let total = 291100; // srmodels.bin
  if (state.fontSource === "custom" && customFontFile) {
    total += customFontFile.bytes.length;
  } else {
    const f = FONT_PRESETS.find(x => x.id === state.fontPresetId) || FONT_PRESETS[0];
    total += f.estBytes;
  }
  if (state.emotionSource === "builtin") {
    const p = BUILTIN_EMOTION_PACKS.find(x => x.id === state.builtinPackId) || BUILTIN_EMOTION_PACKS[0];
    total += p.estBytes;
  } else if (state.emotionSource === "shop") {
    const sp = SHOP_EMOTION_PACKS.find(x => x.id === state.shopPackId);
    total += (sp && sp.estBytes) ? sp.estBytes : 950000;
  } else {
    let customSum = 0;
    for (const e of EMOTIONS) {
      const entry = customEmotions[e.id] || customEmotions["neutral"];
      if (entry) customSum += entry.bytes.length;
    }
    total += customSum || 60000;
  }
  // Background raw images (RGB565)
  const hasDarkBg = !!customBgImages.dark || state.darkBgPreset !== "none";
  const hasLightBg = !state.shareBg && (!!customBgImages.light || state.lightBgPreset !== "none");
  const rawBgSize = state.screenW * state.screenH * 2 + 28;
  if (hasDarkBg) total += rawBgSize * (state.shareBg ? 1 : 1);
  if (hasLightBg) total += rawBgSize;
  return total + 6000;
}

function formatBytes(b) {
  if (b >= 1024 * 1024) return `${(b / (1024 * 1024)).toFixed(2)} MB`;
  return `${Math.round(b / 1024)} KB`;
}

function updateSummaries() {
  const chipLabel = state.chip.toUpperCase();
  const wakeObj = WAKE_WORDS.find(w => w.id === state.wakeWord) || WAKE_WORDS[0];
  const fontLabel = state.fontSource === "custom" && customFontFile
    ? customFontFile.name
    : (FONT_PRESETS.find(f => f.id === state.fontPresetId)?.label || "Noto 20px");

  let emoLabel = "";
  if (state.emotionSource === "builtin") {
    emoLabel = BUILTIN_EMOTION_PACKS.find(p => p.id === state.builtinPackId)?.label || "Twemoji 64px";
  } else if (state.emotionSource === "shop") {
    emoLabel = "Kho Shop: " + (SHOP_EMOTION_PACKS.find(p => p.id === state.shopPackId)?.label || state.shopPackId);
  } else {
    const cnt = Object.keys(customEmotions).length;
    emoLabel = `Ảnh tự tải lên (${cnt}/21 ô)`;
  }

  document.getElementById("step1-summary").textContent = `${state.screenW}×${state.screenH} px · ${chipLabel}`;
  document.getElementById("step2-summary").textContent = wakeObj.label;
  document.getElementById("step3-summary").textContent = `${fontLabel} · ${state.hideSubtitle ? "Ẩn chữ trò chuyện" : "Hiện chữ trò chuyện"}`;
  document.getElementById("step4-summary").textContent = emoLabel;
  document.getElementById("step5-summary").textContent = state.shareBg
    ? `Dùng chung Tối & Sáng · Nền ${state.darkBgColor}`
    : `Tối (${state.darkBgColor}) · Sáng (${state.lightBgColor})`;

  document.getElementById("hero-wake-pill").textContent = wakeObj.label.replace(" (mặc định)", "");
  document.getElementById("hero-chip-pill").textContent = chipLabel;

  document.getElementById("meta-screen").textContent = `${state.screenW}×${state.screenH} · ${chipLabel}`;
  document.getElementById("meta-wake").textContent = wakeObj.label.replace(" (mặc định)", "");

  const est = estimateBuildBytes();
  const pct = Math.min(100, Math.round((est / PARTITION_MAX_BYTES) * 100));
  document.getElementById("meta-size").textContent = `≈ ${formatBytes(est)} / 6.5 MB`;
  const bar = document.getElementById("cap-bar-fill");
  bar.style.width = `${pct}%`;
  bar.classList.remove("warn", "danger");
  if (est > PARTITION_MAX_BYTES) bar.classList.add("danger");
  else if (est > PARTITION_MAX_BYTES * 0.82) bar.classList.add("warn");
}

function renderAll() {
  document.getElementById("theme-name-input").value = state.themeName;
  renderStep1();
  renderStep2();
  renderStep3();
  renderStep4();
  renderStep5();
  renderPreviewEmoBar();
  updatePreview();
  updateSummaries();
}

// ---------- Image & Binary Utilities ----------
function parsePngDimensions(u8) {
  if (u8.length >= 24 && u8[0] === 0x89 && u8[1] === 0x50) {
    const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    return { w: dv.getUint32(16, false), h: dv.getUint32(20, false) };
  }
  return { w: 0, h: 0 };
}

function parseGifDimensions(u8) {
  if (u8.length >= 10 && u8[0] === 0x47 && u8[1] === 0x49 && u8[2] === 0x46) {
    const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
    return { w: dv.getUint16(6, true), h: dv.getUint16(8, true) };
  }
  return { w: 0, h: 0 };
}

let _gifencModulePromise = null;
async function getGifencModule() {
  if (!_gifencModulePromise) {
    _gifencModulePromise = import("https://cdn.jsdelivr.net/npm/gifenc@1.0.3/+esm");
  }
  return _gifencModulePromise;
}

/**
 * Resize animated GIF using omggif (GifReader + GifWriter) with a single 128-color Global Color Table
 * and even dimensions (dstW, dstH) for 100% compatibility with ESP32 LVGL lv_gif/gifdec.
 */
async function resizeGifBytes(rawBytes, maxW, maxH) {
  const origDims = parseGifDimensions(rawBytes);
  if (!origDims.w || !origDims.h) return { bytes: rawBytes, w: origDims.w, h: origDims.h };
  if (origDims.w <= maxW && origDims.h <= maxH) {
    return { bytes: rawBytes, w: origDims.w, h: origDims.h };
  }
  if (typeof window.GifReader === "undefined" || typeof window.GifWriter === "undefined") {
    return { bytes: rawBytes, w: origDims.w, h: origDims.h };
  }

  const reader = new window.GifReader(rawBytes);
  const srcW = reader.width;
  const srcH = reader.height;
  const scale = Math.min(maxW / srcW, maxH / srcH);
  // Keep even dimensions for clean LVGL RGB565 alignment
  const dstW = Math.max(2, Math.floor((srcW * scale) / 2) * 2);
  const dstH = Math.max(2, Math.floor((srcH * scale) / 2) * 2);

  const { quantize, applyPalette } = await getGifencModule();

  const compCanvas = document.createElement("canvas");
  compCanvas.width = srcW;
  compCanvas.height = srcH;
  const compCtx = compCanvas.getContext("2d", { willReadFrequently: true });

  const patchCanvas = document.createElement("canvas");
  patchCanvas.width = srcW;
  patchCanvas.height = srcH;
  const patchCtx = patchCanvas.getContext("2d", { willReadFrequently: true });
  const frameRgba = new Uint8ClampedArray(srcW * srcH * 4);

  const outCanvas = document.createElement("canvas");
  outCanvas.width = dstW;
  outCanvas.height = dstH;
  const outCtx = outCanvas.getContext("2d", { willReadFrequently: true });
  outCtx.imageSmoothingEnabled = true;
  outCtx.imageSmoothingQuality = "high";

  const numFrames = reader.numFrames();
  const decodedFrames = [];
  let prevBackup = null;
  let hasAnyAlpha = false;

  // Pass 1: Decode and scale all frames
  for (let i = 0; i < numFrames; i++) {
    const info = reader.frameInfo(i);
    if (info.disposal === 3) {
      prevBackup = compCtx.getImageData(0, 0, srcW, srcH);
    }

    frameRgba.fill(0);
    reader.decodeAndBlitFrameRGBA(i, frameRgba);
    const imgData = new ImageData(frameRgba, srcW, srcH);
    patchCtx.putImageData(imgData, 0, 0);
    compCtx.drawImage(patchCanvas, 0, 0);

    outCtx.clearRect(0, 0, dstW, dstH);
    outCtx.drawImage(compCanvas, 0, 0, srcW, srcH, 0, 0, dstW, dstH);
    const scaledRgba = new Uint8ClampedArray(outCtx.getImageData(0, 0, dstW, dstH).data);

    if (!hasAnyAlpha) {
      for (let a = 3; a < scaledRgba.length; a += 4) {
        if (scaledRgba[a] < 128) { hasAnyAlpha = true; break; }
      }
    }

    decodedFrames.push({
      rgba: scaledRgba,
      delayCs: Math.max(2, info.delay || 10) // centiseconds (1/100s)
    });

    if (info.disposal === 2) {
      compCtx.clearRect(info.x, info.y, info.width, info.height);
    } else if (info.disposal === 3 && prevBackup) {
      compCtx.putImageData(prevBackup, 0, 0);
      prevBackup = null;
    }
  }

  // Pass 2: Build ONE shared 128-color Global Color Table (power of 2 = 128) for all frames
  // Sample pixels across up to 6 evenly spaced frames for accurate palette
  const sampleStep = Math.max(1, Math.floor(decodedFrames.length / 6));
  const sampledChunks = [];
  for (let i = 0; i < decodedFrames.length; i += sampleStep) {
    sampledChunks.push(decodedFrames[i].rgba);
  }
  const totalSampleLen = sampledChunks.reduce((s, c) => s + c.length, 0);
  const sampleBuf = new Uint8Array(totalSampleLen);
  let sOff = 0;
  for (const c of sampledChunks) { sampleBuf.set(c, sOff); sOff += c.length; }

  const fmt = hasAnyAlpha ? "rgba4444" : "rgb565";
  const rawPalette = quantize(sampleBuf, 128, { format: fmt, oneBitAlpha: hasAnyAlpha });
  // Pad palette strictly to 128 entries (power of 2 required by omggif GifWriter)
  const gctInts = new Array(128).fill(0);
  const paddedPalette = [];
  let transparentIdx = -1;
  for (let i = 0; i < 128; i++) {
    const c = rawPalette[i] || [0, 0, 0, 255];
    const r = c[0] & 0xFF, g = c[1] & 0xFF, b = c[2] & 0xFF;
    const a = c.length >= 4 ? (c[3] & 0xFF) : 255;
    if (hasAnyAlpha && transparentIdx === -1 && a === 0) {
      transparentIdx = i;
    }
    gctInts[i] = (r << 16) | (g << 8) | b;
    paddedPalette.push(hasAnyAlpha ? [r, g, b, a] : [r, g, b]);
  }

  // Pass 3: Encode with omggif GifWriter (RFC 89a compliant, dirty-rect delta compression for tiny file size)
  const outBuf = new Uint8Array(Math.max(65536, dstW * dstH * decodedFrames.length * 2 + 4096));
  const writer = new window.GifWriter(outBuf, dstW, dstH, {
    palette: gctInts,
    loop: 0
  });

  let prevIndexed = null;
  for (let i = 0; i < decodedFrames.length; i++) {
    const fr = decodedFrames[i];
    const indexed = applyPalette(fr.rgba, paddedPalette, fmt);
    const frameOpts = {
      delay: fr.delayCs,
      disposal: hasAnyAlpha ? 2 : 1
    };
    if (hasAnyAlpha && transparentIdx >= 0) {
      frameOpts.transparent = transparentIdx;
    }

    if (!hasAnyAlpha && prevIndexed) {
      // Compute tight dirty bounding box between frame i and frame i-1
      let minX = dstW, minY = dstH, maxX = -1, maxY = -1;
      for (let y = 0; y < dstH; y++) {
        const rowOff = y * dstW;
        for (let x = 0; x < dstW; x++) {
          if (indexed[rowOff + x] !== prevIndexed[rowOff + x]) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX < minX || maxY < minY) {
        // Identical frame: emit 1x1 unchanged pixel
        writer.addFrame(0, 0, 1, 1, new Uint8Array([indexed[0]]), frameOpts);
      } else {
        const bw = maxX - minX + 1;
        const bh = maxY - minY + 1;
        const sub = new Uint8Array(bw * bh);
        for (let y = 0; y < bh; y++) {
          const srcRow = (minY + y) * dstW + minX;
          sub.set(indexed.subarray(srcRow, srcRow + bw), y * bw);
        }
        writer.addFrame(minX, minY, bw, bh, sub, frameOpts);
      }
    } else {
      writer.addFrame(0, 0, dstW, dstH, indexed, frameOpts);
    }
    prevIndexed = indexed;
  }

  const finalLen = writer.end();
  return { bytes: outBuf.slice(0, finalLen), w: dstW, h: dstH };
}

async function resizeImageToPng(rawBytes, maxW, maxH) {
  const blob = new Blob([rawBytes]);
  const url = URL.createObjectURL(blob);
  try {
    const img = await loadImage(url);
    const scale = Math.min(1, maxW / img.width, maxH / img.height);
    const tw = Math.max(1, Math.round(img.width * scale));
    const th = Math.max(1, Math.round(img.height * scale));
    const canvas = document.createElement("canvas");
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, tw, th);
    const outBlob = await new Promise(res => canvas.toBlob(res, "image/png"));
    return { bytes: new Uint8Array(await outBlob.arrayBuffer()), w: tw, h: th };
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Render background (uploaded image center-cropped or gradient preset) to exact screenW x screenH
 * and encode to LVGL v9 RGB565 binary (.raw) with 28-byte header verified on ESP32-S3 Xiaozhi.
 */
function buildLvglBackgroundRaw(mode) {
  const w = state.screenW;
  const h = state.screenH;
  const customBg = customBgImages[mode];
  const presetId = mode === "dark" ? state.darkBgPreset : state.lightBgPreset;
  const preset = BG_GRADIENT_PRESETS.find(p => p.id === presetId);
  if (!customBg && (!preset || !preset.stops)) return null;

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");

  if (customBg && customBg.img) {
    const img = customBg.img;
    // Center-crop cover
    const srcRatio = img.width / img.height;
    const dstRatio = w / h;
    let sx = 0, sy = 0, sw = img.width, sh = img.height;
    if (srcRatio > dstRatio) {
      sw = img.height * dstRatio;
      sx = (img.width - sw) / 2;
    } else {
      sh = img.width / dstRatio;
      sy = (img.height - sh) / 2;
    }
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  } else if (preset && preset.stops) {
    const grad = ctx.createLinearGradient(0, 0, w, h);
    const n = preset.stops.length - 1;
    preset.stops.forEach((c, idx) => grad.addColorStop(idx / Math.max(1, n), c));
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
  }

  const rgba = ctx.getImageData(0, 0, w, h).data;
  const pixelBytes = w * h * 2;
  const out = new Uint8Array(28 + pixelBytes);
  const dv = new DataView(out.buffer);
  // 28-byte LVGL v9 image header: magic=0x19, cf=0x12 (RGB565), flags=0, w, h, stride=w*2, res=0, data_size, offset=28
  out[0] = 0x19;
  out[1] = 0x12;
  dv.setUint16(2, 0, true);
  dv.setUint16(4, w, true);
  dv.setUint16(6, h, true);
  dv.setUint16(8, w * 2, true);
  dv.setUint16(10, 0, true);
  dv.setUint32(12, pixelBytes, true);
  dv.setUint32(16, 28, true);
  dv.setUint32(20, 0, true);
  dv.setUint32(24, 0, true);

  let o = 28;
  for (let i = 0; i < rgba.length; i += 4) {
    const r = rgba[i], g = rgba[i + 1], b = rgba[i + 2];
    const rgb565 = ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3);
    out[o++] = rgb565 & 0xFF;
    out[o++] = (rgb565 >> 8) & 0xFF;
  }
  return out;
}

/**
 * Pack files into exact esp_mmap_assets binary format:
 * - Header (12 bytes): stored_files (u32), checksum (u32), data_len (u32)
 * - Table (stored_files * 44 bytes): name[32], size(u32), offset(u32), width(u16), height(u16)
 * - Data: for each file, 0x5A 0x5A + file bytes
 * - Checksum: sum(all bytes from offset 12 to end) & 0xFFFF
 */
function packEspMmapAssets(files) {
  const count = files.length;
  const tableSize = count * 44;
  let dataSectionSize = 0;
  for (const f of files) dataSectionSize += 2 + f.bytes.length;

  const totalSize = 12 + tableSize + dataSectionSize;
  const out = new Uint8Array(totalSize);
  const dv = new DataView(out.buffer);
  const enc = new TextEncoder();

  dv.setUint32(0, count, true);
  dv.setUint32(8, totalSize - 12, true);

  let curOffset = 0;
  const dataStart = 12 + tableSize;

  for (let i = 0; i < count; i++) {
    const f = files[i];
    const entryBase = 12 + i * 44;
    const nameBytes = enc.encode(f.name).slice(0, 31);
    out.set(nameBytes, entryBase);
    dv.setUint32(entryBase + 32, f.bytes.length, true);
    dv.setUint32(entryBase + 36, curOffset, true);
    dv.setUint16(entryBase + 40, f.width || 0, true);
    dv.setUint16(entryBase + 42, f.height || 0, true);

    out[dataStart + curOffset] = 0x5A;
    out[dataStart + curOffset + 1] = 0x5A;
    out.set(f.bytes, dataStart + curOffset + 2);
    curOffset += 2 + f.bytes.length;
  }

  let checksum = 0;
  for (let i = 12; i < totalSize; i++) {
    checksum = (checksum + out[i]) & 0xFFFF;
  }
  dv.setUint32(4, checksum, true);
  return out;
}

async function fetchBinary(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Không tải được ${url} (HTTP ${res.status})`);
  return new Uint8Array(await res.arrayBuffer());
}

function setBuildProgress(show, label, pct) {
  const wrap = document.getElementById("ttProg");
  wrap.classList.toggle("active", show);
  if (show) {
    document.getElementById("prog-label").textContent = label;
    document.getElementById("prog-pct").textContent = `${Math.round(pct)}%`;
    document.getElementById("prog-fill").style.width = `${Math.round(pct)}%`;
  }
}

function slugifyThemeName(name) {
  return String(name || "theme-cua-toi")
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "theme-cua-toi";
}

// ---------- Build assets.bin ----------
async function buildAssetsBin() {
  const btn = document.getElementById("btn-build-theme");
  btn.disabled = true;
  setBuildProgress(true, "Đang tải phông chữ tiếng Việt...", 5);

  try {
    const entries = [];

    // 1. Font
    let fontFilename = state.fontPresetId;
    let fontBytes;
    if (state.fontSource === "custom" && customFontFile) {
      fontFilename = customFontFile.name.replace(/[^A-Za-z0-9_.-]/g, "_").slice(0, 30);
      fontBytes = customFontFile.bytes;
    } else {
      const fPreset = FONT_PRESETS.find(f => f.id === state.fontPresetId) || FONT_PRESETS[0];
      fontFilename = fPreset.id;
      fontBytes = await fetchBinary(fPreset.url);
    }
    entries.push({ name: fontFilename, bytes: fontBytes, width: 0, height: 0 });

    // 2. Wake Word (srmodels.bin)
    setBuildProgress(true, "Đang tải câu gọi robot (srmodels.bin)...", 20);
    const srUrl = `${LOCAL_PRESETS_BASE}/srmodels/${state.wakeWord}.bin`;
    const srBytes = await fetchBinary(srUrl);
    entries.push({ name: "srmodels.bin", bytes: srBytes, width: 0, height: 0 });

    // 3. Emotions (21 files) — tự động resize vừa khung an toàn để KHÔNG đè icon Wi-Fi / Pin
    const emojiCollection = [];
    const targetFrame = getEmotionFrameDimensions();
    for (let i = 0; i < EMOTIONS.length; i++) {
      const e = EMOTIONS[i];
      setBuildProgress(true, `Đang xử lý & đóng gói cảm xúc (${i + 1}/21): ${e.vi}...`, 25 + (i / EMOTIONS.length) * 55);
      let fileName = `${e.id}.png`;
      let bytes, w = 0, h = 0;

      if (state.emotionSource === "custom") {
        const entry = customEmotions[e.id] || customEmotions["neutral"];
        if (entry) {
          fileName = `${e.id}.${entry.ext}`;
          if (entry.ext === "gif") {
            const resized = await resizeGifBytes(entry.bytes, targetFrame.w, targetFrame.h);
            bytes = resized.bytes; w = resized.w; h = resized.h;
          } else {
            const resized = await resizeImageToPng(entry.bytes, targetFrame.w, targetFrame.h);
            bytes = resized.bytes; w = resized.w; h = resized.h;
          }
        } else {
          bytes = await fetchBinary(`${CDN_BASE}/emojis/twemoji64/${e.id}.png`);
          const d = parsePngDimensions(bytes);
          w = d.w; h = d.h;
        }
      } else if (state.emotionSource === "shop") {
        fileName = `${e.id}.gif`;
        const rawGif = await fetchBinary(`${LOCAL_PRESETS_BASE}/${state.shopPackId}/${e.id}.gif`);
        const resized = await resizeGifBytes(rawGif, targetFrame.w, targetFrame.h);
        bytes = resized.bytes;
        w = resized.w;
        h = resized.h;
      } else {
        const pack = BUILTIN_EMOTION_PACKS.find(p => p.id === state.builtinPackId) || BUILTIN_EMOTION_PACKS[0];
        fileName = `${e.id}.${pack.ext}`;
        bytes = await fetchBinary(`${pack.baseUrl}/${e.id}.${pack.ext}`);
        const d = pack.ext === "gif" ? parseGifDimensions(bytes) : parsePngDimensions(bytes);
        w = d.w; h = d.h;
      }
      entries.push({ name: fileName, bytes, width: w, height: h });
      emojiCollection.push({ name: e.id, file: fileName });
    }

    // 4. Backgrounds (LVGL v9 RGB565 .raw)
    setBuildProgress(true, "Đang xuất hình nền RGB565 khớp màn hình...", 85);
    const darkRaw = buildLvglBackgroundRaw("dark");
    const lightRaw = state.shareBg ? darkRaw : buildLvglBackgroundRaw("light");

    const skinDark = {
      text_color: state.darkTxColor,
      background_color: state.darkBgColor
    };
    const skinLight = {
      text_color: state.shareBg ? state.darkTxColor : state.lightTxColor,
      background_color: state.shareBg ? state.darkBgColor : state.lightBgColor
    };

    if (darkRaw) {
      entries.push({ name: "background_dark.raw", bytes: darkRaw, width: 0, height: 0 });
      skinDark.background_image = "background_dark.raw";
    }
    if (state.shareBg && darkRaw) {
      skinLight.background_image = "background_dark.raw";
    } else if (lightRaw) {
      entries.push({ name: "background_light.raw", bytes: lightRaw, width: 0, height: 0 });
      skinLight.background_image = "background_light.raw";
    }

    // 5. index.json (inserted right after srmodels.bin)
    const indexJsonObj = {
      version: 1,
      chip_model: state.chip,
      hide_subtitle: !!state.hideSubtitle,
      display_config: {
        width: state.screenW,
        height: state.screenH,
        monochrome: false,
        color: "RGB565"
      },
      srmodels: "srmodels.bin",
      text_font: fontFilename,
      skin: {
        light: skinLight,
        dark: skinDark
      },
      emoji_collection: emojiCollection
    };
    const indexBytes = new TextEncoder().encode(JSON.stringify(indexJsonObj, null, 2));
    entries.splice(2, 0, { name: "index.json", bytes: indexBytes, width: 0, height: 0 });

    // 6. Pack assets.bin
    setBuildProgress(true, "Đang đóng gói assets.bin & tính checksum...", 94);
    const packed = packEspMmapAssets(entries);
    const filename = `${slugifyThemeName(state.themeName)}-${state.screenW}x${state.screenH}.bin`;
    const wakeLabel = (WAKE_WORDS.find(w => w.id === state.wakeWord)?.label || state.wakeWord).replace(" (mặc định)", "");

    builtResult = {
      bytes: packed,
      filename,
      size: packed.length,
      meta: `${state.screenW}×${state.screenH} · ${wakeLabel} · ${formatBytes(packed.length)}`,
      thumbUrl: getPreviewEmotionUrl("neutral")
    };
    isBuildStale = false;

    setBuildProgress(true, "Xong · Đóng gói thành công!", 100);
    renderStep6Output();
  } catch (err) {
    console.error(err);
    alert("Lỗi khi tạo assets.bin: " + (err.message || err));
    setBuildProgress(false);
  } finally {
    btn.disabled = false;
  }
}

function renderStep6Output() {
  const card = document.getElementById("step6-output");
  if (!builtResult) {
    card.classList.remove("visible");
    return;
  }
  card.classList.add("visible");
  document.getElementById("out-thumb-img").src = builtResult.thumbUrl;
  document.getElementById("out-title").textContent = state.themeName || "Theme của tôi";
  document.getElementById("out-filename").textContent = builtResult.filename;
  document.getElementById("out-meta").textContent = builtResult.meta;
  document.getElementById("out-stale-banner").classList.toggle("visible", isBuildStale);
}

function downloadBuiltBin() {
  if (!builtResult) return;
  const blob = new Blob([builtResult.bytes], { type: "application/octet-stream" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = builtResult.filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

// ---------- WebSerial Flasher (Only writes `assets` partition!) ----------
function setFlashProgress(show, label, pct) {
  const wrap = document.getElementById("flashProg");
  wrap.classList.toggle("active", show);
  if (show) {
    document.getElementById("flash-prog-label").textContent = label;
    document.getElementById("flash-prog-pct").textContent = `${Math.round(pct)}%`;
    document.getElementById("flash-prog-fill").style.width = `${Math.round(pct)}%`;
  }
}

function uint8ToBinaryString(u8) {
  let out = "";
  const chunk = 0x8000;
  for (let i = 0; i < u8.length; i += chunk) {
    out += String.fromCharCode.apply(null, u8.subarray(i, i + chunk));
  }
  return out;
}

function parseAssetsPartitionFromTable(u8) {
  const dv = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  for (let off = 0; off + 32 <= u8.length; off += 32) {
    if (u8[off] !== 0xAA || u8[off + 1] !== 0x50) break;
    const offset = dv.getUint32(off + 4, true);
    const size = dv.getUint32(off + 8, true);
    let name = "";
    for (let k = 12; k < 28 && u8[off + k] !== 0; k++) {
      name += String.fromCharCode(u8[off + k]);
    }
    if (name === "assets") return { offset, size };
  }
  return null;
}

async function flashAssetsToUsb() {
  if (!builtResult) return;
  if (!("serial" in navigator)) {
    alert("Trình duyệt của bạn không hỗ trợ WebSerial. Vui lòng dùng Chrome hoặc Edge trên máy tính!");
    return;
  }

  // Auto-disconnect serial monitor to prevent COM port conflict
  if (serialPort) {
    await disconnectSerialLog();
  }

  const btn = document.getElementById("btn-flash-usb");
  btn.disabled = true;
  setFlashProgress(true, "Đang chọn cổng USB ESP32...", 2);

  let transport = null;
  try {
    const port = await navigator.serial.requestPort();
    const { ESPLoader, Transport } = await import("../theme-studio/vendor/esptool-js.bundle.js");
    transport = new Transport(port, true);
    const loader = new ESPLoader({
      transport,
      baudrate: 460800,
      terminal: {
        clean() {},
        writeLine(s) { appendSerialLog(`[FLASH] ${s}\n`); },
        write(s) { appendSerialLog(s); }
      }
    });

    setFlashProgress(true, "Đang kết nối chip ESP32...", 8);
    await loader.main();

    // Read Partition Table at 0x8000 to locate exact `assets` partition
    setFlashProgress(true, "Đang đọc bảng phân vùng (0x8000)...", 15);
    let assetsOffset = 0x00800000;
    let assetsMaxSize = 0x00680000;
    try {
      const ptableBytes = await loader.readFlash(0x8000, 0x1000);
      const found = parseAssetsPartitionFromTable(ptableBytes);
      if (found) {
        assetsOffset = found.offset;
        assetsMaxSize = found.size;
        appendSerialLog(`[FLASH] Tìm thấy phân vùng assets: offset=0x${assetsOffset.toString(16)}, size=${formatBytes(assetsMaxSize)}\n`);
      }
    } catch (e) {
      appendSerialLog(`[FLASH] Không đọc được bảng phân vùng, dùng mặc định 0x800000.\n`);
    }

    if (builtResult.bytes.length > assetsMaxSize) {
      throw new Error(`File theme (${formatBytes(builtResult.bytes.length)}) vượt quá dung lượng phân vùng assets trên mạch (${formatBytes(assetsMaxSize)}). Hãy chọn phông chữ nhỏ hơn hoặc bộ cảm xúc nhẹ hơn!`);
    }

function md5BinaryString(bstr) {
  function cmn(q, a, b, x, s, t) {
    a = (a + q + x + t) | 0;
    return (((a << s) | (a >>> (32 - s))) + b) | 0;
  }
  function ff(a, b, c, d, x, s, t) { return cmn((b & c) | (~b & d), a, b, x, s, t); }
  function gg(a, b, c, d, x, s, t) { return cmn((b & d) | (c & ~d), a, b, x, s, t); }
  function hh(a, b, c, d, x, s, t) { return cmn(b ^ c ^ d, a, b, x, s, t); }
  function ii(a, b, c, d, x, s, t) { return cmn(c ^ (b | ~d), a, b, x, s, t); }

  const len = bstr.length;
  const nBlocks = ((len + 8) >>> 6) + 1;
  const words = new Int32Array(nBlocks * 16);
  for (let i = 0; i < len; i++) {
    words[i >>> 2] |= (bstr.charCodeAt(i) & 0xFF) << ((i % 4) * 8);
  }
  words[len >>> 2] |= 0x80 << ((len % 4) * 8);
  const bitLen = len * 8;
  words[nBlocks * 16 - 2] = bitLen & 0xFFFFFFFF;
  words[nBlocks * 16 - 1] = Math.floor(len / 0x20000000);

  let a = 1732584193, b = -271733879, c = -1732584194, d = 271733878;
  for (let i = 0; i < words.length; i += 16) {
    const oa = a, ob = b, oc = c, od = d;
    a = ff(a, b, c, d, words[i + 0], 7, -680876936); d = ff(d, a, b, c, words[i + 1], 12, -389564586);
    c = ff(c, d, a, b, words[i + 2], 17, 606105819); b = ff(b, c, d, a, words[i + 3], 22, -1044525330);
    a = ff(a, b, c, d, words[i + 4], 7, -176418897); d = ff(d, a, b, c, words[i + 5], 12, 1200080426);
    c = ff(c, d, a, b, words[i + 6], 17, -1473231341); b = ff(b, c, d, a, words[i + 7], 22, -45705983);
    a = ff(a, b, c, d, words[i + 8], 7, 1770035416); d = ff(d, a, b, c, words[i + 9], 12, -1958414417);
    c = ff(c, d, a, b, words[i + 10], 17, -42063); b = ff(b, c, d, a, words[i + 11], 22, -1990404162);
    a = ff(a, b, c, d, words[i + 12], 7, 1804603682); d = ff(d, a, b, c, words[i + 13], 12, -40341101);
    c = ff(c, d, a, b, words[i + 14], 17, -1502002290); b = ff(b, c, d, a, words[i + 15], 22, 1236535329);

    a = gg(a, b, c, d, words[i + 1], 5, -165796510); d = gg(d, a, b, c, words[i + 6], 9, -1069501632);
    c = gg(c, d, a, b, words[i + 11], 14, 643717713); b = gg(b, c, d, a, words[i + 0], 20, -373897302);
    a = gg(a, b, c, d, words[i + 5], 5, -701558691); d = gg(d, a, b, c, words[i + 10], 9, 38016083);
    c = gg(c, d, a, b, words[i + 15], 14, -660478335); b = gg(b, c, d, a, words[i + 4], 20, -405537848);
    a = gg(a, b, c, d, words[i + 9], 5, 568446438); d = gg(d, a, b, c, words[i + 14], 9, -1019803690);
    c = gg(c, d, a, b, words[i + 3], 14, -187363961); b = gg(b, c, d, a, words[i + 8], 20, 1163531501);
    a = gg(a, b, c, d, words[i + 13], 5, -1444681467); d = gg(d, a, b, c, words[i + 2], 9, -51403784);
    c = gg(c, d, a, b, words[i + 7], 14, 1735328473); b = gg(b, c, d, a, words[i + 12], 20, -1926607734);

    a = hh(a, b, c, d, words[i + 5], 4, -378558); d = hh(d, a, b, c, words[i + 8], 11, -2022574463);
    c = hh(c, d, a, b, words[i + 11], 16, 1839030562); b = hh(b, c, d, a, words[i + 14], 23, -35309556);
    a = hh(a, b, c, d, words[i + 1], 4, -1530992060); d = hh(d, a, b, c, words[i + 4], 11, 1272893353);
    c = hh(c, d, a, b, words[i + 7], 16, -155497632); b = hh(b, c, d, a, words[i + 10], 23, -1094730640);
    a = hh(a, b, c, d, words[i + 13], 4, 681279174); d = hh(d, a, b, c, words[i + 0], 11, -358537222);
    c = hh(c, d, a, b, words[i + 3], 16, -722521979); b = hh(b, c, d, a, words[i + 6], 23, 76029189);
    a = hh(a, b, c, d, words[i + 9], 4, -640364487); d = hh(d, a, b, c, words[i + 12], 11, -421815835);
    c = hh(c, d, a, b, words[i + 15], 16, 530742520); b = hh(b, c, d, a, words[i + 2], 23, -995338651);

    a = ii(a, b, c, d, words[i + 0], 6, -198630844); d = ii(d, a, b, c, words[i + 7], 10, 1126891415);
    c = ii(c, d, a, b, words[i + 14], 15, -1416354905); b = ii(b, c, d, a, words[i + 5], 21, -57434055);
    a = ii(a, b, c, d, words[i + 12], 6, 1700485571); d = ii(d, a, b, c, words[i + 3], 10, -1894986606);
    c = ii(c, d, a, b, words[i + 10], 15, -1051523); b = ii(b, c, d, a, words[i + 1], 21, -2054922799);
    a = ii(a, b, c, d, words[i + 8], 6, 1873313359); d = ii(d, a, b, c, words[i + 15], 10, -30611744);
    c = ii(c, d, a, b, words[i + 6], 15, -1560198380); b = ii(b, c, d, a, words[i + 13], 21, 1309151649);
    a = ii(a, b, c, d, words[i + 4], 6, -145523070); d = ii(d, a, b, c, words[i + 11], 10, -1120210379);
    c = ii(c, d, a, b, words[i + 2], 15, 718787259); b = ii(b, c, d, a, words[i + 9], 21, -343485551);

    a = (a + oa) | 0; b = (b + ob) | 0; c = (c + oc) | 0; d = (d + od) | 0;
  }
  const hex = n => {
    let s = "";
    for (let j = 0; j < 4; j++) s += ((n >>> (j * 8)) & 0xFF).toString(16).padStart(2, "0");
    return s;
  };
  return hex(a) + hex(b) + hex(c) + hex(d);
}

    // Cấu hình SPI Flash size thực tế (VD: 16MB) bằng lệnh ESP_SPI_SET_PARAMS (0x0B) giống esptool.py
    try {
      const flashKb = await loader.getFlashSize();
      const totalFlashBytes = (flashKb && flashKb > 0) ? (flashKb * 1024) : (16 * 1024 * 1024);
      const spiParams = new Uint8Array(24);
      const spDv = new DataView(spiParams.buffer);
      spDv.setUint32(0, 0, true);               // fl_id
      spDv.setUint32(4, totalFlashBytes, true); // total_size
      spDv.setUint32(8, 65536, true);           // block_size (64KB)
      spDv.setUint32(12, 4096, true);           // sector_size (4KB)
      spDv.setUint32(16, 256, true);            // page_size
      spDv.setUint32(20, 0xFFFF, true);         // status_mask
      await loader.checkCommand("configure spi flash size", 0x0B, spiParams);
      appendSerialLog(`[FLASH] Đã cấu hình SPI Flash size: ${Math.round(totalFlashBytes / (1024 * 1024))} MB\n`);
    } catch (e) {
      appendSerialLog(`[FLASH] Lưu ý cấu hình SPI Flash: ${e.message || e}\n`);
    }

    // Pad 0xFF chia hết cho 4 byte để tránh bug padding (len % 4 == 1 hoặc 3) bên trong esptool-js.bundle.js
    const totalLen = builtResult.bytes.length;
    const paddedLen = Math.ceil(totalLen / 4) * 4;
    const alignedBytes = new Uint8Array(paddedLen);
    alignedBytes.fill(0xFF);
    alignedBytes.set(builtResult.bytes, 0);

    // Ghi 1 lần duy nhất qua writeFlash kèm xác minh MD5 toàn bộ file bằng chính stub trên ESP32
    setFlashProgress(true, `Đang nạp vào phân vùng assets (0x${assetsOffset.toString(16)})...`, 20);
    await loader.writeFlash({
      fileArray: [{
        data: uint8ToBinaryString(alignedBytes),
        address: assetsOffset
      }],
      flashSize: "keep",
      flashMode: "keep",
      flashFreq: "keep",
      eraseAll: false,
      compress: true,
      calculateMD5Hash: (img) => md5BinaryString(img),
      reportProgress: (_idx, written, total) => {
        const pct = 20 + (written / Math.max(1, total)) * 78;
        setFlashProgress(true, `Đang nạp assets.bin (${Math.round((written / Math.max(1, total)) * 100)}%)...`, pct);
      }
    });
    appendSerialLog(`[FLASH] ✅ MD5 khớp 100% giữa file và bộ nhớ Flash!\n`);

    appendSerialLog(`[FLASH] Ghi dữ liệu thành công! Đang khởi động lại mạch (Hard Reset)...\n`);
    try {
      await transport.setDTR(false);
      await new Promise(r => setTimeout(r, 100));
      await transport.setRTS(true);
      await new Promise(r => setTimeout(r, 120));
      await transport.setRTS(false);
    } catch (e) {}
    setFlashProgress(true, "✅ Nạp thành công! Robot đang khởi động lại...", 100);
    appendSerialLog(`[FLASH] ✅ Hoàn tất nạp ${builtResult.filename} vào 0x${assetsOffset.toString(16)}!\n`);
  } catch (err) {
    console.error(err);
    appendSerialLog(`[FLASH ERROR] ${err.message || err}\n`);
    alert("Lỗi nạp USB: " + (err.message || err));
    setFlashProgress(false);
  } finally {
    try { if (transport) await transport.disconnect(); } catch (e) {}
    btn.disabled = false;
  }
}

// ---------- ESP32 Serial Monitor ----------
function appendSerialLog(text) {
  serialLogBuffer += text;
  if (serialLogBuffer.length > 60000) serialLogBuffer = serialLogBuffer.slice(-50000);
  const box = document.getElementById("serial-terminal");
  if (box) {
    box.textContent = serialLogBuffer;
    box.scrollTop = box.scrollHeight;
  }
}

async function toggleSerialLog() {
  if (serialPort) {
    await disconnectSerialLog();
    return;
  }
  if (!("serial" in navigator)) {
    alert("Trình duyệt không hỗ trợ WebSerial. Hãy dùng Chrome / Edge trên máy tính!");
    return;
  }
  try {
    serialPort = await navigator.serial.requestPort();
    const baud = parseInt(document.getElementById("serial-baud").value, 10) || 115200;
    await serialPort.open({ baudRate: baud });
    serialKeepReading = true;
    document.getElementById("btn-serial-connect").textContent = "⏹️ Ngắt kết nối";
    appendSerialLog(`\n--- Đã kết nối Serial (${baud} baud) ---\n`);
    readSerialLoop();
  } catch (err) {
    serialPort = null;
    alert("Không mở được cổng Serial: " + (err.message || err));
  }
}

async function readSerialLoop() {
  const decoder = new TextDecoder();
  while (serialPort && serialPort.readable && serialKeepReading) {
    serialReader = serialPort.readable.getReader();
    try {
      while (true) {
        const { value, done } = await serialReader.read();
        if (done) break;
        if (value) appendSerialLog(decoder.decode(value, { stream: true }));
      }
    } catch (e) {
      break;
    } finally {
      try { serialReader.releaseLock(); } catch (e) {}
      serialReader = null;
    }
  }
}

async function disconnectSerialLog() {
  serialKeepReading = false;
  try { if (serialReader) await serialReader.cancel(); } catch (e) {}
  try { if (serialPort) await serialPort.close(); } catch (e) {}
  serialPort = null;
  const btn = document.getElementById("btn-serial-connect");
  if (btn) btn.textContent = "🔌 Kết nối log";
  appendSerialLog(`\n--- Đã ngắt kết nối Serial ---\n`);
}

async function resetSerialDevice() {
  if (!serialPort) {
    alert("Hãy bấm 'Kết nối log' trước khi Reset thiết bị!");
    return;
  }
  try {
    await serialPort.setSignals({ dataTerminalReady: false, requestToSend: true });
    await new Promise(r => setTimeout(r, 120));
    await serialPort.setSignals({ dataTerminalReady: false, requestToSend: false });
    appendSerialLog("\n--- Đã gửi lệnh Reset thiết bị ---\n");
  } catch (e) {
    alert("Không thể reset thiết bị: " + e.message);
  }
}

function copySerialLog() {
  navigator.clipboard?.writeText(serialLogBuffer || "");
}

function downloadSerialLog() {
  const blob = new Blob([serialLogBuffer || ""], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `esp32-log-${Date.now()}.txt`;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

function clearSerialLog() {
  serialLogBuffer = "";
  const box = document.getElementById("serial-terminal");
  if (box) box.textContent = "";
}

// ---------- Dropzone Events & Expose Globals ----------
function initDropzone() {
  const dz = document.getElementById("emo-dropzone");
  if (!dz) return;
  dz.addEventListener("dragover", e => { e.preventDefault(); dz.classList.add("dragover"); });
  dz.addEventListener("dragleave", () => dz.classList.remove("dragover"));
  dz.addEventListener("drop", e => {
    e.preventDefault();
    dz.classList.remove("dragover");
    const files = e.dataTransfer?.files;
    if (!files || files.length === 0) return;
    if (files.length === 1 && /\.zip$/i.test(files[0].name)) {
      handleCustomEmotionZip(files[0]);
    } else {
      handleCustomEmotionFiles(files);
    }
  });
}

Object.assign(window, {
  toggleUiTheme,
  toggleStep,
  applyQuickPreset,
  confirmResetAll,
  onThemeNameInput,
  selectScreen,
  toggleCustomScreenPanel,
  onCustomSizeInput,
  selectChip,
  selectWakeWord,
  setFontSource,
  selectFontPreset,
  onCustomFontUpload,
  onHideSubtitleChange,
  setEmotionSource,
  selectBuiltinPack,
  selectShopPack,
  selectFrameMode,
  onCustomFrameSizeInput,
  renderShopPacksGrid,
  openSingleSlotPicker,
  clearSingleSlot,
  clearAllCustomEmotions,
  handleSingleSlotUpload,
  handleCustomEmotionFiles,
  handleCustomEmotionZip,
  onShareBgChange,
  onBgColorChange,
  onTxColorChange,
  selectBgPreset,
  onBgImageUpload,
  clearBgImage,
  setPreviewMode,
  selectPreviewEmotion,
  buildAssetsBin,
  downloadBuiltBin,
  flashAssetsToUsb,
  toggleSerialLog,
  resetSerialDevice,
  copySerialLog,
  downloadSerialLog,
  clearSerialLog
});

loadDraft();
updateUiThemeBtn();
initDropzone();
renderAll();
