"use client";

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

type CustomerOrder = {
  id: number;
  orderNumber: number;
  createdAt: string;
  status: OrderStatus;
  total: number;
  paidAmount: number;
  amountDue: number;
  delivery: string;
  city: string;
  warehouse: string;
  paymentMethod: string;
  itemsCount: number;
};

type Customer = {
  id: string;
  customerName: string;
  phone: string;
  city: string;

  ordersCount: number;
  completedOrdersCount: number;
  cancelledOrdersCount: number;

  totalSpent: number;
  totalPaid: number;
  totalDue: number;

  firstOrderAt: string;
  lastOrderAt: string;

  orders: CustomerOrder[];
};

type Summary = {
  customersCount: number;
  ordersCount: number;
  totalRevenue: number;
  totalPaid: number;
  totalDue: number;
};

type CustomersResponse = {
  success: boolean;
  customers: Customer[];
  summary: Summary;
  message?: string;
};

const statusNames: Record<
  OrderStatus,
  string
> = {
  new: "Нове",
  processing: "В обробці",
  completed: "Виконано",
  cancelled: "Скасовано",
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value: string) {
  if (!value) {
    return "Не вказано";
  }

  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function getPhoneLink(phone: string) {
  const normalizedPhone =
    normalizePhone(phone);

  if (!normalizedPhone) {
    return "#";
  }

  if (normalizedPhone.startsWith("0")) {
    return `tel:+38${normalizedPhone}`;
  }

  return `tel:+${normalizedPhone}`;
}

function getCustomerInitials(name: string) {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export default function AdminCustomersPage() {
  const [customers, setCustomers] =
    useState<Customer[]>([]);

  const [summary, setSummary] =
    useState<Summary>({
      customersCount: 0,
      ordersCount: 0,
      totalRevenue: 0,
      totalPaid: 0,
      totalDue: 0,
    });

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [expandedCustomerId, setExpandedCustomerId] =
    useState<string | null>(null);

  const loadCustomers = useCallback(
    async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          "/api/customers",
          {
            method: "GET",
            cache: "no-store",
          }
        );

        const data =
          (await response.json()) as CustomersResponse;

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ||
              "Не вдалося завантажити клієнтів"
          );
        }

        setCustomers(
          Array.isArray(data.customers)
            ? data.customers
            : []
        );

        setSummary(
          data.summary || {
            customersCount: 0,
            ordersCount: 0,
            totalRevenue: 0,
            totalPaid: 0,
            totalDue: 0,
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
    },
    []
  );

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  const filteredCustomers =
    useMemo(() => {
      const query = search
        .trim()
        .toLowerCase();

      if (!query) {
        return customers;
      }

      const normalizedQuery =
        normalizePhone(query);

      return customers.filter(
        (customer) => {
          const nameMatch =
            customer.customerName
              .toLowerCase()
              .includes(query);

          const cityMatch =
            customer.city
              .toLowerCase()
              .includes(query);

          const phoneMatch =
            normalizedQuery.length > 0 &&
            normalizePhone(
              customer.phone
            ).includes(normalizedQuery);

          return (
            nameMatch ||
            cityMatch ||
            phoneMatch
          );
        }
      );
    }, [customers, search]);

  function toggleCustomer(
    customerId: string
  ) {
    setExpandedCustomerId(
      (currentId) =>
        currentId === customerId
          ? null
          : customerId
    );
  }

  return (
    <main className="admin-page">
      <div className="admin-container">
        <header className="page-header">
          <div>
            <p className="eyebrow">
              DreamCarpet CRM
            </p>

            <h1>Клієнти</h1>

            <p className="subtitle">
              База покупців та історія
              їхніх замовлень.
            </p>
          </div>

          <div className="header-actions">
            <a
              href="/admin/orders"
              className="secondary-button"
            >
              Замовлення
            </a>

            <a
              href="/admin/products"
              className="secondary-button"
            >
              Товари
            </a>

            <button
              type="button"
              className="primary-button"
              onClick={() =>
                void loadCustomers()
              }
            >
              Оновити
            </button>
          </div>
        </header>

        {error && (
          <div className="notice error">
            {error}
          </div>
        )}

        <section className="summary-grid">
          <article className="summary-card">
            <span>Клієнтів</span>

            <strong>
              {summary.customersCount}
            </strong>

            <small>
              Унікальних покупців
            </small>
          </article>

          <article className="summary-card">
            <span>Замовлень</span>

            <strong>
              {summary.ordersCount}
            </strong>

            <small>
              За весь час
            </small>
          </article>

          <article className="summary-card">
            <span>
              Сума замовлень
            </span>

            <strong>
              {formatMoney(
                summary.totalRevenue
              )}{" "}
              грн
            </strong>

            <small>
              Без скасованих
            </small>
          </article>

          <article className="summary-card">
            <span>Оплачено</span>

            <strong>
              {formatMoney(
                summary.totalPaid
              )}{" "}
              грн
            </strong>

            <small>
              Отримано коштів
            </small>
          </article>

          <article className="summary-card debt">
            <span>До оплати</span>

            <strong>
              {formatMoney(
                summary.totalDue
              )}{" "}
              грн
            </strong>

            <small>
              Залишок по замовленнях
            </small>
          </article>
        </section>

        <section className="toolbar">
          <div>
            <strong>
              Знайдено клієнтів:{" "}
              {filteredCustomers.length}
            </strong>

            <span>
              Натисни на клієнта, щоб
              відкрити історію
            </span>
          </div>

          <input
            type="search"
            value={search}
            onChange={(event) =>
              setSearch(
                event.target.value
              )
            }
            placeholder="Пошук за ім’ям, телефоном або містом"
          />
        </section>

        {loading ? (
          <div className="empty-state">
            Завантаження клієнтів...
          </div>
        ) : filteredCustomers.length ===
          0 ? (
          <div className="empty-state">
            <h2>
              Клієнтів не знайдено
            </h2>

            <p>
              Спробуй змінити пошуковий
              запит.
            </p>
          </div>
        ) : (
          <section className="customers-list">
            {filteredCustomers.map(
              (customer) => {
                const isExpanded =
                  expandedCustomerId ===
                  customer.id;

                return (
                  <article
                    className="customer-card"
                    key={customer.id}
                  >
                    <button
                      type="button"
                      className="customer-main"
                      onClick={() =>
                        toggleCustomer(
                          customer.id
                        )
                      }
                    >
                      <div className="customer-person">
                        <div className="avatar">
                          {getCustomerInitials(
                            customer.customerName
                          )}
                        </div>

                        <div>
                          <h2>
                            {
                              customer.customerName
                            }
                          </h2>

                          <div className="contact-line">
                            <a
                              href={getPhoneLink(
                                customer.phone
                              )}
                              onClick={(
                                event
                              ) =>
                                event.stopPropagation()
                              }
                            >
                              {
                                customer.phone
                              }
                            </a>

                            <span>
                              {customer.city}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="customer-stat">
                        <span>
                          Замовлень
                        </span>

                        <strong>
                          {
                            customer.ordersCount
                          }
                        </strong>
                      </div>

                      <div className="customer-stat">
                        <span>
                          Загальна сума
                        </span>

                        <strong>
                          {formatMoney(
                            customer.totalSpent
                          )}{" "}
                          грн
                        </strong>
                      </div>

                      <div className="customer-stat">
                        <span>
                          Оплачено
                        </span>

                        <strong className="paid">
                          {formatMoney(
                            customer.totalPaid
                          )}{" "}
                          грн
                        </strong>
                      </div>

                      <div className="customer-stat">
                        <span>
                          До оплати
                        </span>

                        <strong
                          className={
                            customer.totalDue >
                            0
                              ? "due"
                              : ""
                          }
                        >
                          {formatMoney(
                            customer.totalDue
                          )}{" "}
                          грн
                        </strong>
                      </div>

                      <div className="customer-stat last-order">
                        <span>
                          Останнє замовлення
                        </span>

                        <strong>
                          {formatDate(
                            customer.lastOrderAt
                          )}
                        </strong>
                      </div>

                      <span className="arrow">
                        {isExpanded
                          ? "▲"
                          : "▼"}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="customer-details">
                        <div className="customer-summary">
                          <div>
                            <span>
                              Перше
                              замовлення
                            </span>

                            <strong>
                              {formatDate(
                                customer.firstOrderAt
                              )}
                            </strong>
                          </div>

                          <div>
                            <span>
                              Виконано
                            </span>

                            <strong>
                              {
                                customer.completedOrdersCount
                              }
                            </strong>
                          </div>

                          <div>
                            <span>
                              Скасовано
                            </span>

                            <strong>
                              {
                                customer.cancelledOrdersCount
                              }
                            </strong>
                          </div>
                        </div>

                        <div className="orders-table-wrapper">
                          <table>
                            <thead>
                              <tr>
                                <th>
                                  Номер
                                </th>

                                <th>
                                  Дата
                                </th>

                                <th>
                                  Статус
                                </th>

                                <th>
                                  Товарів
                                </th>

                                <th>
                                  Доставка
                                </th>

                                <th>
                                  Оплата
                                </th>

                                <th>
                                  Сума
                                </th>

                                <th>
                                  До оплати
                                </th>
                              </tr>
                            </thead>

                            <tbody>
                              {customer.orders.map(
                                (
                                  order
                                ) => (
                                  <tr
                                    key={
                                      order.id
                                    }
                                  >
                                    <td>
                                      <a
                                        href={`/admin/orders#order-${order.orderNumber}`}
                                      >
                                        #
                                        {
                                          order.orderNumber
                                        }
                                      </a>
                                    </td>

                                    <td>
                                      {formatDate(
                                        order.createdAt
                                      )}
                                    </td>

                                    <td>
                                      <span
                                        className={`status status-${order.status}`}
                                      >
                                        {
                                          statusNames[
                                            order
                                              .status
                                          ]
                                        }
                                      </span>
                                    </td>

                                    <td>
                                      {
                                        order.itemsCount
                                      }
                                    </td>

                                    <td>
                                      <div className="table-info">
                                        <strong>
                                          {
                                            order.delivery
                                          }
                                        </strong>

                                        <small>
                                          {
                                            order.city
                                          }
                                          {order.warehouse
                                            ? `, ${order.warehouse}`
                                            : ""}
                                        </small>
                                      </div>
                                    </td>

                                    <td>
                                      {
                                        order.paymentMethod
                                      }
                                    </td>

                                    <td>
                                      <strong>
                                        {formatMoney(
                                          order.total
                                        )}{" "}
                                        грн
                                      </strong>
                                    </td>

                                    <td>
                                      <strong
                                        className={
                                          order.amountDue >
                                          0
                                            ? "due"
                                            : "paid"
                                        }
                                      >
                                        {formatMoney(
                                          order.amountDue
                                        )}{" "}
                                        грн
                                      </strong>
                                    </td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </article>
                );
              }
            )}
          </section>
        )}
      </div>

      <style jsx>{`
        .admin-page {
          min-height: 100vh;
          padding: 32px 20px 70px;
          background: #f4f1eb;
          color: #181714;
        }

        .admin-container {
          width: min(1500px, 100%);
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 28px;
        }

        .eyebrow {
          margin: 0 0 8px;
          color: #8a7656;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 1.4px;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          font-size: clamp(
            34px,
            5vw,
            54px
          );
          line-height: 1;
        }

        .subtitle {
          margin: 14px 0 0;
          color: #716d65;
        }

        .header-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }

        button,
        a,
        input {
          font: inherit;
        }

        a {
          text-decoration: none;
        }

        .primary-button,
        .secondary-button {
          display: inline-flex;
          min-height: 44px;
          align-items: center;
          justify-content: center;
          border-radius: 12px;
          padding: 11px 16px;
          font-weight: 800;
          cursor: pointer;
        }

        .primary-button {
          border: 1px solid #181714;
          background: #181714;
          color: #fff;
        }

        .secondary-button {
          border: 1px solid #d7cfc1;
          background: #fff;
          color: #181714;
        }

        .notice {
          margin-bottom: 20px;
          border-radius: 14px;
          padding: 14px 16px;
          font-weight: 800;
        }

        .notice.error {
          border: 1px solid #efb5b5;
          background: #fff0f0;
          color: #a32323;
        }

        .summary-grid {
          display: grid;
          grid-template-columns:
            repeat(5, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .summary-card {
          display: grid;
          gap: 8px;
          border: 1px solid #ddd5c7;
          border-radius: 18px;
          background: #fff;
          padding: 20px;
          box-shadow: 0 12px 30px
            rgba(45, 37, 25, 0.06);
        }

        .summary-card span {
          color: #716d65;
          font-size: 13px;
          font-weight: 800;
        }

        .summary-card strong {
          font-size: 27px;
        }

        .summary-card small {
          color: #8c867d;
        }

        .summary-card.debt strong {
          color: #b13a2e;
        }

        .toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 18px;
          border: 1px solid #ddd5c7;
          border-radius: 18px;
          background: #fff;
          padding: 16px;
        }

        .toolbar > div {
          display: grid;
          gap: 5px;
        }

        .toolbar span {
          color: #777169;
          font-size: 13px;
        }

        .toolbar input {
          width: min(
            420px,
            100%
          );
          box-sizing: border-box;
          border: 1px solid #d8d0c3;
          border-radius: 12px;
          padding: 13px 14px;
          outline: none;
        }

        .toolbar input:focus {
          border-color: #8a7656;
          box-shadow: 0 0 0 4px
            rgba(
              138,
              118,
              86,
              0.12
            );
        }

        .customers-list {
          display: grid;
          gap: 14px;
        }

        .customer-card {
          overflow: hidden;
          border: 1px solid #ddd5c7;
          border-radius: 18px;
          background: #fff;
          box-shadow: 0 10px 26px
            rgba(45, 37, 25, 0.05);
        }

        .customer-main {
          display: grid;
          width: 100%;
          grid-template-columns:
            minmax(230px, 2fr)
            repeat(
              4,
              minmax(110px, 1fr)
            )
            minmax(160px, 1.2fr)
            30px;
          align-items: center;
          gap: 18px;
          border: 0;
          background: transparent;
          padding: 18px;
          color: inherit;
          text-align: left;
          cursor: pointer;
        }

        .customer-main:hover {
          background: #fcfaf6;
        }

        .customer-person {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .avatar {
          display: grid;
          flex: 0 0 48px;
          width: 48px;
          height: 48px;
          place-items: center;
          border-radius: 50%;
          background: #181714;
          color: #fff;
          font-weight: 900;
        }

        .customer-person h2 {
          overflow: hidden;
          margin: 0 0 6px;
          font-size: 18px;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .contact-line {
          display: flex;
          flex-wrap: wrap;
          gap: 8px 12px;
          color: #777169;
          font-size: 13px;
        }

        .contact-line a {
          color: #725d3d;
          font-weight: 800;
        }

        .customer-stat {
          display: grid;
          gap: 5px;
        }

        .customer-stat span {
          color: #89837a;
          font-size: 12px;
        }

        .customer-stat strong {
          font-size: 15px;
        }

        .paid {
          color: #27733c;
        }

        .due {
          color: #b13a2e;
        }

        .last-order strong {
          font-size: 13px;
        }

        .arrow {
          color: #8a7656;
          text-align: center;
        }

        .customer-details {
          border-top: 1px solid #eee8de;
          background: #fcfaf6;
          padding: 18px;
        }

        .customer-summary {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 18px;
        }

        .customer-summary div {
          display: grid;
          gap: 5px;
          border: 1px solid #e4ddd1;
          border-radius: 12px;
          background: #fff;
          padding: 14px;
        }

        .customer-summary span {
          color: #827b72;
          font-size: 12px;
        }

        .orders-table-wrapper {
          overflow-x: auto;
          border: 1px solid #e2dacf;
          border-radius: 14px;
          background: #fff;
        }

        table {
          width: 100%;
          min-width: 1100px;
          border-collapse: collapse;
        }

        th,
        td {
          padding: 13px 14px;
          border-bottom: 1px solid #eee8de;
          text-align: left;
          vertical-align: middle;
        }

        th {
          background: #f5f1ea;
          color: #726b61;
          font-size: 12px;
          text-transform: uppercase;
        }

        td {
          font-size: 13px;
        }

        tbody tr:last-child td {
          border-bottom: 0;
        }

        td a {
          color: #725d3d;
          font-weight: 900;
        }

        .table-info {
          display: grid;
          gap: 4px;
        }

        .table-info small {
          color: #7f786f;
        }

        .status {
          display: inline-flex;
          border-radius: 999px;
          padding: 6px 9px;
          font-size: 11px;
          font-weight: 900;
        }

        .status-new {
          background: #eef4ff;
          color: #345a9b;
        }

        .status-processing {
          background: #fff5dc;
          color: #936616;
        }

        .status-completed {
          background: #e9f7ed;
          color: #26713b;
        }

        .status-cancelled {
          background: #fff0f0;
          color: #a52a2a;
        }

        .empty-state {
          border: 1px dashed #cfc5b6;
          border-radius: 20px;
          background: rgba(
            255,
            255,
            255,
            0.7
          );
          padding: 60px 20px;
          text-align: center;
        }

        .empty-state h2 {
          margin: 0 0 8px;
        }

        .empty-state p {
          margin: 0;
          color: #777169;
        }

        @media (
          max-width: 1250px
        ) {
          .summary-grid {
            grid-template-columns:
              repeat(
                3,
                minmax(0, 1fr)
              );
          }

          .customer-main {
            grid-template-columns:
              minmax(230px, 2fr)
              repeat(
                2,
                minmax(
                  120px,
                  1fr
                )
              )
              30px;
          }

          .customer-stat:nth-of-type(
              4
            ),
          .customer-stat:nth-of-type(
              5
            ),
          .last-order {
            display: none;
          }
        }

        @media (
          max-width: 760px
        ) {
          .admin-page {
            padding: 22px 14px 50px;
          }

          .page-header,
          .toolbar {
            align-items: stretch;
            flex-direction: column;
          }

          .header-actions {
            width: 100%;
          }

          .header-actions > * {
            flex: 1;
          }

          .summary-grid {
            grid-template-columns:
              repeat(
                2,
                minmax(0, 1fr)
              );
          }

          .toolbar input {
            width: 100%;
          }

          .customer-main {
            grid-template-columns:
              1fr 30px;
          }

          .customer-stat {
            display: none;
          }

          .customer-summary {
            grid-template-columns:
              1fr;
          }
        }

        @media (
          max-width: 480px
        ) {
          .summary-grid {
            grid-template-columns:
              1fr;
          }
        }
      `}</style>
    </main>
  );
}