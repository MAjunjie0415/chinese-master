# ChineseMaster - 外国人汉语学习工具

一个现代化的汉语学习平台，专注于商务汉语和HSK考试准备，提供课程化学习和多模态练习功能。

## 📚 项目简介

ChineseMaster 是一个专为外国人设计的汉语学习工具，采用**课程化学习体系**，结合：
- **结构化课程**：商务场景课程和HSK等级课程
- **多模态练习**：图片联想、声调训练等多种练习模式
- **智能复习**：基于遗忘曲线的复习系统
- **完整学习闭环**：课程 → 练习 → 复习 → 进度跟踪
- **高性能体验**：流式渲染、即时反馈、优化导航

## ✨ 核心功能

### 课程系统
- ✅ **课程商城**：浏览所有可用课程（商务/HSK）
- ✅ **我的课程**：管理已添加的课程和学习进度
- ✅ **课程详情**：查看单词列表、课程描述、学习进度
- ✅ **智能推荐**：根据学习进度推荐相关课程

### 多模态练习
- 🖼️ **Picture Match（图片联想）**：通过视觉学习单词
  - 显示汉字和拼音，选择正确的英文释义
  - 自动播放发音，即时反馈
  - 适合零基础学习者

- 🔊 **Tone Training（声调训练）**：掌握中文四声
  - 听发音，选择正确的声调（1-4声）
  - 可视化声调曲线
  - 重复播放功能

### 智能复习系统
- ✅ **自动复习计划**：练习完成后自动创建复习记录
- ✅ **课程来源标识**：复习时显示单词来自哪个课程
- ✅ **遗忘曲线算法**：根据记忆状态智能安排复习时间
- ✅ **复习提醒**：首页显示待复习单词数量和预计时间
- ✅ **复习概览**：显示单词来源分布和鼓励语

### 学习仪表盘
- ✅ **统一数据展示**：单词学习、课程进度、练习统计
- ✅ **可视化进度**：课程进度条、学习成就
- ✅ **快速入口**：一键跳转到课程、复习等页面
- ✅ **成就系统**：学习里程碑和成就徽章

### 用户反馈与邀请
- 🌟 **许愿池（Wish Pool）**：提交新课程建议，帮助平台开发更多优质课程
- 🎁 **邀请码系统**：邀请好友注册，双方各获得3次复习额度
- 📱 **移动端优化**：完美适配手机和平板设备

### 用户体验优化
- ⚡ **高性能导航**：即时视觉反馈，流畅的页面切换
- 🎨 **流式渲染**：静态内容立即显示，数据异步加载
- 💫 **加载状态**：每个页面都有精美的骨架屏
- 🎯 **智能返回**：根据来源智能显示返回按钮
- 📱 **响应式设计**：完美适配桌面和移动设备

## 🛠️ 技术栈

### 前端
- **框架**: Next.js 16 (App Router) + React 19
- **样式**: Tailwind CSS 4
- **语言**: TypeScript
- **状态管理**: React Hooks + Server Components

### 后端 & 数据库
- **数据库**: PostgreSQL (Supabase)
- **ORM**: Drizzle ORM
- **认证**: Supabase Auth
- **API**: Next.js API Routes

### 性能优化
- **流式渲染**: React Suspense
- **代码分割**: 自动路由级代码分割
- **预加载**: Next.js Link prefetch
- **缓存策略**: 服务端组件缓存

