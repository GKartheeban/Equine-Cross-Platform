"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Camera } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { setLanguageCookie } from "@/components/language-switch";
import { dateLocale } from "@/lib/labels";
import { createClient } from "@/lib/supabase/client";
import { districts } from "@/lib/sample-data";
import { AccountSecurity } from "./account-security";

const inputClass =
  "h-12 w-full rounded-lg border bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring";

export function ProfileForm() {
  const router = useRouter();
  const t = useTranslations("profile");
  const o = useTranslations("options");
  const tc = useTranslations("common");
  const locale = useLocale();
  const [userId, setUserId] = useState<string | null>(null);
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");
  const [district, setDistrict] = useState("");
  // Starts with the language the site is showing now (the header switch can change it too)
  const [language, setLanguage] = useState<"en" | "ta">(locale === "ta" ? "ta" : "en");
  const [savedName, setSavedName] = useState("");
  const [nameChangedAt, setNameChangedAt] = useState<string | null>(null);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);
  const [avatarBusy, setAvatarBusy] = useState(false);
  const [avatarError, setAvatarError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace("/login?next=/account/profile");
        return;
      }
      setUserId(session.user.id);
      const digits = (session.user.phone ?? "").replace(/\D/g, "");
      const local = digits.length === 12 ? digits.slice(2) : digits;
      setPhone(local.length === 10 ? `+91 ${local.slice(0, 5)} ${local.slice(5)}` : "");

      const { data } = await supabase
        .from("profiles")
        .select("full_name, district, language, avatar_path, name_changed_at")
        .eq("id", session.user.id)
        .maybeSingle();
      if (data) {
        setName(data.full_name ?? "");
        setSavedName(data.full_name ?? "");
        setNameChangedAt(data.name_changed_at ?? null);
        setAvatarPath(data.avatar_path ?? null);
        setDistrict(data.district ?? "");
      }
      setLoading(false);
    })();
  }, [router]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!userId) return;
    setBusy(true);
    setMessage(null);
    const { error } = await createClient()
      .from("profiles")
      .upsert({ id: userId, full_name: name.trim() || null, district: district || null, language });
    setBusy(false);
    if (error) {
      const limit = error.message.includes("NAME_LIMIT");
      setMessage({ ok: false, text: limit ? t("errNameLimit") : t("errSave") });
      return;
    }
    if (name.trim() !== savedName && savedName) setNameChangedAt(new Date().toISOString());
    setSavedName(name.trim());
    setMessage({ ok: true, text: t("saved") });
    // Switch the whole site to the chosen language
    if (language !== locale) {
      setLanguageCookie(language);
      router.refresh();
    }
  }

  // Profile photo: cropped to a square and shrunk on the phone (about 30–60 KB)
  async function pickPhoto(file: File | undefined) {
    if (!file || !userId) return;
    setAvatarError("");
    if (!file.type.startsWith("image/")) return setAvatarError(t("errPhotoType"));
    setAvatarBusy(true);
    try {
      const blob = await squarePhoto(file, 400);
      const supabase = createClient();
      const path = `${userId}/photo-${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage
        .from("avatars")
        .upload(path, blob, { contentType: "image/jpeg", cacheControl: "31536000", upsert: false });
      if (upErr) throw upErr;
      const { error: saveErr } = await supabase.from("profiles").update({ avatar_path: path }).eq("id", userId);
      if (saveErr) throw saveErr;
      if (avatarPath) await supabase.storage.from("avatars").remove([avatarPath]);
      setAvatarPath(path);
    } catch {
      setAvatarError(t("errPhotoUpload"));
    } finally {
      setAvatarBusy(false);
    }
  }

  async function removePhoto() {
    if (!userId || !avatarPath) return;
    setAvatarBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("profiles").update({ avatar_path: null }).eq("id", userId);
    if (!error) {
      await supabase.storage.from("avatars").remove([avatarPath]);
      setAvatarPath(null);
    }
    setAvatarBusy(false);
  }

  const avatarUrl = avatarPath
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${avatarPath}`
    : null;
  const nextNameChange =
    savedName && nameChangedAt ? new Date(new Date(nameChangedAt).getTime() + 30 * 86_400_000) : null;
  const nameLocked = !!nextNameChange && nextNameChange > new Date();

  async function logout() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  if (loading) return <p className="mt-8 text-sm text-muted-foreground">{tc("loading")}</p>;

  return (
    <div className="mt-6">
      {/* Profile photo */}
      <div className="mb-6 flex items-center gap-4">
        <div className="relative size-20 shrink-0 overflow-hidden rounded-full bg-muted">
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- small profile photo
            <img src={avatarUrl} alt={t("photoAlt")} className="size-full object-cover" />
          ) : (
            <span className="flex size-full items-center justify-center text-2xl font-semibold text-muted-foreground">
              {(savedName || "?").charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="grid gap-1.5">
          <label className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-medium hover:bg-muted">
            <Camera className="size-4" aria-hidden />
            {avatarBusy ? t("uploading") : avatarUrl ? t("changePhoto") : t("addPhoto")}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              disabled={avatarBusy}
              onChange={(e) => {
                pickPhoto(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </label>
          {avatarUrl && !avatarBusy && (
            <button type="button" onClick={removePhoto} className="justify-self-start text-xs text-muted-foreground underline">
              {t("removePhoto")}
            </button>
          )}
          {avatarError && <p className="text-xs text-destructive">{avatarError}</p>}
        </div>
      </div>
      <p className="-mt-3 mb-6 text-xs text-muted-foreground">
        {t("photoHint")}
      </p>

      <form onSubmit={save} className="grid gap-5">
        <div className="grid gap-1.5">
          <span className="text-sm font-medium">{t("mobile")}</span>
          <p className="flex h-12 items-center rounded-lg border bg-muted px-3 text-base text-muted-foreground">
            {phone || "—"}
          </p>
          <p className="text-xs text-muted-foreground">
            {t("mobileHint")}
          </p>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="name" className="text-sm font-medium">{t("name")}</label>
          <input
            id="name"
            type="text"
            maxLength={60}
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("namePlaceholder")}
            disabled={nameLocked}
            className={`${inputClass} disabled:bg-muted disabled:text-muted-foreground`}
          />
          <p className="text-xs text-muted-foreground">
            {nameLocked && nextNameChange
              ? t("nameLocked", {
                  date: nextNameChange.toLocaleDateString(dateLocale(locale), { day: "numeric", month: "short", year: "numeric" }),
                })
              : savedName
                ? t("nameRule")
                : t("nameHint")}
          </p>
        </div>

        <div className="grid gap-1.5">
          <label htmlFor="district" className="text-sm font-medium">{t("district")}</label>
          <select id="district" value={district} onChange={(e) => setDistrict(e.target.value)} className={inputClass}>
            <option value="">{t("chooseDistrict")}</option>
            {districts.map((d) => (
              <option key={d.slug} value={d.name}>{o(`district.${d.slug}`)}</option>
            ))}
          </select>
        </div>

        <fieldset className="grid gap-1.5">
          <legend className="mb-1.5 text-sm font-medium">{t("language")}</legend>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["en", "English"],
                ["ta", "தமிழ்"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                aria-pressed={language === value}
                onClick={() => setLanguage(value)}
                className={`h-12 rounded-lg border text-sm font-medium ${
                  language === value ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"
                }`}
              >
                <span lang={value}>{label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">{t("languageHint")}</p>
        </fieldset>

        {message && (
          <p role="status" className={`text-sm ${message.ok ? "text-green-700" : "text-destructive"}`}>
            {message.text}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="h-12 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
        >
          {busy ? t("saving") : t("save")}
        </button>
      </form>

      <AccountSecurity />

      <Link
        href="/account/password"
        className="mt-8 flex h-12 w-full items-center justify-center rounded-lg border text-sm font-medium hover:bg-muted"
      >
        {t("changePassword")}
      </Link>

      <button
        type="button"
        onClick={logout}
        className="mt-3 w-full rounded-lg border px-4 py-3 text-sm text-destructive hover:bg-muted"
      >
        {t("logout")}
      </button>
    </div>
  );
}

/** Crops the middle square of a photo and resizes it (e.g. 400x400 JPEG). */
async function squarePhoto(file: File, size: number): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  canvas
    .getContext("2d")
    ?.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.85));
  if (!blob) throw new Error("photo");
  return blob;
}
