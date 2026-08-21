import fs from "fs/promises";
import path from "path";

import { supabaseAdmin } from "./supabaseAdmin";

export type CatalogSettingItem = {
  value: string;
  label: string;
  active: boolean;
  category?: string;
};

export type CatalogSettings = {
  categories: CatalogSettingItem[];
  bases: CatalogSettingItem[];
};

const SETTINGS_ID = 1;

const localSettingsFile = path.join(
  process.cwd(),
  "database",
  "catalog-settings.json"
);

async function readLocalSettings(): Promise<CatalogSettings> {
  try {
    const content = await fs.readFile(
      localSettingsFile,
      "utf8"
    );

    const parsed = JSON.parse(
      content
    ) as Partial<CatalogSettings>;

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

async function ensureSettingsExist() {
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

  const localSettings =
    await readLocalSettings();

  const { error: insertError } =
    await supabaseAdmin
      .from("catalog_settings")
      .insert({
        id: SETTINGS_ID,
        data: localSettings,
        updated_at:
          new Date().toISOString(),
      });

  if (insertError) {
    throw insertError;
  }
}

export async function getCatalogSettings(): Promise<CatalogSettings> {
  try {
    await ensureSettingsExist();

    const { data, error } =
      await supabaseAdmin
        .from("catalog_settings")
        .select("data")
        .eq("id", SETTINGS_ID)
        .single();

    if (error) {
      throw error;
    }

    const settings =
      (data?.data ??
        {}) as Partial<CatalogSettings>;

    return {
      categories:
        Array.isArray(settings.categories)
          ? settings.categories
          : [],
      bases:
        Array.isArray(settings.bases)
          ? settings.bases
          : [],
    };
  } catch (error) {
    console.error(
      "Supabase catalog settings error:",
      error
    );

    return readLocalSettings();
  }
}