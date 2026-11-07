# KẾ HOẠCH TRIỂN KHAI: Hệ thống Log Chẩn Đoán Đơn Hàng Lỗi (v2 – Handoff cho Agent)

> **Dành cho agent thực thi.** Đọc hết mục 0–4 trước khi code. Làm theo thứ tự task ở mục 5.
> Mỗi task có: file, bước làm, tiêu chí chấp nhận (AC). Không tự ý mở rộng phạm vi ngoài mục 5.
> Bản này thay thế `KE_HOACH_LOG_DON_HANG.md` (v1). Các điểm khác biệt so với v1 được đánh dấu **[v2]**.

---

## 0. Metadata

| Mục | Giá trị |
|---|---|
| Repo | `/Users/kiwi/chuhieushop` (branch `main`) |
| Kiến trúc | Static HTML (GitHub Pages) + Google Apps Script Web App (`Code.gs`) + Google Sheets |
| File sẽ sửa | `Code.gs`, `index.html` (storefront), `admin.html` (quản trị), `test.py` |
| Kiểm thử | `python3 test.py` (hiện 81 test, phải pass 100%). Pre-commit hook tự chạy test. |
| Ngôn ngữ UI | Tiếng Việt |
| Commit message | Kết thúc bằng dòng `Co-Authored-By:` theo hướng dẫn của harness. Chỉ commit/push khi user yêu cầu. |

---

## 1. Mục tiêu & Phi mục tiêu

### Mục tiêu
1. Khi một đơn hàng **không vào được** sheet `Đơn Hàng`, Admin biết **chính xác nguyên nhân** (lỗi mạng phía khách / server từ chối / server exception / Google trả lỗi không phải JSON / quá tải lock).
2. Admin xem được danh sách đơn lỗi trong `admin.html` và **khôi phục 1-click** thành đơn hàng thật, **không tạo đơn trùng**.
3. **Zero-overhead cho luồng thành công:** đơn thành công không phát sinh thêm request, không thêm lần ghi Sheet, không thêm thời gian giữ Lock.

### Phi mục tiêu (KHÔNG làm)
- Không tự động gửi lại đơn (auto-resubmit) khi khách quay lại trang.
- Không thay đổi cách mở Zalo (`window.open("https://zalo.me/...")`) hay thêm delay trước khi mở Zalo.
- Không ghi log cho đơn thành công. Không ghi log lỗi của các action admin.
- Không đổi format/thứ tự 13 cột hiện có của sheet `Đơn Hàng`.

---

## 2. Ràng buộc cứng (vi phạm = task fail)

| # | Ràng buộc |
|---|---|
| C1 | `python3 test.py` pass 100% sau mỗi task. Không xoá/sửa test cũ để cho pass. |
| C2 | **Không** gọi bất kỳ thao tác ghi log nào **bên trong** callback của `withLock(...)`. |
| C3 | Mọi hàm log phải bọc `try/catch` toàn bộ – log lỗi **không bao giờ** được làm hỏng response trả về cho khách. |
| C4 | Không lộ `costPrice` ra API công khai. Không lộ `ADMIN_PASS_HASH`. |
| C5 | Mọi giá trị ghi vào Sheet từ input người dùng phải qua `sanitize()` và `safeCell()` (có sẵn ở `Code.gs:13-23`). |
| C6 | Mọi đọc/ghi `localStorage` ở client phải bọc `try/catch` (Safari private mode có thể throw). |
| C7 | Mọi `document.getElementById('x')` mới trong `admin.html`/`index.html` phải có phần tử `id="x"` tương ứng (test `test_*_dom_ids` sẽ kiểm tra). |
| C8 | Mọi `action: "..."` mới gọi từ frontend phải có `action === "..."` trong `Code.gs` (test `test_actions_handled_in_backend`). |
| C9 | Không giữ thêm thời gian Lock cho đơn thành công; không thêm `getLastColumn()`/`getRange()` nào vào nhánh thành công của `handleCreateOrder`. |
| C10 | Nội dung HTML render trong admin phải qua `escapeHtml()` (có sẵn `admin.html:2886`). |

---

## 3. Hiện trạng code (đã xác minh – dùng làm điểm neo)

