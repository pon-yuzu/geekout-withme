import { defineConfig } from 'astro/config';
import cloudflare from '@astrojs/cloudflare';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  output: 'server',
  adapter: cloudflare({
    routes: { strategy: 'exclude', exclude: ['/audio/*', '/_astro/*', '/favicon.svg', '/instagram-qr.png'] },
  }),
  integrations: [react(), tailwind()],
  vite: {
    define: {
      __BUILD_ID__: JSON.stringify(
        'b-' + Date.now().toString(36).slice(-6)
      ),
      'process.env.NODE_ENV': JSON.stringify('production'),
    },
  },
});
