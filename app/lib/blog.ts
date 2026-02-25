import { promises as fs } from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";
import { MEAL_PLAN_GOALS, type MealPlanGoal } from "./mealPlanGoals";

export const BLOG_POSTS_PER_PAGE = 6;

const BLOG_CONTENT_DIR = path.join(process.cwd(), "content", "blog");

export type BlogFrontmatter = {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  tags: string[];
  coverImage?: string;
};

export type BlogPostSummary = BlogFrontmatter & {
  slug: string;
  readingMinutes: number;
};

export type BlogPost = BlogPostSummary & {
  content: string;
};

function parseSlugFromFilename(fileName: string): string {
  return fileName.replace(/\.mdx?$/i, "");
}

function assertFrontmatter(slug: string, frontmatter: Partial<BlogFrontmatter>): BlogFrontmatter {
  if (!frontmatter.title || !frontmatter.description || !frontmatter.publishedAt || !frontmatter.author) {
    throw new Error(`Invalid blog frontmatter for slug "${slug}"`);
  }

  return {
    title: frontmatter.title,
    description: frontmatter.description,
    publishedAt: frontmatter.publishedAt,
    updatedAt: frontmatter.updatedAt,
    author: frontmatter.author,
    tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
    coverImage: frontmatter.coverImage,
  };
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const files = await fs.readdir(BLOG_CONTENT_DIR);

  return files
    .filter((file) => /\.mdx?$/i.test(file))
    .map(parseSlugFromFilename)
    .sort((a, b) => a.localeCompare(b));
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const filePath = path.join(BLOG_CONTENT_DIR, `${slug}.mdx`);

  try {
    const raw = await fs.readFile(filePath, "utf8");
    const { data, content } = matter(raw);
    const frontmatter = assertFrontmatter(slug, data as Partial<BlogFrontmatter>);

    return {
      slug,
      ...frontmatter,
      content,
      readingMinutes: Math.max(1, Math.round(readingTime(content).minutes)),
    };
  } catch {
    return null;
  }
}

export async function getAllBlogPosts(): Promise<BlogPostSummary[]> {
  const slugs = await getAllBlogSlugs();
  const posts = await Promise.all(slugs.map((slug) => getBlogPostBySlug(slug)));

  return posts
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .map(({ content: _content, ...summary }) => summary);
}

export async function getPaginatedBlogPosts(page: number, postsPerPage = BLOG_POSTS_PER_PAGE): Promise<{
  posts: BlogPostSummary[];
  totalPages: number;
  currentPage: number;
}> {
  const allPosts = await getAllBlogPosts();
  const totalPages = Math.max(1, Math.ceil(allPosts.length / postsPerPage));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * postsPerPage;
  const end = start + postsPerPage;

  return {
    posts: allPosts.slice(start, end),
    totalPages,
    currentPage,
  };
}

export async function getRelatedBlogPosts(slug: string, tags: string[], limit = 3): Promise<BlogPostSummary[]> {
  const allPosts = await getAllBlogPosts();

  return allPosts
    .filter((post) => post.slug !== slug)
    .map((post) => {
      const sharedTags = post.tags.filter((tag) => tags.includes(tag)).length;
      return {
        post,
        score: sharedTags,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return new Date(b.post.publishedAt).getTime() - new Date(a.post.publishedAt).getTime();
    })
    .slice(0, limit)
    .map(({ post }) => post);
}

const GOAL_KEYWORDS: Record<MealPlanGoal, string[]> = {
  cutting: ["cutting", "fat loss", "deficit", "macro"],
  bulking: ["bulking", "bulk", "muscle", "surplus"],
  maintenance: ["maintenance", "sustainable", "routine", "meal prep"],
};

export async function getRelatedBlogPostsForGoal(goal: string, limit = 3): Promise<BlogPostSummary[]> {
  const allPosts = await getAllBlogPosts();
  const normalizedGoal = goal.trim().toLowerCase();
  const keywords = (MEAL_PLAN_GOALS as readonly string[]).includes(normalizedGoal)
    ? GOAL_KEYWORDS[normalizedGoal as MealPlanGoal]
    : [normalizedGoal];

  const scored = allPosts
    .map((post) => {
      const searchCorpus = `${post.title} ${post.description} ${post.tags.join(" ")}`.toLowerCase();
      const score = keywords.reduce((total, keyword) => (searchCorpus.includes(keyword) ? total + 1 : total), 0);

      return {
        post,
        score,
      };
    })
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return new Date(b.post.publishedAt).getTime() - new Date(a.post.publishedAt).getTime();
    });

  const withScore = scored.filter((item) => item.score > 0).slice(0, limit).map((item) => item.post);

  if (withScore.length >= limit) {
    return withScore;
  }

  const used = new Set(withScore.map((post) => post.slug));
  const fallback = scored
    .map((item) => item.post)
    .filter((post) => !used.has(post.slug))
    .slice(0, limit - withScore.length);

  return [...withScore, ...fallback];
}

export function getRelatedMealPlanGoalsForPost(post: Pick<BlogPostSummary, "title" | "description" | "tags">, limit = 2): MealPlanGoal[] {
  const searchCorpus = `${post.title} ${post.description} ${post.tags.join(" ")}`.toLowerCase();

  return MEAL_PLAN_GOALS
    .map((goal) => {
      const keywords = GOAL_KEYWORDS[goal];
      const score = keywords.reduce((total, keyword) => (searchCorpus.includes(keyword) ? total + 1 : total), 0);

      return {
        goal,
        score,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((item) => item.goal);
}

function normalizeSearchTokens(query: string): string[] {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
}

export function filterBlogPostsByQuery(posts: BlogPostSummary[], query: string): BlogPostSummary[] {
  const tokens = normalizeSearchTokens(query);

  if (tokens.length === 0) {
    return posts;
  }

  return posts.filter((post) => {
    const corpus = `${post.title} ${post.description} ${post.tags.join(" ")}`.toLowerCase();
    return tokens.every((token) => corpus.includes(token));
  });
}

export async function searchBlogPosts(query: string): Promise<BlogPostSummary[]> {
  const allPosts = await getAllBlogPosts();
  return filterBlogPostsByQuery(allPosts, query);
}
