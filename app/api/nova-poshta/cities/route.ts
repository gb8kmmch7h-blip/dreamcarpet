import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const API_URL = "https://api.novaposhta.ua/v2.0/json/";

export async function GET(request: Request) {
  try {
    const apiKey = process.env.NOVA_POSHTA_API_KEY?.trim();
    if (!apiKey) {
      return NextResponse.json(
        { message: "NOVA_POSHTA_API_KEY не налаштований" },
        { status: 500 }
      );
    }

    const query = new URL(request.url).searchParams.get("q")?.trim() ?? "";
    if (query.length < 2) {
      return NextResponse.json({ cities: [] });
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        apiKey,
        modelName: "Address",
        calledMethod: "getCities",
        methodProperties: {
          FindByString: query,
          Limit: "20",
          Page: "1"
        }
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      return NextResponse.json(
        { message: result?.errors?.join(", ") || "Помилка API Нової пошти" },
        { status: 502 }
      );
    }

    const cities = (result.data ?? []).map((item: any) => ({
      ref: item.Ref,
      name: item.Description,
      area: item.AreaDescription ?? "",
      region: item.RegionsDescription ?? ""
    }));

    return NextResponse.json({ cities });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Не вдалося отримати список міст" },
      { status: 500 }
    );
  }
}