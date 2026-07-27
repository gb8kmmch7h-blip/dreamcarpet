import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { careArticles } from "../../../lib/careArticles";

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
    careArticles.find((article) => article.slug === slug) ??
    null
  );
}

export async function generateMetadata({
  params,
}: CareArticlePageProps): Promise<Metadata> {
  const { slug } = await params;

  const article = getArticle(slug);

  if (!article) {
    return {
      title: "Статтю не знайдено | DreamCarpet",
      description:
        "На жаль, такої статті немає в розділі догляду DreamCarpet.",
    };
  }

  const canonicalUrl = `${siteUrl}/care/${article.slug}`;

  return {
    title: `${article.title} | DreamCarpet`,
    description: article.description,
    keywords: article.keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${article.title} | DreamCarpet`,
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

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.description,
    author: {
      "@type": "Organization",
      name: "DreamCarpet",
    },
    publisher: {
      "@type": "Organization",
      name: "DreamCarpet",
    },
    mainEntityOfPage: `${siteUrl}/care/${article.slug}`,
  };

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "50px 20px 70px",
        background: "#f5f2ec",
        color: "#181714",
      }}
    >
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd),
        }}
      />

      <article
        style={{
          width: "min(900px, 100%)",
          margin: "0 auto",
          padding: "38px",
          borderRadius: "26px",
          background: "#ffffff",
          boxShadow:
            "0 14px 35px rgba(44, 36, 24, 0.06)",
        }}
      >
        <Link
          href="/care"
          style={{
            color: "#6d604f",
            textDecoration: "none",
            fontWeight: 800,
          }}
        >
          ← Всі поради
        </Link>

        <p
          style={{
            margin: "28px 0 8px",
            color: "#8a7656",
            fontSize: "13px",
            fontWeight: 900,
            letterSpacing: "1.2px",
            textTransform: "uppercase",
          }}
        >
          Догляд за килимами
        </p>

        <h1
          style={{
            margin: 0,
            fontSize: "clamp(32px, 5vw, 52px)",
            lineHeight: 1.05,
          }}
        >
          {article.title}
        </h1>

        <p
          style={{
            margin: "18px 0 28px",
            color: "#6f6a62",
            fontSize: "18px",
            lineHeight: 1.65,
          }}
        >
          {article.description}
        </p>

        <div
          style={{
            display: "grid",
            gap: "18px",
            color: "#403c35",
            fontSize: "18px",
            lineHeight: 1.8,
          }}
        >
          {article.content.map((paragraph) => (
            <p
              key={paragraph}
              style={{
                margin: 0,
              }}
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div
          style={{
            marginTop: "34px",
            padding: "20px",
            borderRadius: "18px",
            background: "#f5f2ec",
          }}
        >
          <strong>Порада DreamCarpet:</strong>{" "}
          перед використанням нового засобу для
          чистки перевір його на маленькій непомітній
          ділянці килима.
        </div>

        <div
          style={{
            marginTop: "30px",
          }}
        >
          <Link
            href="/catalog"
            style={{
              display: "inline-flex",
              padding: "14px 18px",
              borderRadius: "12px",
              background: "#181714",
              color: "#ffffff",
              textDecoration: "none",
              fontWeight: 900,
            }}
          >
            Перейти до каталогу →
          </Link>
        </div>
      </article>
    </main>
  );
}