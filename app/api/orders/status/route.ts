import { NextResponse } from "next/server";

import { supabaseAdmin } from "../../../../lib/supabaseAdmin";

export const runtime = "nodejs";

type OrderStatus =
  | "new"
  | "pending"
  | "processing"
  | "confirmed"
  | "production"
  | "ready"
  | "shipped"
  | "completed"
  | "canceled"
  | "returned";

type StatusRequest = {
  orderNumber?: number;
  status?: OrderStatus;
};

const allowedStatuses: OrderStatus[] = [
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

export async function PATCH(request: Request) {
  try {
    const body = (await request.json()) as StatusRequest;

    const orderNumber = body.orderNumber;
    const status = body.status;

    if (
      typeof orderNumber !== "number" ||
      !Number.isFinite(orderNumber)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Не вказано номер замовлення",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !status ||
      !allowedStatuses.includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Вказано неправильний статус",
        },
        {
          status: 400,
        }
      );
    }

    const now = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({
        status,
        updated_at: now,
        status_updated_at: now,
      })
      .eq("order_number", orderNumber)
      .select("*")
      .maybeSingle();

    if (error) {
      console.error(
        "Supabase order status update error:",
        error
      );

      return NextResponse.json(
        {
          success: false,
          message: "Не вдалося змінити статус замовлення",
        },
        {
          status: 500,
        }
      );
    }

    if (!data) {
      return NextResponse.json(
        {
          success: false,
          message: "Замовлення не знайдено",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Статус замовлення змінено",
      order: {
        ...data,
        orderNumber: Number(data.order_number),
        accessToken: data.access_token,
        customerName: data.customer_name,
        paymentMethod: data.payment_method,
        paidAmount: Number(data.paid_amount ?? 0),
        amountDue: Number(data.amount_due ?? 0),
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        statusUpdatedAt: data.status_updated_at,
      },
    });
  } catch (error) {
    console.error(
      "Order status update error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Не вдалося змінити статус замовлення",
      },
      {
        status: 500,
      }
    );
  }
}