import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
      include: ['**/*.js', '**/*.jsx'], // this enables JSX inside .js files
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
      
    }),
  ],
})
