"use client";

import Link from "next/link";
import { useState } from "react";

import { useCart } from "../context/CartContext";

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);

  const {
    totalItems,
    favoritesCount,
    isCartLoaded,
    isFavoritesLoaded,
  } = useCart();

  function closeMenu() {
    setIsOpen(false);
  }

  const mobileLinkStyle = {
    display: "flex",
    alignItems: "center",
    minHeight: "54px",
    padding: "0 16px",
    borderRadius: "14px",
    background: "#1f1f1f",
    border: "1px solid #333333",
    color: "#ffffff",
    textDecoration: "none",
    fontSize: "17px",
    fontWeight: 900,
  };

  const mobileGoldStyle = {
    ...mobileLinkStyle,
    background: "#d4af37",
    border: "1px solid #d4af37",
    color: "#111111",
  };

  return (
    <header className="header">
      <div className="inner">
        <Link
          href="/"
          onClick={closeMenu}
          style={{
            color: "#ffffff",
            textDecoration: "none",
            fontSize: "34px",
            fontWeight: 900,
            lineHeight: 1,
            whiteSpace: "nowrap",
          }}
        >
          Dream
          <span style={{ color: "#d4af37" }}>
            Carpet
          </span>
        </Link>

        <nav className="desktop-nav">
          <Link href="/">🏠 Головна</Link>
          <Link href="/catalog">📦 Каталог</Link>
          <Link href="/assistant">🤖 Підібрати</Link>
          <Link href="/care">🧼 Догляд</Link>
          <Link href="/my-orders">📋 Мої замовлення</Link>
          <Link href="/contacts">☎ Контакти</Link>
        </nav>

        <div className="desktop-actions">
          <Link href="/search" className="action dark">
            🔍 Пошук
          </Link>

          <Link href="/favorites" className="action dark">
            <span>❤️ Вибрані</span>

            {isFavoritesLoaded && favoritesCount > 0 && (
              <strong>{favoritesCount}</strong>
            )}
          </Link>

          <Link href="/cart" className="action gold">
            <span>🛒 Кошик</span>

            {isCartLoaded && totalItems > 0 && (
              <strong>{totalItems}</strong>
            )}
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          aria-label="Меню"
          style={{
            display: "none",
            width: "48px",
            height: "48px",
            borderRadius: "14px",
            border: "1px solid #d4af37",
            background: "#1f1f1f",
            color: "#ffffff",
            fontSize: "28px",
            fontWeight: 900,
            cursor: "pointer",
          }}
          className="burger"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {isOpen && (
        <div
          className="mobile-menu"
          style={{
            display: "grid",
            gap: "10px",
            padding: "14px 16px 18px",
            background: "#111111",
            borderTop: "1px solid #2b2b2b",
            boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
          }}
        >
          <Link href="/" onClick={closeMenu} style={mobileLinkStyle}>
            🏠 Головна
          </Link>

          <Link href="/catalog" onClick={closeMenu} style={mobileLinkStyle}>
            📦 Каталог
          </Link>

          <Link href="/search" onClick={closeMenu} style={mobileLinkStyle}>
            🔍 Пошук
          </Link>

          <Link href="/assistant" onClick={closeMenu} style={mobileLinkStyle}>
            🤖 Підібрати килим
          </Link>

          <Link href="/favorites" onClick={closeMenu} style={mobileLinkStyle}>
            ❤️ Вибрані{" "}
            {isFavoritesLoaded && favoritesCount > 0
              ? `(${favoritesCount})`
              : ""}
          </Link>

          <Link href="/cart" onClick={closeMenu} style={mobileGoldStyle}>
            🛒 Кошик{" "}
            {isCartLoaded && totalItems > 0
              ? `(${totalItems})`
              : ""}
          </Link>

          <Link href="/my-orders" onClick={closeMenu} style={mobileLinkStyle}>
            📋 Мої замовлення
          </Link>

          <Link href="/care" onClick={closeMenu} style={mobileLinkStyle}>
            🧼 Догляд
          </Link>

          <Link href="/contacts" onClick={closeMenu} style={mobileLinkStyle}>
            ☎ Контакти
          </Link>
        </div>
      )}

      <style jsx>{`
        .header {
          position: sticky;
          top: 0;
          z-index: 1000;
          background: #111111;
          border-bottom: 1px solid #2b2b2b;
        }

        .inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 18px 30px;
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
          gap: 24px;
        }

        .desktop-nav {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 22px;
          flex-wrap: wrap;
        }

        .desktop-nav a {
          color: #ffffff;
          text-decoration: none;
          font-size: 15px;
          font-weight: 800;
          white-space: nowrap;
        }

        .desktop-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          flex-wrap: wrap;
        }

        .action {
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 10px;
          text-decoration: none;
          font-size: 16px;
          font-weight: 900;
          white-space: nowrap;
        }

        .action.dark {
          background: #1f1f1f;
          color: #ffffff;
          border: 1px solid #333333;
        }

        .action.gold {
          background: #d4af37;
          color: #111111;
          border: 1px solid #d4af37;
        }

        .action strong {
          min-width: 22px;
          height: 22px;
          padding: 0 7px;
          border-radius: 999px;
          background: #d4af37;
          color: #111111;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 13px;
          font-weight: 900;
        }

        .action.gold strong {
          background: #111111;
          color: #ffffff;
        }

        @media (max-width: 1050px) {
          .inner {
            padding: 14px 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 14px;
          }

          .desktop-nav,
          .desktop-actions {
            display: none;
          }

          .burger {
            display: inline-flex !important;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
        }

        @media (max-width: 600px) {
          .inner a {
            font-size: 28px !important;
          }
        }
      `}</style>
    </header>
  );
}