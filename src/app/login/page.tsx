import type { Metadata } from "next";
import { LoginPage } from "@/interface/app/connected-pages";

export const metadata: Metadata = {
  title: "Connexion",
  description: "Connectez-vous a votre compte MamiPet pour gerer vos reservations et vos gardes.",
  alternates: {
    canonical: "/login",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default LoginPage;
