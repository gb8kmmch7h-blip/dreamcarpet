import { NextResponse } from "next/server";

import { getAllProducts } from "../../../lib/getAllProducts";
import type {
  Product,
  ProductBase,
  ProductPile,
  ProductRoom,
  ProductStyle,
  ProductType,
} from "../../../types/product";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type AssistantRequest = {
  message?: string;
};

type ParsedRequest = {
  room?: ProductRoom;
  style?: ProductStyle;
  pile?: ProductPile;
  base?: ProductBase;
  productType?: ProductType;
  color?: string;
  maxPrice?: number;
};

const colorPatterns: {
  color: string;
  words: string[];
}[] = [
  {
    color: "Бежевий",
    words: ["беж", "бежев"],
  },
  {
    color: "Коричневий",
    words: ["коричнев", "коричн"],
  },
  {
    color: "Сірий",
    words: ["сір", "сірий", "сіра", "сірого", "сірому", "серый", "серая"],
  },
  {
    color: "Синій",
    words: ["син", "синій", "синя", "синь"],
  },
  {
    color: "Червоний",
    words: ["червон", "красн"],
  },
  {
    color: "Зелений",
    words: ["зелен"],
  },
  {
    color: "Графітовий",
    words: ["графіт", "графит"],
  },
  {
    color: "Білий",
    words: ["білий", "біла", "білого", "белый", "белая"],
  },
  {
    color: "Чорний",
    words: ["чорн", "черн"],
  },
  {
    color: "Кремовий",
    words: ["крем"],
  },
  {
    color: "Капучіно",
    words: ["капуч"],
  },
  {
    color: "Рожевий",
    words: ["рожев", "розов"],
  },
  {
    color: "Пудровий",
    words: ["пудр"],
  },
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function includesAny(text: string, words: string[]) {
  return words.some((word) => text.includes(word));
}

function parseUserMessage(message: string): ParsedRequest {
  const text = normalize(message);

  const parsed: ParsedRequest = {};

  if (
    includesAny(text, [
      "коридор",
      "коридору",
      "коридорі",
    ])
  ) {
    parsed.room = "corridor";
  }

  if (
    includesAny(text, [
      "передпокій",
      "передпокою",
      "передпокої",
      "прихожа",
      "прихожу",
      "прихож",
    ])
  ) {
    parsed.room = "hallway";
  }

  if (
    includesAny(text, [
      "кухня",
      "кухню",
      "кухні",
    ])
  ) {
    parsed.room = "kitchen";
  }

  if (
    includesAny(text, [
      "спальня",
      "спальню",
      "спальні",
    ])
  ) {
    parsed.room = "bedroom";
  }

  if (
    includesAny(text, [
      "вітальня",
      "вітальню",
      "вітальні",
      "зал",
      "залу",
    ])
  ) {
    parsed.room = "living-room";
  }

  if (
    includesAny(text, [
      "дитяча",
      "дитячу",
      "дитині",
      "дитячої",
    ])
  ) {
    parsed.room = "children";
  }

  if (
    includesAny(text, [
      "офіс",
      "офісу",
      "кабінет",
    ])
  ) {
    parsed.room = "office";
  }

  if (
    includesAny(text, [
      "високий ворс",
      "високого ворсу",
      "пухнаст",
      "м'який",
      "м’який",
      "мягкий",
      "пушист",
    ])
  ) {
    parsed.pile = "high";
  }

  if (
    includesAny(text, [
      "середній ворс",
      "середнього ворсу",
      "середнім ворсом",
      "не дуже високий",
    ])
  ) {
    parsed.pile = "medium";
  }

  if (
    includesAny(text, [
      "безворс",
      "без ворсу",
      "низький ворс",
      "легко чистити",
      "практичний",
      "практична",
    ])
  ) {
    parsed.pile = "flat";
  }

  if (
    includesAny(text, [
      "повст",
      "повстяна",
      "повстяній",
      "войлок",
    ])
  ) {
    parsed.base = "felt";
  }

  if (
    includesAny(text, [
      "джут",
      "джутова",
      "джутовій",
    ])
  ) {
    parsed.base = "jute";
  }

  if (
    includesAny(text, [
      "ткана",
      "тканій",
      "тканий",
      "тканій основі",
    ])
  ) {
    parsed.base = "woven";
  }

  /*
    ВАЖЛИВО:
    "на резині", "резина", "резинова", "гумова",
    "не ковзає" — це все в нас латексна / гумова основа.
  */
  if (
    includesAny(text, [
      "латекс",
      "латексна",
      "латексній",
      "гумов",
      "гумова",
      "гумовій",
      "резин",
      "резина",
      "резині",
      "резинов",
      "резинова",
      "резиновій",
      "каучук",
      "не ковза",
      "не скольз",
      "антиковз",
      "прогум",
    ])
  ) {
    parsed.base = "latex";
  }

  if (
    includesAny(text, [
      "прошита",
      "прошитий",
      "прошитій",
      "дарничанка",
    ])
  ) {
    parsed.base = "stitched";
  }

  if (
    includesAny(text, [
      "доріжка",
      "доріжку",
      "доріжки",
      "дорожка",
      "дорожку",
      "дорожки",
    ])
  ) {
    parsed.productType = "runner";
  }

  if (
    includesAny(text, [
      "килимок",
      "коврик",
      "придверний",
      "біля дверей",
    ])
  ) {
    parsed.productType = "doormat";
  }

  if (
    includesAny(text, [
      "килим",
      "ковер",
    ]) &&
    !parsed.productType
  ) {
    parsed.productType = "rug";
  }

  if (
    includesAny(text, [
      "сучасний",
      "сучасному",
      "модерн",
    ])
  ) {
    parsed.style = "modern";
  }

  if (
    includesAny(text, [
      "класика",
      "класичний",
      "класичному",
    ])
  ) {
    parsed.style = "classic";
  }

  if (includesAny(text, ["лофт"])) {
    parsed.style = "loft";
  }

  if (
    includesAny(text, [
      "мінімалізм",
      "мінімалістичний",
    ])
  ) {
    parsed.style = "minimalism";
  }

  if (
    includesAny(text, [
      "скандинавський",
      "сканді",
    ])
  ) {
    parsed.style = "scandinavian";
  }

  if (
    includesAny(text, [
      "геометрія",
      "геометричний",
      "ромб",
      "ромби",
    ])
  ) {
    parsed.style = "geometric";
  }

  if (
    includesAny(text, [
      "східний",
      "орієнтальний",
    ])
  ) {
    parsed.style = "oriental";
  }

  const foundColor = colorPatterns.find((item) =>
    includesAny(text, item.words)
  );

  if (foundColor) {
    parsed.color = foundColor.color;
  }

  const priceMatch =
    text.match(/до\s*(\d{3,6})/) ||
    text.match(/бюджет\s*(\d{3,6})/) ||
    text.match(/(\d{3,6})\s*грн/);

  if (priceMatch) {
    const price = Number(priceMatch[1]);

    if (Number.isFinite(price) && price > 0) {
      parsed.maxPrice = price;
    }
  }

  return parsed;
}

function hasHardMismatch(
  product: Product,
  parsed: ParsedRequest
) {
  /*
    Основа — це жорсткий фільтр.
    Якщо людина просить "на резині",
    повстяні, джутові й ткані не показуємо.
  */
  if (parsed.base && product.base !== parsed.base) {
    return true;
  }

  /*
    Тип товару теж краще тримати жорстко:
    якщо попросили доріжку — не показуємо килимок.
  */
  if (
    parsed.productType &&
    (product.productType ?? "runner") !==
      parsed.productType
  ) {
    return true;
  }

  return false;
}

function getProductScore(
  product: Product,
  parsed: ParsedRequest
) {
  if (hasHardMismatch(product, parsed)) {
    return -999;
  }

  let score = 0;

  if (product.inStock) {
    score += 4;
  }

  if (product.featured) {
    score += 2;
  }

  if (product.new) {
    score += 1;
  }

  if (parsed.room) {
    if (product.rooms?.includes(parsed.room)) {
      score += 10;
    } else {
      score -= 1;
    }
  }

  if (parsed.style) {
    if (product.styles?.includes(parsed.style)) {
      score += 7;
    }
  }

  if (parsed.pile) {
    if ((product.pile ?? "flat") === parsed.pile) {
      score += 6;
    }
  }

  if (parsed.base) {
    if (product.base === parsed.base) {
      score += 12;
    }
  }

  if (parsed.productType) {
    if (
      (product.productType ?? "runner") ===
      parsed.productType
    ) {
      score += 7;
    }
  }

  if (parsed.color) {
    if (product.colors?.includes(parsed.color)) {
      score += 6;
    } else {
      score -= 2;
    }
  }

  if (parsed.maxPrice) {
    if (product.price <= parsed.maxPrice) {
      score += 5;
    } else if (product.price <= parsed.maxPrice * 1.2) {
      score += 2;
    } else {
      score -= 5;
    }
  }

  return score;
}

function createReasons(
  product: Product,
  parsed: ParsedRequest
) {
  const reasons: string[] = [];

  if (parsed.room && product.rooms?.includes(parsed.room)) {
    reasons.push("підходить під вашу кімнату");
  }

  if (parsed.style && product.styles?.includes(parsed.style)) {
    reasons.push("підходить по стилю");
  }

  if (parsed.pile && product.pile === parsed.pile) {
    reasons.push("має потрібний тип ворсу");
  }

  if (parsed.base && product.base === parsed.base) {
    reasons.push("має потрібну основу");
  }

  if (
    parsed.productType &&
    (product.productType ?? "runner") ===
      parsed.productType
  ) {
    reasons.push("це потрібний тип товару");
  }

  if (parsed.color && product.colors?.includes(parsed.color)) {
    reasons.push("є у потрібному кольорі");
  }

  if (parsed.maxPrice && product.price <= parsed.maxPrice) {
    reasons.push("вписується у бюджет");
  }

  if (product.inStock) {
    reasons.push("є в наявності");
  }

  return reasons;
}

function getRoomName(room?: ProductRoom) {
  if (!room) return "";

  const names: Record<ProductRoom, string> = {
    hallway: "передпокою",
    corridor: "коридору",
    kitchen: "кухні",
    bedroom: "спальні",
    "living-room": "вітальні",
    children: "дитячої",
    bathroom: "ванної",
    office: "офісу",
    balcony: "балкону",
    terrace: "тераси",
    outdoor: "вулиці",
    commercial: "комерційного приміщення",
  };

  return names[room];
}

function getBaseName(base?: ProductBase) {
  if (!base) return "";

  const names: Record<ProductBase, string> = {
    felt: "на повстяній основі",
    jute: "на джутовій основі",
    woven: "на тканій основі",
    latex: "на гумовій / латексній основі",
    stitched: "на прошитій основі",
  };

  return names[base];
}

function getPileName(pile?: ProductPile) {
  if (!pile) return "";

  const names: Record<ProductPile, string> = {
    flat: "безворсовий",
    medium: "із середнім ворсом",
    high: "з високим ворсом",
  };

  return names[pile];
}

function createAssistantText(
  message: string,
  parsed: ParsedRequest,
  recommendationsCount: number
) {
  const text = normalize(message);

  if (
    includesAny(text, [
      "привіт",
      "добрий день",
      "добрий вечір",
      "вітаю",
    ])
  ) {
    return "Вітаю 👋 Я консультант DreamCarpet. Напишіть, куди потрібен килим: коридор, кухня, спальня, вітальня, який колір, ворс і бюджет — я підберу варіанти з каталогу.";
  }

  if (
    includesAny(text, [
      "як доглядати",
      "догляд",
      "чистити",
      "пляма",
      "пятно",
    ])
  ) {
    return "Для догляду головне не заливати килим водою, пилососити регулярно і пляму промокати від країв до центру. Для точнішої поради напишіть, яка основа або який ворс у килима. Ще можете перейти в розділ «Догляд» на сайті.";
  }

  const parts: string[] = [];

  if (parsed.room) {
    parts.push(`для ${getRoomName(parsed.room)}`);
  }

  if (parsed.base) {
    parts.push(getBaseName(parsed.base));
  }

  if (parsed.color) {
    parts.push(`колір: ${parsed.color.toLowerCase()}`);
  }

  if (parsed.pile) {
    parts.push(getPileName(parsed.pile));
  }

  if (parsed.maxPrice) {
    parts.push(`до ${parsed.maxPrice} грн`);
  }

  if (recommendationsCount > 0) {
    return `Я підібрав ${recommendationsCount} варіантів ${parts.length > 0 ? `під запит: ${parts.join(", ")}` : "з каталогу"}. Я не показую товари з іншою основою, якщо ви прямо вказали основу.`;
  }

  if (parsed.base === "latex") {
    return "Я зрозумів, що потрібен варіант на гумовій / латексній основі, але точних товарів з такою основою зараз не знайшов. Додайте в адмінці товари з основою «Латексна», і я почну їх показувати.";
  }

  return "Точних варіантів не знайшов. Спробуйте написати простіше: наприклад «сіра доріжка на резині в коридор до 1500 грн» або «м’який килим у спальню».";
}

export async function POST(request: Request) {
  try {
    const body =
      (await request.json()) as AssistantRequest;

    const message = body.message?.trim() || "";

    if (!message) {
      return NextResponse.json(
        {
          success: false,
          message: "Напишіть питання консультанту.",
        },
        { status: 400 }
      );
    }

    const products = await getAllProducts();
    const parsed = parseUserMessage(message);

    const recommendations = products
      .map((product) => ({
        product,
        score: getProductScore(product, parsed),
        reasons: createReasons(product, parsed),
      }))
      .filter((item) => item.score > 0)
      .sort((first, second) => {
        if (second.score !== first.score) {
          return second.score - first.score;
        }

        return second.product.id - first.product.id;
      })
      .slice(0, 6);

    const answer = createAssistantText(
      message,
      parsed,
      recommendations.length
    );

    return NextResponse.json({
      success: true,
      answer,
      parsed,
      recommendations,
    });
  } catch (error) {
    console.error("Assistant API error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Помилка консультанта",
      },
      { status: 500 }
    );
  }
}