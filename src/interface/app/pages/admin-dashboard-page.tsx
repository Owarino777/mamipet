"use client";

import { useDemoWorkspace } from "@/interface/shared/demo-workspace-client";
import {
  ConnectedShell,
  useRoleAccess,
} from "@/interface/app/connected/connected-shell";
import {
  AdminList,
  MetricCard,
} from "@/interface/app/connected/workspace-components";
import Link from "next/link";

export function AdminDashboardPage() {
  const workspace = useDemoWorkspace();

  const pendingDocuments = workspace.documents.filter(
    (task) => task.status === "pending",
  );

  const pendingReports = workspace.reports.filter(
    (task) => task.status === "pending",
  );

  const paidBookings = workspace.bookings.filter(
    (booking) => booking.status === "paid",
  );

  const blockedContent = useRoleAccess("admin");

  if (blockedContent) {
    return blockedContent;
  }

  return (
    <ConnectedShell role="Admin" active="Tableau de bord">
      <main className="workspace-main">
        <div className="workspace-heading">
          <div>
            <p className="section-kicker">Administration</p>

            <h1>Vue d’ensemble</h1>
            <p className="workspace-lead">
              Vérifications, signalements et articles à traiter.
            </p>
          </div>
        </div>

        <section className="admin-quick-actions" aria-label="Actions administrateur">
          <Link className="admin-quick-action" href="/admin/blog">
            <strong>Gérer le journal</strong>
            <span>Créer, relire et publier les articles.</span>
          </Link>
          <a className="admin-quick-action" href="#moderation">
            <strong>Traiter les signalements</strong>
            <span>Revoir les tickets ouverts et leurs décisions.</span>
          </a>
          <a className="admin-quick-action" href="#documents">
            <strong>Vérifier les documents</strong>
            <span>Valider les justificatifs en attente.</span>
          </a>
        </section>

        <section className="workspace-grid workspace-grid--three">
          <MetricCard
            title="Documents"
            value={String(pendingDocuments.length)}
            detail="À valider"
          />

          <MetricCard
            title="Signalements"
            value={String(pendingReports.length)}
            detail="Ouverts"
          />

          <MetricCard
            title="Paiements"
            value={String(paidBookings.length)}
            detail="Mode test"
          />
        </section>

        <section className="workspace-grid">
          <div id="documents">
            <AdminList
            collection="documents"
            title="Documents en attente"
            items={workspace.documents}
            />
          </div>

          <div id="moderation">
            <AdminList
            collection="reports"
            title="Signalements ouverts"
            items={workspace.reports}
            />
          </div>
        </section>
      </main>
    </ConnectedShell>
  );
}
