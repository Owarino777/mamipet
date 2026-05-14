import { Suspense } from "react";
import type { Metadata } from "next";
import { BookingFlowPage } from "@/interface/app/connected-pages";

export const metadata: Metadata = {
  title: "Créer une réservation | MamiPet",
};

export default function ReservationsNewPage() {
  return (
    <Suspense>
      <BookingFlowPage />
    </Suspense>
  );
}
