export default function ProductPage() {
  return (
    <main
      style={{
        padding: "40px",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <h1>Сторінка товару</h1>

      <div
        style={{
          width: "100%",
          height: "400px",
          background: "#ddd",
          borderRadius: "15px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "28px",
        }}
      >
        Фото товару
      </div>

      <h2 style={{ marginTop: "30px" }}>395 грн/м²</h2>

      <p>
        Тут буде повний опис товару.
      </p>
    </main>
  );
}