"use client";

import {
  FormEvent,
  Suspense,
  useState,
} from "react";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";

type LoginResponse = {
  success?: boolean;
  message?: string;
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [password, setPassword] =
    useState("");
  const [error, setError] =
    useState("");
  const [loading, setLoading] =
    useState(false);

  const nextPath =
    searchParams.get("next") ||
    "/admin/orders";

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!password.trim()) {
      setError("Введіть пароль");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            password,
          }),
        }
      );

      const data =
        (await response.json()) as LoginResponse;

      if (
        !response.ok ||
        !data.success
      ) {
        throw new Error(
          data.message ||
            "Не вдалося увійти"
        );
      }

      router.replace(nextPath);
      router.refresh();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Сталася невідома помилка"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="logo">DC</div>

        <p className="eyebrow">
          DreamCarpet CRM
        </p>

        <h1>Вхід в адмінку</h1>

        <p className="description">
          Введіть пароль адміністратора,
          щоб переглядати та керувати
          замовленнями.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="password">
            Пароль
          </label>

          <input
            id="password"
            type="password"
            value={password}
            onChange={(event) =>
              setPassword(
                event.target.value
              )
            }
            placeholder="Введіть пароль"
            autoComplete="current-password"
            autoFocus
          />

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
          >
            {loading
              ? "Вхід..."
              : "Увійти"}
          </button>
        </form>

        <p className="security-note">
          Захищено серверною авторизацією
        </p>
      </section>

      <style jsx>{`
        .login-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          padding: 20px;
          background:
            radial-gradient(
              circle at top left,
              rgba(193, 168, 126, 0.28),
              transparent 35%
            ),
            radial-gradient(
              circle at bottom right,
              rgba(24, 23, 20, 0.12),
              transparent 40%
            ),
            #f4f1eb;
          color: #181714;
        }

        .login-card {
          width: 100%;
          max-width: 430px;
          padding: 36px;
          border: 1px solid #ddd5c7;
          border-radius: 24px;
          background: rgba(
            255,
            255,
            255,
            0.94
          );
          box-shadow:
            0 25px 70px
            rgba(44, 36, 24, 0.13);
          backdrop-filter: blur(14px);
        }

        .logo {
          width: 58px;
          height: 58px;
          display: grid;
          place-items: center;
          margin-bottom: 24px;
          border-radius: 18px;
          background: #181714;
          color: #ffffff;
          font-size: 20px;
          font-weight: 900;
          letter-spacing: 1px;
        }

        .eyebrow {
          margin: 0 0 8px;
          color: #8a7656;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }

        h1 {
          margin: 0;
          font-size: clamp(
            30px,
            7vw,
            42px
          );
          line-height: 1.05;
        }

        .description {
          margin: 14px 0 26px;
          color: #716d65;
          line-height: 1.6;
        }

        form {
          display: grid;
          gap: 13px;
        }

        label {
          font-size: 14px;
          font-weight: 800;
        }

        input {
          width: 100%;
          border: 1px solid #d8d1c5;
          border-radius: 14px;
          background: #ffffff;
          padding: 15px 16px;
          color: #181714;
          font: inherit;
          outline: none;
          box-sizing: border-box;
        }

        input:focus {
          border-color: #8a7656;
          box-shadow:
            0 0 0 4px
            rgba(138, 118, 86, 0.13);
        }

        button {
          width: 100%;
          border: 0;
          border-radius: 14px;
          background: #181714;
          color: #ffffff;
          padding: 15px 18px;
          font: inherit;
          font-weight: 800;
          cursor: pointer;
          transition:
            transform 0.16s ease,
            opacity 0.16s ease;
        }

        button:hover:not(:disabled) {
          transform: translateY(-1px);
        }

        button:disabled {
          opacity: 0.65;
          cursor: wait;
        }

        .error-message {
          border: 1px solid #efb4b4;
          border-radius: 12px;
          background: #fff0f0;
          color: #a42121;
          padding: 12px 14px;
          font-size: 14px;
        }

        .security-note {
          margin: 22px 0 0;
          color: #8a857b;
          font-size: 12px;
          text-align: center;
        }

        @media (max-width: 500px) {
          .login-card {
            padding: 26px 20px;
            border-radius: 20px;
          }
        }
      `}</style>
    </main>
  );
}

function LoginLoading() {
  return (
    <main className="loading-page">
      <p>Завантаження...</p>

      <style jsx>{`
        .loading-page {
          min-height: 100vh;
          display: grid;
          place-items: center;
          background: #f4f1eb;
          color: #181714;
          font-family: Arial, sans-serif;
        }
      `}</style>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense
      fallback={<LoginLoading />}
    >
      <LoginForm />
    </Suspense>
  );
}