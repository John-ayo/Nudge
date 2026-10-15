import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const XP_PER_PR = 30; // keep in sync with PR_XP in _shared/github.ts
const MAX_PRS_PER_DAY = 3; // keep in sync with MAX_XP_PRS_PER_DAY

export default function GithubConnect({ accent }) {
  // loading | disconnected | syncing | connected
  const [status, setStatus] = useState("loading");
  const [username, setUsername] = useState(null);
  const [prs, setPrs] = useState([]);
  const [error, setError] = useState("");
  const [syncBusy, setSyncBusy] = useState(false);
  const [syncMsg, setSyncMsg] = useState(null); // { text, isError }

  const loadPrs = useCallback(async () => {
    const { data } = await supabase
      .from("github_prs")
      .select("pr_id, repo, title, merged_at, xp_awarded")
      .order("merged_at", { ascending: false })
      .limit(5);
    setPrs(data ?? []);
  }, []);

  const refresh = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setStatus("disconnected");
      return;
    }

    const { data: link } = await supabase
      .from("github_links")
      .select("username")
      .eq("user_id", user.id)
      .maybeSingle();

    if (link) {
      setUsername(link.username);
      setStatus("connected");
      loadPrs();
      return;
    }

    const hasGithub = user.identities?.some((i) => i.provider === "github");
    if (!hasGithub) {
      setStatus("disconnected");
      return;
    }

    // GitHub identity exists but no link row yet: finish the link on the server
    setStatus("syncing");
    const { data, error: fnError } = await supabase.functions.invoke("github-link");
    if (fnError || !data?.username) {
      let msg = "Could not finish linking GitHub. Please try again.";
      try {
        const body = await fnError?.context?.json();
        if (body?.error) msg = body.error;
      } catch {
        // keep the generic message
      }
      setError(msg);
      setStatus("disconnected");
      return;
    }

    setUsername(data.username);
    setStatus("connected");
    loadPrs();
  }, [loadPrs]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function connect() {
    setError("");
    const { error: linkError } = await supabase.auth.linkIdentity({
      provider: "github",
      options: { redirectTo: `${window.location.origin}/settings` },
    });
    if (linkError) setError(linkError.message);
  }

  async function syncNow() {
    setSyncBusy(true);
    setSyncMsg(null);

    const { data, error: fnError } = await supabase.functions.invoke("github-sync-me");

    if (fnError) {
      let text = "Could not sync right now. Please try again.";
      try {
        const body = await fnError?.context?.json();
        if (body?.retry_after) {
          const mins = Math.ceil(body.retry_after / 60);
          text = `You synced a moment ago. Try again in about ${mins} min.`;
        } else if (body?.error) {
          text = body.error;
        }
      } catch {
        // keep the generic message
      }
      setSyncMsg({ text, isError: true });
    } else {
      await loadPrs();
      const n = data?.newPrs ?? 0;
      setSyncMsg({
        text: n > 0 ? `Found ${n} new merged PR${n === 1 ? "" : "s"}.` : "Up to date. No new merged PRs.",
        isError: false,
      });
    }

    setSyncBusy(false);
  }

  return (
    <div>
      <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-muted)" }}>
        Earn {XP_PER_PR} XP for each pull request you merge in a public repository, up to{" "}
        {MAX_PRS_PER_DAY} a day. Only PRs merged after you connect count.
      </p>

      {status === "loading" && (
        <p className="text-sm" style={{ color: "var(--text-faint)" }}>Loading...</p>
      )}

      {status === "syncing" && (
        <p className="text-sm" style={{ color: "var(--text-faint)" }}>
          Finishing your GitHub link...
        </p>
      )}

      {status === "disconnected" && (
        <button
          onClick={connect}
          className="rounded-2xl px-5 py-2.5 text-sm font-bold text-white transition-all hover:opacity-90"
          style={{ backgroundColor: accent }}>
          Connect GitHub
        </button>
      )}

      {status === "connected" && (
        <div>
          <div className="flex items-center justify-between gap-3 mb-3">
            <p className="text-sm" style={{ color: "var(--text-primary)" }}>
              Connected as <span className="font-semibold">@{username}</span>
            </p>
            <button
              onClick={syncNow}
              disabled={syncBusy}
              className="rounded-xl px-3 py-2 text-xs font-semibold transition-all hover:opacity-80"
              style={{
                backgroundColor: "var(--bg-hover)",
                border: "1px solid var(--border-base)",
                color: "var(--text-primary)",
                opacity: syncBusy ? 0.6 : 1,
              }}>
              {syncBusy ? "Syncing..." : "Sync now"}
            </button>
          </div>

          {syncMsg && (
            <p
              className="text-xs mb-3"
              style={{ color: syncMsg.isError ? "#f87171" : "var(--text-muted)" }}>
              {syncMsg.text}
            </p>
          )}

          {prs.length === 0 ? (
            <p className="text-xs" style={{ color: "var(--text-faint)" }}>
              No merged public PRs yet. We check hourly, or press Sync now.
            </p>
          ) : (
            <ul className="space-y-2">
              {prs.map((pr) => (
                <li key={pr.pr_id} className="flex items-start justify-between gap-3 text-xs">
                  <span style={{ color: "var(--text-primary)" }}>
                    {pr.title}
                    <span style={{ color: "var(--text-faint)" }}> in {pr.repo}</span>
                  </span>
                  <span className="shrink-0 font-semibold" style={{ color: accent }}>
                    {pr.xp_awarded > 0 ? `+${pr.xp_awarded} XP` : "capped"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && (
        <p className="mt-3 text-xs" style={{ color: "#f87171" }}>
          {error}
        </p>
      )}
    </div>
  );
}