import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

const larue = resolve(__dirname, 'larue_ultimate');

export default defineConfig(({ mode }) => {
  // Load .env from project root AND from larue_ultimate
  const rootEnv = loadEnv(mode, __dirname, '');
  const larueEnv = loadEnv(mode, larue, '');
  const env = { ...rootEnv, ...larueEnv };

  return {
    root: larue,
    plugins: [react()],
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    css: {
      postcss: larue,
    },
    build: {
      outDir: resolve(__dirname, 'dist'),
      emptyOutDir: true,
    },
  };
});
