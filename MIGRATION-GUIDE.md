# 🚀 v1.1数据库迁移快速指南

## 📋 迁移前准备

### 1. 备份Supabase数据库（必须！）

```
1. 访问 https://supabase.com/dashboard
2. 选择你的项目
3. Database → Backups → Create Backup
4. 等待备份完成（1-2分钟）
```

### 2. 确认环境变量

检查`.env.local`包含：
```bash
DATABASE_URL=postgresql://postgres.[your-ref]:[password]@[region].pooler.supabase.com:6543/postgres
```

---

## ⚡ 快速执行（一键完成）

推荐使用一键脚本：

```bash
bash scripts/migrate-and-test.sh
```

这个脚本会自动：
- ✅ 执行数据库迁移
- ✅ 运行自动化测试（4大类14项测试）
- ✅ 验证v1.0数据完整性
- ✅ 可选创建示例课程数据

---

## 📝 手动执行（分步操作）

如果需要更多控制：

### 步骤1: 执行迁移

```bash
npm run db:migrate
```

**预期输出**：
```
✅ 数据库迁移成功！
新增表:
  - courses (课程主表)
  - user_courses (用户课程关联表)
  - course_words (课程单词关联表)
  - practice_records (练习记录表)
```

### 步骤2: 运行测试

```bash
npm run db:test
```

**测试内容**：
- ✅ 4张新表创建成功
- ✅ v1.0数据完整无损（words, user_progress）
- ✅ 外键约束生效
- ✅ 唯一约束生效
- ✅ 索引创建完成

**预期输出**：
```
🎉 所有测试通过！迁移成功！
✅ 通过: 14 项
❌ 失败: 0 项
```

### 步骤3: 创建示例课程（可选）

```bash
npm run seed:courses
```

这将创建：
- 3个商务汉语课程
- 6个HSK等级课程
- 共9个示例课程

---

## ✅ 验证迁移成功

### 方法1: 使用Drizzle Studio（可视化）

```bash
npm run db:studio
```

浏览器打开 `https://local.drizzle.studio`，检查：
- [ ] 看到4张新表
- [ ] words表数据完整
- [ ] user_progress表数据完整

### 方法2: Supabase控制台

访问Supabase Dashboard → Database → Tables，确认：
- [ ] courses (课程主表)
- [ ] user_courses (用户课程关联表)
- [ ] course_words (课程单词关联表)
- [ ] practice_records (练习记录表)

### 方法3: 测试v1.0功能

```bash
npm run dev
```

访问 `http://localhost:3000/wordbanks/business`，确认单词学习功能正常。

---

## ❌ 测试失败 - 回滚方案

如果`npm run db:test`失败：

### 方法1: 恢复Supabase备份（推荐）

```
Supabase Dashboard → Database → Backups → 选择备份 → Restore
```

### 方法2: 手动删除新表

在Supabase SQL编辑器执行：

```sql
DROP TABLE IF EXISTS practice_records CASCADE;
DROP TABLE IF EXISTS course_words CASCADE;
DROP TABLE IF EXISTS user_courses CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
```

验证回滚：
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('courses', 'user_courses', 'course_words', 'practice_records');
-- 应该返回0行
```

---

## 📊 新增表结构

```
courses (课程主表)
├── id (主键)
├── title (课程标题)
├── slug (URL标识符)
├── category (business/hsk1-6)
├── description (描述)
├── totalWords (单词数)
└── difficulty (难度)

user_courses (用户课程)
├── user_id → Supabase Auth
├── course_id → courses.id
├── progress (0-100)
└── isCompleted (布尔)

course_words (课程单词)
├── course_id → courses.id
├── word_id → words.id (v1.0)
└── order (排序)

practice_records (练习记录)
├── user_id → Supabase Auth
├── course_id → courses.id
├── mode (translate/dictation/listening/speaking)
├── correctCount (正确数)
├── totalCount (总题数)
└── accuracy (正确率)
```

---

## 🛠️ 可用命令

| 命令 | 说明 |
|------|------|
| `npm run db:generate` | 生成迁移SQL文件 |
| `npm run db:migrate` | 执行数据库迁移 |
| `npm run db:test` | 运行自动化测试 |
| `npm run seed:courses` | 创建示例课程数据 |
| `npm run db:studio` | 打开数据库可视化界面 |
| `bash scripts/migrate-and-test.sh` | 一键迁移+测试 |

---

## 📚 详细文档

- **完整迁移指南**: `docs/v1.1-数据库迁移指南.md`
- **测试用例详解**: `docs/v1.1-迁移测试用例.md`

---

## ✅ 迁移检查清单

在继续v1.1开发前，确认：

- [ ] Supabase数据库已备份
- [ ] `npm run db:migrate` 执行成功（无错误）
- [ ] `npm run db:test` 全部通过（14/14项）
- [ ] Supabase控制台看到4张新表
- [ ] v1.0功能正常（`/wordbanks/business`可访问）
- [ ] words表记录数不变
- [ ] user_progress表记录数不变

---

## 🎯 下一步

迁移成功后：

1. 启动开发服务器: `npm run dev`
2. 开始v1.1功能开发（课程商城UI）
3. 查看开发计划: 参考迭代手册第2天内容

---

## 🆘 常见问题

### Q: 报错 "DATABASE_URL not found"

**A**: 检查`.env.local`文件是否存在并包含正确的`DATABASE_URL`。

### Q: 报错 "relation already exists"

**A**: 表已存在，可能已执行过迁移。运行`npm run db:test`验证。

### Q: 测试失败但不知道原因？

**A**: 查看完整输出，或参考`docs/v1.1-迁移测试用例.md`的"测试失败处理"章节。

---

**准备好了吗？开始执行迁移吧！** 🚀

```bash
# 一键执行
bash scripts/migrate-and-test.sh

# 或分步执行
npm run db:migrate
npm run db:test
npm run seed:courses
```


