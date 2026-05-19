import type { Metadata } from "next";
import { PetSitterDashboardPage } from "@/interface/app/connected-pages";

export const metadata: Metadata = {
  title: "Tableau de bord pet-sitter",
  robots: {
    index: false,
    follow: false,
  },
};

export default PetSitterDashboardPage;
