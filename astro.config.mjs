import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

const isGitHubActions = !!process.env.GITHUB_REPOSITORY;
const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : 'grip-australia-alpha';
const repoOwner = process.env.GITHUB_REPOSITORY_OWNER || 'mappboy';

// If on a user/project repo page (e.g. mappboy.github.io/grip-australia-alpha), use base path
const isProjectPage = process.env.NO_BASE ? false : true;
const siteUrl = isProjectPage ? `https://${repoOwner.toLowerCase()}.github.io` : 'https://gripaustralia.com';
const basePath = isProjectPage ? `/${repoName}` : '/';

export default defineConfig({
  site: siteUrl,
  base: basePath,
  vite: {
    plugins: [
      {
        name: 'dev-root-redirect',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            if (basePath !== '/' && req.url && !req.url.startsWith(basePath)) {
              if (req.url === '/themes' || req.url === '/themes/') {
                res.writeHead(302, { Location: `${basePath}/themes/` });
                res.end();
                return;
              }
              if (req.url === '/' || req.url === '') {
                res.writeHead(302, { Location: `${basePath}/` });
                res.end();
                return;
              }
            }
            next();
          });
        }
      }
    ]
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
  ],
});
