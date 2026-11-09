import Dexie, { Table } from 'dexie';
import { LocalMemory, ChatMessage, TaskItem, NoteItem, GalleryItem, AuditLog } from '../types';

export class NovaDatabase extends Dexie {
  memories!: Table<LocalMemory, number>;
  conversations!: Table<ChatMessage, string>;
  tasks!: Table<TaskItem, number>;
  notes!: Table<NoteItem, number>;
  gallery!: Table<GalleryItem, number>;
  auditLogs!: Table<AuditLog, number>;

  constructor() {
    super('NovaAIDatabase');
    this.version(1).stores({
      memories: '++id, key, category, timestamp',
      conversations: 'id, role, timestamp',
      tasks: '++id, priority, completed, createdAt',
      notes: '++id, title, updatedAt',
      gallery: '++id, prompt, createdAt',
      auditLogs: '++id, action, timestamp',
    });
  }
}

export const db = new NovaDatabase();

// Pre-seed default helpful memories and welcome content on first launch
export async function seedInitialLocalData() {
  const count = await db.memories.count();
  if (count === 0) {
    await db.memories.bulkAdd([
      {
        key: 'assistant_identity',
        value: 'NOVA is your young, expressive, and intelligent personal AI companion.',
        category: 'preference',
        timestamp: new Date().toISOString(),
        consent: true,
      },
      {
        key: 'language_adaptation',
        value: 'Fluent in English, Bengali (বাংলা), Hindi (हिन्दी), Banglish, and Hinglish.',
        category: 'language',
        timestamp: new Date().toISOString(),
        consent: true,
      },
      {
        key: 'privacy_guarantee',
        value: 'Local-first architecture. All conversation transcripts, tasks, and notes stay in browser IndexedDB.',
        category: 'preference',
        timestamp: new Date().toISOString(),
        consent: true,
      },
    ]);

    await db.tasks.bulkAdd([
      {
        title: 'Say "Hey NOVA" or press the central orb to start talking',
        dueDate: 'Today',
        priority: 'high',
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        title: 'Explore real-time web search and live weather',
        dueDate: 'Today',
        priority: 'medium',
        completed: false,
        createdAt: new Date().toISOString(),
      },
      {
        title: 'Generate a futuristic promotional image in Image Studio',
        dueDate: 'Tomorrow',
        priority: 'low',
        completed: false,
        createdAt: new Date().toISOString(),
      },
    ]);

    await db.notes.bulkAdd([
      {
        title: 'Welcome to NOVA AI Voice Assistant',
        content: `NOVA is engineered for real-time voice-to-voice interaction.\n\n• Wake word: Say "Hey NOVA" or "Hi NOVA" to activate hands-free.\n• Interruption: You can interrupt NOVA anytime while she is speaking.\n• Supported Languages: English, বাংলা, हिन्दी, Banglish, Hinglish.\n• Privacy: All notes, tasks, and memory are stored locally in your browser IndexedDB.`,
        tags: ['guide', 'welcome'],
        updatedAt: new Date().toISOString(),
      },
    ]);
  }
}
