import type { Metadata } from "next";
import { AdminDashboardPage } from "@/interface/app/connected-pages";

export const metadata: Metadata = {
  title: "Administration",
  robots: {
    index: false,
    follow: false,
  },
};

export default AdminDashboardPage;
