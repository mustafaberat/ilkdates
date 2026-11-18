import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import type { ReactElement } from "react";

export const ogSize = { width: 1200, height: 630 };

async function loadFonts() {
  const dir = join(process.cwd(), "src/fonts");
  const [serif, serifItalic, mono, monoBold] = await Promise.all([
    readFile(join(dir, "EBGaramond-Medium.ttf")),
    readFile(join(dir, "EBGaramond-MediumItalic.ttf")),
    readFile(join(dir, "CourierPrime-Regular.ttf")),
    readFile(join(dir, "CourierPrime-Bold.ttf")),
  ]);
  return [
    { name: "EB Garamond", data: serif, style: "normal" as const, weight: 500 as const },
    { name: "EB Garamond", data: serifItalic, style: "italic" as const, weight: 500 as const },
    { name: "Courier Prime", data: mono, style: "normal" as const, weight: 400 as const },
    { name: "Courier Prime", data: monoBold, style: "normal" as const, weight: 700 as const },
  ];
}

const ink = "#1B2A4A";
const paper = "#FBF7F0";
const wax = "#8E1F24";
const line = "#C9BBA3";

function Postmark({ top, bottom, mid }: { top: string; mid: string; bottom: string }) {
  return (
    <div
      style={{
        width: 160,
        height: 160,
        borderRadius: 80,
        border: `3px solid ${wax}`,
        color: wax,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Courier Prime",
        fontSize: 16,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
        transform: "rotate(-16deg)",
        flexShrink: 0,
      }}
    >
      <div style={{ display: "flex" }}>{top}</div>
      <div
        style={{
          display: "flex",
          fontFamily: "EB Garamond",
          fontStyle: "italic",
          fontSize: 28,
          letterSpacing: 0,
          textTransform: "none",
          margin: "6px 0",
        }}
      >
        {mid}
      </div>
      <div style={{ display: "flex" }}>{bottom}</div>
    </div>
  );
}

function Frame({ children }: { children: ReactElement | ReactElement[] }) {
  return (
    <div
      style={{
        width: "1200px",
        height: "630px",
        background: paper,
        color: ink,
        display: "flex",
        padding: "64px 72px",
        borderBottom: `8px solid ${wax}`,
        borderTop: `1px solid ${line}`,
      }}
    >
      {children}
    </div>
  );
}

export async function renderHomeOg() {
  const fonts = await loadFonts();
  return new ImageResponse(
    (
      <Frame>
        <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center" }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Courier Prime",
              fontSize: 22,
              letterSpacing: "0.18em",
              textTransform: "uppercase",
              color: wax,
              marginBottom: 16,
            }}
          >
            ilkdates
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "EB Garamond",
              fontStyle: "italic",
              fontSize: 88,
              lineHeight: 1.05,
              fontWeight: 500,
            }}
          >
            İlk tarihlerinizi
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "EB Garamond",
              fontStyle: "italic",
              fontSize: 88,
              lineHeight: 1.05,
              fontWeight: 500,
            }}
          >
            kaydedin.
          </div>
          <div
            style={{
              display: "flex",
              fontFamily: "EB Garamond",
              fontSize: 28,
              marginTop: 24,
              color: "#4A5568",
            }}
          >
            Tarih, not, yıldönümü — hepsi bir yerde.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center" }}>
          <Postmark top="İstanbul" mid="ilk" bottom="dates" />
        </div>
      </Frame>
    ),
    { ...ogSize, fonts },
  );
}
