"use client";

import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export type CartItem = {
  id: string;
  productId: number;
  name: string;
  image: string;
  color: string;
  unitPrice: number;
  price: number;
  width: number;
  length: number;
  area: number;
  quantity: number;
};

type CartContextType = {
  cart: CartItem[];
  addToCart: (
    item: Omit<CartItem, "quantity">
  ) => void;
  increaseQuantity: (id: string) => void;
  decreaseQuantity: (id: string) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
  isCartLoaded: boolean;

  favoriteProductIds: number[];
  toggleFavorite: (productId: number) => void;
  addToFavorites: (productId: number) => void;
  removeFromFavorites: (productId: number) => void;
  clearFavorites: () => void;
  isFavorite: (productId: number) => boolean;
  favoritesCount: number;
  isFavoritesLoaded: boolean;
};

const CartContext = createContext<
  CartContextType | undefined
>(undefined);

const CART_STORAGE_KEY = "dreamcarpet-cart";
const FAVORITES_STORAGE_KEY = "dreamcarpet-favorites";

function isValidCartItem(value: unknown): value is CartItem {
  if (
    typeof value !== "object" ||
    value === null
  ) {
    return false;
  }

  const item = value as Partial<CartItem>;

  return (
    typeof item.id === "string" &&
    typeof item.productId === "number" &&
    typeof item.name === "string" &&
    typeof item.image === "string" &&
    typeof item.color === "string" &&
    typeof item.unitPrice === "number" &&
    typeof item.price === "number" &&
    typeof item.width === "number" &&
    typeof item.length === "number" &&
    typeof item.area === "number" &&
    typeof item.quantity === "number" &&
    item.quantity > 0
  );
}

function isValidFavoriteId(value: unknown): value is number {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value > 0
  );
}

export function CartProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [favoriteProductIds, setFavoriteProductIds] =
    useState<number[]>([]);

  const [isCartLoaded, setIsCartLoaded] =
    useState(false);

  const [isFavoritesLoaded, setIsFavoritesLoaded] =
    useState(false);

  useEffect(() => {
    try {
      const savedCart = window.localStorage.getItem(
        CART_STORAGE_KEY
      );

      if (savedCart) {
        const parsedCart: unknown =
          JSON.parse(savedCart);

        if (Array.isArray(parsedCart)) {
          const validItems =
            parsedCart.filter(isValidCartItem);

          setCart(validItems);
        }
      }
    } catch (error) {
      console.error(
        "Не вдалося завантажити кошик:",
        error
      );
    } finally {
      setIsCartLoaded(true);
    }
  }, []);

  useEffect(() => {
    try {
      const savedFavorites =
        window.localStorage.getItem(
          FAVORITES_STORAGE_KEY
        );

      if (savedFavorites) {
        const parsedFavorites: unknown =
          JSON.parse(savedFavorites);

        if (Array.isArray(parsedFavorites)) {
          const validFavorites =
            parsedFavorites.filter(isValidFavoriteId);

          setFavoriteProductIds([
            ...new Set(validFavorites),
          ]);
        }
      }
    } catch (error) {
      console.error(
        "Не вдалося завантажити вибрані:",
        error
      );
    } finally {
      setIsFavoritesLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isCartLoaded) {
      return;
    }

    try {
      window.localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify(cart)
      );
    } catch (error) {
      console.error(
        "Не вдалося зберегти кошик:",
        error
      );
    }
  }, [cart, isCartLoaded]);

  useEffect(() => {
    if (!isFavoritesLoaded) {
      return;
    }

    try {
      window.localStorage.setItem(
        FAVORITES_STORAGE_KEY,
        JSON.stringify(favoriteProductIds)
      );
    } catch (error) {
      console.error(
        "Не вдалося зберегти вибрані:",
        error
      );
    }
  }, [favoriteProductIds, isFavoritesLoaded]);

  function addToCart(
    item: Omit<CartItem, "quantity">
  ) {
    setCart((previousCart) => {
      const existingItem = previousCart.find(
        (cartItem) => cartItem.id === item.id
      );

      if (existingItem) {
        return previousCart.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantity: cartItem.quantity + 1,
              }
            : cartItem
        );
      }

      return [
        ...previousCart,
        {
          ...item,
          quantity: 1,
        },
      ];
    });
  }

  function increaseQuantity(id: string) {
    setCart((previousCart) =>
      previousCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    );
  }

  function decreaseQuantity(id: string) {
    setCart((previousCart) =>
      previousCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  }

  function removeFromCart(id: string) {
    setCart((previousCart) =>
      previousCart.filter(
        (item) => item.id !== id
      )
    );
  }

  function clearCart() {
    setCart([]);
  }

  function addToFavorites(productId: number) {
    setFavoriteProductIds((currentIds) => {
      if (currentIds.includes(productId)) {
        return currentIds;
      }

      return [productId, ...currentIds];
    });
  }

  function removeFromFavorites(productId: number) {
    setFavoriteProductIds((currentIds) =>
      currentIds.filter((id) => id !== productId)
    );
  }

  function toggleFavorite(productId: number) {
    setFavoriteProductIds((currentIds) =>
      currentIds.includes(productId)
        ? currentIds.filter((id) => id !== productId)
        : [productId, ...currentIds]
    );
  }

  function clearFavorites() {
    setFavoriteProductIds([]);
  }

  function isFavorite(productId: number) {
    return favoriteProductIds.includes(productId);
  }

  const totalPrice = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0
  );

  const totalItems = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const favoritesCount = favoriteProductIds.length;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        totalPrice,
        totalItems,
        isCartLoaded,

        favoriteProductIds,
        toggleFavorite,
        addToFavorites,
        removeFromFavorites,
        clearFavorites,
        isFavorite,
        favoritesCount,
        isFavoritesLoaded,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(
      "useCart must be used inside CartProvider"
    );
  }

  return context;
}