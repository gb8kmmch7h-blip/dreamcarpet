import Link from "next/link";

export default function Hero() {
  return (
    <section
      style={{
        background: "linear-gradient(135deg, #1f1f1f, #3a3a3a)",
        color: "#fff",
        textAlign: "center",
        padding: "100px 20px",
      }}
    >
      <h2
        style={{
          fontSize: "48px",
          marginBottom: "20px",
        }}
      >
        Килими для вашого ідеального дому
      </h2>

      <p
        style={{
          fontSize: "20px",
          color: "#ddd",
          maxWidth: "700px",
          margin: "0 auto 40px",
        }}
      >
        Великий вибір сучасних килимів, швидкий підбір за розміром та
        розрахунок вартості за кілька секунд.
      </p>

      <Link href="/catalog">
        <button
          style={{
            padding: "15px 35px",
            fontSize: "18px",
            background: "#d4af37",
            color: "#111",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Перейти до каталогу
        </button>
      </Link>
    </section>
  );
}