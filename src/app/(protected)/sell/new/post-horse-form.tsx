"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import { submitListing, updateListing } from "@/lib/submit-listing";
import { canPrepareVideo, prepareVideo, readVideoDuration } from "@/lib/prepare-video";
import { AppError, type MessageValues } from "@/lib/app-error";
import { breedSlug, districtSlug, optionKey } from "@/lib/labels";
import { breeds, districts, formatInr } from "@/lib/sample-data";
import {
  genders,
  limits,
  mediaRules,
  handlerExperience,
  trainingLevels,
  type MediaKind,
} from "@/lib/horse-options";
import { MediaGallery } from "@/components/media-gallery";

/* ---------- Form data ---------- */

// A photo/video/certificate: a new file picked on the phone (file), or one already
// saved for this listing (file = null, path = where it is in storage).
export type Media = { file: File | null; url: string; path?: string };

/** One photo or video in the form (id is only for the page, not saved) */
export type FormMedia = Media & { id: string; type: MediaKind; seconds?: number };

let mediaCounter = 0;
export const newMediaId = () => `m${Date.now()}-${++mediaCounter}`;

// Some phones don't label files, so the file name is checked too
const isVideoFile = (f: File) => f.type.startsWith("video/") || /\.(mp4|mov|3gp|webm|mkv|m4v)$/i.test(f.name);

export type ListingFormData = {
  breed: string;
  gender: string;
  ageYears: string;
  heightInches: string;
  colour: string;
  markings: string;
  /** Photos and videos in the order added (first photo = cover) */
  media: FormMedia[];
  vaccinated: "" | "yes" | "no";
  vetCertificate: Media | null;
  /** Ticked training boxes, e.g. ["Ridden", "Cart"] */
  trainingLevels: string[];
  handlerExperience: string;
  pregnant: "" | "yes" | "no";
  priceInr: string;
  negotiable: boolean;
  district: string;
  town: string;
  description: string;
};

const empty: ListingFormData = {
  breed: "", gender: "", ageYears: "", heightInches: "", colour: "", markings: "",
  media: [],
  vaccinated: "", vetCertificate: null, trainingLevels: [], handlerExperience: "", pregnant: "",
  priceInr: "", negotiable: true, district: "", town: "", description: "",
};

// Step names live in messages (sell.steps.*)
const steps = ["details", "media", "health", "price", "preview"] as const;

type Errors = Partial<Record<string, string>>;

type Translate = ReturnType<typeof useTranslations>;

/** Turns an AppError (or anything else) into text in the visitor's language */
function errorText(t: Translate, err: unknown) {
  return err instanceof AppError ? t(`errors.${err.key}`, err.values) : t("errors.generic");
}

/** Shows stored English values (breed, gender, district…) in the visitor's language */
function useOptionLabels() {
  const o = useTranslations("options");
  return {
    breed: (v: string) => (breedSlug(v) ? o(`breed.${breedSlug(v)}`) : v),
    gender: (v: string) => (v ? o(`gender.${optionKey(v)}`) : v),
    training: (v: string) => (v ? o(`training.${optionKey(v)}`) : v),
    handler: (v: string) => (v ? o(`handler.${optionKey(v)}`) : v),
    district: (v: string) => (districtSlug(v) ? o(`district.${districtSlug(v)}`) : v),
  };
}

/* ---------- Validation for each step ---------- */

function validate(step: number, d: ListingFormData, t: Translate): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!d.breed) e.breed = t("errors.breed");
    if (!d.gender) e.gender = t("errors.gender");
    const age = Number(d.ageYears);
    if (!d.ageYears || age < 0 || age > 40) e.ageYears = t("errors.age");
    const h = Number(d.heightInches);
    if (!d.heightInches || h < 30 || h > 80) e.heightInches = t("errors.height");
    if (!d.colour.trim()) e.colour = t("errors.colour");
  }
  if (step === 1) {
    // Any mix is fine, but at least 2 photos or 1 video
    const photos = d.media.filter((m) => m.type === "photo").length;
    const videos = d.media.filter((m) => m.type === "video").length;
    if (videos < 1 && photos < mediaRules.minPhotosWithoutVideo) e.media = t("errors.mediaMin");
  }
  if (step === 2) {
    if (!d.vaccinated) e.vaccinated = t("errors.yesNo");
    if (d.trainingLevels.length === 0) e.trainingLevels = t("errors.training");
    if (!d.handlerExperience) e.handlerExperience = t("errors.handler");
    if (d.gender === "Mare" && !d.pregnant) e.pregnant = t("errors.yesNo");
  }
  if (step === 3) {
    const p = Number(d.priceInr);
    if (!d.priceInr || p < 1000) e.priceInr = t("errors.price");
    if (!d.district) e.district = t("errors.district");
    if (!d.town.trim()) e.town = t("errors.town");
  }
  return e;
}

