import Link from "next/link";
import type { Product } from "../types/product";

type SeoInternalLinksProps = {
  product: Product;
  relatedProducts?: Product[];
};

const categoryNames: Record<string, string> = {
  budget: "Бюджетні килими та доріжки",
  standard: "Килими середньої якості",
  premium: "Преміум килими",
  turkey: "Турецькі килими",
};

const baseNames: Record<string, string> = {
  felt: "Килими на повстяній основі",
  woven: "Килими на тканій основі",
  jute: "Килими на джутовій основі",
  latex: "Килими на латексній основі",
  rubber: "Килими на прогумованій основі",
};

function getCareLink(product: Product) {
  switch (product.base) {
    case "felt":
      return {
        href: "/care/felt-base",
        label: "Як доглядати за килимом на повстяній основі",
      };

    case "jute":
      return {
        href: "/care/jute-base",
        label: "Догляд за килимом на джутовій основі",
      };

    case "latex":
      return {
        href: "/care/latex-base",
        label: "Догляд за килимом на латексній основі",
      };

    default:
      break;
  }

  if (product.pile === "high") {
    return {
      href: "/care/high-pile",
      label: "Як доглядати за килимом з високим ворсом",
    };
  }

  return {
    href: "/care",
    label: "Все про догляд за килимами",
  };
}

export default function SeoInternalLinks({
  product,
  relatedProducts = [],
}: SeoInternalLinksProps) {
  const categoryLabel =
    categoryNames[product.category] || "Каталог килимів";

  const baseLabel =
    baseNames[product.base] || "Килими за типом основи";

  const categoryHref = `/catalog/category/${product.category}`;

  const baseHref =
    `/catalog/category/${product.category}/${product.base}`;

  const careLink = getCareLink(product);

  const uniqueRelatedProducts = relatedProducts
    .filter((item) => item.id !== product.id)
    .slice(0, 4);

  return (
    <section
      aria-labelledby="seo-links-title"
      style={{
        maxWidth: "1200px",
        margin: "32px auto",
        padding: "0 16px",
      }}
    >
      <div
        style={{
          border: "1px solid #e7dfd2",
          borderRadius: "20px",
          padding: "22px",
          background: "#fffdf8",
        }}
      >
        <h2
          id="seo-links-title"
          style={{
            margin: "0 0 8px",
            fontSize: "22px",
            color: "#171717",
          }}
        >
          Корисно перед покупкою
        </h2>

        <p
          style={{
            margin: "0 0 18px",
            lineHeight: 1.6,
            color: "#5d554b",
          }}
        >
          Перегляньте схожі килими, товари цієї категорії
          та рекомендації з догляду.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <Link href="/catalog" style={linkStyle}>
            Усі килими та доріжки
          </Link>

          <Link href={categoryHref} style={linkStyle}>
            {categoryLabel}
          </Link>

          <Link href={baseHref} style={linkStyle}>
            {baseLabel}
          </Link>

          <Link href={careLink.href} style={linkStyle}>
            {careLink.label}
          </Link>

          <Link href="/care/stains" style={linkStyle}>
            Як вивести плями з килима
          </Link>
        </div>

        {uniqueRelatedProducts.length > 0 && (
          <div style={{ marginTop: "24px" }}>
            <h3
              style={{
                margin: "0 0 12px",
                fontSize: "18px",
                color: "#171717",
              }}
            >
              Схожі товари
            </h3>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
              }}
            >
              {uniqueRelatedProducts.map((item) => (
                <Link
                  key={item.id}
                  href={`/catalog/${item.id}`}
                  style={productLinkStyle}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

const linkStyle = {
  display: "inline-flex",
  alignItems: "center",
  minHeight: "42px",
  padding: "9px 13px",
  borderRadius: "10px",
  border: "1px solid #d8c7a8",
  background: "#ffffff",
  color: "#3c2d19",
  fontSize: "14px",
  fontWeight: 700,
  textDecoration: "none",
} as const;

const productLinkStyle = {
  ...linkStyle,
  background: "#171717",
  border: "1px solid #171717",
  color: "#ffffff",
} as const;