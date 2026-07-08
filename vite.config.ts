import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';
import tailwindConfig from './larue_ultimate/tailwind.config.js';

const larue = resolve(__dirname, 'larue_ultimate');

export default defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, __dirname, ''), ...loadEnv(mode, larue, '') };

  return {
    root: larue,
    plugins: [react()],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    css: {
      postcss: {
        plugins: [
          tailwindcss(tailwindConfig),
          autoprefixer(),
        ],
      },
    },
    define: {
      'import.meta.env.VITE_SUPABASE_URL': JSON.stringify(env.VITE_SUPABASE_URL),
      'import.meta.env.VITE_SUPABASE_ANON_KEY': JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    },
    build: {
      outDir: resolve(__dirname, 'dist'),
      emptyOutDir: true,
    },
  };
});
