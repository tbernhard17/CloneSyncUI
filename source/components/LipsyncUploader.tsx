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
    <div className="text-left">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-white mb-2">Audio File</label>
          <input
            type="file"
            accept="audio/*"
            onChange={(e) => setAudio(e.target.files?.[0] || null)}
            className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-300">Upload an audio file (.mp3, .wav) to use for lip syncing</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-white mb-2">Image or Video</label>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={(e) => setImage(e.target.files?.[0] || null)}
            className="w-full px-4 py-3 bg-slate-700/50 border border-purple-500/30 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
          <p className="mt-1 text-sm text-gray-300">Upload an image or video file (.jpg, .png, .mp4)</p>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-purple-600 text-white font-medium rounded-md shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 flex justify-center items-center"
        >
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Processing...
            </>
          ) : (
            "Generate Lipsync"
          )}
        </button>
      </form>

      {error && (
        <div className="mt-6 p-4 bg-red-900/50 border border-red-500 rounded-md">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {videoUrl && (
        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4 text-white">Result</h3>
          <div className="overflow-hidden rounded-md border border-purple-500/50 bg-black">
            <video 
              src={videoUrl} 
              controls 
              className="w-full h-auto" 
              poster="/placeholder-video.jpg"
            />
          </div>
          <div className="mt-4">
            <a 
              href={videoUrl}
              download
              className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-md"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path>
              </svg>
              Download Video
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default LipsyncUploader;
