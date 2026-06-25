import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { createYouth, type CreateYouthPayload } from "../services/youthService";

<<<<<<< HEAD
// Default form values — all optional fields start empty,
// status defaults to ACTIVE and risk level defaults to LOW
=======
>>>>>>> feature-youthcatalogue
const EMPTY: CreateYouthPayload = {
  full_name: "",
  age: "",
  school: "",
  interests: "",
  category: "",
  status: "ACTIVE",
  latest_risk_level: "LOW",
};

<<<<<<< HEAD
// ─── CreateYouthProfilePage ───────────────────────────────────────────────────
// Form for creating a new youth profile. Only accessible to authenticated
// workers and admins (enforced both by ProtectedRoute and by the backend).
//
// Flow:
//   1. Worker fills in the form — only full_name is required
//   2. On submit: validates full_name, converts age string to number, calls createYouth()
//   3. On success: shows a success message, then redirects to /youth after 1.5s
//   4. On error: shows the server error message inline
export default function CreateYouthProfilePage() {
  const navigate = useNavigate();
  const [form, setForm]         = useState<CreateYouthPayload>(EMPTY);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Generic change handler — works for all input, select, and textarea elements
  // because they all expose { target: { name, value } }
=======
export default function CreateYouthProfilePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<CreateYouthPayload>(EMPTY);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

>>>>>>> feature-youthcatalogue
  const handleChange = (e: { target: { name: string; value: string } }) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setError("");
    setSuccess("");

<<<<<<< HEAD
    // Client-side guard — full_name is the only required field
=======
>>>>>>> feature-youthcatalogue
    if (!form.full_name.trim()) {
      setError("Full name is required.");
      return;
    }

<<<<<<< HEAD
    // Convert age from the string value the input produces to a number for the API.
    // An empty string means the worker left it blank — send undefined so the model
    // stores null rather than 0.
=======
    // convert age to number if provided
>>>>>>> feature-youthcatalogue
    const payload: CreateYouthPayload = {
      ...form,
      age: form.age !== "" ? Number(form.age) : undefined,
    };

    setSubmitting(true);
    try {
      await createYouth(payload);
      setSuccess("Youth profile created. Redirecting…");
<<<<<<< HEAD
      // Brief delay so the worker can see the success message before being moved away
=======
>>>>>>> feature-youthcatalogue
      setTimeout(() => navigate("/youth"), 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page-shell">
      <section className="card" style={{ maxWidth: 640 }}>
        <p className="eyebrow">Youth Support Platform</p>
        <h1>Create Youth Profile</h1>

        <nav className="nav-links" style={{ marginBottom: 20 }}>
          <Link to="/youth" className="secondary-btn">← Back to Catalogue</Link>
        </nav>

<<<<<<< HEAD
        {error   && <p className="error-box">{error}</p>}
=======
        {error && <p className="error-box">{error}</p>}
>>>>>>> feature-youthcatalogue
        {success && <p className="success-box">{success}</p>}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>

<<<<<<< HEAD
          {/* full_name is the only required field — marked with a red asterisk */}
          <label className="field-label">
            Full Name <span style={{ color: "#b91c1c" }}>*</span>
            <input
              className="field-input"
              name="full_name"
              value={form.full_name}
              onChange={handleChange}
              placeholder="e.g. Alex Tan"
            />
=======
          {/* Basic Info */}
          <label className="field-label">
            Full Name <span style={{ color: "#b91c1c" }}>*</span>
            <input className="field-input" name="full_name" value={form.full_name} onChange={handleChange} placeholder="e.g. Alex Tan" />
>>>>>>> feature-youthcatalogue
          </label>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <label className="field-label">
              Age
<<<<<<< HEAD
              <input
                className="field-input"
                type="number"
                name="age"
                value={form.age}
                onChange={handleChange}
                min={0}
                max={25}
                placeholder="e.g. 15"
              />
            </label>
            <label className="field-label">
              School
              <input
                className="field-input"
                name="school"
                value={form.school}
                onChange={handleChange}
                placeholder="e.g. Northview Sec"
              />
            </label>
          </div>

          {/* Interests help workers build rapport with the youth */}
=======
              <input className="field-input" type="number" name="age" value={form.age} onChange={handleChange} min={0} max={25} placeholder="e.g. 15" />
            </label>
            <label className="field-label">
              School
              <input className="field-input" name="school" value={form.school} onChange={handleChange} placeholder="e.g. Northview Sec" />
            </label>
          </div>

          {/* Interests — key for workers */}
>>>>>>> feature-youthcatalogue
          <label className="field-label">
            Interests
            <textarea
              className="field-input"
              name="interests"
              value={form.interests}
              onChange={handleChange}
              rows={3}
              placeholder="e.g. Basketball, drawing, music — helps workers connect with the youth"
            />
          </label>

<<<<<<< HEAD
          {/* Category is a free-text field for internal classification */}
          <label className="field-label">
            Category
            <input
              className="field-input"
              name="category"
              value={form.category}
              onChange={handleChange}
              placeholder="e.g. At-risk, School dropout, Family issues"
            />
          </label>

          {/* Status and risk level each have a fixed set of valid values */}
=======
          {/* Category */}
          <label className="field-label">
            Category
            <input className="field-input" name="category" value={form.category} onChange={handleChange} placeholder="e.g. At-risk, School dropout, Family issues" />
          </label>

          {/* Status & Risk */}
>>>>>>> feature-youthcatalogue
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <label className="field-label">
              Status
              <select className="field-input" name="status" value={form.status} onChange={handleChange}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="CLOSED">Closed</option>
              </select>
            </label>
            <label className="field-label">
              Initial Risk Level
              <select className="field-input" name="latest_risk_level" value={form.latest_risk_level} onChange={handleChange}>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </label>
          </div>

<<<<<<< HEAD
          {/* Disabled while the request is in-flight to prevent double submission */}
=======
>>>>>>> feature-youthcatalogue
          <button type="submit" className="primary-btn" disabled={submitting} style={{ marginTop: 4 }}>
            {submitting ? "Creating…" : "Create Profile"}
          </button>
        </form>
      </section>
    </main>
  );
}