| Vị trí | Nội dung |
|---|---|
| `Code.gs:9-11` | `jsonOutput(obj)`, `authError()`, `fail(msg)` → `{status:"error", msg}` |
| `Code.gs:13-23` | `sanitize(str, maxLen)`, `safeCell(v)` |
| `Code.gs:516-520` | `withLock(fn)`: `LockService.getScriptLock().waitLock(20000)` **một lần**, throw khi timeout (KHÔNG có retry 3 lần như v1 ghi) |
| `Code.gs:894-1129` | `handleCreateOrder(doc, payload)` – các nhánh `return fail(...)` liệt kê ở mục 4.4 |
| `Code.gs:927-930`, `1086-1088` | Dedup bằng `CacheService` key `ord_dedup_*` (TTL 600s) → trả `{status:"success", deduplicated:true}` |
| `Code.gs:1118-1124` | `appendRow` 13 cột: `[orderId, timestamp, name, "'"+phone, address, lines, total, note, "Khách đặt hàng", cartJSON, false, "", adminNote]` |
| `Code.gs:1194-1227` | `getOrdersList` đọc theo **chỉ số cột** → thêm cột 14 an toàn |
| `Code.gs:2037-2081` | `doPost`: action công khai (`createOrder`, `getLeaderboard`, `login`, `logout`) đứng **trước** `if (!isValidSession(payload.token)) return authError();` (dòng 2048). `catch` cuối trả `fail("Lỗi máy chủ, vui lòng thử lại")` – **không log gì** |
| `index.html:6566-6567` | `ORDER_DEDUP_WINDOW_MS = 15 phút`, `ORDER_DEDUP_STORAGE_KEY = 'chuhieu_last_submitted_order_v1'` (sessionStorage) |
| `index.html:6843` | `handleOrderSaveFailure(orderText, reasonMsg)` – hiện modal cảnh báo "CHƯA LƯU TỰ ĐỘNG" |
| `index.html:6876-6914` | `sendOrderToSheetWithRetry(orderData, orderText, retriesLeft)` – `fetch(API_URL, {method:'POST', keepalive:true, body})` → `.then(r => r.json())`. **Lỗi:** nếu Google trả HTML (quota/timeout/quyền), `r.json()` throw → rơi vào `.catch` → bị coi là **lỗi mạng** |
| `index.html:6916-7076` | `checkout(openZalo)` – build `orderText`, `copyTextToClipboard`, kiểm tra `isDuplicateSubmission`, build `orderData`, gọi `sendOrderToSheetWithRetry(orderData, orderText, 2)`, rồi `window.open(zalo)` |
| `admin.html:1729-1736` | Cụm nút bên phải toolbar tab Đơn hàng (`btn-export-spx-toolbar`, `btn-open-spx-settings`) – chèn nút mới vào đây |
| `admin.html:2853` | `const API_URL = ...` |
| `admin.html:3630` | Pattern xử lý lỗi chuẩn: `if (data.status === "error") { if (data.code === "AUTH") logout(); else alert(data.msg); ... }` |

---

## 4. Hợp đồng dữ liệu (Data Contracts)

### 4.1 Trace ID **[v2]**
- Sinh ở client, **1 lần cho mỗi đơn mới**, tái sử dụng qua mọi lần retry và cho lần bấm trùng.
- Format: `CH-<base36 timestamp, uppercase>-<4 ký tự [A-Z0-9] ngẫu nhiên>` → ví dụ `CH-MH7K2Q1A-7QF2`.
- Regex validate (dùng ở cả client & server): `/^CH-[A-Z0-9]{6,12}-[A-Z0-9]{4}$/`
- Gửi trong payload `createOrder` ở field `clientTraceId`.
- Server lưu vào **cột 14 (N) `Trace ID`** của sheet `Đơn Hàng` trong **cùng lệnh `appendRow`** (không thêm I/O).
- Server đặt cache `ord_trace_<traceId>` = `orderId` (TTL 21600s) sau khi ghi thành công (cache.put không phải Sheet I/O).
- Hiển thị cho khách: thêm 1 dòng cuối `orderText`: `\nMã tra cứu: CH-...` (để Admin nhận tin Zalo có thể tra).

### 4.2 Sheet mới `Nhật Ký Đơn Lỗi` (tự tạo khi ghi log đầu tiên)

| Cột | Header | Nội dung |
|---|---|---|
| A | `Thời gian` | `Utilities.formatDate(now, "GMT+7", "dd/MM/yyyy HH:mm:ss")` |
| B | `Trace ID` | `clientTraceId` (có thể rỗng nếu client cũ) |
| C | `Nguồn` | `SERVER_REJECT` \| `SERVER_EXCEPTION` \| `CLIENT_REPORT` |
| D | `Mã nguyên nhân` | 1 giá trị ở mục 4.4 |
| E | `Chi tiết` | message lỗi / `lastError` / HTTP status + snippet (≤ 500 ký tự) |
| F | `Khách hàng` | `Tên \| SĐT \| Địa chỉ` (đã sanitize) |
| G | `Giỏ hàng` | tóm tắt `tên xSL; ...` (≤ 500 ký tự) |
| H | `Payload` | JSON gốc rút gọn: `{name, phone, address, note, cartJSON, formDurationMs, clientTraceId}` (≤ 20000 ký tự) |
| I | `Trạng thái` | `Mới` \| `Đã lưu thực tế → DHxxx` \| `Đã khôi phục → DHxxx` |
| J | `Môi trường` | UA rút gọn (≤ 200 ký tự), `online=true/false`, `attempts=n` |

### 4.3 Sheet `Đơn Hàng` – thêm cột 14
- Header N1 = `Trace ID`. **Không** set header trong `handleCreateOrder` (vi phạm C9). Set header lazily trong `handleGetOrderLogs` hoặc `recoverOrderFromLog` (`if (sheet.getLastColumn() < 14 || sheet.getRange(1,14).getValue() !== "Trace ID")`).
- `appendRow` trong `handleCreateOrder` đổi từ 13 → 14 phần tử, phần tử 14 = `safeCell(traceId)` (rỗng nếu không hợp lệ).

### 4.4 Bảng mã nguyên nhân (`stageCode`)

