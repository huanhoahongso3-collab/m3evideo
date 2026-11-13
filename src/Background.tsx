import React from "react";
import { M3 } from "./theme";

// Flat single-color background per user request ("background chỉ 1 màu
// thôi") — every shape that used to live here as ambient blurred lighting
// has moved to the foreground layer (see ForegroundShapes.tsx), so this
// component is now just the solid Monet-derived base tone.
export const Background: React.FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: M3.bgFlat,
      }}
    />
  );
};
