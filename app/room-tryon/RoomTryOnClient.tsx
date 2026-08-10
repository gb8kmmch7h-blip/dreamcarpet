"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ChangeEvent,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSearchParams } from "next/navigation";

import type { Product } from "../../types/product";

function formatNumber(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 2,
  }).format(value);
}

export function RoomTryOnClient() {
  const searchParams = useSearchParams();

  const productId = Number(
    searchParams.get("product")
  );

  const selectedColor =
    searchParams.get("color") || "";

  const selectedWidth = Number(
    (searchParams.get("width") || "0").replace(",", ".")
  );

  const selectedLength = Number(
    (searchParams.get("length") || "0").replace(",", ".")
  );

  const [product, setProduct] =
    useState<Product | null>(null);

  const [isLoading, setIsLoading] =
    useState(true);

  const [roomFile, setRoomFile] =
    useState<File | null>(null);

  const [roomPreview, setRoomPreview] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [generatedImage, setGeneratedImage] =
    useState("");

  const [isGenerating, setIsGenerating] =
    useState(false);

  useEffect(() => {
    async function loadProduct() {
      try {
        const response = await fetch(
          "/api/products",
          {
            cache: "no-store",
          }
        );

        const data = await response.json();

        const products: Product[] =
          Array.isArray(data)
            ? data
            : Array.isArray(data.products)
              ? data.products
              : [];

        const found =
          products.find(
            (item) =>
              item.id === productId
          ) ?? null;

        setProduct(found);
      } catch (error) {
        console.error(
          "Не вдалося завантажити товар:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadProduct();
  }, [productId]);

  useEffect(() => {
    return () => {
      if (roomPreview) {
        URL.revokeObjectURL(
          roomPreview
        );
      }
    };
  }, [roomPreview]);

  function handleRoomPhoto(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      event.target.files?.[0] ??
      null;

    if (roomPreview) {
      URL.revokeObjectURL(
        roomPreview
      );
    }

    setMessage("");
    setRoomFile(file);

    if (file) {
      setRoomPreview(
        URL.createObjectURL(file)
      );
    } else {
      setRoomPreview("");
    }
  }

  const area = useMemo(() => {
    if (
      selectedWidth <= 0 ||
      selectedLength <= 0
    ) {
      return 0;
    }

    return (
      selectedWidth *
      selectedLength
    );
  }, [
    selectedWidth,
    selectedLength,
  ]);

  async function startTryOn() {
    if (!roomFile) {
      setMessage(
        "Спочатку завантажте фото кімнати."
      );
      return;
    }

    if (!product) {
      setMessage(
        "Не вдалося визначити вибраний товар."
      );
      return;
    }

    setIsGenerating(true);
    setMessage("");
    setGeneratedImage("");

    try {
      const formData = new FormData();

      formData.append(
        "roomPhoto",
        roomFile
      );

      formData.append(
        "productId",
        String(product.id)
      );

      formData.append(
        "color",
        selectedColor ||
          product.colors?.[0] ||
          ""
      );

      formData.append(
        "width",
        String(selectedWidth || "")
      );

      formData.append(
        "length",
        String(selectedLength || "")
      );

      const response = await fetch(
        "/api/room-tryon",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Не вдалося створити AI-примірку."
        );
      }

      if (!data.image) {
        throw new Error(
          "AI не повернув готове зображення."
        );
      }

      setGeneratedImage(data.image);

      setMessage(
        "AI-примірка готова ✅"
      );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Не вдалося створити AI-примірку."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  if (isLoading) {
    return (
      <main className="page">
        <div className="loading">
          Завантаження...
        </div>

        <style jsx>{`
          .page {
            min-height: 100vh;
            display: grid;
            place-items: center;
            background: #f1dfbf;
          }

          .loading {
            font-weight: 900;
          }
        `}</style>
      </main>
    );
  }

  if (!product) {
    return (
      <main className="page">
        <div className="not-found">
          <h1>
            Товар не знайдено
          </h1>

          <Link href="/catalog">
            ← Повернутися до каталогу
          </Link>
        </div>

        <style jsx>{`
          .page {
            min-height: 100vh;
            display: grid;
            place-items: center;
            padding: 20px;
            background: #f1dfbf;
          }

          .not-found {
            text-align: center;
          }
        `}</style>
      </main>
    );
  }

  const productImage =
    product.images?.[0] || "";

  return (
    <main className="page">
      <div className="container">
        <section className="hero">
          <p className="eyebrow">
            ✨ AI-примірка DreamCarpet
          </p>

          <h1>
            Подивіться, як килим
            виглядатиме у вашій кімнаті
          </h1>

          <p>
            Товар уже вибрано.
            Вам залишилося лише
            завантажити фото кімнати.
          </p>
        </section>

        <section className="layout">
          <aside className="selected-product">
            <p className="small-label">
              Вибраний килим
            </p>

            <div className="product-image">
              {productImage ? (
                <Image
                  src={productImage}
                  alt={product.name}
                  fill
                  sizes="360px"
                />
              ) : (
                <span>
                  Немає фото
                </span>
              )}
            </div>

            <h2>{product.name}</h2>

            <div className="details">
              <div>
                <span>Колір</span>
                <strong>
                  {selectedColor ||
                    product.colors?.[0] ||
                    "Не вказано"}
                </strong>
              </div>

              <div>
                <span>Ширина</span>
                <strong>
                  {selectedWidth > 0
                    ? `${formatNumber(
                        selectedWidth
                      )} м`
                    : "Не вказано"}
                </strong>
              </div>

              <div>
                <span>Довжина</span>
                <strong>
                  {selectedLength > 0
                    ? `${formatNumber(
                        selectedLength
                      )} м`
                    : "Не вказано"}
                </strong>
              </div>

              {area > 0 && (
                <div>
                  <span>Площа</span>
                  <strong>
                    {formatNumber(area)} м²
                  </strong>
                </div>
              )}
            </div>

            <Link
              href={`/catalog/${product.id}`}
              className="back-link"
            >
              ← Змінити вибір
            </Link>
          </aside>

          <section className="upload-card">
            <div>
              <p className="small-label">
                Крок 1
              </p>

              <h2>
                Завантажте фото кімнати
              </h2>

              <p className="hint">
                Найкращий результат буде,
                якщо на фото добре видно
                підлогу та місце, де має
                лежати килим.
              </p>
            </div>

            <label className="upload-zone">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={
                  handleRoomPhoto
                }
              />

              {roomPreview ? (
                <div className="room-preview">
                  <Image
                    src={roomPreview}
                    alt="Фото кімнати"
                    fill
                    unoptimized
                  />
                </div>
              ) : (
                <div className="upload-placeholder">
                  <span className="upload-icon">
                    📷
                  </span>

                  <strong>
                    Обрати фото кімнати
                  </strong>

                  <small>
                    JPG, PNG або WEBP
                  </small>
                </div>
              )}
            </label>

            {roomFile && (
              <div className="file-info">
                ✅ {roomFile.name}
              </div>
            )}

            <button
              type="button"
              className="generate-button"
              onClick={startTryOn}
              disabled={
                !roomFile ||
                isGenerating
              }
            >
              {isGenerating
                ? "✨ AI створює примірку..."
                : "✨ Створити AI-примірку"}
            </button>

            {message && (
              <div className="message">
                {message}
              </div>
            )}

            {generatedImage && (
              <section className="result-card">
                <p className="small-label">
                  Результат
                </p>

                <h2>
                  Ваш килим у кімнаті
                </h2>

                <div className="generated-image">
                  <Image
                    src={generatedImage}
                    alt={`AI-примірка ${product.name} у кімнаті`}
                    fill
                    unoptimized
                  />
                </div>

                <div className="result-actions">
                  <button
                    type="button"
                    onClick={startTryOn}
                    disabled={isGenerating}
                  >
                    🔄 Спробувати ще раз
                  </button>

                  <Link
                    href={{
                      pathname: `/catalog/${product.id}`,
                      query: {
                        ...(selectedWidth > 0
                          ? {
                              width: String(
                                selectedWidth
                              ),
                            }
                          : {}),
                        ...(selectedLength > 0
                          ? {
                              length: String(
                                selectedLength
                              ),
                            }
                          : {}),
                      },
                    }}
                  >
                    🛒 Повернутися до товару
                  </Link>
                </div>
              </section>
            )}

            <p className="privacy">
              Фото використовується лише
              для створення примірки.
            </p>
          </section>
        </section>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 40px 20px 80px;
          background:
            radial-gradient(
              circle at top left,
              rgba(212, 175, 55, 0.24),
              transparent 28%
            ),
            linear-gradient(
              180deg,
              #f1dfbf 0%,
              #e2c797 100%
            );
          color: #171717;
        }

        .container {
          max-width: 1180px;
          margin: 0 auto;
        }

        .hero {
          margin-bottom: 24px;
          padding: 34px;
          border-radius: 28px;
          background:
            radial-gradient(
              circle at top right,
              rgba(212, 175, 55, 0.28),
              transparent 34%
            ),
            linear-gradient(
              135deg,
              #101010,
              #281f13
            );
          color: #ffffff;
          border: 1px solid #d4af37;
        }

        .eyebrow,
        .small-label {
          margin: 0 0 8px;
          color: #b28325;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .hero .eyebrow {
          color: #d4af37;
        }

        .hero h1 {
          max-width: 850px;
          margin: 0;
          font-size: clamp(
            36px,
            6vw,
            58px
          );
          line-height: 1;
        }

        .hero > p:last-child {
          margin: 16px 0 0;
          color: #e6dac7;
          font-size: 18px;
        }

        .layout {
          display: grid;
          grid-template-columns:
            360px minmax(0, 1fr);
          gap: 22px;
          align-items: start;
        }

        .selected-product,
        .upload-card {
          border-radius: 24px;
          background: #fff2dc;
          border: 1px solid #b9892b;
          box-shadow:
            0 18px 45px
            rgba(40, 30, 15, 0.1);
        }

        .selected-product {
          padding: 20px;
        }

        .product-image {
          position: relative;
          overflow: hidden;
          height: 250px;
          border-radius: 18px;
          background: #d7c09b;
        }

        .product-image :global(img),
        .room-preview :global(img) {
          object-fit: cover;
        }

        .product-image > span {
          display: grid;
          height: 100%;
          place-items: center;
        }

        .selected-product h2 {
          margin: 16px 0;
          font-size: 25px;
        }

        .details {
          display: grid;
          gap: 9px;
        }

        .details > div {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid #dfcaa7;
        }

        .details span {
          color: #6f604e;
        }

        .back-link {
          display: inline-flex;
          margin-top: 18px;
          color: #171717;
          font-weight: 900;
        }

        .upload-card {
          display: grid;
          gap: 18px;
          padding: 28px;
        }

        .upload-card h2 {
          margin: 0;
          font-size: clamp(
            30px,
            5vw,
            44px
          );
        }

        .hint {
          margin: 10px 0 0;
          color: #665846;
          line-height: 1.6;
        }

        .upload-zone {
          display: block;
          cursor: pointer;
        }

        .upload-zone input {
          position: absolute;
          width: 1px;
          height: 1px;
          opacity: 0;
          pointer-events: none;
        }

        .upload-placeholder,
        .room-preview {
          overflow: hidden;
          position: relative;
          min-height: 360px;
          border: 2px dashed #aa8136;
          border-radius: 20px;
          background: #ffffff;
        }

        .upload-placeholder {
          display: grid;
          place-items: center;
          align-content: center;
          gap: 8px;
          text-align: center;
        }

        .upload-icon {
          font-size: 50px;
        }

        .upload-placeholder strong {
          font-size: 20px;
        }

        .upload-placeholder small {
          color: #776854;
        }

        .file-info,
        .message {
          padding: 12px 14px;
          border-radius: 12px;
          background: #efe2cd;
          font-weight: 800;
        }

        .generate-button {
          min-height: 56px;
          border: 0;
          border-radius: 14px;
          background:
            linear-gradient(
              135deg,
              #d4af37,
              #ffd95a
            );
          color: #111111;
          font: inherit;
          font-size: 17px;
          font-weight: 900;
          cursor: pointer;
        }

        .generate-button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .result-card {
          display: grid;
          gap: 14px;
          margin-top: 8px;
          padding: 20px;
          border-radius: 20px;
          background: #171717;
          color: #ffffff;
          border: 1px solid #d4af37;
        }

        .result-card h2 {
          margin: 0;
          color: #ffffff;
          font-size: 28px;
        }

        .generated-image {
          position: relative;
          overflow: hidden;
          min-height: 420px;
          border-radius: 18px;
          background: #2a2117;
        }

        .generated-image :global(img) {
          object-fit: contain;
        }

        .result-actions {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 10px;
        }

        .result-actions button,
        .result-actions :global(a) {
          display: inline-flex;
          min-height: 48px;
          align-items: center;
          justify-content: center;
          padding: 0 14px;
          border: 0;
          border-radius: 12px;
          font: inherit;
          font-weight: 900;
          text-decoration: none;
          cursor: pointer;
        }

        .result-actions button {
          background: #d4af37;
          color: #111111;
        }

        .result-actions :global(a) {
          background: #ffffff;
          color: #111111;
        }

        .privacy {
          margin: 0;
          color: #776854;
          font-size: 13px;
          text-align: center;
        }

        @media (max-width: 850px) {
          .layout {
            grid-template-columns: 1fr;
          }

          .selected-product {
            display: grid;
            grid-template-columns:
              160px minmax(0, 1fr);
            gap: 16px;
          }

          .selected-product
            .small-label,
          .selected-product
            .back-link {
            grid-column: 1 / -1;
          }

          .product-image {
            height: 160px;
          }
        }

        @media (max-width: 560px) {
          .page {
            padding-left: 12px;
            padding-right: 12px;
          }

          .hero,
          .upload-card {
            padding: 22px 18px;
          }

          .selected-product {
            display: block;
          }

          .product-image {
            height: 240px;
          }

          .upload-placeholder,
          .room-preview,
          .generated-image {
            min-height: 280px;
          }

          .result-actions {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}