| Mã | Ở đâu | Điều kiện (map từ code hiện tại) | Ghi dòng log? |
|---|---|---|---|
| `HP_TRAP` | `Code.gs:897-899` | honeypot có giá trị | **Không** – chỉ tăng counter cache |
| `FAST_SUBMIT` | `Code.gs:903-905` | `formDurationMs < 300` | **Không** – chỉ tăng counter cache |
| `INVALID_INPUT` | `Code.gs:912-914` | thiếu/sai tên, SĐT, địa chỉ | Có |
| `INVALID_CART` | `Code.gs:917-918`, `975` | JSON lỗi, rỗng, >50 món, SL sai | Có |
| `RATE_LIMIT_PHONE` | `Code.gs:934-936`, `1091-1093` | ≥3 đơn/SĐT/10 phút | Có |
| `RATE_LIMIT_GLOBAL` | `Code.gs:941-947`, `1098-1104` | quá tải đơn/phút | Có |
| `PRODUCT_NOT_FOUND` | `Code.gs:974` | id không tồn tại | Có |
| `PRODUCT_INACTIVE` | `Code.gs:995` | SP ẩn/xoá/ngừng bán | Có |
| `COMBO_EXPIRED` | `Code.gs:1067-1068` | Flash deal hết hạn & `expireAction === "hide"` | Có |
| `LOCK_TIMEOUT` | quanh `withLock` trong `handleCreateOrder` | exception có message match `/lock/i` | Có |
| `SERVER_EXCEPTION` | quanh `withLock` + `catch` của `doPost` | exception khác | Có |
| `BAD_REQUEST_JSON` | `catch` của `doPost` | `JSON.parse(e.postData.contents)` lỗi nhưng raw chứa `"createOrder"` | Có |
| `CLIENT_NETWORK_DROP` | `logClientOrderDiag` | client báo `errorKind = "network"` | Có |
| `SERVER_NON_JSON` | `logClientOrderDiag` | client báo `errorKind = "non_json"` (Google trả HTML) | Có |

### 4.5 API actions mới

Tất cả gọi qua `fetch(API_URL, { method: 'POST', body: JSON.stringify({...}) })` – **không** set header `Content-Type` (giữ simple request, tránh CORS preflight như code hiện tại).

#### (a) `logClientOrderDiag` – **công khai** (đặt TRƯỚC dòng `isValidSession` trong `doPost`)
Request:
```json
{
  "action": "logClientOrderDiag",
  "traceId": "CH-MH7K2Q1A-7QF2",
  "createdAt": 1762500000000,
  "attempts": 3,
  "errorKind": "network | non_json",
  "lastError": "TypeError: Failed to fetch | HTTP 200 <!DOCTYPE html>...",
  "online": true,
  "ua": "Mozilla/5.0 (iPhone; ...) Zalo/...",
  "order": { "name": "...", "phone": "...", "address": "...", "note": "...", "cartJSON": "[...]", "formDurationMs": 12345 }
}
```
Response:
- `{ "status": "success", "alreadySaved": true, "orderId": "DH..." }` – đơn thực ra đã vào Sheet (response bị mất). **Không ghi dòng log**, chỉ tăng counter `olog_resp_lost_<yyyyMMdd>`.
- `{ "status": "success", "logged": true }` – đã ghi log.
- `{ "status": "success", "logged": false, "reason": "rate_limited | duplicate" }`
- `{ "status": "error", "msg": "..." }` – payload không hợp lệ (traceId sai regex, payload > 8000 ký tự).

#### (b) `getOrderLogs` – admin (sau `isValidSession`)
Request: `{ "action": "getOrderLogs", "token": "..." }`
Response:
```json
{
  "status": "success",
  "logs": [
    { "row": 5, "time": "...", "traceId": "...", "source": "...", "code": "...", "detail": "...",
      "customer": "...", "cartSummary": "...", "state": "Mới", "env": "...", "canRecover": true }
  ],
  "counters": { "botHpTrap": 0, "botFastSubmit": 0, "responseLost": 0, "rateLimitedLogs": 0 }
}
```
- `logs` sắp xếp mới nhất trước. **Không trả cột H (Payload)** để response nhẹ.
- `canRecover = (state === "Mới") && payload parse được`.
- `counters` đọc từ cache theo ngày hôm nay (GMT+7); thiếu key → 0.

#### (c) `recoverOrderFromLog` – admin
Request: `{ "action": "recoverOrderFromLog", "token": "...", "row": 5, "traceId": "CH-..." }`
Response: `{ "status": "success", "orderId": "DH..." }` hoặc `{ "status": "success", "alreadySaved": true, "orderId": "DH..." }` hoặc `fail(msg)`.

#### (d) `clearOrderLogs` – admin
Request: `{ "action": "clearOrderLogs", "token": "...", "onlyResolved": true|false }`
- `onlyResolved=true`: chỉ xoá dòng có trạng thái khác `Mới`. `false`: xoá toàn bộ dòng dữ liệu (giữ header).
Response: `{ "status": "success", "deleted": n }`

### 4.6 Client pending queue (`localStorage`)
- Key: `chuhieu_pending_order_diag_v1`
- Value: JSON array, **tối đa 3 phần tử** (vượt thì bỏ phần tử cũ nhất), mỗi phần tử:
```json
{ "traceId": "...", "createdAt": 0, "attempts": 0, "errorKind": "", "lastError": "",
  "reportTries": 0, "order": { "name": "", "phone": "", "address": "", "note": "", "cartJSON": "", "formDurationMs": 0 } }
```

---

## 5. Danh sách Task (thực hiện theo thứ tự)

### T1 – `Code.gs`: helper thuần + hàm log (không đụng luồng cũ)

**Thêm các hàm (đặt gần `fail()` ở đầu file hoặc ngay trước `handleCreateOrder`):**

