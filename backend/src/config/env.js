export function getGeminiApiKey() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error('La variable GEMINI_API_KEY est absente.');
  }
  return key;
}

export function getGeminiModel() {
  return process.env.GEMINI_MODEL || 'gemini-flash-latest';
}