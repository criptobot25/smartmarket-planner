import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content", "blog");
const REQUIRED_FIELDS = ["title", "description", "publishedAt", "author", "tags"];

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidDateString(value) {
  if (!isNonEmptyString(value)) {
    return false;
  }

  return !Number.isNaN(new Date(value).getTime());
}

function validateFrontmatter(fileName, data) {
  const errors = [];

  for (const field of REQUIRED_FIELDS) {
    if (!(field in data)) {
      errors.push(`missing required field: ${field}`);
    }
  }

  if (!isNonEmptyString(data.title)) {
    errors.push("title must be a non-empty string");
  }

  if (!isNonEmptyString(data.description)) {
    errors.push("description must be a non-empty string");
  }

  if (!isValidDateString(data.publishedAt)) {
    errors.push("publishedAt must be a valid date string");
  }

  if (data.updatedAt !== undefined && !isValidDateString(data.updatedAt)) {
    errors.push("updatedAt must be a valid date string when provided");
  }

  if (!isNonEmptyString(data.author)) {
    errors.push("author must be a non-empty string");
  }

  if (!Array.isArray(data.tags) || data.tags.length === 0) {
    errors.push("tags must be a non-empty string array");
  } else if (data.tags.some((tag) => !isNonEmptyString(tag))) {
    errors.push("tags must contain non-empty strings only");
  }

  if (errors.length > 0) {
    return [`${fileName}`, ...errors.map((error) => `  - ${error}`)].join("\n");
  }

  return null;
}

async function main() {
  const entries = await readdir(BLOG_DIR, { withFileTypes: true });
  const mdxFiles = entries
    .filter((entry) => entry.isFile() && /\.mdx?$/i.test(entry.name))
    .map((entry) => entry.name);

  if (mdxFiles.length === 0) {
    console.error("[BlogValidation] No MDX files found in content/blog");
    process.exit(1);
  }

  const violations = [];

  for (const fileName of mdxFiles) {
    const filePath = path.join(BLOG_DIR, fileName);
    const source = await readFile(filePath, "utf8");
    const { data } = matter(source);

    const violation = validateFrontmatter(fileName, data);
    if (violation) {
      violations.push(violation);
    }
  }

  if (violations.length > 0) {
    console.error("[BlogValidation] Frontmatter validation failed:\n");
    console.error(violations.join("\n\n"));
    process.exit(1);
  }

  console.log(`[BlogValidation] OK (${mdxFiles.length} posts validated)`);
}

main().catch((error) => {
  console.error("[BlogValidation] Unexpected error", error);
  process.exit(1);
});
