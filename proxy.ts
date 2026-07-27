import { NextRequest, NextResponse } from "next/server";

const ADMIN_COOKIE_NAME = "dreamcarpet_admin_session";

function isProtectedRequest(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Захищаємо всі сторінки адмінки,
  // крім сторінки входу.
  const isProtectedAdminPage =
    pathname.startsWith("/admin") &&
    pathname !== "/admin/login";

  // API зміни статусу замовлення.
  const isOrderStatusApi =
    pathname.startsWith("/api/orders/status");

  // GET /api/orders повертає всі замовлення,
  // тому його також захищаємо.
  // POST /api/orders залишаємо відкритим,
  // щоб покупці могли оформляти замовлення.
  const isOrdersListApi =
    pathname === "/api/orders" &&
    request.method === "GET";

  return (
    isProtectedAdminPage ||
    isOrderStatusApi ||
    isOrdersListApi
  );
}

export function proxy(request: NextRequest) {
  if (!isProtectedRequest(request)) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(
    ADMIN_COOKIE_NAME
  )?.value;

  const expectedSessionToken =
    process.env.ADMIN_SESSION_TOKEN;

  const isAuthenticated =
    Boolean(expectedSessionToken) &&
    sessionCookie === expectedSessionToken;

  if (isAuthenticated) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;

  // Для API повертаємо помилку 401,
  // а не сторінку входу.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      {
        success: false,
        message:
          "Потрібна авторизація адміністратора",
      },
      {
        status: 401,
      }
    );
  }

  const loginUrl = new URL(
    "/admin/login",
    request.url
  );

  loginUrl.searchParams.set(
    "next",
    pathname
  );

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/orders",
    "/api/orders/status/:path*",
    "/api/products/:path*",
  ],
};