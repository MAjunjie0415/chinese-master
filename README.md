# ChineseMaster - 外国人汉语学习工具

一个现代化的汉语学习平台，专注于商务汉语和HSK考试准备，提供课程化学习和多模态练习功能。

## 📚 项目简介

ChineseMaster 是一个专为外国人设计的汉语学习工具，结合了：
- **词库学习**：商务汉语和HSK分级词库（v1.0）
- **课程系统**：结构化课程学习，支持商务场景和HSK等级课程（v1.1）
- **多模态练习**：图片联想、声调训练等多种练习模式（v1.1）
- **智能复习**：基于遗忘曲线的复习系统（v1.0）

## ✨ 核心功能

### v1.0 基础功能
- ✅ 词库学习（商务汉语 / HSK 1-6级）
- ✅ 智能复习系统（基于遗忘曲线）
- ✅ 用户认证系统（注册/登录/个人中心）
- ✅ 学习进度跟踪
- ✅ 拼音发音功能

### v1.1 新增功能
- ✅ **课程系统**
  - 课程商城（探索所有课程）
  - 我的课程（学习进度管理）
  - 课程详情页（单词列表、进度显示）
  
- ✅ **多模态练习**
  - 🖼️ **Picture Match（图片联想）**：通过视觉学习单词
  - 🔊 **Tone Training（声调训练）**：掌握中文四声
  
- ✅ **练习结果页**
  - 实时计时器
  - 正确率统计
  - 个性化鼓励语
  - 学习建议

## 🛠️ 技术栈

- **前端框架**: Next.js 16 (App Router) + React 19
- **样式**: Tailwind CSS 4
- **数据库**: PostgreSQL (Supabase)
- **ORM**: Drizzle ORM
- **认证**: Supabase Auth
- **部署**: Vercel (推荐)
- **语言**: TypeScript

## 🚀 快速开始

### 前置要求

- Node.js 18+ 
- npm 或 yarn
- Supabase 账户（用于数据库和认证）

### 安装步骤

1. **克隆项目**
   ```bash
   git clone <repository-url>
   cd chinese-master
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境变量**
   
   创建 `.env.local` 文件：
   ```env
   # Supabase 配置
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # 数据库连接（使用 Session Pooler）
   DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres"
   ```

   **重要提示**：
   - 使用 **Session Pooler** 连接（推荐用于服务器端应用）
   - 端口使用 **5432**（Session Pooler的标准端口）
   - 确保密码是真实密码，不是占位符
   - 连接字符串使用标准英文引号 `"`，不要使用中文引号

4. **运行数据库迁移**
   ```bash
   npm run db:migrate
   ```

5. **初始化数据**
   ```bash
   # 初始化单词数据
   npm run seed
   
   # 初始化课程数据
   npm run seed:courses
   ```

6. **启动开发服务器**
   ```bash
   npm run dev
   ```

7. **访问应用**
   
   打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📁 项目结构

```
chinese-master/
├── app/                          # Next.js App Router 页面
│   ├── courses/                 # 课程相关页面
│   │   ├── page.tsx            # 课程列表页（探索/我的课程）
│   │   └── [slug]/             # 课程详情页
│   │       ├── page.tsx        # 课程详情
│   │       └── practice/       # 练习模式
│   │           ├── page.tsx    # 模式选择页
│   │           ├── picture-match/  # 图片联想练习
│   │           ├── tone-practice/  # 声调训练
│   │           └── result/     # 练习结果页
│   ├── api/                     # API 路由
│   │   ├── courses/            # 课程相关API
│   │   └── practice/           # 练习记录API
│   └── ...
├── components/                  # React 组件
│   ├── CourseCard.tsx          # 课程卡片
│   ├── PracticeTimer.tsx       # 练习计时器
│   ├── PracticeProgress.tsx    # 练习进度条
│   └── ...
├── db/                         # 数据库相关
│   ├── schema/                 # Drizzle Schema
│   │   ├── words.ts           # 单词表（v1.0）
│   │   ├── user_progress.ts   # 用户进度表（v1.0）
│   │   └── courses.ts         # 课程相关表（v1.1）
│   ├── migrations/            # 数据库迁移文件
│   ├── seed.ts                # 单词数据种子
│   └── seed-courses.ts        # 课程数据种子
├── lib/                        # 工具库
│   ├── drizzle.ts             # 数据库连接配置
│   ├── supabase.ts            # Supabase 客户端
│   └── pronunciation.ts       # 拼音发音功能
└── scripts/                    # 工具脚本
    ├── test-db-connection.ts  # 数据库连接测试
    └── ...
```

## 🗄️ 数据库结构

### v1.0 表
- `words`: 单词表（商务汉语/HSK词库）
- `user_progress`: 用户学习进度和复习计划

### v1.1 新增表
- `courses`: 课程主表
- `user_courses`: 用户-课程关联表（我的课程）
- `course_words`: 课程-单词关联表
- `practice_records`: 练习记录表

## 🔧 常用命令

