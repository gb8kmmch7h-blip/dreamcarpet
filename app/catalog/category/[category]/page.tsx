import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import CategoryProductsClient from "./CategoryProductsClient";
import { getAllProducts } from "../../../../lib/getAllProducts";
import { getCatalogSettings } from "../../../../lib/getCatalogSettings";

export const dynamic = "force-dynamic";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

const baseImages: Record<string, string> = {
  felt: "/images/subcategories/felt.jpg.png",
  woven: "/images/subcategories/woven.jpg.png",
  latex: "/images/subcategories/latex.jpg.png",
  jute: "/images/subcategories/jute.jpg.png",
  stitched: "/images/subcategories/darnychanka.jpg.png",
};

const categoryInformation: Record<
  string,
  {
    title: string;
    description: string;
    seoTitle: string;
    seoDescription: string;
    keywords: string[];
  }
> = {
  budget: {
    title: "Бюджетні килими",
    description:
      "Оберіть потрібну основу або категорію бюджетних доріжок.",
    seoTitle:
      "Бюджетні килими та доріжки купити | DreamCarpet",
    seoDescription:
      "Бюджетні килими та килимові доріжки для дому: повстяна, ткана, латексна, джутова основа. Великий вибір розмірів у DreamCarpet.",
    keywords: [
      "бюджетні килими",
      "бюджетні доріжки",
      "килимова доріжка купити",
      "дешеві килими",
      "килим на повстяній основі",
      "DreamCarpet",
    ],
  },

  standard: {
    title: "Середня якість",
    description:
      "Оптимальне поєднання хорошої якості, практичності та доступної ціни.",
    seoTitle:
      "Килими середньої якості купити | DreamCarpet",
    seoDescription:
      "Килими та доріжки середньої якості для коридору, кухні, спальні та вітальні. Практичні моделі за доступною ціною.",
    keywords: [
      "килими середньої якості",
      "доріжки середньої якості",
      "килим купити",
      "килимова доріжка",
      "DreamCarpet",
    ],
  },

  premium: {
    title: "Преміум килими",
    description:
      "Стильні килими підвищеної якості, щільності та комфорту.",
    seoTitle:
      "Преміум килими купити | DreamCarpet",
    seoDescription:
      "Преміум килими та доріжки для сучасного інтер’єру. Якісні матеріали, стильні дизайни, різні розміри.",
    keywords: [
      "преміум килими",
      "преміум доріжки",
      "якісні килими",
      "стильні килими",
      "DreamCarpet",
    ],
  },

  turkey: {
    title: "Преміум Туреччина",
    description:
      "Якісні турецькі килими з виразними візерунками та щільним ворсом.",
    seoTitle:
      "Турецькі килими купити | DreamCarpet",
    seoDescription:
      "Турецькі килими та доріжки преміум якості. Щільний ворс, гарні візерунки, сучасні та класичні дизайни.",
    keywords: [
      "турецькі килими",
      "килими Туреччина",
      "турецькі доріжки",
      "преміум Туреччина",
      "DreamCarpet",
    ],
  },
};

const budgetSubcategories = [
  {
    slug: "felt",
    title: "На повстяній основі",
    description:
      "Практичні та доступні доріжки на м’якій повстяній основі.",
    image: "/images/subcategories/felt.jpg.png",
  },
  {
    slug: "woven",
    title: "На тканій основі",
    description:
      "Міцні бюджетні доріжки на тканій основі.",
    image: "/images/subcategories/woven.jpg.png",
  },
  {
    slug: "latex",
    title: "На латексній основі",
    description:
      "Доріжки з латексною основою, які краще тримаються на підлозі.",
    image: "/images/subcategories/latex.jpg.png",
  },
  {
    slug: "jute",
    title: "На джутовій основі",
    description:
      "Міцні бюджетні доріжки на джутовій основі.",
    image: "/images/subcategories/jute.jpg.png",
  },
  {
    slug: "darnychanka",
    title: "Дарничанка",
    description:
      "Практичні прошиті доріжки Дарничанка.",
    image: "/images/subcategories/darnychanka.jpg.png",
  },
];

type CategoryPageProps = {
  params: Promise<{
    category: string;
  }>;
};

function getCategoryUrl(category: string) {
  return `${siteUrl}/catalog/category/${category}`;
}

