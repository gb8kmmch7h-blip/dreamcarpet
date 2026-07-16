import React, { useState } from 'react';

export default function HomePage() {
  const [width, setWidth] = useState('');
  const [length, setLength] = useState('');
  const [price, setPrice] = useState(null);

  const calculatePrice = () => {
    const w = parseFloat(width);
    const l = parseFloat(length);
    if (!isNaN(w) && !isNaN(l)) {
      const area = w * l;
      const unitPrice = 500; // базова ціна за квадратний метр
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
