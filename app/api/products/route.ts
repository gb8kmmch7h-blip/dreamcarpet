import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";

import type {
  Product,
  ProductBase,
  ProductCategory,
  ProductMaterial,
  ProductPile,
  ProductPriceType,
  ProductRoom,
  ProductShape,
  ProductStyle,
  ProductType,
} from "../../../types/product";

export const runtime = "nodejs";

const localProductsFile = path.join(
  process.cwd(),
  "database",
  "products.json"
);

const storageBucket = "product-images";

/* ================================
   ДОЗВОЛЕНІ ЗНАЧЕННЯ
================================ */

const categories: ProductCategory[] = [
  "budget",
  "standard",
  "premium",
  "turkey",
];

const bases: ProductBase[] = [
  "felt",
  "jute",
  "woven",
  "latex",
  "stitched",
];

const productTypes: ProductType[] = [
  "runner",
  "rug",
  "doormat",
];

const productPiles: ProductPile[] = [
  "flat",
  "medium",
  "high",
];

const productRooms: ProductRoom[] = [
  "hallway",
  "corridor",
  "kitchen",
  "bedroom",
  "living-room",
  "children",
  "bathroom",
  "office",
  "balcony",
  "terrace",
  "outdoor",
  "commercial",
];

const productMaterials: ProductMaterial[] = [
  "polypropylene",
  "polyester",
  "wool",
  "viscose",
  "cotton",
  "microfiber",
  "acrylic",
  "mixed",
];

const productStyles: ProductStyle[] = [
  "modern",
  "classic",
  "loft",
  "minimalism",
  "scandinavian",
  "provence",
  "vintage",
  "children",
  "oriental",
  "geometric",
];

const productShapes: ProductShape[] = [
  "runner",
  "rectangle",
  "square",
  "round",
  "oval",
  "custom",
];

const priceTypes: ProductPriceType[] = [
  "square-meter",
  "piece",
];

/* ================================
   ПЕРЕВІРКА ЗНАЧЕНЬ
================================ */

function includesValue<T extends string>(
  list: readonly T[],
  value: string
): value is T {
  return list.includes(value as T);
}

/* ================================
   АРТИКУЛИ
================================ */

const articlePrefixes: Record<ProductBase, string> = {
  felt: "MB",
  jute: "NT",
  woven: "TK",
  latex: "LT",
  stitched: "DR",
};

function normalizeArticle(article: string): string {
  return article
    .trim()
    .toUpperCase()
    .replace(/М/g, "M")
    .replace(/В/g, "B")
    .replace(/Т/g, "T")
    .replace(/К/g, "K")
    .replace(/Н/g, "N")
    .replace(/Л/g, "L")
    .replace(/Д/g, "D")
    .replace(/Р/g, "R")
    .replace(/\s+/g, "")
    .replace(/_/g, "-");
}

function extractArticleNumber(
  article: string,
  prefix: string
): number | null {
  const normalized = normalizeArticle(article);

  const match = normalized.match(
    new RegExp(`^${prefix}-?(\\d+)$`, "i")
  );

  if (!match) {
    return null;
  }

  const number = Number(match[1]);

  return Number.isInteger(number) && number > 0
    ? number
    : null;
}

function generateArticle(
  products: Product[],
  base: ProductBase
): string {
  const prefix = articlePrefixes[base];

  const numbers = products
    .map((product) =>
      extractArticleNumber(
        product.article ?? "",
        prefix
      )
    )
    .filter(
      (number): number is number =>
        number !== null
    );

  const nextNumber =
    numbers.length > 0
      ? Math.max(...numbers) + 1
      : 1;

  return `${prefix}-${String(nextNumber).padStart(
    3,
    "0"
  )}`;
}

/* ================================
   SLUG
================================ */

function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[ії]/g, "i")
    .replace(/є/g, "ye")
    .replace(/ґ/g, "g")
    .replace(/а/g, "a")
    .replace(/б/g, "b")
    .replace(/в/g, "v")
    .replace(/г/g, "h")
    .replace(/д/g, "d")
    .replace(/е/g, "e")
    .replace(/ж/g, "zh")
    .replace(/з/g, "z")
    .replace(/и/g, "y")
    .replace(/й/g, "i")
    .replace(/к/g, "k")
    .replace(/л/g, "l")
    .replace(/м/g, "m")
    .replace(/н/g, "n")
    .replace(/о/g, "o")
    .replace(/п/g, "p")
    .replace(/р/g, "r")
    .replace(/с/g, "s")
    .replace(/т/g, "t")
    .replace(/у/g, "u")
    .replace(/ф/g, "f")
    .replace(/х/g, "kh")
    .replace(/ц/g, "ts")
    .replace(/ч/g, "ch")
    .replace(/ш/g, "sh")
    .replace(/щ/g, "shch")
    .replace(/ь/g, "")
    .replace(/ю/g, "yu")
    .replace(/я/g, "ya")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* ================================
   SUPABASE — ТОВАРИ
