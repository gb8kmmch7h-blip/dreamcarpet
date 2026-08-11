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

    const cityRef = new URL(request.url).searchParams.get("cityRef")?.trim() ?? "";
    if (!cityRef) {
      return NextResponse.json({ warehouses: [] });
    }

    const response = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
      body: JSON.stringify({
        apiKey,
        modelName: "Address",
        calledMethod: "getWarehouses",
        methodProperties: {
          CityRef: cityRef,
          Limit: "500",
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

    const warehouses = (result.data ?? []).map((item: any) => ({
      ref: item.Ref,
      name: item.Description
    }));

    return NextResponse.json({ warehouses });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Не вдалося отримати список відділень" },
      { status: 500 }
    );
  }
}