"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type OrderItem = {
  name?: string;
  quantity?: number;
  price?: number;
  area?: number;
  width?: number;
  length?: number;
};

type Order = {
  id?: number | string;
  orderNumber?: number;
  status?: string;
  customerName?: string;
  phone?: string;
  city?: string;
  warehouse?: string;
  delivery?: string;
  paymentMethod?: string;
  total?: number;
  paidAmount?: number;
  amountDue?: number;
  createdAt?: string;
  items?: OrderItem[];
};

type CrmTab =
  | "overview"
  | "customers"
  | "sales"
  | "products"
  | "problems";

type PeriodFilter =
  | "today"
  | "7d"
  | "30d"
  | "this-month"
  | "last-month"
  | "all";

const finishedStatuses = new Set(["completed"]);
const canceledStatuses = new Set(["canceled", "cancelled"]);
const returnedStatuses = new Set(["returned", "refunded"]);

function money(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 0,
  }).format(value || 0);
}

function dateText(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function monthKey(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function currentMonthKey() {
  const date = new Date();
  return `${date.getFullYear()}-${String(
    date.getMonth() + 1
  ).padStart(2, "0")}`;
}

function normalizePhone(phone?: string) {
  return String(phone ?? "")
    .replace(/[^\d+]/g, "")
    .trim();
}

function getPeriodRange(period: PeriodFilter) {
  const now = new Date();
  const end = new Date(now);

  if (period === "all") {
    return { start: null as Date | null, end: null as Date | null };
  }

  if (period === "today") {
    return {
      start: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
      end,
    };
  }

  if (period === "7d") {
    const start = new Date(now);
    start.setDate(start.getDate() - 6);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  if (period === "30d") {
    const start = new Date(now);
    start.setDate(start.getDate() - 29);
    start.setHours(0, 0, 0, 0);
    return { start, end };
  }

  if (period === "last-month") {
    return {
      start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      end: new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999),
    };
  }

  return {
    start: new Date(now.getFullYear(), now.getMonth(), 1),
    end,
  };
}

function isOrderInPeriod(order: Order, period: PeriodFilter) {
  if (period === "all") return true;
  if (!order.createdAt) return false;

  const date = new Date(order.createdAt);
  if (Number.isNaN(date.getTime())) return false;

  const range = getPeriodRange(period);
  if (!range.start || !range.end) return true;

  return date >= range.start && date <= range.end;
}

export default function CrmPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<CrmTab>("overview");
  const [period, setPeriod] = useState<PeriodFilter>("this-month");
  const [search, setSearch] = useState("");
  const [selectedCustomerKey, setSelectedCustomerKey] =
    useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  async function loadOrders() {
    try {
      setIsLoading(true);
      setMessage("");

      const response = await fetch("/api/orders", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.message || "Не вдалося завантажити CRM"
        );
      }

      const list = Array.isArray(data)
        ? data
        : Array.isArray(data.orders)
          ? data.orders
          : [];

      setOrders(list);
    } catch (error) {
      setOrders([]);
      setMessage(
        error instanceof Error
          ? error.message
          : "Не вдалося завантажити CRM"
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadOrders();
  }, []);

  const periodOrders = useMemo(
    () => orders.filter((order) => isOrderInPeriod(order, period)),
    [orders, period]
  );

  const analytics = useMemo(() => {
    const month = currentMonthKey();

    const completed = periodOrders.filter((order) =>
      finishedStatuses.has(
        String(order.status ?? "").toLowerCase()
      )
    );

    const canceled = periodOrders.filter((order) =>
      canceledStatuses.has(
        String(order.status ?? "").toLowerCase()
      )
    );

    const returned = periodOrders.filter((order) =>
      returnedStatuses.has(
        String(order.status ?? "").toLowerCase()
      )
    );

    const monthOrders = periodOrders.filter(
      (order) => monthKey(order.createdAt) === month
    );

    const monthCompleted = completed.filter(
      (order) => monthKey(order.createdAt) === month
    );

    const monthCanceled = canceled.filter(
      (order) => monthKey(order.createdAt) === month
    );

    const monthReturned = returned.filter(
      (order) => monthKey(order.createdAt) === month
    );

    const completedRevenue = completed.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

    const monthRevenue = monthCompleted.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

    const canceledAmount = canceled.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

    const monthCanceledAmount = monthCanceled.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

    const returnedAmount = returned.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

    const monthReturnedAmount = monthReturned.reduce(
      (sum, order) => sum + Number(order.total || 0),
      0
    );

    const customersMap = new Map<
      string,
      {
        key: string;
        name: string;
        phone: string;
        city: string;
        orders: number;
        completedOrders: number;
        totalOrdered: number;
        totalBought: number;
        lastOrder?: string;
      }
    >();

    for (const order of periodOrders) {
      const phone = normalizePhone(order.phone);
      const key =
        phone ||
        `${order.customerName ?? "Без імені"}-${order.city ?? ""}`;

      const current = customersMap.get(key) ?? {
        key,
        name: order.customerName || "Без імені",
        phone: order.phone || "—",
        city: order.city || "—",
        orders: 0,
        completedOrders: 0,
        totalOrdered: 0,
        totalBought: 0,
        lastOrder: undefined,
      };

      current.orders += 1;
      current.totalOrdered += Number(order.total || 0);

      if (
        finishedStatuses.has(
          String(order.status ?? "").toLowerCase()
        )
      ) {
        current.completedOrders += 1;
        current.totalBought += Number(order.total || 0);
      }

      if (
        order.createdAt &&
        (!current.lastOrder ||
          new Date(order.createdAt).getTime() >
            new Date(current.lastOrder).getTime())
      ) {
        current.lastOrder = order.createdAt;
      }

      customersMap.set(key, current);
    }

    const customers = Array.from(customersMap.values()).sort(
      (a, b) => b.totalBought - a.totalBought
    );

    const productsMap = new Map<
      string,
      {
        name: string;
        quantity: number;
        orders: number;
        revenue: number;
        area: number;
      }
    >();

    for (const order of completed) {
      const seenInOrder = new Set<string>();

      for (const item of order.items ?? []) {
        const name = item.name || "Товар без назви";
        const quantity = Number(item.quantity || 1);
        const revenue = Number(item.price || 0) * quantity;
        const area = Number(item.area || 0) * quantity;

        const current = productsMap.get(name) ?? {
          name,
          quantity: 0,
          orders: 0,
          revenue: 0,
          area: 0,
        };

        current.quantity += quantity;
        current.revenue += revenue;
        current.area += area;

        if (!seenInOrder.has(name)) {
          current.orders += 1;
          seenInOrder.add(name);
        }

        productsMap.set(name, current);
      }
    }

    const products = Array.from(productsMap.values()).sort(
      (a, b) => b.quantity - a.quantity
    );

    const monthlyMap = new Map<
      string,
      {
        month: string;
        orders: number;
        completed: number;
        revenue: number;
        canceled: number;
        canceledAmount: number;
        returned: number;
        returnedAmount: number;
      }
    >();

    for (const order of periodOrders) {
      const key = monthKey(order.createdAt);
      if (!key) continue;

      const current = monthlyMap.get(key) ?? {
        month: key,
        orders: 0,
        completed: 0,
        revenue: 0,
        canceled: 0,
        canceledAmount: 0,
        returned: 0,
        returnedAmount: 0,
      };

      current.orders += 1;

      const status = String(order.status ?? "").toLowerCase();

      if (finishedStatuses.has(status)) {
        current.completed += 1;
        current.revenue += Number(order.total || 0);
      }

      if (canceledStatuses.has(status)) {
        current.canceled += 1;
        current.canceledAmount += Number(order.total || 0);
      }

      if (returnedStatuses.has(status)) {
        current.returned += 1;
        current.returnedAmount += Number(order.total || 0);
      }

      monthlyMap.set(key, current);
    }

    const monthly = Array.from(monthlyMap.values()).sort(
      (a, b) => b.month.localeCompare(a.month)
    );

    return {
      monthOrders,
      monthCompleted,
      monthCanceled,
      monthReturned,
      completedRevenue,
      monthRevenue,
      canceled,
      canceledAmount,
      monthCanceledAmount,
      returned,
      returnedAmount,
      monthReturnedAmount,
      customers,
      products,
      monthly,
    };
  }, [periodOrders]);

  const customerSearch = search.trim().toLowerCase();

  const visibleCustomers = analytics.customers.filter(
    (customer) =>
      !customerSearch ||
      customer.name.toLowerCase().includes(customerSearch) ||
      customer.phone.toLowerCase().includes(customerSearch) ||
      customer.city.toLowerCase().includes(customerSearch)
  );

  const selectedCustomer =
    analytics.customers.find(
      (customer) => customer.key === selectedCustomerKey
    ) ?? null;

  const selectedCustomerOrders = selectedCustomer
    ? periodOrders
        .filter((order) => {
          const phone = normalizePhone(order.phone);
          const key =
            phone ||
            `${order.customerName ?? "Без імені"}-${order.city ?? ""}`;

          return key === selectedCustomer.key;
        })
        .sort(
          (a, b) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        )
    : [];

  const selectedCustomerAverageCheck =
    selectedCustomer && selectedCustomer.completedOrders > 0
      ? selectedCustomer.totalBought /
        selectedCustomer.completedOrders
      : 0;

  const chartMonths = [...analytics.monthly]
    .slice(0, 12)
    .reverse();

  const maxMonthlyRevenue = Math.max(
    1,
    ...chartMonths.map((item) => item.revenue)
  );

  const maxMonthlyProblems = Math.max(
    1,
    ...chartMonths.map(
      (item) => item.canceled + item.returned
    )
  );

  const topProduct = analytics.products[0];

  const cards = [
    {
      label: "Продажі за період",
      value: `${money(analytics.completedRevenue)} грн`,
      note: `${analytics.monthCompleted.length} виконаних замовлень`,
    },
    {
      label: "Замовлень за період",
      value: periodOrders.length,
      note: "усі статуси",
    },
    {
      label: "Відмов за період",
      value: analytics.canceled.length,
      note: `${money(analytics.canceledAmount)} грн`,
    },
    {
      label: "Повернень за період",
      value: analytics.returned.length,
      note: `${money(analytics.returnedAmount)} грн`,
    },
    {
      label: "Клієнтів",
      value: analytics.customers.length,
      note: "унікальні телефони",
    },
    {
      label: "Топ товар",
      value: topProduct?.name || "—",
      note: topProduct
        ? `${topProduct.quantity} шт. у виконаних замовленнях`
        : "ще немає даних",
    },
  ];

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f1ed",
        padding: "34px 20px 70px",
        color: "#1c1c1c",
      }}
    >
      <div
        style={{
          width: "min(1400px, 100%)",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "18px",
            flexWrap: "wrap",
            marginBottom: "22px",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 7px",
                color: "#9a7b4f",
                fontWeight: 900,
                letterSpacing: "1.3px",
                textTransform: "uppercase",
                fontSize: "13px",
              }}
            >
              DreamCarpet CRM
            </p>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(34px, 5vw, 54px)",
              }}
            >
              CRM та аналітика
            </h1>

            <p
              style={{
                margin: "10px 0 0",
                color: "#6d665d",
              }}
            >
              Клієнти, продажі, відмови, повернення та товари.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/admin"
              style={{
                padding: "12px 16px",
                borderRadius: "11px",
                background: "#181714",
                color: "#ffffff",
                textDecoration: "none",
                fontWeight: 900,
              }}
            >
              ← Адмінка
            </Link>

            <button
              type="button"
              onClick={() => void loadOrders()}
              style={{
                padding: "12px 16px",
                borderRadius: "11px",
                border: "1px solid #cbbda8",
                background: "#ffffff",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Оновити
            </button>
          </div>
        </div>

        {message && (
          <div
            style={{
              marginBottom: "18px",
              padding: "14px",
              borderRadius: "12px",
              background: "#ffe6e6",
              color: "#8d1f1f",
              fontWeight: 800,
            }}
          >
            {message}
          </div>
        )}

        <section
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
            flexWrap: "wrap",
            marginBottom: "18px",
            padding: "14px",
            borderRadius: "16px",
            background: "#ffffff",
            border: "1px solid #e2d8ca",
          }}
        >
          <div>
            <strong style={{ display: "block", marginBottom: "4px" }}>
              Період аналітики
            </strong>
            <span style={{ color: "#766f66", fontSize: "12px" }}>
              Усі цифри нижче рахуються за вибраний період.
            </span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {[
              ["today", "Сьогодні"],
              ["7d", "7 днів"],
              ["30d", "30 днів"],
              ["this-month", "Цей місяць"],
              ["last-month", "Минулий місяць"],
              ["all", "Весь час"],
            ].map(([value, label]) => {
              const active = period === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPeriod(value as PeriodFilter)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "10px",
                    border: active ? "1px solid #181714" : "1px solid #d5c9b8",
                    background: active ? "#181714" : "#f7f2ea",
                    color: active ? "#ffffff" : "#181714",
                    fontWeight: 900,
                    cursor: "pointer",
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </section>

        <section
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(190px, 1fr))",
            gap: "12px",
            marginBottom: "20px",
          }}
        >
          {cards.map((card) => (
            <div
              key={card.label}
              style={{
                padding: "18px",
                borderRadius: "18px",
                background: "#181714",
                color: "#ffffff",
              }}
            >
              <div
                style={{
                  color: "#d7c6aa",
                  fontSize: "12px",
                  fontWeight: 800,
                }}
              >
                {card.label}
              </div>

              <div
                style={{
                  marginTop: "6px",
                  fontSize: "27px",
                  fontWeight: 900,
                  wordBreak: "break-word",
                }}
              >
                {card.value}
              </div>

              <div
                style={{
                  marginTop: "4px",
                  color: "#aaa39a",
                  fontSize: "12px",
                }}
              >
                {card.note}
              </div>
            </div>
          ))}
        </section>

        <nav
          style={{
            display: "flex",
            gap: "8px",
            flexWrap: "wrap",
            padding: "10px",
            marginBottom: "18px",
            borderRadius: "16px",
            background: "#ffffff",
            border: "1px solid #e2d8ca",
          }}
        >
          {[
            ["overview", "📊 Огляд"],
            ["customers", "👥 Клієнти"],
            ["sales", "💰 Продажі"],
            ["products", "🧶 Товари"],
            ["problems", "↩️ Відмови / повернення"],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTab(value as CrmTab)}
              style={{
                padding: "11px 14px",
                borderRadius: "10px",
                border: "none",
                background:
                  tab === value ? "#d4af37" : "#f1ece4",
                color: "#171717",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              {label}
            </button>
          ))}
        </nav>

        {isLoading ? (
          <section style={panelStyle}>
            Завантаження CRM...
          </section>
        ) : tab === "overview" ? (
          <section style={panelStyle}>
            <h2 style={titleStyle}>Загальний огляд</h2>

            <div style={overviewGridStyle}>
              <div style={miniCardStyle}>
                <span>Продано за весь час</span>
                <strong>
                  {money(analytics.completedRevenue)} грн
                </strong>
              </div>

              <div style={miniCardStyle}>
                <span>Відмов за весь час</span>
                <strong>{analytics.canceled.length}</strong>
                <small>
                  {money(analytics.canceledAmount)} грн
                </small>
              </div>

              <div style={miniCardStyle}>
                <span>Повернень за весь час</span>
                <strong>{analytics.returned.length}</strong>
                <small>
                  {money(analytics.returnedAmount)} грн
                </small>
              </div>

              <div style={miniCardStyle}>
                <span>Найкращий клієнт</span>
                <strong>
                  {analytics.customers[0]?.name || "—"}
                </strong>
                <small>
                  {money(
                    analytics.customers[0]?.totalBought || 0
                  )}{" "}
                  грн
                </small>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(320px, 1fr))",
                gap: "18px",
                marginTop: "26px",
              }}
            >
              <div
                style={{
                  padding: "20px",
                  borderRadius: "18px",
                  background: "#f7f3ec",
                  border: "1px solid #e2d8ca",
                }}
              >
                <h3 style={{ margin: "0 0 6px" }}>
                  📈 Продажі по місяцях
                </h3>

                <p
                  style={{
                    margin: "0 0 18px",
                    color: "#756d63",
                    fontSize: "13px",
                  }}
                >
                  Рахуються тільки виконані замовлення.
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "10px",
                    height: "230px",
                    overflowX: "auto",
                    paddingBottom: "4px",
                  }}
                >
                  {chartMonths.length === 0 ? (
                    <p>Ще немає даних.</p>
                  ) : (
                    chartMonths.map((item) => {
                      const height = Math.max(
                        8,
                        Math.round(
                          (item.revenue / maxMonthlyRevenue) *
                            170
                        )
                      );

                      return (
                        <div
                          key={`sales-${item.month}`}
                          title={`${item.month}: ${money(
                            item.revenue
                          )} грн`}
                          style={{
                            minWidth: "54px",
                            display: "grid",
                            justifyItems: "center",
                            alignContent: "end",
                            gap: "6px",
                            height: "100%",
                          }}
                        >
                          <strong
                            style={{
                              fontSize: "11px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.revenue > 0
                              ? `${money(item.revenue)}`
                              : "0"}
                          </strong>

                          <div
                            style={{
                              width: "34px",
                              height: `${height}px`,
                              borderRadius: "9px 9px 4px 4px",
                              background: "#d4af37",
                            }}
                          />

                          <span
                            style={{
                              color: "#777067",
                              fontSize: "11px",
                            }}
                          >
                            {item.month.slice(5)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              <div
                style={{
                  padding: "20px",
                  borderRadius: "18px",
                  background: "#f7f3ec",
                  border: "1px solid #e2d8ca",
                }}
              >
                <h3 style={{ margin: "0 0 6px" }}>
                  ↩️ Відмови та повернення
                </h3>

                <p
                  style={{
                    margin: "0 0 18px",
                    color: "#756d63",
                    fontSize: "13px",
                  }}
                >
                  Скільки проблемних замовлень було кожного
                  місяця.
                </p>

                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    gap: "10px",
                    height: "230px",
                    overflowX: "auto",
                    paddingBottom: "4px",
                  }}
                >
                  {chartMonths.length === 0 ? (
                    <p>Ще немає даних.</p>
                  ) : (
                    chartMonths.map((item) => {
                      const problems =
                        item.canceled + item.returned;

                      const height = Math.max(
                        8,
                        Math.round(
                          (problems / maxMonthlyProblems) *
                            170
                        )
                      );

                      return (
                        <div
                          key={`problems-${item.month}`}
                          title={`${item.month}: відмов ${item.canceled}, повернень ${item.returned}`}
                          style={{
                            minWidth: "54px",
                            display: "grid",
                            justifyItems: "center",
                            alignContent: "end",
                            gap: "6px",
                            height: "100%",
                          }}
                        >
                          <strong
                            style={{
                              fontSize: "12px",
                            }}
                          >
                            {problems}
                          </strong>

                          <div
                            style={{
                              width: "34px",
                              height: `${height}px`,
                              borderRadius: "9px 9px 4px 4px",
                              background:
                                problems > 0
                                  ? "#b94a48"
                                  : "#d8d1c7",
                            }}
                          />

                          <span
                            style={{
                              color: "#777067",
                              fontSize: "11px",
                            }}
                          >
                            {item.month.slice(5)}
                          </span>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            <h3 style={{ marginTop: "26px" }}>
              Останні місяці
            </h3>

            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th>Місяць</th>
                    <th>Замовлень</th>
                    <th>Виконано</th>
                    <th>Продаж</th>
                    <th>Відмов</th>
                    <th>Повернень</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.monthly.slice(0, 12).map((row) => (
                    <tr key={row.month}>
                      <td>{row.month}</td>
                      <td>{row.orders}</td>
                      <td>{row.completed}</td>
                      <td>{money(row.revenue)} грн</td>
                      <td>
                        {row.canceled} /{" "}
                        {money(row.canceledAmount)} грн
                      </td>
                      <td>
                        {row.returned} /{" "}
                        {money(row.returnedAmount)} грн
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : tab === "customers" ? (
          <section style={panelStyle}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                alignItems: "center",
                flexWrap: "wrap",
                marginBottom: "18px",
              }}
            >
              <h2 style={titleStyle}>Клієнти</h2>

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Пошук: ім'я, телефон, місто"
                style={{
                  width: "min(420px, 100%)",
                  padding: "12px",
                  borderRadius: "10px",
                  border: "1px solid #d2c7b8",
                  fontSize: "15px",
                }}
              />
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th>Клієнт</th>
                    <th>Телефон</th>
                    <th>Місто</th>
                    <th>Замовлень</th>
                    <th>Виконано</th>
                    <th>Купив на</th>
                    <th>Останнє</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleCustomers.map((customer) => (
                    <tr
                      key={customer.key}
                      onClick={() =>
                        setSelectedCustomerKey(customer.key)
                      }
                      style={{
                        cursor: "pointer",
                        background:
                          selectedCustomerKey === customer.key
                            ? "#f4ead6"
                            : undefined,
                      }}
                      title="Натисніть, щоб відкрити картку клієнта"
                    >
                      <td>
                        <strong>{customer.name}</strong>
                      </td>
                      <td>{customer.phone}</td>
                      <td>{customer.city}</td>
                      <td>{customer.orders}</td>
                      <td>{customer.completedOrders}</td>
                      <td>
                        {money(customer.totalBought)} грн
                      </td>
                      <td>{dateText(customer.lastOrder)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {selectedCustomer && (
              <div
                style={{
                  marginTop: "22px",
                  padding: "22px",
                  borderRadius: "18px",
                  background: "#181714",
                  color: "#ffffff",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "14px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: "0 0 6px",
                        color: "#d4af37",
                        fontWeight: 900,
                        fontSize: "12px",
                        textTransform: "uppercase",
                      }}
                    >
                      Картка клієнта
                    </p>

                    <h3
                      style={{
                        margin: 0,
                        fontSize: "30px",
                      }}
                    >
                      {selectedCustomer.name}
                    </h3>

                    <p
                      style={{
                        margin: "8px 0 0",
                        color: "#d4cec5",
                      }}
                    >
                      {selectedCustomer.phone} ·{" "}
                      {selectedCustomer.city}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() =>
                      setSelectedCustomerKey(null)
                    }
                    style={{
                      padding: "9px 12px",
                      borderRadius: "9px",
                      border: "1px solid #44413c",
                      background: "#2a2824",
                      color: "#ffffff",
                      cursor: "pointer",
                      fontWeight: 800,
                    }}
                  >
                    ✕ Закрити
                  </button>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(160px, 1fr))",
                    gap: "10px",
                    marginTop: "18px",
                  }}
                >
                  {[
                    {
                      label: "Усі замовлення",
                      value: selectedCustomer.orders,
                    },
                    {
                      label: "Виконано",
                      value: selectedCustomer.completedOrders,
                    },
                    {
                      label: "Купив на",
                      value: `${money(
                        selectedCustomer.totalBought
                      )} грн`,
                    },
                    {
                      label: "Середній чек",
                      value: `${money(
                        selectedCustomerAverageCheck
                      )} грн`,
                    },
                    {
                      label: "Остання покупка",
                      value: dateText(
                        selectedCustomer.lastOrder
                      ),
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      style={{
                        padding: "14px",
                        borderRadius: "13px",
                        background: "#24221f",
                        border: "1px solid #38342e",
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          color: "#aaa39a",
                          fontSize: "11px",
                          fontWeight: 800,
                        }}
                      >
                        {item.label}
                      </span>

                      <strong
                        style={{
                          display: "block",
                          marginTop: "5px",
                          fontSize: "19px",
                        }}
                      >
                        {item.value}
                      </strong>
                    </div>
                  ))}
                </div>

                <h4
                  style={{
                    margin: "22px 0 10px",
                    fontSize: "18px",
                  }}
                >
                  Історія замовлень
                </h4>

                <div
                  style={{
                    overflowX: "auto",
                    borderRadius: "12px",
                    background: "#ffffff",
                    color: "#171717",
                  }}
                >
                  <table style={tableStyle}>
                    <thead>
                      <tr>
                        <th>№</th>
                        <th>Дата</th>
                        <th>Статус</th>
                        <th>Сума</th>
                        <th>Товари</th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedCustomerOrders.map((order) => (
                        <tr
                          key={String(
                            order.id ?? order.orderNumber
                          )}
                        >
                          <td>
                            {order.orderNumber ||
                              order.id ||
                              "—"}
                          </td>
                          <td>{dateText(order.createdAt)}</td>
                          <td>{order.status || "—"}</td>
                          <td>
                            {money(Number(order.total || 0))} грн
                          </td>
                          <td>
                            {(order.items ?? [])
                              .map(
                                (item) =>
                                  item.name || "Товар"
                              )
                              .join(", ") || "—"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </section>
        ) : tab === "sales" ? (
          <section style={panelStyle}>
            <h2 style={titleStyle}>Продажі по місяцях</h2>

            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th>Місяць</th>
                    <th>Усі замовлення</th>
                    <th>Продажі</th>
                    <th>Сума продажів</th>
                    <th>Середній чек</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.monthly.map((row) => (
                    <tr key={row.month}>
                      <td>{row.month}</td>
                      <td>{row.orders}</td>
                      <td>{row.completed}</td>
                      <td>{money(row.revenue)} грн</td>
                      <td>
                        {money(
                          row.completed > 0
                            ? row.revenue / row.completed
                            : 0
                        )}{" "}
                        грн
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : tab === "products" ? (
          <section style={panelStyle}>
            <h2 style={titleStyle}>
              Які товари продаються найчастіше
            </h2>

            <div style={{ overflowX: "auto" }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th>№</th>
                    <th>Товар</th>
                    <th>Штук</th>
                    <th>Замовлень</th>
                    <th>Площа</th>
                    <th>Сума</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.products.map((product, index) => (
                    <tr key={product.name}>
                      <td>{index + 1}</td>
                      <td>
                        <strong>{product.name}</strong>
                      </td>
                      <td>{product.quantity}</td>
                      <td>{product.orders}</td>
                      <td>
                        {product.area.toFixed(2)} м²
                      </td>
                      <td>{money(product.revenue)} грн</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : (
          <section style={panelStyle}>
            <h2 style={titleStyle}>
              Відмови та повернення
            </h2>

            <p
              style={{
                marginTop: 0,
                color: "#6d665d",
              }}
            >
              Відмова = статус canceled. Повернення =
              статус returned/refunded.
            </p>

            <div style={overviewGridStyle}>
              <div style={miniCardStyle}>
                <span>Відмов</span>
                <strong>{analytics.canceled.length}</strong>
                <small>
                  {money(analytics.canceledAmount)} грн
                </small>
              </div>

              <div style={miniCardStyle}>
                <span>Повернень</span>
                <strong>{analytics.returned.length}</strong>
                <small>
                  {money(analytics.returnedAmount)} грн
                </small>
              </div>
            </div>

            <div style={{ overflowX: "auto", marginTop: 20 }}>
              <table style={tableStyle}>
                <thead>
                  <tr>
                    <th>№</th>
                    <th>Дата</th>
                    <th>Клієнт</th>
                    <th>Телефон</th>
                    <th>Статус</th>
                    <th>Сума</th>
                  </tr>
                </thead>
                <tbody>
                  {[...analytics.canceled, ...analytics.returned]
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt || 0).getTime() -
                        new Date(a.createdAt || 0).getTime()
                    )
                    .map((order) => (
                      <tr
                        key={String(
                          order.id ?? order.orderNumber
                        )}
                      >
                        <td>
                          {order.orderNumber || order.id || "—"}
                        </td>
                        <td>{dateText(order.createdAt)}</td>
                        <td>{order.customerName || "—"}</td>
                        <td>{order.phone || "—"}</td>
                        <td>{order.status || "—"}</td>
                        <td>{money(Number(order.total || 0))} грн</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

const panelStyle = {
  padding: "24px",
  borderRadius: "20px",
  background: "#ffffff",
  border: "1px solid #e2d8ca",
  boxShadow: "0 10px 30px rgba(40, 30, 15, 0.05)",
} as const;

const titleStyle = {
  margin: "0 0 18px",
  fontSize: "28px",
} as const;

const overviewGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(190px, 1fr))",
  gap: "12px",
} as const;

const miniCardStyle = {
  display: "grid",
  gap: "5px",
  padding: "17px",
  borderRadius: "15px",
  background: "#f5f0e8",
  border: "1px solid #e2d8ca",
} as const;

const tableStyle = {
  width: "100%",
  minWidth: "760px",
  borderCollapse: "collapse",
  textAlign: "left",
} as const;