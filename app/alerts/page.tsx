import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { AlertsClient } from "@/components/alerts/AlertsClient";

export const metadata: Metadata = {
  title: "התראות מחיר — TickerIO",
  description: "ניהול התראות מחיר והיסטוריית התראות למניות, קריפטו ומט״ח.",
};

export default function AlertsPage() {
  return <><SiteHeader /><AlertsClient /></>;
}
