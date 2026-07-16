export default function CartPage() {
  return (
    <main
      style={{
        maxWidth: "1000px",
        margin: "0 auto",
        padding: "40px",
      }}
    >
      <h1>🛒 Кошик</h1>

      <p>У вашому кошику поки немає товарів.</p>

      <button
        style={{
          marginTop: "20px",
          padding: "15px 30px",
          background: "#111",
          color: "#fff",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        Оформити замовлення
      </button>
    </main>
  );
}