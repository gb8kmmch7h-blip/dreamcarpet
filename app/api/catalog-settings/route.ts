import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

import { supabaseAdmin } from "../../../lib/supabaseAdmin";

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
  category?: string;
};

type CatalogSettings = {
  categories: CatalogItem[];
  bases: CatalogItem[];
};

const SETTINGS_ID = 1;

async function readLocalSettings(): Promise<CatalogSettings> {
  try {
    const content = await fs.readFile(
      settingsFile,
      "utf8"
    );

    const parsed = JSON.parse(content) as Partial<CatalogSettings>;

    return {
      categories: Array.isArray(parsed.categories)
        ? parsed.categories
        : [],
      bases: Array.isArray(parsed.bases)
        ? parsed.bases
        : [],
    };
  } catch {
    return {
      categories: [],
      bases: [],
    };
  }
}

async function ensureSettingsExist(): Promise<void> {
  const { data, error } = await supabaseAdmin
    .from("catalog_settings")
    .select("id")
    .eq("id", SETTINGS_ID)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (data) {
    return;
  }

  const localSettings = await readLocalSettings();

  const { error: insertError } = await supabaseAdmin
    .from("catalog_settings")
    .insert({
      id: SETTINGS_ID,
      data: localSettings,
      updated_at: new Date().toISOString(),
    });

  if (insertError) {
    throw insertError;
  }
}

async function readSettings(): Promise<CatalogSettings> {
  await ensureSettingsExist();

  const { data, error } = await supabaseAdmin
    .from("catalog_settings")
    .select("data")
    .eq("id", SETTINGS_ID)
    .single();

  if (error) {
    throw error;
  }

  const settings =
    (data?.data ?? {}) as Partial<CatalogSettings>;

  return {
    categories: Array.isArray(settings.categories)
      ? settings.categories
      : [],
    bases: Array.isArray(settings.bases)
      ? settings.bases
      : [],
  };
}

async function writeSettings(
  settings: CatalogSettings
): Promise<void> {
  const { error } = await supabaseAdmin
    .from("catalog_settings")
    .upsert(
      {
        id: SETTINGS_ID,
        data: settings,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      }
    );

  if (error) {
    throw error;
  }
}

function isValidCatalogItem(
  item: unknown
): item is CatalogItem {
  if (
    !item ||
    typeof item !== "object"
  ) {
    return false;
  }

  const record =
    item as Record<string, unknown>;

  return (
    typeof record.value === "string" &&
    record.value.trim().length > 0 &&
    typeof record.label === "string" &&
    record.label.trim().length > 0 &&
    typeof record.active === "boolean" &&
    (
      record.category === undefined ||
      typeof record.category === "string"
    )
  );
}

function normalizeSettings(
  body: CatalogSettings
): CatalogSettings {
  return {
    categories: body.categories.map(
      (item) => ({
        value: item.value.trim(),
        label: item.label.trim(),
        active: item.active,
      })
    ),

    bases: body.bases.map(
      (item) => ({
        value: item.value.trim(),
        label: item.label.trim(),
        active: item.active,
        ...(item.category
          ? {
              category:
                item.category.trim(),
            }
          : {}),
      })
    ),
  };
}

export async function GET() {
  try {
    const settings =
      await readSettings();

    return NextResponse.json(settings);
  } catch (error) {
    console.error(
      "GET catalog settings error:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Не вдалося завантажити налаштування каталогу",
      },
      {
        status: 500,
      }
    );
  }
}

export async function PUT(
  request: Request
) {
  try {
    const body =
      (await request.json()) as CatalogSettings;

    if (
      !body ||
      !Array.isArray(body.categories) ||
      !Array.isArray(body.bases)
    ) {
      return NextResponse.json(
        {
          message:
            "Неправильні дані",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !body.categories.every(
        isValidCatalogItem
      ) ||
      !body.bases.every(
        isValidCatalogItem
      )
    ) {
      return NextResponse.json(
        {
          message:
            "Категорії або основи мають неправильний формат",
        },
        {
          status: 400,
        }
      );
    }

    const settings =
      normalizeSettings(body);

    await writeSettings(settings);

    return NextResponse.json({
      message:
        "Налаштування збережено",
      settings,
    });
  } catch (error) {
    console.error(
      "PUT catalog settings error:",
      error
    );

    return NextResponse.json(
      {
        message:
          error instanceof Error
            ? error.message
            : "Не вдалося зберегти налаштування",
      },
      {
        status: 500,
      }
    );
  }
}