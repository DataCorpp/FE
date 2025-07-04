// Access environment variables safely, with type checking
const getEnvVariable = (key: string, defaultValue: string): string => {
  // Check if import.meta.env is available (Vite)
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    return (import.meta.env[key] as string) || defaultValue;
  }
  
  // Fallback for SSR or other environments
  return defaultValue;
};

// Define constants with safe fallbacks
// Priority order:
// 1. VITE_BACKEND_URL (new preferred key, e.g. "https://api.example.com")
// 2. VITE_API_BASE_URL (older key – may already include context path)
// 3. VITE_API_URL (legacy key)
// 4. Fallback to localhost
const BACKEND_URL =
  getEnvVariable('VITE_BACKEND_URL', '') ||
  getEnvVariable('VITE_API_BASE_URL', '') ||
  getEnvVariable('VITE_API_URL', '') ||
  'http://localhost:3000';
const CONTEXT_PATH = getEnvVariable('VITE_CONTEXT_PATH', '/api');

export { BACKEND_URL, CONTEXT_PATH };
