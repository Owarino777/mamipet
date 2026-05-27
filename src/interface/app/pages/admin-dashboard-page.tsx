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
            <p className="section-kicker">Back-office</p>

            <h1>Validation, modération et suivi des actions sensibles.</h1>
          </div>
        </div>

        <section className="workspace-grid workspace-grid--four">
          <MetricCard
            title="Documents"
            value={String(pendingDocuments.length)}
            detail="À valider"
          />

          <MetricCard title="Profils" value="5" detail="En attente" />

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
          <AdminList
            collection="documents"
            title="Documents en attente"
            items={workspace.documents}
          />

          <AdminList
            collection="reports"
            title="Signalements ouverts"
            items={workspace.reports}
          />
        </section>
      </main>
    </ConnectedShell>
  );
}
