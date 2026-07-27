"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import Header from "../../components/Header";

type OrderItem = {
  id?: number;
  name?: string;
  quantity?: number;
  price?: number;
  width?: number;
  length?: number;
  area?: number;
};

type Order = {
  id?: string;
  orderNumber?: number;
  accessToken?: string;
  status?: string;
  customerName?: string;
  phone?: string;
  delivery?: string;
  city?: string;
  warehouse?: string;
  paymentMethod?: string;
  total?: number;
  paidAmount?: number;
  amountDue?: number;
  createdAt?: string;
  items?: OrderItem[];
};

const statusLabels: Record<string, string> = {
  new: "Нове замовлення",
  pending: "Очікує обробки",
  processing: "В роботі",
  confirmed: "Підтверджено",
  production: "Виготовляється",
  ready: "Готове",
  shipped: "Відправлено",
  completed: "Виконано",
  canceled: "Скасовано",
};

const statusSteps = [
  "new",
  "confirmed",
  "production",
  "ready",
  "shipped",
  "completed",
];

function formatMoney(value?: number) {
  return new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function formatDate(value?: string) {
  if (!value) {
    return "Дата не вказана";
  }

  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function getOrderTokens() {
  try {
    const saved = localStorage.getItem(
      "dreamcarpet-order-tokens"
    );

    if (!saved) {
      return [];
    }

    const parsed = JSON.parse(saved);

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (
          item &&
          typeof item === "object" &&
          "accessToken" in item
        ) {
          return String(item.accessToken);
        }

        if (
          item &&
          typeof item === "object" &&
          "token" in item
        ) {
          return String(item.token);
        }

        return "";
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

function getStatusLabel(status?: string) {
  if (!status) {
    return "Нове замовлення";
  }

  return statusLabels[status] || status;
}

function getStepIndex(status?: string) {
  const currentStatus = status || "new";
  const index = statusSteps.indexOf(currentStatus);

  if (index === -1) {
    return 0;
  }

  return index;
}

export default function MyOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasTokens, setHasTokens] = useState(false);

  async function loadOrders() {
    setIsLoading(true);

    const tokens = getOrderTokens();
    setHasTokens(tokens.length > 0);

    if (tokens.length === 0) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/my-orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({ tokens }),
      });

      const data = await response.json();

      if (response.ok && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setOrders([]);
      }
    } catch (error) {
      console.error("Не вдалося отримати замовлення:", error);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  const totalOrders = orders.length;

  const totalSum = useMemo(() => {
    return orders.reduce(
      (sum, order) => sum + (order.total || 0),
      0
    );
  }, [orders]);

  return (
    <>
      <Header />

      <main className="page">
        <section className="hero">
          <p className="label">DreamCarpet</p>

          <h1>Мої замовлення</h1>

          <p>
            Тут покупець бачить свої замовлення, статус,
            суму, оплату та товари.
          </p>
        </section>

        <section className="summary">
          <div>
            <span>Замовлень</span>
            <strong>{totalOrders}</strong>
          </div>

          <div>
            <span>Загальна сума</span>
            <strong>{formatMoney(totalSum)} грн</strong>
          </div>

          <button type="button" onClick={loadOrders}>
            Оновити статус
          </button>
        </section>

        {isLoading ? (
          <section className="empty">
            Завантаження замовлень...
          </section>
        ) : !hasTokens ? (
          <section className="empty">
            <h2>У вас ще немає замовлень</h2>

            <p>
              Після оформлення замовлення воно автоматично
              з’явиться на цій сторінці.
            </p>

            <Link href="/catalog">
              Перейти до каталогу
            </Link>
          </section>
        ) : orders.length === 0 ? (
          <section className="empty">
            <h2>Замовлення не знайдено</h2>

            <p>
              Можливо, замовлення було оформлене з іншого
              браузера або очищено історію сайту.
            </p>

            <Link href="/catalog">
              Перейти до каталогу
            </Link>
          </section>
        ) : (
          <section className="orders">
            {orders.map((order) => {
              const currentIndex = getStepIndex(order.status);

              return (
                <article
                  key={order.accessToken || order.id}
                  className="order-card"
                >
                  <div className="order-top">
                    <div>
                      <span className="small">
                        Замовлення
                      </span>

                      <h2>
                        №
                        {order.orderNumber ||
                          order.id ||
                          "—"}
                      </h2>

                      <p>{formatDate(order.createdAt)}</p>
                    </div>

                    <div className="status">
                      {getStatusLabel(order.status)}
                    </div>
                  </div>

                  <div className="progress">
                    {statusSteps.map((step, index) => (
                      <div
                        key={step}
                        className={
                          index <= currentIndex
                            ? "step active"
                            : "step"
                        }
                      >
                        <span>{index + 1}</span>
                        <p>{statusLabels[step]}</p>
                      </div>
                    ))}
                  </div>

                  <div className="info-grid">
                    <div>
                      <span>Ім’я</span>
                      <strong>
                        {order.customerName || "—"}
                      </strong>
                    </div>

                    <div>
                      <span>Телефон</span>
                      <strong>{order.phone || "—"}</strong>
                    </div>

                    <div>
                      <span>Доставка</span>
                      <strong>
                        {order.delivery || "—"}
                      </strong>
                    </div>

                    <div>
                      <span>Місто</span>
                      <strong>{order.city || "—"}</strong>
                    </div>

                    <div>
                      <span>Відділення</span>
                      <strong>
                        {order.warehouse || "—"}
                      </strong>
                    </div>

                    <div>
                      <span>Оплата</span>
                      <strong>
                        {order.paymentMethod || "—"}
                      </strong>
                    </div>
                  </div>

                  <div className="money-grid">
                    <div>
                      <span>Сума</span>
                      <strong>
                        {formatMoney(order.total)} грн
                      </strong>
                    </div>

                    <div>
                      <span>Оплачено</span>
                      <strong>
                        {formatMoney(order.paidAmount)} грн
                      </strong>
                    </div>

                    <div>
                      <span>До оплати</span>
                      <strong>
                        {formatMoney(order.amountDue)} грн
                      </strong>
                    </div>
                  </div>

                  <div className="items">
                    <h3>Товари</h3>

                    {order.items && order.items.length > 0 ? (
                      order.items.map((item, index) => (
                        <div key={index} className="item">
                          <div>
                            <strong>
                              {item.name || "Товар"}
                            </strong>

                            <p>
                              {item.width && item.length
                                ? `${item.width} м × ${item.length} м`
                                : "Розмір не вказано"}
                              {item.area
                                ? ` · ${item.area} м²`
                                : ""}
                            </p>
                          </div>

                          <span>
                            {item.quantity || 1} шт.
                          </span>
                        </div>
                      ))
                    ) : (
                      <p>Товари не вказані</p>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </main>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background:
            radial-gradient(
              circle at top left,
              rgba(212, 175, 55, 0.22),
              transparent 28%
            ),
            linear-gradient(
              180deg,
              #f1dfbf 0%,
              #e8d0a8 50%,
              #d6b989 100%
            );
          color: #171717;
          padding-bottom: 70px;
        }

        .hero,
        .summary,
        .orders,
        .empty {
          max-width: 1180px;
          margin: 0 auto;
          padding-left: 20px;
          padding-right: 20px;
        }

        .hero {
          padding-top: 50px;
          padding-bottom: 28px;
          text-align: center;
        }

        .label {
          margin: 0 0 12px;
          color: #9d721c;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        h1 {
          max-width: 820px;
          margin: 0 auto;
          font-size: clamp(38px, 6vw, 70px);
          line-height: 1;
          letter-spacing: -2px;
        }

        .hero p {
          max-width: 650px;
          margin: 18px auto 0;
          color: #5e5245;
          font-size: 18px;
          line-height: 1.6;
        }

        .summary {
          display: grid;
          grid-template-columns: 1fr 1fr auto;
          gap: 16px;
          margin-bottom: 28px;
        }

        .summary div,
        .summary button,
        .order-card,
        .empty {
          border-radius: 24px;
          background: #fff2dc;
          border: 1px solid #b9892b;
          box-shadow: 0 18px 45px rgba(40, 30, 15, 0.12);
        }

        .summary div {
          display: grid;
          gap: 6px;
          padding: 20px;
        }

        .summary span,
        .info-grid span,
        .money-grid span,
        .small {
          color: #8a6518;
          font-size: 13px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .summary strong {
          font-size: 30px;
        }

        .summary button {
          padding: 0 24px;
          background: #171717;
          color: #ffffff;
          font: inherit;
          font-weight: 900;
          cursor: pointer;
        }

        .orders {
          display: grid;
          gap: 22px;
        }

        .order-card {
          padding: 24px;
        }

        .order-top {
          display: flex;
          justify-content: space-between;
          gap: 18px;
          align-items: flex-start;
          margin-bottom: 22px;
        }

        .order-top h2 {
          margin: 4px 0;
          font-size: 34px;
        }

        .order-top p {
          margin: 0;
          color: #5e5245;
        }

        .status {
          border-radius: 999px;
          background: #171717;
          color: #ffd95a;
          padding: 12px 16px;
          font-weight: 900;
          white-space: nowrap;
        }

        .progress {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 10px;
          margin-bottom: 22px;
        }

        .step {
          display: grid;
          gap: 8px;
          text-align: center;
          color: #75634e;
        }

        .step span {
          width: 34px;
          height: 34px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 999px;
          background: #d7c3a2;
          color: #171717;
          font-weight: 900;
        }

        .step.active span {
          background: #d4af37;
        }

        .step p {
          margin: 0;
          font-size: 12px;
          font-weight: 800;
        }

        .info-grid,
        .money-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 18px;
        }

        .info-grid div,
        .money-grid div {
          display: grid;
          gap: 6px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.45);
          padding: 14px;
        }

        .info-grid strong,
        .money-grid strong {
          font-size: 17px;
        }

        .money-grid strong {
          font-size: 24px;
        }

        .items {
          border-radius: 18px;
          background: #171717;
          color: #ffffff;
          padding: 18px;
        }

        .items h3 {
          margin: 0 0 14px;
          color: #ffd95a;
          font-size: 24px;
        }

        .item {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          padding: 12px 0;
          border-top: 1px solid rgba(255, 255, 255, 0.12);
        }

        .item p {
          margin: 6px 0 0;
          color: #d8cbb8;
        }

        .item span {
          color: #ffd95a;
          font-weight: 900;
          white-space: nowrap;
        }

        .empty {
          padding-top: 36px;
          padding-bottom: 36px;
          text-align: center;
        }

        .empty h2 {
          margin: 0 0 12px;
          font-size: 34px;
        }

        .empty p {
          max-width: 620px;
          margin: 0 auto 20px;
          color: #5e5245;
          line-height: 1.6;
        }

        .empty a {
          display: inline-flex;
          justify-content: center;
          align-items: center;
          min-height: 52px;
          padding: 0 24px;
          border-radius: 14px;
          background: #d4af37;
          color: #171717;
          text-decoration: none;
          font-weight: 900;
        }

        @media (max-width: 850px) {
          .summary,
          .info-grid,
          .money-grid,
          .progress {
            grid-template-columns: 1fr;
          }

          .order-top {
            flex-direction: column;
          }

          .status {
            white-space: normal;
          }
        }
      `}</style>
    </>
  );
}