import Link from "next/link";
export default function Header() {
  return (
    <header
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 40px",
        background: "#111",
        color: "#fff",
      }}
    >
      <h1 style={{ fontSize: "32px", margin: 0 }}>
        Dream<span style={{ color: "#d4af37" }}>Carpet</span>
      </h1>

      <nav>
        <ul
          style={{
            display: "flex",
            gap: "25px",
            listStyle: "none",
            margin: 0,
            padding: 0,
          }}
        >
          <li>
  <Link href="/" style={{ color: "#fff", textDecoration: "none" }}>
    Головна
  </Link>
</li>

<li>
  <Link href="/catalog" style={{ color: "#fff", textDecoration: "none" }}>
    Каталог
  </Link>
</li>

<li>
  <Link href="/cart" style={{ color: "#fff", textDecoration: "none" }}>
    🛒 Кошик
  </Link>
</li>

<li>
  <Link href="/" style={{ color: "#fff", textDecoration: "none" }}>
    Контакти
  </Link>
</li>
        </ul>
      </nav>
    </header>
  );
}