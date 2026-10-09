import { useCallback, useEffect, useState } from "react";
import { supabase } from "../lib/supabase"; // adjust to wherever your client lives

const XP_PER_PR = 30; // keep in sync with PR_XP in github-sync
const MAX_PRS_PER_DAY = 3; // keep in sync with MAX_XP_PRS_PER_DAY

export default function GithubConnect() {
  // loading | disconnected | syncing | connected
  const [status, setStatus] = useState("loading");
  const [username, setUsername] = useState(null);
  const [prs, setPrs] = useState([]);
  const [error, setError] = useState("");

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

  return (
    <section className="rounded-2xl border border-grey bg-surface p-6">
      <div className="syne text-base font-bold text-white mb-1">GitHub</div>
      <p className="text-sm leading-relaxed mb-4" style={{ color: "#888888" }}>
        Earn {XP_PER_PR} XP for each pull request you merge, up to {MAX_PRS_PER_DAY} a
        day. Only PRs merged after you connect count.
      </p>

      {status === "loading" && <p className="text-sm text-greyLight">Loading...</p>}

      {status === "syncing" && (
        <p className="text-sm text-greyLight">Finishing your GitHub link...</p>
      )}

      {status === "disconnected" && (
        <button className="btn-primary px-5 py-2.25 text-sm" onClick={connect}>
          Connect GitHub
        </button>
      )}

      {status === "connected" && (
        <div>
          <p className="text-sm text-white mb-3">
            Connected as <span className="font-semibold">@{username}</span>
          </p>
          {prs.length === 0 ? (
            <p className="text-xs text-greyLight">
              No merged PRs yet. Merge one and it shows up here within the hour.
            </p>
          ) : (
            <ul className="space-y-2">
              {prs.map((pr) => (
                <li key={pr.pr_id} className="flex items-start justify-between gap-3 text-xs">
                  <span className="text-offwhite">
                    {pr.title}
                    <span className="text-greyLight"> in {pr.repo}</span>
                  </span>
                  <span className="shrink-0 text-purpleLight font-semibold">
                    {pr.xp_awarded > 0 ? `+${pr.xp_awarded} XP` : "capped"}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && (
        <p className="mt-3 text-xs" style={{ color: "#FF6B6B" }}>
          {error}
        </p>
      )}
    </section>
  );
}