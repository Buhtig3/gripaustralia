import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';
import { rehypeCallouts } from './src/utils/rehype-callouts.mjs';

const isNetlify = !!process.env.NETLIFY;
const isGitHubActions = !!process.env.GITHUB_REPOSITORY;
const repoName = process.env.GITHUB_REPOSITORY ? process.env.GITHUB_REPOSITORY.split('/')[1] : 'grip-australia-alpha';
const repoOwner = process.env.GITHUB_REPOSITORY_OWNER || 'mappboy';

// Use project base subpath ONLY when explicitly building for GitHub Pages project site without custom domain
const isProjectPage = !isNetlify && !process.env.NO_BASE && isGitHubActions;
const siteUrl = isNetlify
  ? (process.env.URL || 'https://gripaustralia.com')
  : (isProjectPage ? `https://${repoOwner.toLowerCase()}.github.io` : 'https://gripaustralia.com');
const basePath = isProjectPage ? `/${repoName}` : '/';

export default defineConfig({
  site: siteUrl,
  base: basePath,
  markdown: {
    rehypePlugins: [rehypeCallouts],
  },
  integrations: [
    tailwind({
      applyBaseStyles: false,
    }),
    sitemap(),
  ],
});
