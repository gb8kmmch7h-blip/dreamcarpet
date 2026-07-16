import Link from "next/link";
export default function CatalogPage() {
  const carpets = [
    { id: 1, name: "Milano", price: 395 },
    { id: 2, name: "Venice", price: 485 },
    { id: 3, name: "Royal", price: 800 },
    { id: 4, name: "Soft", price: 1200 },
    { id: 5, name: "Modern", price: 550 },
    { id: 6, name: "Classic", price: 690 },
    { id: 7, name: "Luxury", price: 980 },
    { id: 8, name: "Premium Plus", price: 1450 },
  ];

  return (
    <main style={{ padding: "40px", background: "#f5f5f5", minHeight: "100vh" }}>
      <h1 style={{ textAlign: "center", marginBottom: "40px" }}>
        Каталог килимів
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))",
          gap: "25px",
        }}
      >
        {carpets.map((carpet) => (
          <div
            key={carpet.id}
            style={{
              background: "#fff",
              borderRadius: "15px",
              overflow: "hidden",
              boxShadow: "0 5px 15px rgba(0,0,0,0.1)",
            }}
          >
            <div
              style={{
                height: "180px",
                background: "#d9d9d9",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                fontSize: "20px",
              }}
            >
              Фото товару
            </div>

            <div style={{ padding: "20px" }}>
              <h3>{carpet.name}</h3>

              <p style={{ fontSize: "20px", fontWeight: "bold" }}>
                {carpet.price} грн/м²
              </p>

              <Link
  href={`/catalog/${carpet.id}`}
  style={{
    display: "block",
    textAlign: "center",
    width: "100%",
    padding: "12px",
    background: "#111",
    color: "#fff",
    borderRadius: "8px",
    textDecoration: "none",
    marginTop: "10px",
  }}
>
  Детальніше
</Link>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}