function createBreadcrumbJsonLd(category: string, title: string) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Головна",
        item: siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Каталог",
        item: `${siteUrl}/catalog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: title,
        item: getCategoryUrl(category),
      },
    ],
  };
}

function createCollectionJsonLd(
  category: string,
  title: string,
  description: string,
  productsCount: number
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: getCategoryUrl(category),
    isPartOf: {
      "@type": "WebSite",
      name: "DreamCarpet",
      url: siteUrl,
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: productsCount,
    },
  };
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category } = await params;

  const settings = await getCatalogSettings();
  const configuredCategory = settings.categories.find(
    (item) => item.value === category && item.active
  );

  if (!configuredCategory) {
    return {
      title: "Категорію не знайдено | DreamCarpet",
      description:
        "На жаль, такої категорії немає в каталозі DreamCarpet.",
    };
  }

  const fallback = {
    title: configuredCategory.label,
    description: `Оберіть потрібну основу в категорії «${configuredCategory.label}».`,
    seoTitle: `${configuredCategory.label} — купити килими | DreamCarpet`,
    seoDescription: `Килими та доріжки категорії «${configuredCategory.label}» у DreamCarpet. Оберіть потрібну основу та перегляньте товари.`,
    keywords: [configuredCategory.label, "килими", "доріжки", "DreamCarpet"],
  };

  const categoryData = categoryInformation[category] ?? fallback;
  const canonicalUrl = getCategoryUrl(category);

  return {
    title: categoryData.seoTitle,
    description: categoryData.seoDescription,
    keywords: categoryData.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: categoryData.seoTitle,
      description: categoryData.seoDescription,
      type: "website",
      url: canonicalUrl,
    },
  };
}

export default async function CategoryPage({
  params,
}: CategoryPageProps) {
  const { category } = await params;

  const settings = await getCatalogSettings();

  const configuredCategory = settings.categories.find(
    (item) => item.value === category && item.active
  );

  if (!configuredCategory) {
    notFound();
  }

  const fallback = {
    title: configuredCategory.label,
    description: `Оберіть потрібну основу в категорії «${configuredCategory.label}».`,
    seoTitle: `${configuredCategory.label} — купити килими | DreamCarpet`,
    seoDescription: `Килими та доріжки категорії «${configuredCategory.label}» у DreamCarpet.`,
    keywords: [configuredCategory.label, "килими", "доріжки", "DreamCarpet"],
  };

  const categoryData = categoryInformation[category] ?? fallback;

  const products = await getAllProducts();

  const categoryProducts = products.filter(
    (product) => product.category === category
  );

  const breadcrumbJsonLd = createBreadcrumbJsonLd(
    category,
    categoryData.title
  );

  const collectionJsonLd = createCollectionJsonLd(
    category,
    categoryData.title,
    categoryData.description,
    categoryProducts.length
  );

  const categoryBases = settings.bases.filter(
    (base) =>
      base.active &&
      base.category === category
  );

  if (categoryBases.length > 0) {
    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(breadcrumbJsonLd),
          }}
        />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(collectionJsonLd),
          }}
        />

        <main
          style={{
            minHeight: "70vh",
            padding: "50px 20px",
            background: "#f5f2ec",
          }}
        >
          <section
            style={{
              width: "100%",
              maxWidth: "1200px",
              margin: "0 auto",
            }}
          >
            <div style={{ marginBottom: "32px" }}>
              <p
                style={{
                  margin: "0 0 8px",
                  color: "#8a7656",
                  fontSize: "13px",
                  fontWeight: 800,
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                }}
              >
                DreamCarpet
              </p>

              <h1
                style={{
                  margin: 0,
                  color: "#181714",
                  fontSize: "clamp(32px, 5vw, 52px)",
                }}
              >
                {categoryData.title}
              </h1>

              <p
                style={{
                  margin: "12px 0 0",
                  color: "#6f6a62",
                  fontSize: "17px",
                }}
              >
                {categoryData.description}
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(240px, 1fr))",
                gap: "18px",
              }}
            >
              {categoryBases.map((base) => {
                const baseProducts = categoryProducts.filter(
                  (product) => product.base === base.value
                );

                const productImage =
                  baseProducts.find(
                    (product) =>
                      Array.isArray(product.images) &&
                      product.images.length > 0
                  )?.images?.[0];

                const image =
                  productImage ||
                  baseImages[base.value] ||
                  null;

                return (
                  <Link
                    key={`${base.category}-${base.value}`}
                    href={`/catalog/category/${category}/${base.value}`}
                    style={{
                      display: "block",
                      minHeight: "420px",
                      padding: "25px",
                      border: "1px solid #ded7ca",
                      borderRadius: "18px",
                      background: "#ffffff",
                      color: "#181714",
                      textDecoration: "none",
                      boxShadow:
                        "0 10px 30px rgba(44, 36, 24, 0.07)",
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "220px",
                        marginBottom: "18px",
                        overflow: "hidden",
                        borderRadius: "14px",
                        background: "#eeeae2",
                      }}
                    >
                      {image ? (
                        <Image
                          src={image}
                          alt={base.label}
                          fill
                          sizes="(max-width: 768px) 100vw, 25vw"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "100%",
                            height: "100%",
                            display: "grid",
                            placeItems: "center",
                            color: "#8a7656",
                            fontWeight: 900,
                          }}
                        >
                          DreamCarpet
                        </div>
                      )}
                    </div>

                    <h2
                      style={{
                        margin: "0 0 10px",
                        fontSize: "22px",
                      }}
                    >
                      {base.label}
                    </h2>

                    <p
                      style={{
                        margin: 0,
                        color: "#716d65",
                        lineHeight: 1.6,
                      }}
                    >
                      Товарів: {baseProducts.length}
                    </p>

                    <div
                      style={{
                        marginTop: "20px",
                        fontWeight: 800,
                      }}
                    >
                      Переглянути товари →
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        </main>
      </>
    );
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionJsonLd),
        }}
      />

      <CategoryProductsClient
        title={categoryData.title}
        description={categoryData.description}
        products={categoryProducts}
      />
    </>
  );
}