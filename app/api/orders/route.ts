import { randomUUID } from "crypto";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

import { NextResponse } from "next/server";

export const runtime = "nodejs";

type OrderStatus =
  | "new"
  | "processing"
  | "completed"
  | "cancelled";

type OrderItem = {
  name: string;
  image?: string;
  color?: string;
  width?: number;
  length?: number;
  area?: number;
  quantity?: number;
  price?: number;
};

type OrderRequest = {
  customerName?: string;
  phone?: string;
  delivery?: string;
  city?: string;
  warehouse?: string;
  paymentMethod?: string;
  comment?: string;
  total?: number;
  area?: number;
  items?: OrderItem[];
};

type SavedOrder = {
  id: number;
  orderNumber: number;
  createdAt: string;
  status: OrderStatus;
  accessToken: string;

  customerName: string;
  phone: string;

  delivery: string;
  city: string;
  warehouse: string;

  paymentMethod: string;
  paidAmount: number;
  amountDue: number;

  comment: string;
  total: number;
  area: number;

  items: OrderItem[];
};

const START_ORDER_NUMBER = 4654;

function getDatabaseDirectory() {
  return path.join(process.cwd(), "database");
}

function getOrdersFilePath() {
  return path.join(
    getDatabaseDirectory(),
    "orders.json"
  );
}

function getCounterFilePath() {
  return path.join(
    getDatabaseDirectory(),
    "order-counter.json"
  );
}

async function ensureDatabaseDirectory() {
  await mkdir(getDatabaseDirectory(), {
    recursive: true,
  });
}

async function readOrders(): Promise<SavedOrder[]> {
  await ensureDatabaseDirectory();

  try {
    const fileContent = await readFile(
      getOrdersFilePath(),
      "utf-8"
    );

    const parsedData: unknown =
      JSON.parse(fileContent);

    if (!Array.isArray(parsedData)) {
      return [];
    }

    return parsedData as SavedOrder[];
  } catch {
    await writeFile(
      getOrdersFilePath(),
      JSON.stringify([], null, 2),
      "utf-8"
    );

    return [];
  }
}

async function writeOrders(orders: SavedOrder[]) {
  await ensureDatabaseDirectory();

  await writeFile(
    getOrdersFilePath(),
    JSON.stringify(orders, null, 2),
    "utf-8"
  );
}

async function saveOrder(order: SavedOrder) {
  const currentOrders = await readOrders();

  currentOrders.push(order);

  await writeOrders(currentOrders);
}

async function getNextOrderNumber() {
  await ensureDatabaseDirectory();

  const counterFile = getCounterFilePath();

  let currentNumber = START_ORDER_NUMBER - 1;

  try {
    const savedCounter = await readFile(
      counterFile,
      "utf-8"
    );

    const parsedCounter = JSON.parse(
      savedCounter
    ) as {
      lastOrderNumber?: number;
    };

    if (
      typeof parsedCounter.lastOrderNumber ===
        "number" &&
      Number.isFinite(parsedCounter.lastOrderNumber)
    ) {
      currentNumber =
        parsedCounter.lastOrderNumber;
    }
  } catch {
    // Файл створиться автоматично.
  }

  const nextNumber = currentNumber + 1;

  await writeFile(
    counterFile,
    JSON.stringify(
      {
        lastOrderNumber: nextNumber,
      },
      null,
      2
    ),
    "utf-8"
  );

  return nextNumber;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function getValidNumber(value: unknown) {
  return typeof value === "number" &&
    Number.isFinite(value)
    ? value
    : 0;
}

function normalizeItem(item: OrderItem): OrderItem {
  return {
    name: item.name?.trim() || "Товар",
    image: item.image || "",
    color: item.color || "Не вказано",
    width: getValidNumber(item.width),
    length: getValidNumber(item.length),
    area: getValidNumber(item.area),
    quantity:
      typeof item.quantity === "number" &&
      Number.isFinite(item.quantity) &&
      item.quantity > 0
        ? item.quantity
        : 1,
    price: getValidNumber(item.price),
  };
}

function createTelegramText(order: SavedOrder) {
  const itemsText = order.items
    .map((item, index) => {
      const quantity = item.quantity ?? 1;
      const itemTotal = (item.price ?? 0) * quantity;

      return [
        `<b>${index + 1}. ${escapeHtml(item.name)}</b>`,
        `🎨 Колір: ${escapeHtml(
          item.color || "Не вказано"
        )}`,
        `📏 Розмір: ${formatNumber(
          item.width ?? 0
        )} × ${formatNumber(item.length ?? 0)} м`,
        `📐 Площа: ${formatNumber(
          item.area ?? 0
        )} м²`,
        `🔢 Кількість: ${quantity}`,
        `💵 Сума: ${formatNumber(itemTotal)} грн`,
      ].join("\n");
    })
    .join("\n\n");

  const paymentBlock =
    order.paidAmount > 0
      ? [
          `❗ <b>Оплачено: ${formatNumber(
            order.paidAmount
          )} грн</b> ❗`,
          `Залишок: <b>${formatNumber(
            order.amountDue
          )} грн</b>`,
        ].join("\n")
      : [
          "Оплачено: <b>0 грн</b>",
          `До оплати: <b>${formatNumber(
            order.amountDue
          )} грн</b>`,
        ].join("\n");

  return `
<b>Нове замовлення #${order.orderNumber}</b>

📞 <b>${escapeHtml(order.phone)}</b>
👤 ${escapeHtml(order.customerName)}

🚚 ${escapeHtml(order.delivery)}
🏙 ${escapeHtml(order.city)}
📦 ${escapeHtml(order.warehouse)}

${itemsText}

<b>Разом: ${formatNumber(order.total)} грн</b>
Площа: <b>${formatNumber(order.area)} м²</b>

${paymentBlock}
💳 ${escapeHtml(order.paymentMethod)}

📝 ${escapeHtml(order.comment)}
`.trim();
}

async function sendTelegramMessage(order: SavedOrder) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    console.log(
      "Telegram не налаштований. Замовлення збережено тільки в orders.json."
    );

    return {
      sent: false,
      reason: "Telegram не налаштований",
    };
  }

  const text = createTelegramText(order);

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: chatId,
        text:
          text.length > 3900
            ? `${text.slice(0, 3900)}\n\n...`
            : text,
        parse_mode: "HTML",
      }),
    }
  );

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(
      data.description ||
        "Telegram не зміг прийняти замовлення"
    );
  }

  return {
    sent: true,
    reason: "",
  };
}

