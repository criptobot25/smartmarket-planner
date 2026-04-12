import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { Breadcrumbs } from "../components/Breadcrumbs";
import { MarketingFooter } from "../components/MarketingFooter";
import { absoluteUrl, getLanguageAlternates } from "../lib/seo";
import { BLOG_POSTS_PER_PAGE, getPaginatedBlogPosts, getRelatedMealPlanGoalsForPost, searchBlogPosts, tagToSlug } from "../lib/blog";
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
    month: "long",
    day: "numeric",
  });
}

export default async function BlogIndexPage({ searchParams }: BlogIndexPageProps) {
  const query = String(searchParams?.q || searchParams?.search_term_string || "").trim();
  const hasQuery = query.length > 0;
  const paginated = hasQuery ? null : await getPaginatedBlogPosts(1, BLOG_POSTS_PER_PAGE);

  const posts = hasQuery
    ? await searchBlogPosts(query)
    : (paginated?.posts ?? []);
  const totalPages = hasQuery
    ? 1
    : (paginated?.totalPages ?? 1);

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
    isPartOf: {
      "@type": "WebSite",
      name: "NutriPilot",
      url: absoluteUrl("/"),
    },
    hasPart: posts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      url: absoluteUrl(`/blog/${post.slug}`),
      datePublished: post.publishedAt,
      author: {
        "@type": "Person",
        name: post.author,
      },
    })),
  };

  return (
    <div className="np-shell">
      <main className="np-main np-main-narrow">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionPageSchema) }} />

        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Blog" },
          ]}
          currentPath="/blog"
        />

        <section className="np-page-header">
          <h1>NutriPilot Blog</h1>
          <p className="np-page-subtitle">
            Practical guides on weekly nutrition systems, grocery execution, and sustainable meal prep workflows.
          </p>
          <form action="/blog" method="get" className="np-actions" aria-label="Search blog posts">
            <input
              type="search"
              name="q"
              defaultValue={query}
              placeholder="Search articles"
              aria-label="Search articles"
            />
            <button type="submit" className="np-btn np-btn-secondary">Search</button>
            {hasQuery ? <Link href="/blog" className="np-btn np-btn-secondary">Clear</Link> : null}
          </form>
          {hasQuery ? <p className="np-inline-note">Results for "{query}": {posts.length}</p> : null}
          <p className="np-inline-note">Subscribe via RSS: <a href="/rss.xml">/rss.xml</a></p>
        </section>

        <section className="blog-grid" aria-label="Blog articles">
          {posts.map((post) => (
            <article key={post.slug} className="np-card blog-card">
              <p className="blog-meta">
                {formatDate(post.publishedAt)} · {post.readingMinutes} min read
              </p>
              <h2>
                <Link href={`/blog/${post.slug}` as Route}>{post.title}</Link>
              </h2>
              <p>{post.description}</p>
              <div className="blog-tags">
                {post.tags.map((tag) => (
                  <Link key={tag} href={`/blog/tag/${tagToSlug(tag)}` as Route} className="blog-tag">{tag}</Link>
                ))}
              </div>
              {getRelatedMealPlanGoalsForPost(post, 1).map((goal) => {
                const goalContent = getMealPlanGoalContent(goal);

                if (!goalContent) {
                  return null;
                }

                return (
                  <p key={goal} className="np-inline-note">
                    Related goal: <Link href={`/meal-plan/${goal}` as Route}>{goalContent.shortLabel} meal plan</Link> · <Link href={`/app?goal=${goal}&source=${hasQuery ? "blog_search" : "blog_index"}&slug=${post.slug}` as Route}>Start plan</Link>
                  </p>
                );
              })}
            </article>
          ))}
          {posts.length === 0 ? (
            <article className="np-card blog-card">
              <h2>No posts found</h2>
              <p>Try a different keyword or clear the search to browse all articles.</p>
            </article>
          ) : null}
        </section>

        {totalPages > 1 && !hasQuery ? (
          <nav className="np-actions" aria-label="Blog pagination">
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => {
              const href = pageNumber === 1 ? "/blog" : (`/blog/page/${pageNumber}` as Route);

              return (
                <Link key={pageNumber} href={href as Route} className={`np-btn ${pageNumber === 1 ? "np-btn-primary" : "np-btn-secondary"}`}>
                  Page {pageNumber}
                </Link>
              );
            })}
          </nav>
        ) : null}
      </main>

      <MarketingFooter />
    </div>
  );
}
