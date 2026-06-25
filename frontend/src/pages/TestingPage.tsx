import { useState } from "react";
import { Link } from "react-router-dom";

type ApiResult = {
  label: string;
  status: "idle" | "loading" | "success" | "error";
  data: unknown;
};

const initialResult: ApiResult = {
  label: "No request yet",
  status: "idle",
  data: null,
};

export default function TestingPage() {
  const [apiBaseUrl, setApiBaseUrl] = useState("http://localhost:5000");
  const [userId, setUserId] = useState("1");
  const [workerId, setWorkerId] = useState("1");
  const [conversationId, setConversationId] = useState("1");
  const [message, setMessage] = useState("Hi, I need someone to talk to.");
  const [forceAi, setForceAi] = useState(true);
  const [result, setResult] = useState<ApiResult>(initialResult);

  const runRequest = async (
    label: string,
    path: string,
    options: RequestInit = {}
  ) => {
    setResult({ label, status: "loading", data: null });

    try {
      const response = await fetch(`${apiBaseUrl}${path}`, {
        headers: {
          "Content-Type": "application/json",
          ...(options.headers || {}),
        },
        ...options,
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : await response.text();

      if (!response.ok) {
        throw new Error(
          typeof data === "string" ? data : JSON.stringify(data, null, 2)
        );
      }

      setResult({ label, status: "success", data });
    } catch (error) {
      setResult({
        label,
        status: "error",
        data: error instanceof Error ? error.message : "Request failed",
      });
    }
  };

  const createConversation = async () => {
    setResult({ label: "Create conversation", status: "loading", data: null });

    try {
      const response = await fetch(`${apiBaseUrl}/api/conversations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(userId),
          workerId: Number(workerId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(JSON.stringify(data, null, 2));
      }

      if (data.conversation_id) {
        setConversationId(String(data.conversation_id));
      }

      setResult({ label: "Create conversation", status: "success", data });
    } catch (error) {
      setResult({
        label: "Create conversation",
        status: "error",
        data: error instanceof Error ? error.message : "Request failed",
      });
    }
  };

  const sendMessage = () =>
    runRequest("Send message", "/api/messages", {
      method: "POST",
      body: JSON.stringify({
        conversationId: Number(conversationId),
        userId: Number(userId),
        message,
        forceAi,
      }),
    });

  const formattedResult =
    typeof result.data === "string"
      ? result.data
      : JSON.stringify(result.data, null, 2);

  return (
    <main className="testing-page">
      <header className="testing-header">
        <div>
          <p className="eyebrow">Backend testing</p>
          <h1>Youth chat API console</h1>
          <p className="lead">
            Run the hackathon backend flow from one screen.
          </p>
        </div>
        <Link to="/" className="secondary-btn">
          Back home
        </Link>
      </header>

      <section className="testing-layout">
        <form className="test-panel" onSubmit={(event) => event.preventDefault()}>
          <label>
            API base URL
            <input
              value={apiBaseUrl}
              onChange={(event) => setApiBaseUrl(event.target.value)}
            />
          </label>

          <div className="field-grid">
            <label>
              User ID
              <input
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
              />
            </label>
            <label>
              Worker ID
              <input
                value={workerId}
                onChange={(event) => setWorkerId(event.target.value)}
              />
            </label>
            <label>
              Conversation ID
              <input
                value={conversationId}
                onChange={(event) => setConversationId(event.target.value)}
              />
            </label>
          </div>

          <label>
            Youth message
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={4}
            />
          </label>

          <label className="checkbox-row">
            <input
              type="checkbox"
              checked={forceAi}
              onChange={(event) => setForceAi(event.target.checked)}
            />
            Force AI mode
          </label>
        </form>

        <section className="test-panel">
          <div className="button-grid">
            <button
              className="secondary-btn"
              type="button"
              onClick={() => runRequest("Test backend", "/")}
            >
              Test backend
            </button>
            <button
              className="secondary-btn"
              type="button"
              onClick={() => runRequest("Test database", "/test-db")}
            >
              Test database
            </button>
            <button
              className="primary-btn"
              type="button"
              onClick={createConversation}
            >
              Create conversation
            </button>
            <button className="primary-btn" type="button" onClick={sendMessage}>
              Send AI message
            </button>
            <button
              className="secondary-btn"
              type="button"
              onClick={() =>
                runRequest("Get messages", `/api/messages/${conversationId}`)
              }
            >
              Get messages
            </button>
            <button
              className="secondary-btn"
              type="button"
              onClick={() =>
                runRequest("Generate summary", `/api/summaries/${conversationId}`, {
                  method: "POST",
                })
              }
            >
              Generate summary
            </button>
            <button
              className="secondary-btn"
              type="button"
              onClick={() =>
                runRequest("Get summary", `/api/summaries/${conversationId}`)
              }
            >
              Get summary
            </button>
            <button
              className="secondary-btn"
              type="button"
              onClick={() => runRequest("Get handover", "/api/workers/handover")}
            >
              Get handover
            </button>
          </div>

          <div className={`response-box ${result.status}`}>
            <div className="response-header">
              <strong>{result.label}</strong>
              <span>{result.status}</span>
            </div>
            <pre>{formattedResult || "Response will appear here."}</pre>
          </div>
        </section>
      </section>
    </main>
  );
}
