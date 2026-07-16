export default function Categories() {
  return (
    <section
      style={{
        padding: "60px 40px",
        background: "#f5f5f5",
      }}
    >
      <h2 style={{ textAlign: "center" }}>Наші категорії</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginTop: "30px",
        }}
      >
        <div style={{ background: "#fff", padding: "20px", borderRadius: "10px" }}>
          <h3>Бюджетні</h3>
          <p>від 395 грн/м²</p>
        </div>

        <div style={{ background: "#fff", padding: "20px", borderRadius: "10px" }}>
          <h3>Стандарт</h3>
          <p>від 485 грн/м²</p>
        </div>

        <div style={{ background: "#fff", padding: "20px", borderRadius: "10px" }}>
          <h3>Преміум</h3>
          <p>від 800 грн/м²</p>
        </div>

        <div style={{ background: "#fff", padding: "20px", borderRadius: "10px" }}>
          <h3>Довгий ворс</h3>
          <p>від 1200 грн/м²</p>
        </div>
      </div>
    </section>
  );
}