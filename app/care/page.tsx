import type { Metadata } from "next";
import Link from "next/link";

import { careArticles } from "../../lib/careArticles";

export const metadata: Metadata = {
  title: "Догляд за килимами | DreamCarpet",
  description:
    "Поради DreamCarpet: як доглядати за килимами, доріжками, високим ворсом, повстяною, джутовою та латексною основою.",
  keywords: [
    "догляд за килимами",
    "як чистити килим",
    "чистка доріжок",
    "DreamCarpet",
  ],
};

export default function CarePage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "50px 20px 70px",
        background: "#f5f2ec",
        color: "#181714",
      }}
    >
      <section
        style={{
          width: "min(1200px, 100%)",
          margin: "0 auto",
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            color: "#8a7656",
            fontSize: "13px",
            fontWeight: 900,
            letterSpacing: "1.2px",
            textTransform: "uppercase",
          }}
        >
          DreamCarpet
        </p>

        <h1
          style={{
            margin: 0,
            fontSize: "clamp(34px, 5vw, 56px)",
            lineHeight: 1,
          }}
        >
          Догляд за килимами
        </h1>

        <p
          style={{
            maxWidth: "760px",
            margin: "16px 0 34px",
            color: "#6f6a62",
            fontSize: "18px",
            lineHeight: 1.6,
          }}
        >
          Корисні поради, які допоможуть довше
          зберегти гарний вигляд килима або доріжки.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "18px",
          }}
        >
          {careArticles.map((article) => (
            <Link
              key={article.slug}
              href={`/care/${article.slug}`}
              style={{
                display: "grid",
                gap: "12px",
                padding: "24px",
                borderRadius: "22px",
                border: "1px solid #ded7ca",
                background: "#ffffff",
                color: "#181714",
                textDecoration: "none",
                boxShadow:
                  "0 14px 35px rgba(44, 36, 24, 0.06)",
              }}
            >
              <span
                style={{
                  color: "#8a7656",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  fontSize: "12px",
                  letterSpacing: "1px",
                }}
              >
                Поради
              </span>

              <h2
                style={{
                  margin: 0,
                  fontSize: "23px",
                  lineHeight: 1.15,
                }}
              >
                {article.title}
              </h2>

              <p
                style={{
                  margin: 0,
                  color: "#6f6a62",
                  lineHeight: 1.6,
                }}
              >
                {article.description}
              </p>

              <strong>Читати →</strong>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}