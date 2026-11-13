import React, { useEffect } from "react";
import { Composition, registerRoot, delayRender, continueRender, staticFile } from "remotion";
import { LyricVideo } from "./LyricVideo";

// 45 seconds @ 30fps = 1350 frames  (audio 11s → 56s)
const DURATION_FRAMES = 1350;
const FPS = 30;

// Google Sans Flex (OFL, Nov 2025), self-hosted and split by unicode-range
// so the Vietnamese diacritics (ầ, ệ, ồ, ự, ẵ...) actually load — the
// "latin" subset alone doesn't include Vietnamese combining marks. Loaded
// via the FontFace API (rather than a CSS @font-face import) so it can be
// built from staticFile() URLs and gated behind delayRender/continueRender:
// without this, render frames can be captured before the font resolves,
// silently falling back to a system font for part or all of the export.
const VIETNAMESE_RANGE =
  "U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, " +
  "U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, " +
  "U+1EA0-1EF9, U+20AB";
const LATIN_RANGE =
  "U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+2000-206F, U+2074, " +
  "U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD";

const useGoogleSansFlexReady = () => {
  useEffect(() => {
    const handle = delayRender("Loading Google Sans Flex");

    const vietnamese = new FontFace(
      "Google Sans Flex",
      `url(${staticFile("fonts/GoogleSansFlex-Vietnamese.woff2")})`,
      { weight: "100 900", style: "normal", unicodeRange: VIETNAMESE_RANGE }
    );
    const latin = new FontFace(
      "Google Sans Flex",
      `url(${staticFile("fonts/GoogleSansFlex.woff2")})`,
      { weight: "100 900", style: "normal", unicodeRange: LATIN_RANGE }
    );

    Promise.all([vietnamese.load(), latin.load()])
      .then(([v, l]) => {
        document.fonts.add(v);
        document.fonts.add(l);
      })
      .catch(() => {
        // Fall through to the Be Vietnam Pro fallback in theme.ts rather
        // than blocking the render forever if the font fails to load.
      })
      .finally(() => continueRender(handle));
  }, []);
};

const RootWithFontGate: React.FC = () => {
  useGoogleSansFlexReady();
  return (
    <Composition
      id="LyricVideo"
      component={LyricVideo}
      durationInFrames={DURATION_FRAMES}
      fps={FPS}
      width={1920}
      height={1080}
    />
  );
};

export const RemotionRoot: React.FC = () => <RootWithFontGate />;

registerRoot(RemotionRoot);
