"use client";

import Image from "next/image";
import Link from "next/link";
import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";

import FavoriteButton from "../../components/FavoriteButton";
import type { Product } from "../../types/product";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

type Recommendation = {
  product: Product;
  score: number;
  reasons: string[];
};

type AssistantResponse = {
  success?: boolean;
  answer?: string;
  message?: string;
  recommendations?: Recommendation[];
};

const quickQuestions = [
  "Потрібна сіра доріжка в коридор до 1500 грн",
  "Хочу м’який килим у спальню",
  "Що краще взяти на кухню, щоб легко чистилось?",
  "Потрібен килим у вітальню в сучасному стилі",
  "Як доглядати за килимом з високим ворсом?",
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 0,
  }).format(value);
}

function createMessageId() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}`;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>(
    [
      {
        id: "welcome",
        role: "assistant",
        text: "Привіт 👋 Я консультант DreamCarpet. Напишіть, куди потрібен килим, який колір, ворс і бюджет — я підберу варіанти з каталогу.",
      },
    ]
  );

  const [input, setInput] = useState("");
  const [recommendations, setRecommendations] =
    useState<Recommendation[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] =
    useState("");

  const messagesEndRef = useRef<HTMLDivElement | null>(
    null
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  async function sendMessage(text: string) {
    const cleanText = text.trim();

    if (!cleanText || isLoading) {
      return;
    }

    setErrorMessage("");
    setInput("");

    const userMessage: ChatMessage = {
      id: createMessageId(),
      role: "user",
      text: cleanText,
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
    ]);

    setIsLoading(true);

    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: cleanText,
        }),
      });

      const data =
        (await response.json()) as AssistantResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Консультант зараз не відповідає."
        );
      }

      const assistantMessage: ChatMessage = {
        id: createMessageId(),
        role: "assistant",
        text:
          data.answer ||
          "Я підібрав варіанти з каталогу.",
      };

      setMessages((currentMessages) => [
        ...currentMessages,
        assistantMessage,
      ]);

      setRecommendations(
        Array.isArray(data.recommendations)
          ? data.recommendations
          : []
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Сталася помилка.";

      setErrorMessage(message);

      setMessages((currentMessages) => [
        ...currentMessages,
        {
          id: createMessageId(),
          role: "assistant",
          text: "Вибачте, зараз не можу відповісти. Спробуйте ще раз або перейдіть у каталог.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    void sendMessage(input);
  }

  return (
    <main className="assistant-page">
      <section className="assistant-container">
        <header className="hero">
          <div>
            <p className="eyebrow">
              DreamCarpet AI
            </p>

            <h1>
              Онлайн-консультант по килимах
            </h1>

            <p>
              Напишіть звичайним текстом, який килим
              шукаєте. Консультант поставить акцент на
              кімнату, колір, ворс, бюджет і покаже
              відповідні товари з каталогу.
            </p>
          </div>

          <div className="hero-card">
            <strong>🤖 Живий чат</strong>
            <span>
              Працює по товарах DreamCarpet
            </span>
          </div>
        </header>

        <div className="layout">
          <section className="chat-panel">
            <div className="chat-header">
              <div>
                <h2>Чат з консультантом</h2>

                <p>
                  Приклад: “Потрібна бежева доріжка
                  в коридор до 2000 грн”.
                </p>
              </div>

              <span className="status">
                Онлайн
              </span>
            </div>

            <div className="messages">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`message ${message.role}`}
                >
                  <div className="bubble">
                    {message.text}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="message assistant">
                  <div className="bubble typing">
                    Думаю над підбором...
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {errorMessage && (
              <div className="error">
                {errorMessage}
              </div>
            )}

            <div className="quick">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() =>
                    void sendMessage(question)
                  }
                  disabled={isLoading}
                >
                  {question}
                </button>
              ))}
            </div>

            <form
              className="input-row"
              onSubmit={handleSubmit}
            >
              <input
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                placeholder="Напишіть: потрібна сіра доріжка в коридор до 1500 грн..."
              />

              <button
                type="submit"
                disabled={isLoading || !input.trim()}
              >
                Надіслати
              </button>
            </form>
          </section>

          <aside className="recommendations">
            <div className="recommendations-header">
              <div>
                <h2>
                  Рекомендації
                </h2>

                <p>
                  Тут з’являться товари після
                  повідомлення.
                </p>
              </div>

              <strong>
                {recommendations.length}
              </strong>
            </div>

            {recommendations.length === 0 ? (
              <div className="empty">
                <div>🧶</div>

                <h3>
                  Напишіть запит консультанту
                </h3>

                <p>
                  Наприклад: “потрібен килим у спальню,
                  м’який, до 2500 грн”.
                </p>
              </div>
            ) : (
              <div className="products">
                {recommendations.map(
                  ({ product, score, reasons }) => {
                    const image =
                      product.images?.[0] || "";

                    return (
                      <article
                        key={product.id}
                        className="product-card"
                      >
                        <div className="image-box">
                          <Link
                            href={`/catalog/${product.id}`}
                            className="image-link"
                          >
                            {image ? (
                              <Image
                                src={image}
                                alt={product.name}
                                fill
                                sizes="(max-width: 900px) 100vw, 360px"
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

                          <span className="match">
                            {Math.min(score * 7, 99)}%
                            збіг
                          </span>
                        </div>

                        <div className="product-content">
                          <span className="article">
                            {product.article}
                          </span>

                          <Link
                            href={`/catalog/${product.id}`}
                            className="title-link"
                          >
                            <h3>
                              {product.name}
                            </h3>
                          </Link>

                          <p className="reason">
                            {reasons.length > 0
                              ? `Підходить: ${reasons.join(", ")}.`
                              : "Схожий варіант із каталогу."}
                          </p>

                          <div className="price">
                            <strong>
                              {formatNumber(
                                product.price
                              )}{" "}
                              грн
                            </strong>

                            <span>
                              /{" "}
                              {product.priceType ===
                              "piece"
                                ? "шт."
                                : "м²"}
                            </span>
                          </div>

                          <Link
                            href={`/catalog/${product.id}`}
                            className="details"
                          >
                            Переглянути товар →
                          </Link>
                        </div>
                      </article>
                    );
                  }
                )}
              </div>
            )}
          </aside>
        </div>
      </section>

      <style jsx>{`
        .assistant-page {
          min-height: 100vh;
          padding: 50px 20px 80px;
          background: #f5f2ec;
          color: #181714;
        }

        .assistant-container {
          width: min(1450px, 100%);
          margin: 0 auto;
        }

        .hero {
          display: flex;
          justify-content: space-between;
          align-items: stretch;
          gap: 24px;
          margin-bottom: 30px;
        }

        .eyebrow {
          margin: 0 0 8px;
          color: #8a7656;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 1.2px;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          max-width: 830px;
          font-size: clamp(38px, 6vw, 64px);
          line-height: 0.98;
        }

        .hero p {
          max-width: 780px;
          margin: 18px 0 0;
          color: #6f6a62;
          font-size: 18px;
          line-height: 1.6;
        }

        .hero-card {
          min-width: 270px;
          display: grid;
          align-content: center;
          gap: 8px;
          padding: 24px;
          border-radius: 24px;
          background: #181714;
          color: #ffffff;
          box-shadow: 0 18px 45px
            rgba(44, 36, 24, 0.14);
        }

        .hero-card strong {
          font-size: 28px;
        }

        .hero-card span {
          color: #ddd2bf;
          line-height: 1.4;
        }

        .layout {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 430px;
          gap: 24px;
          align-items: start;
        }

        .chat-panel,
        .recommendations {
          border: 1px solid #ded7ca;
          border-radius: 26px;
          background: #ffffff;
          box-shadow: 0 14px 35px
            rgba(44, 36, 24, 0.06);
          overflow: hidden;
        }

        .chat-header,
        .recommendations-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          padding: 22px;
          border-bottom: 1px solid #eee7dc;
        }

        .chat-header h2,
        .recommendations-header h2 {
          margin: 0;
          font-size: 28px;
        }

        .chat-header p,
        .recommendations-header p {
          margin: 8px 0 0;
          color: #6f6a62;
          line-height: 1.4;
        }

        .status {
          border-radius: 999px;
          background: #ecf9f0;
          color: #216d38;
          padding: 8px 12px;
          font-weight: 900;
        }

        .recommendations-header strong {
          min-width: 50px;
          height: 50px;
          display: inline-flex;
          justify-content: center;
          align-items: center;
          border-radius: 16px;
          background: #d4af37;
          color: #111111;
          font-size: 24px;
        }

        .messages {
          height: 430px;
          overflow-y: auto;
          padding: 22px;
          background:
            radial-gradient(
              circle at top left,
              rgba(212, 175, 55, 0.12),
              transparent 35%
            ),
            #fbfaf7;
        }

        .message {
          display: flex;
          margin-bottom: 14px;
        }

        .message.user {
          justify-content: flex-end;
        }

        .message.assistant {
          justify-content: flex-start;
        }

        .bubble {
          max-width: min(620px, 82%);
          padding: 14px 16px;
          border-radius: 18px;
          line-height: 1.55;
          font-weight: 700;
          white-space: pre-wrap;
        }

        .message.user .bubble {
          background: #181714;
          color: #ffffff;
          border-bottom-right-radius: 6px;
        }

        .message.assistant .bubble {
          background: #ffffff;
          color: #181714;
          border: 1px solid #ded7ca;
          border-bottom-left-radius: 6px;
        }

        .typing {
          color: #6f6a62;
        }

        .error {
          margin: 15px 22px 0;
          padding: 13px;
          border-radius: 12px;
          background: #fff0f0;
          color: #a32323;
          font-weight: 800;
        }

        .quick {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          padding: 18px 22px 0;
        }

        .quick button {
          border: 1px solid #ded7ca;
          border-radius: 999px;
          background: #f8f5ef;
          color: #181714;
          padding: 9px 12px;
          font-weight: 800;
          cursor: pointer;
        }

        .quick button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .input-row {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 12px;
          padding: 22px;
        }

        .input-row input {
          width: 100%;
          box-sizing: border-box;
          border: 1px solid #d8d0c3;
          border-radius: 14px;
          background: #ffffff;
          color: #181714;
          padding: 15px;
          font: inherit;
          outline: none;
        }

        .input-row input:focus {
          border-color: #8a7656;
          box-shadow: 0 0 0 4px
            rgba(138, 118, 86, 0.12);
        }

        .input-row button {
          border: none;
          border-radius: 14px;
          background: #181714;
          color: #ffffff;
          padding: 0 22px;
          font-weight: 900;
          cursor: pointer;
        }

        .input-row button:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .recommendations {
          position: sticky;
          top: 24px;
        }

        .empty {
          padding: 35px 22px;
          text-align: center;
          color: #6f6a62;
        }

        .empty div {
          font-size: 52px;
          margin-bottom: 14px;
        }

        .empty h3 {
          margin: 0 0 10px;
          color: #181714;
          font-size: 24px;
        }

        .empty p {
          margin: 0;
          line-height: 1.5;
        }

        .products {
          display: grid;
          gap: 16px;
          padding: 18px;
          max-height: 690px;
          overflow-y: auto;
        }

        .product-card {
          overflow: hidden;
          border: 1px solid #ded7ca;
          border-radius: 22px;
          background: #ffffff;
        }

        .image-box {
          position: relative;
          aspect-ratio: 1.25 / 1;
          background: #eeeae2;
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
          color: #777169;
          font-weight: 900;
        }

        .match {
          position: absolute;
          left: 12px;
          bottom: 12px;
          z-index: 4;
          border-radius: 999px;
          background: #181714;
          color: #ffffff;
          padding: 7px 10px;
          font-size: 12px;
          font-weight: 900;
        }

        .product-content {
          display: grid;
          gap: 9px;
          padding: 15px;
        }

        .article {
          color: #8a7656;
          font-size: 13px;
          font-weight: 900;
        }

        .title-link {
          color: #181714;
          text-decoration: none;
        }

        .product-content h3 {
          margin: 0;
          font-size: 21px;
          line-height: 1.15;
        }

        .reason {
          margin: 0;
          color: #6f6a62;
          line-height: 1.45;
        }

        .price {
          display: flex;
          align-items: baseline;
          gap: 5px;
        }

        .price strong {
          font-size: 23px;
        }

        .price span {
          color: #716d65;
          font-weight: 800;
        }

        .details {
          display: inline-flex;
          justify-content: center;
          padding: 12px 14px;
          border-radius: 12px;
          background: #181714;
          color: #ffffff;
          text-decoration: none;
          font-weight: 900;
        }

        @media (max-width: 1050px) {
          .hero {
            flex-direction: column;
          }

          .layout {
            grid-template-columns: 1fr;
          }

          .recommendations {
            position: static;
          }

          .messages {
            height: 380px;
          }
        }

        @media (max-width: 620px) {
          .input-row {
            grid-template-columns: 1fr;
          }

          .input-row button {
            padding: 15px;
          }

          .bubble {
            max-width: 92%;
          }
        }
      `}</style>
    </main>
  );
}