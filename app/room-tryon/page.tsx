import { Suspense } from "react";

import { RoomTryOnClient } from "./RoomTryOnClient";

export const dynamic = "force-dynamic";

function LoadingRoomTryOn() {
  return (
    <main
      style={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        background: "#f1dfbf",
        color: "#171717",
        padding: "20px",
      }}
    >
      <div
        style={{
          fontWeight: 900,
          fontSize: "18px",
        }}
      >
        Завантаження AI-примірки...
      </div>
    </main>
  );
}

export default function RoomTryOnPage() {
  return (
    <Suspense fallback={<LoadingRoomTryOn />}>
      <RoomTryOnClient />
    </Suspense>
  );
}