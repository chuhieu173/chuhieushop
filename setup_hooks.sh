#!/bin/bash
# Kích hoạt tính năng tự động chạy test trước khi commit
git config core.hooksPath .githooks
echo "✅ Đã kích hoạt Git Pre-commit Hook thành công!"
echo "Từ bây giờ, mỗi khi bạn commit (qua Terminal, VS Code hay SourceTree), hệ thống sẽ tự động chạy test.py để chặn đứng mọi bug trước khi được lưu."
