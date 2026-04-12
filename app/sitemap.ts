import type { MetadataRoute } from "next";
import { absoluteUrl } from "./lib/seo";
import { MEAL_PLAN_GOALS } from "./lib/mealPlanGoals";
import { BLOG_POSTS_PER_PAGE, getAllBlogPosts, getAllBlogTags } from "./lib/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const lastModified = new Date();
  const [blogPosts, blogTags] = await Promise.all([getAllBlogPosts(), getAllBlogTags()]);
  const blogTotalPages = Math.max(1, Math.ceil(blogPosts.length / BLOG_POSTS_PER_PAGE));
  const goalPages: MetadataRoute.Sitemap = MEAL_PLAN_GOALS.map((goal) => ({
    url: absoluteUrl(`/meal-plan/${goal}`),
    lastModified,
    changeFrequency: "weekly",
    priority: 0.75,
    alternates: {
      languages: {
        "en-US": absoluteUrl(`/meal-plan/${goal}?lang=en-US`),
        "pt-BR": absoluteUrl(`/meal-plan/${goal}?lang=pt-BR`),
      },
    },
  }));
  const blogPostEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: absoluteUrl(`/blog/${post.slug}`),
    lastModified: post.updatedAt ? new Date(post.updatedAt) : new Date(post.publishedAt),
    changeFrequency: "monthly",
    priority: 0.72,
    alternates: {
      languages: {
        "en-US": absoluteUrl(`/blog/${post.slug}?lang=en-US`),
        "pt-BR": absoluteUrl(`/blog/${post.slug}?lang=pt-BR`),
      },
    },
  }));
  const blogPaginatedEntries: MetadataRoute.Sitemap = Array.from({ length: blogTotalPages }, (_, index) => index + 1)
    .filter((page) => page > 1)
    .map((page) => ({
      url: absoluteUrl(`/blog/page/${page}`),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.64,
      alternates: {
        languages: {
          "en-US": absoluteUrl(`/blog/page/${page}?lang=en-US`),
          "pt-BR": absoluteUrl(`/blog/page/${page}?lang=pt-BR`),
        },
      },
    }));
  const blogTagEntries: MetadataRoute.Sitemap = blogTags.map(({ slug }) => ({
    url: absoluteUrl(`/blog/tag/${slug}`),
    lastModified,
    changeFrequency: "weekly",
    priority: 0.68,
    alternates: {
      languages: {
        "en-US": absoluteUrl(`/blog/tag/${slug}?lang=en-US`),
        "pt-BR": absoluteUrl(`/blog/tag/${slug}?lang=pt-BR`),
      },
    },
  }));

  const staticPages: MetadataRoute.Sitemap = [
    { path: "/faq", priority: 0.82, freq: "monthly" },
    { path: "/about", priority: 0.7, freq: "monthly" },
    { path: "/contact", priority: 0.6, freq: "monthly" },
  ].map(({ path, priority, freq }) => ({
    url: absoluteUrl(path),
    lastModified,
    changeFrequency: freq as "monthly",
    priority,
    alternates: {
      languages: {
        "en-US": absoluteUrl(`${path}?lang=en-US`),
        "pt-BR": absoluteUrl(`${path}?lang=pt-BR`),
      },
    },
  }));

  return [
    {
      url: absoluteUrl("/"),
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
      alternates: {
        languages: {
          "en-US": absoluteUrl("/?lang=en-US"),
          "pt-BR": absoluteUrl("/?lang=pt-BR"),
        },
      },
    },
    {
      url: absoluteUrl("/pricing"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: {
          "en-US": absoluteUrl("/pricing?lang=en-US"),
          "pt-BR": absoluteUrl("/pricing?lang=pt-BR"),
        },
      },
    },
    {
      url: absoluteUrl("/meal-plan"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.85,
      alternates: {
        languages: {
          "en-US": absoluteUrl("/meal-plan?lang=en-US"),
          "pt-BR": absoluteUrl("/meal-plan?lang=pt-BR"),
        },
      },
    },
    {
      url: absoluteUrl("/blog"),
      lastModified,
      changeFrequency: "weekly",
      priority: 0.78,
      alternates: {
        languages: {
          "en-US": absoluteUrl("/blog?lang=en-US"),
          "pt-BR": absoluteUrl("/blog?lang=pt-BR"),
        },
      },
    },
    ...staticPages,
    ...goalPages,
    ...blogTagEntries,
    ...blogPaginatedEntries,
    ...blogPostEntries,
  ];
}
