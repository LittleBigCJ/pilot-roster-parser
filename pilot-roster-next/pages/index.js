import { useState } from "react";
import Tesseract from "tesseract.js";

export default function Home() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [table, setTable] = useState("");

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const runOCR = async () => {
    if (!image) return;
    setLoading(true);

    try {
      const { data } = await Tesseract.recognize(image, "eng");
      setOcrText(data.text);

      // Send OCR text to backend for GPT formatting
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: data.text })
      });

      const json = await res.json();
      setTable(json.table || "No table returned.");
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Pilot Logbook OCR → Table</h1>

      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={runOCR} disabled={!image || loading}>
        {loading ? "Processing..." : "Run OCR"}
      </button>

      {ocrText && (
        <div>
          <h3>OCR Text:</h3>
          <pre>{ocrText}</pre>
        </div>
      )}

      {table && (
        <div>
          <h3>Formatted Table:</h3>
          <div style={{ whiteSpace: "pre-wrap" }}>{table}</div>
        </div>
      )}
    </div>
  );
}