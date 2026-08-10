"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import FavoriteButton from "../../../../components/FavoriteButton";
import type { Product } from "../../../../types/product";

type CategoryProductsClientProps = {
  title?: string;
  description?: string;
  products: Product[];
};

const baseOptions = [
  { value: "all", label: "Усі основи" },
  { value: "felt", label: "Повстяна" },
  { value: "jute", label: "Джутова" },
  { value: "woven", label: "Ткана" },
  { value: "latex", label: "Латексна / резинова" },
  { value: "stitched", label: "Дарничанка" },
];

const typeOptions = [
  { value: "all", label: "Усі типи" },
  { value: "runner", label: "Доріжка" },
  { value: "rug", label: "Килим" },
  { value: "doormat", label: "Килимок" },
];

const pileOptions = [
  { value: "all", label: "Усі варіанти" },
  { value: "flat", label: "Безворсовий" },
  { value: "medium", label: "Середній ворс" },
  { value: "high", label: "Високий ворс" },
];

const materialOptions = [
  { value: "all", label: "Усі матеріали" },
  { value: "polypropylene", label: "Поліпропілен" },
  { value: "polyester", label: "Поліестер" },
  { value: "wool", label: "Вовна" },
  { value: "viscose", label: "Віскоза" },
  { value: "cotton", label: "Бавовна" },
  { value: "microfiber", label: "Мікрофібра" },
  { value: "acrylic", label: "Акрил" },
  { value: "mixed", label: "Змішаний" },
];

const styleOptions = [
  { value: "all", label: "Усі стилі" },
  { value: "modern", label: "Сучасний" },
  { value: "classic", label: "Класичний" },
  { value: "loft", label: "Лофт" },
  { value: "minimalism", label: "Мінімалізм" },
  { value: "scandinavian", label: "Скандинавський" },
  { value: "provence", label: "Прованс" },
  { value: "vintage", label: "Вінтаж" },
  { value: "children", label: "Дитячий" },
  { value: "oriental", label: "Східний" },
  { value: "geometric", label: "Геометрія" },
];

const roomOptions = [
  { value: "all", label: "Усі кімнати" },
  { value: "hallway", label: "Передпокій" },
  { value: "corridor", label: "Коридор" },
  { value: "kitchen", label: "Кухня" },
  { value: "bedroom", label: "Спальня" },
  { value: "living-room", label: "Вітальня" },
  { value: "children", label: "Дитяча" },
  { value: "bathroom", label: "Ванна" },
  { value: "office", label: "Офіс" },
  { value: "balcony", label: "Балкон" },
  { value: "terrace", label: "Тераса" },
  { value: "outdoor", label: "Вулиця" },
  { value: "commercial", label: "Комерція" },
];

function normalize(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replaceAll("ё", "е")
    .replaceAll("ї", "і");
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 0,
  }).format(value);
}

function productSearchText(product: Product) {
  return normalize(
    [
      product.name,
      product.article,
      product.collection,
      product.description,
      product.category,
      product.base,
      product.productType || "",
      product.pile || "",
      product.material || "",
      product.shape || "",
      product.brand || "",
      product.country || "",
      product.colors?.join(" ") || "",
      product.widths?.join(" ") || "",
      product.rooms?.join(" ") || "",
      product.styles?.join(" ") || "",
      product.features?.join(" ") || "",
      product.price,
    ].join(" ")
  );
}

