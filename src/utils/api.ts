/**
 * Utility for attaching client-configured Gemini API Key to backend requests
 */
export const getGeminiApiKeyHeader = (): Record<string, string> => {
  try {
    const saved = localStorage.getItem('nova_user_preferences');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.geminiApiKey && typeof parsed.geminiApiKey === 'string' && parsed.geminiApiKey.trim()) {
        return { 'x-gemini-api-key': parsed.geminiApiKey.trim() };
      }
    }
  } catch (e) {
    // ignore
  }
  return {};
};
