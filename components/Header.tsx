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
          className="logo"
        >
          Dream
          <span>Carpet</span>
        </Link>

        <nav className="desktop-nav">
          <Link href="/">🏠 Головна</Link>
          <Link href="/catalog">📦 Каталог</Link>
          <Link href="/assistant">🤖 Підібрати</Link>
          <Link href="/care">🧼 Догляд</Link>
          <Link href="/my-orders">
            📋 Мої замовлення
          </Link>
          <Link href="/contacts">☎ Контакти</Link>
        </nav>

        <div className="desktop-actions">
          <Link
            href="/search"
            className="action dark"
          >
            🔍 Пошук
          </Link>

          <Link
            href="/favorites"
            className="action dark"
          >
            <span>❤️ Вибрані</span>

            {isFavoritesLoaded &&
              favoritesCount > 0 && (
                <strong>{favoritesCount}</strong>
              )}
          </Link>

          <Link
            href="/cart"
            className="action gold"
          >
            <span>🛒 Кошик</span>

            {isCartLoaded && totalItems > 0 && (
              <strong>{totalItems}</strong>
            )}
          </Link>
        </div>

        <button
          type="button"
          onClick={() =>
            setIsOpen((current) => !current)
          }
          aria-label="Меню"
          className="burger"
        >
          {isOpen ? "✕" : "☰"}
        </button>
      </div>

      {isOpen && (
        <div className="mobile-menu">
          <Link
            href="/"
            onClick={closeMenu}
            style={mobileLinkStyle}
          >
            🏠 Головна
          </Link>

          <Link
            href="/catalog"
            onClick={closeMenu}
            style={mobileLinkStyle}
          >
            📦 Каталог
          </Link>

          <Link
            href="/search"
            onClick={closeMenu}
            style={mobileLinkStyle}
          >
            🔍 Пошук
          </Link>

          <Link
            href="/assistant"
            onClick={closeMenu}
            style={mobileLinkStyle}
          >
            🤖 Підібрати килим
          </Link>

          <Link
            href="/favorites"
            onClick={closeMenu}
            style={mobileLinkStyle}
          >
            ❤️ Вибрані{" "}
            {isFavoritesLoaded &&
            favoritesCount > 0
              ? `(${favoritesCount})`
              : ""}
          </Link>

          <Link
            href="/cart"
            onClick={closeMenu}
            style={mobileGoldStyle}
          >
            🛒 Кошик{" "}
            {isCartLoaded && totalItems > 0
              ? `(${totalItems})`
              : ""}
          </Link>

          <Link
            href="/my-orders"
            onClick={closeMenu}
            style={mobileLinkStyle}
          >
            📋 Мої замовлення
          </Link>

          <Link
            href="/care"
            onClick={closeMenu}
            style={mobileLinkStyle}
          >
            🧼 Догляд
          </Link>

          <Link
            href="/contacts"
            onClick={closeMenu}
            style={mobileLinkStyle}
          >
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

        :global(.logo) {
          color: #ffffff !important;
          text-decoration: none !important;
          font-size: 34px;
          font-weight: 900;
          line-height: 1;
          white-space: nowrap;
        }

        :global(.logo span) {
          color: #d4af37 !important;
        }

        .desktop-nav {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 22px;
          flex-wrap: wrap;
        }

        .desktop-nav :global(a) {
          color: #ffffff !important;
          text-decoration: none !important;
          font-size: 15px;
          font-weight: 800;
          white-space: nowrap;
          opacity: 1 !important;
          transition:
            color 0.2s ease,
            opacity 0.2s ease;
        }

        .desktop-nav :global(a:hover) {
          color: #d4af37 !important;
        }

        .desktop-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 12px;
          flex-wrap: wrap;
        }

        :global(.action) {
          min-height: 42px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 10px 14px;
          border-radius: 10px;

          text-decoration: none !important;
          font-size: 16px;
          font-weight: 900;
          white-space: nowrap;

          opacity: 1 !important;

          transition:
            transform 0.2s ease,
            background 0.2s ease;
        }

        :global(.action:hover) {
          transform: translateY(-1px);
        }

        :global(.action.dark) {
          background: #1f1f1f !important;
          color: #ffffff !important;
          border: 1px solid #444444;
        }

        :global(.action.dark span) {
          color: #ffffff !important;
        }

        :global(.action.dark:hover) {
          background: #292929 !important;
        }

        :global(.action.gold) {
          background: #d4af37 !important;
          color: #111111 !important;
          border: 1px solid #d4af37;
        }

        :global(.action.gold span) {
          color: #111111 !important;
        }

        :global(.action.gold:hover) {
          background: #e2bd42 !important;
        }

        :global(.action strong) {
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

        :global(.action.gold strong) {
          background: #111111;
          color: #ffffff;
        }

        .burger {
          display: none;

          width: 48px;
          height: 48px;

          border-radius: 14px;
          border: 1px solid #d4af37;

          background: #1f1f1f;
          color: #ffffff;

          font-size: 28px;
          font-weight: 900;
          cursor: pointer;
        }

        .mobile-menu {
          display: grid;
          gap: 10px;

          padding: 14px 16px 18px;

          background: #111111;
          border-top: 1px solid #2b2b2b;

          box-shadow:
            0 20px 40px rgba(0, 0, 0, 0.35);
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
            display: inline-flex;
            align-items: center;
            justify-content: center;
            flex-shrink: 0;
          }
        }

        @media (max-width: 600px) {
          :global(.logo) {
            font-size: 28px !important;
          }
        }
      `}</style>
    </header>
  );
}