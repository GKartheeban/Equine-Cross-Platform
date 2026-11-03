"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, ImagePlus, Star, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { mediaUrl } from "@/lib/media";
import { optionLabel } from "@/lib/market-format";
import { photoPathsOf, type DetailValue } from "@/lib/market-shape";
import { sections, todayInIndia, type FieldDef, type PriceUnit, type SectionKey } from "@/lib/market-sections";
import { savePost, PostError, type PostProgress } from "@/lib/submit-post";
import { districts } from "@/lib/sample-data";

const MAX_PHOTOS = 8;
const inputClass =
  "h-12 w-full rounded-xl border bg-background px-3.5 text-base transition outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[invalid=true]:border-destructive";

type Photo = { id: string; file: File | null; url: string; path?: string };

type Form = {
  title: string;
  description: string;
  district: string;
  town: string;
  priceUnit: PriceUnit;
  price: string;
  startsOn: string;
  endsOn: string;
  /** Field values as typed: numbers as text, yes/no as "yes"/"no"/"" */
  details: Record<string, string | string[]>;
  photos: Photo[];
};

type Errors = Partial<Record<string, string>>;

let photoCounter = 0;
const newPhotoId = () => `p${Date.now()}-${++photoCounter}`;

/** Form to post (or edit, with `postId`) a transport / event / job / shop / farm / stud ad. */
export function MarketPostForm({ section, postId }: { section: SectionKey; postId?: string }) {
  const def = sections[section];
  const router = useRouter();
  const m = useTranslations("market");
  const o = useTranslations("options");
  const fileInput = useRef<HTMLInputElement>(null);

  const [ready, setReady] = useState(false);
  const [form, setForm] = useState<Form>({
    title: "",
    description: "",
    district: "",
    town: "",
    priceUnit: def.priceUnits[0],
    price: "",
    startsOn: "",
    endsOn: "",
    details: {},
    photos: [],
  });
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<{ s: "idle" } | { s: "working"; text: string } | { s: "done"; slug: string } | { s: "error"; text: string }>({
    s: "idle",
  });

  // Must be logged in; when editing, load the post
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const here = postId ? `/sell/post/${section}?edit=${postId}` : `/sell/post/${section}`;
      if (!session) {
        router.replace(`/login?next=${encodeURIComponent(here)}`);
        return;
      }
      if (postId) {
        const { data } = await supabase
          .from("market_posts")
          .select("section, status, title, description, district, town, price_inr, price_unit, details, media, starts_on, ends_on")
          .eq("id", postId)
          .eq("owner_id", session.user.id)
          .maybeSingle();
        if (!data || data.section !== section || data.status === "removed") {
          setState({ s: "error", text: m("form.errNotFound") });
        } else {
          const details: Record<string, string | string[]> = {};
          for (const f of def.fields) {
            const v = (data.details ?? {})[f.key] as DetailValue | undefined;
            if (v === undefined || v === null) continue;
            details[f.key] = f.type === "yesno" ? (v ? "yes" : "no") : Array.isArray(v) ? v : String(v);
          }
          setForm({
            title: data.title,
            description: data.description ?? "",
            district: data.district,
            town: data.town,
            priceUnit: data.price_unit,
            price: data.price_inr === null ? "" : String(data.price_inr),
            startsOn: data.starts_on ?? "",
            endsOn: data.ends_on ?? "",
            details,
            photos: photoPathsOf(data.media).map((path) => ({ id: newPhotoId(), file: null, url: mediaUrl(path), path })),
          });
        }
      }
      setReady(true);
    })();
  }, [postId, section, router, def.fields, m]);

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));
  const setDetail = (key: string, value: string | string[]) => setForm((f) => ({ ...f, details: { ...f.details, [key]: value } }));

  function addPhotos(files: FileList | null) {
    if (!files) return;
    const room = MAX_PHOTOS - form.photos.length;
    const picked = Array.from(files)
      .filter((f) => f.type.startsWith("image/") || /\.(jpe?g|png|webp|heic|heif)$/i.test(f.name))
      .slice(0, Math.max(0, room))
      .map((file) => ({ id: newPhotoId(), file, url: URL.createObjectURL(file) }));
    set("photos", [...form.photos, ...picked]);
  }

  function removePhoto(id: string) {
    const p = form.photos.find((x) => x.id === id);
    if (p?.file) URL.revokeObjectURL(p.url);
    set(
      "photos",
      form.photos.filter((x) => x.id !== id),
    );
  }

  function validate(): Errors {
    const e: Errors = {};
    if (form.title.trim().length < 3) e.title = m("form.errTitle");
    for (const f of def.fields) {
      const v = form.details[f.key];
      const empty = v === undefined || v === "" || (Array.isArray(v) && v.length === 0);
      if (f.required && empty) e[f.key] = m("form.errRequired");
      if (f.type === "number" && !empty) {
        const n = Number(v);
        if (!Number.isFinite(n) || n < f.min || n > f.max) e[f.key] = m("form.errNumber", { min: f.min, max: f.max });
      }
    }
    if (def.dated) {
      if (!form.startsOn) e.startsOn = m("form.errRequired");
      else if (!postId && form.startsOn < todayInIndia()) e.startsOn = m("form.errPastDate");
      if (form.endsOn && form.startsOn && form.endsOn < form.startsOn) e.endsOn = m("form.errEndDate");
    }
    const needsAmount = form.priceUnit !== "free" && form.priceUnit !== "ask";
    if (needsAmount) {
      const p = Number(form.price);
      if (!form.price || !Number.isFinite(p) || p < 0 || p > 100_000_000) e.price = m("form.errPrice");
    }
    if (!form.district) e.district = m("form.errRequired");
    if (form.town.trim().length < 2) e.town = m("form.errRequired");
    if (form.photos.length < def.minPhotos) e.photos = m("form.photosRequired", { count: def.minPhotos });
    return e;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      document.getElementById(`f-${Object.keys(e)[0]}`)?.focus();
      return;
    }

    // Field values in their stored form: numbers as numbers, yes/no as true/false
    const details: Record<string, DetailValue> = {};
    for (const f of def.fields) {
      const v = form.details[f.key];
      if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) continue;
      if (f.type === "number") details[f.key] = Number(v);
      else if (f.type === "yesno") details[f.key] = v === "yes";
      else if (f.type === "text") details[f.key] = String(v).trim();
      else details[f.key] = v;
    }

    const progress = (p: PostProgress) =>
      setState({ s: "working", text: p.key === "uploading" ? m("form.uploading", { n: p.n, total: p.total }) : m("form.saving") });
    setState({ s: "working", text: m("form.posting") });
    try {
      const slug = await savePost(
        {
          section,
          title: form.title,
          description: form.description,
          district: form.district,
          town: form.town,
          priceInr: form.price === "" ? null : Math.round(Number(form.price)),
          priceUnit: form.priceUnit,
          details,
          startsOn: def.dated ? form.startsOn || null : null,
          endsOn: def.dated ? form.endsOn || null : null,
          photos: form.photos.map((p) => ({ file: p.file, path: p.path })),
        },
        progress,
        postId,
      );
      setState({ s: "done", slug });
      window.scrollTo({ top: 0 });
    } catch (err) {
      setState({ s: "error", text: m(`form.${err instanceof PostError ? err.key : "errSave"}`) });
    }
  }

  if (!ready) return <p className="mt-8 text-sm text-muted-foreground">…</p>;

  if (state.s === "done") {
    return (
      <div className="mt-8 flex flex-col items-center rounded-2xl border bg-card p-8 text-center shadow-sm">
        <span aria-hidden className="flex size-14 items-center justify-center rounded-full bg-green-100 text-green-700 ring-8 ring-green-50">
          <Check className="size-7" strokeWidth={2.5} />
        </span>
        <h2 className="mt-5 text-xl font-semibold tracking-tight">{postId ? m("form.doneSaved") : m("form.doneTitle")}</h2>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link href={`${def.path}/${state.slug}`} className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
            {m("form.view")}
          </Link>
          <Link href="/sell/listings" className="rounded-lg border px-4 py-2.5 text-sm hover:bg-muted">
            {m("form.myListings")}
          </Link>
          <Link href="/sell" className="rounded-lg border px-4 py-2.5 text-sm hover:bg-muted">
            {m("form.postAnother")}
          </Link>
        </div>
      </div>
    );
  }

  if (state.s === "error" && !form.title && postId) {
    return <p className="mt-6 rounded-xl border border-destructive p-4 text-sm text-destructive">{state.text}</p>;
  }

  const working = state.s === "working";
  const needsAmount = form.priceUnit !== "free" && form.priceUnit !== "ask";

  return (
    <form onSubmit={submit} noValidate className="mt-8 grid gap-6 rounded-2xl border bg-card p-5 shadow-sm sm:p-8">
      <Field id="title" label={m("form.title")} error={errors.title} hint={m(`sections.${section}.titleHint`)}>
        <input
          id="f-title"
          value={form.title}
          maxLength={100}
          onChange={(e) => set("title", e.target.value)}
          aria-invalid={!!errors.title}
          className={inputClass}
        />
      </Field>

      {def.dated && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field id="startsOn" label={m("form.startsOn")} error={errors.startsOn}>
            <input
              id="f-startsOn"
              type="date"
              value={form.startsOn}
              min={postId ? undefined : todayInIndia()}
              onChange={(e) => set("startsOn", e.target.value)}
              aria-invalid={!!errors.startsOn}
              className={inputClass}
            />
          </Field>
          <Field id="endsOn" label={m("form.endsOn")} error={errors.endsOn}>
            <input
              id="f-endsOn"
              type="date"
              value={form.endsOn}
              min={form.startsOn || undefined}
              onChange={(e) => set("endsOn", e.target.value)}
              aria-invalid={!!errors.endsOn}
              className={inputClass}
            />
          </Field>
        </div>
      )}

      {def.fields.map((f) => (
        <DetailField key={f.key} def={f} value={form.details[f.key]} onChange={(v) => setDetail(f.key, v)} error={errors[f.key]} m={m} o={o} />
      ))}

      {/* Price */}
      <fieldset className="grid gap-3">
        <legend className="mb-1.5 text-sm font-medium">{m("form.priceType")}</legend>
        {def.priceUnits.length > 1 && (
          <div className="flex flex-wrap gap-2">
            {def.priceUnits.map((u) => (
              <button
                key={u}
                type="button"
                aria-pressed={form.priceUnit === u}
                onClick={() => set("priceUnit", u)}
                className={`rounded-full border px-4 py-2 text-sm ${form.priceUnit === u ? "border-primary bg-primary/10 font-medium text-primary" : "hover:bg-muted"}`}
              >
                {m(`unitChoice.${u}`)}
              </button>
            ))}
          </div>
        )}
        {needsAmount && (
          <Field id="price" label={m("form.price")} error={errors.price}>
            <input
              id="f-price"
              type="number"
              inputMode="numeric"
              min={0}
              value={form.price}
              onChange={(e) => set("price", e.target.value)}
              aria-invalid={!!errors.price}
              className={inputClass}
            />
          </Field>
        )}
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field id="district" label={m("form.district")} error={errors.district}>
          <select
            id="f-district"
            value={form.district}
            onChange={(e) => set("district", e.target.value)}
            aria-invalid={!!errors.district}
            className={inputClass}
          >
            <option value="">{m("form.chooseDistrict")}</option>
            {districts.map((d) => (
              <option key={d.slug} value={d.name}>
                {o(`district.${d.slug}`)}
              </option>
            ))}
          </select>
        </Field>
        <Field id="town" label={m("form.town")} error={errors.town}>
          <input
            id="f-town"
            value={form.town}
            maxLength={60}
            onChange={(e) => set("town", e.target.value)}
            aria-invalid={!!errors.town}
            className={inputClass}
          />
        </Field>
      </div>

      {/* Photos */}
      <div className="grid gap-2">
        <p className="text-sm font-medium" id="f-photos" tabIndex={-1}>
          {m("form.photos")}
        </p>
        <p className="text-xs text-muted-foreground">{m("form.photosHint")}</p>
        {form.photos.length > 0 && (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {form.photos.map((p, i) => (
              <li key={p.id} className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element -- local preview of the poster's own photo */}
                <img src={p.url} alt="" className="size-full object-cover" />
                {i === 0 && (
                  <span className="absolute left-1.5 top-1.5 inline-flex items-center rounded-full bg-background/95 p-1 text-primary shadow-sm">
                    <Star className="size-3 fill-current" aria-hidden />
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removePhoto(p.id)}
                  aria-label={m("form.removePhoto")}
                  className="absolute right-1.5 top-1.5 flex size-7 items-center justify-center rounded-full bg-background/95 shadow-sm transition hover:bg-background"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
        {form.photos.length < MAX_PHOTOS && (
          <>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={(e) => {
                addPhotos(e.target.files);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              className="flex h-24 flex-col items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed text-sm font-medium text-muted-foreground transition hover:border-primary/40 hover:bg-primary/[0.03] hover:text-primary"
            >
              <ImagePlus className="size-6" strokeWidth={1.5} aria-hidden />
              <span>
                {m("form.addPhotos")} <span className="tabular-nums">({form.photos.length}/{MAX_PHOTOS})</span>
              </span>
            </button>
          </>
        )}
        {errors.photos && <p className="text-sm text-destructive">{errors.photos}</p>}
      </div>

      <Field id="description" label={m("form.description")} hint={m("form.descriptionHint")}>
        <textarea
          id="f-description"
          value={form.description}
          maxLength={2000}
          rows={5}
          onChange={(e) => set("description", e.target.value)}
          className="w-full rounded-xl border bg-background px-3.5 py-2.5 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
      </Field>

      {state.s === "error" && (
        <p role="alert" className="rounded-lg border border-destructive p-3 text-sm text-destructive">
          {state.text}
        </p>
      )}

      <button
        type="submit"
        disabled={working}
        className="h-12 rounded-full bg-primary text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 hover:shadow-md disabled:opacity-60"
      >
        {working ? state.text : postId ? m("form.save") : m("form.submit")}
      </button>
    </form>
  );
}

type Tr = (key: string, values?: Record<string, string | number>) => string;

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={`f-${id}`} className="text-sm font-medium">
        {label}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

/** One section-specific field: dropdown, checkboxes, number, text or yes/no. */
function DetailField({
  def,
  value,
  onChange,
  error,
  m,
  o,
}: {
  def: FieldDef;
  value: string | string[] | undefined;
  onChange: (v: string | string[]) => void;
  error?: string;
  m: Tr;
  o: Tr;
}) {
  const label = m(`fields.${def.key}`);
  const hintKey = def.key === "areas" || def.key === "timing" ? m(`fields.${def.key}Hint`) : undefined;

  if (def.type === "select") {
    return (
      <Field id={def.key} label={label} error={error}>
        <select
          id={`f-${def.key}`}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          className={inputClass}
        >
          <option value="">{m("form.choose")}</option>
          {def.options.map((v) => (
            <option key={v} value={v}>
              {optionLabel(v, m, o)}
            </option>
          ))}
        </select>
      </Field>
    );
  }

  if (def.type === "multi") {
    const list = Array.isArray(value) ? value : [];
    return (
      <fieldset className="grid gap-1.5">
        <legend id={`f-${def.key}`} tabIndex={-1} className="mb-1.5 text-sm font-medium">
          {label}
        </legend>
        <div className="flex flex-wrap gap-2">
          {def.options.map((v) => {
            const on = list.includes(v);
            return (
              <label
                key={v}
                className={`flex cursor-pointer items-center gap-2 rounded-full border px-3 py-2 text-sm ${on ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"}`}
              >
                <input
                  type="checkbox"
                  className="size-4"
                  checked={on}
                  onChange={() => onChange(on ? list.filter((x) => x !== v) : [...list, v])}
                />
                {optionLabel(v, m, o)}
              </label>
            );
          })}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </fieldset>
    );
  }

  if (def.type === "yesno") {
    const v = typeof value === "string" ? value : "";
    return (
      <fieldset className="grid gap-1.5">
        <legend id={`f-${def.key}`} tabIndex={-1} className="mb-1.5 text-sm font-medium">
          {label}
        </legend>
        <div className="grid max-w-xs grid-cols-2 gap-2">
          {(["yes", "no"] as const).map((x) => (
            <button
              key={x}
              type="button"
              aria-pressed={v === x}
              onClick={() => onChange(v === x ? "" : x)}
              className={`h-11 rounded-lg border text-sm font-medium ${v === x ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"}`}
            >
              {m(`form.${x}`)}
            </button>
          ))}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
      </fieldset>
    );
  }

  if (def.type === "number") {
    return (
      <Field id={def.key} label={label} error={error}>
        <input
          id={`f-${def.key}`}
          type="number"
          inputMode="numeric"
          min={def.min}
          max={def.max}
          value={typeof value === "string" ? value : ""}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={!!error}
          className={inputClass}
        />
      </Field>
    );
  }

  return (
    <Field id={def.key} label={label} error={error} hint={hintKey}>
      <input
        id={`f-${def.key}`}
        value={typeof value === "string" ? value : ""}
        maxLength={def.max}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        className={inputClass}
      />
    </Field>
  );
}
