"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Product } from "../../types/product";

type Room =
  | "corridor"
  | "living"
  | "bedroom"
  | "kitchen"
  | "kids";

type Budget =
  | "budget"
  | "standard"
  | "premium";

type CarePriority =
  | "easy"
  | "soft"
  | "balanced";

type AnswerState = {
  room: Room | "";
  budget: Budget | "";
  care: CarePriority | "";
  color: string;
  width: string;
  length: string;
};

type Recommendation = {
  product: Product;
  score: number;
  reasons: string[];
};

const roomLabels: Record<Room, string> = {
  corridor: "Коридор / передпокій",
  living: "Вітальня",
  bedroom: "Спальня",
  kitchen: "Кухня",
  kids: "Дитяча",
};

const budgetLabels: Record<Budget, string> = {
  budget: "До 500 грн / м²",
  standard: "500–800 грн / м²",
  premium: "Від 800 грн / м²",
};

const careLabels: Record<
  CarePriority,
  string
> = {
  easy: "Максимально легко доглядати",
  soft: "Хочу м’який і затишний",
  balanced: "Баланс практичності та комфорту",
};

const colors = [
  "Не важливо",
  "Бежевий",
  "Коричневий",
  "Сірий",
  "Синій",
  "Червоний",
  "Зелений",
  "Графітовий",
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("uk-UA", {
    maximumFractionDigits: 0,
  }).format(value);
}

