"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import Header from "../../components/Header";
import type { Product, ProductCategory } from "../../types/product";

const categoryLabels: Record<ProductCategory, string> = {
  budget: "Бюджетні",
  standard: "Середня якість",
  premium: "Преміум",
  turkey: "Турція якість",
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 0,
  }).format(value);
}

function normalize(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replaceAll("ё", "е")
    .replaceAll("ї", "і");
}

function productToSearchText(product: Product) {
  return normalize(
    [
      product.name,
      product.article,
      product.collection,
      product.description,
      product.category,
      product.base,
      product.productType || "",
      product.pile || "",
      product.material || "",
      product.shape || "",
      product.brand || "",
      product.country || "",
      product.colors?.join(" ") || "",
      product.widths?.join(" ") || "",
      product.rooms?.join(" ") || "",
      product.styles?.join(" ") || "",
      product.features?.join(" ") || "",
      String(product.price),
    ].join(" ")
  );
}

export default function SearchPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<
    "all" | ProductCategory
  >("all");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    async function loadProducts() {
      try {
        const response = await fetch("/api/products", {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
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
        console.error(
          "Не вдалося завантажити товари:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    const search = normalize(query);
    const priceLimit = Number(maxPrice);

    return products.filter((product) => {
      if (!product.inStock) {
        return false;
      }

      if (
        category !== "all" &&
        product.category !== category
      ) {
        return false;
      }

      if (
        maxPrice.trim() !== "" &&
        Number.isFinite(priceLimit) &&
        product.price > priceLimit
      ) {
        return false;
      }

      if (search === "") {
        return true;
      }

      return productToSearchText(product).includes(search);
    });
  }, [products, query, category, maxPrice]);

  return (
    <>
      <Header />

      <main className="page">
        <section className="hero">
          <p className="label">Пошук DreamCarpet</p>

          <h1>Знайдіть потрібний килим швидко</h1>

          <p>
            Напишіть назву, колір, артикул, основу або
            бюджет. Наприклад: “сіра доріжка”, “резина”,
            “коридор”, “до 1500”.
          </p>
        </section>

        <section className="search-box">
          <label className="big-label">
            Що шукаємо?

            <input
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              placeholder="Наприклад: сіра доріжка в коридор"
              autoFocus
            />
          </label>

          <div className="filters">
            <label>
              Категорія

              <select
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value as
                      | "all"
                      | ProductCategory
                  )
                }
              >
                <option value="all">
                  Всі категорії
                </option>
                <option value="budget">Бюджетні</option>
                <option value="standard">
                  Середня якість
                </option>
                <option value="premium">Преміум</option>
                <option value="turkey">
                  Турція якість
                </option>
              </select>
            </label>

            <label>
              Максимальна ціна

              <input
                type="number"
                value={maxPrice}
                onChange={(event) =>
                  setMaxPrice(event.target.value)
                }
                placeholder="Наприклад: 1500"
              />
            </label>
          </div>

          <div className="result-line">
            {isLoading
              ? "Завантаження..."
              : `Знайдено товарів: ${filteredProducts.length}`}
          </div>
        </section>

        <section className="results">
          {isLoading ? (
            <div className="empty">
              Завантаження товарів...
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="empty">
              Нічого не знайдено. Спробуйте інший запит
              або відкрийте весь каталог.
              <br />
              <br />

              <Link href="/catalog">
                Перейти до каталогу
              </Link>
            </div>
          ) : (
            <div className="products">
              {filteredProducts.map((product) => {
                const image = product.images?.[0] || "";

                return (
                  <Link
                    key={product.id}
                    href={`/catalog/${product.id}`}
                    className="product-card"
                  >
                    <div className="image-box">
                      {image ? (
                        <Image
                          src={image}
                          alt={product.name}
                          fill
                          sizes="300px"
                        />
                      ) : (
                        <div className="no-image">
                          Немає фото
                        </div>
                      )}
                    </div>

                    <div className="product-info">
                      <span className="article">
                        {product.article}
                      </span>

                      <h2>{product.name}</h2>

                      <p>
                        {product.collection ||
                          "DreamCarpet"}
                      </p>

                      <div className="meta">
                        <span>
                          {categoryLabels[
                            product.category
                          ]}
                        </span>

                        <span>
                          {product.colors?.[0] ||
                            "Колір не вказано"}
                        </span>
                      </div>

                      <strong>
                        {formatNumber(product.price)} грн
                        {product.priceType === "piece"
                          ? " / шт."
                          : " / м²"}
                      </strong>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>
      </main>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at top left,
              rgba(212, 175, 55, 0.22),
              transparent 28%
            ),
            linear-gradient(
              180deg,
              #f1dfbf 0%,
              #e8d0a8 50%,
              #d6b989 100%
            );
          color: #171717;
          padding-bottom: 70px;
        }

        .hero,
        .search-box,
        .results {
          max-width: 1180px;
          margin: 0 auto;
          padding-left: 20px;
          padding-right: 20px;
        }

        .hero {
          padding-top: 50px;
          padding-bottom: 28px;
          text-align: center;
        }

        .label {
          margin: 0 0 12px;
          color: #9d721c;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        h1 {
          max-width: 820px;
          margin: 0 auto;
          font-size: clamp(38px, 6vw, 70px);
          line-height: 1;
          letter-spacing: -2px;
        }

        .hero p {
          max-width: 680px;
          margin: 20px auto 0;
          color: #5e5245;
          font-size: 18px;
          line-height: 1.6;
        }

        .search-box {
          display: grid;
          gap: 18px;
          margin-top: 10px;
          margin-bottom: 36px;
          padding-top: 28px;
          padding-bottom: 28px;
          border-radius: 30px;
          background: #171717;
          color: #ffffff;
          border: 1px solid #d4af37;
          box-shadow: 0 24px 65px rgba(25, 18, 8, 0.22);
        }

        .big-label {
          display: grid;
          gap: 10px;
          font-size: 22px;
          font-weight: 900;
        }

        .filters {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
        }

        label {
          display: grid;
          gap: 8px;
          font-weight: 800;
        }

        input,
        select {
          width: 100%;
          box-sizing: border-box;
          padding: 15px;
          border-radius: 14px;
          border: 1px solid #d4af37;
          background: #ffffff;
          color: #171717;
          font: inherit;
          outline: none;
        }

        input:focus,
        select:focus {
          box-shadow: 0 0 0 4px
            rgba(212, 175, 55, 0.22);
        }

        .result-line {
          color: #ffd95a;
          font-size: 18px;
          font-weight: 900;
        }

        .products {
          display: grid;
          grid-template-columns: repeat(
            auto-fill,
            minmax(260px, 1fr)
          );
          gap: 18px;
        }

        .product-card {
          overflow: hidden;
          border-radius: 24px;
          background: #fff2dc;
          border: 1px solid #b9892b;
          color: #171717;
          text-decoration: none;
          box-shadow: 0 18px 45px
            rgba(40, 30, 15, 0.12);
          transition:
            transform 0.2s ease,
            box-shadow 0.2s ease;
        }

        .product-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 25px 60px
            rgba(40, 30, 15, 0.18);
        }

        .image-box {
          position: relative;
          height: 210px;
          background: #d2b27f;
        }

        .image-box :global(img) {
          object-fit: cover;
        }

        .no-image {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #5e5245;
          font-weight: 900;
        }

        .product-info {
          display: grid;
          gap: 9px;
          padding: 16px;
        }

        .article {
          color: #9d721c;
          font-size: 13px;
          font-weight: 900;
        }

        .product-info h2 {
          margin: 0;
          font-size: 22px;
          line-height: 1.15;
        }

        .product-info p {
          margin: 0;
          color: #5e5245;
        }

        .meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .meta span {
          border-radius: 999px;
          background: #171717;
          color: #ffffff;
          padding: 7px 10px;
          font-size: 12px;
          font-weight: 800;
        }

        .product-info strong {
          font-size: 22px;
        }

        .empty {
          padding: 32px;
          border-radius: 24px;
          background: #fff2dc;
          border: 1px dashed #aa8136;
          color: #5e5245;
          text-align: center;
          font-weight: 900;
          line-height: 1.6;
        }

        .empty a {
          color: #171717;
          font-weight: 900;
        }

        @media (max-width: 700px) {
          .filters {
            grid-template-columns: 1fr;
          }

          h1 {
            letter-spacing: -1px;
          }

          .search-box {
            border-radius: 24px;
          }
        }
      `}</style>
    </>
  );
}