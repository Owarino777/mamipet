import type { Metadata } from "next";
import { PetSitterOnboardingPage } from "@/interface/app/connected-pages";

export const metadata: Metadata = {
  title: "Activation pet-sitter",
  robots: {
    index: false,
    follow: false,
  },
};

export default PetSitterOnboardingPage;
