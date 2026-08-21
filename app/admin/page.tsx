"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

type Product = {
  id: number;
  slug: string;
  article: string;
  category: string;
  base: string;
  productType?: "runner" | "rug" | "doormat";
  pile?: "flat" | "medium" | "high";
  rooms?: (
    | "hallway"
    | "corridor"
    | "kitchen"
    | "bedroom"
    | "living-room"
    | "children"
    | "bathroom"
    | "office"
    | "balcony"
    | "terrace"
    | "outdoor"
    | "commercial"
  )[];
  collection: string;
  name: string;
  description: string;
  price: number;
  colors: string[];
  widths: number[];
  images: string[];
  productionTime: string;
  inStock: boolean;
  featured: boolean;
  new: boolean;
};

type CatalogCategory = { value: string; label: string; active: boolean };
type CatalogBase = { value: string; label: string; category: string; active: boolean };
type CatalogSettings = { categories: CatalogCategory[]; bases: CatalogBase[] };

const productTypeOptions = [
  { value: "runner", label: "Доріжка" },
  { value: "rug", label: "Килим" },
  { value: "doormat", label: "Придверний килимок" },
] as const;

const pileOptions = [
  { value: "flat", label: "Безворсовий" },
  { value: "medium", label: "Середній ворс" },
  { value: "high", label: "Високий ворс" },
] as const;

const roomOptions = [
  { value: "hallway", label: "Передпокій" },
  { value: "corridor", label: "Коридор" },
  { value: "kitchen", label: "Кухня" },
  { value: "bedroom", label: "Спальня" },
  { value: "living-room", label: "Вітальня" },
  { value: "children", label: "Дитяча" },
  { value: "bathroom", label: "Ванна кімната" },
  { value: "office", label: "Офіс" },
  { value: "balcony", label: "Балкон" },
  { value: "terrace", label: "Тераса" },
  { value: "outdoor", label: "Вулиця" },
  { value: "commercial", label: "Комерційне приміщення" },
] as const;

const inputStyle = {
  width: "100%",
  padding: "12px",
  border: "1px solid #cccccc",
  borderRadius: "8px",
  fontSize: "16px",
  boxSizing: "border-box" as const,
  background: "#ffffff",
  color: "#111111",
};

const buttonStyle = {
  padding: "12px 16px",
  border: "none",
  borderRadius: "9px",
  fontSize: "15px",
  fontWeight: 700,
  cursor: "pointer",
};

const adminCardStyle = {
  display: "flex",
  gap: "13px",
  alignItems: "center",
  minHeight: "92px",
  padding: "16px",
  borderRadius: "18px",
  border: "1px solid #e3dbcf",
  background: "#ffffff",
  color: "#171717",
  textDecoration: "none",
  boxShadow: "0 8px 24px rgba(41, 31, 18, 0.04)",
} as const;

const adminIconStyle = {
  width: "44px",
  height: "44px",
  display: "grid",
  placeItems: "center",
  flexShrink: 0,
  borderRadius: "13px",
  background: "#f1e3c8",
  fontSize: "22px",
} as const;

const adminTitleStyle = {
  display: "block",
  fontSize: "16px",
  lineHeight: 1.2,
} as const;

const adminTextStyle = {
  display: "block",
  marginTop: "5px",
  color: "#777067",
  fontSize: "12px",
  lineHeight: 1.35,
} as const;

const collectionPrefixes: Record<string, string> = {
  marble: "MB",
  luna: "LN",
  gold: "GD",
  flex: "FX",
  anny: "AN",
  mira: "MR",
  itea: "IT",
  orhidea: "OR",
  latex: "LX",
  espreco: "ES",
  kamino: "KM",
  darnichanka: "DR",
  fashion: "FS",
  lotos: "LT",
  rubin: "RB",
  "lotos p": "LP",
  "lotos p.": "LP",
};

