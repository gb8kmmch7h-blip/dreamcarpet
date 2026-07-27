"use client";

import Image from "next/image";
import Link from "next/link";

import { useCart } from "../../context/CartContext";

function formatNumber(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function CartPage() {
  const {
    cart,
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
    clearCart,
    totalPrice,
    totalItems,
    isCartLoaded,
  } = useCart();

  if (!isCartLoaded) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "30px 20px",
          background: "#f4f1ec",
          color: "#171717",
        }}
      >
        <div
          style={{
            padding: "30px",
            background: "#ffffff",
            borderRadius: "20px",
            fontSize: "18px",
            fontWeight: 700,
          }}
        >
          Завантаження кошика...
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
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
            background: "#ffffff",
            borderRadius: "24px",
            boxShadow:
              "0 15px 45px rgba(0, 0, 0, 0.07)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              marginBottom: "20px",
              fontSize: "65px",
            }}
          >
            🛒
          </div>

          <h1
            style={{
              margin: "0 0 15px",
              fontSize: "clamp(34px, 6vw, 48px)",
            }}
          >
            Кошик порожній
          </h1>

          <p
            style={{
              margin: "0 auto 30px",
              maxWidth: "500px",
              color: "#666666",
              fontSize: "18px",
              lineHeight: 1.6,
            }}
          >
            Оберіть килим або доріжку в каталозі,
            вкажіть потрібний розмір і додайте товар
            до кошика.
          </p>

          <Link
            href="/catalog"
            style={{
              display: "inline-block",
              padding: "15px 25px",
              borderRadius: "12px",
              background: "#111111",
              color: "#ffffff",
              textDecoration: "none",
              fontSize: "17px",
              fontWeight: 800,
            }}
          >
            Перейти до каталогу
          </Link>
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
          maxWidth: "1350px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            gap: "20px",
            marginBottom: "30px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 8px",
                color: "#947a58",
                fontWeight: 800,
                letterSpacing: "1px",
              }}
            >
              DREAMCARPET
            </p>

            <h1
              style={{
                margin: 0,
                fontSize: "clamp(38px, 6vw, 58px)",
              }}
            >
              Ваш кошик
            </h1>

            <p
              style={{
                margin: "10px 0 0",
                color: "#666666",
                fontSize: "17px",
              }}
            >
              Товарів: {totalItems}
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              const confirmed = window.confirm(
                "Очистити весь кошик?"
              );

              if (confirmed) {
                clearCart();
              }
            }}
            style={{
              padding: "12px 16px",
              border: "1px solid #d0d0d0",
              borderRadius: "10px",
              background: "#ffffff",
              color: "#9e2424",
              cursor: "pointer",
              fontSize: "15px",
              fontWeight: 800,
            }}
          >
            Очистити кошик
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(0, 1fr) minmax(300px, 390px)",
            gap: "28px",
            alignItems: "start",
          }}
          className="cart-layout"
        >
          <section
            style={{
              display: "grid",
              gap: "18px",
            }}
          >
            {cart.map((item) => (
              <article
                key={item.id}
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "180px minmax(0, 1fr)",
                  gap: "22px",
                  padding: "20px",
                  borderRadius: "20px",
                  background: "#ffffff",
                  boxShadow:
                    "0 10px 35px rgba(0, 0, 0, 0.06)",
                }}
                className="cart-item"
              >
                <Link
                  href={`/catalog/${item.productId}`}
                  style={{
                    position: "relative",
                    display: "block",
                    width: "100%",
                    height: "180px",
                    overflow: "hidden",
                    borderRadius: "15px",
                    background: "#e5e1db",
                  }}
                >
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="180px"
                      style={{
                        objectFit: "cover",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        height: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        padding: "15px",
                        color: "#777777",
                        textAlign: "center",
                      }}
                    >
                      Немає фотографії
                    </div>
                  )}
                </Link>

                <div
                  style={{
                    minWidth: 0,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "15px",
                    }}
                  >
                    <div>
                      <Link
                        href={`/catalog/${item.productId}`}
                        style={{
                          color: "#171717",
                          textDecoration: "none",
                        }}
                      >
                        <h2
                          style={{
                            margin: "0 0 9px",
                            fontSize: "26px",
                          }}
                        >
                          {item.name}
                        </h2>
                      </Link>

                      <p
                        style={{
                          margin: 0,
                          color: "#777777",
                        }}
                      >
                        {formatNumber(item.unitPrice)} грн
                        / м²
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeFromCart(item.id)
                      }
                      title="Видалити з кошика"
                      style={{
                        flexShrink: 0,
                        width: "38px",
                        height: "38px",
                        border: "none",
                        borderRadius: "50%",
                        background: "#fff0f0",
                        color: "#a52424",
                        cursor: "pointer",
                        fontSize: "23px",
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(3, minmax(90px, 1fr))",
                      gap: "10px",
                      marginTop: "20px",
                    }}
                    className="cart-measurements"
                  >
                    <div
                      style={{
                        padding: "11px",
                        borderRadius: "10px",
                        background: "#f5f2ed",
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          marginBottom: "4px",
                          color: "#777777",
                          fontSize: "13px",
                        }}
                      >
                        Ширина
                      </span>

                      <strong>
                        {formatNumber(item.width)} м
                      </strong>
                    </div>

                    <div
                      style={{
                        padding: "11px",
                        borderRadius: "10px",
                        background: "#f5f2ed",
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          marginBottom: "4px",
                          color: "#777777",
                          fontSize: "13px",
                        }}
                      >
                        Довжина
                      </span>

                      <strong>
                        {formatNumber(item.length)} м
                      </strong>
                    </div>

                    <div
                      style={{
                        padding: "11px",
                        borderRadius: "10px",
                        background: "#f5f2ed",
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          marginBottom: "4px",
                          color: "#777777",
                          fontSize: "13px",
                        }}
                      >
                        Площа
                      </span>

                      <strong>
                        {formatNumber(item.area)} м²
                      </strong>
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                      gap: "20px",
                      marginTop: "auto",
                      paddingTop: "22px",
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <span
                        style={{
                          display: "block",
                          marginBottom: "7px",
                          color: "#777777",
                          fontSize: "14px",
                        }}
                      >
                        Кількість
                      </span>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          overflow: "hidden",
                          border: "1px solid #d0d0d0",
                          borderRadius: "10px",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() =>
                            decreaseQuantity(item.id)
                          }
                          style={{
                            width: "42px",
                            height: "40px",
                            border: "none",
                            background: "#f4f4f4",
                            color: "#111111",
                            cursor: "pointer",
                            fontSize: "21px",
                          }}
                        >
                          −
                        </button>

                        <strong
                          style={{
                            minWidth: "45px",
                            textAlign: "center",
                          }}
                        >
                          {item.quantity}
                        </strong>

                        <button
                          type="button"
                          onClick={() =>
                            increaseQuantity(item.id)
                          }
                          style={{
                            width: "42px",
                            height: "40px",
                            border: "none",
                            background: "#f4f4f4",
                            color: "#111111",
                            cursor: "pointer",
                            fontSize: "21px",
                          }}
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        textAlign: "right",
                      }}
                    >
                      <span
                        style={{
                          display: "block",
                          marginBottom: "4px",
                          color: "#777777",
                          fontSize: "14px",
                        }}
                      >
                        Вартість
                      </span>

                      <strong
                        style={{
                          fontSize: "28px",
                        }}
                      >
                        {formatNumber(
                          item.price * item.quantity
                        )}{" "}
                        грн
                      </strong>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </section>

          <aside
            style={{
              position: "sticky",
              top: "25px",
              padding: "28px",
              borderRadius: "22px",
              background: "#ffffff",
              boxShadow:
                "0 12px 40px rgba(0, 0, 0, 0.07)",
            }}
          >
            <h2
              style={{
                margin: "0 0 25px",
                fontSize: "28px",
              }}
            >
              Ваше замовлення
            </h2>

            <div
              style={{
                display: "grid",
                gap: "14px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "15px",
                  color: "#666666",
                }}
              >
                <span>Кількість товарів</span>
                <strong style={{ color: "#171717" }}>
                  {totalItems}
                </strong>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "15px",
                  color: "#666666",
                }}
              >
                <span>Доставка</span>
                <strong style={{ color: "#171717" }}>
                  За тарифами перевізника
                </strong>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                gap: "15px",
                marginTop: "25px",
                paddingTop: "22px",
                borderTop: "1px solid #dddddd",
              }}
            >
              <span
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                }}
              >
                Разом
              </span>

              <strong
                style={{
                  fontSize: "32px",
                }}
              >
                {formatNumber(totalPrice)} грн
              </strong>
            </div>

            <Link
              href="/checkout"
              style={{
                display: "block",
                marginTop: "25px",
                padding: "16px",
                borderRadius: "12px",
                background: "#111111",
                color: "#ffffff",
                textDecoration: "none",
                textAlign: "center",
                fontSize: "18px",
                fontWeight: 800,
              }}
            >
              Оформити замовлення
            </Link>

            <Link
              href="/catalog"
              style={{
                display: "block",
                marginTop: "12px",
                padding: "13px",
                border: "1px solid #cccccc",
                borderRadius: "12px",
                color: "#171717",
                textDecoration: "none",
                textAlign: "center",
                fontWeight: 700,
              }}
            >
              Продовжити покупки
            </Link>

            <p
              style={{
                margin: "20px 0 0",
                color: "#777777",
                fontSize: "13px",
                lineHeight: 1.5,
                textAlign: "center",
              }}
            >
              Остаточну вартість і спосіб доставки
              менеджер підтвердить після оформлення
              замовлення.
            </p>
          </aside>
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 950px) {
          .cart-layout {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 650px) {
          .cart-item {
            grid-template-columns: 1fr !important;
          }

          .cart-item > a {
            height: 280px !important;
          }

          .cart-measurements {
            grid-template-columns: 1fr 1fr !important;
          }
        }

        @media (max-width: 420px) {
          .cart-measurements {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </main>
  );
}