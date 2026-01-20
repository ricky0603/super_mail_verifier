import { DocsLayout } from "fumadocs-ui/layouts/docs";
import config from "@/config";
import { source } from "@/lib/source";

export default function DocsRootLayout({ children }) {
  return (
    <DocsLayout tree={source.getPageTree()} nav={{ title: config.appName }}>
      {children}
    </DocsLayout>
  );
}
