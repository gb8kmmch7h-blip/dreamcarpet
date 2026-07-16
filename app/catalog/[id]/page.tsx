"use client";

import { useParams } from "next/navigation";
import { useCart } from "../../../context/CartContext";

interface Carpet {
  id: number;
  name: string;
  price: number;
  description: string;
}

const carpets: Carpet[] = [
  {
    id: 1,
    name: "Milano",
    price: 395,
    description: "Сучасний м'який килим для вітальні.",
  },
  {
    id: 2,
    name: "Venice",
    price: 485,
    description: "Стильний килим із коротким ворсом.",
  },
  {
    id: 3,
    name: "Royal",
    price: 800,
    description: "Преміальний килим високої якості.",
  },
  {
    id: 4,
    name: "Soft",
    price: 1200,
    description: "Дуже м'який килим для спальні.",
  },
];

export default function ProductPage() {
  const params = useParams();
  const { addToCart } = useCart();

  const id = Number(params.id);

  const carpet = carpets.find((item) => item.id === id);

  if (!carpet) {
    return <h1 style={{ padding: "40px" }}>Товар не знайдено</h1>;
  }

  return (
    <main
      style={{
        padding: "40px",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <div
        style={{
          height: "400px",
          background: "#ddd",
          borderRadius: "15px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "28px",
        }}
      >
        Фото {carpet.name}
      </div>

      <h1 style={{ marginTop: "30px" }}>{carpet.name}</h1>

      <h2>{carpet.price} грн/м²</h2>

      <p>{carpet.description}</p>

      <button
        onClick={() =>
          addToCart({
            id: carpet.id,
            name: carpet.name,
            price: carpet.price,
          })
        }
        style={{
          marginTop: "25px",
          padding: "15px 30px",
          background: "#111",
          color: "#fff",
          border: "none",
          borderRadius: "10px",
          cursor: "pointer",
        }}
      >
        Додати в кошик
      </button>
    </main>
  );
}