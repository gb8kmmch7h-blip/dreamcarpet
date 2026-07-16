"use client";
import React, { useState } from "react";
import Header from "../components/Header";
import Hero from "../components/Hero";
import Categories from "../components/Categories";

export default function HomePage() {
  const [category, setCategory] = useState("");
  const [width, setWidth] = useState("");
  const [length, setLength] = useState("");
  const [price, setPrice] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState(100);
  const [maxPrice, setMaxPrice] = useState(5000);

  const calculatePrice = () => {
    const w = parseFloat(width);
    const l = parseFloat(length);

    if (!isNaN(w) && !isNaN(l) && category) {
      const area = w * l;
      let unitPrice = 0;

      switch (category) {
        case "budget":
          unitPrice = 300;
          break;
        case "standard":
          unitPrice = 500;
          break;
        case "premium":
          unitPrice = 800;
          break;
      }

      setPrice(area * unitPrice);
    } else {
      setPrice(null);
    }
  };

  return (
    <>
      <Header />
      <Hero />
<Categories />

      <main style={{ padding: "40px", fontFamily: "Arial" }}>
        <section>
          <h2>Виберіть тип килима</h2>

          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">Оберіть категорію</option>
            <option value="budget">Бюджетний</option>
            <option value="standard">Середній</option>
            <option value="premium">Преміум</option>
          </select>
        </section>

        <br />

        <section>
          <h2>Фільтр за ціною</h2>

          <label>Мінімальна ціна: {minPrice} грн</label>

          <input
            type="range"
            min="100"
            max="5000"
            step="50"
            value={minPrice}
            onChange={(e) => setMinPrice(Number(e.target.value))}
          />

          <br />
          <br />

          <label>Максимальна ціна: {maxPrice} грн</label>

          <input
            type="range"
            min="100"
            max="5000"
            step="50"
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
          />
        </section>

        <br />

        <section>
          <h2>Розрахунок ціни килима</h2>

          <div>
            <label>Ширина (м): </label>

            <input
              type="number"
              value={width}
              onChange={(e) => setWidth(e.target.value)}
            />
          </div>

          <br />

          <div>
            <label>Довжина (м): </label>

            <input
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
            />
          </div>

          <br />

          <button onClick={calculatePrice}>Розрахувати</button>

          {price !== null && (
            <h3>Орієнтовна ціна: {price.toLocaleString()} грн</h3>
          )}
        </section>
      </main>
    </>
  );
}
