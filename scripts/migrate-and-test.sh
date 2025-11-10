#!/bin/bash

# v1.1数据库迁移一键执行脚本（带自动测试）
# 使用方法: bash scripts/migrate-and-test.sh

set -e  # 遇到错误立即退出

echo "=================================================="
echo "  🚀 v1.1 数据库迁移 + 自动测试"
echo "=================================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 步骤1: 确认备份
echo "⚠️  重要提醒: 请确认你已在Supabase控制台备份数据库！"
echo ""
echo "备份步骤:"
echo "  1. 访问 https://supabase.com/dashboard"
echo "  2. 选择项目 → Database → Backups"
echo "  3. 点击 Create Backup"
echo ""
read -p "已完成备份？(y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    echo "❌ 请先备份数据库，然后重新运行此脚本"
    exit 1
fi

echo ""
echo "=================================================="
echo "  步骤1/3: 执行数据库迁移"
echo "=================================================="
echo ""

# 执行迁移
npm run db:migrate

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ 迁移失败！请检查错误信息${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ 迁移执行完成${NC}"

# 等待2秒让数据库完成提交
echo ""
echo "⏳ 等待数据库提交..."
sleep 2

echo ""
echo "=================================================="
echo "  步骤2/3: 运行自动化测试"
echo "=================================================="
echo ""

# 运行测试
npm run db:test

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ 测试失败！建议回滚迁移${NC}"
    echo ""
    echo "回滚方法:"
    echo "  方法1: 在Supabase控制台恢复备份"
    echo "  方法2: 手动删除新表 (见下方SQL)"
    echo ""
    echo "DELETE SQL:"
    echo "  DROP TABLE IF EXISTS practice_records CASCADE;"
    echo "  DROP TABLE IF EXISTS course_words CASCADE;"
    echo "  DROP TABLE IF EXISTS user_courses CASCADE;"
    echo "  DROP TABLE IF EXISTS courses CASCADE;"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ 所有测试通过${NC}"

echo ""
echo "=================================================="
echo "  步骤3/3: 创建初始课程数据（可选）"
echo "=================================================="
echo ""
read -p "是否创建示例课程数据？(y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]
then
    echo ""
    echo "🌱 创建课程数据..."
    npm run seed:courses
    
    if [ $? -eq 0 ]; then
        echo ""
        echo -e "${GREEN}✅ 课程数据创建成功${NC}"
    else
        echo ""
        echo -e "${YELLOW}⚠️  课程数据创建失败，但不影响主功能${NC}"
    fi
else
    echo ""
    echo "⏭️  跳过课程数据创建"
fi

echo ""
echo "=================================================="
echo "  🎉 迁移完成！"
echo "=================================================="
echo ""
echo "✅ 数据库迁移成功"
echo "✅ 自动化测试通过"
echo "✅ v1.0数据完整无损"
echo ""
echo "下一步:"
echo "  1. 运行 'npm run db:studio' 查看数据库"
echo "  2. 运行 'npm run dev' 启动开发服务器"
echo "  3. 开始v1.1功能开发！"
echo ""


