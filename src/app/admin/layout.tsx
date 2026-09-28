import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { requireAdminAccount } from "@/modules/administration/application/require-admin-account";
import { HttpError } from "@/shared/errors/http-error";
import { getSiteUrl } from "@/shared/config/site";

export const metadata: Metadata = { robots: { index: false, follow: false } };
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAdminAccount(new Request(new URL("/admin", getSiteUrl())));
  } catch (error) {
    if (error instanceof HttpError && error.status === 401)
      redirect("/login?next=/admin/blog");
    if (error instanceof HttpError && error.status === 403)
      return (
        <main className="workspace-main">
          <section className="workspace-card">
            <h1>Accès réservé à l’administration</h1>
            <p>Votre compte ne dispose pas des droits nécessaires.</p>
            <Link className="secondary-button" href="/">
              Retour à l’accueil
            </Link>
          </section>
        </main>
      );
    throw error;
  }
  return children;
}
