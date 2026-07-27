"use client";

import Link from "next/link";

import type {
  Product,
  ProductBase,
  ProductMaterial,
  ProductPile,
} from "../types/product";

type ProductCareBlockProps = {
  product: Product;
};

const baseCareTexts: Record<ProductBase, string> = {
  felt:
    "Повстяну основу краще не перезволожувати. Для щоденного догляду достатньо пилососа та легкого вологого прибирання без великої кількості води.",
  jute:
    "Джутова основа не любить зайву вологу. Після чистки килим потрібно добре висушити, щоб основа не деформувалася.",
  woven:
    "Ткана основа зазвичай міцна та практична. Її можна регулярно пилососити і чистити м’якою щіткою без агресивної хімії.",
  latex:
    "Латексна основа добре тримається на підлозі, але її не варто сушити біля батареї або під прямим сильним теплом.",
  stitched:
    "Прошиту основу можна доглядати звичайним пилососом. Головне — не терти краї занадто жорсткою щіткою.",
};

const pileCareTexts: Record<ProductPile, string> = {
  flat:
    "Безворсові килими прості в догляді: пил і дрібне сміття легко прибираються пилососом або щіткою.",
  medium:
    "Середній ворс потрібно пилососити 1–2 рази на тиждень, щоб пил не накопичувався всередині ворсу.",
  high:
    "Високий ворс потребує акуратнішого догляду. Пилососьте без турбощітки або на м’якому режимі, щоб не пошкодити ворс.",
};

const materialCareTexts: Partial<
  Record<ProductMaterial, string>
> = {
  polypropylene:
    "Поліпропілен практичний для дому: він не боїться звичайного пилососа та добре підходить для щоденного використання.",
  polyester:
    "Поліестер м’який і приємний на дотик. Його краще чистити делікатно, без жорсткого тертя.",
  wool:
    "Вовняні килими потребують делікатного догляду. Для складних плям краще використовувати професійну чистку.",
  viscose:
    "Віскоза чутлива до вологи, тому такий килим краще не мочити сильно і чистити дуже обережно.",
  cotton:
    "Бавовняні вироби можна чистити м’якою щіткою, але після вологого прибирання їх потрібно добре просушити.",
  microfiber:
    "Мікрофібра добре збирає пил, тому регулярне пилосошення допоможе зберегти охайний вигляд.",
  acrylic:
    "Акрилові килими краще чистити м’яко, без агресивних засобів і сильного тертя.",
  mixed:
    "Для змішаного складу краще використовувати універсальний делікатний догляд: пилосос, м’яка щітка, мінімум води.",
};

function getBaseArticleLink(base: ProductBase) {
  if (base === "felt") {
    return "/care/felt-base";
  }

  if (base === "jute") {
    return "/care/jute-base";
  }

  if (base === "latex") {
    return "/care/latex-base";
  }

  return "/care";
}

function getPileArticleLink(pile?: ProductPile) {
  if (pile === "high") {
    return "/care/high-pile";
  }

  return "/care";
}

export default function ProductCareBlock({
  product,
}: ProductCareBlockProps) {
  const baseCare = product.base
    ? baseCareTexts[product.base]
    : "";

  const pileCare = product.pile
    ? pileCareTexts[product.pile]
    : "";

  const materialCare = product.material
    ? materialCareTexts[product.material]
    : "";

  const hasCare =
    baseCare || pileCare || materialCare;

  if (!hasCare) {
    return null;
  }

  return (
    <section
      style={{
        marginTop: "25px",
        padding: "35px",
        borderRadius: "24px",
        background: "#ffffff",
      }}
    >
      <p
        style={{
          margin: "0 0 8px",
          color: "#967a55",
          fontWeight: 800,
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        Догляд
      </p>

      <h2
        style={{
          marginTop: 0,
          fontSize: "30px",
        }}
      >
        Як доглядати за цим килимом
      </h2>

      <div
        style={{
          display: "grid",
          gap: "14px",
          color: "#555555",
          fontSize: "17px",
          lineHeight: 1.7,
        }}
      >
        {baseCare && <p>{baseCare}</p>}

        {pileCare && <p>{pileCare}</p>}

        {materialCare && <p>{materialCare}</p>}

        <div
          style={{
            marginTop: "5px",
            padding: "18px",
            borderRadius: "16px",
            background: "#f5f2ed",
            color: "#3f3a32",
          }}
        >
          <strong>Швидка порада:</strong>{" "}
          плями краще прибирати одразу. Не
          заливай килим водою — спочатку промокни
          пляму сухою серветкою, а потім чисть
          м’яким засобом.
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginTop: "8px",
          }}
        >
          <Link
            href={getBaseArticleLink(product.base)}
            style={{
              padding: "11px 14px",
              borderRadius: "999px",
              background: "#111111",
              color: "#ffffff",
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            Детальніше про основу →
          </Link>

          <Link
            href={getPileArticleLink(product.pile)}
            style={{
              padding: "11px 14px",
              borderRadius: "999px",
              background: "#f5f2ed",
              color: "#181714",
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            Догляд за ворсом →
          </Link>

          <Link
            href="/care/stains"
            style={{
              padding: "11px 14px",
              borderRadius: "999px",
              background: "#f5f2ed",
              color: "#181714",
              textDecoration: "none",
              fontWeight: 800,
            }}
          >
            Як прибрати плями →
          </Link>
        </div>
      </div>
    </section>
  );
}