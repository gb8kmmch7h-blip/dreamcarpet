import fs from "fs/promises";
import path from "path";

import { supabaseAdmin } from "./supabaseAdmin";

import type { Product } from "../types/product";

const localProductsFile = path.join(
  process.cwd(),
  "database",
  "products.json"
);

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

  const { error } = await supabaseAdmin
    .from("products")
    .upsert(
      localProducts.map(productToRow),
      {
        onConflict: "id",
      }
    );

  if (error) {
    throw error;
  }
}

export async function getAllProducts(): Promise<Product[]> {
  await seedProductsIfEmpty();

  const { data, error } = await supabaseAdmin
    .from("products")
    .select("id, slug, article, data")
    .order("id", {
      ascending: true,
    });

  if (error) {
    console.error(
      "Supabase getAllProducts error:",
      error
    );

    return readLocalProducts();
  }

  return (data ?? []).map((row) =>
    rowToProduct(row as ProductRow)
  );
}