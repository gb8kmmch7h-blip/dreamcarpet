import {
  mkdir,
  readFile,
  writeFile,
} from "fs/promises";
import path from "path";
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

function getDatabaseDirectory() {
  return path.join(
    process.cwd(),
    "database"
  );
}

function getReviewsFilePath() {
  return path.join(
    getDatabaseDirectory(),
    "reviews.json"
  );
}

async function ensureDatabase() {
  await mkdir(
    getDatabaseDirectory(),
    {
      recursive: true,
    }
  );
}

async function readReviews(): Promise<
  Review[]
> {
  await ensureDatabase();

  try {
    const content =
      await readFile(
        getReviewsFilePath(),
        "utf-8"
      );

    const parsed: unknown =
      JSON.parse(content);

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
    JSON.stringify(
      reviews,
      null,
      2
    ),
    "utf-8"
  );
}

export async function GET() {
  try {
    const reviews =
      await readReviews();

    const sortedReviews =
      [...reviews].sort(
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
      reviews: sortedReviews,
    });
  } catch (error) {
    console.error(
      "Admin reviews GET error:",
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

export async function PATCH(
  request: Request
) {
  try {
    const body =
      (await request.json()) as {
        id?: string;
        status?: ReviewStatus;
      };

    const id =
      String(body.id || "").trim();

    const status =
      body.status;

    if (!id) {
      return NextResponse.json(
        {
          message:
            "Не вказано ID відгуку.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      status !== "pending" &&
      status !== "approved" &&
      status !== "rejected"
    ) {
      return NextResponse.json(
        {
          message:
            "Некоректний статус відгуку.",
        },
        {
          status: 400,
        }
      );
    }

    const reviews =
      await readReviews();

    const reviewIndex =
      reviews.findIndex(
        (review) =>
          review.id === id
      );

    if (reviewIndex === -1) {
      return NextResponse.json(
        {
          message:
            "Відгук не знайдено.",
        },
        {
          status: 404,
        }
      );
    }

    reviews[reviewIndex] = {
      ...reviews[reviewIndex],
      status,
    };

    await writeReviews(reviews);

    return NextResponse.json({
      success: true,
      review: reviews[reviewIndex],
      message:
        "Статус відгуку оновлено.",
    });
  } catch (error) {
    console.error(
      "Admin reviews PATCH error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Не вдалося оновити відгук.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(
  request: Request
) {
  try {
    const body =
      (await request.json()) as {
        id?: string;
      };

    const id =
      String(body.id || "").trim();

    if (!id) {
      return NextResponse.json(
        {
          message:
            "Не вказано ID відгуку.",
        },
        {
          status: 400,
        }
      );
    }

    const reviews =
      await readReviews();

    const filteredReviews =
      reviews.filter(
        (review) =>
          review.id !== id
      );

    if (
      filteredReviews.length ===
      reviews.length
    ) {
      return NextResponse.json(
        {
          message:
            "Відгук не знайдено.",
        },
        {
          status: 404,
        }
      );
    }

    await writeReviews(
      filteredReviews
    );

    return NextResponse.json({
      success: true,
      message:
        "Відгук видалено.",
    });
  } catch (error) {
    console.error(
      "Admin reviews DELETE error:",
      error
    );

    return NextResponse.json(
      {
        message:
          "Не вдалося видалити відгук.",
      },
      {
        status: 500,
      }
    );
  }
}