import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ordersFile = path.join(
  process.cwd(),
  "database",
  "orders.json"
);

type Order = {
  id?: string;
  orderNumber?: number;
  accessToken?: string;
  status?: string;
  customerName?: string;
  phone?: string;
  delivery?: string;
  city?: string;
  warehouse?: string;
  paymentMethod?: string;
  total?: number;
  paidAmount?: number;
  amountDue?: number;
  createdAt?: string;
  items?: {
    id?: number;
    name?: string;
    quantity?: number;
    price?: number;
    width?: number;
    length?: number;
    area?: number;
  }[];
};

async function readOrders(): Promise<Order[]> {
  try {
    const fileContent = await fs.readFile(ordersFile, "utf8");
    const orders = JSON.parse(fileContent);

    return Array.isArray(orders) ? orders : [];
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const tokens = Array.isArray(body.tokens)
      ? body.tokens
          .map((token: unknown) => String(token))
          .filter(Boolean)
      : [];

    if (tokens.length === 0) {
      return NextResponse.json({
        success: true,
        orders: [],
      });
    }

    const orders = await readOrders();

    const myOrders = orders
      .filter((order) => {
        if (!order.accessToken) {
          return false;
        }

        return tokens.includes(order.accessToken);
      })
      .sort((a, b) => {
        const first = new Date(a.createdAt || 0).getTime();
        const second = new Date(b.createdAt || 0).getTime();

        return second - first;
      });

    return NextResponse.json({
      success: true,
      orders: myOrders,
    });
  } catch (error) {
    console.error("Помилка отримання моїх замовлень:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Не вдалося отримати замовлення",
      },
      { status: 500 }
    );
  }
}