### 部署
- **平台**: Vercel (推荐)
- **CI/CD**: GitHub Actions (可选)

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
│   ├── components/               # 页面级组件
│   │   └── ReviewCard.tsx      # 复习卡片（带 Suspense）
│   ├── courses/                 # 课程相关页面
│   │   ├── page.tsx            # 课程列表页（探索/我的课程）
│   │   ├── loading.tsx         # 课程页面加载骨架屏
│   │   ├── CoursesPageClient.tsx # 客户端组件
│   │   └── [slug]/             # 课程详情页
│   │       ├── page.tsx        # 课程详情（服务端）
│   │       ├── CourseDetailClient.tsx # 课程详情（客户端）
│   │       └── practice/       # 练习模式
│   │           ├── page.tsx    # 模式选择页
│   │           ├── picture-match/  # 图片联想练习
│   │           ├── tone-practice/  # 声调训练
│   │           └── result/     # 练习结果页
│   ├── review/                  # 复习页面
│   │   ├── page.tsx            # 复习页（服务端）
│   │   ├── ReviewComponent.tsx # 复习组件（客户端）
│   │   └── start/              # 复习开始页
│   │       ├── page.tsx        # 复习概览
│   │       └── loading.tsx     # 加载骨架屏
│   ├── profile/                 # 个人中心
│   │   ├── page.tsx            # 学习仪表盘
│   │   └── loading.tsx         # 加载骨架屏
│   ├── api/                     # API 路由
│   │   ├── courses/            # 课程相关API
│   │   │   └── enroll/         # 添加课程
│   │   ├── practice/           # 练习记录API
│   │   │   └── record/         # 保存练习记录
│   │   ├── progress/           # 学习进度API
│   │   └── achievements/      # 成就系统API
│   ├── loading.tsx             # 全局加载骨架屏
│   ├── layout.tsx              # 根布局
│   └── page.tsx                # 首页
├── components/                  # 共享 React 组件
│   ├── CourseCard.tsx          # 课程卡片
│   ├── Navbar.tsx             # 导航栏（优化版）
│   ├── PracticeTimer.tsx       # 练习计时器
│   ├── PracticeProgress.tsx    # 练习进度条
│   ├── ReviewStartCard.tsx     # 复习开始卡片
│   ├── ReviewProgressRing.tsx  # 复习进度环
│   ├── AchievementDisplay.tsx  # 成就展示
│   └── ...
├── db/                         # 数据库相关
│   ├── schema/                 # Drizzle Schema
│   │   ├── words.ts           # 单词表
│   │   ├── user_progress.ts   # 用户进度表
│   │   └── courses.ts         # 课程相关表
│   ├── migrations/            # 数据库迁移文件
│   ├── seed.ts                # 单词数据种子
│   └── seed-courses.ts        # 课程数据种子
├── lib/                        # 工具库
│   ├── drizzle.ts             # 数据库连接配置
│   ├── supabase.ts            # Supabase 客户端
│   ├── pronunciation.ts       # 拼音发音功能
│   ├── practice-utils.ts      # 练习工具函数（创建复习记录）
│   └── achievements.ts        # 成就系统
└── scripts/                    # 工具脚本
    ├── test-db-connection.ts  # 数据库连接测试
    ├── test-refactor.ts       # 重构后功能测试
    └── ...
