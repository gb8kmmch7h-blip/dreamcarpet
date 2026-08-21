import { NextResponse } from "next/server";

import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export const runtime = "nodejs";

const allowedStatuses = [
  "new",
  "pending",
  "processing",
  "confirmed",
  "production",
  "ready",
  "shipped",
  "completed",
  "canceled",
  "returned",
];

type DbOrder = {
  id: number;
  order_number: number;
  access_token: string;
  status: string;
  paid_amount: number | string | null;
  amount_due: number | string | null;
  total: number | string | null;
  updated_at: string | null;
  status_updated_at: string | null;
  [key: string]: unknown;
};

function toClientOrder(order: DbOrder) {
  return {
    ...order,
    orderNumber: Number(order.order_number),
    accessToken: order.access_token,
    paidAmount: Number(order.paid_amount ?? 0),
    amountDue: Number(order.amount_due ?? 0),
    total: Number(order.total ?? 0),
    updatedAt: order.updated_at,
    statusUpdatedAt: order.status_updated_at,
  };
}

async function findOrder(id: string): Promise<DbOrder | null> {
  const numericId = Number(id);

  if (Number.isInteger(numericId) && numericId > 0) {
    const byId = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", numericId)
      .maybeSingle();

    if (byId.error) {
      console.error("Supabase find order by id error:", byId.error);
      throw new Error("Не вдалося знайти замовлення");
    }

    if (byId.data) {
      return byId.data as DbOrder;
    }

    const byOrderNumber = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("order_number", numericId)
      .maybeSingle();

    if (byOrderNumber.error) {
      console.error(
        "Supabase find order by order number error:",
        byOrderNumber.error
      );
      throw new Error("Не вдалося знайти замовлення");
    }

    if (byOrderNumber.data) {
      return byOrderNumber.data as DbOrder;
    }
  }

  const byToken = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("access_token", id)
    .maybeSingle();

  if (byToken.error) {
    console.error("Supabase find order by token error:", byToken.error);
    throw new Error("Не вдалося знайти замовлення");
  }

  return byToken.data ? (byToken.data as DbOrder) : null;
}

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{
      id: string;
    }>;
  }
) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const status = String(body.status || "");
    const paidAmount =
      body.paidAmount === undefined
        ? undefined
        : Number(body.paidAmount);

    if (!id) {
      return NextResponse.json(
        {
          success: false,
          message: "ID замовлення не передано",
        },
        { status: 400 }
      );
    }

    if (!allowedStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          message: "Невірний статус замовлення",
        },
        { status: 400 }
      );
    }

    const currentOrder = await findOrder(id);

    if (!currentOrder) {
      return NextResponse.json(
        {
          success: false,
          message: "Замовлення не знайдено",
        },
        { status: 404 }
      );
    }

    const total = Number(currentOrder.total ?? 0);
    const now = new Date().toISOString();

    const updateData: Record<string, unknown> = {
      status,
      updated_at: now,
      status_updated_at: now,
    };

    if (
      paidAmount !== undefined &&
      Number.isFinite(paidAmount) &&
      paidAmount >= 0
    ) {
      updateData.paid_amount = paidAmount;
      updateData.amount_due = Math.max(total - paidAmount, 0);
    }

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update(updateData)
      .eq("id", currentOrder.id)
      .select("*")
      .single();

    if (error) {
      console.error("Supabase update order error:", error);

      return NextResponse.json(
        {
          success: false,
          message: "Не вдалося оновити замовлення",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      order: toClientOrder(data as DbOrder),
    });
  } catch (error) {
    console.error("Помилка оновлення замовлення:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Не вдалося оновити замовлення",
      },
      { status: 500 }
    );
  }
}