```js
var ORDER_LOG_SHEET = "Nhật Ký Đơn Lỗi";
var ORDER_LOG_MAX_ROWS = 220;      // vượt ngưỡng này mới dọn
var ORDER_LOG_TRIM_BATCH = 20;     // mỗi lần dọn xoá 20 dòng cũ nhất
var ORDER_LOG_RATE_PER_MIN = 5;
var ORDER_LOG_SILENT_CODES = ["HP_TRAP", "FAST_SUBMIT"];

function isValidTraceId(t)                // pure: regex mục 4.1
function classifyServerError(err)         // pure: /lock/i.test(String(err && err.message || err)) ? "LOCK_TIMEOUT" : "SERVER_EXCEPTION"
function buildOrderLogCartSummary(cartJSON) // pure: parse an toàn → "tên xSL; ..." cắt 500 ký tự; lỗi parse → "(giỏ hàng không đọc được)"
function bumpOrderLogCounter(name)        // cache key "olog_cnt_<name>_<yyyyMMdd GMT+7>", TTL 21600, try/catch
function logOrderFailure(doc, source, stageCode, reason, payload, extra) // xem dưới
```

**`logOrderFailure` – yêu cầu:**
1. Toàn bộ thân hàm trong `try { ... } catch (e) {}` (C3). Trả `{logged:boolean, reason?:string}`.
2. Nếu `stageCode` ∈ `ORDER_LOG_SILENT_CODES` → `bumpOrderLogCounter(...)`, return `{logged:false, reason:"silent"}`.
3. Chống trùng theo trace: nếu `traceId` hợp lệ và `cache.get("olog_tr_" + traceId)` → return `{logged:false, reason:"duplicate"}`; ngược lại `cache.put("olog_tr_"+traceId, "1", 21600)`.
4. Rate-limit: key `"olog_min_" + Math.floor(Date.now()/60000)`; nếu ≥ `ORDER_LOG_RATE_PER_MIN` → `bumpOrderLogCounter("rateLimitedLogs")`, return `{logged:false, reason:"rate_limited"}`; ngược lại tăng (TTL 90s).
5. Lấy/tạo sheet `ORDER_LOG_SHEET` (`doc.insertSheet` + `appendRow(header 10 cột)` + `setFrozenRows(1)`).
6. `appendRow` đúng 10 cột mục 4.2, mọi giá trị text qua `safeCell(sanitize(..., maxLen))`. Cột H: `JSON.stringify(rút gọn payload)` cắt 20000.
7. Dọn FIFO: chỉ khi `sheet.getLastRow() - 1 > ORDER_LOG_MAX_ROWS` → `sheet.deleteRows(2, ORDER_LOG_TRIM_BATCH)`.
8. **Không** dùng `withLock` trong hàm này (appendRow tự atomic; chấp nhận race nhỏ ở bước dọn).

**AC-T1**
- [ ] Các hàm pure (`isValidTraceId`, `classifyServerError`, `buildOrderLogCartSummary`) không tham chiếu `SpreadsheetApp/CacheService` → test Node trích xuất chạy được.
- [ ] `logOrderFailure` gọi với `doc = null` không throw.
- [ ] `python3 test.py` pass.

---

### T2 – `Code.gs`: gắn log vào `handleCreateOrder` + lưu Trace ID

**Bước:**
1. Đầu hàm: `var traceId = isValidTraceId(payload && payload.clientTraceId) ? String(payload.clientTraceId) : "";`
2. Tạo helper cục bộ:
   ```js
   function reject(code, msg) {
     logOrderFailure(doc, "SERVER_REJECT", code, msg, payload, { traceId: traceId });
     return fail(msg);
   }
   ```
3. Thay **mọi** `return fail("...")` **bên ngoài** `withLock` bằng `return reject("<CODE>", "...")` theo bảng 4.4. **Giữ nguyên chuỗi message** trả về cho khách.
4. **Bên trong** callback `withLock` (C2): KHÔNG gọi `reject`. Thay vào đó `return { __reject: "<CODE>", msg: "..." };` cho 3 nhánh rate-limit (`Code.gs:1091-1104`). Nhánh dedup và nhánh thành công giữ nguyên trả `jsonOutput(...)`.
5. Bọc lời gọi `withLock`:
   ```js
   var lockResult;
   try {
     lockResult = withLock(function () { ... });
   } catch (err) {
     var errCode = classifyServerError(err);
     logOrderFailure(doc, "SERVER_EXCEPTION", errCode, String(err && err.message || err), payload, { traceId: traceId });
     return fail(errCode === "LOCK_TIMEOUT"
       ? "Hệ thống đang bận. Vui lòng dán nội dung đơn đã copy gửi trực tiếp qua Zalo Shop!"
       : "Lỗi máy chủ, vui lòng thử lại");
   }
   if (lockResult && lockResult.__reject) return reject(lockResult.__reject, lockResult.msg);
   return lockResult;
   ```
6. Trong nhánh thành công: `appendRow` thêm phần tử thứ 14 `safeCell(traceId)`; sau `appendRow`: `if (traceId) { try { cache.put("ord_trace_" + traceId, orderId, 21600); } catch (e) {} }`.
7. Nhánh dedup (cả 2 chỗ): giữ nguyên.

**AC-T2**
- [ ] Không có chuỗi `logOrderFailure(` hoặc `reject(` nằm giữa `withLock(function () {` và `});` tương ứng trong `handleCreateOrder`.
- [ ] Message lỗi trả về khách giữ nguyên 100% so với trước (trừ trường hợp exception mới được bắt ở bước 5).
- [ ] Nhánh thành công: số lần gọi Sheet API không đổi (vẫn 1 `getSheetByName` + 1 `appendRow`; `getLastColumn` chỉ khi có `autoAdminNote` như cũ).
- [ ] Test cũ `test_allow_order_creation_on_stock_shortage_with_admin_warning`, `test_anti_spam_5_layer_security_and_leaderboard_protection`, `test_anti_duplicate_checkout_ux_and_zalo_mandatory_warning` vẫn pass.

---

