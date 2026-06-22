import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  fetchConversations,
  type ConversationListItem,
} from "../services/youthChatApi";

interface YouthProfileCard {
  profileKey: string;
  youthId: number;
  workerId?: number | null;
  name: string;
  workerName: string;
  age?: number | null;
  school?: string | null;
  interests?: string | null;
  category?: string | null;
  status?: string | null;
  riskLevel: string;
  latestMode: string;
  needsHandover: boolean;
  latestConversationId: number;
  lastMessageAt: string;
  sessionCount: number;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-SG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function getOverallSummary(profile: YouthProfileCard) {
  const intro = profile.age
    ? `${profile.name} is ${profile.age} years old`
    : `${profile.name} is a youth in the programme`;
  const school = profile.school ? ` from ${profile.school}` : "";
  const interests = profile.interests
    ? ` They are interested in ${profile.interests}.`
    : "";
  const category = profile.category
    ? ` Their current support area is ${profile.category}.`
    : "";
  const risk = ` Latest risk level is ${profile.riskLevel.toLowerCase()}.`;

  return `${intro}${school}.${interests}${category}${risk}`;
}

function getSupportFocus(profile: YouthProfileCard) {
  const category = profile.category || "general wellbeing";
  const risk = profile.riskLevel.toLowerCase();

  if (profile.needsHandover) {
    return `Needs worker follow-up because an after-hours AI conversation is waiting for review. Current focus: ${category}, with ${risk} risk noted.`;
  }

  return `Current focus: ${category}. Keep checking in through regular chat and review any new changes in mood, school, or safety.`;
}

function getRiskClass(riskLevel: string) {
  const risk = riskLevel.toLowerCase();

  if (risk.includes("critical")) return "risk-chip critical";
  if (risk.includes("high")) return "risk-chip high";
  if (risk.includes("medium")) return "risk-chip medium";
  return "risk-chip low";
}

function getModeLabel(mode: string) {
  return mode === "ai" ? "AI handover" : "Worker chat";
}

export default function DashboardPage() {
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedProfileKey, setSelectedProfileKey] = useState<string | null>(
    null
  );

