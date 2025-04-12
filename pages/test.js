// pages/test.js

import { useState } from "react";

export default function TestPage() {
  const [scenario, setScenario] = useState("");
  const [image, setImage] = useState(null);
  const [savedPath, setSavedPath] = useState(null);
  const [loading, setLoading] = useState(false);

  const generateImage = async () => {
    setLoading(true);
    const res = await fetch("/api/imagegen", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scenario }),
    });
    const data = await res.json();
    setImage(data.image);
    setSavedPath(data.savedPath);
    setLoading(false);
  };

  return (
    <div className="min-h-screen p-10 bg-gray-100">
      <h1 className="text-2xl mb-4 font-bold">Scenario Image Generator</h1>
      <input
        className="border border-gray-300 p-2 w-full max-w-xl"
        value={scenario}
        onChange={(e) => setScenario(e.target.value)}
        placeholder="e.g. I dropped my cake and I am sad"
      />
      <button
        className="bg-blue-600 text-white px-4 py-2 mt-3 rounded hover:bg-blue-700"
        onClick={generateImage}
        disabled={loading}
      >
        {loading ? "Generating..." : "Generate Image"}
      </button>

      <div className="mt-8">
        <p className="text-sm text-gray-500">Reference Character:</p>
        <img src="/main.png" alt="Main character" className="w-48 mt-2 rounded" />
      </div>

      {image && (
        <div className="mt-10">
          <p className="text-sm text-gray-500">Generated Image:</p>
          <img src={image} alt="Generated result" className="rounded w-full max-w-4xl mt-2" />
          {savedPath && (
            <p className="mt-2 text-sm text-gray-600">
              Image saved locally at: {savedPath}
            </p>
          )}
        </div>
      )}
    </div>
  );
}