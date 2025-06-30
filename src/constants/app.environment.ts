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
const BACKEND_URL = getEnvVariable('VITE_BACKEND_URL', 'http://localhost:3000');
const CONTEXT_PATH = getEnvVariable('VITE_CONTEXT_PATH', '/api');

// Log for debugging
console.log('Using BACKEND_URL:', BACKEND_URL);
console.log('Using CONTEXT_PATH:', CONTEXT_PATH);

export { BACKEND_URL, CONTEXT_PATH };
