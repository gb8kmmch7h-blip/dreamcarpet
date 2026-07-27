import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Контакти | DreamCarpet",
  description:
    "Контакти магазину DreamCarpet. Допоможемо підібрати килим або доріжку для дому.",
};

export default function ContactsPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "50px 20px 70px",
        background: "#f5f2ec",
        color: "#181714",
      }}
    >
      <section
        style={{
          width: "min(1100px, 100%)",
          margin: "0 auto",
        }}
      >
        <p
          style={{
            margin: "0 0 8px",
            color: "#8a7656",
            fontSize: "13px",
            fontWeight: 900,
            letterSpacing: "1.2px",
            textTransform: "uppercase",
          }}
        >
          DreamCarpet
        </p>

        <h1
          style={{
            margin: 0,
            fontSize: "clamp(34px, 5vw, 56px)",
            lineHeight: 1,
          }}
        >
          Контакти
        </h1>

        <p
          style={{
            maxWidth: "760px",
            margin: "16px 0 34px",
            color: "#6f6a62",
            fontSize: "18px",
            lineHeight: 1.6,
          }}
        >
          Маєте питання по розміру, основі, ворсу або
          ціні? Напишіть нам — допоможемо підібрати
          килим або доріжку.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "18px",
          }}
        >
          <div style={cardStyle}>
            <span style={iconStyle}>📞</span>
            <h2 style={cardTitleStyle}>Телефон</h2>
            <p style={cardTextStyle}>
              +380 XX XXX XX XX
            </p>
            <small style={smallStyle}>
              Тут потім поставиш свій номер.
            </small>
          </div>

          <div style={cardStyle}>
            <span style={iconStyle}>💬</span>
            <h2 style={cardTitleStyle}>Месенджери</h2>
            <p style={cardTextStyle}>
              Viber / Telegram
            </p>
            <small style={smallStyle}>
              Зручно для фото, замірів і консультації.
            </small>
          </div>

          <div style={cardStyle}>
            <span style={iconStyle}>🚚</span>
            <h2 style={cardTitleStyle}>Доставка</h2>
            <p style={cardTextStyle}>
              По Україні
            </p>
            <small style={smallStyle}>
              Новою Поштою або іншим зручним способом.
            </small>
          </div>

          <div style={cardStyle}>
            <span style={iconStyle}>🕒</span>
            <h2 style={cardTitleStyle}>Графік</h2>
            <p style={cardTextStyle}>
              Щодня
            </p>
            <small style={smallStyle}>
              Точний графік можна буде змінити тут.
            </small>
          </div>
        </div>

        <div
          style={{
            marginTop: "34px",
            display: "flex",
            gap: "14px",
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/catalog"
            style={primaryButtonStyle}
          >
            Перейти в каталог →
          </Link>

          <Link
            href="/care"
            style={secondaryButtonStyle}
          >
            Догляд за килимами
          </Link>
        </div>
      </section>
    </main>
  );
}

const cardStyle = {
  padding: "26px",
  borderRadius: "22px",
  border: "1px solid #ded7ca",
  background: "#ffffff",
  boxShadow: "0 14px 35px rgba(44, 36, 24, 0.06)",
};

const iconStyle = {
  display: "block",
  fontSize: "34px",
  marginBottom: "14px",
};

const cardTitleStyle = {
  margin: "0 0 8px",
  fontSize: "24px",
};

const cardTextStyle = {
  margin: "0 0 8px",
  color: "#181714",
  fontSize: "18px",
  fontWeight: 800,
};

const smallStyle = {
  color: "#6f6a62",
  lineHeight: 1.5,
};

const primaryButtonStyle = {
  display: "inline-flex",
  padding: "14px 18px",
  borderRadius: "12px",
  background: "#181714",
  color: "#ffffff",
  textDecoration: "none",
  fontWeight: 900,
};

const secondaryButtonStyle = {
  display: "inline-flex",
  padding: "14px 18px",
  borderRadius: "12px",
  background: "#ffffff",
  color: "#181714",
  border: "1px solid #ded7ca",
  textDecoration: "none",
  fontWeight: 900,
};