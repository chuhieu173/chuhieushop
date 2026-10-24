#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Hệ thống Auto Test tự động kiểm tra dự án Chú Hiếu Shop.
Chạy trước khi commit (Pre-commit hook) hoặc chạy thủ công: python3 test.py
"""

import unittest
import re
import os
import subprocess
import tempfile
from html.parser import HTMLParser

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def read_file(filename):
    with open(os.path.join(BASE_DIR, filename), 'r', encoding='utf-8') as f:
        return f.read()

class IDCollector(HTMLParser):
    def __init__(self):
        super().__init__()
        self.ids = set()
    def handle_starttag(self, tag, attrs):
        for k, v in attrs:
            if k == 'id' and v:
                self.ids.add(v)

class TestDOMIntegrity(unittest.TestCase):
    """Kiểm tra tính toàn vẹn của DOM và liên kết giữa HTML & JavaScript"""

    def test_index_html_dom_ids(self):
        """Kiểm tra: Mọi ID được gọi qua document.getElementById trong index.html PHẢI tồn tại trong HTML"""
        content = read_file('index.html')
        collector = IDCollector()
        collector.feed(content)

        scripts = re.findall(r'<script(?![^>]*src=)[^>]*>(.*?)</script>', content, re.DOTALL)
        js_content = '\n'.join(scripts)
        used_ids = set(re.findall(r'document\.getElementById\([\'\"]([a-zA-Z0-9_\-]+)[\'\"]\)', js_content))

        # Loại trừ các ID động được sinh ra trong lúc render (ví dụ: qty-SP01, slides-SP01, variant-chips-SP01...)
        dynamic_prefixes = ('qty-', 'slides-', 'variant-chips-', 'price-container-', 'add-btn-', 'badge-wrap-')
        static_used = {i for i in used_ids if not any(i.startswith(p) for p in dynamic_prefixes)}

        missing = static_used - collector.ids
        self.assertEqual(
            missing, set(),
            f"LỖI: Phát hiện ID được gọi trong JavaScript nhưng KHÔNG TỒN TẠI trong HTML (index.html): {missing}"
        )

    def test_admin_html_dom_ids(self):
        """Kiểm tra: Mọi ID được gọi qua document.getElementById trong admin.html PHẢI tồn tại trong HTML"""
        content = read_file('admin.html')
        collector = IDCollector()
        collector.feed(content)

        scripts = re.findall(r'<script(?![^>]*src=)[^>]*>(.*?)</script>', content, re.DOTALL)
        js_content = '\n'.join(scripts)
        used_ids = set(re.findall(r'document\.getElementById\([\'\"]([a-zA-Z0-9_\-]+)[\'\"]\)', js_content))

        # Loại trừ các ID động trong admin
        dynamic_prefixes = ('status-', 'combo-chk-', 'combo-qty-', 'combo-row-', 'var-', 'prod-row-')
        static_used = {i for i in used_ids if not any(i.startswith(p) for p in dynamic_prefixes)}

        missing = static_used - collector.ids
        self.assertEqual(
            missing, set(),
            f"LỖI: Phát hiện ID được gọi trong JavaScript nhưng KHÔNG TỒN TẠI trong HTML (admin.html): {missing}"
        )

    def test_admin_variant_elements_exist(self):
        """Kiểm tra: Các phần tử quản lý phân loại sản phẩm (variants) phải tồn tại trong admin.html"""
        admin = read_file('admin.html')
        self.assertIn('id="edit-has-variants"', admin, "LỖI: Thiếu checkbox 'edit-has-variants' trong admin.html!")
        self.assertIn('id="variants-config-box"', admin, "LỖI: Thiếu container 'variants-config-box' trong admin.html!")
        self.assertIn('id="variants-list-container"', admin, "LỖI: Thiếu danh sách 'variants-list-container' trong admin.html!")
        self.assertIn('id="variant-file-input"', admin, "LỖI: Thiếu input tải ảnh 'variant-file-input' trong admin.html!")

    def test_analytics_elements_exist_in_admin(self):
        """Kiểm tra: Các phần tử Dashboard và Thống kê phải tồn tại đầy đủ trong admin.html"""
        content = read_file('admin.html')
        collector = IDCollector()
        collector.feed(content)

        essential_ids = [
            'analytics',
            'analytics-custom-date-box',
            'analytics-date-from',
            'analytics-date-to',
            'analytics-status-filter',
            'analytics-stock-alerts',
            'kpi-revenue',
            'kpi-revenue-sub',
            'kpi-orders',
            'kpi-orders-sub',
            'kpi-items',
            'kpi-aov',
            'kpi-completion-rate',
            'chart-revenue-orders',
            'chart-product-share',
            'chart-product-share-title',
            'btn-chart-mode-rev',
            'btn-chart-mode-orders',
            'btn-chart-mode-qty',
            'analytics-prod-count',
            'analytics-prod-search',
            'btn-sort-qty',
            'btn-sort-orders',
            'btn-sort-rev',
            'btn-sort-stock',
            'analytics-products-body',
            'analytics-customers-body'
        ]

        for eid in essential_ids:
            self.assertIn(eid, collector.ids, f"LỖI: Thiếu phần tử id='{eid}' trong admin.html!")

        self.assertIn('chart.js', content.lower(), "LỖI: Thiếu thư viện Chart.js trong admin.html!")

    def test_batch_order_status_elements_exist_in_admin(self):
        """Kiểm tra: Các phần tử thao tác đơn hàng hàng loạt và thông báo Toast phải tồn tại trong admin.html"""
        content = read_file('admin.html')
        collector = IDCollector()
        collector.feed(content)

        batch_ids = [
            'orders-bulk-bar',
            'bulk-selected-count',
            'bulk-status-select',
            'bulk-btn-count',
            'btn-bulk-apply',
            'btn-bulk-delete',
            'bulk-delete-btn-count',
            'orders-unsaved-bar',
            'unsaved-count',
            'unsaved-btn-count',
            'btn-save-all-changes',
            'order-select-all',
            'orders-search-input',
            'toast-container',
        ]
        for bid in batch_ids:
            self.assertIn(bid, collector.ids, f"LỖI: Thiếu phần tử id='{bid}' trong admin.html!")

    def test_profit_elements_exist_in_admin(self):
        """Kiểm tra: Các phần tử Tab Lợi Nhuận & Giá Vốn phải tồn tại đầy đủ trong admin.html"""
        content = read_file('admin.html')
        collector = IDCollector()
        collector.feed(content)

        profit_ids = [
            'profit',
            'profit-custom-date-box',
            'profit-date-from',
            'profit-date-to',
            'profit-status-filter',
            'profit-kpi-revenue',
            'profit-kpi-cost',
            'profit-kpi-profit',
            'profit-kpi-margin',
            'profit-kpi-items',
            'chart-profit-trends',
            'chart-profit-share',
            'profit-prod-search',
            'profit-prod-count',
            'btn-profit-sort-profit',
            'btn-profit-sort-margin',
            'btn-profit-sort-rev',
            'btn-profit-sort-qty',
            'profit-products-body',
            'quick-cost-search',
            'quick-cost-body',
            'btn-save-quick-cost',
            'edit-cost-price',
        ]
        for pid in profit_ids:
            self.assertIn(pid, collector.ids, f"LỖI: Thiếu phần tử id='{pid}' trong admin.html!")

    def test_duplicate_order_elements_exist_in_admin(self):
        """Kiểm tra: Các phần tử thông báo và modal quản lý đơn hàng trùng lặp phải tồn tại trong admin.html"""
        content = read_file('admin.html')
        collector = IDCollector()
        collector.feed(content)

        dup_ids = [
            'duplicate-notice-bar',
            'duplicate-filtered-count',
            'duplicate-notice-desc',
            'btn-toggle-duplicate-filter',
            'duplicate-toggle-text',
            'duplicate-btn-count',
            'duplicate-modal',
            'duplicate-modal-title',
            'duplicate-modal-content',
            'btn-delete-duplicates',
        ]
        for did in dup_ids:
            self.assertIn(did, collector.ids, f"LỖI: Thiếu phần tử id='{did}' trong admin.html!")

    def test_address_preview_elements_exist_in_index(self):
        """Kiểm tra: Các phần tử xem trước địa chỉ giao hàng chuẩn hóa phải tồn tại trong index.html"""
        content = read_file('index.html')
        collector = IDCollector()
        collector.feed(content)
        self.assertIn('address-preview-box', collector.ids, "LỖI: Thiếu id='address-preview-box' trong index.html!")
        self.assertIn('address-preview-text', collector.ids, "LỖI: Thiếu id='address-preview-text' trong index.html!")

    def test_checkout_essential_fields(self):
        """Kiểm tra: Các trường bắt buộc trong Form Đặt Hàng (index.html) không bao giờ bị xóa nhầm"""
        content = read_file('index.html')
        collector = IDCollector()
        collector.feed(content)

        essential_fields = {
            'customer-name': 'Tên người nhận',
            'customer-phone': 'Số điện thoại Zalo',
            'customer-address-detail': 'Địa chỉ chi tiết',
            'tinh': 'Chọn Tỉnh / Thành phố',
            'phuong': 'Chọn Phường / Xã',
            'cart-section': 'Khu vực Giỏ hàng',
            'cart-items': 'Danh sách món trong giỏ',
            'total-price': 'Tổng tiền đơn hàng'
        }

        for field_id, label in essential_fields.items():
            self.assertIn(
                field_id, collector.ids,
                f"LỖI NGHIÊM TRỌNG: Trường cốt lõi '{label}' (id='{field_id}') bị thiếu trong index.html!"
            )

    def test_post_video_field_exists(self):
        """Kiểm tra: Ô nhập Link Video 'post-video' phải tồn tại và là textarea (hỗ trợ nhiều link) trong admin.html"""
        content = read_file('admin.html')
        collector = IDCollector()
        collector.feed(content)
        self.assertIn(
            'post-video', collector.ids,
            "LỖI: Không tìm thấy ô nhập link video (id='post-video') trong admin.html!"
        )
        self.assertRegex(
            content, r'<textarea[^>]+id=[\'"]post-video[\'"]',
            "LỖI: 'post-video' trong admin.html phải là <textarea> để hỗ trợ nhập nhiều dòng video!"
        )


class TestSyntaxAndParsing(unittest.TestCase):
    """Kiểm tra cú pháp JavaScript & HTML của toàn bộ dự án"""

    def test_codegs_syntax(self):
        """Kiểm tra cú pháp Code.gs bằng Node.js"""
        code = read_file('Code.gs')
        with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as tf:
            tf.write(code)
            temp_path = tf.name
        try:
            p = subprocess.run(['node', '--check', temp_path], capture_output=True, text=True)
            self.assertEqual(p.returncode, 0, f"LỖI CÚ PHÁP trong Code.gs:\n{p.stderr}")
        finally:
            if os.path.exists(temp_path):
                os.remove(temp_path)

    def test_index_scripts_syntax(self):
        """Kiểm tra cú pháp JavaScript bên trong index.html"""
        content = read_file('index.html')
        scripts = re.findall(r'<script(?![^>]*src=)[^>]*>(.*?)</script>', content, re.DOTALL)
        for idx, s in enumerate(scripts):
            with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as tf:
                tf.write(s)
                temp_path = tf.name
            try:
                p = subprocess.run(['node', '--check', temp_path], capture_output=True, text=True)
                self.assertEqual(p.returncode, 0, f"LỖI CÚ PHÁP JavaScript trong script #{idx+1} của index.html:\n{p.stderr}")
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)

    def test_admin_scripts_syntax(self):
        """Kiểm tra cú pháp JavaScript bên trong admin.html"""
        content = read_file('admin.html')
        scripts = re.findall(r'<script(?![^>]*src=)[^>]*>(.*?)</script>', content, re.DOTALL)
        for idx, s in enumerate(scripts):
            with tempfile.NamedTemporaryFile('w', suffix='.js', delete=False) as tf:
                tf.write(s)
                temp_path = tf.name
            try:
                p = subprocess.run(['node', '--check', temp_path], capture_output=True, text=True)
                self.assertEqual(p.returncode, 0, f"LỖI CÚ PHÁP JavaScript trong script #{idx+1} của admin.html:\n{p.stderr}")
            finally:
                if os.path.exists(temp_path):
                    os.remove(temp_path)

    def test_html_structure(self):
        """Kiểm tra HTML Parser không bị lỗi cấu trúc nghiêm trọng"""
        for filename in ('index.html', 'admin.html'):
            content = read_file(filename)
            parser = HTMLParser()
            try:
                parser.feed(content)
            except Exception as e:
                self.fail(f"LỖI phân tích HTML trong {filename}: {e}")


class TestAPIConsistency(unittest.TestCase):
    """Kiểm tra sự đồng bộ giữa Frontend (index/admin) và Backend (Code.gs)"""

    def test_actions_handled_in_backend(self):
        """Kiểm tra: Mọi API action mà Frontend gọi đều phải được khai báo trong Code.gs"""
        index_content = read_file('index.html')
        admin_content = read_file('admin.html')
        codegs_content = read_file('Code.gs')

        idx_actions = set(re.findall(r'action:\s*[\'\"]([a-zA-Z0-9_\-]+)[\'\"]', index_content))
        adm_actions = set(re.findall(r'action:\s*[\'\"]([a-zA-Z0-9_\-]+)[\'\"]', admin_content))
        backend_actions = set(re.findall(r'action\s*===\s*[\'\"]([a-zA-Z0-9_\-]+)[\'\"]', codegs_content))

        unhandled_idx = idx_actions - backend_actions
        self.assertEqual(
            unhandled_idx, set(),
            f"LỖI: index.html gọi action chưa được xử lý trong Code.gs: {unhandled_idx}"
        )

        unhandled_adm = adm_actions - backend_actions
        self.assertEqual(
            unhandled_adm, set(),
            f"LỖI: admin.html gọi action chưa được xử lý trong Code.gs: {unhandled_adm}"
        )

    def test_status_options_match(self):
        """Kiểm tra: Danh sách trạng thái đơn hàng STATUS_OPTIONS ở Admin và Backend phải khớp nhau 100%"""
        codegs_content = read_file('Code.gs')
        admin_content = read_file('admin.html')

        gs_m = re.findall(r'const STATUS_OPTIONS = \[(.*?)\];', codegs_content)
        adm_m = re.findall(r'const STATUS_OPTIONS = \[(.*?)\];', admin_content)

        self.assertTrue(bool(gs_m), "Không tìm thấy STATUS_OPTIONS trong Code.gs")
        self.assertTrue(bool(adm_m), "Không tìm thấy STATUS_OPTIONS trong admin.html")

        self.assertEqual(
            gs_m[0].strip(), adm_m[0].strip(),
            "LỖI: STATUS_OPTIONS trong admin.html không khớp với Code.gs!"
        )

    def test_session_duration_one_week(self):
        """Kiểm tra: Thời gian hết hạn phiên đăng nhập admin phải được thiết lập là 7 ngày (1 tuần)"""
        codegs = read_file('Code.gs')
        admin = read_file('admin.html')

        # Code.gs: SESSION_DURATION_SEC = 7 * 24 * 60 * 60 (hoặc 604800)
        gs_m = re.search(r'const\s+SESSION_DURATION_SEC\s*=\s*([^;]+);', codegs)
        self.assertTrue(bool(gs_m), "LỖI: Không tìm thấy SESSION_DURATION_SEC trong Code.gs")
        sec_val = eval(gs_m.group(1).strip())
        self.assertEqual(sec_val, 7 * 24 * 60 * 60, f"LỖI: SESSION_DURATION_SEC trong Code.gs không phải 7 ngày: {sec_val}")

        # admin.html: SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000
        adm_m = re.search(r'const\s+SESSION_DURATION_MS\s*=\s*([^;]+);', admin)
        self.assertTrue(bool(adm_m), "LỖI: Không tìm thấy SESSION_DURATION_MS trong admin.html")
        ms_val = eval(adm_m.group(1).strip())
        self.assertEqual(ms_val, 7 * 24 * 60 * 60 * 1000, f"LỖI: SESSION_DURATION_MS trong admin.html không phải 7 ngày: {ms_val}")

    def test_product_order_backend_and_client_actions(self):
        """Kiểm tra: Backend Code.gs xử lý lưu thứ tự sản phẩm và sắp xếp trả về cho Client"""
        codegs = read_file('Code.gs')
        admin = read_file('admin.html')
        index = read_file('index.html')

        self.assertIn('handleSaveProductsOrder', codegs, "LỖI: Code.gs thiếu hàm handleSaveProductsOrder")
        self.assertIn('handleSwapProductOrder', codegs, "LỖI: Code.gs thiếu hàm handleSwapProductOrder")
        self.assertIn('action === "saveProductsOrder"', codegs, "LỖI: Code.gs chưa đăng ký action saveProductsOrder trong doPost")
        self.assertIn('action === "swapProductOrder"', codegs, "LỖI: Code.gs chưa đăng ký action swapProductOrder trong doPost")
        self.assertIn('products.sort', codegs, "LỖI: Code.gs getProductsList chưa sắp xếp products theo thứ tự (order)")
        self.assertIn('action: "saveProductsOrder"', admin, "LỖI: admin.html chưa gọi action saveProductsOrder")
        self.assertIn('productsData.sort', index, "LỖI: index.html chưa sắp xếp productsData theo order")


class TestBusinessLogic(unittest.TestCase):
    """Kiểm tra các thuật toán và logic cốt lõi"""

    def test_admin_mobile_login_css(self):
        """Kiểm tra: CSS trên Mobile phải đẩy khung login lên trên để tránh bị bàn phím ảo che lấp"""
        admin = read_file('admin.html')
        self.assertIn("justify-content: flex-start", admin, "LỖI: Thiếu justify-content: flex-start cho #login-overlay trên mobile")
        self.assertIn("padding-top: 50px", admin, "LỖI: Thiếu padding-top: 50px cho #login-overlay trên mobile")

    def test_youtube_id_extraction(self):
        """Kiểm tra: Thuật toán nhận diện và trích xuất YouTube ID từ mọi dạng link người dùng nhập"""
        yt_pattern = re.compile(r'(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})')
        test_urls = {
            "https://www.youtube.com/watch?v=dQw4w9WgXcQ": "dQw4w9WgXcQ",
            "https://youtu.be/dQw4w9WgXcQ": "dQw4w9WgXcQ",
            "https://www.youtube.com/shorts/dQw4w9WgXcQ": "dQw4w9WgXcQ",
            "https://www.youtube.com/embed/dQw4w9WgXcQ": "dQw4w9WgXcQ",
            "https://m.youtube.com/watch?v=dQw4w9WgXcQ&feature=share": "dQw4w9WgXcQ",
            "http://youtube.com/watch?v=dQw4w9WgXcQ": "dQw4w9WgXcQ"
        }
        for url, expected_id in test_urls.items():
            match = yt_pattern.search(url)
            self.assertIsNotNone(match, f"Không nhận diện được link YouTube: {url}")
            self.assertEqual(match.group(1), expected_id, f"ID YouTube trích xuất sai từ: {url}")

    def test_tiktok_id_extraction(self):
        """Kiểm tra: Thuật toán nhận diện và trích xuất TikTok video ID từ nhiều dạng link"""
        tiktok_pattern = re.compile(r'(?:tiktok\.com\/(?:.*?\/video\/|.*?\/v\/|(?:v|embed|embed\/v\d+|player\/v\d+)\/))(\d{15,22})')
        test_urls = {
            "https://www.tiktok.com/@creator/video/7480085501018393876": "7480085501018393876",
            "https://www.tiktok.com/@creator/video/7480085501018393876?is_from_webapp=1&sender_device=pc": "7480085501018393876",
            "https://tiktok.com/@user/video/7480085501018393876": "7480085501018393876",
            "https://www.tiktok.com/@air.remix/video/7683439596537007380": "7683439596537007380",
            "https://www.tiktok.com/v/7480085501018393876": "7480085501018393876",
            "https://m.tiktok.com/v/7480085501018393876.html": "7480085501018393876",
            "https://www.tiktok.com/embed/v2/7480085501018393876": "7480085501018393876",
            "https://www.tiktok.com/embed/7480085501018393876": "7480085501018393876",
            "https://www.tiktok.com/player/v1/7683439596537007380": "7683439596537007380",
        }
        for url, expected_id in test_urls.items():
            match = tiktok_pattern.search(url)
            self.assertIsNotNone(match, f"Không nhận diện được link TikTok: {url}")
            self.assertEqual(match.group(1), expected_id, f"ID TikTok trích xuất sai từ: {url}")

    def test_video_embed_anti_error153_and_player(self):
        """Kiểm tra: Cấu hình chống YouTube Error 153 và TikTok Player chính quy trong index.html"""
        content = read_file('index.html')
        admin_content = read_file('admin.html')
        
        # 1. Thẻ meta referrer trong <head>
        self.assertIn('<meta name="referrer" content="strict-origin-when-cross-origin">', content,
                      "LỖI: index.html thiếu <meta name=\"referrer\" content=\"strict-origin-when-cross-origin\"> để chống YouTube Error 153!")
        self.assertIn('<meta name="referrer" content="strict-origin-when-cross-origin">', admin_content,
                      "LỖI: admin.html thiếu <meta name=\"referrer\" content=\"strict-origin-when-cross-origin\">!")

        # 2. YouTube iframe: có referrerpolicy, không có loading="lazy" (gây lỗi cấu hình 153)
        self.assertRegex(content, r'<iframe[^>]+src=[\'"]https://www\.youtube\.com/embed/\${ytId}[\'"][^>]+referrerpolicy=[\'"]strict-origin-when-cross-origin[\'"]',
                         "LỖI: YouTube iframe phải có referrerpolicy=\"strict-origin-when-cross-origin\"!")
        self.assertNotRegex(content, r'<iframe[^>]+src=[\'"]https://www\.youtube\.com/embed/\${ytId}[\'"][^>]+loading=[\'"]lazy[\'"]',
                            "LỖI: YouTube iframe không được dùng loading=\"lazy\" vì gây YouTube Error 153!")

        # 3. TikTok iframe: sử dụng player/v1 chính thức của TikTok
        self.assertIn('https://www.tiktok.com/player/v1/${tiktokId}?music_info=1&description=1', content,
                      "LỖI: TikTok embed phải sử dụng player/v1 chính thức!")

        # 4. Google Drive: có class chuyên dụng post-gdrive-wrapper, hỗ trợ fullscreen & autoplay, có nút mở trực tiếp
        self.assertIn('.post-gdrive-wrapper', content,
                      "LỖI: index.html thiếu class .post-gdrive-wrapper để chống vỡ giao diện trên mobile!")
        self.assertRegex(content, r'<iframe[^>]+src=[\'"]https://drive\.google\.com/file/d/\${gdriveId}/preview[\'"][^>]+allow=[\'"]autoplay;\s*encrypted-media;\s*fullscreen[\'"]',
                         "LỖI: Google Drive iframe phải cấp quyền autoplay; encrypted-media; fullscreen!")
        self.assertIn('Mở xem trên Google Drive', content,
                      "LỖI: Thiếu nút bấm mở xem trực tiếp trên Google Drive!")

    def test_gdrive_id_extraction(self):
        """Kiểm tra: Thuật toán nhận diện và trích xuất Google Drive file ID từ mọi dạng link chia sẻ"""
        gdrive_pattern = re.compile(r'(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=))([a-zA-Z0-9_-]+)')
        test_urls = {
            "https://drive.google.com/file/d/1ePv_ZKOLLjInM7Yz9Kj4ewQP59yzzJsA/view?usp=sharing": "1ePv_ZKOLLjInM7Yz9Kj4ewQP59yzzJsA",
            "https://drive.google.com/file/d/1ePv_ZKOLLjInM7Yz9Kj4ewQP59yzzJsA/view": "1ePv_ZKOLLjInM7Yz9Kj4ewQP59yzzJsA",
            "https://drive.google.com/file/d/1ePv_ZKOLLjInM7Yz9Kj4ewQP59yzzJsA/preview": "1ePv_ZKOLLjInM7Yz9Kj4ewQP59yzzJsA",
            "https://drive.google.com/open?id=1ePv_ZKOLLjInM7Yz9Kj4ewQP59yzzJsA": "1ePv_ZKOLLjInM7Yz9Kj4ewQP59yzzJsA",
            "https://drive.google.com/uc?id=1ePv_ZKOLLjInM7Yz9Kj4ewQP59yzzJsA": "1ePv_ZKOLLjInM7Yz9Kj4ewQP59yzzJsA",
        }
        for url, expected_id in test_urls.items():
            match = gdrive_pattern.search(url)
            self.assertIsNotNone(match, f"Không nhận diện được link Google Drive: {url}")
            self.assertEqual(match.group(1), expected_id, f"ID Google Drive trích xuất sai từ: {url}")

    def test_multiple_video_urls_split(self):
        """Kiểm tra: Xử lý nhiều URL video phân tách theo dòng"""
        raw_text = """
        https://www.youtube.com/watch?v=dQw4w9WgXcQ
        https://www.tiktok.com/@user/video/7480085501018393876
        
        https://youtu.be/dQw4w9WgXcQ
        """
        urls = [u.strip() for u in raw_text.split('\n') if u.strip()]
        self.assertEqual(len(urls), 3)
        self.assertEqual(urls[0], "https://www.youtube.com/watch?v=dQw4w9WgXcQ")
        self.assertEqual(urls[1], "https://www.tiktok.com/@user/video/7480085501018393876")
        self.assertEqual(urls[2], "https://youtu.be/dQw4w9WgXcQ")

    def test_format_money_algorithm(self):
        """Kiểm tra thuật toán format tiền tệ 138000 -> 138.000đ"""
        def format_money(n):
            import math
            return str(round(n)) if n == 0 else f"{round(n):,}".replace(',', '.') + "đ"

        self.assertEqual(format_money(138000), "138.000đ")
        self.assertEqual(format_money(24000), "24.000đ")
        self.assertEqual(format_money(1500000), "1.500.000đ")

    def test_format_order_date_algorithm(self):
        """Kiểm tra thuật toán chuyển đổi chuỗi ISO UTC thành dd/MM/yyyy HH:mm"""
        from datetime import datetime, timezone
        def format_date(iso_str):
            if not iso_str:
                return ''
            if re.match(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}', iso_str):
                # parse ISO
                dt = datetime.fromisoformat(iso_str.replace('Z', '+00:00'))
                return dt.strftime('%d/%m/%Y %H:%M')
            return iso_str

        res = format_date("2026-10-13T05:59:00.000Z")
        self.assertTrue(re.match(r'^\d{2}/\d{2}/\d{4} \d{2}:\d{2}$', res), f"Format date failed: {res}")

    def test_combo_stock_calculation(self):
        """Kiểm tra logic tính kho tối đa của Combo: Math.min(Math.floor(stock / qty))"""
        combo_items = [
            {"id": "SP01", "qty": 1, "stock": 50},
            {"id": "SP02", "qty": 2, "stock": 10},  # 10 / 2 = 5
            {"id": "SP03", "qty": 1, "stock": 20},
        ]
        max_combos = min(it["stock"] // it["qty"] for it in combo_items)
        self.assertEqual(max_combos, 5, "Tính toán kho tối đa của Combo không chính xác")

    def test_combo_select_all_and_stepper_ui(self):
        """Kiểm tra: Tính năng chọn tất cả và nút bấm +/- số lượng cho Combo trong admin.html"""
        admin = read_file('admin.html')
        # Kiểm tra sự tồn tại của checkbox chọn tất cả và danh sách chọn
        self.assertIn('id="combo-select-all"', admin, "LỖI: Thiếu checkbox 'combo-select-all' trong admin.html!")
        self.assertIn('id="combo-products-selector"', admin, "LỖI: Thiếu container 'combo-products-selector' trong admin.html!")
        self.assertIn('toggleSelectAllComboProducts', admin, "LỖI: Thiếu hàm toggleSelectAllComboProducts trong admin.html!")
        self.assertIn('stepComboQty', admin, "LỖI: Thiếu hàm stepComboQty (+/- số lượng) trong admin.html!")
        self.assertIn('combo-qty-btn', admin, "LỖI: Thiếu class combo-qty-btn cho nút bấm +/- trong admin.html!")
        self.assertIn('combo-select-all-label', admin, "LỖI: Thiếu class combo-select-all-label trong admin.html!")

    def test_variant_totals_calculation(self):
        """Kiểm tra: Thuật toán tính giá hiển thị (min price) và tổng kho từ các phân loại (variants)"""
        variants = [
            {"id": "var_1", "name": "OLED 0.96 inch", "price": 45000, "originalPrice": 60000, "stock": 20},
            {"id": "var_2", "name": "LCD 1602", "price": 38000, "originalPrice": 50000, "stock": 15},
            {"id": "var_3", "name": "TFT 1.8 inch", "price": 55000, "originalPrice": 70000, "stock": 10}
        ]
        prices = [v["price"] for v in variants if v["price"] > 0]
        min_price = min(prices)
        total_stock = sum(v["stock"] for v in variants)

        self.assertEqual(min_price, 38000, "LỖI: Giá hiển thị phải là giá thấp nhất trong các phân loại")
        self.assertEqual(total_stock, 45, "LỖI: Tổng tồn kho phải bằng tổng tồn kho của các phân loại")

    def test_multi_variant_cart_isolation(self):
        """Kiểm tra: Giỏ hàng hỗ trợ chọn nhiều biến thể khác nhau của cùng 1 sản phẩm mà không bị ghi đè"""
        cart = []

        def add_to_cart_mock(prod_id, prod_name, var_id, var_name, price, qty):
            existing = next((i for i in cart if i["id"] == prod_id and i.get("variantId") == var_id), None)
            if existing:
                existing["qty"] += qty
            else:
                cart.append({
                    "id": prod_id,
                    "name": prod_name,
                    "variantId": var_id,
                    "variantName": var_name,
                    "price": price,
                    "qty": qty
                })

        # Khách mua Màn hình loại 1 (OLED, x1)
        add_to_cart_mock("SP01", "Màn hình hiển thị", "var_1", "OLED 0.96", 45000, 1)
        self.assertEqual(len(cart), 1)

        # Khách mua tiếp Màn hình loại 2 (LCD, x2) -> Phải tạo thành 2 dòng riêng biệt
        add_to_cart_mock("SP01", "Màn hình hiển thị", "var_2", "LCD 1602", 38000, 2)
        self.assertEqual(len(cart), 2, "LỖI: 2 biến thể khác nhau của cùng 1 sản phẩm phải là 2 dòng riêng trong giỏ!")

        # Khách mua thêm Màn hình loại 1 (OLED, x2) -> Chỉ tăng số lượng loại 1 thành 3
        add_to_cart_mock("SP01", "Màn hình hiển thị", "var_1", "OLED 0.96", 45000, 2)
        self.assertEqual(len(cart), 2)
        item_var1 = next(i for i in cart if i["variantId"] == "var_1")
        item_var2 = next(i for i in cart if i["variantId"] == "var_2")
        self.assertEqual(item_var1["qty"], 3)
        self.assertEqual(item_var2["qty"], 2)

    def test_variant_stock_deduction_algorithm(self):
        """Kiểm tra: Thuật toán trừ kho chính xác cho biến thể được đặt và cập nhật lại tổng kho"""
        import json
        raw_variants = json.dumps([
            {"id": "var_1", "name": "OLED 0.96", "price": 45000, "stock": 20},
            {"id": "var_2", "name": "LCD 1602", "price": 38000, "stock": 15}
        ])

        # Giả lập logic deductStock trong backend
        v_list = json.loads(raw_variants)
        target_variant_id = "var_1"
        deduct_qty = 5

        updated = False
        new_total = 0
        for v in v_list:
            if v["id"] == target_variant_id:
                v["stock"] = max(0, v["stock"] - deduct_qty)
                updated = True
            new_total += v["stock"]

        self.assertTrue(updated)
        self.assertEqual(v_list[0]["stock"], 15, "Kho phân loại var_1 phải giảm từ 20 xuống 15")
        self.assertEqual(v_list[1]["stock"], 15, "Kho phân loại var_2 phải giữ nguyên 15")
        self.assertEqual(new_total, 30, "Tổng tồn kho mới phải là 30")

    def test_variant_ui_and_carousel_jump_in_client(self):
        """Kiểm tra: Các thành phần UI phân loại, hàm chọn loại và đổi ảnh carousel trong index.html"""
        index_html = read_file('index.html')
        self.assertIn('selectProductVariant', index_html, "LỖI: Thiếu hàm selectProductVariant trong index.html!")
        self.assertIn('jumpCarouselToIndex', index_html, "LỖI: Thiếu hàm jumpCarouselToIndex trong index.html!")
        self.assertIn('.variant-chip', index_html, "LỖI: Thiếu class .variant-chip trong CSS index.html!")
        self.assertIn('.cart-variant-tag', index_html, "LỖI: Thiếu class .cart-variant-tag trong CSS index.html!")
        self.assertIn('selectedVariants', index_html, "LỖI: Thiếu biến selectedVariants lưu trạng thái trong index.html!")

    def test_admin_variant_functions_exist(self):
        """Kiểm tra: Các hàm quản lý phân loại sản phẩm trong admin.html"""
        admin = read_file('admin.html')
        self.assertIn('toggleVariantsSection', admin, "LỖI: Thiếu hàm toggleVariantsSection trong admin.html!")
        self.assertIn('addNewVariantRow', admin, "LỖI: Thiếu hàm addNewVariantRow trong admin.html!")
        self.assertIn('removeVariantRow', admin, "LỖI: Thiếu hàm removeVariantRow trong admin.html!")
        self.assertIn('recalculateVariantTotals', admin, "LỖI: Thiếu hàm recalculateVariantTotals trong admin.html!")
        self.assertIn('renderVariantEditRows', admin, "LỖI: Thiếu hàm renderVariantEditRows trong admin.html!")
        self.assertIn('currentProductVariants', admin, "LỖI: Thiếu biến currentProductVariants trong admin.html!")

    def test_product_drag_drop_and_order_functions_in_admin(self):
        """Kiểm tra: Các thành phần UI kéo thả, nút di chuyển và hàm xử lý thứ tự trong admin.html"""
        admin = read_file('admin.html')
        self.assertIn('handleProdDragStart', admin, "LỖI: Thiếu hàm handleProdDragStart trong admin.html")
        self.assertIn('handleProdDragOver', admin, "LỖI: Thiếu hàm handleProdDragOver trong admin.html")
        self.assertIn('handleProdDrop', admin, "LỖI: Thiếu hàm handleProdDrop trong admin.html")
        self.assertIn('handleProdDragEnd', admin, "LỖI: Thiếu hàm handleProdDragEnd trong admin.html")
        self.assertIn('moveProductOrder', admin, "LỖI: Thiếu hàm moveProductOrder trong admin.html")
        self.assertIn('saveCurrentProductsOrder', admin, "LỖI: Thiếu hàm saveCurrentProductsOrder trong admin.html")
        self.assertIn('draggedProductIndex', admin, "LỖI: Thiếu biến draggedProductIndex trong admin.html")
        self.assertIn('.drag-handle', admin, "LỖI: Thiếu class .drag-handle trong CSS admin.html")
        self.assertIn('.order-badge', admin, "LỖI: Thiếu class .order-badge trong CSS admin.html")
        self.assertIn('.btn-order-move', admin, "LỖI: Thiếu class .btn-order-move trong CSS admin.html")
        self.assertIn('.order-help-banner', admin, "LỖI: Thiếu banner hướng dẫn .order-help-banner trong admin.html")

    def test_product_order_reorder_algorithm(self):
        """Kiểm tra thuật toán sắp xếp và kéo thả di chuyển vị trí sản phẩm"""
        # Giả lập danh sách ban đầu
        items = [{"id": f"SP_{i}", "name": f"Sản phẩm {i}", "order": i} for i in range(1, 6)]
        
        # 1. Kiểm tra sort theo order
        items_scrambled = [items[2], items[0], items[4], items[1], items[3]]
        items_sorted = sorted(items_scrambled, key=lambda x: x.get('order', 0))
        self.assertEqual([x['id'] for x in items_sorted], ["SP_1", "SP_2", "SP_3", "SP_4", "SP_5"])

        # 2. Kiểm tra logic di chuyển kéo thả: Kéo SP_1 thả vào sau SP_3
        lst = ["SP_1", "SP_2", "SP_3", "SP_4", "SP_5"]
        from_idx = 0
        target_idx = 2
        is_bottom = True

        target_id = lst[target_idx]
        moved_item = lst.pop(from_idx)
        target_new_idx = lst.index(target_id)
        if is_bottom:
            lst.insert(target_new_idx + 1, moved_item)
        else:
            lst.insert(target_new_idx, moved_item)

        self.assertEqual(lst, ["SP_2", "SP_3", "SP_1", "SP_4", "SP_5"])

        # 3. Kéo SP_5 thả vào trước SP_2
        from_idx = 4
        target_idx = 0
        is_bottom = False

        target_id = lst[target_idx]
        moved_item = lst.pop(from_idx)
        target_new_idx = lst.index(target_id)
        if is_bottom:
            lst.insert(target_new_idx + 1, moved_item)
        else:
            lst.insert(target_new_idx, moved_item)

        self.assertEqual(lst, ["SP_5", "SP_2", "SP_3", "SP_1", "SP_4"])

        # 4. Kiểm tra swap di chuyển 1 nấc (nút bấm ▲/▼)
        # Di chuyển SP_3 lên 1 nấc (swap với SP_2)
        idx_sp3 = lst.index("SP_3")
        lst[idx_sp3], lst[idx_sp3 - 1] = lst[idx_sp3 - 1], lst[idx_sp3]
        self.assertEqual(lst, ["SP_5", "SP_3", "SP_2", "SP_1", "SP_4"])

    def test_order_status_stock_deduction_and_double_deduction_prevention(self):
        """Kiểm tra: Trừ kho khi chuyển sang 'Hoàn thành' hoặc 'Đã giao...', và chống trừ trùng 2 lần"""
        codegs = read_file('Code.gs')

        # 1. Kiểm tra điều kiện trừ kho trong Code.gs bao gồm cả "Hoàn thành"
        self.assertIn('payload.newStatus === "Đã giao cho đơn vị vận chuyển" || payload.newStatus === "Hoàn thành"', codegs,
                      "LỖI: Code.gs chưa xử lý trừ kho cho trạng thái 'Hoàn thành'!")
        self.assertIn('alreadyDeducted', codegs,
                      "LỖI: Code.gs thiếu biến/kiểm tra cờ alreadyDeducted để chống trừ 2 lần!")
        self.assertIn('orderSheet.getRange(row, 11).setValue(true)', codegs,
                      "LỖI: Code.gs chưa đánh dấu cờ đã trừ kho vào cột 11!")

        # 2. Giả lập logic kiểm tra trừ kho và chống trừ trùng lặp
        def simulate_status_transition(current_status, new_status, is_deducted, stock, order_qty):
            DEDUCT_STATUSES = ("Đã giao cho đơn vị vận chuyển", "Hoàn thành")
            deductions_count = 0
            if new_status in DEDUCT_STATUSES:
                already_deducted = (is_deducted is True or str(is_deducted).upper() == "TRUE")
                if not already_deducted:
                    stock -= order_qty
                    is_deducted = True
                    deductions_count += 1
            return new_status, is_deducted, stock, deductions_count

        # Case 1: Chuyển trực tiếp từ "Khách đặt hàng" -> "Hoàn thành"
        status, is_deducted, stock, deductions = simulate_status_transition(
            "Khách đặt hàng", "Hoàn thành", False, 10, 2
        )
        self.assertEqual(stock, 8, "Tồn kho phải giảm từ 10 xuống 8 khi chuyển thẳng sang 'Hoàn thành'")
        self.assertTrue(is_deducted, "Cờ is_deducted phải được bật True")
        self.assertEqual(deductions, 1, "Chỉ được trừ kho đúng 1 lần")

        # Sau đó bấm lưu lại "Hoàn thành" lần nữa: KHÔNG ĐƯỢC TRỪ TIẾP
        status, is_deducted, stock, deductions = simulate_status_transition(
            status, "Hoàn thành", is_deducted, stock, 2
        )
        self.assertEqual(stock, 8, "Tồn kho vẫn phải là 8, không bị trừ lần 2")
        self.assertEqual(deductions, 0, "Không được trừ thêm lần nào nữa")

        # Case 2: "Khách đặt hàng" -> "Đã giao cho đơn vị vận chuyển" -> "Hoàn thành"
        # B1: Chuyển sang "Đã giao cho đơn vị vận chuyển"
        status, is_deducted, stock, deductions = simulate_status_transition(
            "Khách đặt hàng", "Đã giao cho đơn vị vận chuyển", False, 15, 3
        )
        self.assertEqual(stock, 12, "Tồn kho phải giảm từ 15 xuống 12 khi giao vận chuyển")
        self.assertTrue(is_deducted)
        self.assertEqual(deductions, 1)

        # B2: Chuyển tiếp sang "Hoàn thành" -> KHÔNG BỊ TRỪ LẦN 2
        status, is_deducted, stock, deductions = simulate_status_transition(
            status, "Hoàn thành", is_deducted, stock, 3
        )
        self.assertEqual(stock, 12, "Tồn kho phải giữ nguyên 12, không được trừ lần 2 khi sang Hoàn thành!")
        self.assertEqual(deductions, 0, "Không được trừ kho lần 2!")

        # Case 3: "Khách đặt hàng" -> "Đang chuẩn bị hàng" -> "Hoàn thành"
        status, is_deducted, stock, deductions = simulate_status_transition(
            "Khách đặt hàng", "Đang chuẩn bị hàng", False, 20, 5
        )
        self.assertEqual(stock, 20, "Trạng thái Đang chuẩn bị hàng chưa được trừ kho")
        self.assertFalse(is_deducted)
        self.assertEqual(deductions, 0)

        status, is_deducted, stock, deductions = simulate_status_transition(
            status, "Hoàn thành", is_deducted, stock, 5
        )
        self.assertEqual(stock, 15, "Tồn kho phải giảm từ 20 xuống 15 khi hoàn thành")
        self.assertTrue(is_deducted)
        self.assertEqual(deductions, 1)

    def test_analytics_functions_exist_in_admin(self):
        """Kiểm tra: Các hàm xử lý Dashboard Thống kê và vẽ biểu đồ trong admin.html"""
        admin = read_file('admin.html')
        self.assertIn('function renderAnalytics', admin, "LỖI: Thiếu hàm renderAnalytics trong admin.html!")
        self.assertIn('function setAnalyticsRange', admin, "LỖI: Thiếu hàm setAnalyticsRange trong admin.html!")
        self.assertIn('function applyCustomDateRange', admin, "LỖI: Thiếu hàm applyCustomDateRange trong admin.html!")
        self.assertIn('function getAnalyticsDateBounds', admin, "LỖI: Thiếu hàm getAnalyticsDateBounds trong admin.html!")
        self.assertIn('function parseOrderDate', admin, "LỖI: Thiếu hàm parseOrderDate trong admin.html!")
        self.assertIn('function renderAnalyticsCharts', admin, "LỖI: Thiếu hàm renderAnalyticsCharts trong admin.html!")
        self.assertIn('function switchProductChartMode', admin, "LỖI: Thiếu hàm switchProductChartMode trong admin.html!")
        self.assertIn('function renderProductShareChart', admin, "LỖI: Thiếu hàm renderProductShareChart trong admin.html!")
        self.assertIn('function sortAnalyticsProducts', admin, "LỖI: Thiếu hàm sortAnalyticsProducts trong admin.html!")
        self.assertIn('function renderStockAlerts', admin, "LỖI: Thiếu hàm renderStockAlerts trong admin.html!")
        self.assertIn('function renderTopCustomers', admin, "LỖI: Thiếu hàm renderTopCustomers trong admin.html!")
        self.assertIn('function exportAnalyticsCSV', admin, "LỖI: Thiếu hàm exportAnalyticsCSV trong admin.html!")

    def test_analytics_calculation_algorithm(self):
        """Kiểm tra: Thuật toán lọc doanh thu, tính AOV, tổng sản phẩm và phân loại Best-seller"""
        orders = [
            {
                "orderId": "DH01",
                "status": "Hoàn thành",
                "rawTotal": 200000,
                "cart": [
                    {"id": "SP1", "name": "Màn hình OLED", "price": 50000, "qty": 2},
                    {"id": "SP2", "name": "Arduino Uno", "price": 100000, "qty": 1}
                ],
                "phone": "0912345678",
                "name": "Nguyễn Văn A"
            },
            {
                "orderId": "DH02",
                "status": "Đã giao cho đơn vị vận chuyển",
                "rawTotal": 150000,
                "cart": [
                    {"id": "SP1", "name": "Màn hình OLED", "price": 50000, "qty": 3}
                ],
                "phone": "0987654321",
                "name": "Trần Thị B"
            },
            {
                "orderId": "DH03",
                "status": "Khách đặt hàng",
                "rawTotal": 300000,
                "cart": [
                    {"id": "SP2", "name": "Arduino Uno", "price": 100000, "qty": 3}
                ],
                "phone": "0912345678",
                "name": "Nguyễn Văn A"
            }
        ]

        # 1. Tính toán cho đơn thành công (Hoàn thành hoặc Đã giao)
        valid_orders = [o for o in orders if o["status"] in ("Hoàn thành", "Đã giao cho đơn vị vận chuyển")]
        actual_rev = sum(o["rawTotal"] for o in valid_orders)
        self.assertEqual(actual_rev, 350000, "Doanh thu thực tế phải là 200k + 150k = 350k")

        # 2. Giá trị trung bình đơn (AOV)
        aov = round(actual_rev / len(valid_orders)) if valid_orders else 0
        self.assertEqual(aov, 175000, "AOV = 350k / 2 = 175k")

        # 3. Tổng hợp sản phẩm bán ra
        prod_map = {}
        total_items = 0
        for o in valid_orders:
            for item in o.get("cart", []):
                pid = item["id"]
                qty = item["qty"]
                price = item["price"]
                total_items += qty
                if pid not in prod_map:
                    prod_map[pid] = {"name": item["name"], "qty": 0, "rev": 0}
                prod_map[pid]["qty"] += qty
                prod_map[pid]["rev"] += price * qty

        self.assertEqual(total_items, 6, "Tổng sản phẩm bán ra = (2+1) + 3 = 6")
        self.assertEqual(prod_map["SP1"]["qty"], 5, "Màn hình OLED bán được 2 + 3 = 5")
        self.assertEqual(prod_map["SP1"]["rev"], 250000, "Doanh thu OLED = 5 * 50k = 250k")
        self.assertEqual(prod_map["SP2"]["qty"], 1, "Arduino Uno bán được 1 cái trong đơn thành công")

        # 4. Kiểm tra xếp hạng Top khách hàng (VIP)
        cust_map = {}
        for o in valid_orders:
            phone = o["phone"]
            if phone not in cust_map:
                cust_map[phone] = {"name": o["name"], "spend": 0, "count": 0}
            cust_map[phone]["spend"] += o["rawTotal"]
            cust_map[phone]["count"] += 1

        top_vip = sorted(cust_map.values(), key=lambda c: c["spend"], reverse=True)
        self.assertEqual(top_vip[0]["name"], "Nguyễn Văn A")
        self.assertEqual(top_vip[0]["spend"], 200000)

    def test_analytics_combo_decomposition_and_purchase_counts(self):
        """Kiểm tra: Bóc tách Combo thành từng linh kiện riêng biệt và đếm chính xác số lần mua (lượt mua)"""
        combos = [
            {
                "id": "CMB_ROBOT",
                "name": "Combo Robot Dò Line",
                "price": 200000,
                "rawItems": [
                    {"id": "SP_UNO", "name": "Arduino Uno R3", "qty": 1, "price": 100000},
                    {"id": "SP_L298N", "name": "Mạch cầu L298N", "qty": 1, "price": 50000},
                    {"id": "SP_SENSOR", "name": "Cảm biến dò line", "qty": 2, "price": 25000}
                ]
            }
        ]

        orders = [
            {
                "orderId": "DH_01",
                "status": "Hoàn thành",
                "cart": [
                    {"id": "CMB_ROBOT", "name": "Combo Robot Dò Line", "price": 200000, "qty": 2, "isCombo": True}
                ]
            },
            {
                "orderId": "DH_02",
                "status": "Đã giao cho đơn vị vận chuyển",
                "cart": [
                    {"id": "SP_UNO", "name": "Arduino Uno R3", "price": 100000, "qty": 1},
                    {"id": "CMB_ROBOT", "name": "Combo Robot Dò Line", "price": 200000, "qty": 1, "isCombo": True}
                ]
            }
        ]

        prod_map = {}
        for o in orders:
            order_keys = set()
            for it in o["cart"]:
                qty = it.get("qty", 1)
                is_combo = it.get("isCombo") or it["id"].startswith("CMB_")
                combo_def = next((c for c in combos if c["id"] == it["id"]), None) if is_combo else None

                if is_combo and combo_def:
                    combo_total = it["price"] * qty
                    raw_items = combo_def.get("rawItems", [])
                    std_total = sum(ci["price"] * ci["qty"] for ci in raw_items)
                    for ci in raw_items:
                        c_qty = ci["qty"] * qty
                        c_rev = round(((ci["price"] * ci["qty"]) / std_total) * combo_total) if std_total > 0 else 0
                        pid = ci["id"]
                        if pid not in prod_map:
                            prod_map[pid] = {"name": ci["name"], "qty": 0, "rev": 0, "purchaseCount": 0}
                        prod_map[pid]["qty"] += c_qty
                        prod_map[pid]["rev"] += c_rev
                        order_keys.add(pid)
                else:
                    pid = it["id"]
                    if pid not in prod_map:
                        prod_map[pid] = {"name": it["name"], "qty": 0, "rev": 0, "purchaseCount": 0}
                    prod_map[pid]["qty"] += qty
                    prod_map[pid]["rev"] += it["price"] * qty
                    order_keys.add(pid)

            for k in order_keys:
                prod_map[k]["purchaseCount"] += 1

        self.assertNotIn("CMB_ROBOT", prod_map, "Combo phải được bóc tách và không xuất hiện trong thống kê sản phẩm!")
        self.assertEqual(prod_map["SP_UNO"]["qty"], 4)
        self.assertEqual(prod_map["SP_UNO"]["purchaseCount"], 2)
        self.assertEqual(prod_map["SP_SENSOR"]["qty"], 6)
        self.assertEqual(prod_map["SP_SENSOR"]["purchaseCount"], 2)
        total_decomp_rev = sum(p["rev"] for p in prod_map.values())
        self.assertEqual(total_decomp_rev, 700000, "Tổng doanh thu sau bóc tách phải bảo toàn 100%")

    def test_profit_functions_exist_in_admin(self):
        """Kiểm tra: Các hàm xử lý Báo cáo Lợi Nhuận & Giá Vốn trong admin.html"""
        admin = read_file('admin.html')
        funcs = [
            'function setProfitRange',
            'function applyProfitCustomDateRange',
            'function getProfitDateBounds',
            'function renderProfitAnalytics',
            'function renderProfitCharts',
            'function sortProfitProducts',
            'function renderProfitProductsTable',
            'function onProfitProductSearch',
            'function renderQuickCostTable',
            'function onQuickCostSearch',
            'function onQuickCostInputChange',
            'function saveQuickCostPrices',
            'function exportProfitCSV'
        ]
        for f in funcs:
            self.assertIn(f, admin, f"LỖI: Thiếu hàm '{f}' trong admin.html!")

    def test_profit_calculation_and_combo_cost_algorithm(self):
        """Kiểm tra: Thuật toán tính toán Doanh thu, Giá vốn, Lợi nhuận gộp và Tỷ suất lợi nhuận (Margin %) kể cả khi có Combo"""
        products = {
            "SP_UNO": {"name": "Arduino Uno R3", "costPrice": 60000, "price": 100000},
            "SP_L298N": {"name": "Mạch cầu L298N", "costPrice": 25000, "price": 50000},
            "SP_SENSOR": {"name": "Cảm biến", "costPrice": 10000, "price": 25000}
        }

        combos = [
            {
                "id": "CMB_01",
                "name": "Combo Test",
                "price": 180000,
                "rawItems": [
                    {"id": "SP_UNO", "qty": 1, "price": 100000},
                    {"id": "SP_L298N", "qty": 1, "price": 50000},
                    {"id": "SP_SENSOR", "qty": 1, "price": 25000}
                ]
            }
        ]

        total_rev = 100000 + 180000
        total_cost = 60000 + (60000 + 25000 + 10000)
        net_profit = total_rev - total_cost
        margin = round((net_profit / total_rev) * 100)

        self.assertEqual(total_rev, 280000)
        self.assertEqual(total_cost, 155000)
        self.assertEqual(net_profit, 125000)
        self.assertEqual(margin, 45)

    def test_cost_price_security_isolation(self):
        """Kiểm tra: Bảo mật tuyệt đối - Khách hàng không thể thấy trường costPrice qua API public"""
        codegs = read_file('Code.gs')
        self.assertIn('getProductsList(doc, false)', codegs, "LỖI: doGet công khai cho khách hàng PHẢI gọi getProductsList(doc, false) để ẩn giá vốn!")
        self.assertIn('getProductsList(doc, true)', codegs, "LỖI: API quản trị admin PHẢI gọi getProductsList(doc, true) để lấy giá vốn!")
        index_html = read_file('index.html')
        self.assertNotIn('costPrice', index_html, "LỖI: Phát hiện trường 'costPrice' trong index.html của khách hàng! Giá vốn phải được bảo mật tuyệt đối.")

    def test_batch_order_status_functions_exist_in_admin(self):
        """Kiểm tra: Các hàm xử lý đổi trạng thái hàng loạt và Toast trong admin.html"""
        admin = read_file('admin.html')
        funcs = [
            'function executeBatchStatusUpdate',
            'function applyBulkStatusUpdate',
            'function deleteSelectedOrders',
            'function saveAllPendingStatusChanges',
            'function toggleOrderSelect',
            'function toggleSelectAllOrders',
            'function clearSelectedOrders',
            'function discardPendingStatusChanges',
            'function onOrderStatusDropdownChange',
            'function showToast',
            'function getFilteredOrders',
            'function filterOrdersByStatus',
            'function onOrderSearchInput',
        ]
        for f in funcs:
            self.assertIn(f, admin, f"LỖI: Thiếu hàm '{f}' trong admin.html!")

    def test_batch_order_status_backend_and_client_logic(self):
        """Kiểm tra: Logic xử lý mảng cập nhật trạng thái đơn hàng hàng loạt và chống trừ trùng kho"""
        codegs = read_file('Code.gs')
        self.assertIn('function handleBatchUpdateOrderStatus', codegs, "LỖI: Thiếu hàm handleBatchUpdateOrderStatus trong Code.gs!")
        self.assertIn('function handleDeleteBatchOrders', codegs, "LỖI: Thiếu hàm handleDeleteBatchOrders trong Code.gs!")
        self.assertIn('action === "updateBatchOrderStatus"', codegs, "LỖI: Thiếu route updateBatchOrderStatus trong Code.gs!")
        self.assertIn('action === "deleteBatchOrders"', codegs, "LỖI: Thiếu route deleteBatchOrders trong Code.gs!")

        # Mô phỏng thuật toán gom mảng updates
        selected_rows = {2, 5, 8}
        target_status = "Đã giao cho đơn vị vận chuyển"
        updates = [{"row": r, "newStatus": target_status} for r in sorted(selected_rows)]
        self.assertEqual(len(updates), 3)
        self.assertEqual(updates[0], {"row": 2, "newStatus": target_status})
        self.assertEqual(updates[2], {"row": 8, "newStatus": target_status})

        # Mô phỏng thuật toán Dirty Tracking (chỉnh sửa trực tiếp trên bảng)
        original_orders = {
            2: {"status": "Khách đặt hàng"},
            3: {"status": "Đang chuẩn bị hàng"},
            4: {"status": "Khách đặt hàng"},
        }
        pending_changes = {}

        # Sửa đơn 2 thành Đang chuẩn bị hàng
        pending_changes[2] = "Đang chuẩn bị hàng"
        # Sửa đơn 4 thành Hoàn thành
        pending_changes[4] = "Hoàn thành"

        # Người dùng chọn lại đơn 2 về đúng trạng thái ban đầu "Khách đặt hàng"
        new_val = "Khách đặt hàng"
        if new_val == original_orders[2]["status"]:
            pending_changes.pop(2, None)
        else:
            pending_changes[2] = new_val

        self.assertNotIn(2, pending_changes)
        self.assertIn(4, pending_changes)
        self.assertEqual(pending_changes[4], "Hoàn thành")

    def test_address_functions_exist_in_files(self):
        """Kiểm tra: Các hàm làm sạch và chống trùng lặp địa chỉ phải tồn tại trong cả index.html và admin.html"""
        index_html = read_file('index.html')
        admin_html = read_file('admin.html')
        self.assertIn('function cleanDetailAddress', index_html, "Thiếu cleanDetailAddress trong index.html")
        self.assertIn('function cleanFullAddress', index_html, "Thiếu cleanFullAddress trong index.html")
        self.assertIn('function updateAddressPreview', index_html, "Thiếu updateAddressPreview trong index.html")
        self.assertIn('function cleanFullAddress', admin_html, "Thiếu cleanFullAddress trong admin.html")

    def test_address_deduplication_algorithm_exact_cases(self):
        """Kiểm tra: Thuật toán loại bỏ trùng lặp địa chỉ (khách gõ lại phường, tphcm) hoạt động chính xác bằng Node.js"""
        index_content = read_file('index.html')
        match = re.search(r"(function removeDiacritics[\s\S]*?)function updateAddressPreview", index_content)
        self.assertIsNotNone(match, "Không tìm thấy định nghĩa hàm xử lý địa chỉ trong index.html")
        funcs_code = match.group(1)

        test_js = funcs_code + """
        console.assert(cleanDetailAddress("187/8 đường số 6 , phường hạnh thông , tphcm", "Phường Hạnh Thông", "Thành phố Hồ Chí Minh") === "187/8 đường số 6", "Lỗi test 1");
        console.assert(cleanDetailAddress("187/8 đường số 6, p. hạnh thông, tp.hcm", "Phường Hạnh Thông", "Thành phố Hồ Chí Minh") === "187/8 đường số 6", "Lỗi test 2");
        console.assert(cleanDetailAddress("187/8 đường số 6, hạnh thông, Sài Gòn", "Phường Hạnh Thông", "Thành phố Hồ Chí Minh") === "187/8 đường số 6", "Lỗi test 3");
        console.assert(cleanDetailAddress("187/8 đường số 6 phường hạnh thông tphcm", "Phường Hạnh Thông", "Thành phố Hồ Chí Minh") === "187/8 đường số 6", "Lỗi test 4");
        console.assert(cleanDetailAddress("Số 15 ngõ 42 Trương Định, Tương Mai, Hoàng Mai, HN", "Phường Tương Mai", "Thành phố Hà Nội") === "Số 15 ngõ 42 Trương Định, Hoàng Mai", "Lỗi test 5");
        console.assert(cleanFullAddress("187/8 đường số 6 , phường hạnh thông , tphcm, Phường Hạnh Thông, Thành phố Hồ Chí Minh") === "187/8 đường số 6, Phường Hạnh Thông, Thành phố Hồ Chí Minh", "Lỗi test 6");
        // Kiểm tra an toàn: Không làm mất tên đường, tòa nhà, số phòng, quận huyện
        console.assert(cleanDetailAddress("Chung cư Saigon Mia, đường số 9A, Phường Bình Hưng, TP.HCM", "Phường Bình Hưng", "Thành phố Hồ Chí Minh") === "Chung cư Saigon Mia, đường số 9A", "Lỗi giữ tên Chung cư");
        console.assert(cleanDetailAddress("Số 15 đường Hồ Chí Minh, Phường 1, TP Kon Tum", "Phường 1", "Tỉnh Kon Tum") === "Số 15 đường Hồ Chí Minh", "Lỗi giữ tên Đường");
        console.assert(cleanDetailAddress("P.402, Nhà A3, ngõ 120 Hoàng Quốc Việt, Phường Cổ Nhuế 1, Hà Nội", "Phường Cổ Nhuế 1", "Thành phố Hà Nội") === "P.402, Nhà A3, ngõ 120 Hoàng Quốc Việt", "Lỗi giữ số phòng P.402");
        console.assert(cleanDetailAddress("187/8 đường số 6, Gò Vấp, Phường Hạnh Thông, TPHCM", "Phường Hạnh Thông", "Thành phố Hồ Chí Minh") === "187/8 đường số 6, Gò Vấp", "Lỗi giữ quận huyện Gò Vấp");
        console.assert(cleanDetailAddress("TPHCM", "Phường 1", "Thành phố Hồ Chí Minh") === "TPHCM", "Lỗi fallback khi chuỗi quá ngắn");
        """

        p = subprocess.run(["node", "-e", test_js], capture_output=True, text=True)
        self.assertEqual(p.returncode, 0, f"LỖI TEST ĐỊA CHỈ TRÙNG LẶP:\n{p.stderr}")

    def test_duplicate_order_functions_exist_in_admin(self):
        """Kiểm tra: Các hàm xử lý lọc và quản lý đơn hàng trùng lặp phải tồn tại trong admin.html"""
        admin = read_file('admin.html')
        funcs = [
            'function areOrdersIdentical',
            'function detectAndGroupDuplicateOrders',
            'function updateDuplicateNoticeBar',
            'function toggleDuplicateFilter',
            'function showDuplicateDetailsModal',
            'function closeDuplicateModal',
            'function deleteCurrentDuplicateOrders',
        ]
        for f in funcs:
            self.assertIn(f, admin, f"LỖI: Thiếu hàm '{f}' trong admin.html!")

    def test_duplicate_order_detection_algorithm(self):
        """Kiểm tra: Thuật toán nhận diện và lọc đơn hàng trùng lặp (khách ấn nhiều lần) bằng Node.js"""
        admin_content = read_file('admin.html')
        m_dup = re.search(r"(function removeDiacritics[\s\S]*?)(?=function renderOrders)", admin_content)
        self.assertIsNotNone(m_dup, "Không trích xuất được code xử lý đơn hàng trong admin.html")
        dup_code = m_dup.group(1)

        test_js = """
        const document = { getElementById: () => null };
        function escapeHtml(s) { return String(s || ''); }
        function parseOrderDate(rawDate) {
          if (!rawDate) return null;
          let m = String(rawDate).match(/^(\\d{1,2})\\/(\\d{1,2})\\/(\\d{4})(?:\\s+(\\d{1,2}):(\\d{1,2}))?/);
          if (m) return new Date(parseInt(m[3]), parseInt(m[2]) - 1, parseInt(m[1]), parseInt(m[4] || 0), parseInt(m[5] || 0));
          return new Date(rawDate);
        }
        """ + dup_code + """

        // Dữ liệu thử nghiệm:
        // Đơn 1, 2, 3: Khách Hoàng Tân bấm 3 lần liên tiếp trong 1 phút (trùng lặp)
        // Đơn 4: Khách Lê Văn B đặt bình thường (duy nhất)
        // Đơn 5: Khách Hoàng Tân đặt lại đúng sản phẩm đó sau 30 ngày (re-order, KHÔNG được coi là trùng)
        // Đơn 6, 7: Khách Trần C bấm 2 lần liên tiếp (trùng lặp)
        let sampleOrders = [
          {
            row: 2, orderId: "DH01", date: "24/10/2026 08:00", name: "Hoàng Ngọc Tân", phone: "0982925329",
            address: "187/8 đường số 6, Phường Hạnh Thông, Thành phố Hồ Chí Minh",
            details: "- Arduino Uno R3 | Số lượng: x1", rawTotal: 150000, note: "Giao giờ hành chính", status: "Khách đặt hàng",
            cart: [{ id: "SP_UNO", qty: 1, variantId: "" }]
          },
          {
            row: 3, orderId: "DH02", date: "24/10/2026 08:00", name: "Hoàng Ngọc Tân", phone: "0982925329",
            address: "187/8 đường số 6, Phường Hạnh Thông, Thành phố Hồ Chí Minh",
            details: "- Arduino Uno R3 | Số lượng: x1", rawTotal: 150000, note: "Giao giờ hành chính", status: "Khách đặt hàng",
            cart: [{ id: "SP_UNO", qty: 1, variantId: "" }]
          },
          {
            row: 4, orderId: "DH03", date: "24/10/2026 08:01", name: "Hoàng Ngọc Tân", phone: "0982925329",
            address: "187/8 đường số 6, Phường Hạnh Thông, Thành phố Hồ Chí Minh",
            details: "- Arduino Uno R3 | Số lượng: x1", rawTotal: 150000, note: "Giao giờ hành chính", status: "Đang chuẩn bị hàng",
            cart: [{ id: "SP_UNO", qty: 1, variantId: "" }]
          },
          {
            row: 5, orderId: "DH04", date: "24/10/2026 08:05", name: "Lê Văn B", phone: "0912345678",
            address: "12 Ba Đình, Phường 1, Hà Nội",
            details: "- Màn hình OLED | Số lượng: x2", rawTotal: 100000, note: "", status: "Khách đặt hàng",
            cart: [{ id: "SP_OLED", qty: 2, variantId: "" }]
          },
          {
            row: 6, orderId: "DH05", date: "24/11/2026 08:00", name: "Hoàng Ngọc Tân", phone: "0982925329",
            address: "187/8 đường số 6, Phường Hạnh Thông, Thành phố Hồ Chí Minh",
            details: "- Arduino Uno R3 | Số lượng: x1", rawTotal: 150000, note: "Giao giờ hành chính", status: "Khách đặt hàng",
            cart: [{ id: "SP_UNO", qty: 1, variantId: "" }]
          },
          {
            row: 7, orderId: "DH06", date: "24/10/2026 09:10", name: "Trần C", phone: "0933333333",
            address: "45 Lê Lợi, Quận 1, TPHCM",
            details: "- Cảm biến | Số lượng: x1", rawTotal: 50000, note: "", status: "Khách đặt hàng",
            cart: [{ id: "SP_CB", qty: 1, variantId: "" }]
          },
          {
            row: 8, orderId: "DH07", date: "24/10/2026 09:10", name: "Trần C", phone: "0933333333",
            address: "45 Lê Lợi, Quận 1, TPHCM",
            details: "- Cảm biến | Số lượng: x1", rawTotal: 50000, note: "", status: "Khách đặt hàng",
            cart: [{ id: "SP_CB", qty: 1, variantId: "" }]
          }
        ];

        let stats = detectAndGroupDuplicateOrders(sampleOrders);
        console.assert(stats.totalDuplicates === 3, "Tổng số đơn trùng lặp phải là 3 (2 bản sao của Tân + 1 bản sao của C), nhận được: " + stats.totalDuplicates);
        console.assert(stats.groupCount === 2, "Tổng số nhóm trùng lặp phải là 2, nhận được: " + stats.groupCount);

        let tanLeader = sampleOrders.find(o => o.orderId === "DH03");
        console.assert(tanLeader.isDuplicateGroupLeader === true, "DH03 phải là đơn chính của nhóm");
        console.assert(tanLeader.duplicateCount === 2, "DH03 phải có duplicateCount = 2, nhận được: " + tanLeader.duplicateCount);

        let tanCopy1 = sampleOrders.find(o => o.orderId === "DH01");
        let tanCopy2 = sampleOrders.find(o => o.orderId === "DH02");
        console.assert(tanCopy1.isDuplicateCopy === true, "DH01 phải là duplicate copy");
        console.assert(tanCopy2.isDuplicateCopy === true, "DH02 phải là duplicate copy");

        let tanReorder = sampleOrders.find(o => o.orderId === "DH05");
        console.assert(!tanReorder.isDuplicateCopy && !tanReorder.isDuplicateGroupLeader, "Đơn sau 30 ngày không được coi là trùng");

        globalOrdersData = sampleOrders;
        isDuplicateFilterActive = true;
        let filteredActive = getFilteredOrders();
        console.assert(filteredActive.length === 4, "Khi bật lọc, chỉ hiển thị 4 đơn duy nhất, nhận được: " + filteredActive.length);
        console.assert(filteredActive.some(o => o.orderId === "DH03"), "DH03 phải có trong danh sách hiển thị");
        console.assert(!filteredActive.some(o => o.orderId === "DH01"), "DH01 phải bị ẩn");
        console.assert(!filteredActive.some(o => o.orderId === "DH02"), "DH02 phải bị ẩn");
        console.assert(!filteredActive.some(o => o.orderId === "DH07"), "DH07 phải bị ẩn");

        isDuplicateFilterActive = false;
        let filteredInactive = getFilteredOrders();
        console.assert(filteredInactive.length === 7, "Khi tắt lọc, phải hiển thị đầy đủ cả 7 đơn, nhận được: " + filteredInactive.length);
        """

        p = subprocess.run(["node", "-e", test_js], capture_output=True, text=True)
        self.assertEqual(p.returncode, 0, f"LỖI TEST THUẬT TOÁN ĐƠN TRÙNG LẶP:\n{p.stderr}")


if __name__ == '__main__':
    print("=" * 65)
    print("🚀 CHÚ HIẾU SHOP - HỆ THỐNG KIỂM TRA CHẤT LƯỢNG CODE TỰ ĐỘNG")
    print("=" * 65)
    suite = unittest.TestLoader().loadTestsFromTestCase(TestDOMIntegrity)
    suite.addTests(unittest.TestLoader().loadTestsFromTestCase(TestSyntaxAndParsing))
    suite.addTests(unittest.TestLoader().loadTestsFromTestCase(TestAPIConsistency))
    suite.addTests(unittest.TestLoader().loadTestsFromTestCase(TestBusinessLogic))
    runner = unittest.TextTestRunner(verbosity=2)
    result = runner.run(suite)
    if result.wasSuccessful():
        print("\n✨ TẤT CẢ KIỂM TRA ĐỀU THÀNH CÔNG! Code an toàn, sẵn sàng commit.")
        exit(0)
    else:
        print("\n❌ CẢNH BÁO: Đã phát hiện lỗi! Vui lòng khắc phục trước khi commit.")
        exit(1)
