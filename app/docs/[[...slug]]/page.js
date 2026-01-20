import { notFound } from "next/navigation";
import { DocsBody, DocsPage } from "fumadocs-ui/layouts/docs/page";
import defaultMdxComponents from "fumadocs-ui/mdx";
import { source } from "@/lib/source";

export function generateStaticParams() {
  return source.generateParams();
}

export default function DocsPageRoute({ params }) {
  const slugs = params?.slug ?? [];
  const page = source.getPage(slugs);

  if (!page) {
    notFound();
  }

  const MdxContent = page.data.body;

  return (
    <DocsPage toc={page.data.toc}>
      <DocsBody>
        <MdxContent components={defaultMdxComponents} />
      </DocsBody>
    </DocsPage>
  );
}
