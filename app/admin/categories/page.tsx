"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type CatalogCategory = {
  value: string;
  label: string;
  active: boolean;
};

type CatalogBase = {
  value: string;
  label: string;
  category: string;
  active: boolean;
};

type CatalogSettings = {
  categories: CatalogCategory[];
  bases: CatalogBase[];
};

const inputStyle = {
  width: "100%",
  padding: "11px 12px",
  borderRadius: "10px",
  border: "1px solid #d8d0c4",
  background: "#ffffff",
  color: "#181714",
  fontSize: "15px",
  boxSizing: "border-box" as const,
};

function createValue(label: string) {
  return label
    .trim()
    .toLowerCase()
    .replace(/[ії]/g, "i")
    .replace(/є/g, "ye")
    .replace(/ґ/g, "g")
    .replace(/а/g, "a")
    .replace(/б/g, "b")
    .replace(/в/g, "v")
    .replace(/г/g, "h")
    .replace(/д/g, "d")
    .replace(/е/g, "e")
    .replace(/ж/g, "zh")
    .replace(/з/g, "z")
    .replace(/и/g, "y")
    .replace(/й/g, "i")
    .replace(/к/g, "k")
    .replace(/л/g, "l")
    .replace(/м/g, "m")
    .replace(/н/g, "n")
    .replace(/о/g, "o")
    .replace(/п/g, "p")
    .replace(/р/g, "r")
    .replace(/с/g, "s")
    .replace(/т/g, "t")
    .replace(/у/g, "u")
    .replace(/ф/g, "f")
    .replace(/х/g, "kh")
    .replace(/ц/g, "ts")
    .replace(/ч/g, "ch")
    .replace(/ш/g, "sh")
    .replace(/щ/g, "shch")
    .replace(/ь/g, "")
    .replace(/ю/g, "yu")
    .replace(/я/g, "ya")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function AdminCategoriesPage() {
  const [settings, setSettings] = useState<CatalogSettings>({
    categories: [],
    bases: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/catalog-settings", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error(
            "Не вдалося завантажити налаштування"
          );
        }

        const data =
          (await response.json()) as CatalogSettings;

        setSettings(data);
      } catch (requestError) {
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Сталася помилка"
        );
      } finally {
        setLoading(false);
      }
    }

    void loadSettings();
  }, []);

  const activeCategories = useMemo(
    () =>
      settings.categories.filter(
        (category) => category.active
      ),
    [settings.categories]
  );

  function updateCategory(
    index: number,
    field: keyof CatalogCategory,
    value: string | boolean
  ) {
    setSettings((current) => ({
      ...current,
      categories: current.categories.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [field]: value,
              }
            : item
      ),
    }));
  }

  function updateBase(
    index: number,
    field: keyof CatalogBase,
    value: string | boolean
  ) {
    setSettings((current) => ({
      ...current,
      bases: current.bases.map(
        (item, itemIndex) =>
          itemIndex === index
            ? {
                ...item,
                [field]: value,
              }
            : item
      ),
    }));
  }

  function addCategory() {
    setSettings((current) => ({
      ...current,
      categories: [
        ...current.categories,
        {
          value: "",
          label: "",
          active: true,
        },
      ],
    }));
  }

  function addBase() {
    setSettings((current) => ({
      ...current,
      bases: [
        ...current.bases,
        {
          value: "",
          label: "",
          category:
            activeCategories[0]?.value ?? "",
          active: true,
        },
      ],
    }));
  }

  function removeCategory(index: number) {
    const confirmed = window.confirm(
      "Видалити цю категорію?"
    );

    if (!confirmed) {
      return;
    }

    setSettings((current) => ({
      ...current,
      categories: current.categories.filter(
        (_, itemIndex) =>
          itemIndex !== index
      ),
    }));
  }

  function removeBase(index: number) {
    const confirmed = window.confirm(
      "Видалити цю основу?"
    );

    if (!confirmed) {
      return;
    }

    setSettings((current) => ({
      ...current,
      bases: current.bases.filter(
        (_, itemIndex) =>
          itemIndex !== index
      ),
    }));
  }

  async function saveSettings() {
    try {
      setSaving(true);
      setMessage("");
      setError("");

      const invalidCategory =
        settings.categories.some(
          (item) =>
            !item.label.trim() ||
            !item.value.trim()
        );

      const invalidBase =
        settings.bases.some(
          (item) =>
            !item.label.trim() ||
            !item.value.trim() ||
            !item.category.trim()
        );

      if (invalidCategory || invalidBase) {
        throw new Error(
          "У всіх пунктах повинні бути заповнені назва, код і категорія"
        );
      }

      const response = await fetch(
        "/api/catalog-settings",
        {
          method: "PUT",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(settings),
        }
      );

      const data = (await response.json()) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Не вдалося зберегти"
        );
      }

      setMessage(
        data.message ||
          "Налаштування збережено"
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Сталася помилка"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          padding: "40px 20px",
          background: "#f4f1eb",
        }}
      >
        Завантаження...
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "36px 20px 70px",
        background: "#f4f1eb",
        color: "#181714",
      }}
    >
      <div
        style={{
          width: "min(1200px, 100%)",
          margin: "0 auto",
        }}
      >
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "20px",
            flexWrap: "wrap",
            alignItems: "flex-start",
            marginBottom: "28px",
          }}
        >
          <div>
            <p
              style={{
                margin: "0 0 6px",
                color: "#8a7656",
                fontSize: "12px",
                fontWeight: 900,
                letterSpacing: "1.4px",
                textTransform: "uppercase",
              }}
            >
              DreamCarpet Admin
            </p>

            <h1
              style={{
                margin: 0,
                fontSize:
                  "clamp(32px, 5vw, 50px)",
              }}
            >
              Категорії та основи
            </h1>

            <p
              style={{
                color: "#6d675f",
                lineHeight: 1.6,
              }}
            >
              Кожна основа тепер прив’язана
              до конкретної категорії.
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              flexWrap: "wrap",
            }}
          >
            <Link
              href="/admin"
              style={{
                display: "inline-flex",
                minHeight: "44px",
                alignItems: "center",
                padding: "0 16px",
                borderRadius: "11px",
                background: "#ffffff",
                color: "#181714",
                border:
                  "1px solid #ded6ca",
                textDecoration: "none",
                fontWeight: 800,
              }}
            >
              ← Адмінка
            </Link>

            <button
              type="button"
              onClick={() =>
                void saveSettings()
              }
              disabled={saving}
              style={{
                minHeight: "44px",
                padding: "0 18px",
                border: "none",
                borderRadius: "11px",
                background: "#181714",
                color: "#ffffff",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              {saving
                ? "Збереження..."
                : "Зберегти"}
            </button>
          </div>
        </header>

        {message && (
          <div
            style={{
              marginBottom: "18px",
              padding: "14px",
              borderRadius: "12px",
              background: "#e9f7e9",
              color: "#256b2d",
              fontWeight: 800,
            }}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            style={{
              marginBottom: "18px",
              padding: "14px",
              borderRadius: "12px",
              background: "#ffe5e5",
              color: "#a32626",
              fontWeight: 800,
            }}
          >
            {error}
          </div>
        )}

        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={titleStyle}>
                Категорії
              </h2>

              <p style={descriptionStyle}>
                Основні розділи каталогу.
              </p>
            </div>

            <button
              type="button"
              onClick={addCategory}
              style={addButtonStyle}
            >
              + Додати категорію
            </button>
          </div>

          <div style={listStyle}>
            {settings.categories.map(
              (item, index) => (
                <div
                  key={`category-${index}`}
                  style={rowStyle}
                >
                  <input
                    value={item.label}
                    onChange={(event) =>
                      updateCategory(
                        index,
                        "label",
                        event.target.value
                      )
                    }
                    placeholder="Назва"
                    style={inputStyle}
                  />

                  <div>
                    <input
                      value={item.value}
                      onChange={(event) =>
                        updateCategory(
                          index,
                          "value",
                          event.target.value
                        )
                      }
                      placeholder="code"
                      style={inputStyle}
                    />

                    {!item.value &&
                      item.label && (
                        <button
                          type="button"
                          onClick={() =>
                            updateCategory(
                              index,
                              "value",
                              createValue(
                                item.label
                              )
                            )
                          }
                          style={codeButtonStyle}
                        >
                          Створити код
                        </button>
                      )}
                  </div>

                  <label style={checkboxStyle}>
                    <input
                      type="checkbox"
                      checked={item.active}
                      onChange={(event) =>
                        updateCategory(
                          index,
                          "active",
                          event.target.checked
                        )
                      }
                    />
                    Активна
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      removeCategory(index)
                    }
                    style={deleteButtonStyle}
                  >
                    Видалити
                  </button>
                </div>
              )
            )}
          </div>
        </section>

        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={titleStyle}>
                Основи
              </h2>

              <p style={descriptionStyle}>
                Для кожної основи виберіть
                категорію, в якій вона
                доступна.
              </p>
            </div>

            <button
              type="button"
              onClick={addBase}
              style={addButtonStyle}
            >
              + Додати основу
            </button>
          </div>

          <div style={listStyle}>
            {settings.bases.map(
              (item, index) => (
                <div
                  key={`base-${index}`}
                  style={baseRowStyle}
                >
                  <input
                    value={item.label}
                    onChange={(event) =>
                      updateBase(
                        index,
                        "label",
                        event.target.value
                      )
                    }
                    placeholder="Назва основи"
                    style={inputStyle}
                  />

                  <div>
                    <input
                      value={item.value}
                      onChange={(event) =>
                        updateBase(
                          index,
                          "value",
                          event.target.value
                        )
                      }
                      placeholder="code"
                      style={inputStyle}
                    />

                    {!item.value &&
                      item.label && (
                        <button
                          type="button"
                          onClick={() =>
                            updateBase(
                              index,
                              "value",
                              createValue(
                                item.label
                              )
                            )
                          }
                          style={codeButtonStyle}
                        >
                          Створити код
                        </button>
                      )}
                  </div>

                  <select
                    value={item.category}
                    onChange={(event) =>
                      updateBase(
                        index,
                        "category",
                        event.target.value
                      )
                    }
                    style={inputStyle}
                  >
                    <option value="">
                      Оберіть категорію
                    </option>

                    {settings.categories.map(
                      (category) => (
                        <option
                          key={category.value}
                          value={
                            category.value
                          }
                        >
                          {category.label}
                        </option>
                      )
                    )}
                  </select>

                  <label style={checkboxStyle}>
                    <input
                      type="checkbox"
                      checked={item.active}
                      onChange={(event) =>
                        updateBase(
                          index,
                          "active",
                          event.target.checked
                        )
                      }
                    />
                    Активна
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      removeBase(index)
                    }
                    style={deleteButtonStyle}
                  >
                    Видалити
                  </button>
                </div>
              )
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

const sectionStyle = {
  marginBottom: "24px",
  padding: "24px",
  borderRadius: "20px",
  background: "#ffffff",
  border: "1px solid #e4ddd2",
} as const;

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: "16px",
  flexWrap: "wrap",
  marginBottom: "20px",
} as const;

const titleStyle = {
  margin: 0,
  fontSize: "26px",
} as const;

const descriptionStyle = {
  margin: "7px 0 0",
  color: "#716b63",
} as const;

const listStyle = {
  display: "grid",
  gap: "12px",
} as const;

const rowStyle = {
  display: "grid",
  gridTemplateColumns:
    "minmax(180px,1fr) minmax(150px,.7fr) auto auto",
  gap: "10px",
  alignItems: "center",
  padding: "14px",
  borderRadius: "14px",
  background: "#f7f4ef",
} as const;

const baseRowStyle = {
  display: "grid",
  gridTemplateColumns:
    "minmax(170px,1fr) minmax(130px,.6fr) minmax(180px,.8fr) auto auto",
  gap: "10px",
  alignItems: "center",
  padding: "14px",
  borderRadius: "14px",
  background: "#f7f4ef",
} as const;

const checkboxStyle = {
  display: "flex",
  gap: "7px",
  alignItems: "center",
  fontWeight: 700,
  whiteSpace: "nowrap",
} as const;

const addButtonStyle = {
  minHeight: "42px",
  padding: "0 15px",
  border: "none",
  borderRadius: "10px",
  background: "#d4af37",
  color: "#111111",
  fontWeight: 900,
  cursor: "pointer",
} as const;

const deleteButtonStyle = {
  minHeight: "40px",
  padding: "0 13px",
  border: "none",
  borderRadius: "9px",
  background: "#b42323",
  color: "#ffffff",
  fontWeight: 800,
  cursor: "pointer",
} as const;

const codeButtonStyle = {
  marginTop: "5px",
  border: "none",
  background: "transparent",
  color: "#8a7656",
  fontSize: "12px",
  fontWeight: 800,
  cursor: "pointer",
} as const;