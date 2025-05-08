import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// Component tagger function
function componentTagger() {
  return {
    name: 'component-tagger',
    transform(code: string, id: string) {
      if (!id.includes('node_modules') && (id.endsWith('.tsx') || id.endsWith('.jsx'))) {
        if (code.includes('export default')) {
          return code;
        }
      }
      return code;
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  
  return {
    server: {
      host: true,
      port: 8080,
      cors: {
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Origin'],
        exposedHeaders: ['Content-Type', 'Content-Length', 'Content-Disposition'],
        credentials: false
      },
    },
    plugins: [
      react(),
      isDev ? componentTagger() : null,
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./source"),
      },
      dedupe: [
        'react', 
        'react-dom', 
        'react-router-dom', 
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-slot',
        '@radix-ui/react-toast',
        '@radix-ui/react-alert-dialog',
        '@radix-ui/react-navigation-menu',
        '@radix-ui/react-progress',
        '@radix-ui/react-switch',
        '@radix-ui/react-tabs',
        '@radix-ui/react-popover',
        '@radix-ui/react-label',
        'lucide-react',
        'next-themes',
        '@tanstack/react-query',
        'zod',
        'class-variance-authority',
        'tailwind-merge',
        'sonner'
      ]
    },
    optimizeDeps: {
      include: [
        'react', 
        'react-dom', 
        'react-router-dom', 
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-slot',
        '@radix-ui/react-toast',
        '@radix-ui/react-alert-dialog',
        '@radix-ui/react-navigation-menu',
        '@radix-ui/react-progress',
        '@radix-ui/react-switch',
        '@radix-ui/react-tabs',
        '@radix-ui/react-popover',
        '@radix-ui/react-label',
        'lucide-react',
        'next-themes',
        '@tanstack/react-query',
        'zod',
        'class-variance-authority',
        'tailwind-merge',
        'sonner'
      ],
      force: true
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      emptyOutDir: true,
      chunkSizeWarningLimit: 800,
      sourcemap: isDev ? 'inline' : false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: !isDev,
          drop_debugger: !isDev,
        },
      },
      cssCodeSplit: false, // Ensure all CSS is bundled into one file
      assetsInlineLimit: 4096,
      rollupOptions: {
        output: {
          manualChunks: (id) => {
            // Core React dependencies
            if (id.includes('node_modules/react/') || 
                id.includes('node_modules/react-dom/') ||
                id.includes('node_modules/react-router-dom/')) {
              return 'react-vendor';
            }
            
            // Radix UI components
            if (id.includes('node_modules/@radix-ui/')) {
              return 'radix-vendor';
            }
            
            // Other UI libraries
            if (id.includes('node_modules/lucide-react/') ||
                id.includes('node_modules/next-themes/') ||
                id.includes('node_modules/sonner/') ||
                id.includes('node_modules/class-variance-authority/') ||
                id.includes('node_modules/tailwind-merge/')) {
              return 'ui-utils-vendor';
            }
            
            // Data management
            if (id.includes('node_modules/@tanstack/') ||
                id.includes('node_modules/zod/')) {
              return 'data-vendor';
            }
          }
        }
      }
    },
    css: {
      // Process all CSS with PostCSS
      postcss: {
        plugins: [
          require('tailwindcss'),
          require('autoprefixer'),
        ],
      },
      // Ensure CSS modules work correctly
      modules: {
        scopeBehaviour: 'global'
      },
    },
    base: './'
  };
});

