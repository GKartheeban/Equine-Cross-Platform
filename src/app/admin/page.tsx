import type { Metadata } from "next";
import { AdminPanel } from "./admin-panel";

export const metadata: Metadata = {
  title: "Admin | EquineTrade",
  robots: { index: false, follow: false },
};

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <AdminPanel />
    </div>
  );
}
