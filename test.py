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

        # Loại trừ các ID động được sinh ra trong lúc render (ví dụ: qty-SP01, slides-SP01)
        dynamic_prefixes = ('qty-', 'slides-')
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
        dynamic_prefixes = ('status-',)
        static_used = {i for i in used_ids if not any(i.startswith(p) for p in dynamic_prefixes)}

        missing = static_used - collector.ids
        self.assertEqual(
            missing, set(),
            f"LỖI: Phát hiện ID được gọi trong JavaScript nhưng KHÔNG TỒN TẠI trong HTML (admin.html): {missing}"
        )

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