export async function GET() {
  try {
    const orders = await readOrders();

    const sortedOrders = [...orders].sort(
      (firstOrder, secondOrder) =>
        new Date(secondOrder.createdAt).getTime() -
        new Date(firstOrder.createdAt).getTime()
    );

    return NextResponse.json({
      success: true,
      orders: sortedOrders,
    });
  } catch (error) {
    console.error("Orders GET error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          "Не вдалося завантажити замовлення",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as OrderRequest;

    const customerName =
      body.customerName?.trim() || "";

    const phone = body.phone?.trim() || "";

    const delivery =
      body.delivery?.trim() || "Не вказано";

    const city = body.city?.trim() || "Не вказано";

    const warehouse =
      body.warehouse?.trim() || "Не вказано";

    const paymentMethod =
      body.paymentMethod?.trim() || "Не вказано";

    const comment =
      body.comment?.trim() || "Без коментаря";

    const total = getValidNumber(body.total);
    const area = getValidNumber(body.area);

    const items = Array.isArray(body.items)
      ? body.items.map(normalizeItem)
      : [];

    if (!customerName) {
      return NextResponse.json(
        {
          success: false,
          message: "Вкажіть ім’я покупця",
        },
        { status: 400 }
      );
    }

    if (!phone) {
      return NextResponse.json(
        {
          success: false,
          message: "Вкажіть номер телефону",
        },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "У замовленні немає товарів",
        },
        { status: 400 }
      );
    }

    if (total <= 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Неправильна загальна сума замовлення",
        },
        { status: 400 }
      );
    }

    const orderNumber = await getNextOrderNumber();
    const accessToken = randomUUID();

    const paidAmount =
      paymentMethod === "Повна оплата"
        ? total
        : paymentMethod === "Передоплата 200 грн"
          ? Math.min(200, total)
          : 0;

    const amountDue = Math.max(total - paidAmount, 0);

    const savedOrder: SavedOrder = {
      id: orderNumber,
      orderNumber,
      createdAt: new Date().toISOString(),
      status: "new",
      accessToken,

      customerName,
      phone,

      delivery,
      city,
      warehouse,

      paymentMethod,
      paidAmount,
      amountDue,

      comment,
      total,
      area,

      items,
    };

    /*
      Головне:
      спочатку зберігаємо замовлення.
      Telegram не має права ламати оформлення.
    */
    await saveOrder(savedOrder);

    let telegramSent = false;
    let telegramMessage = "";

    try {
      const telegramResult =
        await sendTelegramMessage(savedOrder);

      telegramSent = telegramResult.sent;
      telegramMessage = telegramResult.reason;
    } catch (telegramError) {
      console.error(
        "Telegram send error:",
        telegramError
      );

      telegramSent = false;
      telegramMessage =
        telegramError instanceof Error
          ? telegramError.message
          : "Telegram не спрацював";
    }

    return NextResponse.json({
      success: true,
      orderNumber,
      accessToken,
      telegramSent,
      message: telegramSent
        ? "Замовлення збережено і надіслано в Telegram"
        : telegramMessage
          ? `Замовлення збережено. ${telegramMessage}`
          : "Замовлення збережено",
    });
  } catch (error) {
    console.error("Order API error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Помилка під час обробки замовлення",
      },
      { status: 500 }
    );
  }
}