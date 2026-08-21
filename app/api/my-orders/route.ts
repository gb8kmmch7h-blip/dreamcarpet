import { NextResponse } from "next/server";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";

export const runtime = "nodejs";

type OrderItem = {
  id?: number;
  name?: string;
  quantity?: number;
  price?: number;
  width?: number;
  length?: number;
  area?: number;
  color?: string;
  image?: string;
};

type DbOrder = {
  id: number;
  order_number: number;
  access_token: string;
  status: string;
  customer_name: string;
  phone: string;
  delivery: string | null;
  city: string | null;
  warehouse: string | null;
  payment_method: string | null;
  total: number | string | null;
  paid_amount: number | string | null;
  amount_due: number | string | null;
  created_at: string | null;
  items: unknown;
};

function mapOrder(order: DbOrder) {
  return {
    id: String(order.id),
    orderNumber: Number(order.order_number),
    accessToken: order.access_token,
    status: order.status,
    customerName: order.customer_name,
    phone: order.phone,
    delivery: order.delivery ?? "",
    city: order.city ?? "",
    warehouse: order.warehouse ?? "",
    paymentMethod: order.payment_method ?? "",
    total: Number(order.total ?? 0),
    paidAmount: Number(order.paid_amount ?? 0),
    amountDue: Number(order.amount_due ?? 0),
    createdAt: order.created_at ?? "",
    items: Array.isArray(order.items)
      ? (order.items as OrderItem[])
      : [],
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const tokens = Array.isArray(body.tokens)
      ? body.tokens
          .map((token: unknown) => String(token).trim())
          .filter(Boolean)
      : [];

    if (tokens.length === 0) {
      return NextResponse.json({
        success: true,
        orders: [],
      });
    }

    const uniqueTokens = [...new Set(tokens)].slice(0, 50);

    const { data, error } = await supabaseAdmin
      .from("orders")
      .select(
        `
        id,
        order_number,
        access_token,
        status,
        customer_name,
        phone,
        delivery,
        city,
        warehouse,
        payment_method,
        total,
        paid_amount,
        amount_due,
        created_at,
        items
        `
      )
      .in("access_token", uniqueTokens)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      console.error(
        "Supabase my-orders error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message: "Не вдалося отримати замовлення",
        },
        { status: 500 }
      );
    }

    const orders = (data ?? []).map((order) =>
      mapOrder(order as DbOrder)
    );

    return NextResponse.json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error(
      "Помилка отримання моїх замовлень:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Не вдалося отримати замовлення",
      },
      { status: 500 }
    );
  }
}