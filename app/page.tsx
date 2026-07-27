"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import Header from "../components/Header";
import type { Product, ProductCategory } from "../types/product";

const categoryPrices: Record<ProductCategory, number> = {
  budget: 300,
  standard: 500,
  premium: 800,
  turkey: 700,
};

function formatNumber(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 0,
  }).format(value);
}

function parseNumber(value: string) {
  const number = Number(value.replace(",", "."));
  return Number.isFinite(number) ? number : 0;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [category, setCategory] =
    useState<ProductCategory>("budget");

  const [width, setWidth] = useState("1");
  const [length, setLength] = useState("2");

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
        console.error("Не вдалося завантажити товари:", error);
      } finally {
        setIsLoading(false);
      }
    }

    void loadProducts();
  }, []);

  const popularProducts = useMemo(() => {
    const featured = products.filter(
      (product) => product.featured && product.inStock
    );

    const source =
      featured.length > 0
        ? featured
        : products.filter((product) => product.inStock);

    return source.slice(0, 4);
  }, [products]);

  const unitPrice = useMemo(() => {
    const categoryProducts = products.filter(
      (product) =>
        product.category === category &&
        product.price > 0
    );

    if (categoryProducts.length === 0) {
      return categoryPrices[category];
    }

    const total = categoryProducts.reduce(
      (sum, product) => sum + product.price,
      0
    );

    return Math.round(total / categoryProducts.length);
  }, [products, category]);

  const area = useMemo(() => {
    const w = parseNumber(width);
    const l = parseNumber(length);

    if (w <= 0 || l <= 0) {
      return 0;
    }

    return w * l;
  }, [width, length]);

  const total = Math.round(area * unitPrice);

  return (
    <>
      <Header />

      <main className="page">
        <section className="hero">
          <div className="hero-box">
            <p className="label">DreamCarpet</p>

            <h1>
              Знайдіть килим або доріжку для дому за 1 хвилину
            </h1>

            <p className="hero-text">
              Перейдіть у каталог, оберіть розмір, колір,
              основу та одразу порахуйте ціну.
            </p>

            <div
              style={{
                position: "relative",
                zIndex: 5,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "16px",
                marginTop: "40px",
              }}
            >
              <Link
                href="/catalog"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "min(440px, 100%)",
                  minHeight: "78px",
                  padding: "0 42px",
                  borderRadius: "20px",
                  background:
                    "linear-gradient(135deg, #d4af37 0%, #ffd95a 100%)",
                  color: "#111111",
                  textDecoration: "none",
                  fontSize: "26px",
                  fontWeight: 900,
                  boxShadow:
                    "0 24px 60px rgba(212, 175, 55, 0.6)",
                  border: "2px solid #ffe27a",
                }}
              >
                🛒 Перейти до каталогу
              </Link>

              <Link
                href="/assistant"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "min(320px, 100%)",
                  minHeight: "54px",
                  padding: "0 28px",
                  borderRadius: "15px",
                  background: "rgba(255, 255, 255, 0.1)",
                  color: "#ffffff",
                  textDecoration: "none",
                  fontSize: "17px",
                  fontWeight: 800,
                  border: "1px solid #d4af37",
                }}
              >
                🤖 Підібрати з консультантом
              </Link>
            </div>
          </div>
        </section>

        <section className="choice-section">
          <h2>Що вам потрібно?</h2>

          <div className="choice-grid">
            <Link
              href="/catalog/category/budget"
              className="choice-card"
            >
              <span>🚪</span>

              <h3>Доріжка в коридор</h3>

              <p>
                Практичні варіанти, які легко чистити.
              </p>
            </Link>

            <Link
              href="/catalog/category/standard"
              className="choice-card"
            >
              <span>🏠</span>

              <h3>Килим у кімнату</h3>

              <p>
                Для спальні, вітальні або дитячої.
              </p>
            </Link>

            <Link
              href="/assistant"
              className="choice-card dark"
            >
              <span>🤖</span>

              <h3>Не знаю що вибрати</h3>

              <p>
                Напишіть консультанту — він підкаже.
              </p>
            </Link>
          </div>
        </section>

        <section className="category-section">
          <div className="section-title">
            <h2>Категорії</h2>

            <Link href="/catalog">
              Весь каталог →
            </Link>
          </div>

          <div className="category-grid">
            <Link href="/catalog/category/budget">
              Бюджетні
            </Link>

            <Link href="/catalog/category/standard">
              Середня якість
            </Link>

            <Link href="/catalog/category/premium">
              Преміум
            </Link>

            <Link href="/catalog/category/turkey">
              Турція якість
            </Link>
          </div>
        </section>

        <section className="calculator-section">
          <div className="calculator-text">
            <h2>Швидкий розрахунок ціни</h2>

            <p>
              Введіть ширину та довжину, щоб побачити
              приблизну вартість килима або доріжки.
            </p>
          </div>

          <div className="calculator-card">
            <label>
              Тип

              <select
                value={category}
                onChange={(event) =>
                  setCategory(
                    event.target.value as ProductCategory
                  )
                }
              >
                <option value="budget">Бюджетний</option>
                <option value="standard">Середній</option>
                <option value="premium">Преміум</option>
                <option value="turkey">Турція якість</option>
              </select>
            </label>

            <div className="inputs">
              <label>
                Ширина, м

                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={width}
                  onChange={(event) =>
                    setWidth(event.target.value)
                  }
                />
              </label>

              <label>
                Довжина, м

                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={length}
                  onChange={(event) =>
                    setLength(event.target.value)
                  }
                />
              </label>
            </div>

            <div className="total">
              <span>Орієнтовно:</span>

              <strong>
                {total > 0
                  ? `${formatNumber(total)} грн`
                  : "—"}
              </strong>
            </div>
          </div>
        </section>

        <section className="products-section">
          <div className="section-title">
            <h2>Популярні товари</h2>

            <Link href="/catalog">
              Дивитися всі →
            </Link>
          </div>

          {isLoading ? (
            <div className="empty">
              Завантаження товарів...
            </div>
          ) : popularProducts.length === 0 ? (
            <div className="empty">
              Додайте товари в адмінці, і вони з’являться тут.
            </div>
          ) : (
            <div className="products-grid">
              {popularProducts.map((product) => {
                const image = product.images?.[0] || "";

                return (
                  <Link
                    key={product.id}
                    href={`/catalog/${product.id}`}
                    className="product-card"
                  >
                    <div className="product-image">
                      {image ? (
                        <Image
                          src={image}
                          alt={product.name}
                          fill
                          sizes="280px"
                        />
                      ) : (
                        <div className="no-image">
                          Немає фото
                        </div>
                      )}
                    </div>

                    <div className="product-info">
                      <span>{product.article}</span>

                      <h3>{product.name}</h3>

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
              rgba(212, 175, 55, 0.28),
              transparent 28%
            ),
            linear-gradient(
              180deg,
              #f1dfbf 0%,
              #e9d2ad 45%,
              #d6b989 100%
            );
          color: #171717;
          padding-bottom: 70px;
        }

        .hero,
        .choice-section,
        .category-section,
        .calculator-section,
        .products-section {
          max-width: 1180px;
          margin: 0 auto;
          padding-left: 20px;
          padding-right: 20px;
        }

        .hero {
          padding-top: 55px;
          padding-bottom: 36px;
        }

        .hero-box {
          position: relative;
          overflow: hidden;
          border-radius: 34px;
          padding: 66px 36px;
          text-align: center;
          background:
            radial-gradient(
              circle at top right,
              rgba(212, 175, 55, 0.32),
              transparent 35%
            ),
            linear-gradient(
              135deg,
              #101010 0%,
              #181510 55%,
              #2a2114 100%
            );
          border: 1px solid rgba(212, 175, 55, 0.45);
          box-shadow: 0 30px 80px rgba(25, 18, 8, 0.28);
        }

        .hero-box::before {
          content: "";
          position: absolute;
          inset: 18px;
          border-radius: 26px;
          border: 1px solid rgba(212, 175, 55, 0.18);
          pointer-events: none;
        }

        .label {
          position: relative;
          z-index: 2;
          margin: 0 0 12px;
          color: #d4af37;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        h1 {
          position: relative;
          z-index: 2;
          max-width: 880px;
          margin: 0 auto;
          color: #ffffff;
          font-size: clamp(42px, 7vw, 74px);
          line-height: 0.98;
          letter-spacing: -2px;
        }

        .hero-text {
          position: relative;
          z-index: 2;
          max-width: 650px;
          margin: 22px auto 0;
          color: #eadfcf;
          font-size: 19px;
          line-height: 1.6;
        }

        .choice-section,
        .category-section,
        .calculator-section,
        .products-section {
          padding-top: 34px;
          padding-bottom: 34px;
        }

        h2 {
          margin: 0 0 22px;
          color: #171717;
          font-size: clamp(32px, 5vw, 50px);
          line-height: 1.05;
        }

        .choice-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
        }

        .choice-card {
          display: block;
          min-height: 200px;
          padding: 26px;
          border-radius: 26px;
          background: #fff2dc;
          border: 1px solid #b9892b;
          color: #171717;
          text-decoration: none;
          box-shadow: 0 18px 45px rgba(40, 30, 15, 0.12);
        }

        .choice-card.dark {
          background:
            radial-gradient(
              circle at top right,
              rgba(212, 175, 55, 0.28),
              transparent 40%
            ),
            #171717;
          color: #ffffff;
          border-color: #d4af37;
        }

        .choice-card span {
          display: block;
          font-size: 44px;
          margin-bottom: 16px;
        }

        .choice-card h3 {
          margin: 0 0 10px;
          font-size: 25px;
        }

        .choice-card p {
          margin: 0;
          color: #5e5245;
          line-height: 1.5;
          font-size: 16px;
        }

        .choice-card.dark p {
          color: #e6d8c1;
        }

        .section-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
          margin-bottom: 22px;
        }

        .section-title h2 {
          margin: 0;
        }

        .section-title a {
          color: #171717;
          font-size: 17px;
          font-weight: 900;
          text-decoration-color: #d4af37;
          text-decoration-thickness: 3px;
          text-underline-offset: 4px;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }

        .category-grid a {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 110px;
          padding: 18px;
          border-radius: 22px;
          background: #171717;
          border: 1px solid #d4af37;
          color: #ffffff;
          text-decoration: none;
          text-align: center;
          font-size: 21px;
          font-weight: 900;
          box-shadow: 0 18px 45px rgba(20, 15, 8, 0.2);
        }

        .calculator-section {
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 24px;
          align-items: center;
        }

        .calculator-text {
          padding: 32px;
          border-radius: 28px;
          background: rgba(255, 242, 220, 0.82);
          border: 1px solid rgba(185, 137, 43, 0.55);
          box-shadow: 0 18px 45px rgba(40, 30, 15, 0.08);
        }

        .calculator-text p {
          max-width: 560px;
          margin: 0;
          color: #5e5245;
          font-size: 18px;
          line-height: 1.6;
        }

        .calculator-card {
          display: grid;
          gap: 15px;
          padding: 24px;
          border-radius: 26px;
          background: #fff2dc;
          border: 1px solid #b9892b;
          box-shadow: 0 20px 50px rgba(40, 30, 15, 0.14);
        }

        label {
          display: grid;
          gap: 8px;
          font-weight: 900;
        }

        input,
        select {
          width: 100%;
          box-sizing: border-box;
          padding: 14px;
          border-radius: 13px;
          border: 1px solid #aa8136;
          background: #ffffff;
          color: #171717;
          font: inherit;
        }

        .inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .total {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          border-radius: 17px;
          padding: 17px;
          background: #171717;
          color: #ffffff;
          font-weight: 900;
        }

        .total strong {
          color: #ffd95a;
          font-size: 26px;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 18px;
        }

        .product-card {
          overflow: hidden;
          border-radius: 24px;
          background: #fff2dc;
          border: 1px solid #b9892b;
          color: #171717;
          text-decoration: none;
          box-shadow: 0 18px 45px rgba(40, 30, 15, 0.12);
        }

        .product-image {
          position: relative;
          height: 195px;
          background: #d2b27f;
        }

        .product-image :global(img) {
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
          gap: 8px;
          padding: 16px;
        }

        .product-info span {
          color: #9d721c;
          font-size: 13px;
          font-weight: 900;
        }

        .product-info h3 {
          margin: 0;
          font-size: 21px;
          line-height: 1.2;
        }

        .product-info strong {
          font-size: 21px;
          color: #171717;
        }

        .empty {
          padding: 30px;
          border-radius: 24px;
          background: #fff2dc;
          border: 1px dashed #aa8136;
          color: #5e5245;
          text-align: center;
          font-weight: 900;
        }

        @media (max-width: 950px) {
          .choice-grid,
          .calculator-section,
          .products-grid {
            grid-template-columns: 1fr;
          }

          .category-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 600px) {
          .hero-box {
            padding: 42px 20px;
          }

          h1 {
            letter-spacing: -1px;
          }

          .section-title {
            align-items: flex-start;
            flex-direction: column;
          }

          .category-grid {
            grid-template-columns: 1fr;
          }

          .inputs {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  );
}