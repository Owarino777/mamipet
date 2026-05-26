import type { Metadata } from "next";
import { PetSitterOnboardingPage } from "@/interface/app/pet-sitter-onboarding-page";

export const metadata: Metadata = {
  title: "Activation pet-sitter",
  robots: {
    index: false,
    follow: false,
  },
};

export default PetSitterOnboardingPage;
