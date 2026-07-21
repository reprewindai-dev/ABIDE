import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { renderMarkdownToHtml } from "../integrations/markdown";

describe("markdown integration", () => {
  it("renders GFM while treating raw HTML as text", () => {
    const html = renderMarkdownToHtml("# Evidence\n\n- one\n- two\n\n<script>alert('x')</script>");
    assert.match(html, /<h1>Evidence<\/h1>/);
    assert.match(html, /<li>one<\/li>/);
    assert.doesNotMatch(html, /<script>/i);
  });
});
