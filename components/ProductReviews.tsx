"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

type Review = {
  id: string;
  productId: number;
  productName: string;
  name: string;
  rating: number;
  text: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};

type ProductReviewsProps = {
  productId: number;
  productName: string;
};

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "";
  }
}

export default function ProductReviews({
  productId,
  productName,
}: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadReviews() {
    setIsLoading(true);

    try {
      const response = await fetch(
        `/api/reviews?productId=${productId}`,
        {
          cache: "no-store",
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Не вдалося завантажити відгуки."
        );
      }

      setReviews(
        Array.isArray(data.reviews)
          ? data.reviews
          : []
      );
    } catch (loadError) {
      console.error(
        "Помилка завантаження відгуків:",
        loadError
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadReviews();
  }, [productId]);

  const averageRating = useMemo(() => {
    if (reviews.length === 0) {
      return 0;
    }

    const total = reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );

    return total / reviews.length;
  }, [reviews]);

  async function submitReview(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (name.trim().length < 2) {
      setError("Вкажіть ваше ім’я.");
      return;
    }

    if (text.trim().length < 10) {
      setError(
        "Напишіть трохи детальніший відгук — мінімум 10 символів."
      );
      return;
    }

    setIsSending(true);

    try {
      const response = await fetch(
        "/api/reviews",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            productId,
            productName,
            name: name.trim(),
            rating,
            text: text.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Не вдалося надіслати відгук."
        );
      }

      setName("");
      setText("");
      setRating(5);
      setMessage(
        "Дякуємо! Відгук надіслано на перевірку ✅"
      );
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Не вдалося надіслати відгук."
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <section className="reviews-section">
      <div className="reviews-container">
        <div className="reviews-header">
          <div>
            <p className="eyebrow">
              ⭐ Відгуки покупців
            </p>

            <h2>Що кажуть про цей товар</h2>

            {reviews.length > 0 ? (
              <p className="rating-line">
                <strong>
                  {averageRating.toFixed(1)}
                </strong>{" "}
                / 5 · {reviews.length}{" "}
                {reviews.length === 1
                  ? "відгук"
                  : "відгуків"}
              </p>
            ) : (
              <p className="rating-line">
                Поки немає опублікованих
                відгуків.
              </p>
            )}
          </div>
        </div>

        <div className="reviews-layout">
          <div className="reviews-list">
            {isLoading ? (
              <div className="empty-card">
                Завантаження відгуків...
              </div>
            ) : reviews.length === 0 ? (
              <div className="empty-card">
                Станьте першим, хто залишить
                відгук про цей товар.
              </div>
            ) : (
              reviews.map((review) => (
                <article
                  className="review-card"
                  key={review.id}
                >
                  <div className="review-top">
                    <div>
                      <strong>
                        {review.name}
                      </strong>

                      <span>
                        {formatDate(
                          review.createdAt
                        )}
                      </span>
                    </div>

                    <div
                      className="stars"
                      aria-label={`${review.rating} з 5`}
                    >
                      {"★".repeat(
                        review.rating
                      )}
                      <span>
                        {"★".repeat(
                          5 - review.rating
                        )}
                      </span>
                    </div>
                  </div>

                  <p>{review.text}</p>
                </article>
              ))
            )}
          </div>

          <form
            className="review-form"
            onSubmit={submitReview}
          >
            <p className="form-label">
              Залишити відгук
            </p>

            <h3>
              Оцініть {productName}
            </h3>

            <div className="rating-picker">
              {[1, 2, 3, 4, 5].map(
                (star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() =>
                      setRating(star)
                    }
                    aria-label={`${star} з 5`}
                    className={
                      star <= rating
                        ? "active"
                        : ""
                    }
                  >
                    ★
                  </button>
                )
              )}
            </div>

            <label>
              Ваше ім’я
              <input
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                maxLength={60}
                placeholder="Наприклад: Олена"
              />
            </label>

            <label>
              Ваш відгук
              <textarea
                value={text}
                onChange={(event) =>
                  setText(event.target.value)
                }
                maxLength={1200}
                rows={6}
                placeholder="Розкажіть про якість, колір, доставку..."
              />
            </label>

            <p className="moderation-note">
              Відгук з’явиться на сайті
              після перевірки адміністратором.
            </p>

            {message && (
              <div className="success">
                {message}
              </div>
            )}

            {error && (
              <div className="error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="submit-button"
              disabled={isSending}
            >
              {isSending
                ? "Надсилання..."
                : "Надіслати відгук"}
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .reviews-section {
          background: #f1dfbf;
          padding: 58px 20px 80px;
          color: #171717;
        }

        .reviews-container {
          max-width: 1180px;
          margin: 0 auto;
        }

        .reviews-header {
          margin-bottom: 24px;
        }

        .eyebrow,
        .form-label {
          margin: 0 0 8px;
          color: #8f6717;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 1.1px;
          text-transform: uppercase;
        }

        h2 {
          margin: 0;
          font-size: clamp(32px, 5vw, 48px);
          line-height: 1.05;
        }

        .rating-line {
          margin: 12px 0 0;
          color: #5e5245;
        }

        .rating-line strong {
          color: #171717;
          font-size: 22px;
        }

        .reviews-layout {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr) minmax(320px, 420px);
          gap: 24px;
          align-items: start;
        }

        .reviews-list {
          display: grid;
          gap: 16px;
        }

        .review-card,
        .empty-card,
        .review-form {
          border: 1px solid #b9892b;
          border-radius: 24px;
          background: #fff2dc;
          box-shadow:
            0 18px 45px rgba(40, 30, 15, 0.1);
        }

        .review-card,
        .empty-card {
          padding: 22px;
        }

        .review-top {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: flex-start;
        }

        .review-top > div:first-child {
          display: grid;
          gap: 4px;
        }

        .review-top span {
          color: #7a6b59;
          font-size: 13px;
        }

        .stars {
          color: #d4af37;
          font-size: 19px;
          letter-spacing: 2px;
          white-space: nowrap;
        }

        .stars span {
          color: #d6c8b3;
        }

        .review-card p {
          margin: 16px 0 0;
          color: #40372e;
          line-height: 1.65;
        }

        .review-form {
          position: sticky;
          top: 100px;
          display: grid;
          gap: 16px;
          padding: 24px;
        }

        .review-form h3 {
          margin: -4px 0 0;
          font-size: 24px;
        }

        .rating-picker {
          display: flex;
          gap: 5px;
        }

        .rating-picker button {
          border: 0;
          background: transparent;
          color: #d6c8b3;
          padding: 0;
          font-size: 34px;
          cursor: pointer;
        }

        .rating-picker button.active {
          color: #d4af37;
        }

        label {
          display: grid;
          gap: 8px;
          font-weight: 800;
        }

        input,
        textarea {
          box-sizing: border-box;
          width: 100%;
          border: 1px solid #b9a58a;
          border-radius: 13px;
          background: #ffffff;
          color: #171717;
          padding: 13px 14px;
          font: inherit;
          resize: vertical;
        }

        .moderation-note {
          margin: 0;
          padding: 12px;
          border-radius: 12px;
          background: #f4e6ce;
          color: #685945;
          font-size: 14px;
          line-height: 1.5;
        }

        .success,
        .error {
          padding: 12px 14px;
          border-radius: 12px;
          font-weight: 800;
        }

        .success {
          background: #e8f6e8;
          color: #246b2d;
        }

        .error {
          background: #fff0f0;
          color: #a32222;
        }

        .submit-button {
          min-height: 52px;
          border: 0;
          border-radius: 14px;
          background:
            linear-gradient(
              135deg,
              #d4af37,
              #ffd95a
            );
          color: #111111;
          font-size: 16px;
          font-weight: 900;
          cursor: pointer;
        }

        .submit-button:disabled {
          opacity: 0.65;
          cursor: wait;
        }

        @media (max-width: 900px) {
          .reviews-layout {
            grid-template-columns: 1fr;
          }

          .review-form {
            position: static;
          }
        }

        @media (max-width: 560px) {
          .reviews-section {
            padding-left: 14px;
            padding-right: 14px;
          }

          .review-top {
            display: grid;
          }
        }
      `}</style>
    </section>
  );
}