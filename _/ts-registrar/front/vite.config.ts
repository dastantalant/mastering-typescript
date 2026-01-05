import { fileURLToPath, URL } from 'node:url';

import { PrimeVueResolver } from '@primevue/auto-import-resolver';
import vue from '@vitejs/plugin-vue';
import Components from 'unplugin-vue-components/vite';
import { defineConfig } from 'vite';

export default defineConfig(
    ({ command, mode }) => {
      return {
        server: {
          port: 3000
        },
        plugins: [
          // tailwindcss(), // не работает
          vue(),
          // vueDevTools(),
          Components({
            resolvers: [
              PrimeVueResolver()
            ]
          }),
        ],
        resolve: {
          alias: {
            '@' : fileURLToPath(new URL('./src', import.meta.url))
          }
        }
      }
    })
