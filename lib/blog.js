import { blog } from "@/lib/source";
import { authors, categories } from "@/app/blog/_assets/meta";

const categoryMap = new Map(categories.map((category) => [category.slug, category]));
const authorMap = new Map(authors.map((author) => [author.slug, author]));
const fallbackAuthor = authors[0] || {
  slug: "unknown",
  name: "Unknown",
  avatar: null,
  socials: [],
};

const normalizeCategory = (slug) => {
  return (
    categoryMap.get(slug) || {
      slug,
      title: slug,
      titleShort: slug,
      description: "",
      descriptionShort: "",
    }
  );
};

const normalizeAuthor = (slug) => {
  return authorMap.get(slug) || fallbackAuthor;
};

const toArticle = (page) => {
  const { data } = page;
  const slugs = page.slugs || [];
  const slug = slugs.join("/");

  return {
    slug,
    title: data.title,
    description: data.description,
    publishedAt: data.date,
    categories: (data.categories || []).map(normalizeCategory),
    author: normalizeAuthor(data.author),
    image: data.image
      ? {
          src: data.image,
          urlRelative: data.image,
          alt: data.imageAlt || data.title,
        }
      : null,
    toc: data.toc,
    body: data.body,
  };
};

export const getBlogArticles = () => {
  return blog.getPages().map(toArticle);
};

export const getBlogArticleBySlug = (slugOrSlugs) => {
  const slugs = Array.isArray(slugOrSlugs) ? slugOrSlugs : [slugOrSlugs];
  const page = blog.getPage(slugs);
  if (!page) {
    return null;
  }

  return toArticle(page);
};
