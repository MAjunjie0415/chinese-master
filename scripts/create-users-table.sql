-- 创建public.users表（用于存储邀请码相关数据）
-- 注意：auth.users是Supabase Auth系统表（只读），我们需要创建public.users来存储额外字段
-- public.users通过id字段关联到auth.users(id)

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  invite_quota integer DEFAULT 3 NOT NULL,
  invited_count integer DEFAULT 0 NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL,
  updated_at timestamp DEFAULT now() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_invite_quota ON public.users(invite_quota);
CREATE INDEX IF NOT EXISTS idx_users_invited_count ON public.users(invited_count);

-- 启用RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS策略：用户只能查看和更新自己的数据
CREATE POLICY "Users can view their own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

