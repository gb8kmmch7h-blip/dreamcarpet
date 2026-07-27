"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useCart } from "../../context/CartContext";
import type {
  Product,
  ProductBase,
  ProductPriceType,
} from "../../types/product";

const baseNames: Record<ProductBase, string> = {
  felt: "Повстяна",
  jute: "Джутова",
  woven: "Ткана",
  latex: "Латексна",
  stitched: "Прошита",
};

const priceTypeNames: Record<ProductPriceType, string> = {
  "square-meter": "м²",
  piece: "шт.",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 0,
  }).format(value);
}

export default function FavoritesPage() {
  const {
    favoriteProductIds,
    removeFromFavorites,
    clearFavorites,
    isFavoritesLoaded,
  } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] =
    useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true);
        setErrorMessage("");

        const response = await fetch("/api/products", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            "Не вдалося завантажити товари."
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
      } catch (error) {
        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Сталася помилка."
        );
      } finally {
        setLoading(false);
      }
    }

    void loadProducts();
  }, []);

  const favoriteProducts = useMemo(() => {
    return favoriteProductIds
      .map((id) =>
        products.find((product) => product.id === id)
      )
      .filter(
        (product): product is Product =>
          product !== undefined
      );
  }, [favoriteProductIds, products]);

  if (!isFavoritesLoaded || loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "70px 20px",
          background: "#f5f2ec",
          color: "#181714",
        }}
      >
        <section
          style={{
            width: "min(900px, 100%)",
            margin: "0 auto",
            padding: "40px",
            borderRadius: "26px",
            background: "#ffffff",
            textAlign: "center",
          }}
        >
          Завантаження вибраних товарів...
        </section>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "50px 20px 70px",
        background: "#f5f2ec",
        color: "#181714",
      }}
    >
      <section
        style={{
          width: "min(1300px, 100%)",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
            alignItems: "flex-end",
            flexWrap: "wrap",
            marginBottom: "30px",
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
              DreamCarpet
            </p>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(34px, 5vw, 56px)",
                lineHeight: 1,
              }}
            >
              Вибрані товари
            </h1>

            <p
              style={{
                margin: "16px 0 0",
                color: "#6f6a62",
                fontSize: "18px",
              }}
            >
              Тут зберігаються килими й доріжки,
              які ви додали через ❤️.
            </p>
          </div>

          {favoriteProducts.length > 0 && (
            <button
              type="button"
              onClick={clearFavorites}
              style={{
                padding: "12px 16px",
                borderRadius: "12px",
                border: "1px solid #d8b6b6",
                background: "#fff0f0",
                color: "#a32323",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Очистити вибране
            </button>
          )}
        </div>

        {errorMessage && (
          <div
            style={{
              padding: "15px",
              borderRadius: "14px",
              background: "#fff0f0",
              color: "#a32323",
              fontWeight: 800,
              marginBottom: "20px",
            }}
          >
            {errorMessage}
          </div>
        )}

        {favoriteProducts.length === 0 ? (
          <div
            style={{
              maxWidth: "850px",
              margin: "0 auto",
              padding: "45px 25px",
              borderRadius: "26px",
              background: "#ffffff",
              boxShadow:
                "0 14px 35px rgba(44, 36, 24, 0.06)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontSize: "54px",
                marginBottom: "18px",
              }}
            >
              ❤️
            </div>

            <h2
              style={{
                margin: "0 0 12px",
                fontSize: "34px",
              }}
            >
              Поки що вибраних товарів немає
            </h2>

            <p
              style={{
                maxWidth: "620px",
                margin: "0 auto 28px",
                color: "#6f6a62",
                fontSize: "18px",
                lineHeight: 1.6,
              }}
            >
              Перейдіть у каталог і додайте товари у
              вибране, щоб швидко повернутися до них
              пізніше.
            </p>

            <Link
              href="/catalog"
              style={{
                display: "inline-flex",
                padding: "14px 18px",
                borderRadius: "12px",
                background: "#181714",
                color: "#ffffff",
                textDecoration: "none",
                fontWeight: 900,
              }}
            >
              Перейти в каталог →
            </Link>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fill, minmax(260px, 1fr))",
              gap: "18px",
            }}
          >
            {favoriteProducts.map((product) => {
              const image =
                Array.isArray(product.images) &&
                product.images.length > 0
                  ? product.images[0]
                  : "";

              const priceType =
                product.priceType ?? "square-meter";

              return (
                <article
                  key={product.id}
                  style={{
                    overflow: "hidden",
                    borderRadius: "22px",
                    border: "1px solid #ded7ca",
                    background: "#ffffff",
                    boxShadow:
                      "0 14px 35px rgba(44, 36, 24, 0.06)",
                  }}
                >
                  <Link
                    href={`/catalog/${product.id}`}
                    style={{
                      display: "block",
                      color: "#181714",
                      textDecoration: "none",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        aspectRatio: "1.15 / 1",
                        background: "#eeeae2",
                      }}
                    >
                      {image ? (
                        <Image
                          src={image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 100vw, 300px"
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
                            fontWeight: 800,
                          }}
                        >
                          Немає фото
                        </div>
                      )}
                    </div>
                  </Link>

                  <div
                    style={{
                      display: "grid",
                      gap: "10px",
                      padding: "16px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: "10px",
                        alignItems: "center",
                      }}
                    >
                      <span
                        style={{
                          color: "#8a7656",
                          fontSize: "13px",
                          fontWeight: 900,
                        }}
                      >
                        {product.article}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          removeFromFavorites(product.id)
                        }
                        style={{
                          border: "none",
                          borderRadius: "999px",
                          background: "#fff0f0",
                          color: "#a32323",
                          padding: "8px 11px",
                          cursor: "pointer",
                          fontWeight: 900,
                        }}
                      >
                        Прибрати
                      </button>
                    </div>

                    <Link
                      href={`/catalog/${product.id}`}
                      style={{
                        color: "#181714",
                        textDecoration: "none",
                      }}
                    >
                      <h2
                        style={{
                          margin: 0,
                          fontSize: "22px",
                          lineHeight: 1.15,
                        }}
                      >
                        {product.name}
                      </h2>
                    </Link>

                    <p
                      style={{
                        margin: 0,
                        color: "#8a7656",
                        fontWeight: 800,
                      }}
                    >
                      {product.collection || "DreamCarpet"}
                    </p>

                    <div
                      style={{
                        display: "grid",
                        gap: "5px",
                        borderRadius: "14px",
                        background: "#f8f5ef",
                        padding: "12px",
                        color: "#4d4942",
                        fontSize: "14px",
                      }}
                    >
                      <span>
                        Основа:{" "}
                        {baseNames[product.base] ??
                          product.base}
                      </span>

                      {product.colors?.length > 0 && (
                        <span>
                          Колір:{" "}
                          {product.colors.join(", ")}
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        gap: "5px",
                        marginTop: "4px",
                      }}
                    >
                      <strong
                        style={{
                          fontSize: "24px",
                        }}
                      >
                        {formatNumber(product.price)} грн
                      </strong>

                      <span
                        style={{
                          color: "#716d65",
                          fontWeight: 700,
                        }}
                      >
                        / {priceTypeNames[priceType]}
                      </span>
                    </div>

                    <Link
                      href={`/catalog/${product.id}`}
                      style={{
                        display: "inline-flex",
                        justifyContent: "center",
                        padding: "12px 14px",
                        borderRadius: "12px",
                        background: "#181714",
                        color: "#ffffff",
                        textDecoration: "none",
                        fontWeight: 900,
                      }}
                    >
                      Переглянути товар →
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}