### T3 – `Code.gs`: `doPost` catch + 4 action mới

**Bước:**
1. Trong `doPost`, thêm `if (action === "logClientOrderDiag") return handleLogClientOrderDiag(doc, payload);` **trước** dòng `if (!isValidSession(payload.token)) return authError();`.
2. Sau `isValidSession`, thêm:
   ```js
   if (action === "getOrderLogs") return handleGetOrderLogs(doc);
   if (action === "recoverOrderFromLog") return handleRecoverOrderFromLog(doc, payload);
   if (action === "clearOrderLogs") return handleClearOrderLogs(doc, payload);
   ```
3. Sửa `catch (error)` cuối `doPost`:
   - Khai báo `var doc, payload, raw;` **ngoài** `try` để dùng được trong `catch`.
   - Nếu `payload && payload.action === "createOrder"` → `logOrderFailure(doc || SpreadsheetApp.getActiveSpreadsheet(), "SERVER_EXCEPTION", classifyServerError(error), String(error && error.message || error), payload, { traceId: payload.clientTraceId })`.
   - Nếu `!payload` và `raw` (chuỗi `e.postData.contents`) chứa `"createOrder"` → log `BAD_REQUEST_JSON` với `payload = { rawSnippet: raw.substring(0, 2000) }`.
   - Tất cả trong `try {} catch(_) {}`; vẫn `return fail("Lỗi máy chủ, vui lòng thử lại")`.
4. `handleLogClientOrderDiag(doc, payload)`:
   - Validate: `isValidTraceId(payload.traceId)`; `JSON.stringify(payload).length <= 8000`; `payload.order` là object. Sai → `fail("Dữ liệu chẩn đoán không hợp lệ")`.
   - **Đối soát [v2]:**
     1. `cache.get("ord_trace_" + traceId)` → nếu có: `bumpOrderLogCounter("responseLost")`, return `{status:"success", alreadySaved:true, orderId}`.
     2. Nếu không: sheet `Đơn Hàng`, nếu `getLastColumn() >= 14 && getLastRow() >= 2` → `sheet.getRange(2, 14, lastRow - 1, 1).createTextFinder(traceId).matchEntireCell(true).findNext()`; tìm thấy → đọc cột A cùng dòng làm `orderId`, bump counter, return `alreadySaved`.
   - Map `errorKind`: `"non_json"` → `SERVER_NON_JSON`, còn lại → `CLIENT_NETWORK_DROP`.
   - `detail = sanitize(payload.lastError, 500)`; `extra = { traceId, env: "ua=" + sanitize(payload.ua,200) + " | online=" + !!payload.online + " | attempts=" + (parseInt(payload.attempts,10)||0) }`.
   - Gọi `logOrderFailure(doc, "CLIENT_REPORT", code, detail, payload.order (+ clientTraceId), extra)` → trả `{status:"success", logged, reason}`.
5. `handleGetOrderLogs(doc)`: đọc sheet log (không có → `logs: []`), đảm bảo header N1 `Trace ID` ở sheet `Đơn Hàng` (mục 4.3), build response theo 4.5(b), đảo ngược thứ tự, **bỏ cột H**. Counters đọc bằng `cache.getAll([...])`.
6. `handleRecoverOrderFromLog(doc, payload)` – toàn bộ trong `withLock` (đây là action admin, được phép):
   1. `row = parseInt(payload.row)`; `row >= 2`; đọc dòng; kiểm tra cột B === `payload.traceId` (hoặc cả 2 rỗng) → sai thì `fail("Dòng nhật ký đã thay đổi, vui lòng tải lại")`.
   2. Cột I khác `Mới` → `fail("Nhật ký này đã được xử lý")`.
   3. Đối soát lại theo traceId (giống bước 4) → nếu đã có đơn: ghi cột I `Đã lưu thực tế → DHxxx`, return `alreadySaved`.
   4. Parse cột H → `order`; parse `order.cartJSON` → `cartIn`. Lỗi → `fail("Không đọc được dữ liệu giỏ hàng để khôi phục")`.
   5. Build dòng đơn bằng helper **`buildOrderRowData(doc, cartIn, { strict: false })`** (xem T3.7).
   6. `appendRow` 14 cột cùng format `Code.gs:1120-1124`; trạng thái `"Khách đặt hàng"`; cột 13 (Ghi chú Admin) = `"♻️ Khôi phục từ nhật ký lỗi [" + code + "]" + (warnings ? " | " + warnings : "")`; cột 14 = traceId. Set header cột 13/14 nếu thiếu.
   7. Ghi cột I của dòng log = `Đã khôi phục → <orderId>`; `cache.put("ord_trace_"+traceId, orderId, 21600)`.
7. **Refactor nhỏ:** tách khối tính giỏ hàng `Code.gs:950-1082` thành `buildOrderRowData(doc, cartIn, opts)` trả về:
   ```js
   { ok: true, cleanCart, lines, total, autoAdminNote, warnings: [] }
   // hoặc khi strict và gặp lỗi:
   { ok: false, code: "PRODUCT_NOT_FOUND|PRODUCT_INACTIVE|COMBO_EXPIRED|INVALID_CART", msg: "<message cũ giữ nguyên>" }
   ```
   - `strict: true` (dùng trong `handleCreateOrder`): hành vi **y hệt hiện tại**; `handleCreateOrder` gọi `if (!r.ok) return reject(r.code, r.msg);`.
   - `strict: false` (dùng khi khôi phục): bỏ qua kiểm tra status SP và combo hết hạn (vẫn thêm quà nếu đang trong hạn); SP không còn tồn tại → dùng `name`/`price` từ chính item trong `cartIn`, đẩy cảnh báo `"SP <id> không còn trong danh mục – giá theo giỏ của khách"` vào `warnings`.
