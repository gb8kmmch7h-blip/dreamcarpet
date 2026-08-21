import Image from "next/image";
import Link from "next/link";

import { getAllProducts } from "../../lib/getAllProducts";
import { getCatalogSettings } from "../../lib/getCatalogSettings";

export const dynamic = "force-dynamic";

const categoryDescriptions: Record<string, string> = {
  budget:
    "Практичні та доступні килими для кухні, коридору й інших кімнат.",

  standard:
    "Надійні килими з хорошою щільністю та приємним ворсом.",

  premium:
    "Стильні килими підвищеної якості для сучасного інтер’єру.",

  turkey:
    "Якісні турецькі килими з виразним дизайном і щільним ворсом.",
};

export default async function CatalogPage() {
  const products = await getAllProducts();
  const settings = await getCatalogSettings();

  const categories = settings.categories.filter(
    (category) => category.active
  );

  return (
    <main className="catalog-page">
      <div className="catalog-container">
        <nav className="breadcrumbs">
          <Link href="/">Головна</Link>

          <span>/</span>

          <strong>Каталог</strong>
        </nav>

        <header className="catalog-header">
          <p className="eyebrow">
            DreamCarpet
          </p>

          <h1>Оберіть категорію</h1>

          <p className="subtitle">
            Перейдіть до потрібного розділу,
            щоб переглянути доступні килими
            та доріжки.
          </p>
        </header>

        {categories.length === 0 ? (
          <div className="empty-categories">
            Активних категорій поки немає.
          </div>
        ) : (
          <section className="categories-grid">
            {categories.map(
              (category, index) => {
                const categoryProducts =
                  products.filter(
                    (product) =>
                      String(
                        product.category
                      ) === category.value
                  );

                const categoryImage =
                  categoryProducts.find(
                    (product) =>
                      Array.isArray(
                        product.images
                      ) &&
                      product.images.length >
                        0
                  )?.images?.[0] ?? null;

                const description =
                  categoryDescriptions[
                    category.value
                  ] ??
                  `Перегляньте товари категорії «${category.label}» у каталозі DreamCarpet.`;

                return (
                  <Link
                    href={`/catalog/category/${category.value}`}
                    className="category-card"
                    key={category.value}
                  >
                    <div className="category-image">
                      {categoryImage ? (
                        <Image
                          src={categoryImage}
                          alt={
                            category.label
                          }
                          fill
                          priority={index < 2}
                          sizes="(max-width: 700px) 100vw, 50vw"
                          style={{
                            objectFit:
                              "cover",
                          }}
                        />
                      ) : (
                        <div className="placeholder">
                          <span>
                            DreamCarpet
                          </span>
                        </div>
                      )}

                      <div className="overlay" />

                      <div className="category-number">
                        {String(
                          index + 1
                        ).padStart(2, "0")}
                      </div>

                      <div className="category-content">
                        <span className="products-count">
                          Товарів:{" "}
                          {
                            categoryProducts.length
                          }
                        </span>

                        <h2>
                          {
                            category.label
                          }
                        </h2>

                        <p>
                          {description}
                        </p>

                        <div className="open-button">
                          Переглянути
                          товари
                          <span>→</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              }
            )}
          </section>
        )}
      </div>

      <style>{`
        .catalog-page {
          min-height: 100vh;
          padding: 28px 20px 70px;
          background: #f4f1ec;
          color: #181714;
        }

        .catalog-container {
          width: min(1400px, 100%);
          margin: 0 auto;
        }

        .breadcrumbs {
          display: flex;
          gap: 10px;
          margin-bottom: 42px;
          color: #8b857c;
          font-size: 14px;
        }

        .breadcrumbs a {
          color: #71695f;
          text-decoration: none;
        }

        .breadcrumbs strong {
          color: #181714;
        }

        .catalog-header {
          max-width: 800px;
          margin-bottom: 38px;
        }

        .eyebrow {
          margin: 0 0 10px;
          color: #967b55;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 2px;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          font-size: clamp(
            38px,
            6vw,
            66px
          );
          line-height: 1.05;
        }

        .subtitle {
          max-width: 700px;
          margin: 18px 0 0;
          color: #6d6860;
          font-size: 18px;
          line-height: 1.6;
        }

        .empty-categories {
          padding: 30px;
          border-radius: 20px;
          background: #ffffff;
          border: 1px solid #e2ddd4;
          font-weight: 700;
        }

        .categories-grid {
          display: grid;
          grid-template-columns:
            repeat(
              2,
              minmax(0, 1fr)
            );
          gap: 24px;
        }

        .category-card {
          overflow: hidden;
          min-height: 430px;
          border-radius: 26px;
          background: #d8d1c7;
          color: #ffffff;
          text-decoration: none;
          box-shadow:
            0 18px 45px
            rgba(
              37,
              30,
              21,
              0.12
            );
        }

        .category-image {
          position: relative;
          width: 100%;
          height: 100%;
          min-height: 430px;
          overflow: hidden;
        }

        .category-image img {
          transition:
            transform
            0.6s ease;
        }

        .category-card:hover
          .category-image
          img {
          transform:
            scale(1.06);
        }

        .placeholder {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;

          background:
            linear-gradient(
              135deg,
              #a99578,
              #55493b
            );
        }

        .placeholder span {
          opacity: 0.3;

          font-size:
            clamp(
              28px,
              5vw,
              55px
            );

          font-weight: 900;
          letter-spacing: 4px;
        }

        .overlay {
          position: absolute;
          inset: 0;

          background:
            linear-gradient(
              to top,
              rgba(
                14,
                13,
                11,
                0.92
              )
                0%,
              rgba(
                14,
                13,
                11,
                0.4
              )
                58%,
              rgba(
                14,
                13,
                11,
                0.1
              )
                100%
            );
        }

        .category-number {
          position: absolute;
          top: 24px;
          right: 26px;
          z-index: 2;

          color:
            rgba(
              255,
              255,
              255,
              0.7
            );

          font-size: 20px;
          font-weight: 900;
        }

        .category-content {
          position: absolute;
          right: 0;
          bottom: 0;
          left: 0;
          z-index: 2;
          padding: 32px;
        }

        .products-count {
          display: inline-flex;
          margin-bottom: 14px;

          border:
            1px solid
            rgba(
              255,
              255,
              255,
              0.35
            );

          border-radius: 999px;
          padding: 7px 11px;

          background:
            rgba(
              0,
              0,
              0,
              0.25
            );

          font-size: 12px;
          font-weight: 800;

          backdrop-filter:
            blur(8px);
        }

        .category-content h2 {
          margin: 0 0 12px;

          font-size:
            clamp(
              28px,
              4vw,
              42px
            );
        }

        .category-content p {
          max-width: 530px;
          margin: 0 0 22px;

          color:
            rgba(
              255,
              255,
              255,
              0.82
            );

          line-height: 1.55;
        }

        .open-button {
          display: flex;
          align-items: center;
          justify-content:
            space-between;

          gap: 15px;

          max-width: 230px;

          border-radius: 12px;
          padding: 13px 16px;

          background: #ffffff;
          color: #181714;

          font-weight: 900;

          transition:
            transform
              0.2s ease,
            background
              0.2s ease;
        }

        .category-card:hover
          .open-button {
          transform:
            translateY(-2px);

          background:
            #e8dac5;
        }

        .open-button span {
          font-size: 21px;
        }

        @media (
          max-width: 850px
        ) {
          .categories-grid {
            grid-template-columns:
              1fr;
          }

          .category-card,
          .category-image {
            min-height: 390px;
          }
        }

        @media (max-width: 520px) {
          .catalog-page {
            width: 100%;
            overflow-x: hidden;
            box-sizing: border-box;
            padding: 14px 10px 40px;
          }

          .catalog-container {
            width: 100%;
            min-width: 0;
          }

          .breadcrumbs {
            gap: 7px;
            margin-bottom: 22px;
            font-size: 12px;
          }

          .catalog-header {
            margin-bottom: 20px;
          }

          .eyebrow {
            margin-bottom: 7px;
            font-size: 11px;
            letter-spacing: 1.5px;
          }

          h1 {
            font-size: 32px;
            line-height: 1.05;
          }

          .subtitle {
            margin-top: 10px;
            font-size: 14px;
            line-height: 1.45;
          }

          .categories-grid {
            gap: 12px;
          }

          .category-card,
          .category-image {
            min-height: 270px;
            border-radius: 16px;
          }

          .category-number {
            top: 14px;
            right: 15px;
            font-size: 15px;
          }

          .category-content {
            padding: 16px;
          }

          .products-count {
            margin-bottom: 8px;
            padding: 5px 8px;
            font-size: 10px;
          }

          .category-content h2 {
            margin-bottom: 7px;
            font-size: 25px;
            line-height: 1.05;
          }

          .category-content p {
            margin-bottom: 12px;
            font-size: 12px;
            line-height: 1.4;
          }

          .open-button {
            max-width: none;
            padding: 10px 12px;
            border-radius: 10px;
            font-size: 13px;
          }

          .open-button span {
            font-size: 17px;
          }
        }

        @media (max-width: 360px) {
          .catalog-page {
            padding-left: 7px;
            padding-right: 7px;
          }

          h1 {
            font-size: 28px;
          }

          .subtitle {
            font-size: 13px;
          }

          .category-card,
          .category-image {
            min-height: 240px;
          }

          .category-content {
            padding: 13px;
          }

          .category-content h2 {
            font-size: 22px;
          }

          .category-content p {
            font-size: 11px;
          }
        }
      `}</style>
    </main>
  );
}