export default function CategoryProductsClient({
  products,
}: CategoryProductsClientProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const [search, setSearch] = useState("");
  const [base, setBase] = useState("all");
  const [productType, setProductType] = useState("all");
  const [pile, setPile] = useState("all");
  const [material, setMaterial] = useState("all");
  const [style, setStyle] = useState("all");
  const [room, setRoom] = useState("all");
  const [color, setColor] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [onlyInStock, setOnlyInStock] = useState(true);

  function clearFilters() {
    setSearch("");
    setBase("all");
    setProductType("all");
    setPile("all");
    setMaterial("all");
    setStyle("all");
    setRoom("all");
    setColor("");
    setMinPrice("");
    setMaxPrice("");
    setOnlyInStock(true);
  }

  const filteredProducts = useMemo(() => {
    const normalizedSearch = normalize(search);
    const normalizedColor = normalize(color);

    const min = Number(minPrice);
    const max = Number(maxPrice);

    return products.filter((product) => {
      const currentProductType =
        product.productType || "runner";

      const currentPile = product.pile || "flat";

      if (onlyInStock && !product.inStock) {
        return false;
      }

      if (base !== "all" && product.base !== base) {
        return false;
      }

      if (
        productType !== "all" &&
        currentProductType !== productType
      ) {
        return false;
      }

      if (pile !== "all" && currentPile !== pile) {
        return false;
      }

      if (
        material !== "all" &&
        product.material !== material
      ) {
        return false;
      }

      if (
        style !== "all" &&
        !product.styles?.includes(
          style as Product["styles"] extends Array<infer T>
            ? T
            : never
        )
      ) {
        return false;
      }

      if (
        room !== "all" &&
        !product.rooms?.includes(
          room as Product["rooms"] extends Array<infer T>
            ? T
            : never
        )
      ) {
        return false;
      }

      if (
        normalizedColor &&
        !normalize(product.colors?.join(" ") || "").includes(
          normalizedColor
        )
      ) {
        return false;
      }

      if (
        minPrice.trim() !== "" &&
        Number.isFinite(min) &&
        product.price < min
      ) {
        return false;
      }

      if (
        maxPrice.trim() !== "" &&
        Number.isFinite(max) &&
        product.price > max
      ) {
        return false;
      }

      if (
        normalizedSearch &&
        !productSearchText(product).includes(
          normalizedSearch
        )
      ) {
        return false;
      }

      return true;
    });
  }, [
    products,
    search,
    base,
    productType,
    pile,
    material,
    style,
    room,
    color,
    minPrice,
    maxPrice,
    onlyInStock,
  ]);

  return (
    <div className="catalog-layout">
      <button
        type="button"
        className="filters-mobile-button"
        onClick={() =>
          setIsFiltersOpen((current) => !current)
        }
      >
        <span>🎯 Фільтри</span>
        <strong>
          {isFiltersOpen ? "Закрити" : "Відкрити"}
        </strong>
      </button>

      <aside
        className={
          isFiltersOpen
            ? "filters-card open"
            : "filters-card"
        }
      >
        <div className="filters-top">
          <h2>Фільтри</h2>

          <button type="button" onClick={clearFilters}>
            Очистити
          </button>
        </div>

        <label>
          <span>Пошук</span>

          <input
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Назва, артикул, колекція..."
          />
        </label>

        <label>
          <span>Основа</span>

          <select
            value={base}
            onChange={(event) => setBase(event.target.value)}
          >
            {baseOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Тип товару</span>

          <select
            value={productType}
            onChange={(event) =>
              setProductType(event.target.value)
            }
          >
            {typeOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Тип ворсу</span>

          <select
            value={pile}
            onChange={(event) => setPile(event.target.value)}
          >
            {pileOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Матеріал</span>

          <select
            value={material}
            onChange={(event) =>
              setMaterial(event.target.value)
            }
          >
            {materialOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Стиль</span>

          <select
            value={style}
            onChange={(event) =>
              setStyle(event.target.value)
            }
          >
            {styleOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Кімната</span>

          <select
            value={room}
            onChange={(event) => setRoom(event.target.value)}
          >
            {roomOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
              >
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Колір</span>

          <input
            value={color}
            onChange={(event) => setColor(event.target.value)}
            placeholder="Бежевий, сірий, синій..."
          />
        </label>

        <div className="price-grid">
          <label>
            <span>Ціна від</span>

            <input
              type="number"
              value={minPrice}
              onChange={(event) =>
                setMinPrice(event.target.value)
              }
              placeholder="0"
            />
          </label>

          <label>
            <span>Ціна до</span>

            <input
              type="number"
              value={maxPrice}
              onChange={(event) =>
                setMaxPrice(event.target.value)
              }
              placeholder="5000"
            />
          </label>
        </div>

        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={onlyInStock}
            onChange={(event) =>
              setOnlyInStock(event.target.checked)
            }
          />

          <span>Тільки в наявності</span>
        </label>
      </aside>

      <section className="products-side">
        <div className="products-top">
          <h2>
            Знайдено: {filteredProducts.length}
          </h2>

          <p>
            Оберіть товар, відкрийте картку та порахуйте
            ціну по розміру.
          </p>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="empty">
            Нічого не знайдено. Спробуйте очистити фільтри.
          </div>
        ) : (
          <div className="products-grid">
            {filteredProducts.map((product) => {
              const image = product.images?.[0] || "";

              return (
                <article
                  key={product.id}
                  className="product-card"
                >
                  <div className="image-box">
                    <Link
                      href={`/catalog/${product.id}`}
                      className="image-link"
                      style={{
                        position: "absolute",
                        inset: 0,
                      }}
                    >
                      {image ? (
                        <Image
                          src={image}
                          alt={product.name}
                          fill
                          sizes="(max-width: 768px) 50vw, 320px"
                          loading="eager"
                        />
                      ) : (
                        <div className="no-image">
                          Немає фото
                        </div>
                      )}
                    </Link>

                    <FavoriteButton
                      productId={product.id}
                      variant="floating"
                    />

                    <div className="badges">
                      {product.new && <span>Новинка</span>}
                      {product.featured && <span>Топ</span>}
                    </div>
                  </div>

                  <div className="product-info">
                    <span className="article">
                      {product.article}
                    </span>

                    <Link
                      href={`/catalog/${product.id}`}
                      className="product-title"
                    >
                      <h3>{product.name}</h3>
                    </Link>

                    <p>{product.collection || "DreamCarpet"}</p>

                    <div className="product-meta">
                      <span>
                        {product.colors?.[0] || "Колір"}
                      </span>

                      <span>
                        {product.widths?.length
                          ? `${product.widths[0]} м`
                          : "Ширина"}
                      </span>
                    </div>

                    <div className="price">
                      <strong>
                        {formatNumber(product.price)} грн
                      </strong>

                      <span>
                        /{" "}
                        {product.priceType === "piece"
                          ? "шт."
                          : "м²"}
                      </span>
                    </div>

                    <Link
                      href={`/catalog/${product.id}`}
                      className="details-button"
                    >
                      Переглянути
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <style jsx>{`
        .catalog-layout {
          display: grid;
          grid-template-columns: 340px minmax(0, 1fr);
          gap: 24px;
          align-items: start;
        }

        .filters-mobile-button {
          display: none;
        }

        .filters-card,
        .product-card,
        .empty {
          border-radius: 24px;
          background: #fff2dc;
          border: 1px solid #b9892b;
          box-shadow: 0 18px 45px rgba(40, 30, 15, 0.1);
        }

        .filters-card {
          position: sticky;
          top: 110px;
          display: grid;
          gap: 16px;
          padding: 20px;
        }

        .filters-top {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
          padding-bottom: 14px;
          border-bottom: 1px solid rgba(185, 137, 43, 0.3);
        }

        .filters-top h2 {
          margin: 0;
          font-size: 28px;
        }

        .filters-top button {
          min-height: 44px;
          padding: 0 16px;
          border-radius: 12px;
          border: none;
          background: #171717;
          color: #ffffff;
          font: inherit;
          font-weight: 900;
          cursor: pointer;
        }

        label {
          display: grid;
          gap: 8px;
        }

        label span {
          font-size: 14px;
          font-weight: 900;
        }

        input,
        select {
          width: 100%;
          box-sizing: border-box;
          padding: 13px;
          border-radius: 13px;
          border: 1px solid #c8a56d;
          background: #ffffff;
          color: #171717;
          font: inherit;
        }

        input:focus,
        select:focus {
          outline: none;
          border-color: #d4af37;
          box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.18);
        }

        .price-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          gap: 10px;
          border-radius: 14px;
          background: rgba(255, 255, 255, 0.45);
          padding: 12px;
          cursor: pointer;
        }

        .checkbox-label input {
          width: 18px;
          height: 18px;
        }

        .products-side {
          min-width: 0;
        }

        .products-top {
          margin-bottom: 18px;
        }

        .products-top h2 {
          margin: 0;
          font-size: 34px;
        }

        .products-top p {
          margin: 8px 0 0;
          color: #5e5245;
          line-height: 1.5;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 18px;
        }

        .product-card {
          overflow: hidden;
        }

        .image-box {
          position: relative;
          aspect-ratio: 1.12 / 1;
          background: #d2b27f;
        }

        .image-link {
          position: absolute;
          inset: 0;
          display: block;
        }

        .image-box :global(img) {
          object-fit: cover;
        }

        .no-image {
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #5e5245;
          font-weight: 900;
        }

        .badges {
          position: absolute;
          top: 12px;
          left: 12px;
          z-index: 4;
          display: flex;
          gap: 8px;
        }

        .badges span {
          border-radius: 999px;
          background: #171717;
          color: #ffffff;
          padding: 7px 10px;
          font-size: 12px;
          font-weight: 900;
        }

        .product-info {
          display: grid;
          gap: 9px;
          padding: 16px;
        }

        .article {
          color: #9d721c;
          font-size: 13px;
          font-weight: 900;
        }

        .product-title {
          color: #171717;
          text-decoration: none;
        }

        .product-title h3 {
          margin: 0;
          font-size: 22px;
          line-height: 1.15;
        }

        .product-info p {
          margin: 0;
          color: #5e5245;
        }

        .product-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .product-meta span {
          border-radius: 999px;
          background: #171717;
          color: #ffffff;
          padding: 7px 10px;
          font-size: 12px;
          font-weight: 800;
        }

        .price {
          display: flex;
          gap: 5px;
          align-items: baseline;
        }

        .price strong {
          font-size: 24px;
        }

        .price span {
          color: #5e5245;
          font-weight: 800;
        }

        .details-button {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 46px;
          border-radius: 13px;
          background: #171717;
          color: #ffffff;
          text-decoration: none;
          font-weight: 900;
        }

        .empty {
          padding: 30px;
          text-align: center;
          color: #5e5245;
          font-weight: 900;
        }

        @media (max-width: 900px) {
          .catalog-layout {
            grid-template-columns: 1fr;
            gap: 16px;
          }

        .filters-mobile-button {
  position: static;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-height: 58px;
  margin-bottom: 16px;
  padding: 0 18px;
  border-radius: 16px;
  border: 1px solid #d4af37;
  background: #171717;
  color: #ffffff;
  font-size: 18px;
  font-weight: 900;
  box-shadow: 0 14px 30px rgba(20, 15, 8, 0.18);
}

          .filters-mobile-button strong {
            color: #ffd95a;
          }

          .filters-card {
            position: static;
            display: none;
            padding: 18px;
          }

          .filters-card.open {
            display: grid;
          }

          .products-top {
            display: none;
          }

          .products-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .product-card {
            border-radius: 16px;
            box-shadow: none;
            background: #fff8eb;
          }

          .image-box {
            aspect-ratio: 0.82 / 1;
            height: auto;
            background: #eee4d4;
          }

          .image-box :global(img) {
            object-fit: cover;
            object-position: center;
          }

          .badges {
            top: 7px;
            left: 7px;
            gap: 4px;
          }

          .badges span {
            padding: 5px 7px;
            font-size: 9px;
          }

          .product-info {
            gap: 6px;
            padding: 10px;
          }

          .article {
            font-size: 10px;
          }

          .product-title h3 {
            display: -webkit-box;
            overflow: hidden;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            min-height: 36px;
            font-size: 16px;
            line-height: 1.12;
          }

          .product-info p {
            display: -webkit-box;
            overflow: hidden;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 1;
            font-size: 12px;
          }

          .product-meta {
            gap: 4px;
          }

          .product-meta span {
            padding: 5px 7px;
            font-size: 9px;
          }

          .price {
            gap: 3px;
          }

          .price strong {
            font-size: 19px;
          }

          .price span {
            font-size: 10px;
          }

          .details-button {
            min-height: 38px;
            border-radius: 999px;
            font-size: 12px;
            background:
              linear-gradient(
                135deg,
                #d4af37,
                #ffd95a
              );
            color: #111111;
          }
        }
      `}</style>
    </div>
  );
}