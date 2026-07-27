import Image from "next/image";
import Link from "next/link";

import type {
  Product,
  ProductBase,
  ProductPile,
  ProductPriceType,
} from "../types/product";

type RelatedProductsProps = {
  products: Product[];
};

const baseNames: Record<ProductBase, string> = {
  felt: "Повстяна",
  jute: "Джутова",
  woven: "Ткана",
  latex: "Латексна",
  stitched: "Прошита",
};

const pileNames: Record<ProductPile, string> = {
  flat: "Безворсовий",
  medium: "Середній ворс",
  high: "Високий ворс",
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

export default function RelatedProducts({
  products,
}: RelatedProductsProps) {
  if (!Array.isArray(products) || products.length === 0) {
    return null;
  }

  return (
    <section
      style={{
        marginTop: "25px",
        padding: "35px",
        borderRadius: "24px",
        background: "#ffffff",
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          color: "#967a55",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        Рекомендації
      </p>

      <h2
        style={{
          marginTop: 0,
          fontSize: "30px",
        }}
      >
        Схожі товари
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(230px, 1fr))",
          gap: "18px",
        }}
      >
        {products.map((product) => {
          const image =
            Array.isArray(product.images) &&
            product.images.length > 0
              ? product.images[0]
              : "";

          const priceType =
            product.priceType ?? "square-meter";

          return (
            <Link
              key={product.id}
              href={`/catalog/${product.id}`}
              style={{
                overflow: "hidden",
                borderRadius: "18px",
                background: "#f5f2ed",
                color: "#171717",
                textDecoration: "none",
                border: "1px solid #e1dbd1",
              }}
            >
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  aspectRatio: "1.2 / 1",
                  background: "#dedad4",
                }}
              >
                {image ? (
                  <Image
                    src={image}
                    alt={product.name}
                    fill
                    sizes="260px"
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
                      color: "#777777",
                      fontWeight: 700,
                    }}
                  >
                    Немає фото
                  </div>
                )}
              </div>

              <div
                style={{
                  padding: "16px",
                }}
              >
                <div
                  style={{
                    marginBottom: "8px",
                    color: "#967a55",
                    fontSize: "13px",
                    fontWeight: 800,
                  }}
                >
                  {product.article}
                </div>

                <h3
                  style={{
                    margin: "0 0 10px",
                    fontSize: "20px",
                    lineHeight: 1.15,
                  }}
                >
                  {product.name}
                </h3>

                <div
                  style={{
                    display: "grid",
                    gap: "5px",
                    marginBottom: "13px",
                    color: "#666666",
                    fontSize: "14px",
                  }}
                >
                  <span>
                    Основа:{" "}
                    {baseNames[product.base] ?? product.base}
                  </span>

                  {product.pile && (
                    <span>
                      Ворс: {pileNames[product.pile]}
                    </span>
                  )}
                </div>

                <strong
                  style={{
                    fontSize: "20px",
                  }}
                >
                  {formatNumber(product.price)} грн /{" "}
                  {priceTypeNames[priceType]}
                </strong>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}