================================ */

type ProductRow = {
  id: number;
  slug: string;
  article: string;
  data: Record<string, unknown> | null;
};

function rowToProduct(row: ProductRow): Product {
  return {
    ...(row.data ?? {}),
    id: Number(row.id),
    slug: row.slug,
    article: row.article,
  } as Product;
}

function productToRow(product: Product) {
  const {
    id,
    slug,
    article,
    ...data
  } = product;

  return {
    id,
    slug,
    article,
    data,
    updated_at: new Date().toISOString(),
  };
}

async function readLocalProducts(): Promise<Product[]> {
  try {
    const content = await fs.readFile(
      localProductsFile,
      "utf8"
    );

    const parsed: unknown = JSON.parse(content);

    return Array.isArray(parsed)
      ? (parsed as Product[])
      : [];
  } catch {
    return [];
  }
}

async function seedProductsIfEmpty() {
  const { count, error: countError } =
    await supabaseAdmin
      .from("products")
      .select("id", {
        count: "exact",
        head: true,
      });

  if (countError) {
    throw countError;
  }

  if ((count ?? 0) > 0) {
    return;
  }

  const localProducts = await readLocalProducts();

  if (localProducts.length === 0) {
    return;
  }

  const rows = localProducts.map(productToRow);

  const { error } = await supabaseAdmin
    .from("products")
    .upsert(rows, {
      onConflict: "id",
    });

  if (error) {
    throw error;
  }
}

async function readProducts(): Promise<Product[]> {
  await seedProductsIfEmpty();

  const { data, error } = await supabaseAdmin
    .from("products")
    .select("id, slug, article, data")
    .order("id", {
      ascending: true,
    });

  if (error) {
    throw error;
  }

  return (data ?? []).map((row) =>
    rowToProduct(row as ProductRow)
  );
}

/* ================================
   SUPABASE STORAGE — ФОТО
================================ */

async function ensureStorageBucket() {
  const { data: bucket } =
    await supabaseAdmin.storage.getBucket(
      storageBucket
    );

  if (bucket) {
    return;
  }

  const { error } =
    await supabaseAdmin.storage.createBucket(
      storageBucket,
      {
        public: true,
        fileSizeLimit: 10 * 1024 * 1024,
        allowedMimeTypes: [
          "image/jpeg",
          "image/png",
          "image/webp",
          "image/avif",
        ],
      }
    );

  if (
    error &&
    !error.message
      .toLowerCase()
      .includes("already exists")
  ) {
    throw error;
  }
}

