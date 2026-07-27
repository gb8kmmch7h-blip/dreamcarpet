import type { Metadata } from "next";
import { notFound } from "next/navigation";

import CategoryProductsClient from "../../[category]/CategoryProductsClient";
import { getAllProducts } from "../../../../../lib/getAllProducts";
import type { ProductBase } from "../../../../../types/product";

export const dynamic = "force-dynamic";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

const subcategoryInformation: Record<
  string,
  {
    title: string;
    description: string;
    seoTitle: string;
    seoDescription: string;
    keywords: string[];
  }
> = {
  felt: {
    title: "Бюджетні на повстяній основі",
    description:
      "Практичні та доступні килими й доріжки на повстяній основі.",
    seoTitle:
      "Килими та доріжки на повстяній основі купити | DreamCarpet",
    seoDescription:
      "Бюджетні килими та килимові доріжки на повстяній основі. Практичні моделі для коридору, кухні та дому за доступною ціною.",
    keywords: [
      "килим на повстяній основі",
      "доріжка на повстяній основі",
      "бюджетні доріжки",
      "повстяна основа",
      "килим купити",
      "DreamCarpet",
    ],
  },

  woven: {
    title: "Бюджетні на тканій основі",
    description:
      "Міцні бюджетні килими й доріжки на тканій основі.",
    seoTitle:
      "Килими та доріжки на тканій основі купити | DreamCarpet",
    seoDescription:
      "Бюджетні килими та доріжки на тканій основі. Міцні, практичні та зручні для щоденного використання вдома.",
    keywords: [
      "килим на тканій основі",
      "доріжка на тканій основі",
      "ткана основа",
      "бюджетні килими",
      "килимова доріжка купити",
      "DreamCarpet",
    ],
  },

  latex: {
    title: "Бюджетні на латексній основі",
    description:
      "Практичні доріжки на латексній основі, які добре тримаються на підлозі.",
    seoTitle:
      "Килими та доріжки на латексній основі купити | DreamCarpet",
    seoDescription:
      "Килими та доріжки на латексній основі для дому. Практичні моделі, які краще тримаються на підлозі та підходять для щоденного використання.",
    keywords: [
      "килим на латексній основі",
      "доріжка на латексній основі",
      "латексна основа",
      "доріжка для коридору",
      "килим купити",
      "DreamCarpet",
    ],
  },

  jute: {
    title: "Бюджетні на джутовій основі",
    description:
      "Міцні бюджетні килими й доріжки на джутовій основі.",
    seoTitle:
      "Килими та доріжки на джутовій основі купити | DreamCarpet",
    seoDescription:
      "Бюджетні килими та доріжки на джутовій основі. Міцні моделі для дому, коридору, кухні та вітальні.",
    keywords: [
      "килим на джутовій основі",
      "доріжка на джутовій основі",
      "джутова основа",
      "міцні доріжки",
      "килимова доріжка",
      "DreamCarpet",
    ],
  },

  darnychanka: {
    title: "Дарничанка",
    description:
      "Бюджетні килими й доріжки колекції Дарничанка.",
    seoTitle:
      "Доріжки Дарничанка купити | DreamCarpet",
    seoDescription:
      "Практичні бюджетні доріжки Дарничанка для коридору, кухні та дому. Прошиті моделі за доступною ціною.",
    keywords: [
      "Дарничанка",
      "доріжки Дарничанка",
      "килим Дарничанка",
      "прошиті доріжки",
      "бюджетні доріжки",
      "DreamCarpet",
    ],
  },
};

const subcategoryBaseMap: Record<string, ProductBase> = {
  felt: "felt",
  woven: "woven",
  latex: "latex",
  jute: "jute",
};

type SubcategoryPageProps = {
  params: Promise<{
    subcategory: string;
  }>;
};

function getSubcategoryUrl(subcategory: string) {
  return `${siteUrl}/catalog/category/budget/${subcategory}`;
}

function createBreadcrumbJsonLd(
  subcategory: string,
  title: string
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
        name: "Бюджетні килими",
        item: `${siteUrl}/catalog/category/budget`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: title,
        item: getSubcategoryUrl(subcategory),
      },
    ],
  };
}

function createCollectionJsonLd(
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
    url: getSubcategoryUrl(subcategory),
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
  const { subcategory } = await params;

  const subcategoryData =
    subcategoryInformation[subcategory];

  if (!subcategoryData) {
    return {
      title: "Підкатегорію не знайдено | DreamCarpet",
      description:
        "На жаль, такої підкатегорії немає в каталозі DreamCarpet.",
    };
  }

  const canonicalUrl = getSubcategoryUrl(subcategory);

  return {
    title: subcategoryData.seoTitle,
    description: subcategoryData.seoDescription,
    keywords: subcategoryData.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: subcategoryData.seoTitle,
      description: subcategoryData.seoDescription,
      type: "website",
      url: canonicalUrl,
    },
  };
}

export default async function SubcategoryPage({
  params,
}: SubcategoryPageProps) {
  const { subcategory } = await params;

  const subcategoryData =
    subcategoryInformation[subcategory];

  if (!subcategoryData) {
    notFound();
  }

  const products = await getAllProducts();

  const categoryProducts = products.filter(
    (product) => {
      if (product.category !== "budget") {
        return false;
      }

      const collection = product.collection
        ? product.collection.trim().toLowerCase()
        : "";

      const isDarnychanka =
        collection.includes("дарничанка") ||
        collection.includes("darnychanka") ||
        product.base === "stitched";

      if (subcategory === "darnychanka") {
        return isDarnychanka;
      }

      const neededBase =
        subcategoryBaseMap[subcategory];

      if (!neededBase) {
        return false;
      }

      return (
        product.base === neededBase &&
        !isDarnychanka
      );
    }
  );

  const breadcrumbJsonLd = createBreadcrumbJsonLd(
    subcategory,
    subcategoryData.title
  );

  const collectionJsonLd = createCollectionJsonLd(
    subcategory,
    subcategoryData.title,
    subcategoryData.description,
    categoryProducts.length
  );

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
        title={subcategoryData.title}
        description={subcategoryData.description}
        products={categoryProducts}
      />
    </>
  );
}