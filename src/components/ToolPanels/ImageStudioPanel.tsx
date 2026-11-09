import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  Sparkles,
  Download,
  Copy,
  Trash2,
  RefreshCw,
  Maximize2,
  X,
  Palette,
} from 'lucide-react';
import { db } from '../../services/db';
import { GalleryItem } from '../../types';
import { getGeminiApiKeyHeader } from '../../utils/api';

export const ImageStudioPanel: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [selectedStyle, setSelectedStyle] = useState('futuristic');
  const [loading, setLoading] = useState(false);
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [previewImage, setPreviewImage] = useState<GalleryItem | null>(null);

  const styles = [
    { id: 'futuristic', label: 'Futuristic Sci-Fi' },
    { id: 'cinematic', label: 'Cinematic 3D' },
    { id: 'photorealistic', label: 'Photorealistic' },
    { id: 'cyberpunk', label: 'Neon Cyberpunk' },
    { id: 'minimalist', label: 'Minimalist Vector' },
    { id: 'anime', label: 'Anime / Manga' },
  ];

  const aspectRatios = ['1:1', '16:9', '9:16', '4:3'];

  useEffect(() => {
    loadGallery();
  }, []);

  const loadGallery = async () => {
    const items = await db.gallery.reverse().toArray();
    setGallery(items);
  };

  const handleGenerate = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!prompt.trim() || loading) return;

    try {
      setLoading(true);
      const res = await fetch('/api/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getGeminiApiKeyHeader(),
        },
        body: JSON.stringify({
          prompt: prompt.trim(),
          aspectRatio,
          style: selectedStyle,
        }),
      });

      const data = await res.json();
      if (data.data) {
        const newItem: GalleryItem = {
          prompt: data.prompt || prompt,
          style: data.style || selectedStyle,
          aspectRatio: data.aspectRatio || aspectRatio,
          mimeType: data.mimeType || 'image/png',
          imageData: data.data,
          createdAt: new Date().toISOString(),
        };

        const id = await db.gallery.add(newItem);
        newItem.id = id;
        setGallery([newItem, ...gallery]);
      }
    } catch (err) {
      console.error('Image generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id?: number) => {
    if (!id) return;
    await db.gallery.delete(id);
    setGallery(gallery.filter((g) => g.id !== id));
    if (previewImage?.id === id) setPreviewImage(null);
  };

  const downloadImage = (item: GalleryItem) => {
    const link = document.createElement('a');
    link.href = `data:${item.mimeType};base64,${item.imageData}`;
    link.download = `nova-${item.style}-${Date.now()}.${item.mimeType.includes('svg') ? 'svg' : 'png'}`;
    link.click();
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-wide text-white flex items-center gap-2.5">
            <ImageIcon className="w-6 h-6 text-cyan-400" />
            AI Image Studio & Creative Gallery
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate concept art, marketing visuals, and UI illustrations through voice or text prompts.
          </p>
        </div>

        <div className="text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>Say: "Hey NOVA, generate a futuristic wallpaper"</span>
        </div>
      </div>

      {/* Generator Prompt Box */}
      <div className="bg-[#090e1c]/80 border border-cyan-900/30 rounded-2xl p-5 backdrop-blur-xl shadow-xl space-y-4">
        <form onSubmit={handleGenerate} className="space-y-4">
          <div>
            <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-2">
              Visual Prompt
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image, composition, mood, and lighting in detail..."
                className="flex-1 bg-black/40 border border-cyan-900/40 rounded-xl px-4 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40"
              />
              <button
                type="submit"
                disabled={loading || !prompt.trim()}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 disabled:opacity-50 text-white font-medium text-sm flex items-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{loading ? 'Generating...' : 'Generate'}</span>
              </button>
            </div>
          </div>

          {/* Style pills & Aspect ratios */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Styles */}
            <div>
              <span className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5 flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-cyan-400" />
                Artistic Style
              </span>
              <div className="flex flex-wrap gap-1.5">
                {styles.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setSelectedStyle(s.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      selectedStyle === s.id
                        ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-200 shadow-sm'
                        : 'bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Aspect Ratios */}
            <div>
              <span className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
                Aspect Ratio
              </span>
              <div className="flex gap-2">
                {aspectRatios.map((ratio) => (
                  <button
                    key={ratio}
                    type="button"
                    onClick={() => setAspectRatio(ratio)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all ${
                      aspectRatio === ratio
                        ? 'bg-cyan-500/25 border border-cyan-400 text-cyan-200 shadow-sm'
                        : 'bg-white/5 border border-white/10 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {ratio}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Generated Gallery */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold font-mono tracking-wide text-white">
            Local Gallery ({gallery.length})
          </h3>
          <span className="text-xs text-slate-400 font-mono">Persisted in browser IndexedDB</span>
        </div>

        {gallery.length === 0 ? (
          <div className="py-12 border border-white/5 rounded-2xl bg-[#090e1c]/40 text-center text-slate-500 text-sm">
            <ImageIcon className="w-10 h-10 mx-auto text-slate-600 mb-2" />
            No images generated yet. Try "Generate a futuristic cyberpunk skyline" above.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {gallery.map((item) => (
              <div
                key={item.id}
                className="group relative rounded-2xl overflow-hidden bg-[#090e1c] border border-cyan-900/30 hover:border-cyan-500/40 transition-all duration-300 shadow-lg"
              >
                {/* Image Display */}
                <div
                  className="aspect-square w-full overflow-hidden bg-black/60 flex items-center justify-center cursor-pointer"
                  onClick={() => setPreviewImage(item)}
                >
                  <img
                    src={`data:${item.mimeType};base64,${item.imageData}`}
                    alt={item.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>

                {/* Info Bar */}
                <div className="p-3 bg-[#0a0f1d] border-t border-white/5 space-y-1.5">
                  <p className="text-xs font-medium text-slate-200 line-clamp-2" title={item.prompt}>
                    {item.prompt}
                  </p>
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span className="capitalize">{item.style} • {item.aspectRatio}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => downloadImage(item)}
                        className="p-1 rounded hover:bg-white/10 hover:text-cyan-400 transition-colors"
                        title="Download Image"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-1 rounded hover:bg-white/10 hover:text-rose-400 transition-colors"
                        title="Delete from Gallery"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fullscreen Preview Modal */}
      {previewImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full bg-[#0a0f1d] border border-cyan-500/30 rounded-2xl overflow-hidden shadow-2xl space-y-4 p-6">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="max-h-[65vh] flex items-center justify-center overflow-hidden rounded-xl bg-black">
              <img
                src={`data:${previewImage.mimeType};base64,${previewImage.imageData}`}
                alt={previewImage.prompt}
                className="max-h-[65vh] w-auto object-contain"
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-white">{previewImage.prompt}</p>
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>
                  Style: {previewImage.style} | Aspect Ratio: {previewImage.aspectRatio} | Created:{' '}
                  {new Date(previewImage.createdAt).toLocaleString()}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => downloadImage(previewImage)}
                    className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
