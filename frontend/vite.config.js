import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';


export default defineConfig({
  plugins: [react(),
  ],
  server: {
    port: 3000, // Set your desired port
    open: true, // Automatically open the app in the browser
  },
});