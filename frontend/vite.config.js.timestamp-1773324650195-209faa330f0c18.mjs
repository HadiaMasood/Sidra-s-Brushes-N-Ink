// vite.config.js
import { defineConfig } from "file:///C:/Users/WT/OneDrive/Desktop/desktop/sidra%20ink%20and%20brushes/frontend/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/WT/OneDrive/Desktop/desktop/sidra%20ink%20and%20brushes/frontend/node_modules/@vitejs/plugin-react/dist/index.js";
import viteCompression from "file:///C:/Users/WT/OneDrive/Desktop/desktop/sidra%20ink%20and%20brushes/frontend/node_modules/vite-plugin-compression/dist/index.mjs";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    // Gzip compression
    viteCompression({
      algorithm: "gzip",
      ext: ".gz"
    }),
    // Brotli compression
    viteCompression({
      algorithm: "brotliCompress",
      ext: ".br"
    })
  ],
  server: {
    host: "127.0.0.1",
    port: 3005,
    strictPort: false,
    proxy: {
      "/api": {
        target: "http://localhost:8000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api")
      }
    }
  },
  build: {
    // Optimize bundle
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        // Remove console.logs in production
        drop_debugger: true
      }
    },
    // Code splitting
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "redux-vendor": ["@reduxjs/toolkit", "react-redux", "zustand"],
          "ui-vendor": ["react-icons", "react-hot-toast", "react-helmet"],
          "form-vendor": ["react-hook-form", "axios"]
        },
        // Optimize chunk file names
        chunkFileNames: "assets/js/[name]-[hash].js",
        entryFileNames: "assets/js/[name]-[hash].js",
        assetFileNames: "assets/[ext]/[name]-[hash].[ext]"
      }
    },
    // Chunk size warning limit
    chunkSizeWarningLimit: 1e3,
    // Source maps for debugging (disable in production)
    sourcemap: false,
    // CSS code splitting
    cssCodeSplit: true,
    // Asset inlining threshold (10kb)
    assetsInlineLimit: 10240
  },
  // Optimize dependencies
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom", "@reduxjs/toolkit"]
  }
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxXVFxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXGRlc2t0b3BcXFxcc2lkcmEgaW5rIGFuZCBicnVzaGVzXFxcXGZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxXVFxcXFxPbmVEcml2ZVxcXFxEZXNrdG9wXFxcXGRlc2t0b3BcXFxcc2lkcmEgaW5rIGFuZCBicnVzaGVzXFxcXGZyb250ZW5kXFxcXHZpdGUuY29uZmlnLmpzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9DOi9Vc2Vycy9XVC9PbmVEcml2ZS9EZXNrdG9wL2Rlc2t0b3Avc2lkcmElMjBpbmslMjBhbmQlMjBicnVzaGVzL2Zyb250ZW5kL3ZpdGUuY29uZmlnLmpzXCI7aW1wb3J0IHsgZGVmaW5lQ29uZmlnIH0gZnJvbSAndml0ZSc7XHJcbmltcG9ydCByZWFjdCBmcm9tICdAdml0ZWpzL3BsdWdpbi1yZWFjdCc7XHJcbmltcG9ydCB2aXRlQ29tcHJlc3Npb24gZnJvbSAndml0ZS1wbHVnaW4tY29tcHJlc3Npb24nO1xyXG5cclxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcclxuICBwbHVnaW5zOiBbXHJcbiAgICByZWFjdCgpLFxyXG4gICAgLy8gR3ppcCBjb21wcmVzc2lvblxyXG4gICAgdml0ZUNvbXByZXNzaW9uKHtcclxuICAgICAgYWxnb3JpdGhtOiAnZ3ppcCcsXHJcbiAgICAgIGV4dDogJy5neicsXHJcbiAgICB9KSxcclxuICAgIC8vIEJyb3RsaSBjb21wcmVzc2lvblxyXG4gICAgdml0ZUNvbXByZXNzaW9uKHtcclxuICAgICAgYWxnb3JpdGhtOiAnYnJvdGxpQ29tcHJlc3MnLFxyXG4gICAgICBleHQ6ICcuYnInLFxyXG4gICAgfSksXHJcbiAgXSxcclxuICBzZXJ2ZXI6IHtcclxuICAgIGhvc3Q6ICcxMjcuMC4wLjEnLFxyXG4gICAgcG9ydDogMzAwNSxcclxuICAgIHN0cmljdFBvcnQ6IGZhbHNlLFxyXG4gICAgcHJveHk6IHtcclxuICAgICAgJy9hcGknOiB7XHJcbiAgICAgICAgdGFyZ2V0OiAnaHR0cDovL2xvY2FsaG9zdDo4MDAwJyxcclxuICAgICAgICBjaGFuZ2VPcmlnaW46IHRydWUsXHJcbiAgICAgICAgcmV3cml0ZTogKHBhdGgpID0+IHBhdGgucmVwbGFjZSgvXlxcL2FwaS8sICcvYXBpJyksXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gIH0sXHJcbiAgYnVpbGQ6IHtcclxuICAgIC8vIE9wdGltaXplIGJ1bmRsZVxyXG4gICAgbWluaWZ5OiAndGVyc2VyJyxcclxuICAgIHRlcnNlck9wdGlvbnM6IHtcclxuICAgICAgY29tcHJlc3M6IHtcclxuICAgICAgICBkcm9wX2NvbnNvbGU6IHRydWUsIC8vIFJlbW92ZSBjb25zb2xlLmxvZ3MgaW4gcHJvZHVjdGlvblxyXG4gICAgICAgIGRyb3BfZGVidWdnZXI6IHRydWUsXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgLy8gQ29kZSBzcGxpdHRpbmdcclxuICAgIHJvbGx1cE9wdGlvbnM6IHtcclxuICAgICAgb3V0cHV0OiB7XHJcbiAgICAgICAgbWFudWFsQ2h1bmtzOiB7XHJcbiAgICAgICAgICAvLyBWZW5kb3IgY2h1bmtzXHJcbiAgICAgICAgICAncmVhY3QtdmVuZG9yJzogWydyZWFjdCcsICdyZWFjdC1kb20nLCAncmVhY3Qtcm91dGVyLWRvbSddLFxyXG4gICAgICAgICAgJ3JlZHV4LXZlbmRvcic6IFsnQHJlZHV4anMvdG9vbGtpdCcsICdyZWFjdC1yZWR1eCcsICd6dXN0YW5kJ10sXHJcbiAgICAgICAgICAndWktdmVuZG9yJzogWydyZWFjdC1pY29ucycsICdyZWFjdC1ob3QtdG9hc3QnLCAncmVhY3QtaGVsbWV0J10sXHJcbiAgICAgICAgICAnZm9ybS12ZW5kb3InOiBbJ3JlYWN0LWhvb2stZm9ybScsICdheGlvcyddLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgLy8gT3B0aW1pemUgY2h1bmsgZmlsZSBuYW1lc1xyXG4gICAgICAgIGNodW5rRmlsZU5hbWVzOiAnYXNzZXRzL2pzL1tuYW1lXS1baGFzaF0uanMnLFxyXG4gICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnYXNzZXRzL2pzL1tuYW1lXS1baGFzaF0uanMnLFxyXG4gICAgICAgIGFzc2V0RmlsZU5hbWVzOiAnYXNzZXRzL1tleHRdL1tuYW1lXS1baGFzaF0uW2V4dF0nLFxyXG4gICAgICB9LFxyXG4gICAgfSxcclxuICAgIC8vIENodW5rIHNpemUgd2FybmluZyBsaW1pdFxyXG4gICAgY2h1bmtTaXplV2FybmluZ0xpbWl0OiAxMDAwLFxyXG4gICAgLy8gU291cmNlIG1hcHMgZm9yIGRlYnVnZ2luZyAoZGlzYWJsZSBpbiBwcm9kdWN0aW9uKVxyXG4gICAgc291cmNlbWFwOiBmYWxzZSxcclxuICAgIC8vIENTUyBjb2RlIHNwbGl0dGluZ1xyXG4gICAgY3NzQ29kZVNwbGl0OiB0cnVlLFxyXG4gICAgLy8gQXNzZXQgaW5saW5pbmcgdGhyZXNob2xkICgxMGtiKVxyXG4gICAgYXNzZXRzSW5saW5lTGltaXQ6IDEwMjQwLFxyXG4gIH0sXHJcbiAgLy8gT3B0aW1pemUgZGVwZW5kZW5jaWVzXHJcbiAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICBpbmNsdWRlOiBbJ3JlYWN0JywgJ3JlYWN0LWRvbScsICdyZWFjdC1yb3V0ZXItZG9tJywgJ0ByZWR1eGpzL3Rvb2xraXQnXSxcclxuICB9LFxyXG59KTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUFpWixTQUFTLG9CQUFvQjtBQUM5YSxPQUFPLFdBQVc7QUFDbEIsT0FBTyxxQkFBcUI7QUFFNUIsSUFBTyxzQkFBUSxhQUFhO0FBQUEsRUFDMUIsU0FBUztBQUFBLElBQ1AsTUFBTTtBQUFBO0FBQUEsSUFFTixnQkFBZ0I7QUFBQSxNQUNkLFdBQVc7QUFBQSxNQUNYLEtBQUs7QUFBQSxJQUNQLENBQUM7QUFBQTtBQUFBLElBRUQsZ0JBQWdCO0FBQUEsTUFDZCxXQUFXO0FBQUEsTUFDWCxLQUFLO0FBQUEsSUFDUCxDQUFDO0FBQUEsRUFDSDtBQUFBLEVBQ0EsUUFBUTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sTUFBTTtBQUFBLElBQ04sWUFBWTtBQUFBLElBQ1osT0FBTztBQUFBLE1BQ0wsUUFBUTtBQUFBLFFBQ04sUUFBUTtBQUFBLFFBQ1IsY0FBYztBQUFBLFFBQ2QsU0FBUyxDQUFDLFNBQVMsS0FBSyxRQUFRLFVBQVUsTUFBTTtBQUFBLE1BQ2xEO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQSxFQUNBLE9BQU87QUFBQTtBQUFBLElBRUwsUUFBUTtBQUFBLElBQ1IsZUFBZTtBQUFBLE1BQ2IsVUFBVTtBQUFBLFFBQ1IsY0FBYztBQUFBO0FBQUEsUUFDZCxlQUFlO0FBQUEsTUFDakI7QUFBQSxJQUNGO0FBQUE7QUFBQSxJQUVBLGVBQWU7QUFBQSxNQUNiLFFBQVE7QUFBQSxRQUNOLGNBQWM7QUFBQTtBQUFBLFVBRVosZ0JBQWdCLENBQUMsU0FBUyxhQUFhLGtCQUFrQjtBQUFBLFVBQ3pELGdCQUFnQixDQUFDLG9CQUFvQixlQUFlLFNBQVM7QUFBQSxVQUM3RCxhQUFhLENBQUMsZUFBZSxtQkFBbUIsY0FBYztBQUFBLFVBQzlELGVBQWUsQ0FBQyxtQkFBbUIsT0FBTztBQUFBLFFBQzVDO0FBQUE7QUFBQSxRQUVBLGdCQUFnQjtBQUFBLFFBQ2hCLGdCQUFnQjtBQUFBLFFBQ2hCLGdCQUFnQjtBQUFBLE1BQ2xCO0FBQUEsSUFDRjtBQUFBO0FBQUEsSUFFQSx1QkFBdUI7QUFBQTtBQUFBLElBRXZCLFdBQVc7QUFBQTtBQUFBLElBRVgsY0FBYztBQUFBO0FBQUEsSUFFZCxtQkFBbUI7QUFBQSxFQUNyQjtBQUFBO0FBQUEsRUFFQSxjQUFjO0FBQUEsSUFDWixTQUFTLENBQUMsU0FBUyxhQUFhLG9CQUFvQixrQkFBa0I7QUFBQSxFQUN4RTtBQUNGLENBQUM7IiwKICAibmFtZXMiOiBbXQp9Cg==