function parseNumber(value: string) {
  const parsed = Number(
    value.replace(",", ".")
  );

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

function normalize(value?: string) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function getBudgetFit(
  product: Product,
  budget: Budget
) {
  if (budget === "budget") {
    return product.price <= 500;
  }

  if (budget === "standard") {
    return (
      product.price > 500 &&
      product.price <= 800
    );
  }

  return product.price > 800;
}

function getRoomScore(
  product: Product,
  room: Room
) {
  const base = normalize(product.base);
  const category = normalize(
    product.category
  );
  const pile = normalize(
    product.pile
  );

  let score = 0;
  const reasons: string[] = [];

  if (
    room === "corridor" ||
    room === "kitchen"
  ) {
    if (
      base.includes("latex") ||
      base.includes("woven") ||
      base.includes("felt")
    ) {
      score += 3;
      reasons.push(
        "практична основа для активної зони"
      );
    }

    if (
      pile.includes("low") ||
      pile.includes("без") ||
      pile.includes("низ")
    ) {
      score += 2;
      reasons.push(
        "зручніше для щоденного догляду"
      );
    }
  }

  if (
    room === "living" ||
    room === "bedroom"
  ) {
    if (
      category === "standard" ||
      category === "premium" ||
      category === "turkey"
    ) {
      score += 2;
      reasons.push(
        "добре підходить для житлової кімнати"
      );
    }

    if (
      pile.includes("high") ||
      pile.includes("вис")
    ) {
      score += 2;
      reasons.push(
        "більш м’який та затишний варіант"
      );
    }
  }

  if (room === "kids") {
    if (
      base.includes("felt") ||
      base.includes("woven")
    ) {
      score += 2;
      reasons.push(
        "зручний варіант для дитячої"
      );
    }

    if (product.inStock) {
      score += 1;
    }
  }

  return {
    score,
    reasons,
  };
}

function getCareScore(
  product: Product,
  care: CarePriority
) {
  const base = normalize(product.base);
  const pile = normalize(product.pile);

  let score = 0;
  const reasons: string[] = [];

  if (care === "easy") {
    if (
      base.includes("latex") ||
      base.includes("woven") ||
      base.includes("felt")
    ) {
      score += 3;
      reasons.push(
        "простішим буде регулярний догляд"
      );
    }

    if (
      pile.includes("low") ||
      pile.includes("без") ||
      pile.includes("низ")
    ) {
      score += 2;
    }
  }

  if (care === "soft") {
    if (
      pile.includes("high") ||
      pile.includes("вис")
    ) {
      score += 3;
      reasons.push(
        "акцент на м’якості та комфорті"
      );
    }

    if (
      product.category === "premium" ||
      product.category === "turkey"
    ) {
      score += 1;
    }
  }

  if (care === "balanced") {
    if (
      product.category === "standard" ||
      product.category === "turkey"
    ) {
      score += 2;
      reasons.push(
        "баланс практичності та комфорту"
      );
    }
  }

  return {
    score,
    reasons,
  };
}

function getRecommendations(
  products: Product[],
  answers: AnswerState
): Recommendation[] {
  if (
    !answers.room ||
    !answers.budget ||
    !answers.care
  ) {
    return [];
  }

  const width = parseNumber(
    answers.width
  );

  return products
    .filter(
      (product) =>
        product.inStock &&
        product.price > 0
    )
    .map((product) => {
      let score = 0;
      const reasons: string[] = [];

      const roomResult =
        getRoomScore(
          product,
          answers.room as Room
        );

      score += roomResult.score;
      reasons.push(
        ...roomResult.reasons
      );

      const careResult =
        getCareScore(
          product,
          answers.care as CarePriority
        );

      score += careResult.score;
      reasons.push(
        ...careResult.reasons
      );

      if (
        getBudgetFit(
          product,
          answers.budget as Budget
        )
      ) {
        score += 5;
        reasons.push(
          "вписується у ваш бюджет"
        );
      }

      if (
        answers.color &&
        answers.color !== "Не важливо"
      ) {
        const hasColor =
          Array.isArray(
            product.colors
          ) &&
          product.colors.some(
            (color) =>
              normalize(color) ===
              normalize(
                answers.color
              )
          );

        if (hasColor) {
          score += 4;
          reasons.push(
            `є колір «${answers.color}»`
          );
        }
      }

      if (
        width > 0 &&
        Array.isArray(product.widths)
      ) {
        const hasWidth =
          product.widths.some(
            (item) =>
              Math.abs(
                Number(item) -
                  width
              ) < 0.01
          );

        if (hasWidth) {
          score += 3;
          reasons.push(
            `є потрібна ширина ${width} м`
          );
        }
      }

      if (product.featured) {
        score += 1;
      }

      return {
        product,
        score,
        reasons: [
          ...new Set(reasons),
        ].slice(0, 3),
      };
    })
    .sort(
      (first, second) =>
        second.score - first.score
    )
    .slice(0, 3);
}

export default function PickerPage() {
  const [products, setProducts] =
    useState<Product[]>([]);

  const [isLoading, setIsLoading] =
    useState(true);

  const [step, setStep] =
    useState(1);

  const [answers, setAnswers] =
    useState<AnswerState>({
      room: "",
      budget: "",
      care: "",
      color: "Не важливо",
      width: "",
      length: "",
    });

  useEffect(() => {
    async function loadProducts() {
      try {
        const response =
          await fetch(
            "/api/products",
            {
              cache: "no-store",
            }
          );

        const data =
          await response.json();

        const loadedProducts =
          Array.isArray(data)
            ? data
            : Array.isArray(
                  data.products
                )
              ? data.products
              : [];

        setProducts(
          loadedProducts
        );
      } catch (error) {
        console.error(
          "Не вдалося завантажити товари:",
          error
        );
      } finally {
        setIsLoading(false);
      }
    }

    void loadProducts();
  }, []);

  const recommendations =
    useMemo(
      () =>
        getRecommendations(
          products,
          answers
        ),
      [products, answers]
    );

  const area = useMemo(() => {
    const width = parseNumber(
      answers.width
    );
    const length = parseNumber(
      answers.length
    );

    if (
      width <= 0 ||
      length <= 0
    ) {
      return 0;
    }

    return width * length;
  }, [
    answers.width,
    answers.length,
  ]);

  function restart() {
    setAnswers({
      room: "",
      budget: "",
      care: "",
      color: "Не важливо",
      width: "",
      length: "",
    });

    setStep(1);
  }

  function nextStep() {
    setStep((current) =>
      Math.min(current + 1, 6)
    );
  }

  function previousStep() {
    setStep((current) =>
      Math.max(current - 1, 1)
    );
  }

  const canContinue =
    step === 1
      ? Boolean(answers.room)
      : step === 2
        ? Boolean(
            answers.budget
          )
        : step === 3
          ? Boolean(
              answers.care
            )
          : true;

  return (
    <main className="page">
      <div className="container">
        <section className="hero">
          <p className="eyebrow">
            🧠 Помічник DreamCarpet
          </p>

          <h1>
            Підберемо килим за 1 хвилину
          </h1>

          <p>
            Відповідайте на кілька
            простих питань — і ми
            покажемо 3 товари з вашого
            каталогу, які найбільше
            відповідають вибору.
          </p>

          <div className="progress">
            <div
              style={{
                width: `${Math.min(
                  (step / 6) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </section>

        <section className="wizard">
          {step === 1 && (
            <>
              <p className="step-label">
                Крок 1 із 5
              </p>

              <h2>
                Де буде килим?
              </h2>

              <div className="option-grid">
                {(
                  Object.entries(
                    roomLabels
                  ) as [
                    Room,
                    string,
                  ][]
                ).map(
                  ([
                    value,
                    label,
                  ]) => (
                    <button
                      key={value}
                      type="button"
                      className={
                        answers.room ===
                        value
                          ? "option active"
                          : "option"
                      }
                      onClick={() =>
                        setAnswers(
                          (current) => ({
                            ...current,
                            room: value,
                          })
                        )
                      }
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <p className="step-label">
                Крок 2 із 5
              </p>

              <h2>
                Який бюджет за 1 м²?
              </h2>

              <div className="option-grid">
                {(
                  Object.entries(
                    budgetLabels
                  ) as [
                    Budget,
                    string,
                  ][]
                ).map(
                  ([
                    value,
                    label,
                  ]) => (
                    <button
                      key={value}
                      type="button"
                      className={
                        answers.budget ===
                        value
                          ? "option active"
                          : "option"
                      }
                      onClick={() =>
                        setAnswers(
                          (current) => ({
                            ...current,
                            budget:
                              value,
                          })
                        )
                      }
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="step-label">
                Крок 3 із 5
              </p>

              <h2>
                Що для вас важливіше?
              </h2>

              <div className="option-grid">
                {(
                  Object.entries(
                    careLabels
                  ) as [
                    CarePriority,
                    string,
                  ][]
                ).map(
                  ([
                    value,
                    label,
                  ]) => (
                    <button
                      key={value}
                      type="button"
                      className={
                        answers.care ===
                        value
                          ? "option active"
                          : "option"
                      }
                      onClick={() =>
                        setAnswers(
                          (current) => ({
                            ...current,
                            care: value,
                          })
                        )
                      }
                    >
                      {label}
                    </button>
                  )
                )}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <p className="step-label">
                Крок 4 із 5
              </p>

              <h2>
                Який колір шукаєте?
              </h2>

              <div className="color-grid">
                {colors.map(
                  (color) => (
                    <button
                      key={color}
                      type="button"
                      className={
                        answers.color ===
                        color
                          ? "color-option active"
                          : "color-option"
                      }
                      onClick={() =>
                        setAnswers(
                          (current) => ({
                            ...current,
                            color,
                          })
                        )
                      }
                    >
                      {color}
                    </button>
                  )
                )}
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <p className="step-label">
                Крок 5 із 5
              </p>

              <h2>
                Який потрібен розмір?
              </h2>

              <p className="hint">
                Оберіть готову ширину, а довжину введіть самостійно.
              </p>

              <div className="width-picker">
                <span className="field-title">
                  Ширина
                </span>

                <div className="width-options">
                  {[0.8, 1, 1.2, 1.5, 2, 2.5, 3, 4].map(
                    (width) => (
                      <button
                        key={width}
                        type="button"
                        className={
                          Number(answers.width) === width
                            ? "width-option active"
                            : "width-option"
                        }
                        onClick={() =>
                          setAnswers((current) => ({
                            ...current,
                            width: String(width),
                          }))
                        }
                      >
                        {String(width).replace(".", ",")} м
                      </button>
                    )
                  )}
                </div>
              </div>

              <div className="length-field">
                <label>
                  Довжина, м
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    value={answers.length}
                    onChange={(event) =>
                      setAnswers((current) => ({
                        ...current,
                        length: event.target.value,
                      }))
                    }
                    placeholder="Наприклад 3,5"
                  />
                </label>
              </div>

              {area > 0 && (
                <div className="area-box">
                  Орієнтовна площа:{" "}
                  <strong>
                    {area.toFixed(2)} м²
                  </strong>
                </div>
              )}
            </>
          )}

          {step === 6 && (
            <>
              <p className="step-label">
                Готово
              </p>

              <h2>
                Ось що ми радимо
              </h2>

              <p className="hint">
                Результат формується з
                товарів, які зараз є у
                вашому каталозі та
                позначені як доступні.
              </p>

              {isLoading ? (
                <div className="empty">
                  Підбираємо товари...
                </div>
              ) : recommendations.length ===
                0 ? (
                <div className="empty">
                  Не вдалося знайти
                  відповідні товари.
                  Спробуйте змінити
                  параметри.
                </div>
              ) : (
                <div className="results">
                  {recommendations.map(
                    ({
                      product,
                      reasons,
                    }) => {
                      const image =
                        product
                          .images?.[0] ||
                        "";

                      const estimatedTotal =
                        area > 0
                          ? Math.round(
                              area *
                                product.price
                            )
                          : 0;

                      return (
                        <article
                          key={
                            product.id
                          }
                          className="result-card"
                        >
                          <div className="image-wrap">
                            {image ? (
                              <Image
                                src={
                                  image
                                }
                                alt={
                                  product.name
                                }
                                fill
                                sizes="360px"
                              />
                            ) : (
                              <div className="no-image">
                                Немає фото
                              </div>
                            )}
                          </div>

                          <div className="result-info">
                            <span className="article">
                              {
                                product.article
                              }
                            </span>

                            <h3>
                              {
                                product.name
                              }
                            </h3>

                            <strong className="price">
                              {formatNumber(
                                product.price
                              )}{" "}
                              грн / м²
                            </strong>

                            {estimatedTotal >
                              0 && (
                              <p className="estimated">
                                Для вашого
                                розміру:{" "}
                                <strong>
                                  ≈{" "}
                                  {formatNumber(
                                    estimatedTotal
                                  )}{" "}
                                  грн
                                </strong>
                              </p>
                            )}

                            {reasons.length >
                              0 && (
                              <ul>
                                {reasons.map(
                                  (
                                    reason
                                  ) => (
                                    <li
                                      key={
                                        reason
                                      }
                                    >
                                      ✓{" "}
                                      {
                                        reason
                                      }
                                    </li>
                                  )
                                )}
                              </ul>
                            )}

                            <Link
                              href={{
                                pathname: `/catalog/${product.id}`,
                                query: {
                                  ...(answers.width
                                    ? { width: answers.width }
                                    : {}),
                                  ...(answers.length
                                    ? { length: answers.length }
                                    : {}),
                                },
                              }}
                            >
                              Переглянути
                              товар →
                            </Link>
                          </div>
                        </article>
                      );
                    }
                  )}
                </div>
              )}

              <div className="finish-actions">
                <button
                  type="button"
                  onClick={restart}
                >
                  ↻ Підібрати заново
                </button>

                <Link href="/catalog">
                  Весь каталог →
                </Link>
              </div>
            </>
          )}

          {step < 6 && (
            <div className="navigation">
              {step > 1 ? (
                <button
                  type="button"
                  className="back"
                  onClick={
                    previousStep
                  }
                >
                  ← Назад
                </button>
              ) : (
                <span />
              )}

              <button
                type="button"
                className="next"
                disabled={
                  !canContinue
                }
                onClick={nextStep}
              >
                {step === 5
                  ? "Показати результат →"
                  : "Далі →"}
              </button>
            </div>
          )}
        </section>
      </div>

      <style jsx>{`
        .page {
          min-height: 100vh;
          padding: 45px 20px 80px;
          background:
            radial-gradient(
              circle at top left,
              rgba(
                212,
                175,
                55,
                0.28
              ),
              transparent 28%
            ),
            linear-gradient(
              180deg,
              #f1dfbf 0%,
              #e2c797 100%
            );
          color: #171717;
        }

        .container {
          max-width: 1050px;
          margin: 0 auto;
        }

        .hero {
          overflow: hidden;
          margin-bottom: 24px;
          padding: 38px;
          border-radius: 30px;
          background:
            radial-gradient(
              circle at top right,
              rgba(
                212,
                175,
                55,
                0.3
              ),
              transparent 35%
            ),
            linear-gradient(
              135deg,
              #101010,
              #281f13
            );
          color: #ffffff;
          border:
            1px solid #d4af37;
        }

        .eyebrow {
          margin: 0 0 10px;
          color: #d4af37;
          font-size: 13px;
          font-weight: 900;
          letter-spacing: 1.2px;
          text-transform: uppercase;
        }

        .hero h1 {
          max-width: 800px;
          margin: 0;
          font-size: clamp(
            38px,
            7vw,
            64px
          );
          line-height: 0.98;
        }

        .hero > p:last-of-type {
          max-width: 690px;
          margin: 18px 0 0;
          color: #eadfcf;
          font-size: 18px;
          line-height: 1.6;
        }

        .progress {
          overflow: hidden;
          height: 8px;
          margin-top: 28px;
          border-radius: 999px;
          background:
            rgba(
              255,
              255,
              255,
              0.12
            );
        }

        .progress div {
          height: 100%;
          border-radius: inherit;
          background:
            linear-gradient(
              90deg,
              #d4af37,
              #ffd95a
            );
          transition:
            width 0.3s ease;
        }

        .wizard {
          padding: 32px;
          border-radius: 28px;
          background: #fff2dc;
          border:
            1px solid #b9892b;
          box-shadow:
            0 20px 55px
            rgba(
              40,
              30,
              15,
              0.13
            );
        }

        .step-label {
          margin: 0 0 8px;
          color: #8f6717;
          font-size: 13px;
          font-weight: 900;
          text-transform:
            uppercase;
        }

        h2 {
          margin: 0 0 22px;
          font-size: clamp(
            30px,
            5vw,
            44px
          );
        }

        .hint {
          margin: -10px 0 20px;
          color: #665846;
          line-height: 1.55;
        }

        .option-grid {
          display: grid;
          grid-template-columns:
            repeat(2, 1fr);
          gap: 14px;
        }

        .option,
        .color-option {
          min-height: 74px;
          padding: 16px;
          border:
            1px solid #b89b70;
          border-radius: 17px;
          background: #ffffff;
          color: #171717;
          font: inherit;
          font-weight: 900;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            border 0.2s ease,
            background 0.2s ease;
        }

        .option:hover,
        .color-option:hover {
          transform:
            translateY(-2px);
        }

        .option.active,
        .color-option.active {
          border-color: #171717;
          background: #171717;
          color: #ffd95a;
        }

        .color-grid {
          display: grid;
          grid-template-columns:
            repeat(4, 1fr);
          gap: 12px;
        }

        .color-option {
          min-height: 58px;
        }

        .size-grid {
          display: grid;
          grid-template-columns:
            1fr 1fr;
          gap: 14px;
        }

        .width-picker {
          margin-bottom: 20px;
        }

        .field-title {
          display: block;
          margin-bottom: 10px;
          font-weight: 900;
        }

        .width-options {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 10px;
        }

        .width-option {
          min-height: 52px;
          padding: 0 12px;
          border:
            1px solid #b89b70;
          border-radius: 14px;
          background: #ffffff;
          color: #171717;
          font: inherit;
          font-weight: 900;
          cursor: pointer;
          transition:
            transform 0.2s ease,
            background 0.2s ease,
            border 0.2s ease;
        }

        .width-option:hover {
          transform:
            translateY(-2px);
        }

        .width-option.active {
          border-color: #171717;
          background: #171717;
          color: #ffd95a;
        }

        .length-field {
          max-width: 420px;
        }

        label {
          display: grid;
          gap: 8px;
          font-weight: 900;
        }

        input {
          width: 100%;
          box-sizing:
            border-box;
          padding: 14px;
          border:
            1px solid #aa8136;
          border-radius: 13px;
          background: #ffffff;
          color: #171717;
          font: inherit;
        }

        .area-box {
          margin-top: 16px;
          padding: 16px;
          border-radius: 14px;
          background: #171717;
          color: #ffffff;
        }

        .area-box strong {
          color: #ffd95a;
        }

        .navigation {
          display: flex;
          justify-content:
            space-between;
          gap: 12px;
          margin-top: 30px;
          padding-top: 22px;
          border-top:
            1px solid #dcc8a9;
        }

        .navigation button,
        .finish-actions button,
        .finish-actions a {
          min-height: 50px;
          padding: 0 20px;
          border: 0;
          border-radius: 13px;
          font: inherit;
          font-weight: 900;
          cursor: pointer;
        }

        .back {
          background: #e6d5bc;
          color: #171717;
        }

        .next {
          background:
            linear-gradient(
              135deg,
              #d4af37,
              #ffd95a
            );
          color: #111111;
        }

        .next:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .empty {
          padding: 28px;
          border-radius: 18px;
          background: #ffffff;
          border:
            1px dashed #b89b70;
          text-align: center;
          font-weight: 800;
        }

        .results {
          display: grid;
          grid-template-columns:
            repeat(3, 1fr);
          gap: 16px;
        }

        .result-card {
          overflow: hidden;
          border:
            1px solid #b9892b;
          border-radius: 22px;
          background: #ffffff;
        }

        .image-wrap {
          position: relative;
          height: 210px;
          background: #d5bd97;
        }

        .image-wrap :global(img) {
          object-fit: cover;
        }

        .no-image {
          display: flex;
          height: 100%;
          align-items: center;
          justify-content:
            center;
          color: #6e604d;
          font-weight: 800;
        }

        .result-info {
          padding: 18px;
        }

        .article {
          color: #8f6717;
          font-size: 12px;
          font-weight: 900;
        }

        .result-info h3 {
          margin: 7px 0 9px;
          font-size: 21px;
        }

        .price {
          font-size: 20px;
        }

        .estimated {
          margin: 10px 0;
          color: #5f5241;
        }

        .result-info ul {
          display: grid;
          gap: 6px;
          margin: 15px 0;
          padding: 0;
          list-style: none;
          color: #4d4337;
          font-size: 14px;
        }

        .result-info a {
          display: inline-flex;
          min-height: 44px;
          align-items: center;
          justify-content:
            center;
          width: 100%;
          border-radius: 12px;
          background: #171717;
          color: #ffffff;
          text-decoration: none;
          font-weight: 900;
        }

        .finish-actions {
          display: flex;
          justify-content:
            space-between;
          gap: 12px;
          margin-top: 24px;
        }

        .finish-actions button {
          background: #e3d0b3;
          color: #171717;
        }

        .finish-actions a {
          display: inline-flex;
          align-items: center;
          justify-content:
            center;
          background: #171717;
          color: #ffffff;
          text-decoration: none;
        }

        @media (
          max-width: 850px
        ) {
          .results {
            grid-template-columns:
              1fr;
          }

          .color-grid {
            grid-template-columns:
              repeat(2, 1fr);
          }
        }

        @media (
          max-width: 600px
        ) {
          .page {
            padding-left: 12px;
            padding-right: 12px;
          }

          .hero,
          .wizard {
            padding: 24px 18px;
          }

          .option-grid,
          .size-grid,
          .color-grid {
            grid-template-columns:
              1fr;
          }

          .width-options {
            grid-template-columns:
              repeat(2, 1fr);
          }

          .length-field {
            max-width: none;
          }

          .navigation,
          .finish-actions {
            display: grid;
          }

          .navigation button,
          .finish-actions button,
          .finish-actions a {
            width: 100%;
          }
        }
      `}</style>
    </main>
  );
}