```bash
# 开发
npm run dev              # 启动开发服务器

# 数据库
npm run db:generate      # 生成迁移文件
npm run db:migrate       # 执行数据库迁移
npm run db:studio        # 打开 Drizzle Studio
npm run db:test          # 测试数据库迁移

# 数据初始化
npm run seed             # 初始化单词数据
npm run seed:courses     # 初始化课程数据

# 构建
npm run build            # 构建生产版本
npm run start            # 启动生产服务器
```

## 🌐 数据库连接配置

### Supabase 连接设置

**推荐配置：Session Pooler**

1. 在 Supabase Dashboard → **Project Settings → Database**
2. 找到 **Connection string** 区域
3. 选择：
   - **Type**: URI
   - **Method**: **Session pooler**
4. 复制完整的 URI 连接字符串
5. 更新 `.env.local` 中的 `DATABASE_URL`

**连接字符串格式**：
```
postgresql://postgres.[project-ref]:[password]@[pooler-host]:5432/postgres
```

**重要提示**：
- ✅ 使用 **Session Pooler**（端口 5432）
- ✅ 确保密码是真实密码（不是占位符 `[YOUR-PASSWORD]`）
- ✅ 使用标准英文引号，不要使用中文引号
- ❌ 不要使用 Direct Connection（可能DNS解析失败）

### 故障排除

如果遇到连接问题，运行测试脚本：
```bash
npx tsx scripts/test-db-connection.ts
```

常见问题：
- **ECONNREFUSED**: 检查端口和连接字符串格式
- **密码认证失败**: 确认密码正确，不是占位符
- **Invalid URL**: 检查引号格式（使用英文引号）

## 📖 使用指南

### 课程学习流程

1. **浏览课程**
   - 访问 `/courses` 查看所有课程
   - 使用 "Explore" 标签浏览所有课程
   - 使用 "My Courses" 标签查看已添加的课程

2. **添加课程**
   - 点击课程卡片进入详情页
   - 点击 "Start Course →" 添加到我的课程

3. **开始练习**
   - 在课程详情页点击 "Begin Learning →"
   - 选择练习模式：
     - **Picture Match**: 适合初学者，通过图片学习
     - **Tone Training**: 掌握中文四声

4. **查看结果**
   - 完成练习后查看成绩统计
   - 查看个性化鼓励语和学习建议

### 练习模式说明

#### 🖼️ Picture Match（图片联想）
- **适合**: 零基础学习者
- **方式**: 显示中文汉字和拼音，选择正确的英文释义
- **特点**: 自动播放发音，即时反馈

#### 🔊 Tone Training（声调训练）
- **适合**: 所有级别的学习者
- **方式**: 听发音，选择正确的声调（1-4声）
- **特点**: 可视化声调曲线，重复播放功能

## 🧪 测试

### 数据库连接测试
```bash
npx tsx scripts/test-db-connection.ts
```

### 数据库迁移测试
```bash
npm run db:test
```

## 📝 开发指南

### 添加新课程

1. 在 Supabase Dashboard 的 Table Editor 中手动添加
2. 或使用 `db/seed-courses.ts` 脚本添加

### 添加新练习模式

1. 在 `app/courses/[slug]/practice/` 下创建新模式目录
2. 创建 `page.tsx`（服务端）和客户端组件
3. 在 `app/courses/[slug]/practice/page.tsx` 中添加模式选项
4. 更新 `practice_records` 表的 `mode` 字段枚举值

### 数据库迁移

```bash
# 1. 修改 schema 文件（db/schema/*.ts）
# 2. 生成迁移文件
npm run db:generate

# 3. 执行迁移
npm run db:migrate

# 4. 测试迁移
npm run db:test
```

## 🐛 故障排除

### 数据库连接问题

**问题**: `ECONNREFUSED` 或连接失败

**解决方案**:
1. 确认使用 Session Pooler（不是 Direct Connection）
2. 检查端口是否为 5432
3. 确认密码是真实密码（不是占位符）
4. 检查引号格式（使用英文引号 `"`）

### 查询失败

**问题**: `Failed query` 错误

**解决方案**:
1. 确认数据库表已创建（运行迁移）
2. 检查字段名是否匹配（snake_case vs camelCase）
3. 查看终端中的详细错误信息

### 页面404

**问题**: 课程详情页显示 404

**解决方案**:
1. 确认课程数据已初始化（运行 `npm run seed:courses`）
2. 检查 `slug` 是否正确匹配

## 📚 相关文档

- [数据库迁移指南](docs/v1.1-数据库迁移指南.md)
- [课程模块测试指南](docs/v1.1-课程模块测试指南.md)
- [迁移测试用例](docs/v1.1-迁移测试用例.md)

## 🚢 部署

### Vercel 部署

1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DATABASE_URL`
4. 部署

### 环境变量配置

确保生产环境中的 `DATABASE_URL` 使用 Session Pooler 连接字符串。

## 📄 许可证

[添加许可证信息]

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如有问题，请查看文档或提交 Issue。

---

**版本**: v1.1  
**最后更新**: 2025-11-01
