"use client";

import Image from "next/image";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

type OrderStatus =
  | "new"
  | "processing"
  | "completed"
  | "cancelled";

type OrderItem = {
  name: string;
  image?: string;
  color?: string;
  width?: number;
  length?: number;
  area?: number;
  quantity?: number;
  price?: number;
};

type Order = {
  id: number;
  orderNumber: number;
  createdAt: string;
  status: OrderStatus;

  customerName: string;
  phone: string;

  delivery: string;
  city: string;
  warehouse: string;

  paymentMethod: string;
  paidAmount: number;
  amountDue: number;

  comment: string;
  total: number;
  area: number;

  items: OrderItem[];
};

type OrdersResponse = {
  success: boolean;
  orders?: Order[];
  message?: string;
};

const statusOptions: {
  value: OrderStatus;
  label: string;
  icon: string;
}[] = [
  {
    value: "new",
    label: "Нове",
    icon: "🟡",
  },
  {
    value: "processing",
    label: "В роботі",
    icon: "🔵",
  },
  {
    value: "completed",
    label: "Виконано",
    icon: "🟢",
  },
  {
    value: "cancelled",
    label: "Скасовано",
    icon: "🔴",
  },
];

function formatMoney(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Дата невідома";
  }

  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getStatusInfo(status: OrderStatus) {
  return (
    statusOptions.find(
      (option) => option.value === status
    ) || statusOptions[0]
  );
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<
    Order[]
  >([]);

  const [selectedOrderNumber, setSelectedOrderNumber] =
    useState<number | null>(null);

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] =
    useState<"all" | OrderStatus>("all");

  const [loading, setLoading] =
    useState(true);

  const [updatingStatus, setUpdatingStatus] =
    useState(false);

  const [error, setError] =
    useState("");

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/orders",
        {
          method: "GET",
          cache: "no-store",
        }
      );

      const data =
        (await response.json()) as OrdersResponse;

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Не вдалося завантажити замовлення"
        );
      }

      const loadedOrders = data.orders || [];

      setOrders(loadedOrders);

      setSelectedOrderNumber(
        (currentOrderNumber) => {
          if (
            currentOrderNumber &&
            loadedOrders.some(
              (order) =>
                order.orderNumber ===
                currentOrderNumber
            )
          ) {
            return currentOrderNumber;
          }

          return (
            loadedOrders[0]?.orderNumber ||
            null
          );
        }
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Сталася невідома помилка"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const filteredOrders = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return orders.filter((order) => {
      const matchesStatus =
        statusFilter === "all" ||
        order.status === statusFilter;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        String(order.orderNumber).includes(
          normalizedSearch
        ) ||
        order.customerName
          .toLowerCase()
          .includes(normalizedSearch) ||
        order.phone
          .toLowerCase()
          .includes(normalizedSearch) ||
        order.city
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesStatus && matchesSearch;
    });
  }, [orders, search, statusFilter]);

  const selectedOrder =
    orders.find(
      (order) =>
        order.orderNumber ===
        selectedOrderNumber
    ) || null;

  async function updateOrderStatus(
    status: OrderStatus
  ) {
    if (!selectedOrder) {
      return;
    }

    try {
      setUpdatingStatus(true);
      setError("");

      const response = await fetch(
        "/api/orders/status",
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderNumber:
              selectedOrder.orderNumber,
            status,
          }),
        }
      );

      const data = (await response.json()) as {
        success?: boolean;
        message?: string;
      };

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ||
            "Не вдалося змінити статус"
        );
      }

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.orderNumber ===
          selectedOrder.orderNumber
            ? {
                ...order,
                status,
              }
            : order
        )
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Помилка зміни статусу"
      );
    } finally {
      setUpdatingStatus(false);
    }
  }

  const completedOrders = orders.filter(
    (order) => order.status === "completed"
  );

  const totalRevenue =
    completedOrders.reduce(
      (sum, order) => sum + order.total,
      0
    );

  return (
    <main className="admin-page">
      <section className="admin-container">
        <header className="admin-header">
          <div>
            <p className="eyebrow">
              DreamCarpet CRM
            </p>

            <h1>Замовлення</h1>

            <p className="subtitle">
              Керування замовленнями магазину
            </p>
          </div>

          <button
            type="button"
            className="refresh-button"
            onClick={() => void loadOrders()}
            disabled={loading}
          >
            {loading
              ? "Оновлення..."
              : "Оновити"}
          </button>
        </header>

        <section className="statistics">
          <article className="stat-card">
            <span>Усього замовлень</span>
            <strong>{orders.length}</strong>
          </article>

          <article className="stat-card">
            <span>Нові</span>
            <strong>
              {
                orders.filter(
                  (order) =>
                    order.status === "new"
                ).length
              }
            </strong>
          </article>

          <article className="stat-card">
            <span>У роботі</span>
            <strong>
              {
                orders.filter(
                  (order) =>
                    order.status ===
                    "processing"
                ).length
              }
            </strong>
          </article>

          <article className="stat-card">
            <span>Виконані продажі</span>
            <strong>
              {formatMoney(totalRevenue)} грн
            </strong>
          </article>
        </section>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <section className="toolbar">
          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(event.target.value)
            }
            placeholder="Пошук за номером, клієнтом, телефоном або містом"
          />

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as
                  | "all"
                  | OrderStatus
              )
            }
          >
            <option value="all">
              Усі статуси
            </option>

            {statusOptions.map((status) => (
              <option
                key={status.value}
                value={status.value}
              >
                {status.icon} {status.label}
              </option>
            ))}
          </select>
        </section>

        {loading ? (
          <div className="empty-state">
            Завантаження замовлень...
          </div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            Замовлень поки немає
          </div>
        ) : (
          <section className="crm-layout">
            <aside className="orders-list">
              <div className="list-header">
                <strong>Список</strong>
                <span>
                  {filteredOrders.length}
                </span>
              </div>

              <div className="orders-scroll">
                {filteredOrders.length ===
                0 ? (
                  <div className="no-results">
                    Нічого не знайдено
                  </div>
                ) : (
                  filteredOrders.map((order) => {
                    const status =
                      getStatusInfo(
                        order.status
                      );

                    const isSelected =
                      order.orderNumber ===
                      selectedOrderNumber;

                    return (
                      <button
                        type="button"
                        key={order.orderNumber}
                        className={`order-card ${
                          isSelected
                            ? "selected"
                            : ""
                        }`}
                        onClick={() =>
                          setSelectedOrderNumber(
                            order.orderNumber
                          )
                        }
                      >
                        <div className="order-card-top">
                          <strong>
                            #{order.orderNumber}
                          </strong>

                          <span className="status">
                            {status.icon}{" "}
                            {status.label}
                          </span>
                        </div>

                        <p>
                          {order.customerName}
                        </p>

                        <small>
                          {formatDate(
                            order.createdAt
                          )}
                        </small>

                        <div className="order-card-bottom">
                          <span>
                            {order.city}
                          </span>

                          <strong>
                            {formatMoney(
                              order.total
                            )}{" "}
                            грн
                          </strong>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </aside>

            <section className="order-details">
              {!selectedOrder ? (
                <div className="empty-state">
                  Виберіть замовлення
                </div>
              ) : (
                <>
                  <div className="details-header">
                    <div>
                      <p className="eyebrow">
                        Деталі замовлення
                      </p>

                      <h2>
                        №
                        {
                          selectedOrder.orderNumber
                        }
                      </h2>

                      <p>
                        {formatDate(
                          selectedOrder.createdAt
                        )}
                      </p>
                    </div>

                    <select
                      className="status-select"
                      value={
                        selectedOrder.status
                      }
                      disabled={updatingStatus}
                      onChange={(event) =>
                        void updateOrderStatus(
                          event.target
                            .value as OrderStatus
                        )
                      }
                    >
                      {statusOptions.map(
                        (status) => (
                          <option
                            key={status.value}
                            value={status.value}
                          >
                            {status.icon}{" "}
                            {status.label}
                          </option>
                        )
                      )}
                    </select>
                  </div>

                  <div className="details-grid">
                    <article className="info-card">
                      <h3>Покупець</h3>

                      <div className="info-row">
                        <span>Ім’я</span>
                        <strong>
                          {
                            selectedOrder.customerName
                          }
                        </strong>
                      </div>

                      <div className="info-row">
                        <span>Телефон</span>

                        <a
                          href={`tel:${selectedOrder.phone}`}
                        >
                          {selectedOrder.phone}
                        </a>
                      </div>
                    </article>

                    <article className="info-card">
                      <h3>Доставка</h3>

                      <div className="info-row">
                        <span>Спосіб</span>
                        <strong>
                          {
                            selectedOrder.delivery
                          }
                        </strong>
                      </div>

                      <div className="info-row">
                        <span>Місто</span>
                        <strong>
                          {selectedOrder.city}
                        </strong>
                      </div>

                      <div className="info-row">
                        <span>Відділення</span>
                        <strong>
                          {
                            selectedOrder.warehouse
                          }
                        </strong>
                      </div>
                    </article>

                    <article className="info-card">
                      <h3>Оплата</h3>

                      <div className="info-row">
                        <span>Спосіб</span>
                        <strong>
                          {
                            selectedOrder.paymentMethod
                          }
                        </strong>
                      </div>

                      <div className="info-row">
                        <span>Оплачено</span>
                        <strong>
                          {formatMoney(
                            selectedOrder.paidAmount
                          )}{" "}
                          грн
                        </strong>
                      </div>

                      <div className="info-row">
                        <span>Залишок</span>
                        <strong>
                          {formatMoney(
                            selectedOrder.amountDue
                          )}{" "}
                          грн
                        </strong>
                      </div>
                    </article>

                    <article className="info-card total-card">
                      <h3>Підсумок</h3>

                      <div className="info-row">
                        <span>Площа</span>
                        <strong>
                          {formatMoney(
                            selectedOrder.area
                          )}{" "}
                          м²
                        </strong>
                      </div>

                      <div className="info-row total-row">
                        <span>Разом</span>
                        <strong>
                          {formatMoney(
                            selectedOrder.total
                          )}{" "}
                          грн
                        </strong>
                      </div>
                    </article>
                  </div>

                  <section className="products-section">
                    <h3>Товари</h3>

                    <div className="products-list">
                      {selectedOrder.items.map(
                        (item, index) => {
                          const quantity =
                            item.quantity ?? 1;

                          const itemTotal =
                            (item.price ?? 0) *
                            quantity;

                          return (
                            <article
                              className="product-card"
                              key={`${item.name}-${index}`}
                            >
                              <div className="product-image">
                                {item.image ? (
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    sizes="130px"
                                  />
                                ) : (
                                  <span>
                                    Немає фото
                                  </span>
                                )}
                              </div>

                              <div className="product-info">
                                <h4>
                                  {index + 1}.{" "}
                                  {item.name}
                                </h4>

                                <p>
                                  Колір:{" "}
                                  <strong>
                                    {item.color ||
                                      "Не вказано"}
                                  </strong>
                                </p>

                                <p>
                                  Розмір:{" "}
                                  <strong>
                                    {formatMoney(
                                      item.width ??
                                        0
                                    )}{" "}
                                    ×{" "}
                                    {formatMoney(
                                      item.length ??
                                        0
                                    )}{" "}
                                    м
                                  </strong>
                                </p>

                                <p>
                                  Площа:{" "}
                                  <strong>
                                    {formatMoney(
                                      item.area ?? 0
                                    )}{" "}
                                    м²
                                  </strong>
                                </p>

                                <p>
                                  Кількість:{" "}
                                  <strong>
                                    {quantity}
                                  </strong>
                                </p>
                              </div>

                              <strong className="product-price">
                                {formatMoney(
                                  itemTotal
                                )}{" "}
                                грн
                              </strong>
                            </article>
                          );
                        }
                      )}
                    </div>
                  </section>

                  <section className="comment-section">
                    <h3>Коментар</h3>

                    <p>
                      {selectedOrder.comment ||
                        "Без коментаря"}
                    </p>
                  </section>
                </>
              )}
            </section>
          </section>
        )}
      </section>

      <style jsx>{`
        .admin-page {
          min-height: 100vh;
          background: #f4f1eb;
          color: #181714;
          padding: 32px 20px;
        }

        .admin-container {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
        }

        .admin-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 24px;
        }

        .eyebrow {
          margin: 0 0 6px;
          color: #8a7656;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          font-size: clamp(32px, 5vw, 52px);
          line-height: 1;
        }

        .subtitle {
          margin: 10px 0 0;
          color: #716d65;
        }

        .refresh-button {
          border: 0;
          border-radius: 12px;
          background: #181714;
          color: #ffffff;
          padding: 13px 20px;
          font-weight: 700;
          cursor: pointer;
        }

        .refresh-button:disabled {
          opacity: 0.6;
          cursor: wait;
        }

        .statistics {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 14px;
          margin-bottom: 18px;
        }

        .stat-card {
          background: #ffffff;
          border: 1px solid #e2ddd2;
          border-radius: 16px;
          padding: 18px;
          box-shadow:
            0 8px 25px
            rgba(44, 36, 24, 0.05);
        }

        .stat-card span {
          display: block;
          color: #777168;
          font-size: 13px;
          margin-bottom: 8px;
        }

        .stat-card strong {
          font-size: 23px;
        }

        .toolbar {
          display: grid;
          grid-template-columns:
            minmax(0, 1fr) 220px;
          gap: 12px;
          margin-bottom: 18px;
        }

        .toolbar input,
        .toolbar select,
        .status-select {
          width: 100%;
          border: 1px solid #d8d1c5;
          border-radius: 12px;
          background: #ffffff;
          padding: 13px 14px;
          color: #181714;
          font: inherit;
          outline: none;
        }

        .toolbar input:focus,
        .toolbar select:focus,
        .status-select:focus {
          border-color: #8a7656;
          box-shadow:
            0 0 0 3px
            rgba(138, 118, 86, 0.13);
        }

        .error-message {
          background: #fff0f0;
          border: 1px solid #efb4b4;
          border-radius: 12px;
          color: #a42121;
          padding: 14px 16px;
          margin-bottom: 18px;
        }

        .crm-layout {
          display: grid;
          grid-template-columns:
            minmax(290px, 370px)
            minmax(0, 1fr);
          gap: 18px;
          align-items: start;
        }

        .orders-list,
        .order-details {
          background: #ffffff;
          border: 1px solid #e2ddd2;
          border-radius: 18px;
          box-shadow:
            0 10px 35px
            rgba(44, 36, 24, 0.06);
        }

        .orders-list {
          position: sticky;
          top: 20px;
          overflow: hidden;
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          padding: 17px 18px;
          border-bottom: 1px solid #ebe6dc;
        }

        .list-header span {
          background: #eee8dc;
          border-radius: 100px;
          padding: 2px 9px;
          font-size: 13px;
        }

        .orders-scroll {
          max-height: 720px;
          overflow-y: auto;
          padding: 10px;
        }

        .order-card {
          width: 100%;
          border: 1px solid transparent;
          border-radius: 13px;
          background: transparent;
          padding: 14px;
          color: inherit;
          text-align: left;
          cursor: pointer;
          transition: 0.18s ease;
        }

        .order-card:hover {
          background: #f7f4ee;
        }

        .order-card.selected {
          background: #eee8dc;
          border-color: #d7c8ad;
        }

        .order-card-top,
        .order-card-bottom {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          align-items: center;
        }

        .order-card p {
          margin: 10px 0 4px;
          font-weight: 700;
        }

        .order-card small {
          color: #777168;
        }

        .order-card-bottom {
          margin-top: 11px;
          font-size: 13px;
        }

        .status {
          font-size: 12px;
          font-weight: 700;
        }

        .order-details {
          min-height: 600px;
          padding: 24px;
        }

        .details-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
          padding-bottom: 20px;
          border-bottom: 1px solid #ebe6dc;
        }

        .details-header h2 {
          margin: 0;
          font-size: 34px;
        }

        .details-header > div > p:last-child {
          margin: 8px 0 0;
          color: #777168;
        }

        .status-select {
          max-width: 190px;
          font-weight: 700;
        }

        .details-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));
          gap: 14px;
          margin-top: 20px;
        }

        .info-card {
          border: 1px solid #e4ded3;
          border-radius: 15px;
          padding: 18px;
          background: #fcfbf8;
        }

        .info-card h3,
        .products-section h3,
        .comment-section h3 {
          margin: 0 0 15px;
          font-size: 17px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 20px;
          padding: 9px 0;
          border-bottom: 1px solid #eee9df;
        }

        .info-row:last-child {
          border-bottom: 0;
        }

        .info-row span {
          color: #777168;
        }

        .info-row strong,
        .info-row a {
          color: #181714;
          text-align: right;
          word-break: break-word;
        }

        .total-card {
          background: #181714;
          color: #ffffff;
          border-color: #181714;
        }

        .total-card .info-row {
          border-color: #393833;
        }

        .total-card .info-row span,
        .total-card .info-row strong {
          color: #ffffff;
        }

        .total-row strong {
          font-size: 22px;
        }

        .products-section,
        .comment-section {
          margin-top: 20px;
          border: 1px solid #e4ded3;
          border-radius: 15px;
          padding: 18px;
        }

        .products-list {
          display: grid;
          gap: 12px;
        }

        .product-card {
          display: grid;
          grid-template-columns:
            110px minmax(0, 1fr) auto;
          gap: 16px;
          align-items: center;
          border-top: 1px solid #eee9df;
          padding-top: 12px;
        }

        .product-card:first-child {
          border-top: 0;
          padding-top: 0;
        }

        .product-image {
          position: relative;
          width: 110px;
          height: 110px;
          overflow: hidden;
          border-radius: 12px;
          background: #eeeae2;
        }

        .product-image img {
          object-fit: cover;
        }

        .product-image span {
          position: absolute;
          inset: 0;
          display: grid;
          place-items: center;
          padding: 8px;
          color: #777168;
          font-size: 12px;
          text-align: center;
        }

        .product-info h4 {
          margin: 0 0 9px;
        }

        .product-info p {
          margin: 4px 0;
          color: #68645c;
          font-size: 14px;
        }

        .product-price {
          white-space: nowrap;
          font-size: 18px;
        }

        .comment-section p {
          margin: 0;
          line-height: 1.6;
          white-space: pre-wrap;
        }

        .empty-state,
        .no-results {
          display: grid;
          place-items: center;
          min-height: 180px;
          color: #777168;
          text-align: center;
          padding: 30px;
        }

        @media (max-width: 1050px) {
          .statistics {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .crm-layout {
            grid-template-columns: 310px 1fr;
          }

          .details-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 800px) {
          .admin-page {
            padding: 20px 12px;
          }

          .admin-header {
            align-items: flex-start;
          }

          .toolbar {
            grid-template-columns: 1fr;
          }

          .crm-layout {
            grid-template-columns: 1fr;
          }

          .orders-list {
            position: static;
          }

          .orders-scroll {
            max-height: 390px;
          }
        }

        @media (max-width: 560px) {
          .admin-header {
            flex-direction: column;
          }

          .refresh-button {
            width: 100%;
          }

          .statistics {
            grid-template-columns: 1fr;
          }

          .order-details {
            padding: 16px;
          }

          .details-header {
            flex-direction: column;
          }

          .status-select {
            max-width: none;
          }

          .product-card {
            grid-template-columns:
              82px minmax(0, 1fr);
            align-items: start;
          }

          .product-image {
            width: 82px;
            height: 82px;
          }

          .product-price {
            grid-column: 1 / -1;
            text-align: right;
          }

          .info-row {
            flex-direction: column;
            gap: 4px;
          }

          .info-row strong,
          .info-row a {
            text-align: left;
          }
        }
      `}</style>
    </main>
  );
}