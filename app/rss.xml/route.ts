import { getAllBlogPosts } from "../lib/blog";
import { absoluteUrl } from "../lib/seo";

export const revalidate = 3600;

export async function GET() {
  const posts = await getAllBlogPosts();

  const items = posts
    .map((post) => {
      const postUrl = absoluteUrl(`/blog/${post.slug}`);

      return `
        <item>
          <title><![CDATA[${post.title}]]></title>
          <link>${postUrl}</link>
          <guid>${postUrl}</guid>
          <pubDate>${new Date(post.publishedAt).toUTCString()}</pubDate>
          <description><![CDATA[${post.description}]]></description>
          <author><![CDATA[${post.author}]]></author>
          <category><![CDATA[${post.tags.join(", ")}]]></category>
        </item>
      `.trim();
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>NutriPilot Blog</title>
    <link>${absoluteUrl("/blog")}</link>
    <description>Practical nutrition planning and meal prep guides.</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    ${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
