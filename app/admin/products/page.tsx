"use client";

import Image from "next/image";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

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

type ProductForm = {
  id: number | null;
  name: string;
  category: ProductCategory;
  base: ProductBase;
  productType: ProductType;
  pile: ProductPile;
  pileHeightMm: string;
  totalHeightMm: string;
  rooms: ProductRoom[];
  material: ProductMaterial | "";
  styles: ProductStyle[];
  shape: ProductShape | "";
  brand: string;
  country: string;
  collection: string;
  description: string;
  features: string;
  price: string;
  priceType: ProductPriceType;
  colors: string;
  widths: string;
  lengths: string;
  productionTime: string;
  inStock: boolean;
  featured: boolean;
  new: boolean;
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  existingImages: string[];
  newImages: File[];
};

const emptyForm: ProductForm = {
  id: null,
  name: "",
  category: "budget",
  base: "felt",
  productType: "runner",
  pile: "flat",
  pileHeightMm: "",
  totalHeightMm: "",
  rooms: [],
  material: "",
  styles: [],
  shape: "",
  brand: "DreamCarpet",
  country: "Україна",
  collection: "",
  description: "",
  features: "",
  price: "",
  priceType: "square-meter",
  colors: "",
  widths: "",
  lengths: "",
  productionTime: "1-3 дні",
  inStock: true,
  featured: false,
  new: false,
  seoTitle: "",
  seoDescription: "",
  seoKeywords: "",
  existingImages: [],
  newImages: [],
};

const categoryOptions: ProductCategory[] = [
  "budget",
  "standard",
  "premium",
  "turkey",
];

const baseOptions: ProductBase[] = [
  "felt",
  "jute",
  "woven",
  "latex",
  "stitched",
];

const productTypeOptions: ProductType[] = [
  "runner",
  "rug",
  "doormat",
];

const pileOptions: ProductPile[] = [
  "flat",
  "medium",
  "high",
];

