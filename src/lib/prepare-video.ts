// Shortens and shrinks a walking video on the seller's phone, so sellers
// never need to trim or compress videos themselves.
//
// How it works: the video plays (silently, off-screen) into a canvas at max 1280px,
// and the browser records that canvas. A 20-second clip comes out around 5–8 MB.
// It runs in real time, so a 20-second clip takes about 20 seconds to prepare.

const MAX_SIDE = 1280; // 720p-ish
const BITRATE = 2_500_000; // ~2.5 Mbps

/** True if this browser can shorten/shrink videos (Chrome/Android, Safari 15+, Firefox). */
export function canPrepareVideo() {
  return (
    typeof window !== "undefined" &&
    typeof MediaRecorder !== "undefined" &&
    typeof HTMLCanvasElement !== "undefined" &&
    "captureStream" in HTMLCanvasElement.prototype &&
    !!pickMimeType()
  );
}

function pickMimeType() {
  if (typeof MediaRecorder === "undefined") return "";
  const options = [
    "video/mp4;codecs=avc1",
    "video/mp4",
    "video/webm;codecs=vp9",
    "video/webm;codecs=vp8",
    "video/webm",
  ];
  return options.find((t) => MediaRecorder.isTypeSupported(t)) ?? "";
}

/** Reads a video's length in seconds without uploading it. */
export function readVideoDuration(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    v.onloadedmetadata = () => {
      // Some phone videos report Infinity until seeked to the end
      if (Number.isFinite(v.duration)) return resolve(v.duration);
      v.currentTime = 1e7;
      v.ontimeupdate = () => {
        v.ontimeupdate = null;
        resolve(Number.isFinite(v.duration) ? v.duration : 0);
      };
    };
    v.onerror = () => reject(new Error("This video can't be played. Try another file."));
    v.src = url;
  });
}

/**
 * Makes a new, smaller video from `start` for `length` seconds.
 * Calls onProgress with 0–1 while working.
 */
export async function prepareVideo(
  sourceUrl: string,
  start: number,
  length: number,
  onProgress: (fraction: number) => void,
): Promise<{ file: File; seconds: number }> {
  const mimeType = pickMimeType();
  if (!mimeType) throw new Error("This browser can't prepare videos.");

  const video = document.createElement("video");
  video.muted = true; // silent: avoids sound while preparing and keeps files small
  video.playsInline = true;
  video.preload = "auto";
  video.src = sourceUrl;

  await new Promise<void>((resolve, reject) => {
    video.onloadedmetadata = () => resolve();
    video.onerror = () => reject(new Error("This video can't be played. Try another file."));
  });

  // Jump to the chosen start point
  await new Promise<void>((resolve) => {
    video.onseeked = () => resolve();
    video.currentTime = start;
  });

  const scale = Math.min(1, MAX_SIDE / Math.max(video.videoWidth, video.videoHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round((video.videoWidth * scale) / 2) * 2; // encoders need even sizes
  canvas.height = Math.round((video.videoHeight * scale) / 2) * 2;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("This browser can't prepare videos.");
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  const stream = canvas.captureStream(30);
  const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: BITRATE });
  const chunks: Blob[] = [];
  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };
  const stopped = new Promise<void>((resolve) => (recorder.onstop = () => resolve()));

  const end = Math.min(start + length, video.duration || start + length);
  let finished = false;

  const finish = () => {
    if (finished) return;
    finished = true;
    video.pause();
    if (recorder.state !== "inactive") recorder.stop();
    stream.getTracks().forEach((t) => t.stop());
  };

  // Copy each video frame onto the canvas until we reach the end point
  const drawFrame = () => {
    if (finished) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    onProgress(Math.min(1, (video.currentTime - start) / (end - start)));
    if (video.currentTime >= end || video.ended) return finish();
    if ("requestVideoFrameCallback" in video) {
      (video as HTMLVideoElement & { requestVideoFrameCallback: (cb: () => void) => void })
        .requestVideoFrameCallback(drawFrame);
    } else {
      requestAnimationFrame(drawFrame);
    }
  };

  video.onended = finish;
  recorder.start(1000);
  await video.play();
  drawFrame();
  await stopped;
  onProgress(1);

  const type = mimeType.split(";")[0];
  const ext = type === "video/mp4" ? "mp4" : "webm";
  const blob = new Blob(chunks, { type });
  if (blob.size === 0) throw new Error("Couldn't prepare the video. Please try again.");

  return {
    file: new File([blob], `walking.${ext}`, { type }),
    seconds: Math.round(end - start),
  };
}
