import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../components/Breadcrumbs";
import { MdxArticle } from "../../components/MdxArticle";
import { getAllBlogSlugs, getBlogPostBySlug, getRelatedBlogPosts } from "../../lib/blog";
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
            <p className="blog-meta">
              {formatDate(post.publishedAt)} · {post.readingMinutes} min read
            </p>
            <h1>{post.title}</h1>
            <p className="np-page-subtitle">{post.description}</p>
            <div className="blog-tags">
              {post.tags.map((tag) => (
                <span key={tag} className="blog-tag">{tag}</span>
              ))}
            </div>
          </header>

          <MdxArticle source={post.content} />
        </article>

        {relatedPosts.length > 0 ? (
          <section className="np-card" aria-labelledby="related-articles-title">
            <h2 id="related-articles-title">Related articles</h2>
            <div className="blog-grid">
              {relatedPosts.map((relatedPost) => (
                <article key={relatedPost.slug} className="blog-card">
                  <p className="blog-meta">{formatDate(relatedPost.publishedAt)}</p>
                  <h3>
                    <Link href={`/blog/${relatedPost.slug}` as Route}>{relatedPost.title}</Link>
                  </h3>
                  <p>{relatedPost.description}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>
    </div>
  );
}
