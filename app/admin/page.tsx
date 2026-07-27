"use client";

import Image from "next/image";
import {
  ChangeEvent,
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

type Product = {
  id: number;
  slug: string;
  article: string;
  category: "budget" | "standard" | "premium" | "turkey";
  base: "felt" | "jute" | "woven";
  collection: string;
  name: string;
  description: string;
  price: number;
  colors: string[];
  widths: number[];
  images: string[];
  productionTime: string;
  inStock: boolean;
  featured: boolean;
  new: boolean;
};

const inputStyle = {
  width: "100%",
  padding: "12px",
  border: "1px solid #cccccc",
  borderRadius: "8px",
  fontSize: "16px",
  boxSizing: "border-box" as const,
  background: "#ffffff",
  color: "#111111",
};

const buttonStyle = {
  padding: "12px 16px",
  border: "none",
  borderRadius: "9px",
  fontSize: "15px",
  fontWeight: 700,
  cursor: "pointer",
};

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [editingProduct, setEditingProduct] =
    useState<Product | null>(null);

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isProductsLoading, setIsProductsLoading] =
    useState(true);

  const loadProducts = useCallback(async () => {
    try {
      setIsProductsLoading(true);

      const response = await fetch("/api/products", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Не вдалося завантажити товари");
      }

      const data = (await response.json()) as Product[];
      setProducts([...data].reverse());
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Помилка завантаження товарів"
      );
    } finally {
      setIsProductsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  function handleImages(
    event: ChangeEvent<HTMLInputElement>
  ) {
    setSelectedImages(
      Array.from(event.target.files ?? [])
    );
  }

  function removeExistingImage(image: string) {
    setExistingImages((current) =>
      current.filter((item) => item !== image)
    );
  }

  function startEditing(product: Product) {
    setEditingProduct(product);
    setExistingImages(product.images ?? []);
    setSelectedImages([]);
    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEditing(form?: HTMLFormElement) {
    setEditingProduct(null);
    setExistingImages([]);
    setSelectedImages([]);
    setMessage("");

    form?.reset();
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setIsLoading(true);
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    if (editingProduct) {
      formData.append("id", String(editingProduct.id));

      existingImages.forEach((image) => {
        formData.append("existingImages", image);
      });
    }

    try {
      const response = await fetch("/api/products", {
        method: editingProduct ? "PUT" : "POST",
        body: formData,
      });

      const responseText = await response.text();

      let result: { message?: string } = {};

      if (responseText) {
        try {
          result = JSON.parse(responseText);
        } catch {
          throw new Error(
            `Сервер повернув неправильну відповідь. Код: ${response.status}`
          );
        }
      }

      if (!response.ok) {
        throw new Error(
          result.message || "Не вдалося зберегти товар"
        );
      }

      setMessage(
        editingProduct
          ? "Товар успішно оновлено!"
          : "Товар успішно додано!"
      );

      setEditingProduct(null);
      setExistingImages([]);
      setSelectedImages([]);
      form.reset();

      await loadProducts();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Сталася невідома помилка"
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function deleteProduct(product: Product) {
    const confirmed = window.confirm(
      `Видалити товар «${product.name}»?\n\nРазом із товаром будуть видалені його фотографії.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setMessage("");

      const response = await fetch("/api/products", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: product.id,
        }),
      });

      const result = (await response.json()) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(
          result.message || "Не вдалося видалити товар"
        );
      }

      if (editingProduct?.id === product.id) {
        setEditingProduct(null);
        setExistingImages([]);
        setSelectedImages([]);
      }

      setMessage("Товар успішно видалено!");
      await loadProducts();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Помилка видалення товару"
      );
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f3f1ed",
        padding: "40px 20px",
        color: "#1c1c1c",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
        }}
      >
        <section
          style={{
            background: "#ffffff",
            padding: "30px",
            borderRadius: "20px",
            marginBottom: "35px",
          }}
        >
          <h1
            style={{
              fontSize: "38px",
              marginTop: 0,
              marginBottom: "8px",
            }}
          >
            {editingProduct
              ? "Редагування товару"
              : "Додати новий товар"}
          </h1>

          <p style={{ color: "#666666" }}>
            Фотографії перейменовувати не потрібно.
          </p>

          {editingProduct && (
            <div
              style={{
                padding: "12px 15px",
                marginBottom: "20px",
                borderRadius: "10px",
                background: "#f5efe5",
              }}
            >
              Редагується:{" "}
              <strong>{editingProduct.name}</strong>
            </div>
          )}

          <form
            key={editingProduct?.id ?? "new-product"}
            onSubmit={handleSubmit}
            style={{
              display: "grid",
              gap: "20px",
            }}
          >
            <div>
              <label>Назва товару</label>
              <input
                name="name"
                required
                defaultValue={editingProduct?.name ?? ""}
                placeholder="Мармур Беж"
                style={inputStyle}
              />
            </div>

            <div>
              <label>Артикул</label>
              <input
                name="article"
                required
                defaultValue={editingProduct?.article ?? ""}
                placeholder="MB-001"
                style={inputStyle}
              />
            </div>

            <div>
              <label>Колекція</label>
              <input
                name="collection"
                defaultValue={
                  editingProduct?.collection ?? ""
                }
                placeholder="Marble"
                style={inputStyle}
              />
            </div>

            <div>
              <label>Ціна за м²</label>
              <input
                name="price"
                type="number"
                min="1"
                step="0.01"
                required
                defaultValue={editingProduct?.price ?? ""}
                placeholder="799"
                style={inputStyle}
              />
            </div>

            <div>
              <label>Категорія</label>
              <select
                name="category"
                defaultValue={
                  editingProduct?.category ?? "budget"
                }
                style={inputStyle}
              >
                <option value="budget">Бюджетні</option>
                <option value="standard">
                  Середня якість
                </option>
                <option value="premium">Преміум</option>
                <option value="turkey">Туреччина</option>
              </select>
            </div>

            <div>
              <label>Основа</label>
              <select
                name="base"
                defaultValue={
                  editingProduct?.base ?? "felt"
                }
                style={inputStyle}
              >
              <option value="felt">Повстяна</option>
<option value="jute">Джутова</option>
<option value="latex">Латексна</option>
<option value="stitched">Прошита</option>
<option value="woven">Ткана</option>
              </select>
            </div>

            <div>
              <label>Опис</label>
              <textarea
                name="description"
                rows={8}
                defaultValue={
                  editingProduct?.description ?? ""
                }
                placeholder="Опис товару"
                style={inputStyle}
              />
            </div>

            <div>
              <label>Кольори через кому</label>
              <input
                name="colors"
                defaultValue={
                  editingProduct?.colors?.join(", ") ?? ""
                }
                placeholder="Бежевий, сірий, коричневий"
                style={inputStyle}
              />
            </div>

            <div>
              <label>Ширини через кому</label>
              <input
                name="widths"
                defaultValue={
                  editingProduct?.widths?.join(", ") ?? ""
                }
                placeholder="0.8, 1, 1.2, 1.5, 2"
                style={inputStyle}
              />
            </div>

            <div>
              <label>Час виготовлення</label>
              <input
                name="productionTime"
                defaultValue={
                  editingProduct?.productionTime ??
                  "1–3 дні"
                }
                style={inputStyle}
              />
            </div>

            {editingProduct &&
              existingImages.length > 0 && (
                <div>
                  <strong>Поточні фотографії</strong>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(130px, 1fr))",
                      gap: "15px",
                      marginTop: "12px",
                    }}
                  >
                    {existingImages.map((image) => (
                      <div
                        key={image}
                        style={{
                          position: "relative",
                          height: "130px",
                          overflow: "hidden",
                          borderRadius: "12px",
                          background: "#eeeeee",
                        }}
                      >
                        <Image
                          src={image}
                          alt="Фото товару"
                          fill
                          sizes="150px"
                          style={{
                            objectFit: "cover",
                          }}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removeExistingImage(image)
                          }
                          style={{
                            position: "absolute",
                            top: "7px",
                            right: "7px",
                            width: "32px",
                            height: "32px",
                            border: "none",
                            borderRadius: "50%",
                            background: "#b42323",
                            color: "#ffffff",
                            cursor: "pointer",
                            fontWeight: 900,
                          }}
                          title="Видалити фотографію"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            <div>
              <label>
                {editingProduct
                  ? "Додати нові фотографії"
                  : "Фотографії"}
              </label>

              <input
                name="images"
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/avif"
                onChange={handleImages}
                style={inputStyle}
              />

              <p>
                Вибрано нових фото:{" "}
                <strong>{selectedImages.length}</strong>
              </p>
            </div>

            <div>
              <label>
                <input
                  type="checkbox"
                  name="inStock"
                  value="true"
                  defaultChecked={
                    editingProduct
                      ? editingProduct.inStock
                      : true
                  }
                />{" "}
                У наявності
              </label>
            </div>

            <div>
              <label>
                <input
                  type="checkbox"
                  name="featured"
                  value="true"
                  defaultChecked={
                    editingProduct?.featured ?? false
                  }
                />{" "}
                Рекомендований
              </label>
            </div>

            <div>
              <label>
                <input
                  type="checkbox"
                  name="new"
                  value="true"
                  defaultChecked={
                    editingProduct
                      ? editingProduct.new
                      : true
                  }
                />{" "}
                Новинка
              </label>
            </div>

            {message && (
              <div
                style={{
                  padding: "13px",
                  background: "#eeeeee",
                  borderRadius: "9px",
                  fontWeight: 700,
                }}
              >
                {message}
              </div>
            )}

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  ...buttonStyle,
                  flex: "1 1 220px",
                  padding: "15px",
                  background: "#111111",
                  color: "#ffffff",
                  opacity: isLoading ? 0.7 : 1,
                }}
              >
                {isLoading
                  ? "Збереження..."
                  : editingProduct
                    ? "Зберегти зміни"
                    : "Додати товар"}
              </button>

              {editingProduct && (
                <button
                  type="button"
                  onClick={(event) => {
                    const form =
                      event.currentTarget.closest("form");

                    cancelEditing(form ?? undefined);
                  }}
                  style={{
                    ...buttonStyle,
                    flex: "1 1 180px",
                    background: "#dddddd",
                    color: "#111111",
                  }}
                >
                  Скасувати редагування
                </button>
              )}
            </div>
          </form>
        </section>

        <section
          style={{
            background: "#ffffff",
            padding: "30px",
            borderRadius: "20px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "15px",
              marginBottom: "25px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2
                style={{
                  margin: 0,
                  fontSize: "30px",
                }}
              >
                Усі товари
              </h2>

              <p
                style={{
                  marginBottom: 0,
                  color: "#666666",
                }}
              >
                Кількість товарів: {products.length}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadProducts()}
              style={{
                ...buttonStyle,
                background: "#eeeeee",
                color: "#111111",
              }}
            >
              Оновити список
            </button>
          </div>

          {isProductsLoading ? (
            <p>Завантаження товарів...</p>
          ) : products.length === 0 ? (
            <p>Товарів поки що немає.</p>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "15px",
              }}
            >
              {products.map((product) => (
                <article
                  key={product.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "100px minmax(180px, 1fr) auto",
                    gap: "18px",
                    alignItems: "center",
                    padding: "15px",
                    border: "1px solid #e0e0e0",
                    borderRadius: "14px",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      width: "100px",
                      height: "100px",
                      borderRadius: "11px",
                      overflow: "hidden",
                      background: "#eeeeee",
                    }}
                  >
                    {product.images?.[0] ? (
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        sizes="100px"
                        style={{
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          fontSize: "12px",
                          color: "#777777",
                        }}
                      >
                        Немає фото
                      </div>
                    )}
                  </div>

                  <div>
                    <h3
                      style={{
                        margin: "0 0 7px",
                        fontSize: "21px",
                      }}
                    >
                      {product.name}
                    </h3>

                    <p
                      style={{
                        margin: "0 0 5px",
                        color: "#666666",
                      }}
                    >
                      Артикул: {product.article}
                    </p>

                    <strong>{product.price} грн / м²</strong>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "9px",
                      flexWrap: "wrap",
                      justifyContent: "flex-end",
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        startEditing(product)
                      }
                      style={{
                        ...buttonStyle,
                        background: "#c29a65",
                        color: "#ffffff",
                      }}
                    >
                      Редагувати
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        void deleteProduct(product)
                      }
                      style={{
                        ...buttonStyle,
                        background: "#b42323",
                        color: "#ffffff",
                      }}
                    >
                      Видалити
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}