"use client";

import Link from "next/link";
import { FormEvent, useEffect, useMemo, useState } from "react";

import { useCart } from "../../context/CartContext";

type PaymentMethod =
  | "cash-on-delivery"
  | "prepayment"
  | "full-payment";

const ORDER_TOKENS_STORAGE_KEY =
  "dreamcarpet-order-tokens";

function formatNumber(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

const inputStyle = {
  width: "100%",
  padding: "13px",
  border: "1px solid #cccccc",
  borderRadius: "10px",
  fontSize: "16px",
  boxSizing: "border-box" as const,
  background: "#ffffff",
  color: "#111111",
};

export default function CheckoutPage() {
  const {
    cart,
    totalPrice,
    totalItems,
    clearCart,
    isCartLoaded,
  } = useCart();

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [delivery, setDelivery] =
    useState("nova-poshta");

  const totalArea = useMemo(() => {
    return cart.reduce(
      (sum, item) =>
        sum + item.area * item.quantity,
      0
    );
  }, [cart]);

  const allowedPayments =
    useMemo<PaymentMethod[]>(() => {
      if (totalArea > 15) {
        return ["full-payment"];
      }

      if (totalArea >= 10) {
        return ["prepayment", "full-payment"];
      }

      return [
        "cash-on-delivery",
        "prepayment",
        "full-payment",
      ];
    }, [totalArea]);

  const [payment, setPayment] =
    useState<PaymentMethod>("cash-on-delivery");

  useEffect(() => {
    if (!allowedPayments.includes(payment)) {
      setPayment(allowedPayments[0]);
    }
  }, [allowedPayments, payment]);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    const customerName = String(
      formData.get("fullName") || ""
    ).trim();

    const phone = String(
      formData.get("phone") || ""
    ).trim();

    const city = String(
      formData.get("city") || ""
    ).trim();

    const warehouse = String(
      formData.get("warehouse") || ""
    ).trim();

    const comment = String(
      formData.get("comment") || ""
    ).trim();

    if (!customerName || !phone) {
      setErrorMessage("Заповніть ім’я та номер телефону.");
      return;
    }

    if (
      delivery === "nova-poshta" &&
      (!city || !warehouse)
    ) {
      setErrorMessage(
        "Вкажіть місто та відділення Нової пошти."
      );
      return;
    }

    if (!allowedPayments.includes(payment)) {
      setErrorMessage(
        "Обраний спосіб оплати недоступний для цієї площі."
      );
      return;
    }

    const paymentLabels: Record<
      PaymentMethod,
      string
    > = {
      "cash-on-delivery": "Накладений платіж",
      prepayment: "Передоплата 200 грн",
      "full-payment":
        "Онлайн-оплата — Apple Pay / Google Pay / картка",
    };

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customerName,
          phone,
          delivery:
            delivery === "nova-poshta"
              ? "Нова пошта"
              : "Самовивіз",
          city:
            delivery === "nova-poshta"
              ? city
              : "Самовивіз",
          warehouse:
            delivery === "nova-poshta"
              ? warehouse
              : "Самовивіз",
          paymentMethod: paymentLabels[payment],
          comment,
          total: totalPrice,
          area: totalArea,
          items: cart.map((item) => ({
            name: item.name,
            image: item.image,
            color: item.color,
            width: item.width,
            length: item.length,
            area: item.area,
            quantity: item.quantity,
            price: item.price,
          })),
        }),
      });

      const result =
        (await response.json()) as {
          message?: string;
          orderNumber?: number;
          accessToken?: string;
        };

      if (!response.ok) {
        throw new Error(
          result.message ||
            "Не вдалося надіслати замовлення."
        );
      }

      if (
        typeof result.accessToken === "string" &&
        result.accessToken.length > 0
      ) {
        try {
          const storedValue =
            localStorage.getItem(
              ORDER_TOKENS_STORAGE_KEY
            );

          const parsedTokens: unknown =
            storedValue
              ? JSON.parse(storedValue)
              : [];

          const existingTokens =
            Array.isArray(parsedTokens)
              ? parsedTokens.filter(
                  (token): token is string =>
                    typeof token === "string"
                )
              : [];

          const updatedTokens = [
            result.accessToken,
            ...existingTokens.filter(
              (token) =>
                token !== result.accessToken
            ),
          ].slice(0, 20);

          localStorage.setItem(
            ORDER_TOKENS_STORAGE_KEY,
            JSON.stringify(updatedTokens)
          );
        } catch (storageError) {
          console.error(
            "Не вдалося зберегти замовлення у браузері:",
            storageError
          );
        }
      }

      setMessage(
        payment === "full-payment"
          ? result.orderNumber
            ? `Замовлення №${result.orderNumber} створено. Онлайн-оплата буде доступна після підключення платіжного мерчанта. Зараз кошти не списуються.`
            : "Замовлення створено. Онлайн-оплата буде доступна після підключення платіжного мерчанта. Зараз кошти не списуються."
          : result.orderNumber
            ? `Замовлення №${result.orderNumber} успішно оформлено!`
            : "Замовлення успішно оформлено!"
      );

      clearCart();
      form.reset();
      setDelivery("nova-poshta");
      setPayment("cash-on-delivery");
    } catch (error) {
      console.error("Помилка оформлення:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Сталася помилка під час оформлення замовлення."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isCartLoaded) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f4f1ec",
        }}
      >
        <p>Завантаження...</p>
      </main>
    );
  }

  if (cart.length === 0 && !message) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "70px 20px",
          background: "#f4f1ec",
          color: "#171717",
        }}
      >
        <div
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            padding: "50px 25px",
            borderRadius: "22px",
            background: "#ffffff",
            textAlign: "center",
          }}
        >
          <h1 style={{ marginTop: 0 }}>
            Кошик порожній
          </h1>

          <p style={{ color: "#666666" }}>
            Спочатку додайте товар до кошика.
          </p>

          <Link
            href="/catalog"
            style={{
              display: "inline-block",
              marginTop: "20px",
              padding: "15px 24px",
              borderRadius: "11px",
              background: "#111111",
              color: "#ffffff",
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            Перейти до каталогу
          </Link>
        </div>
      </main>
    );
  }

  if (message) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "70px 20px",
          background: "#f4f1ec",
          color: "#171717",
        }}
      >
        <div
          style={{
            maxWidth: "750px",
            margin: "0 auto",
            padding: "55px 25px",
            borderRadius: "24px",
            background: "#ffffff",
            textAlign: "center",
          }}
        >
          <div style={{ fontSize: "70px" }}>✅</div>

          <h1>Дякуємо за замовлення!</h1>

          <p
            style={{
              color: "#666666",
              fontSize: "18px",
            }}
          >
            {message}
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: "12px",
              marginTop: "25px",
            }}
          >
            <Link
              href="/my-orders"
              style={{
                display: "inline-block",
                padding: "15px 24px",
                borderRadius: "11px",
                background: "#111111",
                color: "#ffffff",
                textDecoration: "none",
                fontWeight: 800,
              }}
            >
              Переглянути мої замовлення
            </Link>

            <Link
              href="/catalog"
              style={{
                display: "inline-block",
                padding: "15px 24px",
                border: "1px solid #cccccc",
                borderRadius: "11px",
                background: "#ffffff",
                color: "#171717",
                textDecoration: "none",
                fontWeight: 800,
              }}
            >
              Повернутися до каталогу
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "45px 20px 80px",
        background: "#f4f1ec",
        color: "#171717",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <h1
          style={{
            fontSize: "clamp(38px, 6vw, 56px)",
          }}
        >
          Оформлення замовлення
        </h1>

        <div
          className="checkout-layout"
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1fr) minmax(300px, 390px)",
            gap: "28px",
            alignItems: "start",
          }}
        >
          <form
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gap: "20px",
              padding: "30px",
              background: "#ffffff",
              borderRadius: "22px",
            }}
          >
            <div>
              <label>Ім’я та прізвище</label>

              <input
                name="fullName"
                required
                placeholder="Іван Іванов"
                style={inputStyle}
              />
            </div>

            <div>
              <label>Номер телефону</label>

              <input
                name="phone"
                type="tel"
                required
                placeholder="+380 67 123 45 67"
                style={inputStyle}
              />
            </div>

            <div>
              <label>Спосіб доставки</label>

              <select
                name="delivery"
                value={delivery}
                onChange={(event) =>
                  setDelivery(event.target.value)
                }
                style={inputStyle}
              >
                <option value="nova-poshta">
                  Нова пошта
                </option>

                <option value="pickup">
                  Самовивіз
                </option>
              </select>
            </div>

            {delivery === "nova-poshta" && (
              <>
                <div>
                  <label>Місто або населений пункт</label>

                  <input
                    name="city"
                    required
                    placeholder="Наприклад: Хмельницький"
                    style={inputStyle}
                  />
                </div>

                <div>
                  <label>Відділення Нової пошти</label>

                  <input
                    name="warehouse"
                    required
                    placeholder="Наприклад: Відділення №1"
                    style={inputStyle}
                  />
                </div>
              </>
            )}

            <div>
              <label>Спосіб оплати</label>

              <select
                name="payment"
                value={payment}
                onChange={(event) =>
                  setPayment(
                    event.target
                      .value as PaymentMethod
                  )
                }
                style={inputStyle}
              >
                {allowedPayments.includes(
                  "cash-on-delivery"
                ) && (
                  <option value="cash-on-delivery">
                    Накладений платіж
                  </option>
                )}

                {allowedPayments.includes(
                  "prepayment"
                ) && (
                  <option value="prepayment">
                    Передоплата 200 грн
                  </option>
                )}

                {allowedPayments.includes(
                  "full-payment"
                ) && (
                  <option value="full-payment">
                    Онлайн-оплата — Apple Pay / Google Pay / Visa / Mastercard
                  </option>
                )}
              </select>

              <div
                style={{
                  marginTop: "10px",
                  padding: "12px",
                  borderRadius: "10px",
                  background: "#f5f2ed",
                  color: "#555555",
                  lineHeight: 1.5,
                }}
              >
                Загальна площа замовлення:{" "}
                <strong>
                  {formatNumber(totalArea)} м²
                </strong>

                <br />

                {totalArea > 15
                  ? "Для замовлень понад 15 м² доступна тільки онлайн-оплата."
                  : totalArea >= 10
                    ? "Для замовлень від 10 до 15 м² доступна передоплата 200 грн або онлайн-оплата."
                    : "Для замовлень менше 10 м² доступні всі способи оплати."}
              </div>

              {payment === "full-payment" && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "16px",
                    borderRadius: "14px",
                    background:
                      "linear-gradient(135deg, #111111 0%, #2a2117 100%)",
                    color: "#ffffff",
                    border: "1px solid #d4af37",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "8px",
                      marginBottom: "10px",
                    }}
                  >
                    <span
                      style={{
                        padding: "7px 10px",
                        borderRadius: "999px",
                        background: "#ffffff",
                        color: "#111111",
                        fontWeight: 900,
                      }}
                    >
                       Pay
                    </span>

                    <span
                      style={{
                        padding: "7px 10px",
                        borderRadius: "999px",
                        background: "#ffffff",
                        color: "#111111",
                        fontWeight: 900,
                      }}
                    >
                      G Pay
                    </span>

                    <span
                      style={{
                        padding: "7px 10px",
                        borderRadius: "999px",
                        background: "#d4af37",
                        color: "#111111",
                        fontWeight: 900,
                      }}
                    >
                      Visa / Mastercard
                    </span>
                  </div>

                  <strong style={{ color: "#ffd95a" }}>
                    Онлайн-оплата підготовлена до підключення
                  </strong>

                  <p
                    style={{
                      margin: "8px 0 0",
                      color: "#eadfcf",
                      lineHeight: 1.55,
                    }}
                  >
                    Після підключення платіжного мерчанта гроші
                    надходитимуть на рахунок ФОП. Поки що це тестовий
                    режим: замовлення створюється, але кошти не списуються.
                  </p>
                </div>
              )}
            </div>

            <div>
              <label>Коментар</label>

              <textarea
                name="comment"
                rows={5}
                placeholder="Побажання щодо замовлення"
                style={inputStyle}
              />
            </div>

            {errorMessage && (
              <div
                style={{
                  padding: "13px",
                  borderRadius: "10px",
                  background: "#fff0f0",
                  color: "#a32222",
                  fontWeight: 700,
                }}
              >
                {errorMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: "16px",
                border: "none",
                borderRadius: "12px",
                background: "#111111",
                color: "#ffffff",
                fontSize: "18px",
                fontWeight: 800,
                cursor: "pointer",
                opacity: isSubmitting ? 0.7 : 1,
              }}
            >
              {isSubmitting
                ? "Оформлення..."
                : payment === "full-payment"
                  ? "Створити замовлення для онлайн-оплати"
                  : "Підтвердити замовлення"}
            </button>
          </form>

          <aside
            style={{
              position: "sticky",
              top: "25px",
              padding: "28px",
              borderRadius: "22px",
              background: "#ffffff",
            }}
          >
            <h2 style={{ marginTop: 0 }}>
              Ваше замовлення
            </h2>

            {cart.map((item) => (
              <div
                key={item.id}
                style={{
                  padding: "14px 0",
                  borderBottom:
                    "1px solid #eeeeee",
                }}
              >
                <strong>{item.name}</strong>

                <div
                  style={{
                    marginTop: "5px",
                    color: "#666666",
                  }}
                >
                  {formatNumber(item.width)} ×{" "}
                  {formatNumber(item.length)} м
                  <br />
                  Колір: {item.color}
                  <br />
                  Площа:{" "}
                  {formatNumber(item.area)} м²
                  <br />
                  Кількість: {item.quantity}
                </div>

                <strong
                  style={{
                    display: "block",
                    marginTop: "7px",
                  }}
                >
                  {formatNumber(
                    item.price * item.quantity
                  )}{" "}
                  грн
                </strong>
              </div>
            ))}

            <div
              style={{
                marginTop: "20px",
                lineHeight: 1.8,
              }}
            >
              Товарів: <strong>{totalItems}</strong>
              <br />
              Загальна площа:{" "}
              <strong>
                {formatNumber(totalArea)} м²
              </strong>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: "15px",
                marginTop: "20px",
                paddingTop: "20px",
                borderTop: "1px solid #dddddd",
              }}
            >
              <strong>Разом</strong>

              <strong style={{ fontSize: "30px" }}>
                {formatNumber(totalPrice)} грн
              </strong>
            </div>

            <Link
              href="/cart"
              style={{
                display: "block",
                marginTop: "20px",
                color: "#171717",
                textAlign: "center",
                fontWeight: 700,
              }}
            >
              Повернутися до кошика
            </Link>
          </aside>
        </div>
      </div>

      <style jsx>{`
        label {
          display: block;
          margin-bottom: 7px;
          font-weight: 700;
        }

        @media (max-width: 900px) {
          .checkout-layout {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}