  useEffect(() => {
    let isMounted = true;

    fetchConversations()
      .then((data) => {
        if (isMounted) setConversations(data);
      })
      .catch((err) => {
        if (isMounted) {
          setError(
            err instanceof Error ? err.message : "Unable to load youth profiles"
          );
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const youthProfiles = useMemo(() => {
    const grouped = new Map<string, YouthProfileCard>();

    conversations.forEach((item) => {
      const youthId = item.youth_id || item.conversation_id;
      const workerName = item.worker_name || "Unassigned";
      const workerId = item.worker_id || null;
      const profileKey = `${normalizeKey(item.youth_name)}:${normalizeKey(
        workerName
      )}`;
      const existing = grouped.get(profileKey);
      const isLatest =
        !existing ||
        new Date(item.last_message_at).getTime() >
          new Date(existing.lastMessageAt).getTime();

      if (!existing) {
        grouped.set(profileKey, {
          profileKey,
          youthId,
          workerId,
          name: item.youth_name,
          workerName,
          age: item.youth_age,
          school: item.youth_school,
          interests: item.youth_interests,
          category: item.youth_category,
          status: item.youth_status,
          riskLevel: item.risk_level || "LOW",
          latestMode: item.mode,
          needsHandover: item.needs_handover,
          latestConversationId: item.conversation_id,
          lastMessageAt: item.last_message_at,
          sessionCount: 1,
        });
        return;
      }

      grouped.set(profileKey, {
        ...existing,
        workerName:
          isLatest && item.worker_name ? item.worker_name : existing.workerName,
        workerId: isLatest ? workerId : existing.workerId,
        riskLevel: isLatest ? item.risk_level : existing.riskLevel,
        age: isLatest ? item.youth_age : existing.age,
        school: isLatest ? item.youth_school : existing.school,
        interests: isLatest ? item.youth_interests : existing.interests,
        category: isLatest ? item.youth_category : existing.category,
        status: isLatest ? item.youth_status : existing.status,
        latestMode: isLatest ? item.mode : existing.latestMode,
        needsHandover: existing.needsHandover || item.needs_handover,
        latestConversationId: isLatest
          ? item.conversation_id
          : existing.latestConversationId,
        lastMessageAt: isLatest ? item.last_message_at : existing.lastMessageAt,
        sessionCount: existing.sessionCount + 1,
      });
    });

    return [...grouped.values()].sort(
      (a, b) =>
        new Date(b.lastMessageAt).getTime() -
        new Date(a.lastMessageAt).getTime()
    );
  }, [conversations]);

  const selectedProfile =
    youthProfiles.find((profile) => profile.profileKey === selectedProfileKey) ||
    null;

  const dashboardStats = useMemo(
    () => ({
      total: youthProfiles.length,
      handover: youthProfiles.filter((profile) => profile.needsHandover).length,
      highRisk: youthProfiles.filter((profile) => {
        const risk = profile.riskLevel.toLowerCase();
        return risk.includes("high") || risk.includes("critical");
      }).length,
    }),
    [youthProfiles]
  );

  return (
    <main className="app-screen profiles-screen">
      <header className="worker-header">
        <div>
          <p className="eyebrow">Worker dashboard</p>
          <h1>Youth profiles</h1>
          <p className="lead">
            A quick view of each youth, their assigned worker, and what they are
            broadly going through.
          </p>
        </div>
        <nav className="nav-links">
          <Link to="/" className="secondary-btn">
            Home
          </Link>
          <Link to="/worker/handover" className="primary-btn">
            Handover
          </Link>
        </nav>
      </header>

      <section className="workflow-strip" aria-label="Worker workflow">
        <article>
          <strong>{dashboardStats.total}</strong>
          <span>Assigned youth profiles</span>
        </article>
        <article>
          <strong>{dashboardStats.handover}</strong>
          <span>AI handovers waiting</span>
        </article>
        <article>
          <strong>{dashboardStats.highRisk}</strong>
          <span>High or critical risk profiles</span>
        </article>
        <article>
          <strong>9-6</strong>
          <span>Worker chat hours, then AI support</span>
        </article>
      </section>

      {loading ? <p className="status">Loading youth profiles...</p> : null}
      {error ? <p className="error-box">{error}</p> : null}

      <section
        className={
          selectedProfile
            ? "profile-dashboard-layout"
            : "profile-dashboard-layout summary-closed"
        }
      >
        <div className="profile-grid">
          {!loading && youthProfiles.length === 0 ? (
            <article className="profile-card">
              <p>No youth profiles found.</p>
            </article>
          ) : (
            youthProfiles.map((profile) => (
              <button
                className={
                  selectedProfileKey === profile.profileKey
                    ? "profile-card selected"
                    : "profile-card"
                }
                key={profile.profileKey}
                type="button"
                onClick={() =>
                  setSelectedProfileKey((currentKey) =>
                    currentKey === profile.profileKey ? null : profile.profileKey
                  )
                }
              >
                <div className="profile-avatar">
                  <span>{getInitials(profile.name)}</span>
                </div>
                <h2>{profile.name}</h2>
                <p className="assigned-worker">
                  Assigned to <strong>{profile.workerName}</strong>
                </p>

                <div className="profile-meta">
                  {profile.age ? <code>Age {profile.age}</code> : null}
                  {profile.category ? <code>{profile.category}</code> : null}
                  <code className={getRiskClass(profile.riskLevel)}>
                    {profile.riskLevel} risk
                  </code>
                  {profile.needsHandover ? <code>handover</code> : null}
                </div>
              </button>
            ))
          )}
        </div>

        {selectedProfile ? (
          <aside className="profile-detail-panel">
            <div className="profile-detail-header">
              <div className="profile-avatar detail-avatar">
                <span>{getInitials(selectedProfile.name)}</span>
              </div>
              <div>
                <p className="eyebrow">Profile summary</p>
                <h2>{selectedProfile.name}</h2>
                <p>Assigned to {selectedProfile.workerName}</p>
              </div>
            </div>

            <div className="profile-meta detail-meta">
              {selectedProfile.age ? <code>Age {selectedProfile.age}</code> : null}
              {selectedProfile.school ? <code>{selectedProfile.school}</code> : null}
              {selectedProfile.category ? <code>{selectedProfile.category}</code> : null}
              <code className={getRiskClass(selectedProfile.riskLevel)}>
                {selectedProfile.riskLevel} risk
              </code>
              {selectedProfile.needsHandover ? <code>AI handover pending</code> : null}
            </div>

            <section className="profile-summary-block">
              <h3>Who they are</h3>
              <p>{getOverallSummary(selectedProfile)}</p>
            </section>

            <section className="profile-summary-block">
              <h3>What they are going through</h3>
              <p>{getSupportFocus(selectedProfile)}</p>
            </section>

            <div className="profile-detail-stats">
              <span>
                {selectedProfile.sessionCount} session
                {selectedProfile.sessionCount === 1 ? "" : "s"}
              </span>
              <span>Last contact: {formatDate(selectedProfile.lastMessageAt)}</span>
              <span>Latest mode: {getModeLabel(selectedProfile.latestMode)}</span>
            </div>

            <div className="detail-actions">
              <Link
                className="primary-btn"
                to={`/chat/${selectedProfile.latestConversationId}`}
              >
                Open worker chat
              </Link>
              <Link
                className="secondary-btn"
                to={`/youth/chat/${selectedProfile.latestConversationId}`}
              >
                Youth demo
              </Link>
              {selectedProfile.needsHandover ? (
                <Link
                  className="secondary-btn"
                  to={`/worker/handover/${selectedProfile.latestConversationId}`}
                >
                  Review handover
                </Link>
              ) : null}
            </div>
          </aside>
        ) : null}
      </section>
    </main>
  );
}
