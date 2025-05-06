
import React, { useState } from "react";

const LipsyncUploader: React.FC = () => {
  const [audio, setAudio] = useState<File | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setVideoUrl(null);

    if (!audio || !image) {
      setError("Please upload both an audio file and an image.");
      return;
    }

    const formData = new FormData();
    formData.append("qaAudio", audio);
    formData.append("image", image);

    try {
      setLoading(true);
      const response = await fetch("/api/v1/lipsync", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      if (result.status === "success") {
        setVideoUrl(result.url);
      } else {
        setError("Lipsync failed.");
      }
    } catch (err) {
      console.error(err);
      setError("An error occurred during upload.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white shadow rounded">
      <h2 className="text-2xl font-bold mb-4">Lipsync Generator</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Audio (.wav)</label>
          <input
            type="file"
            accept="audio/wav"
            onChange={(e) => setAudio(e.target.files?.[0] || null)}
            className="mt-1 block w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium">Image (.jpg/.png)</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="mt-1 block w-full"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Processing..." : "Generate Lipsync"}
        </button>
      </form>

      {error && <p className="mt-4 text-red-500">{error}</p>}

      {videoUrl && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Result:</h3>
          <video src={videoUrl} controls className="w-full rounded" />
        </div>
      )}
    </div>
  );
};

export default LipsyncUploader;
