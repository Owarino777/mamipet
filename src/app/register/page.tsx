import type { Metadata } from "next";
import { RegisterPage } from "@/interface/app/connected-pages";

export const metadata: Metadata = {
  title: "Inscription",
  description: "Creez votre compte MamiPet en tant que proprietaire ou pet-sitter.",
  alternates: {
    canonical: "/register",
  },
};

export default RegisterPage;
