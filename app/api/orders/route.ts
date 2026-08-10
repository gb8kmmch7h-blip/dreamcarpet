import {
  mkdir,
  readFile,
  writeFile,
} from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import sharp from "sharp";

export const runtime = "nodejs";

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
  status: string;
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

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function getDatabaseDirectory() {
  return path.join(process.cwd(), "database");
}

function getOrdersFilePath() {
  return path.join(getDatabaseDirectory(), "orders.json");
}

function getCounterFilePath() {
  return path.join(getDatabaseDirectory(), "order-counter.json");
}

async function ensureDatabaseDirectory() {
  await mkdir(getDatabaseDirectory(), { recursive: true });
}

async function readOrders(): Promise<SavedOrder[]> {
  await ensureDatabaseDirectory();

  try {
    const content = await readFile(getOrdersFilePath(), "utf-8");
    const parsed: unknown = JSON.parse(content);
    return Array.isArray(parsed) ? (parsed as SavedOrder[]) : [];
  } catch {
    await writeFile(
      getOrdersFilePath(),
      JSON.stringify([], null, 2),
      "utf-8"
    );
    return [];
  }
}

async function saveOrder(order: SavedOrder) {
  const orders = await readOrders();
  orders.push(order);

  await writeFile(
    getOrdersFilePath(),
    JSON.stringify(orders, null, 2),
    "utf-8"
  );
}

async function getNextOrderNumber() {
  await ensureDatabaseDirectory();

  const counterFile = getCounterFilePath();
  let currentNumber = START_ORDER_NUMBER - 1;

  try {
    const content = await readFile(counterFile, "utf-8");
    const parsed = JSON.parse(content) as {
      lastOrderNumber?: number;
    };

    if (
      typeof parsed.lastOrderNumber === "number" &&
      Number.isFinite(parsed.lastOrderNumber)
    ) {
      currentNumber = parsed.lastOrderNumber;
    }
  } catch {
    // створиться автоматично
  }

  const nextNumber = currentNumber + 1;

  await writeFile(
    counterFile,
    JSON.stringify({ lastOrderNumber: nextNumber }, null, 2),
    "utf-8"
  );

  return nextNumber;
}

async function getLocalProductPhoto(imagePath?: string) {
  if (!imagePath) {
    return null;
  }

  const publicDirectory = path.resolve(process.cwd(), "public");

  const relativeImagePath = imagePath
    .replace(/^\/+/, "")
    .replaceAll("\\", "/");

  const absoluteImagePath = path.resolve(
    publicDirectory,
    relativeImagePath
  );

  if (
    absoluteImagePath !== publicDirectory &&
    !absoluteImagePath.startsWith(
      `${publicDirectory}${path.sep}`
    )
  ) {
    return null;
  }

  try {
    const imageBuffer = await readFile(absoluteImagePath);

    return {
      imageBuffer,
      absoluteImagePath,
    };
  } catch (error) {
    console.error(
      `Не вдалося прочитати фото ${imagePath}:`,
      error
    );
    return null;
  }
}

async function addPhotoNumberToImage(
  imageBuffer: Buffer,
  photoNumber: number
) {
  const rotated = await sharp(imageBuffer)
    .rotate()
    .jpeg({ quality: 92 })
    .toBuffer({ resolveWithObject: true });

  const width = rotated.info.width || 1200;
  const height = rotated.info.height || 1200;

  const circleSize = Math.max(
    150,
    Math.min(
      280,
      Math.round(Math.min(width, height) * 0.24)
    )
  );

  const center = circleSize / 2;
  const labelSize = Math.round(circleSize * 0.15);
  const numberSize = Math.round(circleSize * 0.42);

  const svg = Buffer.from(`
    <svg
      width="${circleSize}"
      height="${circleSize}"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <filter id="shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow
            dx="0"
            dy="7"
            stdDeviation="8"
            flood-color="#000000"
            flood-opacity="0.55"
          />
        </filter>
      </defs>

      <circle
        cx="${center}"
        cy="${center}"
        r="${center - 10}"
        fill="rgba(0,0,0,0.72)"
        stroke="rgba(255,255,255,0.92)"
        stroke-width="7"
        filter="url(#shadow)"
      />

      <text
        x="${center}"
        y="${Math.round(circleSize * 0.38)}"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="${labelSize}"
        font-weight="700"
        letter-spacing="3"
        fill="white"
      >ФОТО</text>

      <text
        x="${center}"
        y="${Math.round(circleSize * 0.76)}"
        text-anchor="middle"
        font-family="Arial, sans-serif"
        font-size="${numberSize}"
        font-weight="800"
        fill="white"
      >${photoNumber}</text>
    </svg>
  `);

  return sharp(rotated.data)
    .composite([
      {
        input: svg,
        gravity: "center",
      },
    ])
    .jpeg({ quality: 92 })
    .toBuffer();
}

