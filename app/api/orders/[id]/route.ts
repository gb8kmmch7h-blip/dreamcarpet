import fs from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const ordersFile = path.join(
  process.cwd(),
  "database",
  "orders.json"
);

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
];

type Order = {
  id?: string;
  orderNumber?: number;
  accessToken?: string;
  status?: string;
  paidAmount?: number;
  amountDue?: number;
  total?: number;
  updatedAt?: string;
  statusUpdatedAt?: string;
  [key: string]: unknown;
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

async function saveOrders(orders: Order[]) {
  await fs.mkdir(path.dirname(ordersFile), {
    recursive: true,
  });

  await fs.writeFile(
    ordersFile,
    JSON.stringify(orders, null, 2),
    "utf8"
  );
}

function isSameOrder(order: Order, id: string) {
  return (
    String(order.id || "") === id ||
    String(order.accessToken || "") === id ||
    String(order.orderNumber || "") === id
  );
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

    const orders = await readOrders();
    const orderIndex = orders.findIndex((order) =>
      isSameOrder(order, id)
    );

    if (orderIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message: "Замовлення не знайдено",
        },
        { status: 404 }
      );
    }

    const currentOrder = orders[orderIndex];
    const total = Number(currentOrder.total || 0);

    const updatedOrder: Order = {
      ...currentOrder,
      status,
      updatedAt: new Date().toISOString(),
      statusUpdatedAt: new Date().toISOString(),
    };

    if (
      paidAmount !== undefined &&
      Number.isFinite(paidAmount) &&
      paidAmount >= 0
    ) {
      updatedOrder.paidAmount = paidAmount;
      updatedOrder.amountDue = Math.max(total - paidAmount, 0);
    }

    orders[orderIndex] = updatedOrder;

    await saveOrders(orders);

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Помилка оновлення замовлення:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Не вдалося оновити замовлення",
      },
      { status: 500 }
    );
  }
}