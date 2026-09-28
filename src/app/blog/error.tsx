"use client";
import { PublicShell } from "@/interface/shared/product-ui";

export default function BlogError({ reset }: { reset: () => void }) {
  return (
    <PublicShell>
      <main className="blog-main">
        <section className="workspace-card">
          <h1>Le journal est momentanément indisponible.</h1>
          <p>
            Vos articles seront de nouveau accessibles dès le rétablissement du
            service.
          </p>
          <button className="primary-button" onClick={reset}>
            Réessayer
          </button>
        </section>
      </main>
    </PublicShell>
  );
}