8. `handleClearOrderLogs(doc, payload)`: trong `withLock`; `onlyResolved` → duyệt từ dưới lên, `deleteRow` những dòng cột I ≠ `Mới`; ngược lại `deleteRows(2, lastRow-1)` nếu có dữ liệu. Trả `deleted`.

**AC-T3**
- [ ] `logClientOrderDiag` nằm trước `isValidSession`; 3 action admin nằm sau.
- [ ] Gửi diag với traceId đã có trong `Đơn Hàng` → `alreadySaved: true`, **không** thêm dòng log.
- [ ] Khôi phục cùng 1 dòng 2 lần → lần 2 bị từ chối, không tạo đơn thứ 2.
- [ ] Khôi phục đơn bị từ chối vì `PRODUCT_INACTIVE` → thành công, có cảnh báo trong Ghi chú Admin.
- [ ] `handleCreateOrder` sau refactor vẫn pass toàn bộ test cũ.

---

### T4 – `index.html`: Trace ID + phân loại lỗi + hàng đợi chẩn đoán

**Bước:**
1. Thêm hằng & helper (gần `ORDER_DEDUP_STORAGE_KEY`, `index.html:6567`):
   ```js
   const ORDER_DIAG_STORAGE_KEY = 'chuhieu_pending_order_diag_v1';
   const ORDER_DIAG_MAX_ENTRIES = 3;
   const ORDER_DIAG_MIN_AGE_MS = 20000;        // không báo cáo entry còn trẻ hơn 20s (có thể đang retry)
   const ORDER_DIAG_MAX_AGE_MS = 7 * 24 * 3600 * 1000;
   const ORDER_DIAG_MAX_REPORT_TRIES = 3;

   function generateOrderTraceId()                 // format mục 4.1
   function readPendingOrderDiag()                  // try/catch, luôn trả Array
   function writePendingOrderDiag(list)             // try/catch, cắt còn ORDER_DIAG_MAX_ENTRIES phần tử mới nhất
   function upsertPendingOrderDiag(entry)           // theo traceId
   function markPendingOrderDiagFailure(traceId, errorKind, lastError) // attempts++, cập nhật lỗi
   function removePendingOrderDiag(traceId)
   function flushPendingOrderDiag()                 // xem bước 5
   ```
2. Trong `checkout(openZalo)`:
   - Tính `currentFp` và `isDuplicateSubmission` **trước** khi copy (đoạn `index.html:7021-7025` hiện đã nằm trước `copyTextToClipboard` – giữ thứ tự đó).
   - `const traceId = (isDuplicateSubmission && lastSubmittedOrderState.traceId) ? lastSubmittedOrderState.traceId : generateOrderTraceId();`
   - Nối `orderText += "\nMã tra cứu: " + traceId;` **trước** `copyTextToClipboard(orderText)`.
   - Thêm `clientTraceId: traceId` vào `orderData`; thêm `traceId` vào object `lastSubmittedOrderState` (cả khi lưu sessionStorage).
3. Trong `sendOrderToSheetWithRetry(orderData, orderText, retriesLeft)`:
   - Lần gọi đầu (nhận biết bằng `retriesLeft === 2` hoặc tham số thêm `isFirst`): `upsertPendingOrderDiag({ traceId: orderData.clientTraceId, createdAt: Date.now(), attempts: 0, errorKind: '', lastError: '', reportTries: 0, order: {name, phone, address, note, cartJSON, formDurationMs} })`. Chi phí: 1 lần `localStorage.setItem` (~<1ms).
   - Đổi `.then(r => r.json())` thành đọc text rồi parse:
     ```js
     .then(r => r.text().then(t => {
       try { return JSON.parse(t); }
       catch (e) {
         const err = new Error('HTTP ' + r.status + ' ' + String(t || '').slice(0, 200));
         err.kind = 'non_json';
         throw err;
       }
     }))
     ```
   - `res.status === 'success'` → `removePendingOrderDiag(traceId)` (+ logic sessionStorage cũ).
   - `res.status === 'error'` → `removePendingOrderDiag(traceId)` (server đã tự log) + `handleOrderSaveFailure(...)` như cũ.
   - `.catch(err)` → `markPendingOrderDiagFailure(traceId, err && err.kind === 'non_json' ? 'non_json' : 'network', String(err && (err.message || err)).slice(0, 300))` rồi giữ nguyên logic retry/visibilitychange hiện tại.
4. **Không** thay đổi `window.open(zalo)`, không thêm delay.
5. `flushPendingOrderDiag()`:
   - Bỏ qua nếu `navigator.onLine === false`.
   - Với mỗi entry: bỏ (xoá) nếu `now - createdAt > ORDER_DIAG_MAX_AGE_MS` hoặc `reportTries >= ORDER_DIAG_MAX_REPORT_TRIES`; bỏ qua (giữ) nếu `now - createdAt < ORDER_DIAG_MIN_AGE_MS` hoặc `attempts === 0`.
   - Còn lại: `reportTries++` (ghi lại trước khi gửi), POST `logClientOrderDiag` (payload mục 4.5a, `ua = navigator.userAgent.slice(0,200)`, `online = navigator.onLine`).
   - Response `status === 'success'` (dù `logged` hay `alreadySaved`) → `removePendingOrderDiag`. Lỗi/mạng → giữ lại cho lần sau.
   - Gửi **tuần tự**, tối đa 3 entry mỗi lần flush; dùng cờ module `isFlushingOrderDiag` chống chạy song song.
