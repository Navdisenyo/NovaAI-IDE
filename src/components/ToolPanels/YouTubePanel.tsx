import React, { useState } from 'react';
import {
  Youtube,
  Play,
  Search,
  ExternalLink,
  Sparkles,
  RefreshCw,
  Clock,
  Tv,
} from 'lucide-react';

interface YouTubeVideo {
  id: string;
  title: string;
  channel: string;
  duration: string;
  thumbnail: string;
}

export const YouTubePanel: React.FC = () => {
  const [query, setQuery] = useState('Next.js full course tutorial');
  const [loading, setLoading] = useState(false);
  const [videos, setVideos] = useState<YouTubeVideo[]>([
    {
      id: 'SqcY0GlETPk',
      title: 'React 19 & Next.js App Router — Full Course for Beginners',
      channel: 'JavaScript Mastery',
      duration: '42:10',
      thumbnail: 'https://i.ytimg.com/vi/SqcY0GlETPk/hqdefault.jpg',
    },
    {
      id: 'bMknfKXIFA8',
      title: 'React Course - Beginner\'s Tutorial for React JavaScript Based Web Development',
      channel: 'freeCodeCamp.org',
      duration: '1:18:24',
      thumbnail: 'https://i.ytimg.com/vi/bMknfKXIFA8/hqdefault.jpg',
    },
    {
      id: 'kJQP7kiw5Fk',
      title: 'Luis Fonsi - Despacito ft. Daddy Yankee',
      channel: 'Luis Fonsi',
      duration: '4:42',
      thumbnail: 'https://i.ytimg.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
    },
  ]);
  const [currentVideoId, setCurrentVideoId] = useState<string>('SqcY0GlETPk');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setLoading(true);
      const res = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await res.json();
      if (data.videos && data.videos.length > 0) {
        setVideos(data.videos);
        setCurrentVideoId(data.videos[0].id);
      }
    } catch (err) {
      console.error('YouTube search error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-wide text-white flex items-center gap-2.5">
            <Youtube className="w-6 h-6 text-red-500" />
            YouTube Voice Assistant & Player
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Search tutorials, music, and documentaries with hands-free voice control and zero-lag playback.
          </p>
        </div>

        <div className="text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Say: "Hey NOVA, play a tutorial on React 19"</span>
        </div>
      </div>

      {/* Main Grid: Player on Top / Left, Search results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Player */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-[#090e1c] border border-cyan-900/30 rounded-2xl overflow-hidden shadow-2xl">
            {/* 16:9 Video Embed */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${currentVideoId}?autoplay=1&enablejsapi=1&origin=${encodeURIComponent(
                  window.location.origin
                )}`}
                title="YouTube Video Player"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            </div>

            {/* Video Controls Bar */}
            <div className="p-4 flex items-center justify-between bg-[#070b16] border-t border-white/5">
              <div className="flex items-center gap-2">
                <Tv className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono text-slate-300">
                  Now Playing: {videos.find((v) => v.id === currentVideoId)?.title || currentVideoId}
                </span>
              </div>
              <a
                href={`https://www.youtube.com/watch?v=${currentVideoId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors"
              >
                <span>Watch on YouTube</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Voice Commands Cheat Sheet */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-2">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400">
              Supported Voice Commands:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono text-cyan-300/80">
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                • "Open YouTube and find Next.js"
              </div>
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                • "Play the first video"
              </div>
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                • "Find relaxing study music"
              </div>
              <div className="p-2 rounded-lg bg-white/[0.02] border border-white/5">
                • "Pause video / Resume video"
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Video List & Search */}
        <div className="space-y-4">
          {/* Search bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search YouTube..."
              className="flex-1 bg-[#090e1c] border border-cyan-900/40 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="p-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white transition-colors"
            >
              {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            </button>
          </form>

          {/* Video List */}
          <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-cyan-950">
            {videos.map((video) => {
              const isSelected = video.id === currentVideoId;
              return (
                <div
                  key={video.id}
                  onClick={() => setCurrentVideoId(video.id)}
                  className={`flex gap-3 p-2.5 rounded-xl border transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-red-950/30 border-red-500/50 shadow-md'
                      : 'bg-[#090e1c]/60 border-white/5 hover:border-cyan-500/30 hover:bg-white/[0.04]'
                  }`}
                >
                  {/* Thumbnail with overlay icon */}
                  <div className="relative w-28 h-18 rounded-lg overflow-hidden bg-black shrink-0">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] font-mono text-white">
                      {video.duration}
                    </span>
                  </div>

                  {/* Meta */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                    <h4
                      className={`text-xs font-medium line-clamp-2 leading-snug ${
                        isSelected ? 'text-red-300 font-semibold' : 'text-slate-200 group-hover:text-cyan-300'
                      }`}
                      title={video.title}
                    >
                      {video.title}
                    </h4>
                    <span className="text-[10px] text-slate-400 font-mono truncate">{video.channel}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
