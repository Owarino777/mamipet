import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAuthenticatedUser } from "@/shared/auth/current-user";
import { getSiteUrl } from "@/shared/config/site";
import { HttpError } from "@/shared/errors/http-error";

export async function AuthenticatedWorkspace({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireAuthenticatedUser(
      new Request(new URL("/dashboard", getSiteUrl())),
    );
  } catch (error) {
    if (error instanceof HttpError && error.status === 401) redirect("/login");
    if (error instanceof HttpError && error.status === 403)
      return (
        <main className="workspace-main">
          <section className="workspace-card">
            <h1>Compte indisponible</h1>
            <p>Votre compte ne permet pas d’accéder à cet espace.</p>
            <Link href="/" className="secondary-button">
              Retour à l’accueil
            </Link>
          </section>
        </main>
      );
    throw error;
  }
  return children;
}
