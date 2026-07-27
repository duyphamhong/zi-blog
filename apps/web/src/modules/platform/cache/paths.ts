export const publicPaths = {
  home: '/',
  posts: '/posts',
  post: (slug: string) => `/posts/${slug}`,
  category: (slug: string) => `/categories/${slug}`,
  tag: (slug: string) => `/tags/${slug}`,
  author: (username: string) => `/authors/${username}`,
  series: (slug: string) => `/series/${slug}`,
  sitemap: '/sitemap.xml',
  rss: '/rss.xml',
} as const
