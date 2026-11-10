import { defineConfig } from 'vite';
import fs from 'node:fs';
import path from 'node:path';

function staticAssetsAndCleanHtmlPlugin() {
  return {
    name: 'static-assets-and-clean-html',
    transformIndexHtml(html) {
      // Saat dijalankan melalui Vite (dev maupun build), hapus importmap lokal karena Vite meresolusi bare imports secara otomatis
      return html.replace(
        /<script type="importmap">[\s\S]*?<\/script>/,
        ''
      );
    },
    closeBundle() {
      const srcDir = path.resolve(process.cwd(), 'assets');
      const destDir = path.resolve(process.cwd(), 'dist', 'assets');
      if (fs.existsSync(srcDir)) {
        fs.cpSync(srcDir, destDir, { recursive: true, force: true });
      }
    }
  };
}

export default defineConfig({
  server: {
    port: 5173,
    open: false
  },
  build: {
    outDir: 'dist',
    assetsDir: 'chunks',
    emptyOutDir: true,
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-three': ['three'],
          'vendor-motion': ['gsap', 'gsap/ScrollTrigger', 'lenis']
        }
      }
    }
  },
  plugins: [staticAssetsAndCleanHtmlPlugin()]
});
