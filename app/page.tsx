"use client";
import React, { useState } from 'react';

export default function HomePage() {
  const [category, setCategory] = useState('');
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [price, setPrice] = useState<number | null>(null);
  const [minPrice, setMinPrice] = useState(100);
  const [maxPrice, setMaxPrice] = useState(1000);

  const calculatePrice = () => {
    const w = parseFloat(width);
    const l = parseFloat(length);
    if (!isNaN(w) && !isNaN(l) && category) {
      const area = w * l;
      let unitPrice = 0;
      switch (category) {
        case 'budget':
          unitPrice = 300;
          break;
        case 'standard':
          unitPrice = 500;
          break;
        case 'premium':
          unitPrice = 800;
          break;
        default:
          unitPrice = 0;
      }
      setPrice(area * unitPrice);
    } else {
      setPrice(null);
    }
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <header>
        <h1>DreamCarpet</h1>
        <nav>
          <ul style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '1rem' }}>
            <li><a href="/">Головна</a></li>
            <li><a href="/catalog">Каталог</a></li>
            <li><a href="/about">Про нас</a></li>
            <li><a href="/contact">Контакти</a></li>
          </ul>
        </nav>
      </header>
      <main>
        <section>
          <h2>Виберіть тип килима</h2>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">Оберіть категорію</option>
            <option value="budget">Бюджетний</option>
            <option value="standard">Середній</option>
            <option value="premium">Преміум</option>
          </select>
        </section>
        <section>
          <h2>Фільтр за ціною</h2>
          <div>
            <label>Мінімальна ціна: {minPrice} грн</label>
            <input
              type="range"
              min="100"
              max="5000"
              step="50"
              value={minPrice}
              onChange={(e) => setMinPrice(Number(e.target.value))}
            />
          </div>
          <div>
            <label>Максимальна ціна: {maxPrice} грн</label>
            <input
              type="range"
              min="100"
              max="5000"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
          </div>
        </section>
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
          <div>
            <label>Довжина (м): </label>
            <input
              type="number"
              value={length}
              onChange={(e) => setLength(e.target.value)}
            />
          </div>
          <button onClick={calculatePrice}>Розрахувати</button>
          {price !== null && (
            <p>Ціна: {price} грн</p>
          )}
        </section>
      </main>
    </div>
  );
}
