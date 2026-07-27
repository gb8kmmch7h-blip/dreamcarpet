"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import Header from "../../../components/Header";

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
  updatedAt?: string;
  items?: OrderItem[];
};

const statusLabels: Record<string, string> = {
  new: "Нове",
  pending: "Очікує",
  processing: "В роботі",
  confirmed: "Підтверджено",
  production: "Виготовляється",
  ready: "Готове",
  shipped: "Відправлено",
  completed: "Виконано",
  canceled: "Скасовано",
};

const statuses = [
  "new",
  "pending",
  "processing",
  "confirmed",
  "production",
  "ready",
  "shipped",
  "completed",
  "canceled",
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

function getOrderId(order: Order) {
  return String(
    order.id ||
      order.accessToken ||
      order.orderNumber ||
      ""
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [message, setMessage] = useState("");

  async function loadOrders() {
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/orders", {
        cache: "no-store",
      });

      const data = await response.json();

      const loadedOrders = Array.isArray(data)
        ? data
        : Array.isArray(data.orders)
          ? data.orders
          : [];

      setOrders(loadedOrders);
    } catch (error) {
      console.error("Не вдалося завантажити замовлення:", error);
      setOrders([]);
      setMessage("Не вдалося завантажити замовлення");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  async function updateOrder(
    order: Order,
    status: string,
    paidAmount?: number
  ) {
    const id = getOrderId(order);

    if (!id) {
      setMessage("У замовлення немає ID");
      return;
    }

    setSavingId(id);
    setMessage("");

    try {
      const response = await fetch(
        `/api/orders/${encodeURIComponent(id)}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            paidAmount,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(
          data.message || "Не вдалося оновити замовлення"
        );
        return;
      }

      setOrders((currentOrders) =>
        currentOrders.map((currentOrder) => {
          if (getOrderId(currentOrder) !== id) {
            return currentOrder;
          }

          return data.order as Order;
        })
      );

      setMessage("Замовлення оновлено ✅");
    } catch (error) {
      console.error("Не вдалося оновити замовлення:", error);
      setMessage("Помилка оновлення замовлення");
    } finally {
      setSavingId("");
    }
  }

  const stats = useMemo(() => {
    const total = orders.reduce(
      (sum, order) => sum + (order.total || 0),
      0
    );

    const active = orders.filter(
      (order) =>
        order.status !== "completed" &&
        order.status !== "canceled"
    ).length;

    return {
      count: orders.length,
      active,
      total,
    };
  }, [orders]);

  return (
    <>
      <Header />

      <main className="page">
        <section className="hero">
          <p className="label">Адмін-панель</p>

          <h1>Замовлення</h1>

          <p>
            Тут можна переглядати замовлення, змінювати
            статуси та суму оплати.
          </p>
        </section>

        <section className="top-actions">
          <Link href="/admin/products">
            ← Товари
          </Link>

          <button type="button" onClick={loadOrders}>
            Оновити
          </button>
        </section>

        <section className="stats">
          <div>
            <span>Всього замовлень</span>
            <strong>{stats.count}</strong>
          </div>

          <div>
            <span>Активні</span>
            <strong>{stats.active}</strong>
          </div>

          <div>
            <span>Сума</span>
            <strong>{formatMoney(stats.total)} грн</strong>
          </div>
        </section>

        {message && (
          <section className="message">
            {message}
          </section>
        )}

        {isLoading ? (
          <section className="empty">
            Завантаження замовлень...
          </section>
        ) : orders.length === 0 ? (
          <section className="empty">
            Замовлень поки немає.
          </section>
        ) : (
          <section className="orders">
            {orders.map((order) => {
              const id = getOrderId(order);
              const isSaving = savingId === id;
              const currentStatus = order.status || "new";

              return (
                <article key={id} className="order-card">
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
                      {statusLabels[currentStatus] ||
                        currentStatus}
                    </div>
                  </div>

                  <div className="grid">
                    <div>
                      <span>Клієнт</span>
                      <strong>
                        {order.customerName || "—"}
                      </strong>
                    </div>

                    <div>
                      <span>Телефон</span>
                      <strong>{order.phone || "—"}</strong>
                    </div>

                    <div>
                      <span>Місто</span>
                      <strong>{order.city || "—"}</strong>
                    </div>

                    <div>
                      <span>Доставка</span>
                      <strong>
                        {order.delivery || "—"}
                      </strong>
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
                      <input
                        type="number"
                        min="0"
                        defaultValue={order.paidAmount || 0}
                        onBlur={(event) =>
                          updateOrder(
                            order,
                            currentStatus,
                            Number(event.target.value)
                          )
                        }
                      />
                    </div>

                    <div>
                      <span>До оплати</span>
                      <strong>
                        {formatMoney(order.amountDue)} грн
                      </strong>
                    </div>
                  </div>

                  <div className="status-editor">
                    <label>
                      Змінити статус

                      <select
                        value={currentStatus}
                        disabled={isSaving}
                        onChange={(event) =>
                          updateOrder(
                            order,
                            event.target.value,
                            order.paidAmount || 0
                          )
                        }
                      >
                        {statuses.map((status) => (
                          <option key={status} value={status}>
                            {statusLabels[status]}
                          </option>
                        ))}
                      </select>
                    </label>

                    {isSaving && (
                      <strong className="saving">
                        Збереження...
                      </strong>
                    )}
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
        .top-actions,
        .stats,
        .orders,
        .empty,
        .message {
          max-width: 1180px;
          margin: 0 auto;
          padding-left: 20px;
          padding-right: 20px;
        }

        .hero {
          padding-top: 50px;
          padding-bottom: 24px;
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

        .top-actions {
          display: flex;
          justify-content: space-between;
          gap: 14px;
          margin-bottom: 20px;
        }

        .top-actions a,
        .top-actions button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          min-height: 48px;
          padding: 0 18px;
          border-radius: 14px;
          background: #171717;
          color: #ffffff;
          text-decoration: none;
          border: none;
          font: inherit;
          font-weight: 900;
          cursor: pointer;
        }

        .stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          margin-bottom: 20px;
        }

        .stats div,
        .order-card,
        .empty,
        .message {
          border-radius: 24px;
          background: #fff2dc;
          border: 1px solid #b9892b;
          box-shadow: 0 18px 45px rgba(40, 30, 15, 0.12);
        }

        .stats div {
          display: grid;
          gap: 6px;
          padding: 20px;
        }

        .stats span,
        .grid span,
        .money-grid span,
        .small {
          color: #8a6518;
          font-size: 13px;
          font-weight: 900;
          text-transform: uppercase;
          letter-spacing: 0.8px;
        }

        .stats strong {
          font-size: 30px;
        }

        .message {
          padding-top: 18px;
          padding-bottom: 18px;
          margin-bottom: 20px;
          font-weight: 900;
          text-align: center;
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

        .grid,
        .money-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 18px;
        }

        .grid div,
        .money-grid div {
          display: grid;
          gap: 6px;
          border-radius: 16px;
          background: rgba(255, 255, 255, 0.45);
          padding: 14px;
        }

        .grid strong,
        .money-grid strong {
          font-size: 17px;
        }

        .money-grid strong {
          font-size: 24px;
        }

        input,
        select {
          width: 100%;
          box-sizing: border-box;
          padding: 13px;
          border-radius: 12px;
          border: 1px solid #aa8136;
          background: #ffffff;
          color: #171717;
          font: inherit;
          font-weight: 800;
        }

        .status-editor {
          display: grid;
          grid-template-columns: 1fr auto;
          gap: 14px;
          align-items: end;
          margin-bottom: 18px;
        }

        .status-editor label {
          display: grid;
          gap: 8px;
          font-weight: 900;
        }

        .saving {
          color: #8a6518;
          padding-bottom: 14px;
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
          font-weight: 900;
        }

        @media (max-width: 850px) {
          .stats,
          .grid,
          .money-grid,
          .status-editor {
            grid-template-columns: 1fr;
          }

          .order-top,
          .top-actions {
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