function safeFileName(fileName: string): string {
  const extension = path
    .extname(fileName)
    .toLowerCase();

  const originalName = path.basename(
    fileName,
    extension
  );

  const cleanName = originalName
    .toLowerCase()
    .replace(/[^a-zа-яіїєґ0-9]+/gi, "-")
    .replace(/^-+|-+$/g, "");

  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}-${
    cleanName || "photo"
  }${extension}`;
}

async function saveUploadedImages(
  formData: FormData
): Promise<string[]> {
  const files = formData
    .getAll("images")
    .filter(
      (value): value is File =>
        value instanceof File &&
        value.size > 0
    );

  if (files.length === 0) {
    return [];
  }

  await ensureStorageBucket();

  const imageUrls: string[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      continue;
    }

    const fileName = safeFileName(file.name);

    const storagePath = `products/${fileName}`;

    const buffer = Buffer.from(
      await file.arrayBuffer()
    );

    const { error } =
      await supabaseAdmin.storage
        .from(storageBucket)
        .upload(storagePath, buffer, {
          contentType:
            file.type || "application/octet-stream",
          upsert: false,
        });

    if (error) {
      throw error;
    }

    const { data } =
      supabaseAdmin.storage
        .from(storageBucket)
        .getPublicUrl(storagePath);

    imageUrls.push(data.publicUrl);
  }

  return imageUrls;
}

function getStoragePath(
  imageUrl: string
): string | null {
  try {
    const marker =
      `/storage/v1/object/public/${storageBucket}/`;

    const index = imageUrl.indexOf(marker);

    if (index === -1) {
      return null;
    }

    return decodeURIComponent(
      imageUrl.slice(index + marker.length)
    );
  } catch {
    return null;
  }
}

async function deleteImage(
  imageUrl: string
): Promise<void> {
  const storagePath = getStoragePath(imageUrl);

  if (!storagePath) {
    // Старі локальні /products/... фото не видаляємо:
    // на Vercel вони read-only.
    return;
  }

  const { error } =
    await supabaseAdmin.storage
      .from(storageBucket)
      .remove([storagePath]);

  if (error) {
    console.error(
      "Supabase delete image error:",
      error
    );
  }
}

/* ================================
   ДОПОМІЖНІ ФУНКЦІЇ
================================ */

function getString(
  formData: FormData,
  name: string,
  fallback = ""
): string {
  return String(
    formData.get(name) ?? fallback
  ).trim();
}

function getOptionalString(
  formData: FormData,
  name: string
): string | undefined {
  const value = getString(formData, name);

  return value || undefined;
}

function getNumber(
  formData: FormData,
  name: string
): number | undefined {
  const rawValue = getString(formData, name);

  if (!rawValue) {
    return undefined;
  }

  const value = Number(
    rawValue.replace(",", ".")
  );

  return Number.isFinite(value)
    ? value
    : undefined;
}

function getStringArray(
  formData: FormData,
  name: string
): string[] {
  return formData
    .getAll(name)
    .flatMap((value) =>
      String(value).split(",")
    )
    .map((value) => value.trim())
    .filter(Boolean);
}

function getNumberArray(
  formData: FormData,
  name: string
): number[] {
  return getStringArray(formData, name)
    .map((value) =>
      Number(value.replace(",", "."))
    )
    .filter(
      (value) =>
        Number.isFinite(value) && value > 0
    );
}

function getBoolean(
  formData: FormData,
  name: string
): boolean {
  return getString(formData, name) === "true";
}

/* ================================
   ЧИТАННЯ ФОРМИ
================================ */

function parseProductForm(formData: FormData) {
  const name = getString(formData, "name");

  const categoryValue = getString(
    formData,
    "category",
    "budget"
  );

  const baseValue = getString(
    formData,
    "base",
    "felt"
  );

  const productTypeValue = getString(
    formData,
    "productType",
    "runner"
  );

  const pileValue = getString(
    formData,
    "pile",
    "flat"
  );

  const materialValue = getString(
    formData,
    "material"
  );

  const shapeValue = getString(
    formData,
    "shape"
  );

  const priceTypeValue = getString(
    formData,
    "priceType",
    "square-meter"
  );

  const category: ProductCategory =
    includesValue(categories, categoryValue)
      ? categoryValue
      : "budget";

  const base: ProductBase =
    includesValue(bases, baseValue)
      ? baseValue
      : "felt";

  const productType: ProductType =
    includesValue(
      productTypes,
      productTypeValue
    )
      ? productTypeValue
      : "runner";

  const pile: ProductPile =
    includesValue(
      productPiles,
      pileValue
    )
      ? pileValue
      : "flat";

  const material =
    includesValue(
      productMaterials,
      materialValue
    )
      ? materialValue
      : undefined;

  const shape =
    includesValue(productShapes, shapeValue)
      ? shapeValue
      : undefined;

  const priceType: ProductPriceType =
    includesValue(
      priceTypes,
      priceTypeValue
    )
      ? priceTypeValue
      : "square-meter";

  const rooms = getStringArray(
    formData,
    "rooms"
  ).filter((room): room is ProductRoom =>
    includesValue(productRooms, room)
  );

  const styles = getStringArray(
    formData,
    "styles"
  ).filter((style): style is ProductStyle =>
    includesValue(productStyles, style)
  );

  return {
    name,
    category,
    base,
    productType,
    pile,

    pileHeightMm: getNumber(
      formData,
      "pileHeightMm"
    ),

    totalHeightMm: getNumber(
      formData,
      "totalHeightMm"
    ),

    rooms,
    material,
    styles,
    shape,

    brand: getOptionalString(
      formData,
      "brand"
    ),

    country: getOptionalString(
      formData,
      "country"
    ),

    collection: getString(
      formData,
      "collection"
    ),

    description: getString(
      formData,
      "description"
    ),

    features: getStringArray(
      formData,
      "features"
    ),

    price:
      getNumber(formData, "price") ?? 0,

    priceType,

    colors: getStringArray(
      formData,
      "colors"
    ),

    widths: getNumberArray(
      formData,
      "widths"
    ),

    lengths: getNumberArray(
      formData,
      "lengths"
    ),

    productionTime: getString(
      formData,
      "productionTime",
      "1–3 дні"
    ),

    inStock: getBoolean(
      formData,
      "inStock"
    ),

    featured: getBoolean(
      formData,
      "featured"
    ),

    new: getBoolean(formData, "new"),

    seoTitle: getOptionalString(
      formData,
      "seoTitle"
    ),

    seoDescription: getOptionalString(
      formData,
      "seoDescription"
    ),

    seoKeywords: getStringArray(
      formData,
      "seoKeywords"
    ),
  };
}

function validateProduct(
  data: ReturnType<typeof parseProductForm>
): string | null {
  if (!data.name) {
    return "Вкажіть назву товару";
  }

  if (
    !Number.isFinite(data.price) ||
    data.price <= 0
  ) {
    return "Вкажіть правильну ціну";
  }

  if (data.widths.length === 0) {
    return "Вкажіть хоча б одну ширину";
  }

  return null;
}

/* ================================
   GET
================================ */

export async function GET() {
  try {
    const products = await readProducts();

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET products error:", error);

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Не вдалося завантажити товари",
      },
      { status: 500 }
    );
  }
}

/* ================================
   POST — ДОДАВАННЯ
================================ */

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const data = parseProductForm(formData);

    const validationError =
      validateProduct(data);

    if (validationError) {
      return NextResponse.json(
        { message: validationError },
        { status: 400 }
      );
    }

    const products = await readProducts();

    const nextId =
      products.length > 0
        ? Math.max(
            ...products.map(
              (product) => product.id
            )
          ) + 1
        : 1;

    const article = generateArticle(
      products,
      data.base
    );

    const slugBase =
      createSlug(data.name) ||
      `product-${nextId}`;

    const images =
      await saveUploadedImages(formData);

    const newProduct: Product = {
      id: nextId,
      slug: `${slugBase}-${nextId}`,
      article,
      ...data,
      images,
    };

    const { error } = await supabaseAdmin
      .from("products")
      .insert(productToRow(newProduct));

    if (error) {
      throw error;
    }

    return NextResponse.json(
      {
        message: `Товар додано. Артикул: ${article}`,
        product: newProduct,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST product error:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Не вдалося додати товар",
      },
      { status: 500 }
    );
  }
}

/* ================================
   PUT — РЕДАГУВАННЯ
================================ */

export async function PUT(request: Request) {
  try {
    const formData = await request.formData();

    const id = Number(formData.get("id"));

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { message: "Неправильний ID товару" },
        { status: 400 }
      );
    }

    const data = parseProductForm(formData);

    const validationError =
      validateProduct(data);

    if (validationError) {
      return NextResponse.json(
        { message: validationError },
        { status: 400 }
      );
    }

    const products = await readProducts();

    const oldProduct = products.find(
      (product) => product.id === id
    );

    if (!oldProduct) {
      return NextResponse.json(
        { message: "Товар не знайдено" },
        { status: 404 }
      );
    }

    const existingImages = formData
      .getAll("existingImages")
      .map((value) => String(value))
      .filter(Boolean);

    const removedImages =
      (oldProduct.images ?? []).filter(
        (image) =>
          !existingImages.includes(image)
      );

    for (const image of removedImages) {
      await deleteImage(image);
    }

    const newImages =
      await saveUploadedImages(formData);

    const slugBase =
      createSlug(data.name) ||
      `product-${id}`;

    const article =
      normalizeArticle(
        oldProduct.article ?? ""
      ) ||
      generateArticle(products, data.base);

    const updatedProduct: Product = {
      id,
      slug: `${slugBase}-${id}`,
      article,
      ...data,
      images: [
        ...existingImages,
        ...newImages,
      ],
    };

    const { error } = await supabaseAdmin
      .from("products")
      .update(productToRow(updatedProduct))
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: "Товар успішно оновлено",
      product: updatedProduct,
    });
  } catch (error) {
    console.error(
      "PUT product error:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Не вдалося оновити товар",
      },
      { status: 500 }
    );
  }
}

/* ================================
   DELETE — ВИДАЛЕННЯ
================================ */

export async function DELETE(
  request: Request
) {
  try {
    const body = (await request.json()) as {
      id?: number;
    };

    const id = Number(body.id);

    if (!Number.isInteger(id) || id <= 0) {
      return NextResponse.json(
        { message: "Неправильний ID товару" },
        { status: 400 }
      );
    }

    const products = await readProducts();

    const product = products.find(
      (item) => item.id === id
    );

    if (!product) {
      return NextResponse.json(
        { message: "Товар не знайдено" },
        { status: 404 }
      );
    }

    for (const image of product.images ?? []) {
      await deleteImage(image);
    }

    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      message: "Товар успішно видалено",
    });
  } catch (error) {
    console.error(
      "DELETE product error:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Не вдалося видалити товар",
      },
      { status: 500 }
    );
  }
}