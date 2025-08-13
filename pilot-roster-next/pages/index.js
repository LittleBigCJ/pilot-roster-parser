// add these imports at the top
import { useState } from 'react';
import Tesseract from 'tesseract.js';

export default function Home() {
  const [image, setImage] = useState(null);
  const [ocrText, setOcrText] = useState('');
  const [chatResponse, setChatResponse] = useState('');
  const [processing, setProcessing] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const handleImageChange = (e) => {
    if (e.target.files.length > 0) {
      setImage(e.target.files[0]);
      setOcrText('');
      setChatResponse('');
    }
  };

  const handleExtractText = () => {
    if (!image) return alert('Please upload an image first');
    setProcessing(true);

    Tesseract.recognize(
      image,
      'eng',
      { logger: m => console.log(m) }
    ).then(({ data: { text } }) => {
      setOcrText(text);
      setProcessing(false);
      sendToChatGPT(text);
    }).catch(() => {
      alert('Failed to process image');
      setProcessing(false);
    });
  };

  const sendToChatGPT = async (text) => {
    setLoadingChat(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      const data = await response.json();
      if (response.ok) {
        setChatResponse(data.result);
      } else {
        setChatResponse('Error: ' + data.error);
      }
    } catch (e) {
      setChatResponse('Error sending request');
    } finally {
      setLoadingChat(false);
    }
  };

  return (
    <div>
      <h1>Upload Screenshot for OCR + ChatGPT Analysis</h1>
      <input type="file" accept="image/*" onChange={handleImageChange} />
      <button onClick={handleExtractText} disabled={processing || loadingChat}>
        {processing ? 'Processing OCR...' : loadingChat ? 'Waiting for ChatGPT...' : 'Extract & Analyze'}
      </button>

      <div>
        <h2>Extracted Text:</h2>
        <pre>{ocrText}</pre>
      </div>

      <div>
        <h2>ChatGPT Response:</h2>
        <pre>{chatResponse}</pre>
      </div>
    </div>
  );
}