6. Kích hoạt flush (chỉ đăng ký 1 lần):
   - Sau khi trang tải xong: `window.addEventListener('load', () => setTimeout(() => (window.requestIdleCallback || setTimeout)(flushPendingOrderDiag), 3000))`.
   - `document.addEventListener('visibilitychange', () => { if (!document.hidden) setTimeout(flushPendingOrderDiag, 3000); })`.
   - `window.addEventListener('pageshow', e => { if (e.persisted) setTimeout(flushPendingOrderDiag, 3000); })`.
   - Nếu `localStorage` rỗng key → hàm return ngay (0 request).

**AC-T4**
- [ ] Đơn thành công: sau response, key `chuhieu_pending_order_diag_v1` không còn entry của trace đó; không có request phụ nào được gửi.
- [ ] Lần bấm trùng (`isDuplicateSubmission`) dùng lại trace cũ, không sinh trace mới.
- [ ] Response HTML (không phải JSON) được ghi `errorKind = 'non_json'`, không phải `'network'`.
- [ ] Không có request `logClientOrderDiag` nào khi queue rỗng.
- [ ] Test `test_zalo_combo_and_gift_message_format_exact` và `test_anti_duplicate_checkout_ux_and_zalo_mandatory_warning` vẫn pass (nếu test kiểm tra chuỗi chính xác của `orderText`, dòng `Mã tra cứu` phải nằm SAU dòng `TỔNG THANH TOÁN`).

---

### T5 – `admin.html`: Modal "🩺 Nhật ký đơn lỗi"

**Bước:**
1. Thêm nút vào cụm `admin.html:1729-1736`, trước `btn-export-spx-toolbar`:
   `<button type="button" id="btn-open-order-logs" class="btn-update" onclick="openOrderLogsModal()" ...>🩺 Đơn lỗi</button>` (style đồng bộ 2 nút bên cạnh, màu `#b91c1c`).
2. Thêm modal (theo pattern modal SPX sẵn có trong file) với các id:
   `order-logs-modal`, `order-logs-counters`, `order-logs-body`, `order-logs-empty`, `btn-refresh-order-logs`, `btn-clear-resolved-order-logs`, `btn-clear-all-order-logs`, `btn-close-order-logs`.
3. Hàm JS:
   ```js
   function openOrderLogsModal()          // hiện modal + loadOrderLogs(); KHÔNG tải sẵn khi mở trang admin
   function closeOrderLogsModal()
   async function loadOrderLogs()         // POST getOrderLogs; xử lý lỗi theo pattern admin.html:3630
   function renderOrderLogs(data)         // bảng: Thời gian | Mã tra cứu | Nguyên nhân (badge màu) | Khách hàng | Giỏ hàng | Chi tiết | Trạng thái | Hành động
   function getOrderLogReasonLabel(code)  // map mã → nhãn tiếng Việt + màu (bảng dưới)
   async function recoverOrderFromLog(row, traceId) // confirm() → POST → disable nút trong lúc chờ → toast/alert → loadOrderLogs() + tải lại danh sách đơn bằng hàm reload sẵn có của tab Đơn hàng
   async function clearOrderLogs(onlyResolved)      // confirm() → POST → loadOrderLogs()
   ```
4. Mọi text từ server render qua `escapeHtml()` (C10). Nút "➕ Khôi phục" chỉ hiện khi `canRecover`.
5. Khu `order-logs-counters` hiển thị: `Bot bị chặn (ô ẩn): n · Bot bị chặn (quá nhanh): n · Đơn đã lưu nhưng mất phản hồi: n · Log bị giới hạn tần suất: n` (dữ liệu trong ~6 giờ gần nhất do TTL cache).

**Bảng nhãn:**

| Mã | Nhãn | Màu |
|---|---|---|
| `CLIENT_NETWORK_DROP` | Đứt mạng phía khách (chuyển app/sóng yếu) | cam |
| `SERVER_NON_JSON` | Google trả lỗi (quota/timeout/quyền) | đỏ đậm |
| `SERVER_EXCEPTION` | Lỗi máy chủ | đỏ đậm |
| `LOCK_TIMEOUT` | Quá tải xử lý đồng thời | đỏ |
| `BAD_REQUEST_JSON` | Dữ liệu gửi lên bị hỏng | đỏ |
| `RATE_LIMIT_PHONE` / `RATE_LIMIT_GLOBAL` | Bị giới hạn tần suất | vàng |
| `PRODUCT_NOT_FOUND` / `PRODUCT_INACTIVE` / `COMBO_EXPIRED` | Sản phẩm/Combo không còn bán | tím |
| `INVALID_INPUT` / `INVALID_CART` | Dữ liệu khách nhập không hợp lệ | xám |

**AC-T5**
- [ ] Mở trang admin không phát sinh request `getOrderLogs`.
- [ ] `test_admin_html_dom_ids` pass (mọi id gọi trong JS đều tồn tại).
- [ ] Bấm "Khôi phục" 2 lần nhanh liên tiếp chỉ tạo 1 đơn (nút bị disable + server chặn).

---

### T6 – `test.py`: bổ sung test (thêm vào class `TestBusinessLogic`)

Theo phong cách test hiện có (đọc file, `assertIn`, trích xuất hàm rồi chạy bằng `node`):

