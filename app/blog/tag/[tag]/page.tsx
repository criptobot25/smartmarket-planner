import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../../components/Breadcrumbs";
import { getAllBlogTags, getBlogPostsByTag, getRelatedMealPlanGoalsForPost, slugToTag, tagToSlug } from "../../../lib/blog";
import { getMealPlanGoalContent } from "../../../lib/mealPlanGoals";
import { absoluteUrl, getLanguageAlternates } from "../../../lib/seo";

export const dynamic = "force-static";
export const dynamicParams = false;

type TagPageProps = {
  params: {
    tag: string;
  };
};

export async function generateStaticParams() {
  const tags = await getAllBlogTags();
  return tags.map(({ slug }) => ({ tag: slug }));
}

export async function generateMetadata({ params }: TagPageProps): Promise<Metadata> {
  const tagLabel = slugToTag(params.tag);
  const canonicalPath = `/blog/tag/${params.tag}`;

  return {
    title: `Articles about ${tagLabel}`,
    description: `Browse all NutriPilot articles tagged "${tagLabel}". Practical guides on nutrition planning, meal prep, and fitness goals.`,
    alternates: {
      canonical: canonicalPath,
      languages: getLanguageAlternates(canonicalPath),
    },
    openGraph: {
      type: "website",
      title: `${tagLabel} — NutriPilot Blog`,
      description: `Browse all NutriPilot articles tagged "${tagLabel}".`,
      url: canonicalPath,
    },
    twitter: {
      card: "summary_large_image",
      title: `${tagLabel} — NutriPilot Blog`,
      description: `Browse all NutriPilot articles tagged "${tagLabel}".`,
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

export default async function TagPage({ params }: TagPageProps) {
  const posts = await getBlogPostsByTag(params.tag);

  if (posts.length === 0) {
    notFound();
  }

  const tagLabel = posts[0].tags.find((t) => tagToSlug(t) === params.tag) ?? slugToTag(params.tag);
  const tagPageUrl = absoluteUrl(`/blog/tag/${params.tag}`);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `NutriPilot Blog — ${tagLabel}`,
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
    name: `NutriPilot Blog — ${tagLabel}`,
    description: `All articles tagged "${tagLabel}" on the NutriPilot blog.`,
    url: tagPageUrl,
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
            { label: tagLabel },
          ]}
          currentPath={`/blog/tag/${params.tag}`}
        />

        <section className="np-page-header">
          <h1>{tagLabel}</h1>
          <p className="np-page-subtitle">
            {posts.length} article{posts.length !== 1 ? "s" : ""} on this topic
          </p>
          <p className="np-inline-note">
            <Link href="/blog">← All articles</Link>
          </p>
        </section>

        <section className="blog-grid" aria-label={`Articles tagged ${tagLabel}`}>
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
                  <Link key={tag} href={`/blog/tag/${tagToSlug(tag)}` as Route} className="blog-tag">
                    {tag}
                  </Link>
                ))}
              </div>
              {getRelatedMealPlanGoalsForPost(post, 1).map((goal) => {
                const goalContent = getMealPlanGoalContent(goal);

                if (!goalContent) {
                  return null;
                }

                return (
                  <p key={goal} className="np-inline-note">
                    Related goal: <Link href={`/meal-plan/${goal}` as Route}>{goalContent.shortLabel} meal plan</Link> · <Link href={`/app?goal=${goal}&source=blog_tag&tag=${params.tag}&slug=${post.slug}` as Route}>Start plan</Link>
                  </p>
                );
              })}
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
