import type { Metadata } from "next";

import { notFound } from "next/navigation";

import CategoryProductsClient from "../CategoryProductsClient";

import { getAllProducts } from "../../../../../lib/getAllProducts";
import { getCatalogSettings } from "../../../../../lib/getCatalogSettings";

export const dynamic = "force-dynamic";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

type SubcategoryPageProps = {
  params: Promise<{
    category: string;
    subcategory: string;
  }>;
};

const baseSeo: Record<
  string,
  {
    name: string;
    description: string;
    keywords: string[];
  }
> = {
  felt: {
    name: "на повстяній основі",
    description:
      "Практичні килими та доріжки на повстяній основі для дому.",
    keywords: [
      "килим на повстяній основі",
      "доріжка на повстяній основі",
      "повстяна основа",
    ],
  },

  woven: {
    name: "на тканій основі",
    description:
      "Міцні килими та доріжки на тканій основі для щоденного використання.",
    keywords: [
      "килим на тканій основі",
      "доріжка на тканій основі",
      "ткана основа",
    ],
  },

  latex: {
    name: "на латексній основі",
    description:
      "Практичні килими та доріжки на латексній основі, які добре тримаються на підлозі.",
    keywords: [
      "килим на латексній основі",
      "доріжка на латексній основі",
      "латексна основа",
    ],
  },

  jute: {
    name: "на джутовій основі",
    description:
      "Міцні килими та доріжки на джутовій основі для різних кімнат.",
    keywords: [
      "килим на джутовій основі",
      "доріжка на джутовій основі",
      "джутова основа",
    ],
  },

  stitched: {
    name: "на прошитій основі",
    description:
      "Практичні прошиті килими та доріжки для дому та коридору.",
    keywords: [
      "прошиті доріжки",
      "прошитий килим",
      "прошита основа",
    ],
  },
};

function getSubcategoryUrl(
  category: string,
  subcategory: string
) {
  return `${siteUrl}/catalog/category/${category}/${subcategory}`;
}

function createBreadcrumbJsonLd(
  category: string,
  categoryLabel: string,
  subcategory: string,
  subcategoryLabel: string
) {
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
        name: categoryLabel,
        item: `${siteUrl}/catalog/category/${category}`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: subcategoryLabel,
        item: getSubcategoryUrl(
          category,
          subcategory
        ),
      },
    ],
  };
}

function createCollectionJsonLd(
  category: string,
  subcategory: string,
  title: string,
  description: string,
  productsCount: number
) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: getSubcategoryUrl(
      category,
      subcategory
    ),
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
}: SubcategoryPageProps): Promise<Metadata> {
  const { category, subcategory } =
    await params;

  const settings =
    await getCatalogSettings();

  const categoryData =
    settings.categories.find(
      (item) =>
        item.value === category &&
        item.active
    );

  const baseData =
    settings.bases.find(
      (item) =>
        item.value === subcategory &&
        item.category === category &&
        item.active
    );

  if (!categoryData || !baseData) {
    return {
      title:
        "Розділ не знайдено | DreamCarpet",
      description:
        "На жаль, такого розділу немає в каталозі DreamCarpet.",
    };
  }

  const seo = baseSeo[subcategory];

  const title =
    `${categoryData.label}: ${baseData.label} | DreamCarpet`;

  const description =
    seo?.description ??
    `Килими та доріжки «${baseData.label}» у категорії «${categoryData.label}». Перегляньте доступні товари DreamCarpet.`;

  const keywords = [
    categoryData.label,
    baseData.label,
    "килим купити",
    "килимова доріжка",
    "DreamCarpet",
    ...(seo?.keywords ?? []),
  ];

  const canonicalUrl =
    getSubcategoryUrl(
      category,
      subcategory
    );

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: canonicalUrl,
    },
  };
}

export default async function SubcategoryPage({
  params,
}: SubcategoryPageProps) {
  const { category, subcategory } =
    await params;

  const settings =
    await getCatalogSettings();

  const categoryData =
    settings.categories.find(
      (item) =>
        item.value === category &&
        item.active
    );

  const baseData =
    settings.bases.find(
      (item) =>
        item.value === subcategory &&
        item.category === category &&
        item.active
    );

  if (!categoryData || !baseData) {
    notFound();
  }

  const products =
    await getAllProducts();

  const categoryProducts =
    products.filter(
      (product) =>
        String(product.category) ===
          category &&
        String(product.base) ===
          subcategory
    );

  const seo = baseSeo[subcategory];

  const title =
    `${categoryData.label} — ${baseData.label}`;

  const description =
    seo?.description ??
    `Перегляньте товари «${baseData.label}» у категорії «${categoryData.label}».`;

  const breadcrumbJsonLd =
    createBreadcrumbJsonLd(
      category,
      categoryData.label,
      subcategory,
      baseData.label
    );

  const collectionJsonLd =
    createCollectionJsonLd(
      category,
      subcategory,
      title,
      description,
      categoryProducts.length
    );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            breadcrumbJsonLd
          ),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            collectionJsonLd
          ),
        }}
      />

      <CategoryProductsClient
        title={title}
        description={description}
        products={categoryProducts}
      />
    </>
  );
}