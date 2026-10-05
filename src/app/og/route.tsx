import { ImageResponse } from "next/og";

// /og: the picture shown when a non-horse page (Home, Search, breeds, districts)
// is shared on WhatsApp/Facebook. Horse pages use the horse's own front photo.
const size = { width: 1200, height: 630 };

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: "#ffffff",
          color: "#1a1a1a",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 88, fontWeight: 700, letterSpacing: -2 }}>
          Equine<span style={{ color: "#8a4b22" }}>Trade</span>
        </div>
        <div style={{ marginTop: 24, fontSize: 44, color: "#555" }}>Horses for sale across Tamil Nadu</div>
        <div style={{ marginTop: 48, display: "flex", gap: 20, fontSize: 30, color: "#8a4b22" }}>
          <span>Photos</span>
          <span>·</span>
          <span>Walking videos</span>
          <span>·</span>
          <span>Verified sellers</span>
        </div>
      </div>
    ),
    { ...size, headers: { "Cache-Control": "public, max-age=86400, immutable" } },
  );
}
