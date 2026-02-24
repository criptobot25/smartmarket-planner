import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { getLanguageAlternates } from "../lib/seo";
import { BLOG_POSTS_PER_PAGE, getPaginatedBlogPosts } from "../lib/blog";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Blog",
  description: "Nutrition planning, meal prep, and grocery optimization guides from NutriPilot.",
  alternates: {
    canonical: "/blog",
    languages: getLanguageAlternates("/blog"),
  },
  openGraph: {
    type: "website",
    title: "NutriPilot Blog",
    description: "Nutrition planning, meal prep, and grocery optimization guides from NutriPilot.",
    url: "/blog",
  },
};

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogIndexPage() {
  const { posts, totalPages } = await getPaginatedBlogPosts(1, BLOG_POSTS_PER_PAGE);

  return (
    <div className="np-shell">
      <main className="np-main np-main-narrow">
        <section className="np-page-header">
          <h1>NutriPilot Blog</h1>
          <p className="np-page-subtitle">
            Practical guides on weekly nutrition systems, grocery execution, and sustainable meal prep workflows.
          </p>
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
                  <span key={tag} className="blog-tag">{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </section>

        {totalPages > 1 ? (
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
    </div>
  );
}
