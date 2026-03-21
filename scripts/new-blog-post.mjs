#!/usr/bin/env node

/**
 * Blog Post Scaffolding Script
 *
 * Usage:
 *   node scripts/new-blog-post.mjs "Your Blog Post Title"
 *   node scripts/new-blog-post.mjs "Your Blog Post Title" --tags "cutting,macros,fat loss"
 *   node scripts/new-blog-post.mjs "Your Blog Post Title" --author "Jane Doe"
 *
 * Creates a new MDX file in content/blog/ with:
 * - Slugified filename
 * - Frontmatter template
 * - Starter content structure
 */

import { writeFileSync, existsSync, mkdirSync, readdirSync } from "fs";
import { join } from "path";

const BLOG_DIR = join(process.cwd(), "content", "blog");
const PREVIEW_IMAGES = [
  "/previews/preview-1.png",
  "/previews/preview-2.png",
  "/previews/preview-3.png",
];

function slugify(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

function getTodayISO() {
  return new Date().toISOString().split("T")[0];
}

function pickCoverImage() {
  // Cycle through preview images based on existing post count
  try {
    const files = readdirSync(BLOG_DIR).filter((f) => f.endsWith(".mdx"));
    return PREVIEW_IMAGES[files.length % PREVIEW_IMAGES.length];
  } catch {
    return PREVIEW_IMAGES[0];
  }
}

function parseArgs(args) {
  const title = args.find((a) => !a.startsWith("--"));
  const tagsIdx = args.indexOf("--tags");
  const authorIdx = args.indexOf("--author");

  const tags =
    tagsIdx !== -1 && args[tagsIdx + 1]
      ? args[tagsIdx + 1].split(",").map((t) => t.trim())
      : ["nutrition", "meal planning"];

  const author =
    authorIdx !== -1 && args[authorIdx + 1]
      ? args[authorIdx + 1]
      : "NutriPilot Team";

  return { title, tags, author };
}

function generateFrontmatter(title, author, tags, coverImage) {
  const tagList = tags.map((t) => `  - ${t}`).join("\n");
  return `---
title: "${title}"
description: ""
publishedAt: "${getTodayISO()}"
author: "${author}"
tags:
${tagList}
coverImage: "${coverImage}"
---`;
}

function generateStarter(title) {
  return `
Write your introduction here. Hook the reader with a clear problem statement.

## Section 1

Explain the core concept or framework.

## Section 2

Provide practical examples, data, or step-by-step instructions.

## Section 3

Address common mistakes or misconceptions.

## Putting it together

Summarize the key takeaways and include a CTA to NutriPilot if relevant.
`;
}

// --- Main ---

const args = process.argv.slice(2);

if (args.length === 0 || args[0] === "--help") {
  console.log(`
Blog Post Scaffolding Script

Usage:
  node scripts/new-blog-post.mjs "Your Blog Post Title"
  node scripts/new-blog-post.mjs "Title" --tags "tag1,tag2,tag3"
  node scripts/new-blog-post.mjs "Title" --author "Author Name"

Options:
  --tags     Comma-separated list of tags (default: "nutrition,meal planning")
  --author   Author name (default: "NutriPilot Team")
  --help     Show this help message
  `);
  process.exit(0);
}

const { title, tags, author } = parseArgs(args);

if (!title) {
  console.error("Error: Please provide a post title as the first argument.");
  process.exit(1);
}

const slug = slugify(title);
const filePath = join(BLOG_DIR, `${slug}.mdx`);

if (existsSync(filePath)) {
  console.error(`Error: File already exists: ${filePath}`);
  process.exit(1);
}

if (!existsSync(BLOG_DIR)) {
  mkdirSync(BLOG_DIR, { recursive: true });
}

const coverImage = pickCoverImage();
const content = generateFrontmatter(title, author, tags, coverImage) + "\n" + generateStarter(title);

writeFileSync(filePath, content, "utf-8");

console.log(`✅ Created: content/blog/${slug}.mdx`);
console.log(`   Title:   ${title}`);
console.log(`   Author:  ${author}`);
console.log(`   Tags:    ${tags.join(", ")}`);
console.log(`   Date:    ${getTodayISO()}`);
console.log(`\nEdit the file to add your content, then commit and deploy.`);