```

## 🗄️ 数据库结构

### 核心表
- `words`: 单词表（商务汉语/HSK词库）
- `user_progress`: 用户学习进度和复习计划
- `courses`: 课程主表
- `user_courses`: 用户-课程关联表（我的课程）
- `course_words`: 课程-单词关联表
- `practice_records`: 练习记录表

### 数据关系
- `course_words` 关联 `courses` 和 `words`（定义课程包含的单词）
- `user_progress` 关联 `words`（记录用户对每个单词的学习进度）
- `user_courses` 关联 `courses`（记录用户的课程进度）
- `practice_records` 关联 `courses`（记录练习历史）

## ⚡ 性能优化

### 已实现的优化

1. **流式渲染 (Streaming SSR)**
   - 使用 React Suspense 分离静态内容和数据获取
   - 静态内容立即显示，数据异步加载
   - 首页复习卡片和复习计数使用 Suspense 包裹，不阻塞页面渲染
   - Review 页面使用 Suspense 包裹数据获取，立即显示骨架屏

2. **加载状态优化**
   - **所有页面**都有对应的 `loading.tsx` 文件：
     - 首页 (`app/loading.tsx`)
     - 课程列表 (`app/courses/loading.tsx`)
     - 课程详情 (`app/courses/[slug]/loading.tsx`)
     - 练习模式选择 (`app/courses/[slug]/practice/loading.tsx`)
     - 图片联想练习 (`app/courses/[slug]/practice/picture-match/loading.tsx`)
     - 声调训练 (`app/courses/[slug]/practice/tone-practice/loading.tsx`)
     - 练习结果 (`app/courses/[slug]/practice/result/loading.tsx`)
     - 个人中心 (`app/profile/loading.tsx`)
     - 复习开始页 (`app/review/start/loading.tsx`)
   - 精美的骨架屏提供即时视觉反馈
   - 用户点击导航后立即看到加载状态

3. **数据库查询优化**
   - **并行查询**：使用 `Promise.all` 同时执行多个独立查询
     - Profile 页面：7 个查询并行执行
     - Courses 页面：课程列表和用户进度并行查询
     - Course Detail 页面：课程信息、单词列表、用户进度并行查询
     - Practice 页面：用户注册检查和课程单词并行查询
     - Review Start 页面：复习数量、来源分布、掌握单词数并行查询
   - **数据库索引优化**：
     - 为 `course_words.word_id` 添加索引，优化 JOIN 查询性能
   - **智能查询**：先查询 count，有数据时再查询详情
   - **查询顺序优化**：优化 JOIN 顺序，充分利用索引

4. **导航优化**
   - Link 组件启用 `prefetch={true}` 预加载
   - 使用 `router.push` 提供即时反馈
   - 添加视觉反馈（蓝色下划线动画）
   - 点击导航后立即显示加载状态，减少感知等待时间

5. **代码分割**
   - Next.js 自动路由级代码分割
   - 组件按需加载，减少初始包大小
   - 数据获取组件独立拆分，实现更好的代码分割

### 性能指标

- **首次内容绘制 (FCP)**: < 1s
- **最大内容绘制 (LCP)**: < 2.5s
- **导航切换**: 即时反馈 + 流式加载（感知延迟 < 100ms）
- **数据库查询**: 优化后减少 50-70% 查询时间
- **页面加载**: 所有页面都有即时视觉反馈，数据异步加载

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

# 测试
npx tsx scripts/test-refactor.ts  # 运行重构后功能测试
npx tsx scripts/test-db-connection.ts  # 测试数据库连接
npm run test:review      # 测试复习系统

# 构建
npm run build            # 构建生产版本
npm run start            # 启动生产服务器
npm run lint             # 代码检查
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

### 完整学习流程

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

4. **完成练习**
   - 查看成绩统计和鼓励语
   - **自动创建复习计划**：练习的单词会自动加入复习计划
   - 点击 "Go to Review →" 开始复习

5. **复习单词**
   - 访问 `/review/start` 查看复习概览
   - 或从首页点击复习提醒卡片
   - 查看待复习单词（显示课程来源和预计时间）
   - 完成复习，更新学习进度

6. **查看进度**
   - 访问 `/profile` 查看学习仪表盘
   - 查看统计数据：总学习数、已掌握数、课程进度等
   - 查看成就和里程碑

### 练习模式说明

#### 🖼️ Picture Match（图片联想）
- **适合**: 零基础学习者
- **方式**: 显示中文汉字和拼音，选择正确的英文释义
- **特点**: 
  - 自动播放发音
  - 即时反馈（正确/错误）
  - 1.5秒后自动下一题

#### 🔊 Tone Training（声调训练）
- **适合**: 所有级别的学习者
- **方式**: 听发音，选择正确的声调（1-4声）
- **特点**: 
  - 可视化声调曲线
  - 重复播放功能
  - 2秒后自动下一题

## 🧪 测试

### 自动化测试

运行重构后功能测试：
```bash
npx tsx scripts/test-refactor.ts
```

测试内容：
- 数据库连接
- 表结构验证
- 查询逻辑验证
- 数据关联验证

### 数据库连接测试
```bash
npx tsx scripts/test-db-connection.ts
```

### 数据库迁移测试
```bash
npm run db:test
```

### 复习系统测试
```bash
npm run test:review
```

### 手动测试

详细测试用例请参考：
- [测试用例文档](docs/测试用例-重构验证.md)
- [测试报告](docs/测试报告-重构验证.md)
- [复习系统测试用例](docs/复习系统测试用例.md)

**快速测试（5分钟）**：
1. 登录 → 添加课程 → 开始练习 → 完成
2. 检查结果页是否显示"复习计划已创建"
3. 访问 `/review/start`，检查是否显示待复习单词和课程来源
4. 访问 `/profile`，检查统计数据
5. 测试导航栏切换，检查加载状态和响应速度

## 📝 开发指南

### 添加新课程

1. 在 Supabase Dashboard 的 Table Editor 中手动添加
2. 或使用 `db/seed-courses.ts` 脚本添加
3. 确保在 `course_words` 表中关联单词

### 添加新练习模式

1. 在 `app/courses/[slug]/practice/` 下创建新模式目录
2. 创建 `page.tsx`（服务端）和客户端组件
3. 在 `app/courses/[slug]/practice/page.tsx` 中添加模式选项
4. 在练习完成后调用 `createReviewRecords()` 创建复习记录
5. 更新 `practice_records` 表的 `mode` 字段枚举值

### 性能优化最佳实践

1. **使用 Suspense 分离数据获取**
   ```tsx
   <Suspense fallback={<Skeleton />}>
     <DataComponent />
   </Suspense>
   ```

2. **为每个路由添加 loading.tsx**
   - 提供即时视觉反馈
   - 使用骨架屏而不是空白页面

3. **优化数据库查询**
   - 先查询 count，再按需查询详情
   - 使用并行查询（Promise.all）
   - 避免不必要的 JOIN

4. **启用 prefetch**
   ```tsx
   <Link href="/path" prefetch={true}>
   ```

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

### 复习记录未创建

**问题**: 练习完成后，Review页面没有显示单词

**解决方案**:
1. 检查浏览器控制台是否有错误
2. 检查 `/api/progress` API是否正常
3. 确认练习模式中调用了 `createReviewRecords()`

### 性能问题

**问题**: 页面加载慢或导航切换卡顿

**解决方案**:
1. 确认已添加 `loading.tsx` 文件
2. 检查是否使用了 Suspense 包裹数据获取
3. 查看数据库查询是否优化
4. 检查网络请求是否过多

## 📚 相关文档

- [数据库迁移指南](docs/v1.1-数据库迁移指南.md)
- [课程模块测试指南](docs/v1.1-课程模块测试指南.md)
- [迁移测试用例](docs/v1.1-迁移测试用例.md)
- [测试用例-重构验证](docs/测试用例-重构验证.md)
- [测试报告-重构验证](docs/测试报告-重构验证.md)
- [复习系统逻辑说明](docs/复习系统逻辑说明.md)
- [复习系统测试用例](docs/复习系统测试用例.md)
- [性能优化报告](docs/性能优化报告.md)

## 🚢 部署

### Vercel 部署

1. 推送代码到 GitHub
2. 在 Vercel 中导入项目
3. 配置环境变量：
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `DATABASE_URL`（使用Session Pooler连接字符串）
4. 部署

### 环境变量配置

确保生产环境中的 `DATABASE_URL` 使用 Session Pooler 连接字符串。

### 部署前检查清单

- [ ] 运行 `npm run build` 确保构建成功
- [ ] 运行 `npx tsx scripts/test-refactor.ts` 确保测试通过
- [ ] 检查环境变量配置正确
- [ ] 确认数据库迁移已执行
- [ ] 确认课程数据已初始化
- [ ] 测试所有主要功能流程
- [ ] 检查性能指标（LCP, FCP等）

## 🎯 架构设计

### 学习闭环

```
选择课程 → 开始练习 → 完成练习 → 创建复习记录 → 
复习单词 → 更新进度 → 继续学习
```

### 数据流

1. **练习阶段**：
   - 用户完成练习 → 保存 `practice_records`
   - 为每个单词创建/更新 `user_progress`（复习记录）
   - 更新 `user_courses.progress`（课程进度）

2. **复习阶段**：
   - 查询 `user_progress` + `course_words` JOIN（只显示Courses单词）
   - 显示课程来源信息
   - 复习完成后更新 `next_review` 时间

3. **统计展示**：
   - Profile页面整合所有数据源
   - 实时显示学习进度和成就

### 性能架构

1. **流式渲染**：
   - 静态内容立即显示
   - 数据获取使用 Suspense 异步加载
   - 每个路由都有 loading.tsx

2. **查询优化**：
   - 先查询 count，再按需查询详情
   - 使用并行查询
   - 避免不必要的 JOIN

3. **导航优化**：
   - Link prefetch 预加载
   - 即时视觉反馈
   - 流畅的页面切换

## 🎨 UI/UX 特性

- **响应式设计**：完美适配桌面、平板和手机
- **暗色模式支持**：可根据系统设置自动切换（未来功能）
- **无障碍访问**：符合 WCAG 标准
- **国际化支持**：多语言界面（未来功能）
- **动画效果**：流畅的过渡和微交互
- **加载状态**：精美的骨架屏和加载动画

## 📄 许可证

[添加许可证信息]

## 👥 贡献

欢迎提交 Issue 和 Pull Request！

### 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📞 支持

如有问题，请查看文档或提交 Issue。

## 🔄 更新日志

### v1.3 (最新)
- 🌟 **许愿池功能（Wish Pool）**：
  - 用户可提交新课程建议
  - 支持多种类别（商务/旅游/考试/文化/其他）
  - 乐观更新：提交后立即显示成功反馈
  - 移动端完美适配
  - 数据保存在 `user_wishes` 表，可在Supabase Dashboard查看
- 🎁 **邀请码系统（Invite Code）**：
  - 一键生成邀请链接
  - 复制分享功能
  - 邀请成功双方各获得3次复习额度
  - 自动统计已邀请人数
  - 支持Google登录和邮箱登录
- 🔐 **登录系统优化**：
  - 恢复邮箱登录和注册功能
  - 保留Google登录选项
  - 邮箱重复检查（友好提示）
  - OAuth session持久化修复
  - Google登录后自动更新users表
- 🐛 **Bug修复**：
  - 修复数据库查询错误（Promise.allSettled处理）
  - 修复移动端响应式设计
  - 所有文本改为英文（符合产品定位）
  - 优化数据库连接池配置

### v1.2
- ⚡ **全面性能优化**：
  - 所有页面实现并行数据库查询（Promise.all）
  - 为所有路由添加 `loading.tsx` 骨架屏
  - Review 页面使用 Suspense 流式渲染
  - 数据库索引优化（`course_words.word_id`）
  - 查询性能提升 50-70%
- 🎨 **用户体验优化**：
  - 导航栏即时反馈（蓝色下划线动画）
  - 智能返回按钮（根据来源显示）
  - 修复登录状态下的 CTA 和 Footer 链接问题
  - 修复首页 "What Users Say" 模块头像加载问题（使用首字母缩写头像）
- 📱 **响应式优化**：改进移动端体验
- 🐛 **Bug修复**：
  - 修复 `reviewCount is not defined` 错误
  - 修复头像图片加载失败问题

### v1.1 (重构版)
- 🏗️ 架构重构：统一到Courses体系，移除Word Banks
- ✨ 新功能：课程系统、多模态练习、智能复习
- 📊 数据统计：学习仪表盘、成就系统

---

**版本**: v1.2  
**最后更新**: 2025-01-XX  
**架构**: Next.js 16 App Router + React 19 + Drizzle ORM
