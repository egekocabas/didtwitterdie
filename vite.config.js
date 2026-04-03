import { execSync } from "node:child_process"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const repositoryUrl = "https://github.com/egekocabas/didtwitterdie"

function resolveBuildSha() {
  const envSha =
    process.env.CF_PAGES_COMMIT_SHA ||
    process.env.GITHUB_SHA ||
    process.env.VITE_BUILD_SHA

  if (envSha) {
    return envSha.trim()
  }

  try {
    return execSync("git rev-parse HEAD", { stdio: ["ignore", "pipe", "ignore"] })
      .toString()
      .trim()
  } catch {
    return ""
  }
}

function resolveBuildTime() {
  const envBuildTime = process.env.VITE_BUILD_TIME

  if (envBuildTime) {
    return envBuildTime.trim()
  }

  return new Date().toISOString()
}

export default defineConfig({
  define: {
    __BUILD_SHA__: JSON.stringify(resolveBuildSha()),
    __BUILD_TIME__: JSON.stringify(resolveBuildTime()),
    __REPOSITORY_URL__: JSON.stringify(repositoryUrl),
  },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': '/src' },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/recharts')) {
            return 'vendor-recharts';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'vendor-motion';
          }
        },
      },
    },
  },
})
