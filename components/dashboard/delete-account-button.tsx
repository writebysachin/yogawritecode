"use client";

import { useState } from "react";

export function DeleteAccountButton() {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Are you sure you want to permanently delete your account? This cannot be undone.",
    );
    if (!confirmed) return;

    setLoading(true);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error ?? "Failed to delete account");
      }
      window.location.href = "/";
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete account";
      alert(message);
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={loading}
      className="text-sm font-medium text-error hover:underline underline-offset-4"
    >
      {loading ? "Deleting..." : "Delete my account"}
    </button>
  );
}
