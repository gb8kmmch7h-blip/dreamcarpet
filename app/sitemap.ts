import type { MetadataRoute } from "next";

import { careArticles } from "../lib/careArticles";
import { getAllProducts } from "../lib/getAllProducts";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
  "http://localhost:3000";

const categories = [
  "budget",
  "standard",
  "premium",
  "turkey",
];

const budgetSubcategories = [
  "felt",
  "woven",
  "latex",
  "jute",
  "darnychanka",
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const products = await getAllProducts();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/catalog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
  url: `${siteUrl}/search`,
  lastModified: new Date(),
  changeFrequency: "weekly",
  priority: 0.75,
},
    {
  url: `${siteUrl}/assistant`,
  lastModified: new Date(),
  changeFrequency: "weekly",
  priority: 0.85,
},
    {
      url: `${siteUrl}/care`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/cart`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
  ];

  const categoryPages: MetadataRoute.Sitemap =
    categories.map((category) => ({
      url: `${siteUrl}/catalog/category/${category}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    }));

  const budgetPages: MetadataRoute.Sitemap =
    budgetSubcategories.map((subcategory) => ({
      url: `${siteUrl}/catalog/category/budget/${subcategory}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    }));

  const productPages: MetadataRoute.Sitemap =
    products.map((product) => ({
      url: `${siteUrl}/catalog/${product.id}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: product.featured ? 0.9 : 0.7,
    }));

  const carePages: MetadataRoute.Sitemap =
    careArticles.map((article) => ({
      url: `${siteUrl}/care/${article.slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.65,
    }));

  return [
    ...staticPages,
    ...categoryPages,
    ...budgetPages,
    ...productPages,
    ...carePages,
  ];
}