/* ---------- Main form ---------- */

/** The 6-step listing form. Pass `edit` to change an existing listing instead of posting a new one. */
export function PostHorseForm({ edit }: { edit?: { listingId: string; initial: ListingFormData } } = {}) {
  const router = useRouter();
  const t = useTranslations("sell");
  const [checkingLogin, setCheckingLogin] = useState(true);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<ListingFormData>(edit?.initial ?? empty);
  // True while a video is being checked, trimmed or prepared on the media step
  const [mediaBusy, setMediaBusy] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [submitState, setSubmitState] = useState<
    | { status: "idle" }
    | { status: "working"; key: string; values?: MessageValues }
    | { status: "done"; slug: string }
    | { status: "error"; message: string }
  >({ status: "idle" });

  // Only logged-in users can post. Others go to Login and come back here.
  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => {
        if (!session) router.replace(`/login?next=${edit ? `/sell/listings/${edit.listingId}/edit` : "/sell/new"}`);
        else setCheckingLogin(false);
      });
  }, [router, edit]);

  const set = <K extends keyof ListingFormData>(key: K, value: ListingFormData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  function next() {
    const e = validate(step, data, t);
    if (step === 1 && mediaBusy) e.media = t("errors.mediaBusy");
    setErrors(e);
    if (Object.keys(e).length > 0) {
      document.querySelector("[data-error]")?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    setStep((s) => s + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function back() {
    setErrors({});
    setStep((s) => s - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (checkingLogin) {
    return <p className="mt-8 text-sm text-muted-foreground">{t("checkingLogin")}</p>;
  }

  async function submit() {
    setSubmitState({ status: "working", key: edit ? "savingChanges" : "start" });
    try {
      const fields = {
        breed: data.breed,
        gender: data.gender,
        ageYears: Number(data.ageYears),
        heightInches: Number(data.heightInches),
        colour: data.colour.trim(),
        markings: data.markings,
        vaccinated: data.vaccinated === "yes",
        trainingLevels: data.trainingLevels,
        handlerExperience: data.handlerExperience,
        pregnant: data.gender === "Mare" ? data.pregnant === "yes" : null,
        priceInr: Number(data.priceInr),
        negotiable: data.negotiable,
        district: data.district,
        town: data.town,
        description: data.description,
      };
      const onProgress = (key: string, values?: MessageValues) => setSubmitState({ status: "working", key, values });
      const draftMedia = data.media.map((m) => ({ type: m.type, file: m.file, path: m.path, seconds: m.seconds }));

      if (edit) {
        const slug = await updateListing(
          edit.listingId,
          { ...fields, media: draftMedia, vetCertificate: data.vetCertificate },
          onProgress,
        );
        setSubmitState({ status: "done", slug });
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      const slug = await submitListing(
        { ...fields, media: draftMedia, vetCertificate: data.vetCertificate?.file ?? null },
        onProgress,
      );
      setSubmitState({ status: "done", slug });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitState({ status: "error", message: errorText(t, err) });
    }
  }

  if (submitState.status === "done") {
    return (
      <div className="mt-8 rounded-xl border p-6 text-center">
        <p className="text-3xl" aria-hidden>✓</p>
        <p className="mt-2 text-lg font-semibold">{edit ? t("done.savedTitle") : t("done.liveTitle")}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {edit ? t("done.savedText") : t("done.liveText")}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link href={`/horses/${submitState.slug}`} className="rounded-lg border px-4 py-2.5 text-sm hover:bg-muted">
            {t("done.viewListing")}
          </Link>
          <Link href="/sell/listings" className="rounded-lg border px-4 py-2.5 text-sm hover:bg-muted">
            {t("done.myListings")}
          </Link>
          <Link href="/" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
            {t("done.goHome")}
          </Link>
        </div>
      </div>
    );
  }

  const working = submitState.status === "working";

  return (
    <div className="mt-6">
      <Progress step={step} />

      <div className="mt-6">
        {step === 0 && <DetailsStep data={data} set={set} errors={errors} />}
        {step === 1 && <MediaStep data={data} setData={setData} errors={errors} setErrors={setErrors} onBusyChange={setMediaBusy} />}
        {step === 2 && <HealthStep data={data} set={set} errors={errors} />}
        {step === 3 && <PriceStep data={data} set={set} errors={errors} />}
        {step === 4 && <PreviewStep data={data} goTo={setStep} />}
      </div>

      {working && (
        <p role="status" className="mt-6 rounded-xl border p-4 text-sm font-medium">
          {t(`progress.${submitState.key}`, submitState.values)}
        </p>
      )}
      {submitState.status === "error" && (
        <p role="alert" className="mt-6 rounded-xl border border-destructive p-4 text-sm text-destructive">
          {submitState.message}
        </p>
      )}

      {/* Back / Next: fixed to the bottom on phones */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 px-4 py-3 backdrop-blur sm:static sm:mt-8 sm:border-0 sm:bg-transparent sm:p-0">
        <div className="mx-auto flex max-w-2xl gap-3">
          {step > 0 && (
            <button type="button" onClick={back} disabled={working} className="h-12 rounded-lg border px-5 text-sm font-medium hover:bg-muted disabled:opacity-50">
              {t("back")}
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="h-12 flex-1 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {t("next", { step: t(`steps.${steps[step + 1]}`) })}
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={working}
              className="h-12 flex-1 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {working
                ? edit ? t("saving") : t("uploading")
                : submitState.status === "error" ? t("tryAgain") : edit ? t("saveChanges") : t("submit")}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Progress bar ---------- */

function Progress({ step }: { step: number }) {
  const t = useTranslations("sell");
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <p className="font-medium">{t(`steps.${steps[step]}`)}</p>
        <p className="text-muted-foreground">{t("stepOf", { n: step + 1, total: steps.length })}</p>
      </div>
      <div className="mt-2 flex gap-1" aria-hidden>
        {steps.map((s, i) => (
          <div key={s} className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-primary" : "bg-muted"}`} />
        ))}
      </div>
    </div>
  );
}

/* ---------- Shared field pieces ---------- */

type SetFn = <K extends keyof ListingFormData>(key: K, value: ListingFormData[K]) => void;
type StepProps = { data: ListingFormData; set: SetFn; errors: Errors };

const inputClass =
  "h-12 w-full rounded-lg border bg-background px-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive";

function Field({
  id, label, hint, error, children,
}: { id: string; label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-sm font-medium">{label}</label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p data-error className="text-sm text-destructive">{error}</p>}
    </div>
  );
}

function Select({
  id, value, onChange, options, placeholder, error,
}: {
  id: string; value: string; onChange: (v: string) => void;
  options: readonly string[] | { value: string; label: string }[]; placeholder: string; error?: string;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-invalid={!!error}
      className={inputClass}
    >
      <option value="">{placeholder}</option>
      {options.map((o) =>
        typeof o === "string" ? (
          <option key={o} value={o}>{o}</option>
        ) : (
          <option key={o.value} value={o.value}>{o.label}</option>
        ),
      )}
    </select>
  );
}

function YesNo({
  id, value, onChange, error,
}: { id: string; value: string; onChange: (v: "yes" | "no") => void; error?: string }) {
  const tc = useTranslations("common");
  return (
    <div id={id} role="radiogroup" className="grid grid-cols-2 gap-2">
      {(["yes", "no"] as const).map((v) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={`h-12 rounded-lg border text-sm font-medium ${
            value === v ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"
          } ${error ? "border-destructive" : ""}`}
        >
          {tc(v)}
        </button>
      ))}
    </div>
  );
}

/* ---------- Step 1: details ---------- */

function DetailsStep({ data, set, errors }: StepProps) {
  const t = useTranslations("sell.fields");
  const label = useOptionLabels();
  return (
    <div className="grid gap-5">
      <Field id="breed" label={t("breed")} error={errors.breed}>
        <Select
          id="breed" value={data.breed} onChange={(v) => set("breed", v)} error={errors.breed}
          placeholder={t("chooseBreed")}
          options={[...breeds.map((b) => b.name), "Other"].map((v) => ({ value: v, label: label.breed(v) }))}
        />
      </Field>
      <Field id="gender" label={t("gender")} error={errors.gender}>
        <Select
          id="gender" value={data.gender} onChange={(v) => set("gender", v)} error={errors.gender}
          placeholder={t("chooseGender")} options={genders.map((v) => ({ value: v, label: label.gender(v) }))}
        />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field id="age" label={t("age")} error={errors.ageYears}>
          <input
            id="age" type="number" inputMode="numeric" min={0} max={40} value={data.ageYears}
            onChange={(e) => set("ageYears", e.target.value)} aria-invalid={!!errors.ageYears} className={inputClass}
          />
        </Field>
        <Field id="height" label={t("height")} hint={t("heightHint")} error={errors.heightInches}>
          <input
            id="height" type="number" inputMode="numeric" min={30} max={80} value={data.heightInches}
            onChange={(e) => set("heightInches", e.target.value)} aria-invalid={!!errors.heightInches} className={inputClass}
          />
        </Field>
      </div>
      <Field id="colour" label={t("colour")} hint={t("colourHint")} error={errors.colour}>
        <input
          id="colour" type="text" maxLength={40} value={data.colour}
          onChange={(e) => set("colour", e.target.value)} aria-invalid={!!errors.colour} className={inputClass}
        />
      </Field>
      <Field id="markings" label={t("markings")} hint={t("markingsHint")}>
        <input
          id="markings" type="text" maxLength={120} value={data.markings}
          onChange={(e) => set("markings", e.target.value)} className={inputClass}
        />
      </Field>
    </div>
  );
}

/* ---------- Step 2: photos & videos (one page) ---------- */

// A picked video longer than 20 seconds, waiting for the seller to choose which part to keep
type Pending = { file: File; url: string; duration: number; start: number };

/**
 * Any mix of photos and videos: up to 8 photos and 2 videos (10 files).
 * Sellers can pick them all in one go. Photos are added straight away; each video is
 * checked in turn (longer than 20 seconds -> choose which part to keep; big -> shrunk).
 * The first photo is the cover.
 */
function MediaStep({
  data, setData, errors, setErrors, onBusyChange,
}: {
  data: ListingFormData;
  setData: React.Dispatch<React.SetStateAction<ListingFormData>>;
  errors: Errors;
  setErrors: React.Dispatch<React.SetStateAction<Errors>>;
  onBusyChange: (busy: boolean) => void;
}) {
  const t = useTranslations("sell");
  const tm = useTranslations("sell.media");
  const tv = useTranslations("sell.video");
  const max = limits.videoSeconds;
  const [queue, setQueue] = useState<File[]>([]); // videos waiting to be checked
  const [reading, setReading] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const [preparing, setPreparing] = useState<number | null>(null); // progress 0–1
  const [notes, setNotes] = useState<string[]>([]);
  const previewRef = useRef<HTMLVideoElement>(null);

  const photos = data.media.filter((m) => m.type === "photo").length;
  const videos = data.media.filter((m) => m.type === "video").length;
  const working = reading || pending !== null || preparing !== null; // one video in progress
  const busy = working || queue.length > 0;
  const full = photos >= mediaRules.maxPhotos && videos + queue.length + (working ? 1 : 0) >= mediaRules.maxVideos;

  useEffect(() => onBusyChange(busy), [busy, onBusyChange]);

  const addNote = useCallback((n: string) => setNotes((all) => [...all, n]), []);

  function addVideo(file: File, seconds: number, url: string) {
    setData((d) => ({
      ...d,
      media: [...d.media, { id: newMediaId(), type: "video", file, url, seconds: Math.round(seconds) }],
    }));
    setErrors((e) => ({ ...e, media: undefined }));
  }

  /** Files chosen with the button: photos go in now, videos join the queue. */
  function pickMany(files: FileList | null) {
    if (!files?.length) return;
    setNotes([]);
    setErrors((e) => ({ ...e, media: undefined }));
    const all = Array.from(files);
    const vids = all.filter(isVideoFile);
    const pics = all.filter((f) => !isVideoFile(f));

    // Photos
    const photoRoom = mediaRules.maxPhotos - photos;
    const added: FormMedia[] = [];
    let extraPhotos = 0;
    for (const f of pics) {
      if (!f.type.startsWith("image/")) {
        addNote(t("errors.notMedia", { name: f.name }));
      } else if (f.size > limits.photoMb * 1024 * 1024) {
        addNote(t("errors.photoTooBig", { mb: limits.photoMb }));
      } else if (added.length >= photoRoom) {
        extraPhotos++;
      } else {
        added.push({ id: newMediaId(), type: "photo", file: f, url: URL.createObjectURL(f) });
      }
    }
    if (added.length) setData((d) => ({ ...d, media: [...d.media, ...added] }));
    if (extraPhotos) addNote(tm("limitPhotos", { max: mediaRules.maxPhotos, count: extraPhotos }));

    // Videos
    const videoRoom = mediaRules.maxVideos - videos - queue.length - (working ? 1 : 0);
    const accepted = vids.slice(0, Math.max(0, videoRoom));
    if (vids.length > accepted.length) {
      addNote(tm("limitVideos", { max: mediaRules.maxVideos, count: vids.length - accepted.length }));
    }
    if (accepted.length) setQueue((q) => [...q, ...accepted]);
  }

  // Check the next waiting video when nothing else is in progress
  useEffect(() => {
    if (working || queue.length === 0) return;
    const [nextVideo, ...rest] = queue;
    setQueue(rest);
    void processVideo(nextVideo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, working]);

  async function processVideo(file: File) {
    setReading(true);
    const url = URL.createObjectURL(file);
    let duration = 0;
    try {
      duration = await readVideoDuration(url);
    } catch (err) {
      setReading(false);
      URL.revokeObjectURL(url);
      return addNote(errorText(t, err));
    }
    const tooLong = duration > max + 0.5;
    const tooBig = file.size > limits.videoUploadMb * 1024 * 1024;

    if (!canPrepareVideo()) {
      // Older browsers can't shorten videos, so the seller must record a short one
      setReading(false);
      if (tooLong) {
        URL.revokeObjectURL(url);
        return addNote(t("errors.videoTooLong", { seconds: Math.round(duration), max }));
      }
      if (tooBig) {
        URL.revokeObjectURL(url);
        return addNote(t("errors.videoTooBig"));
      }
      return addVideo(file, duration, url);
    }

    if (tooLong) {
      // Let the seller choose which 20 seconds to keep
      setPending({ file, url, duration, start: 0 });
      setReading(false);
      return;
    }
    if (file.size > limits.videoKeepAsIsMb * 1024 * 1024) {
      // Short but big: shrink it so it uploads quickly
      setReading(false);
      return runPrepare(url, 0, duration);
    }
    setReading(false);
    addVideo(file, duration, url);
  }

  async function runPrepare(sourceUrl: string, start: number, length: number) {
    setPreparing(0);
    try {
      const result = await prepareVideo(sourceUrl, start, length, setPreparing);
      URL.revokeObjectURL(sourceUrl);
      setPending(null);
      addVideo(result.file, result.seconds, URL.createObjectURL(result.file));
    } catch (err) {
      addNote(errorText(t, err));
      setPending(null);
    } finally {
      setPreparing(null);
    }
  }

  function skipPending() {
    if (pending) URL.revokeObjectURL(pending.url);
    setPending(null);
  }

  function remove(id: string) {
    setData((d) => {
      const m = d.media.find((x) => x.id === id);
      if (m?.file) URL.revokeObjectURL(m.url);
      return { ...d, media: d.media.filter((x) => x.id !== id) };
    });
  }

  // Keep the trimming preview inside the chosen 20 seconds
  function onPreviewTime() {
    const v = previewRef.current;
    if (v && pending && v.currentTime >= pending.start + max) v.currentTime = pending.start;
  }

  const coverId = (data.media.find((m) => m.type === "photo") ?? data.media.find((m) => m.type === "video"))?.id;

  const picker = (
    <input
      type="file"
      accept="image/*,video/*"
      multiple
      className="sr-only"
      disabled={full}
      onChange={(e) => {
        pickMany(e.target.files);
        e.target.value = ""; // allow picking the same files again
      }}
    />
  );

  return (
    <div className="grid gap-5">
      {/* One button for everything */}
      <div className="rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 p-4 text-center">
        <p className="text-sm font-medium">{tm("title")}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {tm("intro", { photos: mediaRules.maxPhotos, videos: mediaRules.maxVideos, seconds: max })}
        </p>
        <label
          className={`mt-3 inline-flex h-12 items-center justify-center rounded-lg px-5 text-sm font-medium ${
            full ? "cursor-not-allowed bg-muted text-muted-foreground" : "cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
          }`}
        >
          + {data.media.length ? tm("addMore") : tm("pickAll")}
          {picker}
        </label>
        <p className="mt-3 text-xs font-medium tabular-nums">
          {tm("status", { photos, maxPhotos: mediaRules.maxPhotos, videos, maxVideos: mediaRules.maxVideos })}
        </p>
        {full && <p className="mt-1 text-xs text-muted-foreground">{tm("full")}</p>}
      </div>

      {notes.length > 0 && (
        <ul className="grid gap-1 rounded-lg border border-destructive/40 bg-destructive/5 p-3 text-xs text-destructive">
          {notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      )}
      {errors.media && <p data-error className="text-sm text-destructive">{errors.media}</p>}

      {/* Choosing which 20 seconds to keep */}
      {pending && preparing === null && (
        <div className="grid gap-3 rounded-xl border p-4">
          <p className="text-sm">
            {tv.rich("tooLong", {
              seconds: Math.round(pending.duration),
              max,
              b: (c) => <span className="font-medium">{c}</span>,
            })}
          </p>
          <video
            ref={previewRef}
            src={pending.url}
            muted
            playsInline
            autoPlay
            onTimeUpdate={onPreviewTime}
            onEnded={() => previewRef.current && (previewRef.current.currentTime = pending.start)}
            className="aspect-video w-full rounded-lg bg-black"
          />
          <label htmlFor="video-start" className="text-sm font-medium">
            {tv("keepRange", {
              from: formatTime(pending.start),
              to: formatTime(Math.min(pending.start + max, pending.duration)),
            })}
          </label>
          <input
            id="video-start"
            type="range"
            min={0}
            max={Math.max(0, Math.floor(pending.duration - max))}
            step={1}
            value={pending.start}
            onChange={(e) => {
              const start = Number(e.target.value);
              setPending({ ...pending, start });
              if (previewRef.current) {
                previewRef.current.currentTime = start;
                previewRef.current.play().catch(() => {});
              }
            }}
            className="w-full accent-[var(--primary)]"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={skipPending}
              className="h-12 rounded-lg border px-4 text-sm font-medium hover:bg-muted"
            >
              {tm("skipVideo")}
            </button>
            <button
              type="button"
              onClick={() => runPrepare(pending.url, pending.start, max)}
              className="h-12 flex-1 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              {tv("useSeconds", { max })}
            </button>
          </div>
        </div>
      )}

      {/* Preparing (shortening / shrinking) */}
      {preparing !== null && (
        <div role="status" className="rounded-xl border p-4">
          <p className="text-sm font-medium">{tv("preparing", { percent: Math.round(preparing * 100) })}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">{tv("preparingHint", { max })}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-[width]" style={{ width: `${preparing * 100}%` }} />
          </div>
        </div>
      )}
      {reading && <p className="text-sm text-muted-foreground">{tv("checking")}</p>}
      {queue.length > 0 && <p className="text-xs text-muted-foreground">{tm("waiting", { count: queue.length })}</p>}

      {/* Everything added so far, in order */}
      {data.media.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {data.media.map((m) => (
            <li key={m.id} className="relative aspect-square overflow-hidden rounded-xl border bg-muted">
              {m.type === "photo" ? (
                // eslint-disable-next-line @next/next/no-img-element -- local preview of the seller's own file
                <img src={m.url} alt="" className="size-full object-cover" />
              ) : (
                <video src={`${m.url}#t=0.1`} muted playsInline preload="metadata" className="size-full bg-black object-cover" />
              )}
              {m.id === coverId && (
                <span className="absolute left-1.5 top-1.5 rounded-md bg-primary px-2 py-0.5 text-[11px] font-medium text-primary-foreground">
                  {tm("cover")}
                </span>
              )}
              {m.type === "video" && (
                <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/65 px-2 py-0.5 text-[11px] text-white">
                  ▶ {m.seconds ?? "?"}s
                </span>
              )}
              <button
                type="button"
                onClick={() => remove(m.id)}
                aria-label={tm("remove")}
                className="absolute right-1.5 top-1.5 flex size-8 items-center justify-center rounded-full bg-black/60 text-sm text-white hover:bg-black/80"
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Tips */}
      <div className="rounded-xl bg-muted p-4 text-sm">
        <p className="font-medium">{tm("tipsTitle")}</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted-foreground">
          <li>{tm("tip1")}</li>
          <li>{tm("tip2")}</li>
          <li>{tm("tip3", { max })}</li>
        </ul>
      </div>
    </div>
  );
}

/** Ticks or unticks one training box. "Untrained" and the others exclude each other. */
function toggleTraining(current: string[], value: string): string[] {
  if (current.includes(value)) return current.filter((v) => v !== value);
  if (value === "Untrained") return ["Untrained"];
  return [...current.filter((v) => v !== "Untrained"), value];
}

function formatTime(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/* ---------- Step 4: health & training ---------- */

function HealthStep({ data, set, errors }: StepProps) {
  const t = useTranslations("sell.fields");
  const label = useOptionLabels();
  return (
    <div className="grid gap-5">
      <Field id="vaccinated" label={t("vaccinated")} error={errors.vaccinated}>
        <YesNo id="vaccinated" value={data.vaccinated} onChange={(v) => set("vaccinated", v)} error={errors.vaccinated} />
      </Field>

      <Field id="vet" label={t("vet")} hint={t("vetHint")}>
        <label className="flex h-12 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed px-3 text-sm hover:border-primary">
          <span className="truncate">{data.vetCertificate ? `✓ ${data.vetCertificate.file?.name ?? t("vetOnFile")}` : `+ ${t("vetUpload")}`}</span>
          <input
            id="vet" type="file" accept="image/*,application/pdf" className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) set("vetCertificate", { file, url: URL.createObjectURL(file) });
            }}
          />
        </label>
      </Field>

      <fieldset className="grid gap-1.5">
        <legend className="mb-1.5 text-sm font-medium">{t("training")}</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {trainingLevels.map((v) => {
            const checked = data.trainingLevels.includes(v);
            return (
              <label
                key={v}
                className={`flex h-12 cursor-pointer items-center gap-3 rounded-lg border px-3 text-sm ${
                  checked ? "border-primary bg-primary/10 font-medium text-primary" : "hover:bg-muted"
                } ${errors.trainingLevels ? "border-destructive" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => set("trainingLevels", toggleTraining(data.trainingLevels, v))}
                  className="size-5 accent-[var(--primary)]"
                />
                {label.training(v)}
              </label>
            );
          })}
        </div>
        {errors.trainingLevels ? (
          <p data-error className="text-sm text-destructive">{errors.trainingLevels}</p>
        ) : (
          <p className="text-xs text-muted-foreground">{t("trainingHint")}</p>
        )}
      </fieldset>

      <Field id="handler" label={t("handler")} error={errors.handlerExperience}>
        <Select
          id="handler" value={data.handlerExperience} onChange={(v) => set("handlerExperience", v)} error={errors.handlerExperience}
          placeholder={t("chooseHandler")} options={handlerExperience.map((v) => ({ value: v, label: label.handler(v) }))}
        />
      </Field>

      {data.gender === "Mare" && (
        <Field id="pregnant" label={t("pregnant")} error={errors.pregnant}>
          <YesNo id="pregnant" value={data.pregnant} onChange={(v) => set("pregnant", v)} error={errors.pregnant} />
        </Field>
      )}
    </div>
  );
}

/* ---------- Step 5: price & location ---------- */

function PriceStep({ data, set, errors }: StepProps) {
  const t = useTranslations("sell.fields");
  const label = useOptionLabels();
  return (
    <div className="grid gap-5">
      <Field
        id="price" label={t("price")} error={errors.priceInr}
        hint={data.priceInr && Number(data.priceInr) >= 1000 ? formatInr(Number(data.priceInr)) : undefined}
      >
        <input
          id="price" type="text" inputMode="numeric" value={data.priceInr}
          onChange={(e) => set("priceInr", e.target.value.replace(/\D/g, "").slice(0, 9))}
          aria-invalid={!!errors.priceInr} className={inputClass} placeholder={t("pricePlaceholder")}
        />
      </Field>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox" checked={data.negotiable} onChange={(e) => set("negotiable", e.target.checked)}
          className="size-5 accent-[var(--primary)]"
        />
        {t("negotiable")}
      </label>

      <Field id="district" label={t("district")} error={errors.district}>
        <Select
          id="district" value={data.district} onChange={(v) => set("district", v)} error={errors.district}
          placeholder={t("chooseDistrict")} options={districts.map((d) => ({ value: d.name, label: label.district(d.name) }))}
        />
      </Field>

      <Field id="town" label={t("town")} error={errors.town}>
        <input
          id="town" type="text" maxLength={60} value={data.town}
          onChange={(e) => set("town", e.target.value)} aria-invalid={!!errors.town} className={inputClass}
        />
      </Field>

      <Field
        id="description" label={t("about")} error={errors.description}
        hint={t("aboutHint", { count: data.description.length, max: limits.descriptionChars })}
      >
        <textarea
          id="description" rows={5} maxLength={limits.descriptionChars} value={data.description}
          onChange={(e) => set("description", e.target.value)} aria-invalid={!!errors.description}
          className="w-full rounded-lg border bg-background p-3 text-base outline-none focus-visible:ring-2 focus-visible:ring-ring aria-invalid:border-destructive"
        />
      </Field>
    </div>
  );
}

/* ---------- Step 6: preview ---------- */

function PreviewStep({ data, goTo }: { data: ListingFormData; goTo: (step: number) => void }) {
  const t = useTranslations("sell.preview");
  const td = useTranslations("detail");
  const tc = useTranslations("common");
  const label = useOptionLabels();
  const yesNo = (v: string) => (v === "yes" ? tc("yes") : tc("no"));
  const rows: [string, string, number][] = [
    [td("breed"), label.breed(data.breed), 0],
    [td("gender"), label.gender(data.gender), 0],
    [td("age"), tc("yearsLong", { count: Number(data.ageYears) }), 0],
    [td("height"), tc("inches", { count: Number(data.heightInches) }), 0],
    [td("colour"), data.colour, 0],
    [td("markings"), data.markings || "—", 0],
    [td("vaccinated"), yesNo(data.vaccinated), 2],
    [td("vetCertificate"), data.vetCertificate ? t("uploaded") : td("notProvided"), 2],
    [td("training"), data.trainingLevels.map(label.training).join(", "), 2],
    [td("handler"), label.handler(data.handlerExperience), 2],
    ...(data.gender === "Mare" ? [[td("pregnant"), yesNo(data.pregnant), 2] as [string, string, number]] : []),
    [t("location"), `${data.town}, ${label.district(data.district)}`, 3],
  ];

  return (
    <div>
      <p className="text-sm text-muted-foreground">{t("intro")}</p>

      <div className="mt-4">
        <MediaGallery
          items={data.media.map((m) => ({ type: m.type, url: m.url, seconds: m.seconds }))}
          alt={`${label.breed(data.breed)} ${label.gender(data.gender)}`}
          labels={{ photo: t("photo"), video: t("video"), noMedia: t("noPhoto"), previous: t("previous"), next: t("next") }}
        />
      </div>
      <button type="button" onClick={() => goTo(1)} className="mt-2 text-sm text-primary hover:underline">
        {t("editMedia")}
      </button>

      <h2 className="mt-6 text-2xl font-semibold">{label.breed(data.breed)} {label.gender(data.gender).toLowerCase()}</h2>
      <p className="mt-1 text-2xl font-semibold">
        {formatInr(Number(data.priceInr))}
        <span className="ml-2 align-middle text-sm font-normal text-muted-foreground">
          {data.negotiable ? tc("negotiable") : tc("fixedPrice")}
        </span>
      </p>

      <dl className="mt-4 border-t text-sm">
        {rows.map(([label, value, stepIndex]) => (
          <div key={label} className="flex items-center justify-between gap-4 border-b py-2.5">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="flex items-center gap-3 text-right font-medium">
              {value}
              <button type="button" onClick={() => goTo(stepIndex)} className="text-xs font-normal text-primary hover:underline">
                {t("edit")}
              </button>
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <h3 className="font-semibold">{t("about")}</h3>
          <button type="button" onClick={() => goTo(3)} className="text-xs text-primary hover:underline">{t("edit")}</button>
        </div>
        {data.description.trim() ? (
          <p className="mt-1 whitespace-pre-line leading-relaxed">{data.description}</p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">{t("aboutEmpty")}</p>
        )}
      </div>

      <p className="mt-6 rounded-xl bg-muted p-4 text-xs leading-relaxed text-muted-foreground">
        {t("rules")}
      </p>
    </div>
  );
}
