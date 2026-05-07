"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/shared/supabase/browser-client";

type MeResponse = {
    data: {
        isAdmin: boolean;
        roles: {
            owner: boolean;
            petSitter: boolean;
            admin: boolean;
        };
    };
    error: null;
};

export function PublicHeaderAuthAction() {
    const supabase = useMemo(() => createSupabaseBrowserClient(), []);
    const [session, setSession] = useState<Session | null>(null);
    const [dashboardHref, setDashboardHref] = useState("/dashboard");

    useEffect(() => {
        let isMounted = true;

        void supabase.auth.getSession().then(({ data }) => {
            if (isMounted) {
                setSession(data.session);
            }
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, currentSession) => {
            setSession(currentSession);
        });

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, [supabase]);

    useEffect(() => {
        if (!session) {
            return;
        }

        let isMounted = true;

        void fetch("/api/me", {
            method: "GET",
            credentials: "include",
            cache: "no-store",
        })
            .then(async (response) => {
                if (!response.ok) {
                    return null;
                }

                return (await response.json()) as MeResponse;
            })
            .then((payload) => {
                if (!isMounted || !payload?.data) {
                    return;
                }

                if (payload.data.roles.admin || payload.data.isAdmin) {
                    setDashboardHref("/admin/dashboard");
                    return;
                }

                if (payload.data.roles.petSitter) {
                    setDashboardHref("/pet-sitter/dashboard");
                    return;
                }

                setDashboardHref("/dashboard");
            })
            .catch(() => {
                if (isMounted) {
                    setDashboardHref("/dashboard");
                }
            });

        return () => {
            isMounted = false;
        };
    }, [session]);

    if (!session) {
        return (
            <Link className="ghost-button" href="/login">
                Connexion
            </Link>
        );
    }

    return (
        <div className="demo-session-pill">
            <Link href={dashboardHref}>
                <span>{session.user.email ?? "Compte connecté"}</span>
                <small>Session sécurisée</small>
            </Link>
            <button
                type="button"
                onClick={() => {
                    void supabase.auth.signOut();
                    setDashboardHref("/dashboard");
                }}
            >
                Déconnexion
            </button>
        </div>
    );
}
