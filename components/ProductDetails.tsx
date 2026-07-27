"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import FavoriteButton from "./FavoriteButton";
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

const shapeNames: Record<ProductShape, string> = {
  runner: "Доріжка",
  rectangle: "Прямокутник",
  square: "Квадрат",
  round: "Круглий",
  oval: "Овальний",
  custom: "Індивідуальна форма",
};

const priceTypeNames: Record<ProductPriceType, string> = {
  "square-meter": "м²",
  piece: "шт.",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

function getMeters(value: number) {
  if (value > 20) {
    return value / 100;
  }

  return value;
}

function formatWidth(value: number) {
  if (value > 20) {
    return `${formatNumber(value)} см`;
  }

  return `${formatNumber(value)} м`;
}

function getProductType(product: Product): ProductType {
  return product.productType ?? "runner";
}

function getProductPile(product: Product): ProductPile {
  return product.pile ?? "flat";
}

function getProductPriceType(
  product: Product
): ProductPriceType {
  return product.priceType ?? "square-meter";
}

export default function ProductDetails({
  product,
  relatedProducts = [],
}: ProductDetailsProps) {
  const { addToCart } = useCart();

  const images =
    Array.isArray(product.images) &&
    product.images.length > 0
      ? product.images
      : [];

  const mainImage = images[0] || "";
  const [selectedImage, setSelectedImage] =
    useState(mainImage);

  const colors =
    Array.isArray(product.colors) &&
    product.colors.length > 0
      ? product.colors
      : ["Не вказано"];

  const widths =
    Array.isArray(product.widths) &&
    product.widths.length > 0
      ? product.widths
      : [1];

  const lengths =
    Array.isArray(product.lengths) &&
    product.lengths.length > 0
      ? product.lengths
      : [];

  const priceType = getProductPriceType(product);
  const productType = getProductType(product);
  const productPile = getProductPile(product);

  const [selectedColor, setSelectedColor] =
    useState(colors[0]);

  const [selectedWidth, setSelectedWidth] =
    useState(widths[0]);

  const [length, setLength] = useState(
    lengths.length > 0 ? lengths[0] : 1
  );

  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState("");

  const widthInMeters = getMeters(selectedWidth);

  const area = useMemo(() => {
    if (priceType === "piece") {
      return 1;
    }

    return Math.max(widthInMeters * length, 0);
  }, [priceType, widthInMeters, length]);

  const itemPrice = useMemo(() => {
    if (priceType === "piece") {
      return product.price;
    }

    return Math.round(product.price * area);
  }, [priceType, product.price, area]);

  const totalPrice = itemPrice * quantity;

  const features = product.features ?? [];
  const rooms = product.rooms ?? [];
  const styles = product.styles ?? [];

  function handleAddToCart() {
    const safeLength =
      priceType === "piece" ? 1 : length;

    const safeArea =
      priceType === "piece" ? 1 : area;

    const cartId = [
      product.id,
      selectedColor,
      selectedWidth,
      safeLength,
      priceType,
    ].join("-");

    addToCart({
      id: cartId,
      productId: product.id,
      name: product.name,
      image: mainImage,
      color: selectedColor,
      unitPrice: product.price,
      price: itemPrice,
      width: widthInMeters,
      length: safeLength,
      area: safeArea,
    });

    setMessage("Товар додано до кошика ✅");

    window.setTimeout(() => {
      setMessage("");
    }, 2500);
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "45px 20px 80px",
        background: "#f5f2ec",
        color: "#181714",
      }}
    >
      <section
        style={{
          width: "min(1350px, 100%)",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "8px",
            alignItems: "center",
            marginBottom: "22px",
            color: "#6f6a62",
            fontSize: "14px",
          }}
        >
          <Link
            href="/catalog"
            style={{
              color: "#6d604f",
              fontWeight: 800,
              textDecoration: "none",
            }}
          >
            Каталог
          </Link>

          <span>/</span>

          <span>{product.name}</span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1.1fr) minmax(340px, 0.9fr)",
            gap: "28px",
            alignItems: "start",
          }}
          className="product-top"
        >
          <div
            style={{
              display: "grid",
              gap: "14px",
            }}
          >
            <div
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: "26px",
                background: "#eeeae2",
                border: "1px solid #ded7ca",
                aspectRatio: "1.15 / 1",
              }}
            >
              {selectedImage ? (
                <Image
                  src={selectedImage}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 900px) 100vw, 650px"
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
                    color: "#777169",
                    fontWeight: 900,
                    fontSize: "22px",
                  }}
                >
                  Немає фото
                </div>
              )}

              <div
                style={{
                  position: "absolute",
                  top: "14px",
                  left: "14px",
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                {product.new && (
                  <span style={badgeStyle}>
                    Новинка
                  </span>
                )}

                {product.featured && (
                  <span style={badgeStyle}>Топ</span>
                )}
              </div>
            </div>

            {images.length > 1 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fill, minmax(90px, 1fr))",
                  gap: "10px",
                }}
              >
                {images.map((image) => (
                  <button
                    key={image}
                    type="button"
                    onClick={() => setSelectedImage(image)}
                    style={{
                      position: "relative",
                      overflow: "hidden",
                      aspectRatio: "1 / 1",
                      borderRadius: "14px",
                      border:
                        selectedImage === image
                          ? "3px solid #d4af37"
                          : "1px solid #ded7ca",
                      background: "#eeeae2",
                      cursor: "pointer",
                    }}
                  >
                    <Image
                      src={image}
                      alt={product.name}
                      fill
                      sizes="120px"
                      style={{
                        objectFit: "cover",
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <aside
            style={{
              display: "grid",
              gap: "20px",
              padding: "28px",
              borderRadius: "26px",
              background: "#ffffff",
              border: "1px solid #ded7ca",
              boxShadow:
                "0 14px 35px rgba(44, 36, 24, 0.06)",
            }}
          >
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: "14px",
                  marginBottom: "14px",
                }}
              >
                <div>
                  <p
                    style={{
                      margin: "0 0 8px",
                      color: "#8a7656",
                      fontSize: "13px",
                      fontWeight: 900,
                      letterSpacing: "1.2px",
                      textTransform: "uppercase",
                    }}
                  >
                    {product.article}
                  </p>

                  <h1
                    style={{
                      margin: 0,
                      fontSize:
                        "clamp(34px, 5vw, 54px)",
                      lineHeight: 1.05,
                    }}
                  >
                    {product.name}
                  </h1>
                </div>

                <FavoriteButton
                  productId={product.id}
                  variant="inline"
                />
              </div>

              <p
                style={{
                  margin: "14px 0 0",
                  color: "#6f6a62",
                  fontSize: "17px",
                  lineHeight: 1.6,
                }}
              >
                {product.description}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: "7px",
                padding: "18px",
                borderRadius: "18px",
                background: "#f8f5ef",
              }}
            >
              <strong
                style={{
                  fontSize: "36px",
                }}
              >
                {formatNumber(product.price)} грн
              </strong>

              <span
                style={{
                  color: "#716d65",
                  fontWeight: 800,
                }}
              >
                / {priceTypeNames[priceType]}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gap: "15px",
              }}
            >
              <label style={labelStyle}>
                <span style={labelTextStyle}>
                  Колір
                </span>

                <select
                  value={selectedColor}
                  onChange={(event) =>
                    setSelectedColor(
                      event.target.value
                    )
                  }
                  style={inputStyle}
                >
                  {colors.map((color) => (
                    <option key={color} value={color}>
                      {color}
                    </option>
                  ))}
                </select>
              </label>

              <label style={labelStyle}>
                <span style={labelTextStyle}>
                  Ширина
                </span>

                <select
                  value={selectedWidth}
                  onChange={(event) =>
                    setSelectedWidth(
                      Number(event.target.value)
                    )
                  }
                  style={inputStyle}
                >
                  {widths.map((width) => (
                    <option
                      key={width}
                      value={width}
                    >
                      {formatWidth(width)}
                    </option>
                  ))}
                </select>
              </label>

              {priceType === "square-meter" && (
                <label style={labelStyle}>
                  <span style={labelTextStyle}>
                    Довжина, м
                  </span>

                  {lengths.length > 0 ? (
                    <select
                      value={length}
                      onChange={(event) =>
                        setLength(
                          Number(event.target.value)
                        )
                      }
                      style={inputStyle}
                    >
                      {lengths.map((itemLength) => (
                        <option
                          key={itemLength}
                          value={itemLength}
                        >
                          {formatNumber(itemLength)} м
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={length}
                      onChange={(event) =>
                        setLength(
                          Number(event.target.value)
                        )
                      }
                      style={inputStyle}
                    />
                  )}
                </label>
              )}

              <label style={labelStyle}>
                <span style={labelTextStyle}>
                  Кількість
                </span>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(event) =>
                    setQuantity(
                      Math.max(
                        1,
                        Number(event.target.value)
                      )
                    )
                  }
                  style={inputStyle}
                />
              </label>
            </div>

            <div
              style={{
                display: "grid",
                gap: "8px",
                padding: "18px",
                borderRadius: "18px",
                background: "#f5f2ec",
                color: "#4d4942",
                fontWeight: 800,
              }}
            >
              {priceType === "square-meter" && (
                <>
                  <div style={summaryRowStyle}>
                    <span>Площа</span>
                    <strong>
                      {formatNumber(area)} м²
                    </strong>
                  </div>

                  <div style={summaryRowStyle}>
                    <span>Ціна за позицію</span>
                    <strong>
                      {formatNumber(itemPrice)} грн
                    </strong>
                  </div>
                </>
              )}

              <div style={summaryRowStyle}>
                <span>Разом</span>
                <strong
                  style={{
                    fontSize: "26px",
                  }}
                >
                  {formatNumber(totalPrice)} грн
                </strong>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.inStock}
              style={{
                padding: "16px",
                border: "none",
                borderRadius: "14px",
                background: product.inStock
                  ? "#181714"
                  : "#999999",
                color: "#ffffff",
                fontSize: "18px",
                fontWeight: 900,
                cursor: product.inStock
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
                  padding: "13px",
                  borderRadius: "12px",
                  background: "#ecf9f0",
                  color: "#216d38",
                  fontWeight: 900,
                  textAlign: "center",
                }}
              >
                {message}
              </div>
            )}

            <Link
              href="/cart"
              style={{
                textAlign: "center",
                color: "#181714",
                fontWeight: 800,
              }}
            >
              Перейти до кошика →
            </Link>
          </aside>
        </div>

        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>
            Характеристики
          </h2>

          <div style={characteristicsGridStyle}>
            <Characteristic
              label="Колекція"
              value={product.collection}
            />

            <Characteristic
              label="Артикул"
              value={product.article}
            />

            <Characteristic
              label="Основа"
              value={baseNames[product.base]}
            />

            <Characteristic
              label="Тип товару"
              value={productTypeNames[productType]}
            />

            <Characteristic
              label="Ворс"
              value={pileNames[productPile]}
            />

            {product.pileHeightMm ? (
              <Characteristic
                label="Висота ворсу"
                value={`${product.pileHeightMm} мм`}
              />
            ) : null}

            {product.totalHeightMm ? (
              <Characteristic
                label="Загальна висота"
                value={`${product.totalHeightMm} мм`}
              />
            ) : null}

            {product.material ? (
              <Characteristic
                label="Матеріал"
                value={materialNames[product.material]}
              />
            ) : null}

            {product.shape ? (
              <Characteristic
                label="Форма"
                value={shapeNames[product.shape]}
              />
            ) : null}

            {product.brand ? (
              <Characteristic
                label="Бренд"
                value={product.brand}
              />
            ) : null}

            {product.country ? (
              <Characteristic
                label="Країна"
                value={product.country}
              />
            ) : null}

            <Characteristic
              label="Час виготовлення"
              value={product.productionTime}
            />

            <Characteristic
              label="Наявність"
              value={
                product.inStock
                  ? "В наявності"
                  : "Немає в наявності"
              }
            />
          </div>
        </section>

        {features.length > 0 && (
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              Особливості
            </h2>

            <div style={tagGridStyle}>
              {features.map((feature) => (
                <span key={feature} style={tagStyle}>
                  {feature}
                </span>
              ))}
            </div>
          </section>
        )}

        {(styles.length > 0 || rooms.length > 0) && (
          <section style={sectionStyle}>
            <h2 style={sectionTitleStyle}>
              Підходить для
            </h2>

            <div
              style={{
                display: "grid",
                gap: "18px",
              }}
            >
              {rooms.length > 0 && (
                <div>
                  <h3 style={miniTitleStyle}>
                    Кімнати
                  </h3>

                  <div style={tagGridStyle}>
                    {rooms.map((room) => (
                      <span
                        key={room}
                        style={tagStyle}
                      >
                        {roomNames[room]}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {styles.length > 0 && (
                <div>
                  <h3 style={miniTitleStyle}>
                    Стилі
                  </h3>

                  <div style={tagGridStyle}>
                    {styles.map((style) => (
                      <span
                        key={style}
                        style={tagStyle}
                      >
                        {styleNames[style]}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        <ProductCareBlock product={product} />

        <RelatedProducts products={relatedProducts} />

        <section style={sectionStyle}>
          <h2 style={sectionTitleStyle}>
            Опис товару
          </h2>

          <p
            style={{
              margin: 0,
              color: "#4d4942",
              fontSize: "17px",
              lineHeight: 1.7,
            }}
          >
            {product.description}
          </p>
        </section>
      </section>

      <style jsx>{`
        @media (max-width: 950px) {
          .product-top {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}

function Characteristic({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  if (!value) {
    return null;
  }

  return (
    <div
      style={{
        padding: "14px",
        borderRadius: "14px",
        background: "#f8f5ef",
      }}
    >
      <span
        style={{
          display: "block",
          marginBottom: "5px",
          color: "#8a7656",
          fontSize: "13px",
          fontWeight: 900,
        }}
      >
        {label}
      </span>

      <strong>{value}</strong>
    </div>
  );
}

const badgeStyle = {
  borderRadius: "999px",
  background: "#181714",
  color: "#ffffff",
  padding: "7px 10px",
  fontSize: "12px",
  fontWeight: 900,
};

const labelStyle = {
  display: "grid",
  gap: "7px",
};

const labelTextStyle = {
  fontSize: "13px",
  fontWeight: 900,
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  border: "1px solid #d8d0c3",
  borderRadius: "12px",
  background: "#ffffff",
  color: "#181714",
  padding: "12px 13px",
  font: "inherit",
  outline: "none",
};

const summaryRowStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "15px",
};

const sectionStyle = {
  marginTop: "28px",
  padding: "26px",
  borderRadius: "24px",
  background: "#ffffff",
  border: "1px solid #ded7ca",
  boxShadow: "0 14px 35px rgba(44, 36, 24, 0.06)",
};

const sectionTitleStyle = {
  margin: "0 0 18px",
  fontSize: "30px",
};

const characteristicsGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(210px, 1fr))",
  gap: "12px",
};

const tagGridStyle = {
  display: "flex",
  flexWrap: "wrap" as const,
  gap: "10px",
};

const tagStyle = {
  display: "inline-flex",
  borderRadius: "999px",
  background: "#f5f2ec",
  color: "#4d4942",
  padding: "10px 13px",
  fontWeight: 800,
};

const miniTitleStyle = {
  margin: "0 0 10px",
  fontSize: "20px",
};