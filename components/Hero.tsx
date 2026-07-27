"use client";

import Link from "next/link";

export default function Hero() {
  return (
    <section
      style={{
        background:
          "linear-gradient(135deg, #111 0%, #1f1f1f 45%, #2d2d2d 100%)",
        color: "#fff",
        minHeight: "85vh",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        style={{
          maxWidth: "1400px",
          width: "100%",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "60px",
          alignItems: "center",
          padding: "60px 40px",
        }}
      >
        {/* Ліва сторона */}
        <div>
          <p
            style={{
              color: "#d4af37",
              fontWeight: "bold",
              letterSpacing: "2px",
              marginBottom: "15px",
            }}
          >
            DREAMCARPET
          </p>

          <h1
            style={{
              fontSize: "64px",
              lineHeight: "1.1",
              marginBottom: "25px",
            }}
          >
            Килими,
            <br />
            які створюють
            <span style={{ color: "#d4af37" }}> затишок.</span>
          </h1>

          <p
            style={{
              fontSize: "20px",
              color: "#cfcfcf",
              lineHeight: "1.8",
              maxWidth: "600px",
              marginBottom: "35px",
            }}
          >
            Великий вибір сучасних килимів, доріжок та покриттів для будь-якого
            інтер'єру. Висока якість, доступні ціни та швидка доставка по всій
            Україні.
          </p>

          <div
            style={{
              display: "flex",
              gap: "20px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/catalog"
              style={{
                background: "#d4af37",
                color: "#111",
                padding: "18px 35px",
                borderRadius: "12px",
                textDecoration: "none",
                fontWeight: "bold",
                fontSize: "18px",
              }}
            >
              Перейти до каталогу →
            </Link>

     
          </div>
        </div>
        
        {/* Права сторона */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "500px",
              height: "500px",
              borderRadius: "30px",
              background:
                "linear-gradient(135deg,#d4af37,#f2e3a2,#b98a16)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              color: "#111",
              fontSize: "30px",
              fontWeight: "bold",
              boxShadow: "0 25px 60px rgba(0,0,0,.4)",
            }}
          >
            Фото килима
          </div>
        </div>
      </div>
    </section>
  );
}