import { marked } from "marked";

const safeRenderer = new marked.Renderer();
safeRenderer.html = ({ text }) => text.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character] ?? character);
marked.setOptions({ gfm: true, breaks: true, renderer: safeRenderer });

export function renderMarkdownToHtml(markdown: string): string {
  return marked.parse(markdown, { async: false, gfm: true, breaks: true, renderer: safeRenderer }) as string;
}
