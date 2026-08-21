import Link from "next/link";
import { notFound } from "next/navigation";

import { supabaseAdmin } from "../../../../../lib/supabaseAdmin";

import PrintButton from "./PrintButton";

type OrderItem = {
  id?: number;
  name?: string;
  article?: string;
  price?: number;
  quantity?: number;
  width?: number;
  length?: number;
  area?: number;
  total?: number;
};

type Order = {
  id: string;
  orderNumber?: number;
  status?: string;
  customerName?: string;
  phone?: string;
  delivery?: string;
  city?: string;
  warehouse?: string;
  paymentMethod?: string;
  comment?: string;
  total?: number;
  paidAmount?: number;
  amountDue?: number;
  createdAt?: string;
  items?: OrderItem[];
};

const statusLabels: Record<string, string> = {
  new: "Нове",
  pending: "Очікує",
  processing: "В обробці",
  confirmed: "Підтверджено",
  production: "У виробництві",
  ready: "Готове",
  shipped: "Відправлено",
  completed: "Завершено",
  canceled: "Скасовано",
};

function formatMoney(value?: number) {
  return new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

async function getOrder(id: string): Promise<Order | null> {
  const numericId = Number(id);

  let query = supabaseAdmin
    .from("orders")
    .select("*");

  if (Number.isInteger(numericId) && numericId > 0) {
    const { data: byId, error: byIdError } = await query
      .eq("id", numericId)
      .maybeSingle();

    if (byIdError) {
      console.error("Supabase print order by id error:", byIdError);
      throw new Error("Не вдалося завантажити замовлення");
    }

    if (byId) {
      return {
        id: String(byId.id),
        orderNumber: Number(byId.order_number),
        status: byId.status ?? "new",
        customerName: byId.customer_name ?? "",
        phone: byId.phone ?? "",
        delivery: byId.delivery ?? "",
        city: byId.city ?? "",
        warehouse: byId.warehouse ?? "",
        paymentMethod: byId.payment_method ?? "",
        comment: byId.comment ?? "",
        total: Number(byId.total ?? 0),
        paidAmount: Number(byId.paid_amount ?? 0),
        amountDue: Number(byId.amount_due ?? 0),
        createdAt: byId.created_at ?? "",
        items: Array.isArray(byId.items)
          ? (byId.items as OrderItem[])
          : [],
      };
    }

    const { data: byOrderNumber, error: byOrderNumberError } =
      await supabaseAdmin
        .from("orders")
        .select("*")
        .eq("order_number", numericId)
        .maybeSingle();

    if (byOrderNumberError) {
      console.error(
        "Supabase print order by order number error:",
        byOrderNumberError
      );
      throw new Error("Не вдалося завантажити замовлення");
    }

    if (byOrderNumber) {
      return {
        id: String(byOrderNumber.id),
        orderNumber: Number(byOrderNumber.order_number),
        status: byOrderNumber.status ?? "new",
        customerName: byOrderNumber.customer_name ?? "",
        phone: byOrderNumber.phone ?? "",
        delivery: byOrderNumber.delivery ?? "",
        city: byOrderNumber.city ?? "",
        warehouse: byOrderNumber.warehouse ?? "",
        paymentMethod: byOrderNumber.payment_method ?? "",
        comment: byOrderNumber.comment ?? "",
        total: Number(byOrderNumber.total ?? 0),
        paidAmount: Number(byOrderNumber.paid_amount ?? 0),
        amountDue: Number(byOrderNumber.amount_due ?? 0),
        createdAt: byOrderNumber.created_at ?? "",
        items: Array.isArray(byOrderNumber.items)
          ? (byOrderNumber.items as OrderItem[])
          : [],
      };
    }
  }

  const { data: byToken, error: byTokenError } = await supabaseAdmin
    .from("orders")
    .select("*")
    .eq("access_token", id)
    .maybeSingle();

  if (byTokenError) {
    console.error("Supabase print order by token error:", byTokenError);
    throw new Error("Не вдалося завантажити замовлення");
  }

  if (!byToken) {
    return null;
  }

  return {
    id: String(byToken.id),
    orderNumber: Number(byToken.order_number),
    status: byToken.status ?? "new",
    customerName: byToken.customer_name ?? "",
    phone: byToken.phone ?? "",
    delivery: byToken.delivery ?? "",
    city: byToken.city ?? "",
    warehouse: byToken.warehouse ?? "",
    paymentMethod: byToken.payment_method ?? "",
    comment: byToken.comment ?? "",
    total: Number(byToken.total ?? 0),
    paidAmount: Number(byToken.paid_amount ?? 0),
    amountDue: Number(byToken.amount_due ?? 0),
    createdAt: byToken.created_at ?? "",
    items: Array.isArray(byToken.items)
      ? (byToken.items as OrderItem[])
      : [],
  };
}

export default async function PrintOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await getOrder(id);

  if (!order) {
    notFound();
  }

  const orderTitle = order.orderNumber
    ? `№${order.orderNumber}`
    : order.id;

  return (
    <main className="print-page">
      <div className="top-actions no-print">
        <Link href="/admin/orders">
          ← Назад до замовлень
        </Link>

        <PrintButton />
      </div>

      <section className="document">
        <header className="doc-header">
          <div>
            <h1>DreamCarpet</h1>
            <p>Замовлення {orderTitle}</p>
          </div>

          <div className="status">
            {statusLabels[order.status || "new"] ||
              order.status ||
              "Нове"}
          </div>
        </header>

        <div className="info-grid">
          <div className="box">
            <h2>Клієнт</h2>

            <p>
              <strong>Ім’я:</strong>{" "}
              {order.customerName || "—"}
            </p>

            <p>
              <strong>Телефон:</strong>{" "}
              {order.phone || "—"}
            </p>

            <p>
              <strong>Дата:</strong>{" "}
              {formatDate(order.createdAt)}
            </p>
          </div>

          <div className="box">
            <h2>Доставка</h2>

            <p>
              <strong>Спосіб:</strong>{" "}
              {order.delivery || "—"}
            </p>

            <p>
              <strong>Місто:</strong>{" "}
              {order.city || "—"}
            </p>

            <p>
              <strong>Відділення:</strong>{" "}
              {order.warehouse || "—"}
            </p>
          </div>

          <div className="box">
            <h2>Оплата</h2>

            <p>
              <strong>Метод:</strong>{" "}
              {order.paymentMethod || "—"}
            </p>

            <p>
              <strong>Оплачено:</strong>{" "}
              {formatMoney(order.paidAmount)} грн
            </p>

            <p>
              <strong>До сплати:</strong>{" "}
              {formatMoney(order.amountDue)} грн
            </p>
          </div>
        </div>

        <section className="items">
          <h2>Товари</h2>

          <table>
            <thead>
              <tr>
                <th>Товар</th>
                <th>Артикул</th>
                <th>Розмір</th>
                <th>К-сть</th>
                <th>Сума</th>
              </tr>
            </thead>

            <tbody>
              {(order.items || []).map((item, index) => (
                <tr key={`${item.id || index}-${index}`}>
                  <td>{item.name || "Товар"}</td>
                  <td>{item.article || "—"}</td>
                  <td>
                    {item.width && item.length
                      ? `${item.width} × ${item.length} м`
                      : item.area
                        ? `${item.area} м²`
                        : "—"}
                  </td>
                  <td>{item.quantity || 1}</td>
                  <td>
                    {formatMoney(item.total || item.price)} грн
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {order.comment && (
          <section className="comment">
            <h2>Коментар</h2>
            <p>{order.comment}</p>
          </section>
        )}

        <footer className="summary">
          <div>
            <span>Разом:</span>
            <strong>{formatMoney(order.total)} грн</strong>
          </div>

          <div>
            <span>Оплачено:</span>
            <strong>{formatMoney(order.paidAmount)} грн</strong>
          </div>

          <div>
            <span>До сплати:</span>
            <strong>{formatMoney(order.amountDue)} грн</strong>
          </div>
        </footer>

        <div className="signatures">
          <div>
            <span>Підпис клієнта</span>
          </div>

          <div>
            <span>Підпис менеджера</span>
          </div>
        </div>
      </section>

      <style>
        {`
          .print-page {
            min-height: 100vh;
            background: #f3eadb;
            padding: 24px;
            color: #171717;
          }

          .top-actions {
            max-width: 1000px;
            margin: 0 auto 18px;
            display: flex;
            justify-content: space-between;
            gap: 12px;
          }

          .top-actions a,
          .top-actions button {
            min-height: 46px;
            padding: 0 16px;
            border-radius: 12px;
            border: none;
            background: #171717;
            color: #ffffff;
            text-decoration: none;
            font: inherit;
            font-weight: 900;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            justify-content: center;
          }

          .document {
            max-width: 1000px;
            margin: 0 auto;
            background: #ffffff;
            padding: 34px;
            border-radius: 24px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
          }

          .doc-header {
            display: flex;
            justify-content: space-between;
            gap: 20px;
            align-items: flex-start;
            padding-bottom: 22px;
            border-bottom: 2px solid #171717;
          }

          .doc-header h1 {
            margin: 0;
            font-size: 42px;
            line-height: 1;
          }

          .doc-header h1::first-letter {
            color: #d4af37;
          }

          .doc-header p {
            margin: 8px 0 0;
            font-size: 22px;
            font-weight: 900;
          }

          .status {
            border-radius: 999px;
            background: #d4af37;
            color: #171717;
            padding: 10px 16px;
            font-weight: 900;
          }

          .info-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            margin-top: 24px;
          }

          .box {
            border: 1px solid #ddd0bd;
            border-radius: 16px;
            padding: 16px;
            background: #fffaf1;
          }

          .document h2 {
            margin: 0 0 12px;
            font-size: 20px;
          }

          .document p {
            margin: 7px 0;
            line-height: 1.45;
          }

          .items {
            margin-top: 26px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            overflow: hidden;
            border-radius: 14px;
          }

          th {
            background: #171717;
            color: #ffffff;
            text-align: left;
            padding: 12px;
            font-size: 14px;
          }

          td {
            border: 1px solid #e5d7c5;
            padding: 12px;
            vertical-align: top;
          }

          .comment {
            margin-top: 24px;
            border: 1px solid #ddd0bd;
            border-radius: 16px;
            padding: 16px;
            background: #fffaf1;
          }

          .summary {
            margin-top: 28px;
            margin-left: auto;
            max-width: 360px;
            display: grid;
            gap: 10px;
          }

          .summary div {
            display: flex;
            justify-content: space-between;
            gap: 16px;
            border-bottom: 1px solid #ddd0bd;
            padding-bottom: 8px;
          }

          .summary span {
            font-weight: 800;
          }

          .summary strong {
            font-size: 20px;
          }

          .signatures {
            margin-top: 54px;
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }

          .signatures div {
            border-top: 1px solid #171717;
            padding-top: 10px;
            color: #555555;
          }

          @media print {
            .no-print {
              display: none;
            }

            .print-page {
              background: #ffffff;
              padding: 0;
            }

            .document {
              max-width: none;
              box-shadow: none;
              border-radius: 0;
              padding: 0;
            }
          }

          @media (max-width: 800px) {
            .print-page {
              padding: 14px;
            }

            .document {
              padding: 20px;
            }

            .doc-header {
              display: grid;
            }

            .info-grid {
              grid-template-columns: 1fr;
            }

            .top-actions {
              display: grid;
            }

            .items {
              overflow-x: auto;
            }

            table {
              min-width: 680px;
            }

            .signatures {
              grid-template-columns: 1fr;
            }
          }
        `}
      </style>
    </main>
  );
}