import type { Metadata } from "next";
import { OwnerAnimalsPage } from "@/interface/app/connected-pages";

export const metadata: Metadata = {
  title: "Mes animaux",
  robots: {
    index: false,
    follow: false,
  },
};

export default OwnerAnimalsPage;
