import { getCollection } from 'astro:content';

export async function getAllPosts() {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function uniqueTags(posts: Awaited<ReturnType<typeof getAllPosts>>) {
  return [...new Set(posts.flatMap(post => post.data.tags ?? []))].sort((a, b) => a.localeCompare(b));
}

export function uniqueCategories(posts: Awaited<ReturnType<typeof getAllPosts>>) {
  return [...new Set(posts.map(post => post.data.category).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b));
}