function normalizeCollectionName(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

function createFallbackPrefix(collection: string) {
  const normalized = collection
    .trim()
    .toUpperCase()
    .replace(/[^A-ZА-ЯІЇЄҐ0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!normalized) {
    return "DC";
  }

  const words = normalized.split(" ").filter(Boolean);

  if (words.length >= 2) {
    return `${words[0][0] ?? "D"}${words[1][0] ?? "C"}`;
  }

  const word = words[0] ?? "DC";

  return (word.slice(0, 2) || "DC").padEnd(2, "C");
}

function getCollectionPrefix(collection: string) {
  const normalized = normalizeCollectionName(collection);

  return (
    collectionPrefixes[normalized] ||
    createFallbackPrefix(collection)
  );
}

function createNextArticleForCollection(
  products: Product[],
  collection: string
) {
  const prefix = getCollectionPrefix(collection);

  const maxNumber = products.reduce((max, product) => {
    const sameCollection =
      normalizeCollectionName(product.collection ?? "") ===
      normalizeCollectionName(collection);

    if (!sameCollection) {
      return max;
    }

    const match = String(product.article ?? "").match(
      new RegExp(`^${prefix}-(\\d+)$`, "i")
    );

    const number = match ? Number(match[1]) : 0;

    return Number.isFinite(number)
      ? Math.max(max, number)
      : max;
  }, 0);

  return `${prefix}-${String(maxNumber + 1).padStart(3, "0")}`;
}

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [collectionValue, setCollectionValue] =
    useState("");
  const [catalogSettings, setCatalogSettings] = useState<CatalogSettings>({ categories: [], bases: [] });
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedBase, setSelectedBase] = useState("");

  const [message, setMessage] = useState("");
  const [productSearch, setProductSearch] = useState("");
  const [productFilter, setProductFilter] = useState<
    "all" | "in-stock" | "out-of-stock" | "new" | "featured" | "no-photo"
  >("all");
  const [isLoading, setIsLoading] = useState(false);
  const [isProductsLoading, setIsProductsLoading] =
    useState(true);

  const loadProducts = useCallback(async () => {
    try {
      setIsProductsLoading(true);

      const response = await fetch("/api/products", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Не вдалося завантажити товари");
      }

      const data = (await response.json()) as Product[];
      setProducts([...data].reverse());
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Помилка завантаження товарів"
      );
    } finally {
      setIsProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    async function loadCatalogSettings() {
      try {
        const response = await fetch("/api/catalog-settings", { cache: "no-store" });
        if (!response.ok) throw new Error("Не вдалося завантажити категорії та основи");
        const data = (await response.json()) as CatalogSettings;
        setCatalogSettings({
          categories: Array.isArray(data.categories) ? data.categories : [],
          bases: Array.isArray(data.bases) ? data.bases : [],
        });
        const first = data.categories?.find((item) => item.active)?.value ?? "";
        setSelectedCategory((current) => current || first);
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Помилка завантаження категорій");
      }
    }
    void loadCatalogSettings();
  }, []);

  const activeCategories = catalogSettings.categories.filter((item) => item.active);
  const availableBases = catalogSettings.bases.filter(
    (item) => item.active && item.category === selectedCategory
  );

  useEffect(() => {
    if (!selectedCategory) {
      setSelectedBase("");
      return;
    }
    if (!availableBases.some((item) => item.value === selectedBase)) {
      setSelectedBase(availableBases[0]?.value ?? "");
    }
  }, [selectedCategory, selectedBase, catalogSettings.bases]);

  function handleImages(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setSelectedImages(
      Array.from(event.target.files ?? [])
    );
  }

  function removeExistingImage(image: string) {
    setExistingImages((current) =>
      current.filter((item) => item !== image)
    );
  }

  function startEditing(product: Product) {
    setEditingProduct(product);
    setCollectionValue(product.collection ?? "");
    setSelectedCategory(product.category ?? "");
    setSelectedBase(product.base ?? "");
    setExistingImages(product.images ?? []);
    setSelectedImages([]);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEditing(form?: HTMLFormElement) {
    setEditingProduct(null);
    setCollectionValue("");
    setExistingImages([]);
    setSelectedImages([]);
    setMessage("");

    form?.reset();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setIsLoading(true);
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    if (editingProduct) {
      formData.append("id", String(editingProduct.id));

      existingImages.forEach((image) => {
        formData.append("existingImages", image);
      });
    }

    try {
      const response = await fetch("/api/products", {
        method: editingProduct ? "PUT" : "POST",
        body: formData,
      });

      const responseText = await response.text();

      let result: { message?: string } = {};

      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error(
            `Сервер повернув неправильну відповідь. Код: ${response.status}`
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          result.message || "Не вдалося зберегти товар"
        );
      }

      setMessage(
        editingProduct
          ? "Товар успішно оновлено!"
          : "Товар успішно додано!"
      );

      setEditingProduct(null);
      setCollectionValue("");
      setExistingImages([]);
      setSelectedImages([]);
      form.reset();

      await loadProducts();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Сталася невідома помилка"
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Видалити товар «${product.name}»?\n\nРазом із товаром будуть видалені його фотографії.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");

      const response = await fetch("/api/products", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: product.id,
        }),
      });

      const result = (await response.json()) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.message || "Не вдалося видалити товар"
        );
      }

      if (editingProduct?.id === product.id) {
        setEditingProduct(null);
        setCollectionValue("");
        setExistingImages([]);
        setSelectedImages([]);
      }

      setMessage("Товар успішно видалено!");
      await loadProducts();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Помилка видалення товару"
      );
    }
  }

  const inStockCount = products.filter(
    (product) => product.inStock
  ).length;

  const featuredCount = products.filter(
    (product) => product.featured
  ).length;

  const newCount = products.filter(
    (product) => product.new
  ).length;

  const categoryCount = new Set(
    products.map((product) => product.category)
  ).size;

  const nextArticle =
    createNextArticleForCollection(
      products,
      collectionValue
    );

  function getCategoryLabel(categoryValue: string) {
    return (
      catalogSettings.categories.find(
        (category) => category.value === categoryValue
      )?.label ?? categoryValue
    );
  }

  function getBaseLabel(categoryValue: string, baseValue: string) {
    return (
      catalogSettings.bases.find(
        (base) =>
          base.category === categoryValue &&
          base.value === baseValue
      )?.label ?? baseValue
    );
  }

  const normalizedProductSearch = productSearch
    .trim()
    .toLowerCase();

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !normalizedProductSearch ||
      product.name?.toLowerCase().includes(normalizedProductSearch) ||
      product.article?.toLowerCase().includes(normalizedProductSearch) ||
      product.collection?.toLowerCase().includes(normalizedProductSearch);

    if (!matchesSearch) {
      return false;
    }

    if (productFilter === "in-stock") {
      return product.inStock;
    }

    if (productFilter === "out-of-stock") {
      return !product.inStock;
    }

    if (productFilter === "new") {
      return product.new;
    }

    if (productFilter === "featured") {
      return product.featured;
    }

    if (productFilter === "no-photo") {
      return !Array.isArray(product.images) || product.images.length === 0;
    }

    return true;
  });

  const groupedProducts = activeCategories
    .map((category) => {
      const categoryProducts = filteredProducts.filter(
        (product) => product.category === category.value
      );

      const configuredBases = catalogSettings.bases.filter(
        (base) => base.category === category.value
      );

      const baseValues = Array.from(
        new Set([
          ...configuredBases.map((base) => base.value),
          ...categoryProducts.map((product) => product.base),
        ])
      );

      const bases = baseValues
        .map((baseValue) => ({
          value: baseValue,
          label: getBaseLabel(category.value, baseValue),
          products: categoryProducts.filter(
            (product) => product.base === baseValue
          ),
        }))
        .filter((base) => base.products.length > 0);

      return {
        value: category.value,
        label: getCategoryLabel(category.value),
        productsCount: categoryProducts.length,
        bases,
      };
    });

  const knownCategoryValues = new Set(
    activeCategories.map((category) => category.value)
  );

  const uncategorizedProducts = filteredProducts.filter(
    (product) => !knownCategoryValues.has(product.category)
  );

  if (uncategorizedProducts.length > 0) {
    const unknownCategoryValues = Array.from(
      new Set(uncategorizedProducts.map((product) => product.category))
    );

    unknownCategoryValues.forEach((categoryValue) => {
      const categoryProducts = uncategorizedProducts.filter(
        (product) => product.category === categoryValue
      );

      const baseValues = Array.from(
        new Set(categoryProducts.map((product) => product.base))
      );

      groupedProducts.push({
        value: categoryValue,
        label: getCategoryLabel(categoryValue),
        productsCount: categoryProducts.length,
        bases: baseValues.map((baseValue) => ({
          value: baseValue,
          label: getBaseLabel(categoryValue, baseValue),
          products: categoryProducts.filter(
            (product) => product.base === baseValue
          ),
        })),
      });
    });
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f1ed",
        padding: "40px 20px",
        color: "#1c1c1c",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <section
          style={{
            marginBottom: "28px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: "20px",
              alignItems: "flex-start",
              flexWrap: "wrap",
              marginBottom: "20px",
            }}
          >
            <div>
              <p
                style={{
                  margin: "0 0 6px",
                  color: "#9a7b4f",
                  fontSize: "13px",
                  fontWeight: 900,
                  letterSpacing: "1.4px",
                  textTransform: "uppercase",
                }}
              >
                DreamCarpet
              </p>

              <h1
                style={{
                  margin: 0,
                  fontSize: "clamp(32px, 5vw, 48px)",
                  lineHeight: 1,
                }}
              >
                Панель керування
              </h1>

              <p
                style={{
                  margin: "12px 0 0",
                  maxWidth: "760px",
                  color: "#68625b",
                  lineHeight: 1.6,
                }}
              >
                Товари, замовлення, клієнти, відгуки та основні
                інструменти магазину в одному місці.
              </p>
            </div>

            <Link
              href="/"
              style={{
                display: "inline-flex",
                alignItems: "center",
                minHeight: "44px",
                padding: "0 16px",
                borderRadius: "12px",
                background: "#181714",
                color: "#ffffff",
                textDecoration: "none",
                fontWeight: 800,
              }}
            >
              Перейти на сайт ↗
            </Link>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(210px, 1fr))",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            {[
              {
                label: "Усі товари",
                value: products.length,
                note: "у каталозі",
              },
              {
                label: "У наявності",
                value: inStockCount,
                note: "можна замовити",
              },
              {
                label: "Рекомендовані",
                value: featuredCount,
                note: "featured",
              },
              {
                label: "Новинки",
                value: newCount,
                note: "позначені як new",
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: "18px",
                  borderRadius: "18px",
                  background: "#ffffff",
                  border: "1px solid #e7e1d8",
                }}
              >
                <div
                  style={{
                    color: "#777067",
                    fontSize: "13px",
                    fontWeight: 800,
                  }}
                >
                  {item.label}
                </div>

                <div
                  style={{
                    marginTop: "5px",
                    fontSize: "30px",
                    fontWeight: 900,
                  }}
                >
                  {item.value}
                </div>

                <div
                  style={{
                    marginTop: "2px",
                    color: "#9b958d",
                    fontSize: "12px",
                  }}
                >
                  {item.note}
                </div>
              </div>
            ))}
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "12px",
            }}
          >
            <a href="#add-product" style={adminCardStyle}>
              <span style={adminIconStyle}>➕</span>
              <span>
                <strong style={adminTitleStyle}>Додати товар</strong>
                <small style={adminTextStyle}>
                  Створити нову позицію каталогу
                </small>
              </span>
            </a>

            <a href="#products" style={adminCardStyle}>
              <span style={adminIconStyle}>🧶</span>
              <span>
                <strong style={adminTitleStyle}>Товари</strong>
                <small style={adminTextStyle}>
                  Редагування, ціна, фото, наявність
                </small>
              </span>
            </a>

            <Link href="/admin/orders" style={adminCardStyle}>
              <span style={adminIconStyle}>📦</span>
              <span>
                <strong style={adminTitleStyle}>Замовлення</strong>
                <small style={adminTextStyle}>
                  Статуси, деталі та друк
                </small>
              </span>
            </Link>

            <Link href="/admin/reviews" style={adminCardStyle}>
              <span style={adminIconStyle}>⭐</span>
              <span>
                <strong style={adminTitleStyle}>Відгуки</strong>
                <small style={adminTextStyle}>
                  Перевірка та модерація
                </small>
              </span>
            </Link>

            <Link href="/admin/customers" style={adminCardStyle}>
              <span style={adminIconStyle}>👥</span>
              <span>
                <strong style={adminTitleStyle}>Клієнти</strong>
                <small style={adminTextStyle}>
                  Контакти та історія замовлень
                </small>
              </span>
            </Link>

            <Link href="/admin/crm" style={adminCardStyle}>
              <span style={adminIconStyle}>📊</span>
              <span>
                <strong style={adminTitleStyle}>CRM</strong>
                <small style={adminTextStyle}>
                  Продажі, клієнти, товари та аналітика
                </small>
              </span>
            </Link>

          <Link href="/admin/categories" style={adminCardStyle}>
              <span style={adminIconStyle}>🗂️</span>
              <span>
                <strong style={adminTitleStyle}>Категорії</strong>
                <small style={adminTextStyle}>
                  Зараз використовується {categoryCount} категорії
                </small>
              </span>
            </Link>

            <Link href="/care" style={adminCardStyle}>
              <span style={adminIconStyle}>📝</span>
              <span>
                <strong style={adminTitleStyle}>Статті / догляд</strong>
                <small style={adminTextStyle}>
                  Перегляд SEO-статей магазину
                </small>
              </span>
            </Link>

            <Link href="/sitemap.xml" style={adminCardStyle}>
              <span style={adminIconStyle}>🔎</span>
              <span>
                <strong style={adminTitleStyle}>SEO</strong>
                <small style={adminTextStyle}>
                  Sitemap та індексація
                </small>
              </span>
            </Link>

            <Link href="/room-tryon" style={adminCardStyle}>
              <span style={adminIconStyle}>🤖</span>
              <span>
                <strong style={adminTitleStyle}>AI-примірка</strong>
                <small style={adminTextStyle}>
                  Перевірка модуля примірки
                </small>
              </span>
            </Link>
          </div>
        </section>

        <section
          id="add-product"
          style={{
            background: "#ffffff",
            padding: "30px",
            borderRadius: "20px",
            marginBottom: "35px",
          }}
        >
          <h1
            style={{
              fontSize: "38px",
              marginTop: 0,
              marginBottom: "8px",
            }}
          >
            {editingProduct
              ? "Редагування товару"
              : "Додати новий товар"}
          </h1>

          <p style={{ color: "#666666" }}>
            Фотографії перейменовувати не потрібно.
          </p>

          {editingProduct && (
            <div
              style={{
                padding: "12px 15px",
                marginBottom: "20px",
                borderRadius: "10px",
                background: "#f5efe5",
              }}
            >
              Редагується:{" "}
              <strong>{editingProduct.name}</strong>
            </div>
          )}

          <form
            key={editingProduct?.id ?? "new-product"}
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gap: "20px",
            }}
          >
            <div>
              <label>Назва товару</label>
              <input
                name="name"
                required
                defaultValue={editingProduct?.name ?? ""}
                placeholder="Мармур Беж"
                style={inputStyle}
              />
            </div>

            <div>
              <label>
                Артикул{" "}
                {!editingProduct && (
                  <span
                    style={{
                      color: "#8a7656",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    (створюється автоматично)
                  </span>
                )}
              </label>

              <input
                key={`article-${editingProduct?.id ?? "new"}-${nextArticle}`}
                name="article"
                required
                readOnly={!editingProduct}
                defaultValue={
                  editingProduct?.article ??
                  (collectionValue.trim() ? nextArticle : "")
                }
                placeholder="Спочатку введіть колекцію"
                style={{
                  ...inputStyle,
                  background: editingProduct
                    ? "#ffffff"
                    : "#f4efe6",
                  fontWeight: 800,
                }}
              />

              {!editingProduct && (
                <p
                  style={{
                    margin: "7px 0 0",
                    color: "#777067",
                    fontSize: "12px",
                  }}
                >
                  Введіть колекцію — артикул підставиться автоматично.
                </p>
              )}
            </div>

            <div>
              <label>Колекція</label>
              <input
                name="collection"
                value={collectionValue}
                onChange={(event) =>
                  setCollectionValue(event.target.value)
                }
                placeholder="Marble"
                style={inputStyle}
              />

              {!editingProduct && collectionValue.trim() && (
                <p
                  style={{
                    margin: "7px 0 0",
                    color: "#777067",
                    fontSize: "12px",
                  }}
                >
                  Для цієї колекції буде артикул:{" "}
                  <strong>{nextArticle}</strong>
                </p>
              )}
            </div>

            <div>
              <label>Ціна за м²</label>
              <input
                name="price"
                type="number"
                min="1"
                step="0.01"
                required
                defaultValue={editingProduct?.price ?? ""}
                placeholder="799"
                style={inputStyle}
              />
            </div>

            <div>
              <label>Категорія</label>
              <select
                name="category"
                required
                value={selectedCategory}
                onChange={(event) => {
                  setSelectedCategory(event.target.value);
                  setSelectedBase("");
                }}
                style={inputStyle}
              >
                <option value="">Оберіть категорію</option>
                {activeCategories.map((category) => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Основа</label>
              <select
                name="base"
                required
                value={selectedBase}
                onChange={(event) => setSelectedBase(event.target.value)}
                disabled={!selectedCategory}
                style={{
                  ...inputStyle,
                  background: !selectedCategory ? "#eeeeee" : "#ffffff",
                }}
              >
                <option value="">
                  {selectedCategory ? "Оберіть основу" : "Спочатку оберіть категорію"}
                </option>
                {availableBases.map((base) => (
                  <option key={`${base.category}-${base.value}`} value={base.value}>
                    {base.label}
                  </option>
                ))}
              </select>
              {selectedCategory && availableBases.length === 0 && (
                <p style={{ margin: "7px 0 0", color: "#b42323", fontSize: "12px", fontWeight: 700 }}>
                  Для цієї категорії немає активних основ. Додайте їх у розділі «Категорії».
                </p>
              )}
            </div>

            <div>
              <label>Тип товару</label>

              <select
                name="productType"
                defaultValue={
                  editingProduct?.productType ?? "runner"
                }
                style={inputStyle}
              >
                {productTypeOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label>Тип ворсу</label>

              <select
                name="pile"
                defaultValue={
                  editingProduct?.pile ?? "flat"
                }
                style={inputStyle}
              >
                {pileOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "10px",
                  fontWeight: 700,
                }}
              >
                Куди підходить цей килим
              </label>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(190px, 1fr))",
                  gap: "10px",
                  padding: "15px",
                  border: "1px solid #dddddd",
                  borderRadius: "12px",
                  background: "#f8f6f2",
                }}
              >
                {roomOptions.map((room) => (
                  <label
                    key={room.value}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "9px",
                      minHeight: "42px",
                      padding: "8px 10px",
                      borderRadius: "9px",
                      background: "#ffffff",
                      border: "1px solid #e5e0d8",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      name="rooms"
                      value={room.value}
                      defaultChecked={
                        editingProduct?.rooms?.includes(
                          room.value
                        ) ?? false
                      }
                    />

                    <span>{room.label}</span>
                  </label>
                ))}
              </div>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "#777067",
                  fontSize: "12px",
                  lineHeight: 1.4,
                }}
              >
                Можна вибрати одразу кілька варіантів.
              </p>
            </div>

            <div>
              <label>Опис</label>
              <textarea
                name="description"
                rows={8}
                defaultValue={
                  editingProduct?.description ?? ""
                }
                placeholder="Опис товару"
                style={inputStyle}
              />
            </div>

            <div>
              <label>Кольори через кому</label>
              <input
                name="colors"
                defaultValue={
                  editingProduct?.colors?.join(", ") ?? ""
                }
                placeholder="Бежевий, сірий, коричневий"
                style={inputStyle}
              />
            </div>

            <div>
              <label>Ширини через кому</label>
              <input
                name="widths"
                defaultValue={
                  editingProduct?.widths?.join(", ") ?? ""
                }
                placeholder="0.8, 1, 1.2, 1.5, 2"
                style={inputStyle}
              />
            </div>

            <div>
              <label>Час виготовлення</label>
              <input
                name="productionTime"
                defaultValue={
                  editingProduct?.productionTime ??
                  "1–3 дні"
                }
                style={inputStyle}
              />
            </div>

            {editingProduct &&
              existingImages.length > 0 && (
                <div>
                  <strong>Поточні фотографії</strong>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(130px, 1fr))",
                      gap: "15px",
                      marginTop: "12px",
                    }}
                  >
                    {existingImages.map((image) => (
                      <div
                        key={image}
                        style={{
                          position: "relative",
                          height: "130px",
                          overflow: "hidden",
                          borderRadius: "12px",
                          background: "#eeeeee",
                        }}
                      >
                        <Image
                          src={image}
                          alt="Фото товару"
                          fill
                          sizes="150px"
                          style={{
                            objectFit: "cover",
                          }}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeExistingImage(image)
                          }
                          style={{
                            position: "absolute",
                            top: "7px",
                            right: "7px",
                            width: "32px",
                            height: "32px",
                            border: "none",
                            borderRadius: "50%",
                            background: "#b42323",
                            color: "#ffffff",
                            cursor: "pointer",
                            fontWeight: 900,
                          }}
                          title="Видалити фотографію"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div>
              <label>
                {editingProduct
                  ? "Додати нові фотографії"
                  : "Фотографії"}
              </label>

              <input
                name="images"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleImages}
                style={inputStyle}
              />

              <p>
                Вибрано нових фото:{" "}
                <strong>{selectedImages.length}</strong>
              </p>
            </div>

            <div>
              <label>
                <input
                  type="checkbox"
                  name="inStock"
                  value="true"
                  defaultChecked={
                    editingProduct
                      ? editingProduct.inStock
                      : true
                  }
                />{" "}
                У наявності
              </label>
            </div>

            <div>
              <label>
                <input
                  type="checkbox"
                  name="featured"
                  value="true"
                  defaultChecked={
                    editingProduct?.featured ?? false
                  }
                />{" "}
                Рекомендований
              </label>
            </div>

            <div>
              <label>
                <input
                  type="checkbox"
                  name="new"
                  value="true"
                  defaultChecked={
                    editingProduct
                      ? editingProduct.new
                      : true
                  }
                />{" "}
                Новинка
              </label>
            </div>

            {message && (
              <div
                style={{
                  padding: "13px",
                  background: "#eeeeee",
                  borderRadius: "9px",
                  fontWeight: 700,
                }}
              >
                {message}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  ...buttonStyle,
                  flex: "1 1 220px",
                  padding: "15px",
                  background: "#111111",
                  color: "#ffffff",
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading
                  ? "Збереження..."
                  : editingProduct
                    ? "Зберегти зміни"
                    : "Додати товар"}
              </button>

              {editingProduct && (
                <button
                  type="button"
                  onClick={(event) => {
                    const form =
                      event.currentTarget.closest("form");

                    cancelEditing(form ?? undefined);
                  }}
                  style={{
                    ...buttonStyle,
                    flex: "1 1 180px",
                    background: "#dddddd",
                    color: "#111111",
                  }}
                >
                  Скасувати редагування
                </button>
              )}
            </div>
          </form>
        </section>

        <section
          id="products"
          style={{
            background: "#ffffff",
            padding: "30px",
            borderRadius: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              marginBottom: "25px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "30px",
                }}
              >
                Усі товари
              </h2>

              <p
                style={{
                  marginBottom: 0,
                  color: "#666666",
                }}
              >
                Кількість товарів: {products.length}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadProducts()}
              style={{
                ...buttonStyle,
                background: "#eeeeee",
                color: "#111111",
              }}
            >
              Оновити список
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gap: "12px",
              marginBottom: "22px",
              padding: "16px",
              borderRadius: "16px",
              background: "#f6f2ec",
              border: "1px solid #e2d8ca",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(220px, 1fr) auto",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <input
                type="search"
                value={productSearch}
                onChange={(event) =>
                  setProductSearch(event.target.value)
                }
                placeholder="🔎 Пошук за назвою, артикулом або колекцією"
                style={{
                  ...inputStyle,
                  background: "#ffffff",
                }}
              />

              {(productSearch || productFilter !== "all") && (
                <button
                  type="button"
                  onClick={() => {
                    setProductSearch("");
                    setProductFilter("all");
                  }}
                  style={{
                    ...buttonStyle,
                    background: "#ded6ca",
                    color: "#171717",
                  }}
                >
                  Очистити
                </button>
              )}
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "8px",
              }}
            >
              {[
                { value: "all", label: "Усі" },
                { value: "in-stock", label: "У наявності" },
                { value: "out-of-stock", label: "Немає в наявності" },
                { value: "new", label: "Новинки" },
                { value: "featured", label: "Рекомендовані" },
                { value: "no-photo", label: "Без фото" },
              ].map((filter) => {
                const active = productFilter === filter.value;

                return (
                  <button
                    key={filter.value}
                    type="button"
                    onClick={() =>
                      setProductFilter(
                        filter.value as typeof productFilter
                      )
                    }
                    style={{
                      ...buttonStyle,
                      padding: "9px 12px",
                      background: active ? "#181714" : "#ffffff",
                      color: active ? "#ffffff" : "#171717",
                      border: active
                        ? "1px solid #181714"
                        : "1px solid #d8cdbd",
                    }}
                  >
                    {filter.label}
                  </button>
                );
              })}
            </div>

            <div
              style={{
                color: "#6f685f",
                fontSize: "13px",
                fontWeight: 700,
              }}
            >
              Знайдено товарів: {filteredProducts.length}
            </div>
          </div>

          {isProductsLoading ? (
            <p>Завантаження товарів...</p>
          ) : products.length === 0 ? (
            <p>Товарів поки що немає.</p>
          ) : filteredProducts.length === 0 ? (
            <div
              style={{
                padding: "28px",
                borderRadius: "16px",
                background: "#f8f5f0",
                border: "1px dashed #c9bda9",
                textAlign: "center",
                fontWeight: 800,
                color: "#6f685f",
              }}
            >
              За цим пошуком або фільтром товарів не знайдено.
            </div>
          ) : productSearch.trim() || productFilter !== "all" ? (
            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              {filteredProducts.map((product) => (
                <article
                  key={product.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "100px minmax(180px, 1fr) auto",
                    gap: "18px",
                    alignItems: "center",
                    padding: "15px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "14px",
                    background: "#ffffff",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100px",
                      height: "100px",
                      borderRadius: "11px",
                      overflow: "hidden",
                      background: "#eeeeee",
                    }}
                  >
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="100px"
                        style={{
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          fontSize: "12px",
                          color: "#777777",
                        }}
                      >
                        Немає фото
                      </div>
                    )}
                  </div>

                  <div>
                    <h3
                      style={{
                        margin: "0 0 7px",
                        fontSize: "21px",
                      }}
                    >
                      {product.name}
                    </h3>

                    <p
                      style={{
                        margin: "0 0 5px",
                        color: "#666666",
                      }}
                    >
                      Артикул: {product.article}
                    </p>

                    <p
                      style={{
                        margin: "0 0 5px",
                        color: "#777067",
                        fontSize: "13px",
                      }}
                    >
                      Колекція: {product.collection || "—"}
                    </p>

                    <p
                      style={{
                        margin: "0 0 5px",
                        color: "#777067",
                        fontSize: "13px",
                      }}
                    >
                      {getCategoryLabel(product.category)} →{" "}
                      {getBaseLabel(product.category, product.base)}
                    </p>

                    <strong>{product.price} грн / м²</strong>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "9px",
                      flexWrap: "wrap",
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => startEditing(product)}
                      style={{
                        ...buttonStyle,
                        background: "#c29a65",
                        color: "#ffffff",
                      }}
                    >
                      Редагувати
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void deleteProduct(product)
                      }
                      style={{
                        ...buttonStyle,
                        background: "#b42323",
                        color: "#ffffff",
                      }}
                    >
                      Видалити
                    </button>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "22px",
              }}
            >
              {groupedProducts.map((category) => (
                <details
                  key={category.value}
                  style={{
                    overflow: "hidden",
                    border: "1px solid #ded6ca",
                    borderRadius: "18px",
                    background: "#f8f5f0",
                  }}
                >
                  <summary
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "12px",
                      padding: "18px 20px",
                      background: "#181714",
                      color: "#ffffff",
                      cursor: "pointer",
                      listStyle: "none",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "23px",
                          fontWeight: 900,
                        }}
                      >
                        {category.label}
                      </div>
                      <div
                        style={{
                          marginTop: "4px",
                          color: "#d9d1c7",
                          fontSize: "13px",
                        }}
                      >
                        Категорія: {category.value}
                      </div>
                    </div>

                    <strong
                      style={{
                        padding: "7px 11px",
                        borderRadius: "999px",
                        background: "#d4af37",
                        color: "#111111",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {category.productsCount} товарів
                    </strong>
                  </summary>

                  <div
                    style={{
                      display: "grid",
                      gap: "16px",
                      padding: "16px",
                    }}
                  >
                    {category.bases.map((base) => (
                      <details
                        key={`${category.value}-${base.value}`}
                        style={{
                          overflow: "hidden",
                          border: "1px solid #e0d8cc",
                          borderRadius: "14px",
                          background: "#ffffff",
                        }}
                      >
                        <summary
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "12px",
                            padding: "15px 17px",
                            cursor: "pointer",
                            background: "#eee5d7",
                            fontWeight: 900,
                            listStyle: "none",
                          }}
                        >
                          <span>Основа: {base.label}</span>
                          <span
                            style={{
                              padding: "5px 9px",
                              borderRadius: "999px",
                              background: "#ffffff",
                              fontSize: "12px",
                            }}
                          >
                            {base.products.length} шт.
                          </span>
                        </summary>

                        <div
                          style={{
                            display: "grid",
                            gap: "12px",
                            padding: "14px",
                          }}
                        >
                          {base.products.map((product) => (
                            <article
                              key={product.id}
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "100px minmax(180px, 1fr) auto",
                                gap: "18px",
                                alignItems: "center",
                                padding: "15px",
                                border: "1px solid #e0e0e0",
                                borderRadius: "14px",
                                background: "#ffffff",
                              }}
                            >
                              <div
                                style={{
                                  position: "relative",
                                  width: "100px",
                                  height: "100px",
                                  borderRadius: "11px",
                                  overflow: "hidden",
                                  background: "#eeeeee",
                                }}
                              >
                                {product.images?.[0] ? (
                                  <Image
                                    src={product.images[0]}
                                    alt={product.name}
                                    fill
                                    sizes="100px"
                                    style={{
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      height: "100%",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      textAlign: "center",
                                      fontSize: "12px",
                                      color: "#777777",
                                    }}
                                  >
                                    Немає фото
                                  </div>
                                )}
                              </div>

                              <div>
                                <h3
                                  style={{
                                    margin: "0 0 7px",
                                    fontSize: "21px",
                                  }}
                                >
                                  {product.name}
                                </h3>

                                <p
                                  style={{
                                    margin: "0 0 5px",
                                    color: "#666666",
                                  }}
                                >
                                  Артикул: {product.article}
                                </p>

                                <p
                                  style={{
                                    margin: "0 0 5px",
                                    color: "#777067",
                                    fontSize: "13px",
                                  }}
                                >
                                  Колекція: {product.collection || "—"}
                                </p>

                                <strong>{product.price} грн / м²</strong>
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  gap: "9px",
                                  flexWrap: "wrap",
                                  justifyContent: "flex-end",
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() => startEditing(product)}
                                  style={{
                                    ...buttonStyle,
                                    background: "#c29a65",
                                    color: "#ffffff",
                                  }}
                                >
                                  Редагувати
                                </button>

                                <button
                                  type="button"
                                  onClick={() =>
                                    void deleteProduct(product)
                                  }
                                  style={{
                                    ...buttonStyle,
                                    background: "#b42323",
                                    color: "#ffffff",
                                  }}
                                >
                                  Видалити
                                </button>
                              </div>
                            </article>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}