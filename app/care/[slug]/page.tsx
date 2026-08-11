import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { careArticles } from "../../../lib/careArticles";
import { getAllProducts } from "../../../lib/getAllProducts";
import type { Product } from "../../../types/product";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

type CareArticlePageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function getArticle(slug: string) {
  return (
    careArticles.find(
      (article) => article.slug === slug
    ) ?? null
  );
}

function getRelatedProducts(
  slug: string,
  products: Product[]
) {
  let filtered: Product[] = [];

  switch (slug) {
    case "felt-base":
      filtered = products.filter(
        (product) => product.base === "felt"
      );
      break;

    case "jute-base":
      filtered = products.filter(
        (product) => product.base === "jute"
      );
      break;

    case "latex-base":
      filtered = products.filter(
        (product) => product.base === "latex"
      );
      break;

    case "high-pile":
      filtered = products.filter(
        (product) => product.pile === "high"
      );
      break;

    case "stains":
      filtered = products.filter(
        (product) => product.inStock
      );
      break;

    default:
      filtered = products.filter(
        (product) => product.inStock
      );
  }

  return filtered
    .filter((product) => product.inStock)
    .slice(0, 6);
}

function getCategoryLinks(slug: string) {
  switch (slug) {
    case "felt-base":
      return [
        {
          href: "/catalog/category/budget/felt",
          label: "Килими на повстяній основі",
        },
        {
          href: "/catalog/category/budget",
          label: "Бюджетні килими та доріжки",
        },
      ];

    case "jute-base":
      return [
        {
          href: "/catalog/category/budget/jute",
          label: "Килими на джутовій основі",
        },
        {
          href: "/catalog/category/budget",
          label: "Бюджетні килими та доріжки",
        },
      ];

    case "latex-base":
      return [
        {
          href: "/catalog/category/budget/latex",
          label: "Килими на латексній основі",
        },
        {
          href: "/catalog/category/budget",
          label: "Бюджетні килими та доріжки",
        },
      ];

    case "high-pile":
      return [
        {
          href: "/catalog",
          label: "Переглянути килими з високим ворсом",
        },
        {
          href: "/picker",
          label: "Підібрати килим за параметрами",
        },
      ];

    case "stains":
      return [
        {
          href: "/catalog",
          label: "Каталог килимів",
        },
        {
          href: "/care",
          label: "Всі поради з догляду",
        },
      ];

    default:
      return [
        {
          href: "/catalog",
          label: "Каталог килимів",
        },
      ];
  }
}

function getOtherArticles(currentSlug: string) {
  return careArticles
    .filter(
      (article) =>
        article.slug !== currentSlug
    )
    .slice(0, 4);
}

export async function generateMetadata({
  params,
}: CareArticlePageProps): Promise<Metadata> {
  const { slug } = await params;

  const article = getArticle(slug);

  if (!article) {
    return {
      title:
        "Статтю не знайдено | DreamCarpet",
      description:
        "На жаль, такої статті немає в розділі догляду DreamCarpet.",
    };
  }

  const canonicalUrl =
    `${siteUrl}/care/${article.slug}`;

  return {
    title: `${article.title} | DreamCarpet`,
    description: article.description,
    keywords: article.keywords,

    alternates: {
      canonical: canonicalUrl,
    },

    openGraph: {
      title:
        `${article.title} | DreamCarpet`,
      description: article.description,
      type: "article",
      url: canonicalUrl,
    },
  };
}

