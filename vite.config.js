import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'


function liveRoute() {
  const rewrite = (req, _res, next) => {
    if (req.url === '/live' || req.url.startsWith('/live?')) req.url = '/live.html'
    next()
  }
  return {
    name: 'live-route',
    configureServer(server) { server.middlewares.use(rewrite) },
    configurePreviewServer(server) { server.middlewares.use(rewrite) },
  }
}

export default defineConfig({
  plugins: [react(), liveRoute()],
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        live: fileURLToPath(new URL('./live.html', import.meta.url)),
      },
    },
  },
})
