import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Monad Tour Colombia 2026 - MonadBlitz";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #0E091C 0%, #1a0f35 50%, #0E091C 100%)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {/* Background gradient orbs */}
      <div
        style={{
          position: "absolute",
          top: "-100px",
          right: "-100px",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(110, 84, 255, 0.3), transparent 70%)",
          display: "flex",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-100px",
          left: "-50px",
          width: "400px",
          height: "400px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(133, 230, 255, 0.2), transparent 70%)",
          display: "flex",
        }}
      />

      {/* Grid pattern overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
          display: "flex",
        }}
      />

      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "60px",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Subtitle */}
        <span
          style={{
            fontSize: "18px",
            letterSpacing: "6px",
            color: "rgba(255, 255, 255, 0.4)",
            fontFamily: "monospace",
            textTransform: "uppercase",
            marginBottom: "20px",
          }}
        >
          MBC Presenta
        </span>

        {/* Main title */}
        <span
          style={{
            fontSize: "80px",
            fontWeight: 800,
            color: "white",
            lineHeight: 1.1,
            letterSpacing: "-2px",
          }}
        >
          MONAD TOUR
        </span>
        <span
          style={{
            fontSize: "80px",
            fontWeight: 800,
            background: "linear-gradient(105deg, #6E54FF, #85E6FF, #DDD7FE, #FF8EE4)",
            backgroundClip: "text",
            color: "transparent",
            lineHeight: 1.1,
            letterSpacing: "-2px",
          }}
        >
          COLOMBIA
        </span>

        {/* Colombian flag stripes */}
        <div style={{ display: "flex", gap: "6px", marginTop: "16px" }}>
          <div
            style={{ width: "60px", height: "4px", borderRadius: "2px", background: "#FCD116" }}
          />
          <div
            style={{ width: "60px", height: "4px", borderRadius: "2px", background: "#003893" }}
          />
          <div
            style={{ width: "60px", height: "4px", borderRadius: "2px", background: "#CE1126" }}
          />
        </div>

        {/* Cities */}
        <span
          style={{
            fontSize: "22px",
            color: "rgba(255, 255, 255, 0.5)",
            marginTop: "30px",
            fontFamily: "monospace",
            letterSpacing: "3px",
          }}
        >
          MEDELLIN - BOGOTA
        </span>

        {/* Tagline */}
        <span
          style={{
            fontSize: "16px",
            color: "rgba(110, 84, 255, 0.8)",
            marginTop: "16px",
            fontFamily: "monospace",
            letterSpacing: "2px",
          }}
        >
          MONADBLITZ 2026
        </span>
      </div>
    </div>,
    { ...size }
  );
}
