import React, { useState } from 'react';

const Summarizer = () => {
    const [text, setText] = useState("");
    const [summary, setSummary] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSummarize = async () => {
        if (!text) {
            setError("Please enter text to summarize.");
            return;
        }
        setError("");
        setLoading(true);

        try {
            const response = await fetch("http://localhost:5000/summarize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ text, numSentences: 3 })
            });

            const data = await response.json();
            setSummary(data.summary);
        } catch (err) {
            setError("Failed to summarize text. Please try again.");
        }
        setLoading(false);
    };

    return (
        <div>
            <h2>Text Summarizer</h2>
            <textarea
                rows="5"
                cols="50"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text here..."
            />
            <br />
            <button onClick={handleSummarize} disabled={loading}>
                {loading ? "Summarizing..." : "Summarize"}
            </button>

            {error && <p style={{ color: "red" }}>{error}</p>}
            <h3>Summary:</h3>
            <p>{summary}</p>
        </div>
    );
};

export default Summarizer;
