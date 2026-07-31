// vite.config.ts
import { defineConfig, loadEnv } from "file:///home/project/node_modules/vite/dist/node/index.js";
import react from "file:///home/project/node_modules/@vitejs/plugin-react/dist/index.js";
import { resolve as resolve2 } from "path";
import tailwindcss from "file:///home/project/node_modules/tailwindcss/lib/index.js";
import autoprefixer from "file:///home/project/node_modules/autoprefixer/lib/autoprefixer.js";

// larue_ultimate/tailwind.config.js
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
var __vite_injected_original_import_meta_url = "file:///home/project/larue_ultimate/tailwind.config.js";
var __dirname2 = dirname(fileURLToPath(__vite_injected_original_import_meta_url));
var tailwind_config_default = {
  content: [
    resolve(__dirname2, "index.html"),
    resolve(__dirname2, "src/**/*.{js,ts,jsx,tsx}")
  ],
  theme: {
    extend: {
      fontFamily: {
        cormorant: ['"Cormorant Garamond"', "Georgia", "serif"],
        inter: ["Inter", "system-ui", "sans-serif"],
        "serif-display": ['"Cormorant Garamond"', "Georgia", "serif"]
      },
      colors: {
        beige: {
          50: "#FAF9F6",
          100: "#F5F2EE",
          200: "#F0EBE3",
          300: "#E8DDD0",
          400: "#D4C4B0"
        },
        taupe: {
          DEFAULT: "#8B7355",
          light: "#C9A96E",
          dark: "#5a4a35"
        },
        gold: {
          DEFAULT: "#8B7355",
          light: "#C9A96E",
          dark: "#5a4a35"
        }
      }
    }
  },
  plugins: []
};

