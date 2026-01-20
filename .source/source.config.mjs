// source.config.ts
import {
  defineDocs,
  defineConfig,
  defineCollections,
  frontmatterSchema
} from "fumadocs-mdx/config";
import { z } from "zod";
var docs = defineDocs({
  dir: "content/docs"
});
var blogPosts = defineCollections({
  type: "doc",
  dir: "content/blog",
  schema: frontmatterSchema.extend({
    author: z.string(),
    date: z.string().date().or(z.date()),
    categories: z.array(z.string()),
    image: z.string().optional(),
    imageAlt: z.string().optional()
  })
});
var source_config_default = defineConfig();
export {
  blogPosts,
  source_config_default as default,
  docs
};