1. `test_order_log_actions_routing` – `Code.gs` có `action === "logClientOrderDiag"` với vị trí (index) **nhỏ hơn** `if (!isValidSession(payload.token))`; có `getOrderLogs`, `recoverOrderFromLog`, `clearOrderLogs` với vị trí **lớn hơn**.
2. `test_order_log_pure_helpers_node` – trích xuất `isValidTraceId`, `classifyServerError`, `buildOrderLogCartSummary` từ `Code.gs`, chạy Node: trace hợp lệ/không hợp lệ; `new Error("Lock timeout: another process...")` → `LOCK_TIMEOUT`; `new Error("x")` → `SERVER_EXCEPTION`; cartJSON hỏng → không throw.
3. `test_no_logging_inside_withlock_in_create_order` – lấy thân `handleCreateOrder`, cắt đoạn từ `withLock(function () {` tới `});` khớp ngoặc; assert không chứa `logOrderFailure(` và `reject(`; assert có `__reject`.
4. `test_create_order_appends_trace_id_column` – thân `handleCreateOrder` chứa `ord_trace_` và `appendRow` có `safeCell(traceId)`.
5. `test_client_pending_order_diag_queue_node` – trích xuất các hàm queue + `generateOrderTraceId` từ `index.html`, mock `localStorage` bằng object, chạy Node: upsert → mark failure (attempts=1) → remove → rỗng; upsert 5 entry → còn 3; trace sinh ra match regex; flush bỏ qua entry < 20s và entry `attempts === 0`.
6. `test_client_non_json_classification` – `sendOrderToSheetWithRetry` chứa `r.text()` và `'non_json'`; không còn `r.json()` trong hàm đó.
7. `test_order_logs_admin_ui` – `admin.html` có `id="btn-open-order-logs"`, `id="order-logs-modal"`, các hàm `openOrderLogsModal`, `loadOrderLogs`, `recoverOrderFromLog`, `clearOrderLogs`; dùng `escapeHtml(` trong `renderOrderLogs`.

**AC-T6**
- [ ] Tổng số test = 81 + số test mới, tất cả pass.

---

### T7 – Tài liệu & bàn giao
1. Đánh dấu `KE_HOACH_LOG_DON_HANG.md` (v1) là đã thay thế bởi file này (thêm 1 dòng đầu file), không xoá.
2. Báo cáo cho user: danh sách file đã sửa, số test, và **hướng dẫn deploy** (mục 6).

---

## 6. Deploy (người dùng thực hiện thủ công – agent chỉ hướng dẫn)

Thứ tự bắt buộc: **Backend trước, Frontend sau.**

1. Copy toàn bộ `Code.gs` vào Apps Script Editor → **Deploy → Manage deployments → Edit (bút chì) → Version: New version → Deploy**. (Giữ nguyên deployment cũ để `API_URL` không đổi.)
2. Push `index.html`, `admin.html` lên GitHub Pages.
3. Tương thích ngược:
   - Frontend mới + Backend cũ: `clientTraceId` bị bỏ qua; `logClientOrderDiag` nhận `"Action không hợp lệ"` → client giữ entry, thử lại tối đa 3 lần rồi bỏ. Không ảnh hưởng đặt hàng.
   - Backend mới + Frontend cũ (cache trình duyệt): cột 14 rỗng; mọi thứ khác chạy bình thường.
4. Smoke test sau deploy:
   - Đặt 1 đơn thật → sheet `Đơn Hàng` có cột N chứa `CH-...`; sheet `Nhật Ký Đơn Lỗi` **không** có dòng mới.
   - Đặt đơn với SĐT sai format bằng cách gọi API trực tiếp (hoặc tạm sửa client) → có dòng `INVALID_INPUT`.
   - Tắt mạng (DevTools Offline) → bấm đặt hàng → bật mạng lại, đợi >20s, chuyển tab qua lại → có dòng `CLIENT_NETWORK_DROP`; Admin bấm Khôi phục → đơn xuất hiện trong tab Đơn hàng với Ghi chú Admin `♻️ Khôi phục...`.

---

## 7. Definition of Done

- [ ] T1–T7 hoàn tất, mọi AC tick.
- [ ] `python3 test.py` pass 100%.
- [ ] Luồng thành công: không thêm request, không thêm Sheet I/O, không thêm thời gian giữ Lock (review diff `handleCreateOrder`).
- [ ] Không có `console.log` debug thừa; không lộ dữ liệu nhạy cảm mới qua API công khai (`logClientOrderDiag` chỉ trả `alreadySaved/orderId/logged`).
- [ ] Commit chỉ khi user yêu cầu.

---

## 8. Ghi chú & câu hỏi mở (không chặn triển khai)

1. **Kiểm tra bộ lọc đơn trùng trong admin:** `admin.html` có cơ chế tự ẩn đơn trùng (`duplicate-notice-bar`, nút "Xem tất cả"). Một số "đơn không hiện" có thể chỉ đang bị ẩn bởi bộ lọc này chứ không phải mất – nên nhắc user kiểm tra trước.
2. **Counter dùng CacheService** chỉ giữ tối đa 6 giờ (giới hạn TTL của GAS). Nếu cần thống kê dài hạn, cân nhắc ghi tổng hợp theo ngày vào `PropertiesService` ở phiên bản sau.
3. **Auto-resubmit** (client tự gửi lại đơn khi có mạng, dùng traceId làm idempotency key) là bước tiến hợp lý sau khi có dữ liệu log thực tế – để sau, cần user quyết định vì có rủi ro trùng với đơn Admin đã nhập tay từ tin Zalo.
4. **Delay trước khi mở Zalo:** chỉ cân nhắc nếu log thực tế cho thấy `CLIENT_NETWORK_DROP` chiếm đa số.
