import { Product } from "../types/product";

export const products: Product[] = [
  {
    id: 1,
    slug: "marble-beige",
    article: "MB-001",
    category: "budget",
    base: "felt",
    collection: "Marble",
    name: "Мармур Беж",
    description:
      "Бюджетний килим з мармуровим візерунком у бежевих тонах.",
    price: 799,

    colors: ["Бежевий"],
    widths: [80, 100, 120, 150],

    images: ["/products/marble-beige.jpg"],

    productionTime: "1-3 дні",

    inStock: true,
    featured: true,
    new: true,
  },

  {
    id: 2,
    slug: "marble-gray",
    article: "MB-002",
    category: "budget",
    base: "felt",
    collection: "Marble",
    name: "Мармур Сірий",
    description:
      "Стильний сірий килим з сучасним мармуровим дизайном.",
    price: 849,

    colors: ["Сірий"],
    widths: [80, 100, 120, 150],

    images: ["/products/marble-gray.jpg"],

    productionTime: "1-3 дні",

    inStock: true,
    featured: false,
    new: true,
  },

  {
    id: 3,
    slug: "anny-beige",
    article: "AN-001",
    category: "premium",
    base: "woven",
    collection: "Anny",
    name: "Anny Беж",
    description:
      "М'який килим середнього ворсу для вітальні та спальні.",
    price: 1499,

    colors: ["Бежевий"],
    widths: [100, 120, 150, 200],

    images: ["/products/anny-beige.jpg"],

    productionTime: "2-5 днів",

    inStock: true,
    featured: true,
    new: false,
  },
];