import { updateSession } from "@/libs/supabase/middleware";

export async function middleware(request) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // 限制 middleware 只跑在需要鉴权/刷新 session 的路径上，避免爬虫访问营销页时也触发一次 Supabase auth 请求。
    "/dashboard/:path*",
    "/api/auth/callback",
    "/api/credits/:path*",
    "/api/validate/:path*",
    "/api/stripe/:path*",
  ],
};
