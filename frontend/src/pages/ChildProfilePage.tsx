import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import AnalyticsPanel from "../components/child-profile/AnalyticsPanel";
import ChildSummaryCard from "../components/child-profile/ChildSummaryCard";
import RecentSessionList from "../components/child-profile/RecentSessionList";
import RiskOverviewCard from "../components/child-profile/RiskOverviewCard";
import StartSessionButton from "../components/child-profile/StartSessionButton";
import { fetchChildProfile, type ChildProfileResponse } from "../services/childProfileService";

export default function ChildProfilePage() {
  const { childId } = useParams();
  const [profile, setProfile] = useState<ChildProfileResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetchChildProfile(Number(childId || 1))
      .then((data) => {
        if (isMounted) setProfile(data);
      })
      .catch(() => {
        if (isMounted) setError("Unable to load the child profile right now.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [childId]);

  return (
    <main className="page-shell">
      <section className="card">
        <p className="eyebrow">Worker portal</p>
        <h1>Child profile</h1>
        <p className="lead">Review the child overview and start a session from this page.</p>

        <nav className="nav-links" style={{ marginBottom: 18 }}>
          <Link to="/dashboard" className="secondary-btn">Back to dashboard</Link>
        </nav>

        {loading && <p className="status">Loading child profile…</p>}
        {error && <p className="error-box">{error}</p>}

        {!loading && !error && profile && (
          <>
            <ChildSummaryCard name={profile.name} age={profile.age} status={profile.status} />
            <RiskOverviewCard riskLevel={profile.riskLevel} riskScore={profile.analytics.riskScore} />
            <AnalyticsPanel
              riskScore={profile.analytics.riskScore}
              sessionCount={profile.analytics.sessionCount}
              moodBreakdown={profile.analytics.moodBreakdown}
            />
            <RecentSessionList sessions={profile.recentSessions} />

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <StartSessionButton childId={profile.childId} />
            </div>
          </>
        )}
      </section>
    </main>
  );
}