const roomOptions: ProductRoom[] = [
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

const materialOptions: ProductMaterial[] = [
  "polypropylene",
  "polyester",
  "wool",
  "viscose",
  "cotton",
  "microfiber",
  "acrylic",
  "mixed",
];

const styleOptions: ProductStyle[] = [
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

const shapeOptions: ProductShape[] = [
  "runner",
  "rectangle",
  "square",
  "round",
  "oval",
  "custom",
];

const heightOptions = [
  0.2,
  0.5,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  12,
  15,
  20,
  25,
  30,
  40,
  50,
];

const totalHeightOptions = [
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  12,
  15,
  20,
  25,
  30,
  40,
  50,
];

const categoryNames: Record<ProductCategory, string> = {
  budget: "Бюджетні",
  standard: "Середня якість",
  premium: "Преміум",
  turkey: "Туреччина",
};

const baseNames: Record<ProductBase, string> = {
  felt: "Повстяна",
  jute: "Джутова",
  woven: "Ткана",
  latex: "Латексна",
  stitched: "Прошита",
};

const productTypeNames: Record<ProductType, string> = {
  runner: "Доріжка",
  rug: "Килим",
  doormat: "Придверний килимок",
};

const pileNames: Record<ProductPile, string> = {
  flat: "Безворсовий",
  medium: "Середній ворс",
  high: "Високий ворс",
};

const roomNames: Record<ProductRoom, string> = {
  hallway: "Передпокій",
  corridor: "Коридор",
  kitchen: "Кухня",
  bedroom: "Спальня",
  "living-room": "Вітальня",
  children: "Дитяча",
  bathroom: "Ванна",
  office: "Офіс",
  balcony: "Балкон",
  terrace: "Тераса",
  outdoor: "Вулиця",
  commercial: "Комерційне приміщення",
};

const materialNames: Record<ProductMaterial, string> = {
  polypropylene: "Поліпропілен",
  polyester: "Поліестер",
  wool: "Вовна",
  viscose: "Віскоза",
  cotton: "Бавовна",
  microfiber: "Мікрофібра",
  acrylic: "Акрил",
  mixed: "Змішаний склад",
};

const styleNames: Record<ProductStyle, string> = {
  modern: "Сучасний",
  classic: "Класичний",
  loft: "Лофт",
  minimalism: "Мінімалізм",
  scandinavian: "Скандинавський",
  provence: "Прованс",
  vintage: "Вінтаж",
  children: "Дитячий",
  oriental: "Східний",
  geometric: "Геометрія",
};

const shapeNames: Record<ProductShape, string> = {
  runner: "Доріжка",
  rectangle: "Прямокутний",
  square: "Квадратний",
  round: "Круглий",
  oval: "Овальний",
  custom: "Під замовлення",
};

const priceTypeNames: Record<ProductPriceType, string> = {
  "square-meter": "грн / м²",
  piece: "грн / штука",
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatMm(value?: number) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return "Не вказано";
  }

  return `${new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 2,
  }).format(value)} мм`;
}

function safeText(value?: string) {
  return value && value.trim()
    ? value
    : "Не вказано";
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(
    []
  );

  const [form, setForm] =
    useState<ProductForm>(emptyForm);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<
    number | null
  >(null);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/products", {
        method: "GET",
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error(
          "Не вдалося завантажити товари"
        );
      }

      const data = (await response.json()) as
        | Product[]
        | {
            products?: Product[];
          };

      const loadedProducts = Array.isArray(data)
        ? data
        : Array.isArray(data.products)
          ? data.products
          : [];

      setProducts(loadedProducts);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Сталася невідома помилка"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return products;
    }

    return products.filter((product) => {
      const searchable = [
        product.name,
        product.article,
        product.collection,
        product.brand,
        product.country,
        product.description,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchable.includes(query);
    });
  }, [products, search]);

  const imagePreviews = useMemo(() => {
    return form.newImages.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));
  }, [form.newImages]);

  useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        URL.revokeObjectURL(preview.url);
      });
    };
  }, [imagePreviews]);

  function updateForm<K extends keyof ProductForm>(
    field: K,
    value: ProductForm[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function openCreateForm() {
    setForm(emptyForm);
    setMessage("");
    setError("");
    setFormOpen(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function openEditForm(product: Product) {
    setForm({
      id: product.id,
      name: product.name ?? "",
      category: product.category ?? "budget",
      base: product.base ?? "felt",
      productType: product.productType ?? "runner",
      pile: product.pile ?? "flat",
      pileHeightMm:
        product.pileHeightMm !== undefined
          ? String(product.pileHeightMm)
          : "",
      totalHeightMm:
        product.totalHeightMm !== undefined
          ? String(product.totalHeightMm)
          : "",
      rooms: Array.isArray(product.rooms)
        ? product.rooms
        : [],
      material: product.material ?? "",
      styles: Array.isArray(product.styles)
        ? product.styles
        : [],
      shape: product.shape ?? "",
      brand: product.brand ?? "DreamCarpet",
      country: product.country ?? "Україна",
      collection: product.collection ?? "",
      description: product.description ?? "",
      features: Array.isArray(product.features)
        ? product.features.join(", ")
        : "",
      price:
        product.price !== undefined
          ? String(product.price)
          : "",
      priceType:
        product.priceType ?? "square-meter",
      colors: Array.isArray(product.colors)
        ? product.colors.join(", ")
        : "",
      widths: Array.isArray(product.widths)
        ? product.widths.join(", ")
        : "",
      lengths: Array.isArray(product.lengths)
        ? product.lengths.join(", ")
        : "",
      productionTime:
        product.productionTime ?? "1-3 дні",
      inStock: product.inStock ?? true,
      featured: product.featured ?? false,
      new: product.new ?? false,
      seoTitle: product.seoTitle ?? "",
      seoDescription:
        product.seoDescription ?? "",
      seoKeywords: Array.isArray(
        product.seoKeywords
      )
        ? product.seoKeywords.join(", ")
        : "",
      existingImages: Array.isArray(
        product.images
      )
        ? product.images
        : [],
      newImages: [],
    });

    setMessage("");
    setError("");
    setFormOpen(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function closeForm() {
    setForm(emptyForm);
    setFormOpen(false);
    setError("");
  }

  function handleImagesChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(
      event.target.files ?? []
    );

    const imageExtensions = [
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
      ".avif",
      ".heic",
      ".heif",
    ];

    const validFiles = files.filter((file) => {
      const lowerName = file.name.toLowerCase();

      const hasImageMime =
        file.type.startsWith("image/");

      const hasImageExtension =
        imageExtensions.some((extension) =>
          lowerName.endsWith(extension)
        );

      return (
        file.size > 0 &&
        (hasImageMime || hasImageExtension)
      );
    });

    if (
      files.length > 0 &&
      validFiles.length === 0
    ) {
      setError(
        "Не вдалося розпізнати фото. Спробуй JPG, PNG, WEBP, HEIC або HEIF."
      );
    } else {
      setError("");
    }

    updateForm("newImages", [
      ...form.newImages,
      ...validFiles,
    ]);

    event.target.value = "";
  }

  function removeExistingImage(imageUrl: string) {
    updateForm(
      "existingImages",
      form.existingImages.filter(
        (image) => image !== imageUrl
      )
    );
  }

  function removeNewImage(fileToRemove: File) {
    updateForm(
      "newImages",
      form.newImages.filter(
        (file) => file !== fileToRemove
      )
    );
  }

  function toggleRoom(room: ProductRoom) {
    updateForm(
      "rooms",
      form.rooms.includes(room)
        ? form.rooms.filter((item) => item !== room)
        : [...form.rooms, room]
    );
  }

  function toggleStyle(style: ProductStyle) {
    updateForm(
      "styles",
      form.styles.includes(style)
        ? form.styles.filter(
            (item) => item !== style
          )
        : [...form.styles, style]
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (
      typeof document !== "undefined" &&
      document.activeElement instanceof HTMLElement
    ) {
      document.activeElement.blur();
    }

    const trimmedName = form.name.trim();
    const normalizedPrice = Number(
      form.price.replace(",", ".")
    );

    const parsedWidths = form.widths
      .split(",")
      .map((value) =>
        Number(value.trim().replace(",", "."))
      )
      .filter(
        (value) =>
          Number.isFinite(value) && value > 0
      );

    const parsedColors = form.colors
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);

    if (!trimmedName) {
      setError("Вкажи назву товару");
      return;
    }

    if (
      !Number.isFinite(normalizedPrice) ||
      normalizedPrice <= 0
    ) {
      setError("Вкажи правильну ціну");
      return;
    }

    if (parsedWidths.length === 0) {
      setError(
        "Вкажи хоча б одну ширину, наприклад 0.8 або 1"
      );
      return;
    }

    if (parsedColors.length === 0) {
      setError("Вкажи хоча б один колір");
      return;
    }

    try {
      setSaving(true);
      setMessage("");
      setError("");

      const formData = new FormData();

      if (form.id !== null) {
        formData.append(
          "id",
          String(form.id)
        );
      }

      formData.append("name", trimmedName);
      formData.append(
        "category",
        form.category
      );
      formData.append("base", form.base);
      formData.append(
        "productType",
        form.productType
      );
      formData.append("pile", form.pile);

      if (form.pileHeightMm) {
        formData.append(
          "pileHeightMm",
          form.pileHeightMm
        );
      }

      if (form.totalHeightMm) {
        formData.append(
          "totalHeightMm",
          form.totalHeightMm
        );
      }

      form.rooms.forEach((room) => {
        formData.append("rooms", room);
      });

      if (form.material) {
        formData.append(
          "material",
          form.material
        );
      }

      form.styles.forEach((style) => {
        formData.append("styles", style);
      });

      if (form.shape) {
        formData.append("shape", form.shape);
      }

      formData.append(
        "brand",
        form.brand.trim()
      );

      formData.append(
        "country",
        form.country.trim()
      );

      formData.append(
        "collection",
        form.collection.trim()
      );

      formData.append(
        "description",
        form.description.trim()
      );

      formData.append(
        "features",
        form.features
      );

      formData.append(
        "price",
        String(normalizedPrice)
      );

      formData.append(
        "priceType",
        form.priceType
      );

      formData.append(
        "colors",
        parsedColors.join(", ")
      );

      formData.append(
        "widths",
        parsedWidths.join(", ")
      );

      formData.append(
        "lengths",
        form.lengths
      );

      formData.append(
        "productionTime",
        form.productionTime.trim()
      );

      formData.append(
        "inStock",
        String(form.inStock)
      );

      formData.append(
        "featured",
        String(form.featured)
      );

      formData.append(
        "new",
        String(form.new)
      );

      formData.append(
        "seoTitle",
        form.seoTitle
      );

      formData.append(
        "seoDescription",
        form.seoDescription
      );

      formData.append(
        "seoKeywords",
        form.seoKeywords
      );

      form.existingImages.forEach(
        (image) => {
          formData.append(
            "existingImages",
            image
          );
        }
      );

      form.newImages.forEach((file) => {
        formData.append(
          "images",
          file,
          file.name
        );
      });

      const isEditing =
        form.id !== null;

      const response = await fetch(
        `/api/products?t=${Date.now()}`,
        {
          method:
            isEditing ? "PUT" : "POST",
          body: formData,
          cache: "no-store",
          credentials: "same-origin",
        }
      );

      const responseText =
        await response.text();

      let data: {
        message?: string;
        product?: Product;
      } = {};

      if (responseText) {
        try {
          data = JSON.parse(responseText) as {
            message?: string;
            product?: Product;
          };
        } catch {
          throw new Error(
            `Сервер повернув неправильну відповідь (${response.status})`
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          data.message ||
            `Не вдалося зберегти товар (${response.status})`
        );
      }

      if (!data.product?.id) {
        throw new Error(
          "Сервер відповів, що товар збережено, але не повернув ID товару"
        );
      }

      const verifyResponse = await fetch(
        `/api/products?verify=${Date.now()}`,
        {
          method: "GET",
          cache: "no-store",
          credentials: "same-origin",
        }
      );

      if (!verifyResponse.ok) {
        throw new Error(
          "Товар записався, але не вдалося перевірити його в базі"
        );
      }

      const verifyData =
        (await verifyResponse.json()) as
          | Product[]
          | {
              products?: Product[];
            };

      const verifiedProducts =
        Array.isArray(verifyData)
          ? verifyData
          : Array.isArray(
                verifyData.products
              )
            ? verifyData.products
            : [];

      const savedProduct =
        verifiedProducts.find(
          (product) =>
            Number(product.id) ===
            Number(data.product?.id)
        );

      if (!savedProduct) {
        throw new Error(
          "Сервер відповів «збережено», але товар не знайдено в Supabase"
        );
      }

      setProducts(verifiedProducts);

      setMessage(
        `${isEditing ? "Товар оновлено" : "Товар додано"}: ${savedProduct.name} (${savedProduct.article})${
          savedProduct.inStock
            ? ""
            : " — УВАГА: товар позначений «Немає в наявності»"
        }`
      );

      setForm(emptyForm);
      setFormOpen(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Сталася невідома помилка"
      );
    } finally {
      setSaving(false);
    }
  }

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Видалити товар «${product.name}»?\n\nЦю дію неможливо скасувати.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(product.id);
      setMessage("");
      setError("");

      const response = await fetch(
        "/api/products",
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id: product.id,
          }),
        }
      );

      const data = (await response.json()) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Не вдалося видалити товар"
        );
      }

      setMessage(data.message || "Товар видалено");

      await loadProducts();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Сталася невідома помилка"
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="admin-page">
      <div className="admin-container">
        <header className="page-header">
          <div>
            <p className="eyebrow">
              DreamCarpet CRM V2
            </p>

            <h1>Керування товарами</h1>

            <p className="subtitle">
              Додавай товари з фото,
              характеристиками, SEO та
              автоматичним артикулом.
            </p>
          </div>

          <div className="header-actions">
            <a
              className="secondary-button"
              href="/admin/orders"
            >
              Замовлення
            </a>

            <button
              className="primary-button"
              type="button"
              onClick={openCreateForm}
            >
              + Додати товар
            </button>
          </div>
        </header>

        {message && (
          <div className="notice success">
            {message}
          </div>
        )}

        {error && (
          <div className="notice error">
            {error}
          </div>
        )}

        {formOpen && (
          <section className="form-card">
            <div className="form-header">
              <div>
                <p className="eyebrow">
                  {form.id === null
                    ? "Новий товар"
                    : `Редагування №${form.id}`}
                </p>

                <h2>
                  {form.id === null
                    ? "Додати товар"
                    : "Редагувати товар"}
                </h2>

                <p className="form-help">
                  Артикул вводити не треба —
                  система створить його сама
                  по основі товару.
                </p>
              </div>

              <button
                type="button"
                className="close-button"
                onClick={closeForm}
                aria-label="Закрити форму"
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="product-form"
            >
              {form.id !== null && (
                <div className="auto-article-box">
                  <span>Артикул</span>
                  <strong>
                    {
                      products.find(
                        (item) => item.id === form.id
                      )?.article
                    }
                  </strong>
                  <small>
                    При редагуванні артикул не
                    змінюється.
                  </small>
                </div>
              )}

              <section className="form-section">
                <h3>Основна інформація</h3>

                <div className="form-grid">
                  <label>
                    <span>Назва товару *</span>

                    <input
                      value={form.name}
                      onChange={(event) =>
                        updateForm(
                          "name",
                          event.target.value
                        )
                      }
                      placeholder="Наприклад: Мармур Беж"
                      required
                    />
                  </label>

                  <label>
                    <span>Колекція</span>

                    <input
                      value={form.collection}
                      onChange={(event) =>
                        updateForm(
                          "collection",
                          event.target.value
                        )
                      }
                      placeholder="Наприклад: Marble"
                    />
                  </label>

                  <label>
                    <span>Ціна *</span>

                    <input
                      type="number"
                      min="1"
                      step="1"
                      value={form.price}
                      onChange={(event) =>
                        updateForm(
                          "price",
                          event.target.value
                        )
                      }
                      placeholder="799"
                      required
                    />
                  </label>

                  <label>
                    <span>Тип ціни</span>

                    <select
                      value={form.priceType}
                      onChange={(event) =>
                        updateForm(
                          "priceType",
                          event.target
                            .value as ProductPriceType
                        )
                      }
                    >
                      <option value="square-meter">
                        грн / м²
                      </option>

                      <option value="piece">
                        грн / штука
                      </option>
                    </select>
                  </label>

                  <label>
                    <span>Категорія</span>

                    <select
                      value={form.category}
                      onChange={(event) =>
                        updateForm(
                          "category",
                          event.target
                            .value as ProductCategory
                        )
                      }
                    >
                      {categoryOptions.map(
                        (category) => (
                          <option
                            key={category}
                            value={category}
                          >
                            {
                              categoryNames[
                                category
                              ]
                            }
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label>
                    <span>
                      Основа — по ній буде
                      артикул
                    </span>

                    <select
                      value={form.base}
                      onChange={(event) =>
                        updateForm(
                          "base",
                          event.target
                            .value as ProductBase
                        )
                      }
                    >
                      {baseOptions.map((base) => (
                        <option
                          key={base}
                          value={base}
                        >
                          {baseNames[base]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </section>

              <section className="form-section">
                <h3>Характеристики</h3>

                <div className="form-grid">
                  <label>
                    <span>Тип товару</span>

                    <select
                      value={form.productType}
                      onChange={(event) =>
                        updateForm(
                          "productType",
                          event.target
                            .value as ProductType
                        )
                      }
                    >
                      {productTypeOptions.map(
                        (type) => (
                          <option
                            key={type}
                            value={type}
                          >
                            {
                              productTypeNames[
                                type
                              ]
                            }
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label>
                    <span>Тип ворсу</span>

                    <select
                      value={form.pile}
                      onChange={(event) =>
                        updateForm(
                          "pile",
                          event.target
                            .value as ProductPile
                        )
                      }
                    >
                      {pileOptions.map((pile) => (
                        <option
                          key={pile}
                          value={pile}
                        >
                          {pileNames[pile]}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label>
                    <span>Висота ворсу</span>

                    <select
                      value={form.pileHeightMm}
                      onChange={(event) =>
                        updateForm(
                          "pileHeightMm",
                          event.target.value
                        )
                      }
                    >
                      <option value="">
                        Не вказано
                      </option>

                      {heightOptions.map(
                        (height) => (
                          <option
                            key={height}
                            value={height}
                          >
                            {formatMm(height)}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label>
                    <span>Загальна висота</span>

                    <select
                      value={form.totalHeightMm}
                      onChange={(event) =>
                        updateForm(
                          "totalHeightMm",
                          event.target.value
                        )
                      }
                    >
                      <option value="">
                        Не вказано
                      </option>

                      {totalHeightOptions.map(
                        (height) => (
                          <option
                            key={height}
                            value={height}
                          >
                            {formatMm(height)}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label>
                    <span>Матеріал</span>

                    <select
                      value={form.material}
                      onChange={(event) =>
                        updateForm(
                          "material",
                          event.target
                            .value as
                            | ProductMaterial
                            | ""
                        )
                      }
                    >
                      <option value="">
                        Не вказано
                      </option>

                      {materialOptions.map(
                        (material) => (
                          <option
                            key={material}
                            value={material}
                          >
                            {
                              materialNames[
                                material
                              ]
                            }
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label>
                    <span>Форма</span>

                    <select
                      value={form.shape}
                      onChange={(event) =>
                        updateForm(
                          "shape",
                          event.target
                            .value as
                            | ProductShape
                            | ""
                        )
                      }
                    >
                      <option value="">
                        Не вказано
                      </option>

                      {shapeOptions.map(
                        (shape) => (
                          <option
                            key={shape}
                            value={shape}
                          >
                            {shapeNames[shape]}
                          </option>
                        )
                      )}
                    </select>
                  </label>

                  <label>
                    <span>Бренд</span>

                    <input
                      value={form.brand}
                      onChange={(event) =>
                        updateForm(
                          "brand",
                          event.target.value
                        )
                      }
                      placeholder="DreamCarpet"
                    />
                  </label>

                  <label>
                    <span>Країна</span>

                    <input
                      value={form.country}
                      onChange={(event) =>
                        updateForm(
                          "country",
                          event.target.value
                        )
                      }
                      placeholder="Україна / Туреччина"
                    />
                  </label>

                  <label>
                    <span>Ширини через кому *</span>

                    <input
                      value={form.widths}
                      onChange={(event) =>
                        updateForm(
                          "widths",
                          event.target.value
                        )
                      }
                      placeholder="0.8, 1, 1.2, 1.5, 2"
                      required
                    />
                  </label>

                  <label>
                    <span>
                      Довжини готових килимів
                    </span>

                    <input
                      value={form.lengths}
                      onChange={(event) =>
                        updateForm(
                          "lengths",
                          event.target.value
                        )
                      }
                      placeholder="1.5, 2, 2.3, 3"
                    />
                  </label>

                  <label>
                    <span>Кольори через кому *</span>

                    <input
                      value={form.colors}
                      onChange={(event) =>
                        updateForm(
                          "colors",
                          event.target.value
                        )
                      }
                      placeholder="Бежевий, Сірий"
                      required
                    />
                  </label>

                  <label>
                    <span>Термін виготовлення</span>

                    <input
                      value={form.productionTime}
                      onChange={(event) =>
                        updateForm(
                          "productionTime",
                          event.target.value
                        )
                      }
                      placeholder="1-3 дні"
                    />
                  </label>
                </div>
              </section>

              <section className="choice-section">
                <div className="choice-header">
                  <div>
                    <h3>Для яких приміщень</h3>

                    <p>
                      Можна обрати декілька
                      варіантів.
                    </p>
                  </div>

                  <span>
                    Обрано: {form.rooms.length}
                  </span>
                </div>

                <div className="choice-grid">
                  {roomOptions.map((room) => (
                    <label
                      className={`choice-card ${
                        form.rooms.includes(room)
                          ? "selected"
                          : ""
                      }`}
                      key={room}
                    >
                      <input
                        type="checkbox"
                        checked={form.rooms.includes(
                          room
                        )}
                        onChange={() =>
                          toggleRoom(room)
                        }
                      />

                      <span>
                        {roomNames[room]}
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="choice-section">
                <div className="choice-header">
                  <div>
                    <h3>Стиль товару</h3>

                    <p>
                      Наприклад: сучасний,
                      класичний, лофт.
                    </p>
                  </div>

                  <span>
                    Обрано: {form.styles.length}
                  </span>
                </div>

                <div className="choice-grid">
                  {styleOptions.map((style) => (
                    <label
                      className={`choice-card ${
                        form.styles.includes(
                          style
                        )
                          ? "selected"
                          : ""
                      }`}
                      key={style}
                    >
                      <input
                        type="checkbox"
                        checked={form.styles.includes(
                          style
                        )}
                        onChange={() =>
                          toggleStyle(style)
                        }
                      />

                      <span>
                        {styleNames[style]}
                      </span>
                    </label>
                  ))}
                </div>
              </section>

              <section className="form-section">
                <h3>Опис і SEO</h3>

                <label className="full-field">
                  <span>Опис товару</span>

                  <textarea
                    value={form.description}
                    onChange={(event) =>
                      updateForm(
                        "description",
                        event.target.value
                      )
                    }
                    placeholder="Короткий опис товару..."
                    rows={5}
                  />
                </label>

                <label className="full-field">
                  <span>
                    Особливості через кому
                  </span>

                  <input
                    value={form.features}
                    onChange={(event) =>
                      updateForm(
                        "features",
                        event.target.value
                      )
                    }
                    placeholder="Легкий у догляді, Зносостійкий, Підходить для коридору"
                  />
                </label>

                <div className="form-grid">
                  <label>
                    <span>SEO Title</span>

                    <input
                      value={form.seoTitle}
                      onChange={(event) =>
                        updateForm(
                          "seoTitle",
                          event.target.value
                        )
                      }
                      placeholder="Килим Мармур Беж купити..."
                    />
                  </label>

                  <label>
                    <span>SEO Description</span>

                    <input
                      value={form.seoDescription}
                      onChange={(event) =>
                        updateForm(
                          "seoDescription",
                          event.target.value
                        )
                      }
                      placeholder="Опис для Google..."
                    />
                  </label>

                  <label>
                    <span>SEO Keywords</span>

                    <input
                      value={form.seoKeywords}
                      onChange={(event) =>
                        updateForm(
                          "seoKeywords",
                          event.target.value
                        )
                      }
                      placeholder="килим, доріжка, бежевий"
                    />
                  </label>
                </div>
              </section>

              <div className="checkbox-grid">
                <label className="checkbox-card">
                  <input
                    type="checkbox"
                    checked={form.inStock}
                    onChange={(event) =>
                      updateForm(
                        "inStock",
                        event.target.checked
                      )
                    }
                  />

                  <div>
                    <strong>В наявності</strong>
                    <small>
                      Товар можна замовити
                    </small>
                  </div>
                </label>

                <label className="checkbox-card">
                  <input
                    type="checkbox"
                    checked={form.featured}
                    onChange={(event) =>
                      updateForm(
                        "featured",
                        event.target.checked
                      )
                    }
                  />

                  <div>
                    <strong>Рекомендований</strong>
                    <small>
                      Показувати серед популярних
                    </small>
                  </div>
                </label>

                <label className="checkbox-card">
                  <input
                    type="checkbox"
                    checked={form.new}
                    onChange={(event) =>
                      updateForm(
                        "new",
                        event.target.checked
                      )
                    }
                  />

                  <div>
                    <strong>Новинка</strong>
                    <small>
                      Додати позначку «Новинка»
                    </small>
                  </div>
                </label>
              </div>

              <section className="images-section">
                <div>
                  <h3>Фотографії товару</h3>

                  <p>
                    Можна завантажити декілька
                    фото одночасно.
                  </p>
                </div>

                <label className="upload-button">
                  Вибрати фотографії

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImagesChange}
                  />
                </label>
              </section>

              {(form.existingImages.length > 0 ||
                imagePreviews.length > 0) && (
                <div className="image-grid">
                  {form.existingImages.map(
                    (image) => (
                      <div
                        className="image-preview"
                        key={image}
                      >
                        <Image
                          src={image}
                          alt="Фото товару"
                          fill
                          sizes="160px"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeExistingImage(
                              image
                            )
                          }
                        >
                          ×
                        </button>
                      </div>
                    )
                  )}

                  {imagePreviews.map(
                    ({ file, url }) => (
                      <div
                        className="image-preview"
                        key={`${file.name}-${file.lastModified}`}
                      >
                        <Image
                          src={url}
                          alt={file.name}
                          fill
                          unoptimized
                          sizes="160px"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeNewImage(file)
                          }
                        >
                          ×
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}

              <div className="form-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeForm}
                >
                  Скасувати
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Збереження..."
                    : form.id === null
                      ? "Додати товар"
                      : "Зберегти зміни"}
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="toolbar">
          <div>
            <strong>
              Усього товарів: {products.length}
            </strong>

            <span>
              Показано:{" "}
              {filteredProducts.length}
            </span>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Пошук за назвою, артикулом, брендом..."
          />
        </section>

        {loading ? (
          <div className="empty-state">
            Завантаження товарів...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="empty-state">
            <h2>Товарів не знайдено</h2>

            <p>
              Додай перший товар або зміни
              пошуковий запит.
            </p>
          </div>
        ) : (
          <section className="products-grid">
            {filteredProducts.map((product) => {
              const mainImage =
                Array.isArray(product.images) &&
                product.images.length > 0
                  ? product.images[0]
                  : "";

              return (
                <article
                  className="product-card"
                  key={product.id}
                >
                  <div className="product-image">
                    {mainImage ? (
                      <Image
                        src={mainImage}
                        alt={product.name}
                        fill
                        sizes="(max-width: 700px) 100vw, 300px"
                      />
                    ) : (
                      <div className="no-image">
                        Немає фото
                      </div>
                    )}

                    <div className="badges">
                      {product.new && (
                        <span>Новинка</span>
                      )}

                      {product.featured && (
                        <span>
                          Рекомендуємо
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="product-content">
                    <div className="product-topline">
                      <span>
                        {product.article}
                      </span>

                      <span
                        className={
                          product.inStock
                            ? "stock available"
                            : "stock unavailable"
                        }
                      >
                        {product.inStock
                          ? "В наявності"
                          : "Немає"}
                      </span>
                    </div>

                    <h2>{product.name}</h2>

                    <p className="collection">
                      {safeText(
                        product.collection
                      )}{" "}
                      ·{" "}
                      {
                        categoryNames[
                          product.category
                        ]
                      }
                    </p>

                    <p className="description">
                      {product.description ||
                        "Опис не вказано"}
                    </p>

                    <div className="product-details">
                      <span>
                        Основа:{" "}
                        {baseNames[
                          product.base
                        ] ?? product.base}
                      </span>

                      <span>
                        Тип:{" "}
                        {
                          productTypeNames[
                            product.productType ??
                              "runner"
                          ]
                        }
                      </span>

                      <span>
                        Ворс:{" "}
                        {
                          pileNames[
                            product.pile ??
                              "flat"
                          ]
                        }
                      </span>

                      <span>
                        Висота ворсу:{" "}
                        {formatMm(
                          product.pileHeightMm
                        )}
                      </span>

                      <span>
                        Матеріал:{" "}
                        {product.material
                          ? materialNames[
                              product.material
                            ]
                          : "Не вказано"}
                      </span>

                      <span>
                        Форма:{" "}
                        {product.shape
                          ? shapeNames[
                              product.shape
                            ]
                          : "Не вказано"}
                      </span>

                      <span>
                        Країна:{" "}
                        {safeText(
                          product.country
                        )}
                      </span>

                      <span>
                        Бренд:{" "}
                        {safeText(
                          product.brand
                        )}
                      </span>

                      <span>
                        Ширини:{" "}
                        {Array.isArray(
                          product.widths
                        )
                          ? product.widths.join(
                              ", "
                            )
                          : "Не вказано"}
                      </span>
                    </div>

                    <div className="product-footer">
                      <strong>
                        {formatMoney(
                          product.price
                        )}{" "}
                        {
                          priceTypeNames[
                            product.priceType ??
                              "square-meter"
                          ]
                        }
                      </strong>

                      <div className="card-actions">
                        <button
                          type="button"
                          onClick={() =>
                            openEditForm(product)
                          }
                        >
                          Редагувати
                        </button>

                        <button
                          type="button"
                          className="delete-button"
                          disabled={
                            deletingId ===
                            product.id
                          }
                          onClick={() =>
                            void deleteProduct(
                              product
                            )
                          }
                        >
                          {deletingId ===
                          product.id
                            ? "Видалення..."
                            : "Видалити"}
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>

      <style jsx>{`
        .admin-page {
          min-height: 100vh;
          padding: 32px 20px 70px;
          background: #f4f1eb;
          color: #181714;
        }

        .admin-container {
          width: min(1450px, 100%);
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 28px;
        }

        .eyebrow {
          margin: 0 0 8px;
          color: #8a7656;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          font-size: clamp(34px, 5vw, 54px);
          line-height: 1;
        }

        .subtitle,
        .form-help {
          margin: 14px 0 0;
          color: #716d65;
          font-size: 16px;
        }

        .header-actions,
        .form-actions,
        .card-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        button,
        a,
        input,
        select,
        textarea {
          font: inherit;
        }

        button,
        a {
          text-decoration: none;
        }

        .primary-button,
        .secondary-button {
          display: inline-flex;
          min-height: 44px;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          padding: 11px 16px;
          font-weight: 800;
          cursor: pointer;
        }

        .primary-button {
          border: 1px solid #181714;
          background: #181714;
          color: #ffffff;
        }

        .secondary-button {
          border: 1px solid #d7cfc1;
          background: #ffffff;
          color: #181714;
        }

        button:disabled {
          cursor: wait;
          opacity: 0.65;
        }

        .notice {
          margin-bottom: 20px;
          border-radius: 14px;
          padding: 14px 16px;
          font-weight: 700;
        }

        .notice.success {
          border: 1px solid #a9d8b8;
          background: #ecf9f0;
          color: #216d38;
        }

        .notice.error {
          border: 1px solid #efb5b5;
          background: #fff0f0;
          color: #a32323;
        }

        .form-card {
          margin-bottom: 28px;
          border: 1px solid #ddd5c7;
          border-radius: 24px;
          background: #ffffff;
          padding: 26px;
          box-shadow: 0 18px 50px
            rgba(46, 38, 26, 0.08);
        }

        .form-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
        }

        .form-header h2 {
          margin: 0;
          font-size: 30px;
        }

        .close-button {
          width: 42px;
          height: 42px;
          border: 1px solid #ddd5c7;
          border-radius: 12px;
          background: #ffffff;
          font-size: 26px;
          cursor: pointer;
        }

        .product-form {
          display: grid;
          gap: 22px;
        }

        .form-section,
        .choice-section {
          display: grid;
          gap: 16px;
          border: 1px solid #ddd5c7;
          border-radius: 18px;
          background: #faf8f4;
          padding: 18px;
        }

        .form-section h3,
        .choice-section h3 {
          margin: 0;
          font-size: 22px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(
            3,
            minmax(0, 1fr)
          );
          gap: 16px;
        }

        label {
          display: grid;
          gap: 8px;
        }

        label > span {
          font-size: 14px;
          font-weight: 800;
        }

        input,
        select,
        textarea {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #d8d0c3;
          border-radius: 12px;
          background: #ffffff;
          color: #181714;
          padding: 13px 14px;
          outline: none;
        }

        input:focus,
        select:focus,
        textarea:focus {
          border-color: #8a7656;
          box-shadow: 0 0 0 4px
            rgba(138, 118, 86, 0.12);
        }

        textarea {
          resize: vertical;
        }

        .full-field {
          display: grid;
          gap: 8px;
        }

        .choice-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 18px;
        }

        .choice-header p {
          margin: 6px 0 0;
          color: #777169;
          font-size: 13px;
        }

        .choice-header > span {
          border-radius: 999px;
          background: #181714;
          color: #ffffff;
          padding: 7px 10px;
          font-size: 12px;
          font-weight: 800;
          white-space: nowrap;
        }

        .choice-grid {
          display: grid;
          grid-template-columns: repeat(
            4,
            minmax(0, 1fr)
          );
          gap: 10px;
        }

        .choice-card {
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid #d8d0c3;
          border-radius: 12px;
          background: #ffffff;
          padding: 12px;
          cursor: pointer;
        }

        .choice-card.selected {
          border-color: #8a7656;
          background: #f1eadf;
          box-shadow: 0 0 0 3px
            rgba(138, 118, 86, 0.1);
        }

        .choice-card input {
          width: 18px;
          height: 18px;
          margin: 0;
        }

        .choice-card > span {
          font-weight: 800;
        }

        .auto-article-box {
          display: grid;
          gap: 5px;
          border: 1px solid #d7cfc1;
          border-radius: 16px;
          background: #fff8e8;
          padding: 16px;
        }

        .auto-article-box span {
          color: #8a7656;
          font-size: 13px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .auto-article-box strong {
          font-size: 24px;
        }

        .auto-article-box small {
          color: #716d65;
        }

        .checkbox-grid {
          display: grid;
          grid-template-columns: repeat(
            3,
            minmax(0, 1fr)
          );
          gap: 14px;
        }

        .checkbox-card {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          border: 1px solid #ddd5c7;
          border-radius: 14px;
          background: #ffffff;
          padding: 15px;
          cursor: pointer;
        }

        .checkbox-card input {
          width: 18px;
          height: 18px;
          margin-top: 2px;
        }

        .checkbox-card div {
          display: grid;
          gap: 4px;
        }

        .checkbox-card small {
          color: #777169;
        }

        .images-section {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          border-top: 1px solid #eee8de;
          padding-top: 22px;
        }

        .images-section h3 {
          margin: 0 0 5px;
        }

        .images-section p {
          margin: 0;
          color: #777169;
        }

        .upload-button {
          display: inline-flex;
          min-height: 44px;
          align-items: center;
          justify-content: center;
          border: 1px dashed #8a7656;
          border-radius: 12px;
          padding: 11px 16px;
          color: #6c593c;
          font-weight: 800;
          cursor: pointer;
        }

        .upload-button input {
          display: none;
        }

        .image-grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fill,
            minmax(130px, 1fr)
          );
          gap: 14px;
        }

        .image-preview {
          position: relative;
          overflow: hidden;
          aspect-ratio: 1;
          border: 1px solid #ddd5c7;
          border-radius: 14px;
          background: #eeeeee;
        }

        .image-preview :global(img) {
          object-fit: cover;
        }

        .image-preview button {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 2;
          width: 32px;
          height: 32px;
          border: 0;
          border-radius: 50%;
          background: rgba(20, 20, 20, 0.85);
          color: #ffffff;
          font-size: 20px;
          cursor: pointer;
        }

        .form-actions {
          justify-content: flex-end;
          border-top: 1px solid #eee8de;
          padding-top: 20px;
        }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
        }

        .toolbar > div {
          display: grid;
          gap: 5px;
        }

        .toolbar span {
          color: #716d65;
        }

        .toolbar input {
          max-width: 420px;
          background: #ffffff;
        }

        .empty-state {
          border: 1px dashed #cfc5b5;
          border-radius: 20px;
          background: #ffffff;
          padding: 40px;
          text-align: center;
          color: #716d65;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fill,
            minmax(310px, 1fr)
          );
          gap: 18px;
        }

        .product-card {
          overflow: hidden;
          border: 1px solid #ddd5c7;
          border-radius: 22px;
          background: #ffffff;
          box-shadow: 0 14px 35px
            rgba(46, 38, 26, 0.06);
        }

        .product-image {
          position: relative;
          aspect-ratio: 1.15 / 1;
          background: #e7e0d5;
        }

        .product-image :global(img) {
          object-fit: cover;
        }

        .no-image {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #777169;
          font-weight: 800;
        }

        .badges {
          position: absolute;
          top: 12px;
          left: 12px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .badges span {
          border-radius: 999px;
          background: #181714;
          color: #ffffff;
          padding: 7px 10px;
          font-size: 12px;
          font-weight: 900;
        }

        .product-content {
          display: grid;
          gap: 12px;
          padding: 17px;
        }

        .product-topline,
        .product-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .product-topline > span:first-child {
          color: #8a7656;
          font-size: 13px;
          font-weight: 900;
        }

        .stock {
          border-radius: 999px;
          padding: 6px 9px;
          font-size: 12px;
          font-weight: 900;
        }

        .stock.available {
          background: #ecf9f0;
          color: #216d38;
        }

        .stock.unavailable {
          background: #fff0f0;
          color: #a32323;
        }

        .product-content h2 {
          margin: 0;
          font-size: 22px;
          line-height: 1.15;
        }

        .collection {
          margin: 0;
          color: #8a7656;
          font-weight: 800;
        }

        .description {
          margin: 0;
          color: #716d65;
          line-height: 1.5;
        }

        .product-details {
          display: grid;
          gap: 7px;
          border-radius: 14px;
          background: #f8f5ef;
          padding: 12px;
          color: #4d4942;
          font-size: 14px;
        }

        .product-footer {
          border-top: 1px solid #eee8de;
          padding-top: 14px;
        }

        .product-footer strong {
          font-size: 20px;
        }

        .card-actions button {
          border: 1px solid #d7cfc1;
          border-radius: 10px;
          background: #ffffff;
          padding: 9px 11px;
          font-weight: 800;
          cursor: pointer;
        }

        .card-actions .delete-button {
          border-color: #efb5b5;
          color: #a32323;
        }

        @media (max-width: 950px) {
          .admin-page {
            width: 100%;
            overflow-x: hidden;
            box-sizing: border-box;
            padding: 18px 10px 50px;
          }

          .admin-container {
            width: 100%;
            min-width: 0;
          }

          .page-header,
          .toolbar,
          .images-section,
          .product-footer {
            flex-direction: column;
            align-items: stretch;
          }

          .page-header {
            gap: 14px;
            margin-bottom: 20px;
          }

          h1 {
            font-size: 34px;
          }

          .subtitle {
            font-size: 14px;
            line-height: 1.45;
          }

          .header-actions {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
          }

          .header-actions .primary-button,
          .header-actions .secondary-button {
            width: 100%;
          }

          .form-card {
            padding: 16px;
            border-radius: 18px;
          }

          .form-grid,
          .checkbox-grid,
          .choice-grid {
            grid-template-columns: 1fr;
          }

          .toolbar {
            gap: 12px;
            padding: 14px;
          }

          .toolbar input {
            max-width: none;
            width: 100%;
          }

          .products-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .product-card {
            display: grid;
            grid-template-columns: 130px minmax(0, 1fr);
            min-width: 0;
            border-radius: 16px;
          }

          .product-image {
            width: 130px;
            height: 100%;
            min-height: 210px;
            aspect-ratio: auto;
          }

          .product-content {
            min-width: 0;
            gap: 7px;
            padding: 11px;
          }

          .product-topline {
            align-items: flex-start;
            gap: 6px;
          }

          .product-topline > span:first-child {
            min-width: 0;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 11px;
          }

          .stock {
            flex-shrink: 0;
            padding: 5px 7px;
            font-size: 10px;
          }

          .product-content h2 {
            font-size: 19px;
            line-height: 1.08;
            overflow-wrap: anywhere;
          }

          .collection {
            font-size: 12px;
            overflow-wrap: anywhere;
          }

          .description {
            display: none;
          }

          .product-details {
            gap: 4px;
            padding: 8px;
            font-size: 11px;
            line-height: 1.25;
            overflow-wrap: anywhere;
          }

          .product-footer {
            gap: 8px;
            padding-top: 8px;
          }

          .product-footer strong {
            font-size: 17px;
          }

          .card-actions {
            width: 100%;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 6px;
          }

          .card-actions button {
            width: 100%;
            padding: 8px 6px;
            font-size: 11px;
          }

          .badges {
            top: 7px;
            left: 7px;
            gap: 4px;
          }

          .badges span {
            padding: 5px 7px;
            font-size: 9px;
          }
        }

        @media (max-width: 390px) {
          .admin-page {
            padding-left: 7px;
            padding-right: 7px;
          }

          h1 {
            font-size: 30px;
          }

          .product-card {
            grid-template-columns: 112px minmax(0, 1fr);
          }

          .product-image {
            width: 112px;
            min-height: 195px;
          }

          .product-content {
            padding: 9px;
          }

          .product-content h2 {
            font-size: 17px;
          }

          .product-details {
            font-size: 10px;
          }

          .product-footer strong {
            font-size: 15px;
          }
        }
      `}</style>
    </main>
  );
}