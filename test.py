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


class TestBusinessLogic(unittest.TestCase):
    """Kiểm tra các thuật toán và logic cốt lõi"""

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
