import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { MarketingFooter } from "../../components/MarketingFooter";
import { MdxArticle } from "../../components/MdxArticle";
import { getAllBlogSlugs, getBlogPostBySlug, getRelatedBlogPosts, getRelatedMealPlanGoalsForPost, tagToSlug } from "../../lib/blog";
import { getMealPlanGoalContent } from "../../lib/mealPlanGoals";
import { absoluteUrl, getLanguageAlternates } from "../../lib/seo";

export const dynamic = "force-static";

type BlogPostPageProps = {
  params: {
    slug: string;
  };
};

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = await getAllBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Article",
      description: "Blog article",
    };
  }

  const canonicalPath = `/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags,
    alternates: {
      canonical: canonicalPath,
      languages: getLanguageAlternates(canonicalPath),
    },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.description,
      url: canonicalPath,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: [post.author],
      tags: post.tags,
      images: post.coverImage
        ? [{ url: post.coverImage, width: 1200, height: 630, alt: post.title }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: post.coverImage ? [post.coverImage] : undefined,
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

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const relatedPosts = await getRelatedBlogPosts(post.slug, post.tags, 3);
  const relatedGoals = getRelatedMealPlanGoalsForPost(post, 2)
    .map((goal) => getMealPlanGoalContent(goal))
    .filter((goal) => goal !== null);
  const articleUrl = absoluteUrl(`/blog/${post.slug}`);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    author: {
      "@type": "Person",
      name: post.author,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
    articleSection: "Nutrition",
    keywords: post.tags.join(", "),
    wordCount: post.content.split(/\s+/).length,
    image: post.coverImage ? absoluteUrl(post.coverImage) : absoluteUrl("/previews/preview-1.png"),
  };

  return (
    <div className="np-shell">
      <main className="np-main np-main-narrow">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />

        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Blog", href: "/blog" },
            { label: post.title },
          ]}
          currentPath={`/blog/${post.slug}`}
        />

        <article className="np-card blog-post-card">
          <header className="blog-post-header">
            <div className="blog-meta">
              <span>{formatDate(post.publishedAt)}</span>
              <span className="blog-meta-dot" aria-hidden="true">·</span>
              <span>{post.readingMinutes} min read</span>
              {post.updatedAt && post.updatedAt !== post.publishedAt ? (
                <>
                  <span className="blog-meta-dot" aria-hidden="true">·</span>
                  <span>Updated {formatDate(post.updatedAt)}</span>
                </>
              ) : null}
            </div>
            <h1>{post.title}</h1>
            <p className="blog-post-description">{post.description}</p>
            <div className="blog-tags">
              {post.tags.map((tag) => (
                <Link key={tag} href={`/blog/tag/${tagToSlug(tag)}` as Route} className="blog-tag">{tag}</Link>
              ))}
            </div>
            <div className="blog-post-author">
              <div className="blog-post-author-avatar" aria-hidden="true">
                {post.author.charAt(0)}
              </div>
              <span className="blog-post-author-name">{post.author}</span>
            </div>
          </header>

          <MdxArticle source={post.content} />
        </article>

        {relatedGoals.length > 0 ? (
          <section className="np-card blog-post-cta-card" aria-labelledby="related-goals-title">
            <h2 id="related-goals-title">Turn this strategy into your plan</h2>
            <p className="blog-post-cta-desc">Use NutriPilot to build a full week of meals based on the approach in this article — grocery list and prep guide included.</p>
            <div className="np-actions">
              {relatedGoals.map((goal) => (
                <Link key={goal.goal} href={`/meal-plan/${goal.goal}` as Route} className="np-btn np-btn-secondary">
                  {goal.shortLabel} plan guide
                </Link>
              ))}
              <Link href={`/app?goal=${relatedGoals[0]?.goal || "maintenance"}&source=blog_post&slug=${post.slug}` as Route} className="np-btn np-btn-primary">Generate my plan →</Link>
            </div>
          </section>
        ) : null}

        {relatedPosts.length > 0 ? (
          <section aria-labelledby="related-articles-title">
            <h2 id="related-articles-title" className="blog-section-heading">Related articles</h2>
            <div className="blog-grid blog-grid-2col">
              {relatedPosts.map((relatedPost) => (
                <article key={relatedPost.slug} className="np-card blog-card">
                  <p className="blog-meta">
                    <span>{formatDate(relatedPost.publishedAt)}</span>
                    <span className="blog-meta-dot" aria-hidden="true">·</span>
                    <span>{relatedPost.readingMinutes} min read</span>
                  </p>
                  <h3>
                    <Link href={`/blog/${relatedPost.slug}` as Route}>{relatedPost.title}</Link>
                  </h3>
                  <p className="blog-card-desc">{relatedPost.description}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <MarketingFooter />
    </div>
  );
}
