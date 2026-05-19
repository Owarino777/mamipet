import { Suspense } from "react";
import type { Metadata } from "next";
import { BookingFlowPage } from "@/interface/app/connected-pages";

export const metadata: Metadata = {
  title: "Creer une reservation",
  robots: {
    index: false,
    follow: false,
  },
};

export default function ReservationsNewPage() {
  return (
    <Suspense>
      <BookingFlowPage />
    </Suspense>
  );
}
