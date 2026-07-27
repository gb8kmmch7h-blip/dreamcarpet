import {
  readFile,
  writeFile,
} from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

type OrderStatus =
  | "new"
  | "processing"
  | "manufacturing"
  | "preparing"
  | "shipped"
  | "completed"
  | "cancelled";

type SavedOrder = {
  id: number;
  orderNumber: number;
  status: OrderStatus;
  [key: string]: unknown;
};

type StatusRequest = {
  orderNumber?: number;
  status?: OrderStatus;
};

const allowedStatuses: OrderStatus[] = [
  "new",
  "processing",
  "manufacturing",
  "preparing",
  "shipped",
  "completed",
  "cancelled",
];

function getOrdersFilePath() {
  return path.join(
    process.cwd(),
    "database",
    "orders.json"
  );
}

async function readOrders(): Promise<SavedOrder[]> {
  const fileContent = await readFile(
    getOrdersFilePath(),
    "utf-8"
  );

  const parsedData: unknown =
    JSON.parse(fileContent);

  if (!Array.isArray(parsedData)) {
    throw new Error(
      "Файл orders.json має неправильний формат"
    );
  }

  return parsedData as SavedOrder[];
}

export async function PATCH(request: Request) {
  try {
    const body =
      (await request.json()) as StatusRequest;

    const orderNumber = body.orderNumber;
    const status = body.status;

    if (
      typeof orderNumber !== "number" ||
      !Number.isFinite(orderNumber)
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Не вказано номер замовлення",
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
          message:
            "Вказано неправильний статус",
        },
        {
          status: 400,
        }
      );
    }

    const orders = await readOrders();

    const orderIndex = orders.findIndex(
      (order) =>
        order.orderNumber === orderNumber
    );

    if (orderIndex === -1) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Замовлення не знайдено",
        },
        {
          status: 404,
        }
      );
    }

    orders[orderIndex] = {
      ...orders[orderIndex],
      status,
    };

    await writeFile(
      getOrdersFilePath(),
      JSON.stringify(orders, null, 2),
      "utf-8"
    );

    return NextResponse.json({
      success: true,
      message:
        "Статус замовлення змінено",
      order: orders[orderIndex],
    });
  } catch (error) {
    console.error(
      "Order status update error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Не вдалося змінити статус замовлення",
      },
      {
        status: 500,
      }
    );
  }
}