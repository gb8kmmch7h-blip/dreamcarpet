import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type NovaPoshtaCity = {
  Ref: string;
  Description: string;
  DescriptionRu?: string;
  AreaDescription?: string;
  SettlementTypeDescription?: string;
};

type NovaPoshtaResponse = {
  success: boolean;
  data?: NovaPoshtaCity[];
  errors?: string[];
  warnings?: string[];
};

export async function GET(request: NextRequest) {
  try {
    const apiKey = process.env.NOVA_POSHTA_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        {
          message:
            "Не знайдено NOVA_POSHTA_API_KEY у файлі .env.local",
        },
        { status: 500 }
      );
    }

    const query =
      request.nextUrl.searchParams.get("q")?.trim() ?? "";

    if (query.length < 2) {
      return NextResponse.json([]);
    }

    const response = await fetch(
      "https://api.novaposhta.ua/v2.0/json/",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          apiKey,
          modelName: "Address",
          calledMethod: "getCities",
          methodProperties: {
            FindByString: query,
            Page: "1",
            Limit: "20",
          },
        }),
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(
        `Нова пошта повернула помилку ${response.status}`
      );
    }

    const result =
      (await response.json()) as NovaPoshtaResponse;

    if (!result.success) {
      return NextResponse.json(
        {
          message:
            result.errors?.join(", ") ||
            "Не вдалося знайти міста",
        },
        { status: 502 }
      );
    }

    const cities = (result.data ?? []).map((city) => ({
      ref: city.Ref,
      name: city.Description,
      area: city.AreaDescription ?? "",
      type: city.SettlementTypeDescription ?? "",
    }));

    return NextResponse.json(cities);
  } catch (error) {
    console.error("Nova Poshta cities error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Помилка пошуку міст",
      },
      { status: 500 }
    );
  }
}