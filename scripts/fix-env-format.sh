#!/bin/bash

# 修复 .env.local 文件格式的脚本

cd /Users/mima0000/chinese-master

echo "🔧 修复 .env.local 文件格式..."
echo ""

# 备份原文件
cp .env.local .env.local.backup
echo "✅ 已创建备份: .env.local.backup"
echo ""

# 读取原始内容
ORIGINAL=$(grep "^DATABASE_URL" .env.local)

echo "当前格式问题："
echo "1. 密码仍为占位符格式 [majunjie1215]"
echo "2. 末尾使用中文引号"
echo ""
echo "⚠️  请手动修复 .env.local 文件："
echo ""
echo "找到这一行："
echo "$ORIGINAL"
echo ""
echo "修改为（替换 [majunjie1215] 为你的真实密码，去掉方括号）："
echo 'DATABASE_URL="postgresql://postgres.gfrtuxvcqajvtyfhpujv:你的真实密码@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"'
echo ""
echo "重要："
echo "- 密码不能包含方括号 []"
echo "- 末尾必须使用英文引号 \"（不是中文引号"）"
echo "- 如果密码包含特殊字符，确保进行了URL编码"

