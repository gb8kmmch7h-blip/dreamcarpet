"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import ProductCareBlock from "./ProductCareBlock";
import RelatedProducts from "./RelatedProducts";
import { useCart } from "../context/CartContext";
import type {
  Product,
  ProductBase,
  ProductMaterial,
  ProductPile,
  ProductPriceType,
  ProductRoom,
  ProductShape,
  ProductStyle,
  ProductType,
} from "../types/product";

type ProductDetailsProps = {
  product: Product;
  relatedProducts?: Product[];
  initialWidth?: number;
  initialLength?: number;
};

const baseNames: Record<ProductBase, string> = {
  felt: "Повстяна основа",
  jute: "Джутова основа",
  woven: "Ткана основа",
  latex: "Латексна основа",
  stitched: "Прошита основа",
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

const priceTypeNames: Record<ProductPriceType, string> = {
  "square-meter": "м²",
  piece: "шт.",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatMm(value?: number) {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value)
  ) {
    return "";
  }

  return `${formatNumber(value)} мм`;
}

function safeText(value?: string) {
  return value && value.trim() ? value : "";
}

export default function ProductDetails({
  product,
  initialWidth,
  initialLength,
}: ProductDetailsProps) {
  const { addToCart } = useCart();

  const priceType =
    product.priceType ?? "square-meter";

  const availableImages =
    Array.isArray(product.images) &&
    product.images.length > 0
      ? product.images
      : [];

  const availableWidths =
    Array.isArray(product.widths) &&
    product.widths.length > 0
      ? product.widths
      : [1];

  const availableColors =
    Array.isArray(product.colors) &&
    product.colors.length > 0
      ? product.colors
      : ["Не вказано"];

  const [activeImage, setActiveImage] = useState(
    availableImages[0] ?? ""
  );

  const startWidth =
    typeof initialWidth === "number" &&
    Number.isFinite(initialWidth) &&
    initialWidth > 0 &&
    availableWidths.some(
      (width) =>
        Math.abs(Number(width) - initialWidth) < 0.01
    )
      ? initialWidth
      : availableWidths[0];

  const startLength =
    typeof initialLength === "number" &&
    Number.isFinite(initialLength) &&
    initialLength > 0
      ? String(initialLength)
      : "1";

  const [selectedWidth, setSelectedWidth] =
    useState<number>(startWidth);

  const [selectedColor, setSelectedColor] =
    useState<string>(availableColors[0]);

  const [length, setLength] = useState(startLength);

  const [message, setMessage] = useState("");

  const numericLength = Number(
    length.replace(",", ".")
  );

  const validLength =
    Number.isFinite(numericLength) &&
    numericLength > 0
      ? numericLength
      : 0;

  const area = useMemo(() => {
    return selectedWidth * validLength;
  }, [selectedWidth, validLength]);

  const totalPrice = useMemo(() => {
    if (priceType === "piece") {
      return product.price;
    }

    return area * product.price;
  }, [area, product.price, priceType]);

  const characteristics = [
    {
      label: "Артикул",
      value: product.article,
    },
    {
      label: "Колекція",
      value: product.collection,
    },
    {
      label: "Тип товару",
      value: product.productType
        ? productTypeNames[product.productType]
        : "",
    },
    {
      label: "Основа",
      value: product.base
        ? baseNames[product.base]
        : "",
    },
    {
      label: "Тип ворсу",
      value: product.pile
        ? pileNames[product.pile]
        : "",
    },
    {
      label: "Висота ворсу",
      value: formatMm(product.pileHeightMm),
    },
    {
      label: "Загальна висота",
      value: formatMm(product.totalHeightMm),
    },
    {
      label: "Матеріал",
      value: product.material
        ? materialNames[product.material]
        : "",
    },
    {
      label: "Форма",
      value: product.shape
        ? shapeNames[product.shape]
        : "",
    },
    {
      label: "Бренд",
      value: safeText(product.brand),
    },
    {
      label: "Країна",
      value: safeText(product.country),
    },
    {
      label: "Ширини",
      value:
        Array.isArray(product.widths) &&
        product.widths.length > 0
          ? `${product.widths.join(", ")} м`
          : "",
    },
    {
      label: "Кольори",
      value:
        Array.isArray(product.colors) &&
        product.colors.length > 0
          ? product.colors.join(", ")
          : "",
    },
  ].filter((item) => item.value);

  const styles =
    Array.isArray(product.styles) &&
    product.styles.length > 0
      ? product.styles
          .map((style) => styleNames[style])
          .filter(Boolean)
      : [];

  const rooms =
    Array.isArray(product.rooms) &&
    product.rooms.length > 0
      ? product.rooms
          .map((room) => roomNames[room])
          .filter(Boolean)
      : [];

  const features =
    Array.isArray(product.features) &&
    product.features.length > 0
      ? product.features
      : [];

  function handleAddToCart() {
    if (
      priceType === "square-meter" &&
      validLength <= 0
    ) {
      setMessage(
        "Вкажіть правильну довжину доріжки."
      );
      return;
    }

    const normalizedLength =
      Math.round(validLength * 100) / 100;

    const normalizedArea =
      Math.round(area * 100) / 100;

    const normalizedPrice =
      Math.round(totalPrice * 100) / 100;

    const cartItemId = [
      product.id,
      selectedWidth,
      normalizedLength,
      selectedColor,
      priceType,
    ].join("-");

    addToCart({
      id: cartItemId,
      productId: product.id,
      name: product.name,
      image: activeImage || availableImages[0] || "",
      color: selectedColor,
      unitPrice: product.price,
      price: normalizedPrice,
      width: selectedWidth,
      length:
        priceType === "piece" ? 1 : normalizedLength,
      area:
        priceType === "piece" ? 1 : normalizedArea,
    });

    setMessage("Товар додано до кошика!");
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "35px 20px 70px",
        background: "#f4f1ec",
        color: "#171717",
      }}
    >
      <div
        style={{
          maxWidth: "1350px",
          margin: "0 auto",
        }}
      >
        <div style={{ marginBottom: "25px" }}>
          <Link
            href="/catalog"
            style={{
              color: "#6d604f",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            ← Повернутися до каталогу
          </Link>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "45px",
            alignItems: "start",
          }}
        >
          <section>
            <div
              style={{
                position: "relative",
                width: "100%",
                aspectRatio: "1 / 1",
                overflow: "hidden",
                borderRadius: "24px",
                background: "#dedad4",
                boxShadow:
                  "0 15px 45px rgba(0, 0, 0, 0.08)",
              }}
            >
              {activeImage ? (
                <Image
                  src={activeImage}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 800px) 100vw, 50vw"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#777777",
                    fontSize: "18px",
                  }}
                >
                  Немає фотографії
                </div>
              )}

              <div
                style={{
                  position: "absolute",
                  top: "16px",
                  left: "16px",
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                {product.new && (
                  <span
                    style={{
                      padding: "8px 12px",
                      borderRadius: "9px",
                      background: "#111111",
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: "13px",
                    }}
                  >
                    Новинка
                  </span>
                )}

                {product.featured && (
                  <span
                    style={{
                      padding: "8px 12px",
                      borderRadius: "9px",
                      background: "#ad8d61",
                      color: "#ffffff",
                      fontWeight: 700,
                      fontSize: "13px",
                    }}
                  >
                    Рекомендований
                  </span>
                )}
              </div>
            </div>

            {availableImages.length > 1 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(85px, 1fr))",
                  gap: "12px",
                  marginTop: "15px",
                }}
              >
                {availableImages.map(
                  (image, index) => (
                    <button
                      key={`${image}-${index}`}
                      type="button"
                      onClick={() =>
                        setActiveImage(image)
                      }
                      style={{
                        position: "relative",
                        aspectRatio: "1 / 1",
                        padding: 0,
                        overflow: "hidden",
                        borderRadius: "12px",
                        border:
                          activeImage === image
                            ? "3px solid #111111"
                            : "2px solid transparent",
                        background: "#dedad4",
                        cursor: "pointer",
                      }}
                    >
                      <Image
                        src={image}
                        alt={`${product.name}, фото ${
                          index + 1
                        }`}
                        fill
                        sizes="100px"
                        style={{ objectFit: "cover" }}
                      />
                    </button>
                  )
                )}
              </div>
            )}
          </section>



          <section
            style={{
              padding: "35px",
              borderRadius: "24px",
              background: "#ffffff",
              boxShadow:
                "0 15px 45px rgba(0, 0, 0, 0.07)",
            }}
          >
            <p
              style={{
                margin: "0 0 8px",
                color: "#967a55",
                fontWeight: 800,
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {product.collection || "DreamCarpet"}
            </p>

            <h1
              style={{
                margin: "0 0 15px",
                fontSize: "clamp(34px, 5vw, 52px)",
                lineHeight: 1.05,
              }}
            >
              {product.name}
            </h1>

            <p
              style={{
                margin: "0 0 22px",
                color: "#777777",
              }}
            >
              Артикул: {product.article}
            </p>

            <div
              style={{
                marginBottom: "25px",
                padding: "18px",
                borderRadius: "15px",
                background: product.inStock
                  ? "#edf8ef"
                  : "#fff0f0",
              }}
            >
              <strong
                style={{
                  color: product.inStock
                    ? "#27783c"
                    : "#a62626",
                }}
              >
                {product.inStock
                  ? "✓ Товар у наявності"
                  : "Товару немає в наявності"}
              </strong>

              <div
                style={{
                  marginTop: "6px",
                  color: "#666666",
                }}
              >
                Час виготовлення:{" "}
                {product.productionTime ||
                  "Уточнюється"}
              </div>
            </div>

            <div style={{ marginBottom: "28px" }}>
              <span
                style={{
                  fontSize: "38px",
                  fontWeight: 900,
                }}
              >
                {formatNumber(product.price)} грн
              </span>

              <span
                style={{
                  color: "#777777",
                  fontSize: "17px",
                }}
              >
                {" "}
                / {priceTypeNames[priceType]}
              </span>
            </div>

            {product.colors?.length > 0 && (
              <div style={{ marginBottom: "25px" }}>
                <strong>Оберіть колір:</strong>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px",
                    marginTop: "10px",
                  }}
                >
                  {product.colors.map(
                    (color, index) => {
                      const isSelected =
                        selectedColor === color;

                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => {
                            setSelectedColor(color);
                            setMessage("");

                            if (availableImages[index]) {
                              setActiveImage(
                                availableImages[index]
                              );
                            }
                          }}
                          style={{
                            padding: "9px 14px",
                            borderRadius: "20px",
                            border: isSelected
                              ? "2px solid #111111"
                              : "1px solid #d4d4d4",
                            background: isSelected
                              ? "#111111"
                              : "#eeeeee",
                            color: isSelected
                              ? "#ffffff"
                              : "#111111",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          {color}
                        </button>
                      );
                    }
                  )}
                </div>

                <p
                  style={{
                    margin: "10px 0 0",
                    color: "#666666",
                  }}
                >
                  Вибрано:{" "}
                  <strong>{selectedColor}</strong>
                </p>
              </div>
            )}

            {priceType === "square-meter" && (
              <>
                <div style={{ marginBottom: "25px" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "10px",
                      fontWeight: 800,
                      fontSize: "17px",
                    }}
                  >
                    Оберіть ширину
                  </label>

                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                    }}
                  >
                    {availableWidths.map((width) => (
                      <button
                        key={width}
                        type="button"
                        onClick={() =>
                          setSelectedWidth(width)
                        }
                        style={{
                          minWidth: "70px",
                          padding: "12px 15px",
                          borderRadius: "10px",
                          border:
                            selectedWidth === width
                              ? "2px solid #111111"
                              : "1px solid #cccccc",
                          background:
                            selectedWidth === width
                              ? "#111111"
                              : "#ffffff",
                          color:
                            selectedWidth === width
                              ? "#ffffff"
                              : "#111111",
                          cursor: "pointer",
                          fontSize: "16px",
                          fontWeight: 700,
                        }}
                      >
                        {width} м
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: "25px" }}>
                  <label
                    htmlFor="product-length"
                    style={{
                      display: "block",
                      marginBottom: "10px",
                      fontWeight: 800,
                      fontSize: "17px",
                    }}
                  >
                    Вкажіть довжину
                  </label>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                    }}
                  >
                    <input
                      id="product-length"
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={length}
                      onChange={(event) => {
                        setLength(event.target.value);
                        setMessage("");
                      }}
                      style={{
                        width: "160px",
                        padding: "13px",
                        border: "1px solid #bbbbbb",
                        borderRadius: "10px",
                        background: "#ffffff",
                        color: "#111111",
                        fontSize: "17px",
                      }}
                    />

                    <strong>метрів</strong>
                  </div>
                </div>

                <div
                  style={{
                    marginBottom: "25px",
                    padding: "22px",
                    borderRadius: "17px",
                    background: "#f5f2ed",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      gap: "15px",
                      marginBottom: "10px",
                    }}
                  >
                    <span>Ширина:</span>
                    <strong>{selectedWidth} м</strong>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      gap: "15px",
                      marginBottom: "10px",
                    }}
                  >
                    <span>Довжина:</span>
                    <strong>
                      {validLength
                        ? formatNumber(validLength)
                        : 0}{" "}
                      м
                    </strong>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      gap: "15px",
                      marginBottom: "15px",
                    }}
                  >
                    <span>Площа:</span>
                    <strong>
                      {formatNumber(area)} м²
                    </strong>
                  </div>

                  <div
                    style={{
                      paddingTop: "15px",
                      borderTop:
                        "1px solid #d6d0c7",
                      display: "flex",
                      justifyContent:
                        "space-between",
                      alignItems: "center",
                      gap: "15px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "18px",
                        fontWeight: 700,
                      }}
                    >
                      Загальна ціна:
                    </span>

                    <strong
                      style={{
                        fontSize: "30px",
                      }}
                    >
                      {formatNumber(totalPrice)} грн
                    </strong>
                  </div>
                </div>
              </>
            )}

            {priceType === "piece" && (
              <div
                style={{
                  marginBottom: "25px",
                  padding: "22px",
                  borderRadius: "17px",
                  background: "#f5f2ed",
                }}
              >
                <span
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                  }}
                >
                  Ціна за товар:
                </span>

                <strong
                  style={{
                    display: "block",
                    marginTop: "10px",
                    fontSize: "30px",
                  }}
                >
                  {formatNumber(totalPrice)} грн
                </strong>
              </div>
            )}

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={
                !product.inStock ||
                (priceType === "square-meter" &&
                  validLength <= 0)
              }
              style={{
                width: "100%",
                padding: "17px",
                border: "none",
                borderRadius: "12px",
                background:
                  product.inStock &&
                  (priceType === "piece" ||
                    validLength > 0)
                    ? "#111111"
                    : "#999999",
                color: "#ffffff",
                fontSize: "18px",
                fontWeight: 800,
                cursor:
                  product.inStock &&
                  (priceType === "piece" ||
                    validLength > 0)
                    ? "pointer"
                    : "not-allowed",
              }}
            >
              {product.inStock
                ? "Додати в кошик"
                : "Немає в наявності"}
            </button>

            {message && (
              <div
                style={{
                  marginTop: "14px",
                  padding: "13px",
                  borderRadius: "10px",
                  background: message.includes(
                    "додано"
                  )
                    ? "#edf8ef"
                    : "#fff0f0",
                  color: message.includes("додано")
                    ? "#27783c"
                    : "#a62626",
                  fontWeight: 700,
                  textAlign: "center",
                }}
              >
                {message}

                {message.includes("додано") && (
                  <div style={{ marginTop: "10px" }}>
                    <Link
                      href="/cart"
                      style={{
                        color: "#111111",
                        fontWeight: 800,
                      }}
                    >
                      Перейти до кошика →
                    </Link>
                  </div>
                )}
              </div>
            )}

          </section>
        </div>

        <ProductCareBlock product={product} />

        <section
          style={{
            marginTop: "45px",
            padding: "35px",
            borderRadius: "24px",
            background: "#ffffff",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: "30px",
            }}
          >
            Характеристики
          </h2>

          {characteristics.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "12px",
              }}
            >
              {characteristics.map((item) => (
                <div
                  key={item.label}
                  style={{
                    padding: "16px",
                    borderRadius: "14px",
                    background: "#f5f2ed",
                  }}
                >
                  <div
                    style={{
                      color: "#777777",
                      fontSize: "14px",
                      marginBottom: "5px",
                    }}
                  >
                    {item.label}
                  </div>

                  <strong>{item.value}</strong>
                </div>
              ))}
            </div>
          ) : (
            <p>Характеристики поки не додані.</p>
          )}
        </section>

        {features.length > 0 && (
          <section
            style={{
              marginTop: "25px",
              padding: "35px",
              borderRadius: "24px",
              background: "#ffffff",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                fontSize: "30px",
              }}
            >
              Особливості
            </h2>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              {features.map((feature) => (
                <span
                  key={feature}
                  style={{
                    padding: "11px 14px",
                    borderRadius: "999px",
                    background: "#111111",
                    color: "#ffffff",
                    fontWeight: 700,
                  }}
                >
                  ✓ {feature}
                </span>
              ))}
            </div>
          </section>
        )}

        {(styles.length > 0 || rooms.length > 0) && (
          <section
            style={{
              marginTop: "25px",
              padding: "35px",
              borderRadius: "24px",
              background: "#ffffff",
            }}
          >
            <h2
              style={{
                marginTop: 0,
                fontSize: "30px",
              }}
            >
              Підходить для
            </h2>

            {rooms.length > 0 && (
              <>
                <h3>Приміщення</h3>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                    marginBottom: "22px",
                  }}
                >
                  {rooms.map((room) => (
                    <span
                      key={room}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "999px",
                        background: "#f5f2ed",
                        fontWeight: 700,
                      }}
                    >
                      {room}
                    </span>
                  ))}
                </div>
              </>
            )}

            {styles.length > 0 && (
              <>
                <h3>Стиль</h3>

                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "10px",
                  }}
                >
                  {styles.map((style) => (
                    <span
                      key={style}
                      style={{
                        padding: "10px 14px",
                        borderRadius: "999px",
                        background: "#f5f2ed",
                        fontWeight: 700,
                      }}
                    >
                      {style}
                    </span>
                  ))}
                </div>
              </>
            )}
          </section>
        )}

        <section
          style={{
            marginTop: "25px",
            padding: "35px",
            borderRadius: "24px",
            background: "#ffffff",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              fontSize: "30px",
            }}
          >
            Опис товару
          </h2>

          <div
            style={{
              color: "#555555",
              fontSize: "17px",
              lineHeight: 1.75,
              whiteSpace: "pre-line",
            }}
          >
            {product.description ||
              "Опис цього товару поки що не доданий."}
          </div>
        </section>
      </div>
    </main>
  );
}