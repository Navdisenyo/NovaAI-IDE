export type SystemState =
  | 'idle'
  | 'wake_detected'
  | 'connecting'
  | 'listening'
  | 'thinking'
  | 'speaking'
  | 'executing'
  | 'waiting_approval'
  | 'error';

export type NavigationTab =
  | 'voice'
  | 'research'
  | 'image_studio'
  | 'youtube'
  | 'files'
  | 'website_builder'
  | 'productivity'
  | 'business_coding'
  | 'privacy'
  | 'settings';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  toolCall?: {
    name: string;
    args: Record<string, any>;
    result?: any;
  };
}

export interface LocalMemory {
  id?: number;
  key: string;
  value: string;
  category: 'preference' | 'language' | 'website' | 'project' | 'profile' | 'note';
  timestamp: string;
  consent: boolean;
}

export interface TaskItem {
  id?: number;
  title: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  createdAt: string;
}

export interface NoteItem {
  id?: number;
  title: string;
  content: string;
  tags: string[];
  updatedAt: string;
}

export interface GalleryItem {
  id?: number;
  prompt: string;
  style: string;
  aspectRatio: string;
  mimeType: string;
  imageData: string; // Base64
  createdAt: string;
}

export interface AuditLog {
  id?: number;
  action: string;
  permissionLevel: 'Level 1 (Safe)' | 'Level 2 (Confirmed)' | 'Level 3 (Restricted)';
  status: 'approved' | 'rejected' | 'auto_executed';
  details: string;
  timestamp: string;
}

export interface UserPreferences {
  voiceName: string; // 'Aoede' | 'Kore' | 'Zephyr' | 'Fenrir' | 'Puck'
  language: string; // 'auto' | 'en' | 'bn' | 'hi'
  speakingRate: number; // 0.8 - 1.2
  volume: number; // 0 - 1
  wakeWordEnabled: boolean;
  pushToTalk: boolean;
  noiseSuppression: boolean;
  clientEncryption: boolean;
  geminiApiKey?: string;
}
