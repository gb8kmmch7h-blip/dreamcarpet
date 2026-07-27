export type ProductCategory =
  | "budget"
  | "standard"
  | "premium"
  | "turkey";

export type ProductBase =
  | "felt"
  | "jute"
  | "woven"
  | "latex"
  | "stitched";

export type ProductType =
  | "runner"
  | "rug"
  | "doormat";

export type ProductPile =
  | "flat"
  | "medium"
  | "high";

export type ProductRoom =
  | "hallway"
  | "corridor"
  | "kitchen"
  | "bedroom"
  | "living-room"
  | "children"
  | "bathroom"
  | "office"
  | "balcony"
  | "terrace"
  | "outdoor"
  | "commercial";

export type ProductMaterial =
  | "polypropylene"
  | "polyester"
  | "wool"
  | "viscose"
  | "cotton"
  | "microfiber"
  | "acrylic"
  | "mixed";

export type ProductStyle =
  | "modern"
  | "classic"
  | "loft"
  | "minimalism"
  | "scandinavian"
  | "provence"
  | "vintage"
  | "children"
  | "oriental"
  | "geometric";

export type ProductShape =
  | "runner"
  | "rectangle"
  | "square"
  | "round"
  | "oval"
  | "custom";

export type ProductPriceType =
  | "square-meter"
  | "piece";

export interface Product {
  id: number;

  slug: string;

  article: string;

  category: ProductCategory;

  base: ProductBase;

  productType?: ProductType;

  pile?: ProductPile;

  /*
    Висота ворсу завжди зберігається
    у міліметрах.

    Наприклад:
    0.2 = 0,2 мм
    12 = 1,2 см
    30 = 3 см
  */
  pileHeightMm?: number;

  /*
    Загальна висота товару в міліметрах.
    Наприклад: 5 мм.
  */
  totalHeightMm?: number;

  rooms?: ProductRoom[];

  material?: ProductMaterial;

  styles?: ProductStyle[];

  shape?: ProductShape;

  brand?: string;

  country?: string;

  collection: string;

  name: string;

  description: string;

  /*
    Короткий список особливостей товару.
    Наприклад:
    ["Зносостійкий", "Легкий у догляді"]
  */
  features?: string[];

  price: number;

  priceType?: ProductPriceType;

  colors: string[];

  widths: number[];

  /*
    Для готових килимів можна буде
    зберігати доступні довжини.
  */
  lengths?: number[];

  images: string[];

  productionTime: string;

  inStock: boolean;

  featured: boolean;

  new: boolean;

  /*
    SEO-поля. Якщо вони не заповнені,
    сайт зможе створювати стандартні
    значення автоматично.
  */
  seoTitle?: string;

  seoDescription?: string;

  seoKeywords?: string[];
}