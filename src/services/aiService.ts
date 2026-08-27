export interface ChatAttachment {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  base64: string;
  previewUrl?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  attachments?: ChatAttachment[];
  model?: string;
  status?: 'sending' | 'complete' | 'error';
  error?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  messages: ChatMessage[];
  mode: 'research' | 'ideas' | 'support' | 'general';
  model: string;
}

export const AI_MODELS = [
  { id: 'gemini-3.7-flash', name: 'Gemini 3.7 Flash', tag: 'Recommended', desc: 'Hybrid reasoning, multimodal document & data analysis' },
  { id: 'gemini-3.5-flash', name: 'Gemini 3.5 Flash', tag: 'Fast & Versatile', desc: 'High-speed general academic queries and platform help' },
  { id: 'gemini-3.1-pro-preview', name: 'Gemini 3.1 Pro', tag: 'Deep Reasoning', desc: 'Complex scientific modeling, math, and STEM reasoning' },
  { id: 'gemini-3.1-flash-lite', name: 'Gemini 3.1 Flash Lite', tag: 'Ultra-Fast', desc: 'Instant lookups, brief definitions, quick answers' }
];

export interface PromptPreset {
  id: string;
  icon: string;
  category: 'review' | 'ideation' | 'grants' | 'data' | 'support';
  tag: string;
  title: string;
  description: string;
  prompt: string;
  requiresUpload?: boolean;
}

export const AI_PROMPT_PRESETS: PromptPreset[] = [
  {
    id: 'summarize_paper',
    icon: 'FileText',
    category: 'review',
    tag: 'PDF Review',
    title: 'Summarize Paper',
    description: 'Extract key objectives, methodology, quantitative results, and conclusions.',
    prompt: 'Please summarize the attached document. Highlight the core objectives, methodology, key findings, and practical applications.',
    requiresUpload: true
  },
  {
    id: 'generate_ideas',
    icon: 'Sparkles',
    category: 'ideation',
    tag: 'Ideation',
    title: 'Research Ideas',
    description: 'Brainstorm novel project concepts and testable hypotheses.',
    prompt: 'Suggest 3-4 innovative bioenergy or clean tech project ideas tailored to African resources, with proposed methodologies and expected impact.'
  },
  {
    id: 'grant_proposal',
    icon: 'Award',
    category: 'grants',
    tag: 'Grants',
    title: 'Grant Proposal',
    description: 'Draft a structured funding proposal outline with milestones.',
    prompt: 'Help me draft a clear grant proposal outline. Include project objectives, methodology, work packages, deliverables, and community impact.'
  },
  {
    id: 'data_insights',
    icon: 'BarChart2',
    category: 'data',
    tag: 'Data',
    title: 'Analyze Data',
    description: 'Inspect experimental numbers, gas yields, and reaction parameters.',
    prompt: 'Analyze the data and figures in this document. Identify key patterns, efficiency gains, and parameter optimizations.',
    requiresUpload: true
  },
  {
    id: 'peer_review',
    icon: 'BookOpen',
    category: 'review',
    tag: 'Review',
    title: 'Peer Feedback',
    description: 'Get constructive suggestions to improve manuscript quality.',
    prompt: 'Provide constructive peer review feedback on this text or manuscript. Focus on scientific clarity, methodology, and areas for improvement.',
    requiresUpload: true
  },
  {
    id: 'platform_support',
    icon: 'HelpCircle',
    category: 'support',
    tag: 'Platform',
    title: 'Platform Help',
    description: 'Learn how to publish papers, join alliances, or connect with peers.',
    prompt: 'How do I publish research on Aurenix, find collaborators, or apply for an institutional alliance?'
  }
];

const LOCAL_STORAGE_KEY = 'aurenix_ai_chat_sessions_v1';
const ACTIVE_SESSION_ID_KEY = 'aurenix_ai_active_session_id';

/**
 * Converts a browser File object to base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

/**
 * Send chat messages to server Gemini endpoint
 */
export async function sendAiChatMessage({
  messages,
  model = 'gemini-3.7-flash',
  systemInstruction,
  temperature = 0.7
}: {
  messages: Array<{ role: 'user' | 'assistant'; text: string; attachments?: ChatAttachment[] }>;
  model?: string;
  systemInstruction?: string;
  temperature?: number;
}): Promise<{ text: string; model: string; timestamp: string }> {
  try {
    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages,
        model,
        systemInstruction,
        temperature
      })
    });

    if (!response.ok) {
      let errorMsg = `Server returned ${response.status}: ${response.statusText}`;
      try {
        const errData = await response.json();
        if (errData.error) errorMsg = errData.error;
        if (errData.fallbackMessage) {
          return {
            text: errData.fallbackMessage,
            model,
            timestamp: new Date().toISOString()
          };
        }
      } catch (e) {
        // use default error message
      }
      throw new Error(errorMsg);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error in sendAiChatMessage:', error);
    throw error;
  }
}

/**
 * Manage local chat sessions
 */
export function getSavedChatSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Error reading chat sessions from localStorage:', err);
    return [];
  }
}

export function saveChatSession(session: ChatSession): void {
  try {
    const existing = getSavedChatSessions();
    const index = existing.findIndex((s) => s.id === session.id);
    let updated: ChatSession[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = { ...session, updatedAt: new Date().toISOString() };
    } else {
      updated = [session, ...existing];
    }
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated.slice(0, 50))); // Keep last 50
  } catch (err) {
    console.error('Error saving chat session:', err);
  }
}

export function deleteChatSession(sessionId: string): ChatSession[] {
  try {
    const existing = getSavedChatSessions();
    const filtered = existing.filter((s) => s.id !== sessionId);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (err) {
    console.error('Error deleting chat session:', err);
    return [];
  }
}

export function clearAllChatSessions(): void {
  try {
    localStorage.removeItem(LOCAL_STORAGE_KEY);
    localStorage.removeItem(ACTIVE_SESSION_ID_KEY);
  } catch (err) {
    console.error('Error clearing chat sessions:', err);
  }
}

export function getActiveSessionId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_SESSION_ID_KEY);
  } catch {
    return null;
  }
}

export function setActiveSessionId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_SESSION_ID_KEY, id);
  } catch (err) {
    console.error('Error setting active session ID:', err);
  }
}

export function createNewSession(mode: 'research' | 'ideas' | 'support' | 'general' = 'research'): ChatSession {
  const newId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const now = new Date().toISOString();
  const session: ChatSession = {
    id: newId,
    title: 'New Scientific Inquiry',
    createdAt: now,
    updatedAt: now,
    mode,
    model: 'gemini-3.7-flash',
    messages: []
  };
  saveChatSession(session);
  setActiveSessionId(newId);
  return session;
}
