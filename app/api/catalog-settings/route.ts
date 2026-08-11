import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export const runtime = "nodejs";

const settingsFile = path.join(
  process.cwd(),
  "database",
  "catalog-settings.json"
);

type CatalogItem = {
  value: string;
  label: string;
  active: boolean;
};

type CatalogSettings = {
  categories: CatalogItem[];
  bases: CatalogItem[];
};

async function readSettings(): Promise<CatalogSettings> {
  const content = await fs.readFile(settingsFile, "utf8");
  return JSON.parse(content) as CatalogSettings;
}

async function writeSettings(settings: CatalogSettings) {
  await fs.writeFile(
    settingsFile,
    JSON.stringify(settings, null, 2),
    "utf8"
  );
}

export async function GET() {
  try {
    const settings = await readSettings();
    return NextResponse.json(settings);
  } catch {
    return NextResponse.json(
      { message: "Не вдалося завантажити налаштування каталогу" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = (await request.json()) as CatalogSettings;

    if (
      !Array.isArray(body.categories) ||
      !Array.isArray(body.bases)
    ) {
      return NextResponse.json(
        { message: "Неправильні дані" },
        { status: 400 }
      );
    }

    await writeSettings(body);

    return NextResponse.json({
      message: "Налаштування збережено",
    });
  } catch {
    return NextResponse.json(
      { message: "Не вдалося зберегти налаштування" },
      { status: 500 }
    );
  }
}