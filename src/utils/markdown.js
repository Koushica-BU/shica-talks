// tags that can exist in the final output
const ALLOWED_TAGS = new Set([
  "b", "strong", "i", "em", "code", "pre", "br",
  "ul", "ol", "li", "p", "h1", "h2", "h3",
  "blockquote", "hr", "a", "span",
]);

// attributes allowed
const ALLOWED_ATTRS = {
  a: ["href", "title"],
};

export function sanitizeHTML(html) {
  // using browser's own DOM parser to parse the string, this is safer than regex because the browser handles all edge cases
  const doc = new DOMParser().parseFromString(html, "text/html");

  const elements = [...doc.body.querySelectorAll("*")];

  elements.forEach((el) => {
    const tag = el.tagName.toLowerCase();

    if (!ALLOWED_TAGS.has(tag)) {
      el.replaceWith(document.createTextNode(el.textContent));
      return;
    }

    [...el.attributes].forEach((attr) => {
      const allowed = ALLOWED_ATTRS[tag] || [];
      if (!allowed.includes(attr.name)) {
        el.removeAttribute(attr.name);
        return;
      }

      if (attr.name === "href") {
        const val = attr.value.trim().toLowerCase();
        if (val.startsWith("javascript:") || val.startsWith("data:")) {
          el.removeAttribute("href");
        }
      }
    });

    if (tag === "a") {
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener noreferrer");
    }
  });

  return doc.body.innerHTML;
}

export function parseMarkdown(raw) {
  if (!raw) return "";

  let text = raw;
  const codeBlocks = [];

  text = text.replace(/```(\w+)?\n?([\s\S]*?)```/g, (_, lang, code) => {
    const escaped = escapeHTML(code.trim());
    const langClass = lang ? ` class="language-${lang}"` : "";
    const block = `<pre><code${langClass}>${escaped}</code></pre>`;
    codeBlocks.push(block);
    // replace with a placeholder so we don't process the content inside
    return `%%CODEBLOCK_${codeBlocks.length - 1}%%`;
  });

  text = text.replace(/`([^`]+)`/g, (_, code) => {
    const escaped = escapeHTML(code);
    const block = `<code class="st_bubble__inlineCode">${escaped}</code>`;
    codeBlocks.push(block);
    return `%%CODEBLOCK_${codeBlocks.length - 1}%%`;
  });

  text = text.replace(/^### (.+)$/gm, "<h3>$1</h3>");
  text = text.replace(/^## (.+)$/gm,  "<h2>$1</h2>");
  text = text.replace(/^# (.+)$/gm,   "<h1>$1</h1>");

  text = text.replace(/\*\*\*(.+?)\*\*\*/g, "<strong><em>$1</em></strong>");
  text = text.replace(/\*\*(.+?)\*\*/g,     "<strong>$1</strong>");
  text = text.replace(/\*(.+?)\*/g,         "<em>$1</em>");
  text = text.replace(/__(.+?)__/g,         "<strong>$1</strong>");
  text = text.replace(/_(.+?)_/g,           "<em>$1</em>");

  text = text.replace(/^&gt; (.+)$/gm,  "<blockquote>$1</blockquote>");
  text = text.replace(/^> (.+)$/gm,     "<blockquote>$1</blockquote>");

  text = text.replace(/^(-{3,}|\*{3,})$/gm, "<hr />");

  text = text.replace(/((?:^[-*] .+\n?)+)/gm, (block) => {
    const items = block
      .trim()
      .split("\n")
      .map((line) => `<li>${line.replace(/^[-*] /, "")}</li>`)
      .join("");
    return `<ul>${items}</ul>`;
  });

  text = text.replace(/((?:^\d+\. .+\n?)+)/gm, (block) => {
    const items = block
      .trim()
      .split("\n")
      .map((line) => `<li>${line.replace(/^\d+\. /, "")}</li>`)
      .join("");
    return `<ol>${items}</ol>`;
  });

  text = text.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
    '<a href="$2">$1</a>'
  );

  const blockElements = /^<(h[1-3]|ul|ol|li|blockquote|pre|hr)/;

  text = text
    .split(/\n\n+/)
    .map((block) => {
      block = block.trim();
      if (!block) return "";
      if (blockElements.test(block)) return block;
      return `<p>${block.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");

  codeBlocks.forEach((block, i) => {
    text = text.replace(`%%CODEBLOCK_${i}%%`, block);
  });

  return text;
}


// ─────────────────────────────────────────────────────────
// escapeHTML
// converts < > & " ' into safe HTML entities
// used inside code blocks so the code displays as-is
// ─────────────────────────────────────────────────────────

export function escapeHTML(str) {
  return str
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;")
    .replace(/'/g,  "&#39;");
}