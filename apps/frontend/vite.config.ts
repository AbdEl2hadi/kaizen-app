import { defineConfig } from 'vite'
import { devtools } from '@tanstack/devtools-vite'

import { tanstackStart } from '@tanstack/react-start/plugin/vite'

import viteReact from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const config = defineConfig({
  envDir: '../..',
  resolve: { tsconfigPaths: true },
  plugins: [
    devtools(),
    tailwindcss(),
    tanstackStart({
      importProtection: {
        client: {
          excludeFiles: ['**/node_modules/**', 'src/features/**/server/**'],
        },
      },
    }),
    viteReact(),
  ],
})

export default config
