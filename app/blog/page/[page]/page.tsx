import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BLOG_POSTS_PER_PAGE, getAllBlogPosts, getPaginatedBlogPosts } from "../../../lib/blog";
import { getLanguageAlternates } from "../../../lib/seo";

export const dynamic = "force-static";

type BlogPaginationPageProps = {
  params: {
    page: string;
  };
};

export const dynamicParams = false;

export async function generateStaticParams() {
  const posts = await getAllBlogPosts();
  const totalPages = Math.max(1, Math.ceil(posts.length / BLOG_POSTS_PER_PAGE));

  return Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((page) => page > 1)
    .map((page) => ({ page: String(page) }));
}

export async function generateMetadata({ params }: BlogPaginationPageProps): Promise<Metadata> {
  const pageNumber = Number(params.page);

  if (!Number.isFinite(pageNumber) || pageNumber < 2) {
    return {
      title: "Blog",
      description: "Nutrition planning articles.",
    };
  }

  const canonicalPath = `/blog/page/${pageNumber}`;

  return {
    title: `Blog - Page ${pageNumber}`,
    description: `Page ${pageNumber} of the NutriPilot blog with nutrition planning and meal prep content.`,
    alternates: {
      canonical: canonicalPath,
      languages: getLanguageAlternates(canonicalPath),
    },
    openGraph: {
      type: "website",
      title: `NutriPilot Blog - Page ${pageNumber}`,
      description: `Page ${pageNumber} of the NutriPilot blog with nutrition planning and meal prep content.`,
      url: canonicalPath,
    },
  };
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function BlogPaginationPage({ params }: BlogPaginationPageProps) {
  const pageNumber = Number(params.page);

  if (!Number.isFinite(pageNumber) || pageNumber < 2) {
    notFound();
  }

  const { posts, totalPages, currentPage } = await getPaginatedBlogPosts(pageNumber, BLOG_POSTS_PER_PAGE);

  if (currentPage !== pageNumber) {
    notFound();
  }

  const previousHref = currentPage - 1 === 1 ? "/blog" : (`/blog/page/${currentPage - 1}` as Route);
  const nextHref = currentPage >= totalPages ? (`/blog/page/${currentPage}` as Route) : (`/blog/page/${currentPage + 1}` as Route);

  return (
    <div className="np-shell">
      <main className="np-main np-main-narrow">
        <section className="np-page-header">
          <h1>NutriPilot Blog</h1>
          <p className="np-page-subtitle">Page {currentPage} of {totalPages}</p>
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

        <nav className="np-actions" aria-label="Blog pagination">
          <Link
            href={previousHref as Route}
            className="np-btn np-btn-secondary"
            aria-disabled={currentPage <= 1}
          >
            Previous
          </Link>
          <Link
            href={nextHref as Route}
            className="np-btn np-btn-secondary"
            aria-disabled={currentPage >= totalPages}
          >
            Next
          </Link>
        </nav>
      </main>
    </div>
  );
}
