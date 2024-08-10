import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'JS2D Game Engine',
  description: 'High-performance modular 2D game engine for TypeScript',
  base: '/js2d/',
  
  themeConfig: {
    nav: [
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'Examples', link: '/examples/' },
      { text: 'API Reference', link: '/api/' },
      { text: 'GitHub', link: 'https://github.com/your-org/js2d' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/introduction' },
            { text: 'Quick Start', link: '/guide/getting-started' },
            { text: 'Your First RPG', link: '/guide/first-rpg' },
            { text: 'Core Concepts', link: '/guide/concepts' }
          ]
        },
        {
          text: 'Architecture',
          items: [
            { text: 'Entity Component System', link: '/guide/ecs' },
            { text: 'Trait System', link: '/guide/traits' },
            { text: 'Rendering Pipeline', link: '/guide/rendering' },
            { text: 'Physics Integration', link: '/guide/physics' }
          ]
        },
        {
          text: 'Game Types',
          items: [
            { text: 'Top-Down RPG', link: '/guide/rpg' },
            { text: 'Procedural Worlds', link: '/guide/procedural' },
            { text: 'Multiplayer Games', link: '/guide/multiplayer' }
          ]
        },
        {
          text: 'Performance',
          items: [
            { text: 'Optimization Guide', link: '/guide/performance' },
            { text: 'Benchmarking', link: '/guide/benchmarks' },
            { text: 'Best Practices', link: '/guide/best-practices' }
          ]
        }
      ],
      '/examples/': [
        {
          text: 'Living Examples',
          items: [
            { text: 'Overview', link: '/examples/' },
            { text: 'Hello World', link: '/examples/hello-world' },
            { text: 'Top-Down RPG', link: '/examples/rpg' },
            { text: 'Physics Playground', link: '/examples/physics' },
            { text: 'Procedural World', link: '/examples/procedural' },
            { text: 'Performance Tests', link: '/examples/performance' }
          ]
        }
      ]
    },

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/your-org/js2d/edit/main/packages/docs/:path'
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 JS2D Contributors'
    }
  },

  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark'
    },
    codeTransformers: [
      // Enable line highlighting in code blocks
      {
        name: 'highlight-lines',
        preprocess(code, options) {
          return code
        }
      }
    ]
  },

  vite: {
    resolve: {
      alias: {
        '@js2d/engine': '../engine/src',
        '@js2d/traits-physics': '../traits-physics/src',
        '@js2d/traits-topdown': '../traits-topdown/src',
        '@js2d/traits-procedural': '../traits-procedural/src'
      }
    },
    optimizeDeps: {
      exclude: ['vitepress']
    }
  }
})