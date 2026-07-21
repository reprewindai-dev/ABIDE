import DOMPurify from "dompurify";
import { renderMarkdownToHtml } from "../integrations/markdown";

export default function SafeMarkdown({ content, className }: { content: string; className?: string }) {
  const html = DOMPurify.sanitize(renderMarkdownToHtml(content), {
    USE_PROFILES: { html: true },
  });
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
