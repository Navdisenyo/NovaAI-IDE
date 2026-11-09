import { db } from './db';
import { LocalMemory } from '../types';

export class LocalMemoryManager {
  /**
   * Save a user-approved memory with explicit consent
   */
  static async saveMemory(
    key: string,
    value: string,
    category: LocalMemory['category'] = 'preference',
    consent = true
  ): Promise<number> {
    const existing = await db.memories.where('key').equals(key).first();
    if (existing && existing.id) {
      await db.memories.update(existing.id, {
        value,
        category,
        timestamp: new Date().toISOString(),
        consent,
      });
      return existing.id;
    }

    return await db.memories.add({
      key,
      value,
      category,
      timestamp: new Date().toISOString(),
      consent,
    });
  }

  /**
   * Get all stored memories
   */
  static async getAllMemories(): Promise<LocalMemory[]> {
    return await db.memories.toArray();
  }

  /**
   * Search memories by keyword
   */
  static async searchMemories(query: string): Promise<LocalMemory[]> {
    const lower = query.toLowerCase();
    const all = await db.memories.toArray();
    return all.filter(
      (m) =>
        m.key.toLowerCase().includes(lower) ||
        m.value.toLowerCase().includes(lower) ||
        m.category.toLowerCase().includes(lower)
    );
  }

  /**
   * Delete specific memory by ID
   */
  static async deleteMemory(id: number): Promise<void> {
    await db.memories.delete(id);
  }

  /**
   * Clear all memories
   */
  static async clearAllMemories(): Promise<void> {
    await db.memories.clear();
  }

  /**
   * Export complete local database (memories, conversations, tasks, notes, gallery) to JSON
   */
  static async exportAllData(): Promise<string> {
    const [memories, conversations, tasks, notes, gallery, auditLogs] = await Promise.all([
      db.memories.toArray(),
      db.conversations.toArray(),
      db.tasks.toArray(),
      db.notes.toArray(),
      db.gallery.toArray(),
      db.auditLogs.toArray(),
    ]);

    const backup = {
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      data: {
        memories,
        conversations,
        tasks,
        notes,
        gallery,
        auditLogs,
      },
    };

    return JSON.stringify(backup, null, 2);
  }

  /**
   * Import complete database backup from JSON string
   */
  static async importAllData(jsonString: string): Promise<{ success: boolean; count: number; error?: string }> {
    try {
      const parsed = JSON.parse(jsonString);
      if (!parsed.data) {
        throw new Error('Invalid backup file format');
      }

      const { memories, conversations, tasks, notes, gallery, auditLogs } = parsed.data;

      if (Array.isArray(memories)) {
        await db.memories.clear();
        await db.memories.bulkAdd(memories);
      }
      if (Array.isArray(conversations)) {
        await db.conversations.clear();
        await db.conversations.bulkAdd(conversations);
      }
      if (Array.isArray(tasks)) {
        await db.tasks.clear();
        await db.tasks.bulkAdd(tasks);
      }
      if (Array.isArray(notes)) {
        await db.notes.clear();
        await db.notes.bulkAdd(notes);
      }
      if (Array.isArray(gallery)) {
        await db.gallery.clear();
        await db.gallery.bulkAdd(gallery);
      }
      if (Array.isArray(auditLogs)) {
        await db.auditLogs.clear();
        await db.auditLogs.bulkAdd(auditLogs);
      }

      return {
        success: true,
        count:
          (memories?.length || 0) +
          (conversations?.length || 0) +
          (tasks?.length || 0) +
          (notes?.length || 0),
      };
    } catch (err: any) {
      return { success: false, count: 0, error: err.message };
    }
  }

  /**
   * Reset the entire local-first storage database
   */
  static async resetDatabase(): Promise<void> {
    await Promise.all([
      db.memories.clear(),
      db.conversations.clear(),
      db.tasks.clear(),
      db.notes.clear(),
      db.gallery.clear(),
      db.auditLogs.clear(),
    ]);
  }

  /**
   * Web Crypto API: Encrypt text with user passphrase
   */
  static async encryptText(plainText: string, passphrase: string): Promise<string> {
    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const salt = window.crypto.getRandomValues(new Uint8Array(16));
    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['encrypt']
    );

    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      enc.encode(plainText)
    );

    const buffer = new Uint8Array(salt.byteLength + iv.byteLength + encrypted.byteLength);
    buffer.set(salt, 0);
    buffer.set(iv, salt.byteLength);
    buffer.set(new Uint8Array(encrypted), salt.byteLength + iv.byteLength);

    return btoa(String.fromCharCode(...buffer));
  }

  /**
   * Web Crypto API: Decrypt text with user passphrase
   */
  static async decryptText(cipherTextBase64: string, passphrase: string): Promise<string> {
    const binary = atob(cipherTextBase64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);

    const salt = buffer.slice(0, 16);
    const iv = buffer.slice(16, 28);
    const data = buffer.slice(28);

    const enc = new TextEncoder();
    const keyMaterial = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(passphrase),
      { name: 'PBKDF2' },
      false,
      ['deriveKey']
    );

    const key = await window.crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        salt,
        iterations: 100000,
        hash: 'SHA-256',
      },
      keyMaterial,
      { name: 'AES-GCM', length: 256 },
      false,
      ['decrypt']
    );

    const decrypted = await window.crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    return new TextDecoder().decode(decrypted);
  }
}
