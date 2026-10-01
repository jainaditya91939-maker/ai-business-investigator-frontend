import { useState } from "react";
import { aiFetch } from "../api";

function AIInvestigator() {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const askInvestigator = async () => {
    if (!question.trim()) {
      setError("Please enter a question.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setAnswer("");

      const response = await aiFetch(
        `/api/v1/ai/investigate`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            question: question,
          }),
        }
      );

      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;

        try {
          const errorData = await response.json();

          if (errorData.detail) {
            errorMessage = errorData.detail;
          }
        } catch {
          // Ignore JSON parsing error
        }

        throw new Error(errorMessage);
      }

      const data = await response.json();

      console.log(
        "AI Investigator Response:",
        data
      );

      if (data.answer) {
        setAnswer(data.answer);
      } else if (data.report) {
        setAnswer(data.report);
      } else {
        throw new Error(
          "AI service returned no answer."
        );
      }
    } catch (err) {
      console.error(
        "AI Investigator Error:",
        err
      );

      setError(
        `AI Investigator Error: ${
          err.message || "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      (event.ctrlKey || event.metaKey)
    ) {
      askInvestigator();
    }
  };

  return (
    <div className="page">

      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div>
        <h1>AI Business Investigator</h1>

        <p className="subtitle">
          Ask questions in Hinglish and
          get clear AI-powered business insights.
        </p>
      </div>

      {/* ======================================
          QUESTION CARD
      ====================================== */}

      <div
        className="card"
        style={{
          marginTop: "25px",
          padding: "28px",
        }}
      >
        {/* HEADER */}

        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "14px",
            marginBottom: "20px",
          }}
        >
          <div
            style={{
              width: "42px",
              height: "42px",
              borderRadius: "10px",
              background: "#eff6ff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "21px",
              flexShrink: 0,
            }}
          >
            🧠
          </div>

          <div>
            <h2
              style={{
                fontSize: "20px",
                marginBottom: "5px",
              }}
            >
              Ask AI Investigator
            </h2>

            <p
              style={{
                color: "#6b7280",
                fontSize: "14px",
                lineHeight: "1.5",
              }}
            >
              Ask about suppliers, payments,
              pending amounts or unusual activity.
            </p>
          </div>
        </div>

        {/* TEXTAREA */}

        <textarea
          value={question}
          onChange={(e) => {
            setQuestion(e.target.value);
            setError("");
          }}
          onKeyDown={handleKeyDown}
          placeholder="Example: ABC Electricals ka pending kitna hai?"
          rows={5}
          disabled={loading}
          style={{
            width: "100%",
            padding: "14px",
            borderRadius: "10px",
            border: "1px solid #d1d5db",
            resize: "vertical",
            fontSize: "15px",
            lineHeight: "1.5",
            background: loading
              ? "#f9fafb"
              : "#ffffff",
            color: "#111827",
          }}
        />

        {/* HELPER TEXT */}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "15px",
            marginTop: "10px",
            flexWrap: "wrap",
          }}
        >
          <span
            style={{
              color: "#9ca3af",
              fontSize: "12px",
            }}
          >
            Tip: Press Ctrl + Enter to ask
          </span>

          <span
            style={{
              color: "#9ca3af",
              fontSize: "12px",
            }}
          >
            {question.length} characters
          </span>
        </div>

        {/* ASK BUTTON */}

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: "18px",
          }}
        >
          <button
            type="button"
            onClick={askInvestigator}
            disabled={loading}
            style={{
              background: loading
                ? "#93c5fd"
                : "#2563eb",
              color: "#ffffff",
              border: "none",
              padding: "12px 22px",
              borderRadius: "9px",
              fontSize: "14px",
              fontWeight: "600",
              cursor: loading
                ? "not-allowed"
                : "pointer",
              minWidth: "150px",
              boxShadow: loading
                ? "none"
                : "0 4px 12px rgba(37, 99, 235, 0.2)",
            }}
          >
            {loading
              ? "🧠 Analyzing..."
              : "Ask Investigator"}
          </button>
        </div>
      </div>

      {/* ======================================
          ERROR
      ====================================== */}

      {error && (
        <div
          style={{
            marginTop: "20px",
            padding: "16px 18px",
            background: "#fef2f2",
            color: "#991b1b",
            border: "1px solid #fecaca",
            borderLeft:
              "4px solid #dc2626",
            borderRadius: "10px",
            fontSize: "14px",
          }}
        >
          <strong>
            Something went wrong
          </strong>

          <p
            style={{
              marginTop: "5px",
              color: "#b91c1c",
            }}
          >
            {error}
          </p>
        </div>
      )}

      {/* ======================================
          ANSWER
      ====================================== */}

      {answer && (
        <div
          className="card"
          style={{
            marginTop: "25px",
            padding: "28px",
            borderLeft:
              "4px solid #2563eb",
          }}
        >
          {/* ANSWER HEADER */}

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "#eff6ff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              ✨
            </div>

            <div>
              <h2
                style={{
                  fontSize: "20px",
                  marginBottom: "3px",
                }}
              >
                AI Investigator Answer
              </h2>

              <p
                style={{
                  color: "#9ca3af",
                  fontSize: "12px",
                }}
              >
                Based on your business data
              </p>
            </div>
          </div>

          {/* ANSWER CONTENT */}

          <div
            style={{
              padding: "18px",
              background: "#f8fafc",
              borderRadius: "10px",
              border:
                "1px solid #e5e7eb",
              whiteSpace: "pre-wrap",
              lineHeight: "1.75",
              fontSize: "15px",
              color: "#374151",
            }}
          >
            {answer}
          </div>
        </div>
      )}

      {/* ======================================
          EXAMPLE QUESTIONS
      ====================================== */}

      {!answer && !loading && (
        <div
          style={{
            marginTop: "25px",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              marginBottom: "14px",
            }}
          >
            Try asking
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(3, minmax(0, 1fr))",
              gap: "14px",
            }}
          >
            <button
              type="button"
              onClick={() =>
                setQuestion(
                  "ABC Electricals ka pending kitna hai?"
                )
              }
              style={{
                background: "#ffffff",
                border:
                  "1px solid #e5e7eb",
                borderRadius: "10px",
                padding: "16px",
                textAlign: "left",
                color: "#374151",
                cursor: "pointer",
                fontSize: "13px",
                lineHeight: "1.5",
              }}
            >
              💰
              <br />
              <strong>
                Check pending amount
              </strong>
              <br />
              <span
                style={{
                  color: "#9ca3af",
                }}
              >
                Find supplier dues
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setQuestion(
                  "Kaunsa supplier ka pending sabse zyada hai?"
                )
              }
              style={{
                background: "#ffffff",
                border:
                  "1px solid #e5e7eb",
                borderRadius: "10px",
                padding: "16px",
                textAlign: "left",
                color: "#374151",
                cursor: "pointer",
                fontSize: "13px",
                lineHeight: "1.5",
              }}
            >
              📊
              <br />
              <strong>
                Find highest pending
              </strong>
              <br />
              <span
                style={{
                  color: "#9ca3af",
                }}
              >
                Compare suppliers
              </span>
            </button>

            <button
              type="button"
              onClick={() =>
                setQuestion(
                  "ABC Electricals ke transactions mein kuch unusual lag raha hai kya?"
                )
              }
              style={{
                background: "#ffffff",
                border:
                  "1px solid #e5e7eb",
                borderRadius: "10px",
                padding: "16px",
                textAlign: "left",
                color: "#374151",
                cursor: "pointer",
                fontSize: "13px",
                lineHeight: "1.5",
              }}
            >
              🔎
              <br />
              <strong>
                Investigate activity
              </strong>
              <br />
              <span
                style={{
                  color: "#9ca3af",
                }}
              >
                Look for unusual activity
              </span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default AIInvestigator;