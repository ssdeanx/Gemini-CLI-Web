import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const VITE_PORT = Number(env.VITE_PORT) || 4009
  const API_PORT = Number(env.PORT) || 4008

  return {
    plugins: [react(), tailwindcss()],
    server: {
      port: VITE_PORT,
      strictPort: true,
      proxy: {
        '/api': `http://localhost:${API_PORT}`,
        '/ws': {
          target: `ws://localhost:${API_PORT}`,
          ws: true
        }
      }
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'production',
      target: 'es2020',
      rollupOptions: {
        output: {
          // Better long-term caching by splitting heavy libs
          manualChunks: {
            react: ['react', 'react-dom', 'react-router-dom'],
            editor: [
              'monaco-editor',
              '@monaco-editor/react',
              '@uiw/react-codemirror',
              '@codemirror/lang-javascript',
              '@codemirror/lang-css',
              '@codemirror/lang-html',
              '@codemirror/lang-json',
              '@codemirror/lang-markdown',
              '@codemirror/lang-python',
              '@codemirror/theme-one-dark'
            ],
            xterm: ['xterm', 'xterm-addon-fit', '@xterm/addon-clipboard', '@xterm/addon-webgl']
          }
        }
      }
    },
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'monaco-editor',
        '@monaco-editor/react',
        '@uiw/react-codemirror',
        'xterm',
        'xterm-addon-fit',
        '@xterm/addon-clipboard',
        '@xterm/addon-webgl'
      ]
    },
    define: {
      __APP_ENV__: JSON.stringify(mode)
    }
  }
})
