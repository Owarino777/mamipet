import type { Metadata } from "next";
import { OwnerDashboardPage } from "@/interface/app/connected-pages";

export const metadata: Metadata = {
  title: "Tableau de bord proprietaire",
  robots: {
    index: false,
    follow: false,
  },
};

export default OwnerDashboardPage;
