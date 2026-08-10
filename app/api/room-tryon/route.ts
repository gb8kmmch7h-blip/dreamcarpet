import {
  readFile,
} from "fs/promises";
import path from "path";

import OpenAI, {
  toFile,
} from "openai";
import { NextResponse } from "next/server";

import { getAllProducts } from "../../../lib/getAllProducts";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_ROOM_PHOTO_SIZE =
  12 * 1024 * 1024;

function getImageMimeType(
  filePath: string
) {
  const extension =
    path.extname(filePath).toLowerCase();

  if (extension === ".png") {
    return "image/png";
  }

  if (extension === ".webp") {
    return "image/webp";
  }

  return "image/jpeg";
}

async function getProductImage(
  imagePath: string
) {
  if (
    imagePath.startsWith("https://") ||
    imagePath.startsWith("http://")
  ) {
    const response =
      await fetch(imagePath);

    if (!response.ok) {
      throw new Error(
        "Не вдалося завантажити фото килима."
      );
    }

    const bytes =
      Buffer.from(
        await response.arrayBuffer()
      );

    return {
      bytes,
      fileName: "carpet-reference.jpg",
      mimeType:
        response.headers.get(
          "content-type"
        ) || "image/jpeg",
    };
  }

  const publicDirectory =
    path.resolve(
      process.cwd(),
      "public"
    );

  const relativePath =
    imagePath
      .replace(/^\/+/, "")
      .replaceAll("\\", "/");

  const absolutePath =
    path.resolve(
      publicDirectory,
      relativePath
    );

  if (
    absolutePath !== publicDirectory &&
    !absolutePath.startsWith(
      `${publicDirectory}${path.sep}`
    )
  ) {
    throw new Error(
      "Некоректний шлях до фото килима."
    );
  }

  const bytes =
    await readFile(
      absolutePath
    );

  return {
    bytes,
    fileName:
      path.basename(
        absolutePath
      ),
    mimeType:
      getImageMimeType(
        absolutePath
      ),
  };
}

export async function POST(
  request: Request
) {
  try {
    if (
      !process.env.OPENAI_API_KEY
    ) {
      return NextResponse.json(
        {
          message:
            "AI-примірка ще не підключена: додайте OPENAI_API_KEY у .env.local.",
        },
        {
          status: 503,
        }
      );
    }

    const formData =
      await request.formData();

    const roomPhoto =
      formData.get(
        "roomPhoto"
      );

    const productId =
      Number(
        formData.get(
          "productId"
        )
      );

    const color =
      String(
        formData.get(
          "color"
        ) || ""
      ).trim();

    const width =
      Number(
        formData.get(
          "width"
        )
      );

    const length =
      Number(
        formData.get(
          "length"
        )
      );

    if (
      !(roomPhoto instanceof File)
    ) {
      return NextResponse.json(
        {
          message:
            "Завантажте фото кімнати.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      roomPhoto.size === 0 ||
      roomPhoto.size >
        MAX_ROOM_PHOTO_SIZE
    ) {
      return NextResponse.json(
        {
          message:
            "Фото кімнати повинно бути менше 12 МБ.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !roomPhoto.type.startsWith(
        "image/"
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Файл кімнати повинен бути зображенням.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !Number.isInteger(
        productId
      )
    ) {
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

    const products =
      await getAllProducts();

    const product =
      products.find(
        (item) =>
          item.id ===
          productId
      );

    if (!product) {
      return NextResponse.json(
        {
          message:
            "Товар не знайдено.",
        },
        {
          status: 404,
        }
      );
    }

    const productImage =
      product.images?.[0];

    if (!productImage) {
      return NextResponse.json(
        {
          message:
            "У вибраного товару немає фото для AI-примірки.",
        },
        {
          status: 400,
        }
      );
    }

    const roomBytes =
      Buffer.from(
        await roomPhoto.arrayBuffer()
      );

    const carpet =
      await getProductImage(
        productImage
      );

    const roomFile =
      await toFile(
        roomBytes,
        roomPhoto.name ||
          "room.jpg",
        {
          type:
            roomPhoto.type ||
            "image/jpeg",
        }
      );

    const carpetFile =
      await toFile(
        carpet.bytes,
        carpet.fileName,
        {
          type:
            carpet.mimeType,
        }
      );

    const widthText =
      Number.isFinite(width) &&
      width > 0
        ? `${width} m`
        : "the selected width";

    const lengthText =
      Number.isFinite(length) &&
      length > 0
        ? `${length} m`
        : "the selected length";

    const selectedColor =
      color ||
      product.colors?.[0] ||
      "the same color as the carpet reference";

    const prompt = `
The first image is the customer's real room.
The second image is the exact carpet reference.

Create a photorealistic interior visualization by placing the carpet from the second image naturally on the floor of the first image.

Critical requirements:
- Preserve the customer's room, walls, furniture, doors, windows, lighting, camera angle, perspective, floor, and architecture.
- Do not redesign the room.
- Do not remove or add furniture unless absolutely necessary for physically realistic carpet placement.
- Preserve the carpet's pattern, colors, texture, border, proportions, and visual identity as closely as possible to the reference.
- Selected carpet color: ${selectedColor}.
- Requested carpet size: approximately ${widthText} wide by ${lengthText} long.
- Scale the carpet realistically relative to the room and floor perspective.
- Keep the carpet flat on the floor with realistic contact shadows and lighting.
- Do not add text, labels, watermarks, people, or extra rugs.
- The result should look like a realistic customer preview, not an advertising render.

Product name: ${product.name}.
`.trim();

    const openai =
      new OpenAI({
        apiKey:
          process.env
            .OPENAI_API_KEY,
      });

    const response =
      await openai.images.edit({
        model:
          process.env
            .OPENAI_IMAGE_MODEL ||
          "gpt-image-2",
        image: [
          roomFile,
          carpetFile,
        ],
        prompt,
        size: "auto",
        quality: "medium",
        output_format: "jpeg",
        output_compression: 88,
      });

    const imageBase64 =
      response.data?.[0]
        ?.b64_json;

    if (!imageBase64) {
      return NextResponse.json(
        {
          message:
            "AI не повернув готове зображення.",
        },
        {
          status: 502,
        }
      );
    }

    return NextResponse.json({
      success: true,
      image:
        `data:image/jpeg;base64,${imageBase64}`,
    });
  } catch (error) {
    console.error(
      "Room try-on error:",
      error
    );

    const message =
      error instanceof Error
        ? error.message
        : "Не вдалося створити AI-примірку.";

    return NextResponse.json(
      {
        message,
      },
      {
        status: 500,
      }
    );
  }
}