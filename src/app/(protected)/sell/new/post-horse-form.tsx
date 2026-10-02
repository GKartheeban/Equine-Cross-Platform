"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { submitListing } from "@/lib/submit-listing";
import { canPrepareVideo, prepareVideo, readVideoDuration } from "@/lib/prepare-video";
import { breeds, districts, formatInr } from "@/lib/sample-data";
import {
  genders,
  limits,
  photoSlots,
  handlerExperience,
  trainingLevels,
  type PhotoKey,
} from "@/lib/horse-options";

/* ---------- Form data ---------- */

type Media = { file: File; url: string };

type FormData = {
  breed: string;
  gender: string;
  ageYears: string;
  heightInches: string;
  colour: string;
  markings: string;
  photos: Partial<Record<PhotoKey, Media>>;
  video: (Media & { seconds: number }) | null;
  vaccinated: "" | "yes" | "no";
  vetCertificate: Media | null;
  trainingLevel: string;
  handlerExperience: string;
  pregnant: "" | "yes" | "no";
  priceInr: string;
  negotiable: boolean;
  district: string;
  town: string;
  description: string;
};

const empty: FormData = {
  breed: "", gender: "", ageYears: "", heightInches: "", colour: "", markings: "",
  photos: {}, video: null,
  vaccinated: "", vetCertificate: null, trainingLevel: "", handlerExperience: "", pregnant: "",
  priceInr: "", negotiable: true, district: "", town: "", description: "",
};

const steps = ["Horse details", "Photos", "Walking video", "Health & training", "Price & location", "Preview"] as const;

type Errors = Partial<Record<string, string>>;

/* ---------- Validation for each step ---------- */

function validate(step: number, d: FormData): Errors {
  const e: Errors = {};
  if (step === 0) {
    if (!d.breed) e.breed = "Choose the breed.";
    if (!d.gender) e.gender = "Choose the gender.";
    const age = Number(d.ageYears);
    if (!d.ageYears || age < 0 || age > 40) e.ageYears = "Enter age in years (0–40).";
    const h = Number(d.heightInches);
    if (!d.heightInches || h < 30 || h > 80) e.heightInches = "Enter height in inches (30–80).";
    if (!d.colour.trim()) e.colour = "Enter the colour.";
  }
  if (step === 1) {
    for (const slot of photoSlots) {
      if (!d.photos[slot.key]) e[`photo-${slot.key}`] = "Required";
    }
  }
  if (step === 2) {
    if (!d.video) e.video = "Add a walking video. Buyers trust listings with video much more.";
  }
  if (step === 3) {
    if (!d.vaccinated) e.vaccinated = "Choose yes or no.";
    if (!d.trainingLevel) e.trainingLevel = "Choose the training level.";
    if (!d.handlerExperience) e.handlerExperience = "Choose the handler's experience.";
    if (d.gender === "Mare" && !d.pregnant) e.pregnant = "Choose yes or no.";
  }
  if (step === 4) {
    const p = Number(d.priceInr);
    if (!d.priceInr || p < 1000) e.priceInr = "Enter the price in rupees.";
    if (!d.district) e.district = "Choose the district.";
    if (!d.town.trim()) e.town = "Enter the town or village.";
  }
  return e;
}

/* ---------- Main form ---------- */

