"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type ReviewStatus =
  | "pending"
  | "approved"
  | "rejected";

type Review = {
  id: string;
  productId: number;
  productName: string;
  name: string;
  rating: number;
  text: string;
  status: ReviewStatus;
  createdAt: string;
};

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("uk-UA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function statusLabel(status: ReviewStatus) {
  if (status === "approved") {
    return "Опубліковано";
  }

  if (status === "rejected") {
    return "Відхилено";
  }

  return "Очікує";
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");

  const loadReviews = useCallback(async () => {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch(
        "/api/reviews/admin",
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
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Не вдалося завантажити відгуки."
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadReviews();
  }, [loadReviews]);

  const stats = useMemo(() => {
    const pending = reviews.filter(
      (review) => review.status === "pending"
    ).length;

    const approved = reviews.filter(
      (review) => review.status === "approved"
    ).length;

    const rejected = reviews.filter(
      (review) => review.status === "rejected"
    ).length;

    return {
      total: reviews.length,
      pending,
      approved,
      rejected,
    };
  }, [reviews]);

  async function updateReview(
    id: string,
    status: ReviewStatus
  ) {
    setSavingId(id);
    setMessage("");

    try {
      const response = await fetch(
        "/api/reviews/admin",
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id,
            status,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Не вдалося оновити відгук."
        );
      }

      setReviews((current) =>
        current.map((review) =>
          review.id === id
            ? {
                ...review,
                status,
              }
            : review
        )
      );

      setMessage("Відгук оновлено ✅");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Не вдалося оновити відгук."
      );
    } finally {
      setSavingId("");
    }
  }

  async function deleteReview(id: string) {
    const confirmed = window.confirm(
      "Видалити цей відгук назавжди?"
    );

    if (!confirmed) {
      return;
    }

    setSavingId(id);
    setMessage("");

    try {
      const response = await fetch(
        "/api/reviews/admin",
        {
          method: "DELETE",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            id,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Не вдалося видалити відгук."
        );
      }

      setReviews((current) =>
        current.filter(
          (review) => review.id !== id
        )
      );

      setMessage("Відгук видалено 🗑");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Не вдалося видалити відгук."
      );
    } finally {
      setSavingId("");
    }
  }

  return (
    <main className="page">
      <div className="container">
        <section className="hero">
          <p className="eyebrow">
            ⭐ DreamCarpet Admin
          </p>

          <h1>Відгуки покупців</h1>

          <p>
            Тут можна перевіряти нові відгуки,
            публікувати їх або відхиляти.
          </p>
        </section>

        <section className="stats">
          <div>
            <span>Усього</span>
            <strong>{stats.total}</strong>
          </div>

          <div>
            <span>Очікують</span>
            <strong>{stats.pending}</strong>
          </div>

          <div>
            <span>Опубліковані</span>
            <strong>{stats.approved}</strong>
          </div>

          <div>
            <span>Відхилені</span>
            <strong>{stats.rejected}</strong>
          </div>
        </section>

        <div className="top-actions">
          <a href="/admin">
            ← До товарів
          </a>

          <button
            type="button"
            onClick={() => void loadReviews()}
          >
            Оновити
          </button>
        </div>

        {message && (
          <div className="message">
            {message}
          </div>
        )}

        {isLoading ? (
          <div className="empty">
            Завантаження відгуків...
          </div>
        ) : reviews.length === 0 ? (
          <div className="empty">
            Відгуків поки немає.
          </div>
        ) : (
          <section className="reviews-list">
            {reviews.map((review) => {
              const isSaving =
                savingId === review.id;

              return (
                <article
                  className="review-card"
                  key={review.id}
                >
                  <div className="review-head">
                    <div>
                      <p className="product-name">
                        {review.productName}
                      </p>

                      <h2>{review.name}</h2>

                      <span>
                        {formatDate(
                          review.createdAt
                        )}
                      </span>
                    </div>

                    <div
                      className={`status ${review.status}`}
                    >
                      {statusLabel(
                        review.status
                      )}
                    </div>
                  </div>

                  <div className="stars">
                    {"★".repeat(
                      review.rating
                    )}
                    <span>
                      {"★".repeat(
                        5 - review.rating
                      )}
                    </span>
                  </div>

                  <p className="review-text">
                    {review.text}
                  </p>

                  <div className="meta">
                    <span>
                      ID товару:{" "}
                      <strong>
                        {review.productId}
                      </strong>
                    </span>

                    <a
                      href={`/catalog/${review.productId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Відкрити товар →
                    </a>
                  </div>

                  <div className="actions">
                    <button
                      type="button"
                      disabled={
                        isSaving ||
                        review.status ===
                          "approved"
                      }
                      className="approve"
                      onClick={() =>
                        void updateReview(
                          review.id,
                          "approved"
                        )
                      }
                    >
                      ✅ Опублікувати
                    </button>

                    <button
                      type="button"
                      disabled={
                        isSaving ||
                        review.status ===
                          "rejected"
                      }
                      className="reject"
                      onClick={() =>
                        void updateReview(
                          review.id,
                          "rejected"
                        )
                      }
                    >
                      ❌ Відхилити
                    </button>

                    <button
                      type="button"
                      disabled={isSaving}
                      className="delete"
                      onClick={() =>
                        void deleteReview(
                          review.id
                        )
                      }
                    >
                      🗑 Видалити
                    </button>
                  </div>

                  {isSaving && (
                    <p className="saving">
                      Збереження...
                    </p>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 40px 20px 80px;
          background: #f3eadb;
          color: #171717;
        }

        .container {
          max-width: 1180px;
          margin: 0 auto;
        }

        .hero {
          margin-bottom: 24px;
          padding: 30px;
          border-radius: 24px;
          background:
            linear-gradient(
              135deg,
              #111111,
              #2a2117
            );
          color: #ffffff;
          border: 1px solid #d4af37;
        }

        .eyebrow {
          margin: 0 0 8px;
          color: #d4af37;
          font-weight: 900;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .hero h1 {
          margin: 0;
          font-size: clamp(
            36px,
            6vw,
            54px
          );
        }

        .hero p:last-child {
          margin-bottom: 0;
          color: #e7dbc7;
          line-height: 1.6;
        }

        .stats {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }

        .stats > div {
          padding: 20px;
          border-radius: 18px;
          background: #ffffff;
          border: 1px solid #dbc9ad;
        }

        .stats span {
          display: block;
          color: #776854;
          font-weight: 700;
        }

        .stats strong {
          display: block;
          margin-top: 8px;
          font-size: 32px;
        }

        .top-actions {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 20px;
        }

        .top-actions a,
        .top-actions button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 44px;
          padding: 0 16px;
          border-radius: 12px;
          border: 0;
          background: #171717;
          color: #ffffff;
          text-decoration: none;
          font: inherit;
          font-weight: 900;
          cursor: pointer;
        }

        .message,
        .empty {
          margin-bottom: 18px;
          padding: 16px;
          border-radius: 14px;
          background: #ffffff;
          border: 1px solid #dbc9ad;
          font-weight: 800;
        }

        .reviews-list {
          display: grid;
          gap: 18px;
        }

        .review-card {
          padding: 24px;
          border-radius: 22px;
          background: #ffffff;
          border: 1px solid #dbc9ad;
          box-shadow:
            0 16px 38px
            rgba(40, 30, 15, 0.08);
        }

        .review-head {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: flex-start;
        }

        .product-name {
          margin: 0 0 5px;
          color: #8f6717;
          font-size: 13px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .review-head h2 {
          margin: 0 0 5px;
          font-size: 24px;
        }

        .review-head span {
          color: #776854;
          font-size: 14px;
        }

        .status {
          padding: 8px 12px;
          border-radius: 999px;
          font-size: 13px;
          font-weight: 900;
        }

        .status.pending {
          background: #fff0c7;
          color: #7a5710;
        }

        .status.approved {
          background: #e4f5e7;
          color: #276831;
        }

        .status.rejected {
          background: #fde7e7;
          color: #8f2828;
        }

        .stars {
          margin-top: 18px;
          color: #d4af37;
          font-size: 22px;
          letter-spacing: 2px;
        }

        .stars span {
          color: #d9ccba;
        }

        .review-text {
          margin: 16px 0;
          color: #3d352d;
          line-height: 1.65;
          font-size: 17px;
        }

        .meta {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          padding-top: 14px;
          border-top: 1px solid #eee2d2;
          color: #6e604f;
        }

        .meta a {
          color: #171717;
          font-weight: 900;
        }

        .actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-top: 18px;
        }

        .actions button {
          min-height: 44px;
          padding: 0 15px;
          border: 0;
          border-radius: 11px;
          color: #ffffff;
          font: inherit;
          font-weight: 900;
          cursor: pointer;
        }

        .actions button:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .approve {
          background: #2d7a3b;
        }

        .reject {
          background: #a56d1d;
        }

        .delete {
          background: #a72828;
        }

        .saving {
          margin: 10px 0 0;
          color: #8f6717;
          font-weight: 800;
        }

        @media (
          max-width: 850px
        ) {
          .stats {
            grid-template-columns:
              repeat(2, 1fr);
          }
        }

        @media (
          max-width: 560px
        ) {
          .page {
            padding-left: 12px;
            padding-right: 12px;
          }

          .stats {
            grid-template-columns: 1fr;
          }

          .review-head,
          .meta,
          .top-actions {
            display: grid;
          }

          .actions {
            display: grid;
          }

          .actions button {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}