import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { MarketingFooter } from "../components/MarketingFooter";
import { absoluteUrl, getLanguageAlternates } from "../lib/seo";
import { BLOG_POSTS_PER_PAGE, getAllBlogTags, getPaginatedBlogPosts, getRelatedMealPlanGoalsForPost, searchBlogPosts, tagToSlug } from "../lib/blog";
import { getMealPlanGoalContent } from "../lib/mealPlanGoals";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog",
  description: "Evidence-based guides on nutrition planning, meal prep systems, grocery optimization, and macro-friendly cooking for fitness goals.",
  alternates: {
    canonical: "/blog",
    languages: getLanguageAlternates("/blog"),
  },
  openGraph: {
    type: "website",
    title: "NutriPilot Blog — Nutrition Planning Guides",
    description: "Evidence-based guides on nutrition planning, meal prep systems, grocery optimization, and macro-friendly cooking for fitness goals.",
    url: "/blog",
  },
  twitter: {
    card: "summary_large_image",
    title: "NutriPilot Blog — Nutrition Planning Guides",
    description: "Practical guides on weekly nutrition systems, grocery execution, and sustainable meal prep workflows.",
  },
};

type BlogIndexPageProps = {
  searchParams?: {
    q?: string;
    search_term_string?: string;
  };
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const POSTS_PER_PAGE = 12;

export default async function BlogIndexPage({ searchParams }: BlogIndexPageProps) {
  const query = String(searchParams?.q || searchParams?.search_term_string || "").trim();
  const hasQuery = query.length > 0;

  const [paginated, topTags] = await Promise.all([
    hasQuery ? null : getPaginatedBlogPosts(1, POSTS_PER_PAGE),
    hasQuery ? Promise.resolve([]) : getAllBlogTags().then((tags) => tags.slice(0, 8)),
  ]);

  const posts = hasQuery
    ? await searchBlogPosts(query)
    : (paginated?.posts ?? []);
  const totalPages = hasQuery ? 1 : (paginated?.totalPages ?? 1);

  const featuredPost = !hasQuery && posts.length > 0 ? posts[0] : null;
  const gridPosts = !hasQuery && posts.length > 0 ? posts.slice(1) : posts;

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: hasQuery ? `NutriPilot Blog Articles for "${query}"` : "NutriPilot Blog Articles",
    itemListOrder: "https://schema.org/ItemListOrderDescending",
    numberOfItems: posts.length,
    itemListElement: posts.map((post, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(`/blog/${post.slug}`),
      name: post.title,
    })),
  };

  const collectionPageSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: hasQuery ? `NutriPilot Blog Search: ${query}` : "NutriPilot Blog",
    description: hasQuery
      ? `Search results for "${query}" on the NutriPilot blog.`
      : "Nutrition planning, meal prep, and grocery optimization guides from NutriPilot.",
    url: absoluteUrl(hasQuery ? `/blog?q=${encodeURIComponent(query)}` : "/blog"),
    isPartOf: { "@type": "WebSite", name: "NutriPilot", url: absoluteUrl("/") },
    hasPart: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: absoluteUrl(`/blog/${post.slug}`),
      datePublished: post.publishedAt,
      author: { "@type": "Person", name: post.author },
    })),
  };

  return (
    <div className="np-shell">
      <main className="np-main blog-index-main">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }} />

        <Breadcrumbs
          items={[{ label: "Home", href: "/" }, { label: "Blog" }]}
          currentPath="/blog"
        />

        {/* ── Header ── */}
        <section className="blog-index-header">
          <div className="blog-index-header-text">
            <h1>NutriPilot Blog</h1>
            <p className="np-page-subtitle">
              Evidence-based guides on nutrition planning, meal prep, and grocery strategy.
            </p>
          </div>

          <form action="/blog" method="get" className="blog-search-form" aria-label="Search blog posts">
            <div className="blog-search-input-wrap">
              <svg className="blog-search-icon" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.6" />
                <path d="M13 13l3.5 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                name="q"
                defaultValue={query}
                placeholder="Search 200+ articles…"
                aria-label="Search articles"
                className="blog-search-input"
              />
            </div>
            {hasQuery ? (
              <Link href="/blog" className="np-btn np-btn-secondary">Clear</Link>
            ) : null}
          </form>

          {hasQuery ? (
            <p className="blog-search-count">{posts.length} result{posts.length !== 1 ? "s" : ""} for &ldquo;{query}&rdquo;</p>
          ) : null}
        </section>

        {/* ── Tag quick-filters ── */}
        {topTags.length > 0 && !hasQuery ? (
          <nav className="blog-tag-filters" aria-label="Browse by topic">
            {topTags.map(({ tag, slug, count }) => (
              <Link key={slug} href={`/blog/tag/${slug}` as Route} className="blog-tag-filter">
                {tag}
                <span className="blog-tag-filter-count">{count}</span>
              </Link>
            ))}
            <Link href="/blog/tag/meal-prep" className="blog-tag-filter blog-tag-filter-more">
              All topics →
            </Link>
          </nav>
        ) : null}

        {/* ── Featured post ── */}
        {featuredPost ? (
          <article className="blog-card-featured">
            <div className="blog-card-featured-body">
              <div className="blog-meta blog-meta-featured">
                <span className="blog-featured-badge">Featured</span>
                <span>{formatDate(featuredPost.publishedAt)}</span>
                <span className="blog-meta-dot" aria-hidden="true">·</span>
                <span>{featuredPost.readingMinutes} min read</span>
              </div>
              <h2 className="blog-card-featured-title">
                <Link href={`/blog/${featuredPost.slug}` as Route}>{featuredPost.title}</Link>
              </h2>
              <p className="blog-card-featured-desc">{featuredPost.description}</p>
              <div className="blog-tags">
                {featuredPost.tags.slice(0, 4).map((tag) => (
                  <Link key={tag} href={`/blog/tag/${tagToSlug(tag)}` as Route} className="blog-tag">{tag}</Link>
                ))}
              </div>
              <div className="blog-card-featured-cta">
                <Link href={`/blog/${featuredPost.slug}` as Route} className="np-btn np-btn-primary">
                  Read article →
                </Link>
                {getRelatedMealPlanGoalsForPost(featuredPost, 1).map((goal) => {
                  const goalContent = getMealPlanGoalContent(goal);
                  if (!goalContent) return null;
                  return (
                    <Link key={goal} href={`/app?goal=${goal}&source=blog_featured&slug=${featuredPost.slug}` as Route} className="np-btn np-btn-secondary">
                      {goalContent.shortLabel} plan
                    </Link>
                  );
                })}
              </div>
            </div>
          </article>
        ) : null}

        {/* ── Grid ── */}
        <section className="blog-grid blog-grid-2col" aria-label="Blog articles">
          {gridPosts.map((post) => (
            <article key={post.slug} className="np-card blog-card">
              <p className="blog-meta">
                <span>{formatDate(post.publishedAt)}</span>
                <span className="blog-meta-dot" aria-hidden="true">·</span>
                <span>{post.readingMinutes} min read</span>
              </p>
              <h2>
                <Link href={`/blog/${post.slug}` as Route}>{post.title}</Link>
              </h2>
              <p className="blog-card-desc">{post.description}</p>
              <div className="blog-tags">
                {post.tags.slice(0, 3).map((tag) => (
                  <Link key={tag} href={`/blog/tag/${tagToSlug(tag)}` as Route} className="blog-tag">{tag}</Link>
                ))}
              </div>
              {getRelatedMealPlanGoalsForPost(post, 1).map((goal) => {
                const goalContent = getMealPlanGoalContent(goal);
                if (!goalContent) return null;
                return (
                  <p key={goal} className="blog-card-goal-link np-inline-note">
                    <Link href={`/meal-plan/${goal}` as Route}>{goalContent.shortLabel} plan</Link>
                    {" · "}
                    <Link href={`/app?goal=${goal}&source=${hasQuery ? "blog_search" : "blog_index"}&slug=${post.slug}` as Route}>Start free</Link>
                  </p>
                );
              })}
            </article>
          ))}
          {posts.length === 0 ? (
            <article className="np-card blog-card blog-card-empty">
              <h2>No articles found</h2>
              <p>Try a different keyword or <Link href="/blog">browse all articles</Link>.</p>
            </article>
          ) : null}
        </section>

        {/* ── Pagination ── */}
        {totalPages > 1 && !hasQuery ? (
          <nav className="blog-pagination" aria-label="Blog pagination">
            <span className="blog-pagination-label">Page 1 of {totalPages}</span>
            <div className="blog-pagination-pages">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((pageNumber) => {
                const href = pageNumber === 1 ? "/blog" : (`/blog/page/${pageNumber}` as Route);
                return (
                  <Link key={pageNumber} href={href as Route} className={`np-btn ${pageNumber === 1 ? "np-btn-primary" : "np-btn-secondary"}`} aria-current={pageNumber === 1 ? "page" : undefined}>
                    {pageNumber}
                  </Link>
                );
              })}
              {totalPages > 5 ? (
                <>
                  <span className="blog-pagination-ellipsis">…</span>
                  <Link href={`/blog/page/${totalPages}` as Route} className="np-btn np-btn-secondary">{totalPages}</Link>
                </>
              ) : null}
            </div>
          </nav>
        ) : null}

        {/* ── RSS note ── */}
        {!hasQuery ? (
          <p className="blog-rss-note">
            Subscribe via <a href="/rss.xml">RSS feed</a> · {" "}
            <Link href="/blog/page/2">More articles →</Link>
          </p>
        ) : null}
      </main>

      <MarketingFooter />
    </div>
  );
}
