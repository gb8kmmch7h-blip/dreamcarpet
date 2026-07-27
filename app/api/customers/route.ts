import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

type SavedOrder = {
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

function getOrdersFilePath() {
  return path.join(
    process.cwd(),
    "database",
    "orders.json"
  );
}

async function readOrders(): Promise<SavedOrder[]> {
  try {
    const fileContent = await readFile(
      getOrdersFilePath(),
      "utf-8"
    );

    const parsedData: unknown =
      JSON.parse(fileContent);

    if (!Array.isArray(parsedData)) {
      return [];
    }

    return parsedData as SavedOrder[];
  } catch (error) {
    console.error(
      "Не вдалося прочитати orders.json:",
      error
    );

    return [];
  }
}

function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "");
}

function createCustomerId(
  phone: string,
  customerName: string
) {
  const normalizedPhone =
    normalizePhone(phone);

  if (normalizedPhone) {
    return normalizedPhone;
  }

  return customerName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function getItemsCount(items: OrderItem[]) {
  return items.reduce((total, item) => {
    const quantity =
      typeof item.quantity === "number" &&
      Number.isFinite(item.quantity)
        ? item.quantity
        : 1;

    return total + quantity;
  }, 0);
}

/*
  GET /api/customers

  Автоматично формує базу клієнтів
  із замовлень у database/orders.json.
*/
export async function GET() {
  try {
    const orders = await readOrders();

    const customersMap =
      new Map<string, Customer>();

    const sortedOrders = [...orders].sort(
      (firstOrder, secondOrder) =>
        new Date(
          firstOrder.createdAt
        ).getTime() -
        new Date(
          secondOrder.createdAt
        ).getTime()
    );

    for (const order of sortedOrders) {
      const customerId = createCustomerId(
        order.phone,
        order.customerName
      );

      const customerOrder: CustomerOrder = {
        id: order.id,
        orderNumber: order.orderNumber,
        createdAt: order.createdAt,
        status: order.status,
        total: Number(order.total) || 0,
        paidAmount:
          Number(order.paidAmount) || 0,
        amountDue:
          Number(order.amountDue) || 0,
        delivery: order.delivery || "",
        city: order.city || "",
        warehouse: order.warehouse || "",
        paymentMethod:
          order.paymentMethod || "",
        itemsCount: getItemsCount(
          Array.isArray(order.items)
            ? order.items
            : []
        ),
      };

      const existingCustomer =
        customersMap.get(customerId);

      if (!existingCustomer) {
        customersMap.set(customerId, {
          id: customerId,
          customerName:
            order.customerName ||
            "Не вказано",
          phone:
            order.phone || "Не вказано",
          city:
            order.city || "Не вказано",

          ordersCount: 1,
          completedOrdersCount:
            order.status === "completed"
              ? 1
              : 0,
          cancelledOrdersCount:
            order.status === "cancelled"
              ? 1
              : 0,

          totalSpent:
            order.status === "cancelled"
              ? 0
              : Number(order.total) || 0,

          totalPaid:
            order.status === "cancelled"
              ? 0
              : Number(
                  order.paidAmount
                ) || 0,

          totalDue:
            order.status === "cancelled"
              ? 0
              : Number(
                  order.amountDue
                ) || 0,

          firstOrderAt: order.createdAt,
          lastOrderAt: order.createdAt,

          orders: [customerOrder],
        });

        continue;
      }

      existingCustomer.customerName =
        order.customerName ||
        existingCustomer.customerName;

      existingCustomer.phone =
        order.phone ||
        existingCustomer.phone;

      existingCustomer.city =
        order.city ||
        existingCustomer.city;

      existingCustomer.ordersCount += 1;

      if (order.status === "completed") {
        existingCustomer.completedOrdersCount += 1;
      }

      if (order.status === "cancelled") {
        existingCustomer.cancelledOrdersCount += 1;
      }

      if (order.status !== "cancelled") {
        existingCustomer.totalSpent +=
          Number(order.total) || 0;

        existingCustomer.totalPaid +=
          Number(order.paidAmount) || 0;

        existingCustomer.totalDue +=
          Number(order.amountDue) || 0;
      }

      const currentOrderTime = new Date(
        order.createdAt
      ).getTime();

      const firstOrderTime = new Date(
        existingCustomer.firstOrderAt
      ).getTime();

      const lastOrderTime = new Date(
        existingCustomer.lastOrderAt
      ).getTime();

      if (currentOrderTime < firstOrderTime) {
        existingCustomer.firstOrderAt =
          order.createdAt;
      }

      if (currentOrderTime > lastOrderTime) {
        existingCustomer.lastOrderAt =
          order.createdAt;
      }

      existingCustomer.orders.push(
        customerOrder
      );
    }

    const customers = Array.from(
      customersMap.values()
    )
      .map((customer) => ({
        ...customer,
        orders: [...customer.orders].sort(
          (firstOrder, secondOrder) =>
            new Date(
              secondOrder.createdAt
            ).getTime() -
            new Date(
              firstOrder.createdAt
            ).getTime()
        ),
      }))
      .sort(
        (firstCustomer, secondCustomer) =>
          new Date(
            secondCustomer.lastOrderAt
          ).getTime() -
          new Date(
            firstCustomer.lastOrderAt
          ).getTime()
      );

    const totalRevenue = customers.reduce(
      (total, customer) =>
        total + customer.totalSpent,
      0
    );

    const totalPaid = customers.reduce(
      (total, customer) =>
        total + customer.totalPaid,
      0
    );

    const totalDue = customers.reduce(
      (total, customer) =>
        total + customer.totalDue,
      0
    );

    return NextResponse.json({
      success: true,
      customers,
      summary: {
        customersCount: customers.length,
        ordersCount: orders.length,
        totalRevenue,
        totalPaid,
        totalDue,
      },
    });
  } catch (error) {
    console.error(
      "Customers GET error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Не вдалося завантажити базу клієнтів",
      },
      {
        status: 500,
      }
    );
  }
}