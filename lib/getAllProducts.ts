import fs from "fs/promises";
import path from "path";

import { products as defaultProducts } from "../data/products";
import type { Product } from "../types/product";

const databaseFile = path.join(
  process.cwd(),
  "database",
  "products.json"
);

export async function getAllProducts(): Promise<Product[]> {
  try {
    const fileContent = await fs.readFile(databaseFile, "utf8");
    const adminProducts = JSON.parse(fileContent);

    if (Array.isArray(adminProducts) && adminProducts.length > 0) {
      return [...adminProducts].reverse();
    }
  } catch (error) {
    console.log("Не вдалося прочитати products.json:", error);
  }

  return defaultProducts;
}