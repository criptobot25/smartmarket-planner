import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { BLOG_POSTS_PER_PAGE, getAllBlogPosts, getPaginatedBlogPosts, getRelatedMealPlanGoalsForPost } from "../../../lib/blog";
import { getMealPlanGoalContent } from "../../../lib/mealPlanGoals";
import { absoluteUrl, getLanguageAlternates } from "../../../lib/seo";

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
  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `NutriPilot Blog Articles - Page ${currentPage}`,
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
    name: `NutriPilot Blog - Page ${currentPage}`,
    description: `Page ${currentPage} of the NutriPilot blog with nutrition planning and meal prep content.`,
    url: absoluteUrl(`/blog/page/${currentPage}`),
    isPartOf: {
      "@type": "CollectionPage",
      name: "NutriPilot Blog",
      url: absoluteUrl("/blog"),
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
            { label: "Blog", href: "/blog" },
            { label: `Page ${currentPage}` },
          ]}
          currentPath={`/blog/page/${currentPage}`}
        />

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
              {getRelatedMealPlanGoalsForPost(post, 1).map((goal) => {
                const goalContent = getMealPlanGoalContent(goal);

                if (!goalContent) {
                  return null;
                }

                return (
                  <p key={goal} className="np-inline-note">
                    Related goal: <Link href={`/meal-plan/${goal}` as Route}>{goalContent.shortLabel} meal plan</Link> · <Link href={`/app?goal=${goal}` as Route}>Start plan</Link>
                  </p>
                );
              })}
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