export default async function CareArticlePage({
  params,
}: CareArticlePageProps) {
  const { slug } = await params;

  const article = getArticle(slug);

  if (!article) {
    notFound();
  }

  const products =
    await getAllProducts();

  const relatedProducts =
    getRelatedProducts(
      slug,
      products
    );

  const categoryLinks =
    getCategoryLinks(slug);

  const otherArticles =
    getOtherArticles(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",

    headline: article.title,

    description:
      article.description,

    author: {
      "@type": "Organization",
      name: "DreamCarpet",
    },

    publisher: {
      "@type": "Organization",
      name: "DreamCarpet",
    },

    mainEntityOfPage:
      `${siteUrl}/care/${article.slug}`,
  };

  return (
    <main
      style={{
        minHeight: "100vh",

        padding:
          "50px 20px 70px",

        background:
          "#f5f2ec",

        color:
          "#181714",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html:
            JSON.stringify(
              jsonLd
            ),
        }}
      />

      <article
        style={{
          width:
            "min(900px, 100%)",

          margin:
            "0 auto",

          padding:
            "38px",

          borderRadius:
            "26px",

          background:
            "#ffffff",

          boxShadow:
            "0 14px 35px rgba(44, 36, 24, 0.06)",
        }}
      >
        <Link
          href="/care"
          style={{
            color:
              "#6d604f",

            textDecoration:
              "none",

            fontWeight:
              800,
          }}
        >
          ← Всі поради
        </Link>

        <p
          style={{
            margin:
              "28px 0 8px",

            color:
              "#8a7656",

            fontSize:
              "13px",

            fontWeight:
              900,

            letterSpacing:
              "1.2px",

            textTransform:
              "uppercase",
          }}
        >
          Догляд за килимами
        </p>

        <h1
          style={{
            margin: 0,

            fontSize:
              "clamp(32px, 5vw, 52px)",

            lineHeight:
              1.05,
          }}
        >
          {article.title}
        </h1>

        <p
          style={{
            margin:
              "18px 0 28px",

            color:
              "#6f6a62",

            fontSize:
              "18px",

            lineHeight:
              1.65,
          }}
        >
          {article.description}
        </p>

        <div
          style={{
            display:
              "grid",

            gap:
              "18px",

            color:
              "#403c35",

            fontSize:
              "18px",

            lineHeight:
              1.8,
          }}
        >
          {article.content.map(
            (paragraph) => (
              <p
                key={paragraph}
                style={{
                  margin: 0,
                }}
              >
                {paragraph}
              </p>
            )
          )}
        </div>

        <div
          style={{
            marginTop:
              "34px",

            padding:
              "20px",

            borderRadius:
              "18px",

            background:
              "#f5f2ec",
          }}
        >
          <strong>
            Порада DreamCarpet:
          </strong>{" "}
          перед використанням
          нового засобу для
          чистки перевір його на
          маленькій непомітній
          ділянці килима.
        </div>

        {/* SEO КАТЕГОРІЇ */}

        <section
          style={{
            marginTop:
              "32px",

            padding:
              "22px",

            borderRadius:
              "18px",

            border:
              "1px solid #e5d5b9",

            background:
              "#fffaf1",
          }}
        >
          <h2
            style={{
              margin:
                "0 0 14px",

              fontSize:
                "22px",
            }}
          >
            Підібрати відповідний килим
          </h2>

          <div
            style={{
              display:
                "flex",

              flexWrap:
                "wrap",

              gap:
                "10px",
            }}
          >
            {categoryLinks.map(
              (link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    display:
                      "inline-flex",

                    padding:
                      "11px 14px",

                    borderRadius:
                      "10px",

                    background:
                      "#181714",

                    color:
                      "#ffffff",

                    textDecoration:
                      "none",

                    fontWeight:
                      800,
                  }}
                >
                  {link.label} →
                </Link>
              )
            )}
          </div>
        </section>

        {/* SEO ТОВАРИ */}

        {relatedProducts.length > 0 && (
          <section
            style={{
              marginTop:
                "32px",
            }}
          >
            <h2
              style={{
                margin:
                  "0 0 16px",

                fontSize:
                  "24px",
              }}
            >
              Килими, які можуть вам підійти
            </h2>

            <div
              style={{
                display:
                  "grid",

                gridTemplateColumns:
                  "repeat(auto-fit, minmax(180px, 1fr))",

                gap:
                  "12px",
              }}
            >
              {relatedProducts.map(
                (product) => (
                  <Link
                    key={product.id}
                    href={`/catalog/${product.id}`}
                    style={{
                      padding:
                        "16px",

                      borderRadius:
                        "14px",

                      border:
                        "1px solid #e2d9ca",

                      background:
                        "#ffffff",

                      color:
                        "#181714",

                      textDecoration:
                        "none",
                    }}
                  >
                    <strong
                      style={{
                        display:
                          "block",

                        marginBottom:
                          "5px",
                      }}
                    >
                      {product.name}
                    </strong>

                    <span
                      style={{
                        color:
                          "#7b6c58",

                        fontSize:
                          "14px",
                      }}
                    >
                      {product.price} грн
                    </span>
                  </Link>
                )
              )}
            </div>
          </section>
        )}

        {/* SEO ІНШІ СТАТТІ */}

        {otherArticles.length > 0 && (
          <section
            style={{
              marginTop:
                "34px",

              paddingTop:
                "26px",

              borderTop:
                "1px solid #e5ded2",
            }}
          >
            <h2
              style={{
                margin:
                  "0 0 14px",

                fontSize:
                  "22px",
              }}
            >
              Інші корисні поради
            </h2>

            <div
              style={{
                display:
                  "flex",

                flexWrap:
                  "wrap",

                gap:
                  "10px",
              }}
            >
              {otherArticles.map(
                (item) => (
                  <Link
                    key={item.slug}
                    href={`/care/${item.slug}`}
                    style={{
                      padding:
                        "10px 13px",

                      borderRadius:
                        "999px",

                      background:
                        "#f5f2ec",

                      color:
                        "#181714",

                      textDecoration:
                        "none",

                      fontWeight:
                        700,
                    }}
                  >
                    {item.title} →
                  </Link>
                )
              )}
            </div>
          </section>
        )}

        <div
          style={{
            marginTop:
              "32px",
          }}
        >
          <Link
            href="/catalog"
            style={{
              display:
                "inline-flex",

              padding:
                "14px 18px",

              borderRadius:
                "12px",

              background:
                "#d4af37",

              color:
                "#111111",

              textDecoration:
                "none",

              fontWeight:
                900,
            }}
          >
            Перейти до каталогу →
          </Link>
        </div>
      </article>
    </main>
  );
}