export function PostHorseForm() {
  const router = useRouter();
  const [checkingLogin, setCheckingLogin] = useState(true);
  const [step, setStep] = useState(0);
  const [data, setData] = useState<FormData>(empty);
  const [errors, setErrors] = useState<Errors>({});
  const [submitState, setSubmitState] = useState<
    | { status: "idle" }
    | { status: "working"; message: string }
    | { status: "done"; slug: string }
    | { status: "error"; message: string }
  >({ status: "idle" });

  // Only logged-in users can post. Others go to Login and come back here.
  useEffect(() => {
    createClient()
      .auth.getSession()
      .then(({ data: { session } }) => {
        if (!session) router.replace("/login?next=/sell/new");
        else setCheckingLogin(false);
      });
  }, [router]);

  const set = <K extends keyof FormData>(key: K, value: FormData[K]) => {
    setData((d) => ({ ...d, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };

  function next() {
    const e = validate(step, data);
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
    return <p className="mt-8 text-sm text-muted-foreground">Checking your login…</p>;
  }

  async function submit() {
    setSubmitState({ status: "working", message: "Starting upload…" });
    try {
      const photos = Object.fromEntries(
        Object.entries(data.photos).map(([k, m]) => [k, m!.file]),
      );
      const slug = await submitListing(
        {
          breed: data.breed,
          gender: data.gender,
          ageYears: Number(data.ageYears),
          heightInches: Number(data.heightInches),
          colour: data.colour.trim(),
          markings: data.markings,
          photos,
          video: data.video ? { file: data.video.file, seconds: data.video.seconds } : null,
          vaccinated: data.vaccinated === "yes",
          vetCertificate: data.vetCertificate?.file ?? null,
          trainingLevel: data.trainingLevel,
          handlerExperience: data.handlerExperience,
          pregnant: data.gender === "Mare" ? data.pregnant === "yes" : null,
          priceInr: Number(data.priceInr),
          negotiable: data.negotiable,
          district: data.district,
          town: data.town,
          description: data.description,
        },
        (message) => setSubmitState({ status: "working", message }),
      );
      setSubmitState({ status: "done", slug });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      setSubmitState({
        status: "error",
        message: err instanceof Error ? err.message : "Something went wrong. Please try again.",
      });
    }
  }

  if (submitState.status === "done") {
    return (
      <div className="mt-8 rounded-xl border p-6 text-center">
        <p className="text-3xl" aria-hidden>✓</p>
        <p className="mt-2 text-lg font-semibold">Submitted. Waiting for approval</p>
        <p className="mt-2 text-sm text-muted-foreground">
          We check every listing before it goes live, usually within a day.
          You can see its status under Account → My listings.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          <Link href="/sell/listings" className="rounded-lg border px-4 py-2.5 text-sm hover:bg-muted">
            My listings
          </Link>
          <Link href="/" className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground">
            Go to Home
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
        {step === 1 && <PhotosStep data={data} setData={setData} errors={errors} setErrors={setErrors} />}
        {step === 2 && <VideoStep data={data} set={set} errors={errors} setErrors={setErrors} />}
        {step === 3 && <HealthStep data={data} set={set} errors={errors} />}
        {step === 4 && <PriceStep data={data} set={set} errors={errors} />}
        {step === 5 && <PreviewStep data={data} goTo={setStep} />}
      </div>

      {working && (
        <p role="status" className="mt-6 rounded-xl border p-4 text-sm font-medium">
          {submitState.message}
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
              Back
            </button>
          )}
          {step < steps.length - 1 ? (
            <button
              type="button"
              onClick={next}
              className="h-12 flex-1 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Next: {steps[step + 1]}
            </button>
          ) : (
            <button
              type="button"
              onClick={submit}
              disabled={working}
              className="h-12 flex-1 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
            >
              {working ? "Uploading…" : submitState.status === "error" ? "Try again" : "Submit listing"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ---------- Progress bar ---------- */

function Progress({ step }: { step: number }) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <p className="font-medium">{steps[step]}</p>
        <p className="text-muted-foreground">Step {step + 1} of {steps.length}</p>
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

type SetFn = <K extends keyof FormData>(key: K, value: FormData[K]) => void;
type StepProps = { data: FormData; set: SetFn; errors: Errors };

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
  return (
    <div id={id} role="radiogroup" className="grid grid-cols-2 gap-2">
      {(["yes", "no"] as const).map((v) => (
        <button
          key={v}
          type="button"
          role="radio"
          aria-checked={value === v}
          onClick={() => onChange(v)}
          className={`h-12 rounded-lg border text-sm font-medium capitalize ${
            value === v ? "border-primary bg-primary/10 text-primary" : "hover:bg-muted"
          } ${error ? "border-destructive" : ""}`}
        >
          {v}
        </button>
      ))}
    </div>
  );
}

/* ---------- Step 1: details ---------- */

function DetailsStep({ data, set, errors }: StepProps) {
  return (
    <div className="grid gap-5">
      <Field id="breed" label="Breed" error={errors.breed}>
        <Select
          id="breed" value={data.breed} onChange={(v) => set("breed", v)} error={errors.breed}
          placeholder="Choose breed"
          options={[...breeds.map((b) => ({ value: b.name, label: b.name })), { value: "Other", label: "Other" }]}
        />
      </Field>
      <Field id="gender" label="Gender" error={errors.gender}>
        <Select id="gender" value={data.gender} onChange={(v) => set("gender", v)} options={genders} placeholder="Choose gender" error={errors.gender} />
      </Field>
      <div className="grid grid-cols-2 gap-4">
        <Field id="age" label="Age (years)" error={errors.ageYears}>
          <input
            id="age" type="number" inputMode="numeric" min={0} max={40} value={data.ageYears}
            onChange={(e) => set("ageYears", e.target.value)} aria-invalid={!!errors.ageYears} className={inputClass}
          />
        </Field>
        <Field id="height" label="Height (inches)" hint="Ground to withers" error={errors.heightInches}>
          <input
            id="height" type="number" inputMode="numeric" min={30} max={80} value={data.heightInches}
            onChange={(e) => set("heightInches", e.target.value)} aria-invalid={!!errors.heightInches} className={inputClass}
          />
        </Field>
      </div>
      <Field id="colour" label="Colour" hint="Tamil or English, e.g. Bay, black, karuppu, sivappu" error={errors.colour}>
        <input
          id="colour" type="text" maxLength={40} value={data.colour}
          onChange={(e) => set("colour", e.target.value)} aria-invalid={!!errors.colour} className={inputClass}
        />
      </Field>
      <Field id="markings" label="Markings / suzhi (optional)" hint="e.g. white star on forehead, white socks on hind legs">
        <input
          id="markings" type="text" maxLength={120} value={data.markings}
          onChange={(e) => set("markings", e.target.value)} className={inputClass}
        />
      </Field>
    </div>
  );
}

/* ---------- Step 2: photos ---------- */

function PhotosStep({
  data, setData, errors, setErrors,
}: {
  data: FormData;
  setData: React.Dispatch<React.SetStateAction<FormData>>;
  errors: Errors;
  setErrors: React.Dispatch<React.SetStateAction<Errors>>;
}) {
  function pick(key: PhotoKey, file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors((e) => ({ ...e, [`photo-${key}`]: "Choose a photo file." }));
      return;
    }
    if (file.size > limits.photoMb * 1024 * 1024) {
      setErrors((e) => ({ ...e, [`photo-${key}`]: `Photo must be under ${limits.photoMb} MB.` }));
      return;
    }
    setData((d) => {
      const old = d.photos[key];
      if (old) URL.revokeObjectURL(old.url);
      return { ...d, photos: { ...d.photos, [key]: { file, url: URL.createObjectURL(file) } } };
    });
    setErrors((e) => ({ ...e, [`photo-${key}`]: undefined }));
  }

  const missing = photoSlots.some((s) => errors[`photo-${s.key}`]);

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        Take each photo in daylight with the whole horse in frame. Tap a box to use the camera or gallery.
      </p>
      {missing && (
        <p data-error className="mt-3 text-sm text-destructive">Add all 5 photos to continue.</p>
      )}
      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {photoSlots.map((slot, i) => {
          const photo = data.photos[slot.key];
          const error = errors[`photo-${slot.key}`];
          return (
            <li key={slot.key}>
              <label
                className={`relative flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed text-center ${
                  error ? "border-destructive" : photo ? "border-transparent" : "hover:border-primary"
                }`}
              >
                {photo ? (
                  // eslint-disable-next-line @next/next/no-img-element -- local preview of the seller's own file
                  <img src={photo.url} alt={slot.label} className="absolute inset-0 size-full object-cover" />
                ) : (
                  <span className="px-2">
                    <span className="block text-2xl text-muted-foreground" aria-hidden>+</span>
                    <span className="block text-sm font-medium">{slot.label}</span>
                    <span className="mt-0.5 block text-[11px] leading-tight text-muted-foreground">{slot.hint}</span>
                  </span>
                )}
                {photo && (
                  <span className="absolute inset-x-0 bottom-0 bg-black/55 py-1 text-xs text-white">
                    {slot.label}{i === 0 ? " · cover" : ""} · tap to change
                  </span>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => pick(slot.key, e.target.files?.[0])}
                />
              </label>
              {error && error !== "Required" && <p className="mt-1 text-xs text-destructive">{error}</p>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ---------- Step 3: walking video ---------- */

// A picked video that is too long and waits for the seller to choose 20 seconds
type Pending = { file: File; url: string; duration: number; start: number };

function VideoStep({
  data, set, errors, setErrors,
}: StepProps & { setErrors: React.Dispatch<React.SetStateAction<Errors>> }) {
  const max = limits.videoSeconds;
  const [reading, setReading] = useState(false);
  const [pending, setPending] = useState<Pending | null>(null);
  const [preparing, setPreparing] = useState<number | null>(null); // progress 0–1
  const previewRef = useRef<HTMLVideoElement>(null);

  const showError = (message: string) => setErrors((e) => ({ ...e, video: message }));

  async function pick(file: File | undefined) {
    if (!file) return;
    if (!file.type.startsWith("video/")) return showError("Choose a video file.");
    setErrors((e) => ({ ...e, video: undefined }));
    if (pending) URL.revokeObjectURL(pending.url);
    setPending(null);

    setReading(true);
    const url = URL.createObjectURL(file);
    let duration = 0;
    try {
      duration = await readVideoDuration(url);
    } catch (err) {
      setReading(false);
      URL.revokeObjectURL(url);
      return showError(err instanceof Error ? err.message : "This video can't be played.");
    }
    setReading(false);

    const tooLong = duration > max + 0.5;
    const tooBig = file.size > limits.videoUploadMb * 1024 * 1024;

    if (!canPrepareVideo()) {
      // Older browsers can't shorten videos, so the seller must record a short one
      URL.revokeObjectURL(url);
      if (tooLong) return showError(`This video is ${Math.round(duration)} seconds. Please record a new video of ${max} seconds or less.`);
      if (tooBig) return showError("This video file is too large. Please record a shorter or lower-quality video.");
      return accept({ file, seconds: Math.round(duration) }, url);
    }

    if (tooLong) {
      // Let the seller choose which 20 seconds to keep
      setPending({ file, url, duration, start: 0 });
      return;
    }
    // Short enough: shrink it only if the file is big
    if (file.size > limits.videoKeepAsIsMb * 1024 * 1024) {
      return runPrepare(url, 0, duration);
    }
    accept({ file, seconds: Math.round(duration) }, url);
  }

  function accept(video: { file: File; seconds: number }, url: string) {
    if (data.video) URL.revokeObjectURL(data.video.url);
    set("video", { ...video, url });
  }

  async function runPrepare(sourceUrl: string, start: number, length: number) {
    setPreparing(0);
    try {
      const result = await prepareVideo(sourceUrl, start, length, setPreparing);
      URL.revokeObjectURL(sourceUrl);
      setPending(null);
      accept(result, URL.createObjectURL(result.file));
    } catch (err) {
      showError(err instanceof Error ? err.message : "Couldn't prepare the video. Please try again.");
    } finally {
      setPreparing(null);
    }
  }

  // Keep the trimming preview inside the chosen 20 seconds
  function onPreviewTime() {
    const v = previewRef.current;
    if (v && pending && v.currentTime >= pending.start + max) {
      v.currentTime = pending.start;
    }
  }

  const busy = reading || preparing !== null;

  return (
    <div className="grid gap-4">
      <div className="rounded-xl bg-muted p-4 text-sm">
        <p className="font-medium">How to record</p>
        <ul className="mt-1 list-disc space-y-0.5 pl-5 text-muted-foreground">
          <li>Have someone walk the horse towards you, then away, then past you.</li>
          <li>Record in daylight, holding the phone sideways.</li>
          <li>{max} seconds is enough. Longer videos are shortened here; you choose which part to keep.</li>
        </ul>
      </div>

      {/* Choosing which 20 seconds to keep */}
      {pending && preparing === null && (
        <div className="grid gap-3 rounded-xl border p-4">
          <p className="text-sm">
            Your video is <span className="font-medium">{Math.round(pending.duration)} seconds</span>.
            Choose the best {max} seconds to keep.
          </p>
          <video
            ref={previewRef}
            src={pending.url}
            muted
            playsInline
            autoPlay
            loop={false}
            onTimeUpdate={onPreviewTime}
            onEnded={() => previewRef.current && (previewRef.current.currentTime = pending.start)}
            className="aspect-video w-full rounded-lg bg-black"
          />
          <label htmlFor="video-start" className="text-sm font-medium">
            Keep from {formatTime(pending.start)} to {formatTime(Math.min(pending.start + max, pending.duration))}
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
          <button
            type="button"
            onClick={() => runPrepare(pending.url, pending.start, max)}
            className="h-12 rounded-lg bg-primary text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Use these {max} seconds
          </button>
        </div>
      )}

      {/* Preparing (shortening / shrinking) */}
      {preparing !== null && (
        <div role="status" className="rounded-xl border p-4">
          <p className="text-sm font-medium">Preparing your video… {Math.round(preparing * 100)}%</p>
          <p className="mt-0.5 text-xs text-muted-foreground">Keep this screen open. It takes about {max} seconds.</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
            <div className="h-full bg-primary transition-[width]" style={{ width: `${preparing * 100}%` }} />
          </div>
        </div>
      )}

      {/* The final video */}
      {data.video && !pending && preparing === null && (
        <div>
          <video src={data.video.url} controls playsInline className="aspect-video w-full rounded-xl bg-black" />
          <p className="mt-2 text-sm text-muted-foreground">
            {data.video.seconds} seconds · {(data.video.file.size / 1024 / 1024).toFixed(1)} MB
          </p>
        </div>
      )}

      {!busy && (
        <label
          className={`flex h-14 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed text-sm font-medium hover:border-primary ${
            errors.video ? "border-destructive" : ""
          }`}
        >
          {data.video || pending ? "Choose a different video" : "+ Record or choose walking video"}
          <input
            type="file"
            accept="video/*"
            className="sr-only"
            onChange={(e) => {
              pick(e.target.files?.[0]);
              e.target.value = ""; // allow picking the same file again
            }}
          />
        </label>
      )}
      {reading && <p className="text-sm text-muted-foreground">Checking video…</p>}
      {errors.video && <p data-error className="text-sm text-destructive">{errors.video}</p>}
    </div>
  );
}

function formatTime(seconds: number) {
  const s = Math.max(0, Math.round(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

/* ---------- Step 4: health & training ---------- */

function HealthStep({ data, set, errors }: StepProps) {
  return (
    <div className="grid gap-5">
      <Field id="vaccinated" label="Vaccinated?" error={errors.vaccinated}>
        <YesNo id="vaccinated" value={data.vaccinated} onChange={(v) => set("vaccinated", v)} error={errors.vaccinated} />
      </Field>

      <Field id="vet" label="Vet certificate (optional)" hint="A photo or PDF of the certificate. Builds buyer trust.">
        <label className="flex h-12 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed px-3 text-sm hover:border-primary">
          <span className="truncate">{data.vetCertificate ? `✓ ${data.vetCertificate.file.name}` : "+ Upload certificate"}</span>
          <input
            id="vet" type="file" accept="image/*,application/pdf" className="sr-only"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) set("vetCertificate", { file, url: URL.createObjectURL(file) });
            }}
          />
        </label>
      </Field>

      <Field id="training" label="Training level" error={errors.trainingLevel}>
        <Select id="training" value={data.trainingLevel} onChange={(v) => set("trainingLevel", v)} options={trainingLevels} placeholder="Choose training level" error={errors.trainingLevel} />
      </Field>

      <Field id="handler" label="Handler's Experience" error={errors.handlerExperience}>
        <Select id="handler" value={data.handlerExperience} onChange={(v) => set("handlerExperience", v)} options={handlerExperience} placeholder="Choose experience level" error={errors.handlerExperience} />
      </Field>

      {data.gender === "Mare" && (
        <Field id="pregnant" label="Is the mare pregnant?" error={errors.pregnant}>
          <YesNo id="pregnant" value={data.pregnant} onChange={(v) => set("pregnant", v)} error={errors.pregnant} />
        </Field>
      )}
    </div>
  );
}

/* ---------- Step 5: price & location ---------- */

function PriceStep({ data, set, errors }: StepProps) {
  return (
    <div className="grid gap-5">
      <Field
        id="price" label="Price (₹)" error={errors.priceInr}
        hint={data.priceInr && Number(data.priceInr) >= 1000 ? formatInr(Number(data.priceInr)) : undefined}
      >
        <input
          id="price" type="text" inputMode="numeric" value={data.priceInr}
          onChange={(e) => set("priceInr", e.target.value.replace(/\D/g, "").slice(0, 9))}
          aria-invalid={!!errors.priceInr} className={inputClass} placeholder="e.g. 150000"
        />
      </Field>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox" checked={data.negotiable} onChange={(e) => set("negotiable", e.target.checked)}
          className="size-5 accent-[var(--primary)]"
        />
        Price is negotiable
      </label>

      <Field id="district" label="District" error={errors.district}>
        <Select
          id="district" value={data.district} onChange={(v) => set("district", v)} error={errors.district}
          placeholder="Choose district" options={districts.map((d) => ({ value: d.name, label: d.name }))}
        />
      </Field>

      <Field id="town" label="Town or village" error={errors.town}>
        <input
          id="town" type="text" maxLength={60} value={data.town}
          onChange={(e) => set("town", e.target.value)} aria-invalid={!!errors.town} className={inputClass}
        />
      </Field>

      <Field
        id="description" label="About the horse (optional)" error={errors.description}
        hint={`${data.description.length}/${limits.descriptionChars} · Tamil or English. Health, habits, why you're selling.`}
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

function PreviewStep({ data, goTo }: { data: FormData; goTo: (step: number) => void }) {
  const rows: [string, string, number][] = [
    ["Breed", data.breed, 0],
    ["Gender", data.gender, 0],
    ["Age", `${data.ageYears} years`, 0],
    ["Height", `${data.heightInches} inches`, 0],
    ["Colour", data.colour, 0],
    ["Markings", data.markings || "—", 0],
    ["Vaccinated", data.vaccinated === "yes" ? "Yes" : "No", 3],
    ["Vet certificate", data.vetCertificate ? "Uploaded" : "Not provided", 3],
    ["Training", data.trainingLevel, 3],
    ["Handler's Experience", data.handlerExperience, 3],
    ...(data.gender === "Mare" ? [["Pregnant", data.pregnant === "yes" ? "Yes" : "No", 3] as [string, string, number]] : []),
    ["Location", `${data.town}, ${data.district}`, 4],
  ];

  return (
    <div>
      <p className="text-sm text-muted-foreground">This is how buyers will see your listing. Tap Edit to change anything.</p>

      {data.video && (
        <video src={data.video.url} controls playsInline className="mt-4 aspect-video w-full rounded-xl bg-black" />
      )}
      <ul className="mt-3 grid grid-cols-5 gap-2">
        {photoSlots.map((slot) => {
          const p = data.photos[slot.key];
          return (
            <li key={slot.key} className="aspect-square overflow-hidden rounded-lg bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element -- local preview */}
              {p && <img src={p.url} alt={slot.label} className="size-full object-cover" />}
            </li>
          );
        })}
      </ul>
      <button type="button" onClick={() => goTo(1)} className="mt-2 text-sm text-primary hover:underline">
        Edit photos or video
      </button>

      <h2 className="mt-6 text-2xl font-semibold">{data.breed} {data.gender.toLowerCase()}</h2>
      <p className="mt-1 text-2xl font-semibold">
        {formatInr(Number(data.priceInr))}
        <span className="ml-2 align-middle text-sm font-normal text-muted-foreground">
          {data.negotiable ? "Negotiable" : "Fixed price"}
        </span>
      </p>

      <dl className="mt-4 border-t text-sm">
        {rows.map(([label, value, stepIndex]) => (
          <div key={label} className="flex items-center justify-between gap-4 border-b py-2.5">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="flex items-center gap-3 text-right font-medium">
              {value}
              <button type="button" onClick={() => goTo(stepIndex)} className="text-xs font-normal text-primary hover:underline">
                Edit
              </button>
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-4">
        <div className="flex items-baseline justify-between">
          <h3 className="font-semibold">About the horse</h3>
          <button type="button" onClick={() => goTo(4)} className="text-xs text-primary hover:underline">Edit</button>
        </div>
        {data.description.trim() ? (
          <p className="mt-1 whitespace-pre-line leading-relaxed">{data.description}</p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">Not added. Optional, but a few lines help buyers.</p>
        )}
      </div>

      <p className="mt-6 rounded-xl bg-muted p-4 text-xs leading-relaxed text-muted-foreground">
        Every listing is checked before it goes live. Listings of sick, injured or underage horses,
        or with fake details, are removed.
      </p>
    </div>
  );
}
