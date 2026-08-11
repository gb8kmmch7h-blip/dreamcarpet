import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ProductDetails from "../../../components/ProductDetails";
import ProductReviews from "../../../components/ProductReviews";
import SeoInternalLinks from "../../../components/SeoInternalLinks";
import { getAllProducts } from "../../../lib/getAllProducts";
import type { Product } from "../../../types/product";

export const dynamic = "force-dynamic";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

type ProductPageProps = {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    width?: string;
    length?: string;
  }>;
};

function cleanText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

function trimText(text: string, maxLength: number) {
  const cleaned = cleanText(text);

  if (cleaned.length <= maxLength) {
    return cleaned;
  }

  return `${cleaned.slice(0, maxLength - 3).trim()}...`;
}

function createDefaultSeoTitle(product: Product) {
  return `${product.name} купити | DreamCarpet`;
}

function createDefaultSeoDescription(product: Product) {
  if (product.description) {
    return trimText(product.description, 155);
  }

  const parts = [
    product.name,
    product.collection
      ? `колекція ${product.collection}`
      : "",
    "килим або доріжка для дому",
    `ціна ${product.price} грн`,
    "DreamCarpet",
  ].filter(Boolean);

  return trimText(parts.join(". "), 155);
}

function createDefaultKeywords(product: Product) {
  const colors = Array.isArray(product.colors)
    ? product.colors
    : [];

  return [
    product.name,
    product.collection,
    product.article,
    "килим",
    "доріжка",
    "килим купити",
    "килимова доріжка",
    "DreamCarpet",
    ...colors,
  ].filter(Boolean);
}

function absoluteUrl(pathOrUrl: string) {
  if (!pathOrUrl) {
    return "";
  }

  if (
    pathOrUrl.startsWith("http://") ||
    pathOrUrl.startsWith("https://")
  ) {
    return pathOrUrl;
  }

  return `${siteUrl}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

async function getProduct(id: string) {
  const products = await getAllProducts();
  const productId = Number(id);

  if (!Number.isInteger(productId)) {
    return null;
  }

  return products.find((item) => item.id === productId) ?? null;
}

function getMatchScore(
  product: Product,
  candidate: Product
) {
  let score = 0;

  if (candidate.category === product.category) {
    score += 4;
  }

  if (candidate.base === product.base) {
    score += 3;
  }

  if (
    product.productType &&
    candidate.productType === product.productType
  ) {
    score += 2;
  }

  if (
    product.pile &&
    candidate.pile === product.pile
  ) {
    score += 2;
  }

  if (
    product.material &&
    candidate.material === product.material
  ) {
    score += 2;
  }

  if (
    product.shape &&
    candidate.shape === product.shape
  ) {
    score += 1;
  }

  if (product.price > 0 && candidate.price > 0) {
    const difference = Math.abs(
      candidate.price - product.price
    );

    if (difference <= product.price * 0.25) {
      score += 1;
    }
  }

  return score;
}

function getRelatedProducts(
  products: Product[],
  product: Product
) {
  return products
    .filter((item) => item.id !== product.id)
    .map((item) => ({
      product: item,
      score: getMatchScore(product, item),
    }))
    .filter((item) => item.score > 0)
    .sort((first, second) => {
      if (second.score !== first.score) {
        return second.score - first.score;
      }

      return second.product.id - first.product.id;
    })
    .slice(0, 4)
    .map((item) => item.product);
}

function createProductJsonLd(product: Product) {
  const productUrl = `${siteUrl}/catalog/${product.id}`;

  const images = Array.isArray(product.images)
    ? product.images
        .map((image) => absoluteUrl(image))
        .filter(Boolean)
    : [];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description:
      product.seoDescription ||
      createDefaultSeoDescription(product),
    image: images,
    sku: product.article,
    brand: {
      "@type": "Brand",
      name: product.brand || "DreamCarpet",
    },
    category: product.category,
    color: Array.isArray(product.colors)
      ? product.colors.join(", ")
      : undefined,
    material: product.material || undefined,
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "UAH",
      price: product.price,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

function createBreadcrumbJsonLd(product: Product) {
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
        name: product.name,
        item: `${siteUrl}/catalog/${product.id}`,
      },
    ],
  };
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: "Товар не знайдено | DreamCarpet",
      description:
        "На жаль, цей товар не знайдено в каталозі DreamCarpet.",
    };
  }

  const title =
    product.seoTitle || createDefaultSeoTitle(product);

  const description =
    product.seoDescription ||
    createDefaultSeoDescription(product);

  const keywords =
    product.seoKeywords &&
    product.seoKeywords.length > 0
      ? product.seoKeywords
      : createDefaultKeywords(product);

  const mainImage =
    product.images && product.images.length > 0
      ? absoluteUrl(product.images[0])
      : undefined;

  const canonicalUrl = `${siteUrl}/catalog/${product.id}`;

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
      images: mainImage ? [mainImage] : [],
    },
  };
}

function parsePositiveNumber(value?: string) {
  if (!value) {
    return undefined;
  }

  const parsed = Number(value.replace(",", "."));

  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : undefined;
}

export default async function ProductPage({
  params,
  searchParams,
}: ProductPageProps) {
  const { id } = await params;
  const query = await searchParams;

  const products = await getAllProducts();
  const productId = Number(id);

  if (!Number.isInteger(productId)) {
    notFound();
  }

  const product =
    products.find((item) => item.id === productId) ?? null;

  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(
    products,
    product
  );

  const initialWidth =
    parsePositiveNumber(query.width);

  const initialLength =
    parsePositiveNumber(query.length);

  const productJsonLd =
    createProductJsonLd(product);

  const breadcrumbJsonLd =
    createBreadcrumbJsonLd(product);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(productJsonLd),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />

      <ProductDetails
        product={product}
        relatedProducts={relatedProducts}
        initialWidth={initialWidth}
        initialLength={initialLength}
      />
<SeoInternalLinks
  product={product}
  relatedProducts={relatedProducts}
/>
      <ProductReviews
        productId={product.id}
        productName={product.name}
      />
    </>
  );
}