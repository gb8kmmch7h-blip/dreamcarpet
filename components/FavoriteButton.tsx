"use client";

import type { MouseEvent } from "react";

import { useCart } from "../context/CartContext";

type FavoriteButtonProps = {
  productId: number;
  variant?: "floating" | "inline";
};

export default function FavoriteButton({
  productId,
  variant = "floating",
}: FavoriteButtonProps) {
  const {
    isFavorite,
    toggleFavorite,
    isFavoritesLoaded,
  } = useCart();

  const active = isFavorite(productId);

  function handleClick(
    event: MouseEvent<HTMLButtonElement>
  ) {
    event.preventDefault();
    event.stopPropagation();

    toggleFavorite(productId);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isFavoritesLoaded}
      aria-label={
        active
          ? "Прибрати з вибраного"
          : "Додати у вибране"
      }
      title={
        active
          ? "Прибрати з вибраного"
          : "Додати у вибране"
      }
      style={{
        position:
          variant === "floating" ? "absolute" : "static",
        top: variant === "floating" ? "12px" : undefined,
        right: variant === "floating" ? "12px" : undefined,
        zIndex: 5,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: variant === "floating" ? "42px" : "auto",
        height: variant === "floating" ? "42px" : "42px",
        padding:
          variant === "floating" ? 0 : "0 14px",
        border: active
          ? "1px solid #d4af37"
          : "1px solid rgba(255,255,255,0.65)",
        borderRadius: "999px",
        background: active
          ? "#d4af37"
          : "rgba(17,17,17,0.82)",
        color: active ? "#111111" : "#ffffff",
        fontSize: "20px",
        fontWeight: 900,
        cursor: "pointer",
        boxShadow:
          variant === "floating"
            ? "0 8px 20px rgba(0,0,0,0.22)"
            : "none",
        opacity: isFavoritesLoaded ? 1 : 0.6,
      }}
    >
      {active ? "❤️" : "🤍"}

      {variant === "inline" && (
        <span
          style={{
            marginLeft: "8px",
            fontSize: "15px",
          }}
        >
          {active ? "У вибраному" : "У вибране"}
        </span>
      )}
    </button>
  );
}