import {
  mkdir,
  readFile,
  writeFile,
} from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ReviewStatus =
  | "pending"
  | "approved"
  | "rejected";

type Review = {
  id: string;
  productId: number;
  productName: string;
  name: string;
  rating: number;
  text: string;
  status: ReviewStatus;
  createdAt: string;
};

type ReviewRequest = {
  productId?: number;
  productName?: string;
  name?: string;
  rating?: number;
  text?: string;
};

function getDatabaseDirectory() {
  return path.join(process.cwd(), "database");
}

function getReviewsFilePath() {
  return path.join(
    getDatabaseDirectory(),
    "reviews.json"
  );
}

async function ensureDatabase() {
  await mkdir(getDatabaseDirectory(), {
    recursive: true,
  });
}

async function readReviews(): Promise<Review[]> {
  await ensureDatabase();

  try {
    const content = await readFile(
      getReviewsFilePath(),
      "utf-8"
    );

    const parsed: unknown = JSON.parse(content);

    return Array.isArray(parsed)
      ? (parsed as Review[])
      : [];
  } catch {
    await writeFile(
      getReviewsFilePath(),
      JSON.stringify([], null, 2),
      "utf-8"
    );

    return [];
  }
}

async function writeReviews(
  reviews: Review[]
) {
  await ensureDatabase();

  await writeFile(
    getReviewsFilePath(),
    JSON.stringify(reviews, null, 2),
    "utf-8"
  );
}

export async function GET(
  request: Request
) {
  try {
    const url = new URL(request.url);

    const productId = Number(
      url.searchParams.get("productId")
    );

    if (!Number.isInteger(productId)) {
      return NextResponse.json(
        {
          message:
            "Некоректний ID товару.",
        },
        {
          status: 400,
        }
      );
    }

    const reviews = await readReviews();

    const approvedReviews = reviews
      .filter(
        (review) =>
          review.productId === productId &&
          review.status === "approved"
      )
      .sort(
        (first, second) =>
          new Date(
            second.createdAt
          ).getTime() -
          new Date(
            first.createdAt
          ).getTime()
      );

    return NextResponse.json({
      success: true,
      reviews: approvedReviews,
    });
  } catch (error) {
    console.error(
      "Reviews GET error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Не вдалося завантажити відгуки.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(
  request: Request
) {
  try {
    const body =
      (await request.json()) as ReviewRequest;

    const productId = Number(
      body.productId
    );

    const productName =
      String(
        body.productName || ""
      ).trim();

    const name =
      String(body.name || "").trim();

    const text =
      String(body.text || "").trim();

    const rating =
      Number(body.rating);

    if (!Number.isInteger(productId)) {
      return NextResponse.json(
        {
          message:
            "Некоректний товар.",
        },
        {
          status: 400,
        }
      );
    }

    if (productName.length < 1) {
      return NextResponse.json(
        {
          message:
            "Не знайдено назву товару.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      name.length < 2 ||
      name.length > 60
    ) {
      return NextResponse.json(
        {
          message:
            "Ім’я повинно містити від 2 до 60 символів.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      text.length < 10 ||
      text.length > 1200
    ) {
      return NextResponse.json(
        {
          message:
            "Відгук повинен містити від 10 до 1200 символів.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(rating) ||
      rating < 1 ||
      rating > 5
    ) {
      return NextResponse.json(
        {
          message:
            "Оцінка повинна бути від 1 до 5.",
        },
        {
          status: 400,
        }
      );
    }

    const reviews =
      await readReviews();

    const review: Review = {
      id: randomUUID(),
      productId,
      productName,
      name,
      rating,
      text,
      status: "pending",
      createdAt:
        new Date().toISOString(),
    };

    reviews.push(review);

    await writeReviews(reviews);

    return NextResponse.json(
      {
        success: true,
        message:
          "Відгук надіслано на модерацію.",
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Reviews POST error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Не вдалося зберегти відгук.",
      },
      {
        status: 500,
      }
    );
  }
}