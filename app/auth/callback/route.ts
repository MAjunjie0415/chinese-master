import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const inviteCode = requestUrl.searchParams.get('invite_code');
  const redirectTo = requestUrl.searchParams.get('redirect') || '/courses';

  // 创建响应对象（用于设置cookie）
  let response = NextResponse.redirect(new URL(redirectTo, requestUrl.origin));

  if (code) {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: any) {
            try {
              cookieStore.set({ name, value, ...options });
              // 同时设置到response中
              response.cookies.set({ name, value, ...options });
            } catch (error) {
              // 在服务端组件中调用时可能会失败，这是正常的
            }
          },
          remove(name: string, options: any) {
            try {
              cookieStore.set({ name, value: '', ...options });
              response.cookies.set({ name, value: '', ...options });
            } catch (error) {
              // 在服务端组件中调用时可能会失败，这是正常的
            }
          },
        },
      }
    );

    // 交换code获取session（这会自动设置cookie）
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !session) {
      // 登录失败，重定向到登录页
      const loginUrl = new URL('/login', requestUrl.origin);
      if (inviteCode) {
        loginUrl.searchParams.set('invite_code', inviteCode);
      }
      return NextResponse.redirect(loginUrl);
    }

    // 确保Google登录后也更新users表（即使没有invite_code）
    try {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('id', session.user.id)
        .single();

      // 如果users表中没有记录，创建一条
      if (!userData) {
        await supabase
          .from('users')
          .insert({
            id: session.user.id,
            email: session.user.email, // ✅ 加入必填的 email 字段
            invite_quota: 3,
            invited_count: 0,
          });
      }
    } catch (error) {
      console.error('更新users表失败:', error);
      // 继续登录流程，不阻塞
    }

    // 如果有invite_code，处理邀请码逻辑
    if (inviteCode && session.user) {
      try {
        // 查找邀请码
        const { data: codeData, error: codeError } = await supabase
          .from('invite_codes')
          .select('*')
          .eq('code', inviteCode)
          .eq('is_used', false)
          .single();

        if (!codeError && codeData) {
          // 更新邀请码状态
          await supabase
            .from('invite_codes')
            .update({
              is_used: true,
              used_by: session.user.id,
              used_at: new Date().toISOString(),
            })
            .eq('id', codeData.id);

          // 更新邀请人的额度
          const inviterId = codeData.generated_by;
          if (inviterId) {
            const { data: inviterData } = await supabase
              .from('users')
              .select('invite_quota, invited_count')
              .eq('id', inviterId)
              .single();

            if (inviterData) {
              await supabase
                .from('users')
                .update({
                  invite_quota: (inviterData.invite_quota || 0) + 3,
                  invited_count: (inviterData.invited_count || 0) + 1,
                })
                .eq('id', inviterId);
            }
          }

          // 更新新用户的额度
          const { data: userData } = await supabase
            .from('users')
            .select('invite_quota')
            .eq('id', session.user.id)
            .single();

          if (userData) {
            await supabase
              .from('users')
              .update({
                invite_quota: (userData.invite_quota || 0) + 3,
              })
              .eq('id', session.user.id);
          } else {
            // 创建用户记录
            await supabase
              .from('users')
              .insert({
                id: session.user.id,
                email: session.user.email, // ✅ 加入必填的 email 字段
                invite_quota: 3,
                invited_count: 0,
              });
          }
        }
      } catch (error) {
        console.error('处理邀请码失败:', error);
        // 即使处理失败，也继续登录流程
      }
    }

    // 使用包含cookie的response重定向
    response = NextResponse.redirect(new URL(redirectTo, requestUrl.origin));
  }

  // 重定向到目标页面（包含session cookie）
  return response;
}

