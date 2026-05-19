import type { Metadata } from "next";
import { HomePage } from "@/interface/public/home-page";
import { siteDescription } from "@/shared/config/site";

export const metadata: Metadata = {
  title: "Garde d'animaux de confiance",
  description: siteDescription,
  alternates: {
    canonical: "/",
  },
};

export default HomePage;
