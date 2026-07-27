import { NextRequest, NextResponse } from "next/server";

const COOKIE_NAME = "dreamcarpet_admin_session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const password = body.password;

    if (typeof password !== "string") {
      return NextResponse.json(
        {
          success: false,
          message: "Пароль не вказано",
        },
        {
          status: 400,
        }
      );
    }

    const adminPassword =
      process.env.ADMIN_PASSWORD;

    const sessionToken =
      process.env.ADMIN_SESSION_TOKEN;

    if (!adminPassword || !sessionToken) {
      return NextResponse.json(
        {
          success: false,
          message:
            "ADMIN_PASSWORD або ADMIN_SESSION_TOKEN не налаштовані",
        },
        {
          status: 500,
        }
      );
    }

    if (password !== adminPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Неправильний пароль",
        },
        {
          status: 401,
        }
      );
    }

    const response = NextResponse.json({
      success: true,
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: sessionToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 годин
    });

    return response;
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        success: false,
        message: "Помилка авторизації",
      },
      {
        status: 500,
      }
    );
  }
}