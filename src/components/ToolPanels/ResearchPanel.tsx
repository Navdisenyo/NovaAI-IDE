import React, { useState, useEffect } from 'react';
import {
  Search,
  Globe,
  ExternalLink,
  CloudSun,
  Wind,
  Droplets,
  Calendar,
  Sparkles,
  RefreshCw,
  Sun,
  CloudRain,
} from 'lucide-react';
import { getGeminiApiKeyHeader } from '../../utils/api';

interface WebSource {
  title: string;
  url: string;
  domain: string;
}

interface SearchData {
  query: string;
  summary: string;
  sources: WebSource[];
  timestamp: string;
}

interface WeatherData {
  cityName: string;
  region: string;
  country: string;
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  precipitation: number;
  condition: string;
  icon: string;
  forecast: Array<{
    day: string;
    maxTemp: number;
    minTemp: number;
    rainProb: number;
    condition: string;
    icon: string;
  }>;
}

export const ResearchPanel: React.FC = () => {
  const [query, setQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult, setSearchResult] = useState<SearchData | null>(null);

  const [location, setLocation] = useState('Kolkata');
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);

  // Load initial weather on mount
  useEffect(() => {
    fetchWeather(location);
  }, []);

  const fetchWeather = async (loc: string) => {
    try {
      setWeatherLoading(true);
      const res = await fetch(`/api/weather?location=${encodeURIComponent(loc)}`);
      const data = await res.json();
      setWeatherData(data);
    } catch (err) {
      console.error('Weather error:', err);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    try {
      setSearchLoading(true);
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getGeminiApiKeyHeader(),
        },
        body: JSON.stringify({ query: query.trim() }),
      });
      const data = await res.json();
      setSearchResult(data);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setSearchLoading(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-wide text-white flex items-center gap-2.5">
            <Globe className="w-6 h-6 text-cyan-400" />
            Web Research & Global Weather
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time search grounding with verified sources and high-precision meteorological forecasts.
          </p>
        </div>

        {/* Quick Voice Hints */}
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/20 px-3 py-1.5 rounded-xl">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Say: "Hey NOVA, what's the latest tech news?"</span>
        </div>
      </div>

      {/* Grid: Search on Left, Weather on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Search Engine */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search Input Bar */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search web, news, tutorials, or research papers..."
                className="w-full bg-[#090e1c] border border-cyan-900/40 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40"
              />
            </div>
            <button
              type="submit"
              disabled={searchLoading || !query.trim()}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-medium text-sm flex items-center gap-2 transition-colors shadow-lg shadow-cyan-500/20"
            >
              {searchLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>Search</span>
            </button>
          </form>

          {/* Search Result Card */}
          {searchResult ? (
            <div className="bg-[#090e1c]/80 border border-cyan-900/30 rounded-2xl p-5 backdrop-blur-xl shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-cyan-400 font-semibold uppercase tracking-wider">
                    Query:
                  </span>
                  <span className="text-sm font-medium text-slate-200">"{searchResult.query}"</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  {new Date(searchResult.timestamp).toLocaleTimeString()}
                </span>
              </div>

              {/* Research Summary */}
              <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {searchResult.summary}
              </div>

              {/* Verified Sources */}
              {searchResult.sources && searchResult.sources.length > 0 && (
                <div className="pt-3 border-t border-white/5 space-y-2">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    Verified Citations & Sources ({searchResult.sources.length}):
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {searchResult.sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/40 hover:bg-cyan-950/20 transition-all group"
                      >
                        <div className="flex flex-col min-w-0 pr-2">
                          <span className="text-xs font-medium text-slate-200 truncate group-hover:text-cyan-300">
                            {src.title}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500 truncate">{src.domain}</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 rounded-2xl bg-[#090e1c]/40 border border-white/5 text-center space-y-3">
              <Search className="w-10 h-10 text-cyan-500/40 mx-auto" />
              <p className="text-sm text-slate-400">
                Enter a topic or ask NOVA with your voice to conduct real-time web research with live search grounding.
              </p>
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {['Latest AI discoveries', 'React 19 release notes', 'Quantum computing breakthroughs'].map((s) => (
                  <button
                    key={s}
                    onClick={() => {
                      setQuery(s);
                    }}
                    className="text-xs font-mono px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-cyan-300/80 hover:text-cyan-200 hover:border-cyan-500/30 transition-colors"
                  >
                    "{s}"
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Live Weather Card */}
        <div className="space-y-4">
          <div className="bg-[#090e1c]/80 border border-cyan-900/30 rounded-2xl p-5 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <div className="flex items-center gap-2">
                <CloudSun className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-mono font-semibold text-white tracking-wide">
                  Live Global Weather
                </h3>
              </div>
              <button
                onClick={() => fetchWeather(location)}
                disabled={weatherLoading}
                className="text-slate-400 hover:text-cyan-300 transition-colors"
                title="Refresh Weather"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${weatherLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* City Search */}
            <div className="flex gap-1.5">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City name..."
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <button
                onClick={() => fetchWeather(location)}
                className="px-3 py-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-medium hover:bg-cyan-500/30 transition-colors"
              >
                Find
              </button>
            </div>

            {weatherData && (
              <div className="space-y-4 pt-1">
                {/* Main Temperature Hero */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-br from-cyan-950/30 to-blue-950/20 border border-cyan-500/20">
                  <div>
                    <div className="text-lg font-bold text-white tracking-wide">
                      {weatherData.cityName}
                    </div>
                    <div className="text-xs text-slate-400">{weatherData.region || weatherData.country}</div>
                    <div className="text-xs font-medium text-cyan-300 mt-1">{weatherData.condition}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-extrabold font-mono text-white">
                      {weatherData.temperature}°C
                    </div>
                    <div className="text-[11px] text-slate-400">Feels like {weatherData.feelsLike}°C</div>
                  </div>
                </div>

                {/* Humidity & Wind */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-cyan-400" />
                    <div>
                      <div className="text-slate-400 text-[10px]">Humidity</div>
                      <div className="font-mono font-semibold text-slate-200">{weatherData.humidity}%</div>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/[0.02] border border-white/5 flex items-center gap-2">
                    <Wind className="w-4 h-4 text-blue-400" />
                    <div>
                      <div className="text-slate-400 text-[10px]">Wind Speed</div>
                      <div className="font-mono font-semibold text-slate-200">{weatherData.windSpeed} km/h</div>
                    </div>
                  </div>
                </div>

                {/* 5-Day Daily Forecast */}
                <div className="space-y-1.5 pt-1">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-cyan-400" />
                    <span>5-Day Outlook</span>
                  </div>
                  <div className="space-y-1">
                    {weatherData.forecast.map((f, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between px-3 py-1.5 rounded-lg bg-white/[0.02] text-xs"
                      >
                        <span className="font-medium text-slate-300 w-12">{f.day}</span>
                        <span className="text-[11px] text-slate-400 truncate flex-1 px-2">{f.condition}</span>
                        <div className="font-mono text-right flex items-center gap-1.5">
                          <span className="text-cyan-300 font-semibold">{f.maxTemp}°</span>
                          <span className="text-slate-500">{f.minTemp}°</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