/*
  GET /api/orders
*/
export async function GET() {
  try {
    const orders = await readOrders();

    const sortedOrders = [...orders].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
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
        message: "Не вдалося завантажити замовлення",
      },
      { status: 500 }
    );
  }
}

/*
  POST /api/orders
*/
export async function POST(request: Request) {
  try {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (!botToken || !chatId) {
      return NextResponse.json(
        {
          message:
            "Не знайдено TELEGRAM_BOT_TOKEN або TELEGRAM_CHAT_ID у .env.local",
        },
        { status: 500 }
      );
    }

    const body = (await request.json()) as OrderRequest;

    const customerName =
      body.customerName?.trim() || "Не вказано";

    const phone =
      body.phone?.trim() || "Не вказано";

    const delivery =
      body.delivery?.trim() || "Не вказано";

    const city =
      body.city?.trim() || "Не вказано";

    const warehouse =
      body.warehouse?.trim() || "Не вказано";

    const paymentMethod =
      body.paymentMethod?.trim() || "Не вказано";

    const comment =
      body.comment?.trim() || "Без коментаря";

    const total =
      typeof body.total === "number" &&
      Number.isFinite(body.total)
        ? body.total
        : 0;

    const area =
      typeof body.area === "number" &&
      Number.isFinite(body.area)
        ? body.area
        : 0;

    const items = Array.isArray(body.items)
      ? body.items
      : [];

    if (items.length === 0) {
      return NextResponse.json(
        { message: "У замовленні немає товарів" },
        { status: 400 }
      );
    }

    const orderNumber = await getNextOrderNumber();
    const accessToken = randomUUID();

    // Поки онлайн-оплата тестова — не вважаємо її оплаченою.
    const paidAmount =
      paymentMethod === "Передоплата 200 грн"
        ? Math.min(200, total)
        : 0;

    const amountDue = Math.max(total - paidAmount, 0);

    /*
      Готуємо унікальні фото.
      На кожне фото наносимо ФОТО 1, ФОТО 2...
    */
    const photoNumberByKey = new Map<string, number>();

    const numberedPhotos: Array<{
      photoNumber: number;
      itemIndex: number;
      item: OrderItem;
      imageBuffer: Buffer;
    }> = [];

    for (let index = 0; index < items.length; index += 1) {
      const item = items[index];

      const key =
        item.image?.trim() ||
        item.name.trim().toLowerCase();

      if (photoNumberByKey.has(key)) {
        continue;
      }

      const localPhoto =
        await getLocalProductPhoto(item.image);

      if (!localPhoto) {
        continue;
      }

      const photoNumber = numberedPhotos.length + 1;

      photoNumberByKey.set(key, photoNumber);

      const labeledImageBuffer =
        await addPhotoNumberToImage(
          localPhoto.imageBuffer,
          photoNumber
        );

      numberedPhotos.push({
        photoNumber,
        itemIndex: index,
        item,
        imageBuffer: labeledImageBuffer,
      });
    }

    /*
      Текст одного замовлення.
      Кожен товар посилається на ФОТО N.
    */
    const itemsText = items
      .map((item, index) => {
        const quantity = item.quantity ?? 1;
        const itemTotal =
          (item.price ?? 0) * quantity;

        const key =
          item.image?.trim() ||
          item.name.trim().toLowerCase();

        const photoNumber =
          photoNumberByKey.get(key);

        return [
          `<b>${index + 1}. ${escapeHtml(item.name)}</b>`,
          photoNumber
            ? `🖼 Фото ${photoNumber}`
            : "🖼 Фото не знайдено",
          `🎨 Колір: ${escapeHtml(
            item.color || "Не вказано"
          )}`,
          `📏 Розмір: ${formatNumber(
            item.width ?? 0
          )} × ${formatNumber(
            item.length ?? 0
          )} м`,
          `📐 Площа: ${formatNumber(
            item.area ?? 0
          )} м²`,
          `🔢 Кількість: ${quantity}`,
          `💵 Сума: ${formatNumber(itemTotal)} грн`,
        ].join("\n");
      })
      .join("\n\n");

    const paymentBlock =
      paidAmount > 0
        ? [
            `✅ Оплачено: <b>${formatNumber(
              paidAmount
            )} грн</b>`,
            `💰 Залишок: <b>${formatNumber(
              amountDue
            )} грн</b>`,
          ].join("\n")
        : [
            "💵 Оплачено: <b>0 грн</b>",
            `💰 До оплати: <b>${formatNumber(
              amountDue
            )} грн</b>`,
          ].join("\n");

    const orderText = `
<b>#${orderNumber}</b>

📞 <b>${escapeHtml(phone)}</b>
🚚 ${escapeHtml(delivery)}
🏙 ${escapeHtml(city)}
📦 ${escapeHtml(warehouse)}
👤 ${escapeHtml(customerName)}

${itemsText}

✅ <b>Загальна кількість товарів:</b> ${items.reduce(
      (sum, item) => sum + (item.quantity ?? 1),
      0
    )}
📈 <b>Загальна площа:</b> ${formatNumber(area)} м²
💰 <b>Загальна сума:</b> ${formatNumber(total)} грн

${paymentBlock}
💳 <b>Спосіб оплати:</b> ${escapeHtml(paymentMethod)}
🚚 <b>Спосіб доставки:</b> ${escapeHtml(delivery)}
💬 <b>Коментар:</b> ${escapeHtml(comment)}
`.trim();

    if (numberedPhotos.length === 0) {
      return NextResponse.json(
        {
          message:
            "Не вдалося знайти фотографії товарів для Telegram",
        },
        { status: 500 }
      );
    }

    /*
      Telegram media group = один альбом.
      Максимум 10 фото в одному альбомі.
      Для магазину цього більш ніж достатньо у типовому замовленні.
    */
    const firstTenPhotos = numberedPhotos.slice(0, 10);

    const formData = new FormData();
    formData.append("chat_id", chatId);

    const media = firstTenPhotos.map(
      (photo, index) => {
        const attachmentName = `photo_${index + 1}`;

        formData.append(
          attachmentName,
         new Blob([new Uint8Array(photo.imageBuffer)], {
  type: "image/jpeg",
}),
          `photo-${photo.photoNumber}.jpg`
        );

        return index === 0
          ? {
              type: "photo",
              media: `attach://${attachmentName}`,
              caption: orderText,
              parse_mode: "HTML",
            }
          : {
              type: "photo",
              media: `attach://${attachmentName}`,
            };
      }
    );

    formData.append(
      "media",
      JSON.stringify(media)
    );

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMediaGroup`,
      {
        method: "POST",
        body: formData,
      }
    );

    const telegramData =
      await telegramResponse.json();

    if (
      !telegramResponse.ok ||
      !telegramData.ok
    ) {
      console.error(
        "Telegram album error:",
        telegramData
      );

      return NextResponse.json(
        {
          message:
            telegramData.description ||
            "Telegram не зміг надіслати альбом",
        },
        { status: 502 }
      );
    }

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

    await saveOrder(savedOrder);

    return NextResponse.json({
      success: true,
      orderNumber,
      accessToken,
      message:
        "Замовлення і фото надіслано одним Telegram-альбомом",
    });
  } catch (error) {
    console.error("Order API error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Помилка під час обробки замовлення",
      },
      { status: 500 }
    );
  }
}