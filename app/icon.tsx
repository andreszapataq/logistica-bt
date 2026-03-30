import { ImageResponse } from "next/og"

export const size = {
  width: 32,
  height: 32,
}
export const contentType = "image/png"

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 18,
          background: "white",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "black",
          borderRadius: 6,
          fontWeight: 900,
          fontFamily: "sans-serif",
          letterSpacing: -1,
        }}
      >
        BT
      </div>
    ),
    {
      ...size,
    }
  )
}
