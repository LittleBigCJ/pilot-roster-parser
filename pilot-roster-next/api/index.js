import { useState } from 'react';

export default function Home() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) return alert('Please select a file first');

    setLoading(true);
    setResult(null);
    setError(null);

    const formData = new FormData();
    formData.append('roster', file);

    try {
      const res = await fetch('/api/upload-roster', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to parse roster');
      }

      const data = await res.json();
      setResult(data.parsedFlights);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: 'auto', padding: 20 }}>
      <h1>Pilot Roster Parser</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="file"
          accept=".csv,text/csv"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit" disabled={loading} style={{ marginLeft: 10 }}>
          {loading ? 'Parsing...' : 'Upload & Parse'}
        </button>
      </form>

      {error && (
        <p style={{ color: 'red', marginTop: 20 }}>
          Error: {error}
        </p>
      )}

      {result && (
        <div style={{ marginTop: 20 }}>
          <h2>Parsed Flights</h2>
          <pre
            style={{
              backgroundColor: '#eee',
              padding: 10,
              maxHeight: 300,
              overflowY: 'auto',
            }}
          >
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}