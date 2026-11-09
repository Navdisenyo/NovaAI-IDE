import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Download,
  Upload,
  Trash2,
  Database,
  Sparkles,
  Key,
  HardDrive,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { LocalMemoryManager } from '../../services/LocalMemoryManager';
import { db } from '../../services/db';
import { LocalMemory } from '../../types';

export const PrivacyCenterPanel: React.FC = () => {
  const [memories, setMemories] = useState<LocalMemory[]>([]);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newCategory, setNewCategory] = useState<LocalMemory['category']>('preference');

  const [exportJson, setExportJson] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // Encryption test state
  const [passphrase, setPassphrase] = useState('');
  const [plainSecret, setPlainSecret] = useState('');
  const [encryptedSecret, setEncryptedSecret] = useState('');
  const [decryptedSecret, setDecryptedSecret] = useState('');

  // Storage counts
  const [counts, setCounts] = useState({
    memories: 0,
    conversations: 0,
    tasks: 0,
    notes: 0,
    gallery: 0,
  });

  useEffect(() => {
    loadMemories();
    updateCounts();
  }, []);

  const loadMemories = async () => {
    const list = await LocalMemoryManager.getAllMemories();
    setMemories(list);
  };

  const updateCounts = async () => {
    const [m, c, t, n, g] = await Promise.all([
      db.memories.count(),
      db.conversations.count(),
      db.tasks.count(),
      db.notes.count(),
      db.gallery.count(),
    ]);
    setCounts({ memories: m, conversations: c, tasks: t, notes: n, gallery: g });
  };

  const handleAddMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;

    await LocalMemoryManager.saveMemory(newKey.trim(), newValue.trim(), newCategory, true);
    setNewKey('');
    setNewValue('');
    loadMemories();
    updateCounts();
  };

  const handleDeleteMemory = async (id?: number) => {
    if (!id) return;
    await LocalMemoryManager.deleteMemory(id);
    loadMemories();
    updateCounts();
  };

  const handleClearAllMemory = async () => {
    if (window.confirm('Are you sure you want to clear all learned memories?')) {
      await LocalMemoryManager.clearAllMemories();
      loadMemories();
      updateCounts();
    }
  };

  const handleClearConversations = async () => {
    if (window.confirm('Clear all conversation history from local storage?')) {
      await db.conversations.clear();
      updateCounts();
    }
  };

  const handleExportBackup = async () => {
    const json = await LocalMemoryManager.exportAllData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `nova-ai-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    setExportJson('Backup downloaded successfully!');
    setTimeout(() => setExportJson(null), 3000);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const text = reader.result as string;
      const res = await LocalMemoryManager.importAllData(text);
      if (res.success) {
        setImportStatus(`Successfully restored ${res.count} records!`);
        loadMemories();
        updateCounts();
      } else {
        setImportStatus(`Import failed: ${res.error}`);
      }
      setTimeout(() => setImportStatus(null), 4000);
    };
    reader.readAsText(file);
  };

  const handleEncryptTest = async () => {
    if (!passphrase || !plainSecret) return;
    try {
      const cipher = await LocalMemoryManager.encryptText(plainSecret, passphrase);
      setEncryptedSecret(cipher);
      const dec = await LocalMemoryManager.decryptText(cipher, passphrase);
      setDecryptedSecret(dec);
    } catch (e: any) {
      alert('Encryption failed: ' + e.message);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-wide text-white flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            Local-First Privacy & Memory Center
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Complete transparency and sovereign control over your memories, conversations, and data.
          </p>
        </div>

        <div className="text-xs font-mono text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-3 py-1.5 rounded-xl flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>Local Sovereign Storage Active</span>
        </div>
      </div>

      {/* Storage Breakdown Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-[#090e1c] border border-white/5 rounded-xl p-3 text-center">
          <div className="text-xs font-mono text-slate-400">Memories</div>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">{counts.memories}</div>
        </div>
        <div className="bg-[#090e1c] border border-white/5 rounded-xl p-3 text-center">
          <div className="text-xs font-mono text-slate-400">Spoken Turns</div>
          <div className="text-xl font-bold font-mono text-indigo-400 mt-1">{counts.conversations}</div>
        </div>
        <div className="bg-[#090e1c] border border-white/5 rounded-xl p-3 text-center">
          <div className="text-xs font-mono text-slate-400">Tasks</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{counts.tasks}</div>
        </div>
        <div className="bg-[#090e1c] border border-white/5 rounded-xl p-3 text-center">
          <div className="text-xs font-mono text-slate-400">Notes</div>
          <div className="text-xl font-bold font-mono text-purple-400 mt-1">{counts.notes}</div>
        </div>
        <div className="bg-[#090e1c] border border-white/5 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
          <div className="text-xs font-mono text-slate-400">Gallery Art</div>
          <div className="text-xl font-bold font-mono text-pink-400 mt-1">{counts.gallery}</div>
        </div>
      </div>

      {/* Data Management Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Export & Import */}
        <div className="bg-[#090e1c]/80 border border-cyan-900/30 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-2">
            <Download className="w-4 h-4" />
            <span>Backup & Data Sovereign Export</span>
          </h3>
          <p className="text-xs text-slate-400">
            Export a full JSON archive of all your memories, tasks, notes, and gallery images to your local drive.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={handleExportBackup}
              className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 font-medium text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Full Backup</span>
            </button>

            <label className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 font-medium text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer">
              <Upload className="w-3.5 h-3.5" />
              <span>Restore from JSON</span>
              <input type="file" accept=".json" onChange={handleImportFile} className="hidden" />
            </label>
          </div>

          {exportJson && <div className="text-xs font-mono text-cyan-300">{exportJson}</div>}
          {importStatus && <div className="text-xs font-mono text-emerald-300">{importStatus}</div>}
        </div>

        {/* Purge and Reset */}
        <div className="bg-[#090e1c]/80 border border-rose-900/30 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-rose-400 font-semibold flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            <span>Right to be Forgotten & Purge Controls</span>
          </h3>
          <p className="text-xs text-slate-400">
            Instantly wipe your transcripts or learned memory. This action immediately deletes records from your IndexedDB.
          </p>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={handleClearConversations}
              className="px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20 font-medium text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Conversation History</span>
            </button>

            <button
              onClick={handleClearAllMemory}
              className="px-4 py-2 rounded-xl bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600/30 font-medium text-xs font-mono flex items-center gap-1.5 transition-colors"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Purge All Memories</span>
            </button>
          </div>
        </div>
      </div>

      {/* Learned Local Memories Inspector */}
      <div className="bg-[#090e1c]/80 border border-cyan-900/30 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-mono uppercase tracking-wider text-white font-semibold flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <span>Active Local Memory Store ({memories.length})</span>
          </h3>
          <span className="text-[11px] font-mono text-slate-500">Explicit User Consent Required</span>
        </div>

        {/* Add Memory Manually */}
        <form onSubmit={handleAddMemory} className="grid grid-cols-1 sm:grid-cols-4 gap-2">
          <input
            type="text"
            value={newKey}
            onChange={(e) => setNewKey(e.target.value)}
            placeholder="Key (e.g. favorite_framework)"
            className="bg-black/40 border border-cyan-900/40 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <input
            type="text"
            value={newValue}
            onChange={(e) => setNewValue(e.target.value)}
            placeholder="Value (e.g. React with TypeScript)"
            className="sm:col-span-2 bg-black/40 border border-cyan-900/40 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            disabled={!newKey.trim() || !newValue.trim()}
            className="py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-medium text-xs font-mono transition-colors"
          >
            Save Memory
          </button>
        </form>

        {/* Memory Items List */}
        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-cyan-950">
          {memories.map((mem) => (
            <div
              key={mem.id}
              className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 hover:border-cyan-500/30 transition-all text-xs"
            >
              <div className="min-w-0 pr-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold text-cyan-300">{mem.key}</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-400 border border-cyan-500/20">
                    {mem.category}
                  </span>
                </div>
                <p className="text-slate-300 mt-0.5 truncate">{mem.value}</p>
              </div>

              <button
                onClick={() => handleDeleteMemory(mem.id)}
                className="p-1 rounded text-slate-500 hover:text-rose-400 transition-colors shrink-0"
                title="Delete this memory"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Web Crypto API Client-Side Encryption Suite */}
      <div className="bg-[#090e1c]/80 border border-cyan-900/30 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <h3 className="text-xs font-mono uppercase tracking-wider text-white font-semibold">
              Web Crypto Client-Side Encryption (AES-GCM 256-bit)
            </h3>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-full">
            Hardware Accelerated
          </span>
        </div>

        <p className="text-xs text-slate-400">
          Sensitive notes and project secrets can be encrypted directly inside your browser with a passphrase before being stored. Keys never leave your machine.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
              Passphrase Key
            </label>
            <input
              type="password"
              value={passphrase}
              onChange={(e) => setPassphrase(e.target.value)}
              placeholder="Enter encryption passphrase..."
              className="w-full bg-black/40 border border-cyan-900/40 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1">
              Plain Text to Encrypt
            </label>
            <input
              type="text"
              value={plainSecret}
              onChange={(e) => setPlainSecret(e.target.value)}
              placeholder="Sensitive string or API credential..."
              className="w-full bg-black/40 border border-cyan-900/40 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>
        </div>

        <button
          onClick={handleEncryptTest}
          disabled={!passphrase || !plainSecret}
          className="px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 disabled:opacity-50 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors"
        >
          <Key className="w-3.5 h-3.5" />
          <span>Test Web Crypto AES-GCM Encryption</span>
        </button>

        {encryptedSecret && (
          <div className="p-3 rounded-xl bg-black/50 border border-cyan-950 text-xs font-mono space-y-1.5">
            <div className="text-[10px] text-slate-500 uppercase">Encrypted Cipher (Base64):</div>
            <div className="text-cyan-400 break-all select-all">{encryptedSecret}</div>
            <div className="text-[10px] text-slate-500 uppercase mt-2">Decrypted Verification:</div>
            <div className="text-emerald-400">{decryptedSecret}</div>
          </div>
        )}
      </div>
    </div>
  );
};