// vite.config.ts
var __vite_injected_original_dirname = "/home/project";
var larue = resolve2(__vite_injected_original_dirname, "larue_ultimate");
var vite_config_default = defineConfig(({ mode }) => {
  const env = { ...loadEnv(mode, __vite_injected_original_dirname, ""), ...loadEnv(mode, larue, "") };
  return {
    root: larue,
    plugins: [react()],
    optimizeDeps: {
      exclude: ["lucide-react"]
    },
    css: {
      postcss: {
        plugins: [
          tailwindcss(tailwind_config_default),
          autoprefixer()
        ]
      }
    },
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(env.VITE_SUPABASE_URL),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(env.VITE_SUPABASE_ANON_KEY)
    },
    build: {
      outDir: resolve2(__vite_injected_original_dirname, "dist"),
      emptyOutDir: true
    }
  };
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiLCAibGFydWVfdWx0aW1hdGUvdGFpbHdpbmQuY29uZmlnLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvcHJvamVjdFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvcHJvamVjdC92aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L3ZpdGUuY29uZmlnLnRzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52IH0gZnJvbSAndml0ZSc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnO1xuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xuaW1wb3J0IHRhaWx3aW5kY3NzIGZyb20gJ3RhaWx3aW5kY3NzJztcbmltcG9ydCBhdXRvcHJlZml4ZXIgZnJvbSAnYXV0b3ByZWZpeGVyJztcbmltcG9ydCB0YWlsd2luZENvbmZpZyBmcm9tICcuL2xhcnVlX3VsdGltYXRlL3RhaWx3aW5kLmNvbmZpZy5qcyc7XG5cbmNvbnN0IGxhcnVlID0gcmVzb2x2ZShfX2Rpcm5hbWUsICdsYXJ1ZV91bHRpbWF0ZScpO1xuXG5leHBvcnQgZGVmYXVsdCBkZWZpbmVDb25maWcoKHsgbW9kZSB9KSA9PiB7XG4gIGNvbnN0IGVudiA9IHsgLi4ubG9hZEVudihtb2RlLCBfX2Rpcm5hbWUsICcnKSwgLi4ubG9hZEVudihtb2RlLCBsYXJ1ZSwgJycpIH07XG5cbiAgcmV0dXJuIHtcbiAgICByb290OiBsYXJ1ZSxcbiAgICBwbHVnaW5zOiBbcmVhY3QoKV0sXG4gICAgb3B0aW1pemVEZXBzOiB7XG4gICAgICBleGNsdWRlOiBbJ2x1Y2lkZS1yZWFjdCddLFxuICAgIH0sXG4gICAgY3NzOiB7XG4gICAgICBwb3N0Y3NzOiB7XG4gICAgICAgIHBsdWdpbnM6IFtcbiAgICAgICAgICB0YWlsd2luZGNzcyh0YWlsd2luZENvbmZpZyksXG4gICAgICAgICAgYXV0b3ByZWZpeGVyKCksXG4gICAgICAgIF0sXG4gICAgICB9LFxuICAgIH0sXG4gICAgZGVmaW5lOiB7XG4gICAgICAnaW1wb3J0Lm1ldGEuZW52LlZJVEVfU1VQQUJBU0VfVVJMJzogSlNPTi5zdHJpbmdpZnkoZW52LlZJVEVfU1VQQUJBU0VfVVJMKSxcbiAgICAgICdpbXBvcnQubWV0YS5lbnYuVklURV9TVVBBQkFTRV9BTk9OX0tFWSc6IEpTT04uc3RyaW5naWZ5KGVudi5WSVRFX1NVUEFCQVNFX0FOT05fS0VZKSxcbiAgICB9LFxuICAgIGJ1aWxkOiB7XG4gICAgICBvdXREaXI6IHJlc29sdmUoX19kaXJuYW1lLCAnZGlzdCcpLFxuICAgICAgZW1wdHlPdXREaXI6IHRydWUsXG4gICAgfSxcbiAgfTtcbn0pO1xuIiwgImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvaG9tZS9wcm9qZWN0L2xhcnVlX3VsdGltYXRlXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCIvaG9tZS9wcm9qZWN0L2xhcnVlX3VsdGltYXRlL3RhaWx3aW5kLmNvbmZpZy5qc1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vaG9tZS9wcm9qZWN0L2xhcnVlX3VsdGltYXRlL3RhaWx3aW5kLmNvbmZpZy5qc1wiO2ltcG9ydCB7IHJlc29sdmUsIGRpcm5hbWUgfSBmcm9tICdwYXRoJztcbmltcG9ydCB7IGZpbGVVUkxUb1BhdGggfSBmcm9tICd1cmwnO1xuXG5jb25zdCBfX2Rpcm5hbWUgPSBkaXJuYW1lKGZpbGVVUkxUb1BhdGgoaW1wb3J0Lm1ldGEudXJsKSk7XG5cbi8qKiBAdHlwZSB7aW1wb3J0KCd0YWlsd2luZGNzcycpLkNvbmZpZ30gKi9cbmV4cG9ydCBkZWZhdWx0IHtcbiAgY29udGVudDogW1xuICAgIHJlc29sdmUoX19kaXJuYW1lLCAnaW5kZXguaHRtbCcpLFxuICAgIHJlc29sdmUoX19kaXJuYW1lLCAnc3JjLyoqLyoue2pzLHRzLGpzeCx0c3h9JyksXG4gIF0sXG4gIHRoZW1lOiB7XG4gICAgZXh0ZW5kOiB7XG4gICAgICBmb250RmFtaWx5OiB7XG4gICAgICAgIGNvcm1vcmFudDogWydcIkNvcm1vcmFudCBHYXJhbW9uZFwiJywgJ0dlb3JnaWEnLCAnc2VyaWYnXSxcbiAgICAgICAgaW50ZXI6IFsnSW50ZXInLCAnc3lzdGVtLXVpJywgJ3NhbnMtc2VyaWYnXSxcbiAgICAgICAgJ3NlcmlmLWRpc3BsYXknOiBbJ1wiQ29ybW9yYW50IEdhcmFtb25kXCInLCAnR2VvcmdpYScsICdzZXJpZiddLFxuICAgICAgfSxcbiAgICAgIGNvbG9yczoge1xuICAgICAgICBiZWlnZToge1xuICAgICAgICAgIDUwOiAnI0ZBRjlGNicsXG4gICAgICAgICAgMTAwOiAnI0Y1RjJFRScsXG4gICAgICAgICAgMjAwOiAnI0YwRUJFMycsXG4gICAgICAgICAgMzAwOiAnI0U4REREMCcsXG4gICAgICAgICAgNDAwOiAnI0Q0QzRCMCcsXG4gICAgICAgIH0sXG4gICAgICAgIHRhdXBlOiB7XG4gICAgICAgICAgREVGQVVMVDogJyM4QjczNTUnLFxuICAgICAgICAgIGxpZ2h0OiAnI0M5QTk2RScsXG4gICAgICAgICAgZGFyazogJyM1YTRhMzUnLFxuICAgICAgICB9LFxuICAgICAgICBnb2xkOiB7XG4gICAgICAgICAgREVGQVVMVDogJyM4QjczNTUnLFxuICAgICAgICAgIGxpZ2h0OiAnI0M5QTk2RScsXG4gICAgICAgICAgZGFyazogJyM1YTRhMzUnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICB9LFxuICBwbHVnaW5zOiBbXSxcbn07XG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQXlOLFNBQVMsY0FBYyxlQUFlO0FBQy9QLE9BQU8sV0FBVztBQUNsQixTQUFTLFdBQUFBLGdCQUFlO0FBQ3hCLE9BQU8saUJBQWlCO0FBQ3hCLE9BQU8sa0JBQWtCOzs7QUNKcVAsU0FBUyxTQUFTLGVBQWU7QUFDL1MsU0FBUyxxQkFBcUI7QUFEc0ksSUFBTSwyQ0FBMkM7QUFHck4sSUFBTUMsYUFBWSxRQUFRLGNBQWMsd0NBQWUsQ0FBQztBQUd4RCxJQUFPLDBCQUFRO0FBQUEsRUFDYixTQUFTO0FBQUEsSUFDUCxRQUFRQSxZQUFXLFlBQVk7QUFBQSxJQUMvQixRQUFRQSxZQUFXLDBCQUEwQjtBQUFBLEVBQy9DO0FBQUEsRUFDQSxPQUFPO0FBQUEsSUFDTCxRQUFRO0FBQUEsTUFDTixZQUFZO0FBQUEsUUFDVixXQUFXLENBQUMsd0JBQXdCLFdBQVcsT0FBTztBQUFBLFFBQ3RELE9BQU8sQ0FBQyxTQUFTLGFBQWEsWUFBWTtBQUFBLFFBQzFDLGlCQUFpQixDQUFDLHdCQUF3QixXQUFXLE9BQU87QUFBQSxNQUM5RDtBQUFBLE1BQ0EsUUFBUTtBQUFBLFFBQ04sT0FBTztBQUFBLFVBQ0wsSUFBSTtBQUFBLFVBQ0osS0FBSztBQUFBLFVBQ0wsS0FBSztBQUFBLFVBQ0wsS0FBSztBQUFBLFVBQ0wsS0FBSztBQUFBLFFBQ1A7QUFBQSxRQUNBLE9BQU87QUFBQSxVQUNMLFNBQVM7QUFBQSxVQUNULE9BQU87QUFBQSxVQUNQLE1BQU07QUFBQSxRQUNSO0FBQUEsUUFDQSxNQUFNO0FBQUEsVUFDSixTQUFTO0FBQUEsVUFDVCxPQUFPO0FBQUEsVUFDUCxNQUFNO0FBQUEsUUFDUjtBQUFBLE1BQ0Y7QUFBQSxJQUNGO0FBQUEsRUFDRjtBQUFBLEVBQ0EsU0FBUyxDQUFDO0FBQ1o7OztBRHhDQSxJQUFNLG1DQUFtQztBQU96QyxJQUFNLFFBQVFDLFNBQVEsa0NBQVcsZ0JBQWdCO0FBRWpELElBQU8sc0JBQVEsYUFBYSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3hDLFFBQU0sTUFBTSxFQUFFLEdBQUcsUUFBUSxNQUFNLGtDQUFXLEVBQUUsR0FBRyxHQUFHLFFBQVEsTUFBTSxPQUFPLEVBQUUsRUFBRTtBQUUzRSxTQUFPO0FBQUEsSUFDTCxNQUFNO0FBQUEsSUFDTixTQUFTLENBQUMsTUFBTSxDQUFDO0FBQUEsSUFDakIsY0FBYztBQUFBLE1BQ1osU0FBUyxDQUFDLGNBQWM7QUFBQSxJQUMxQjtBQUFBLElBQ0EsS0FBSztBQUFBLE1BQ0gsU0FBUztBQUFBLFFBQ1AsU0FBUztBQUFBLFVBQ1AsWUFBWSx1QkFBYztBQUFBLFVBQzFCLGFBQWE7QUFBQSxRQUNmO0FBQUEsTUFDRjtBQUFBLElBQ0Y7QUFBQSxJQUNBLFFBQVE7QUFBQSxNQUNOLHFDQUFxQyxLQUFLLFVBQVUsSUFBSSxpQkFBaUI7QUFBQSxNQUN6RSwwQ0FBMEMsS0FBSyxVQUFVLElBQUksc0JBQXNCO0FBQUEsSUFDckY7QUFBQSxJQUNBLE9BQU87QUFBQSxNQUNMLFFBQVFBLFNBQVEsa0NBQVcsTUFBTTtBQUFBLE1BQ2pDLGFBQWE7QUFBQSxJQUNmO0FBQUEsRUFDRjtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbInJlc29sdmUiLCAiX19kaXJuYW1lIiwgInJlc29sdmUiXQp9Cg==
