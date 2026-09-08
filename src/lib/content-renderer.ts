/**
 * content-renderer.ts
 * Server-side utility that converts raw article Markdown content to an
 * HTML string for storage in `renderedContent`.
 *
 * Mermaid blocks are stored as <pre class="mermaid">…</pre> so that the
 * MermaidDiagram client component can hydrate them in the browser.
 *
 * Tables are converted to proper <table> HTML.
 * Bold, italic, underline, code, images, headings are all converted.
 */

/** Escape HTML special characters */
function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Convert inline Markdown to HTML spans */
function parseInlineHtml(text: string): string {
  return text
    // Bold **text** or <b>text</b>
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    // Italic *text*
    .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, "<em>$1</em>")
    // Underline <u>text</u> or __text__
    .replace(/<u>(.*?)<\/u>/g, "<u>$1</u>")
    .replace(/__(.*?)__/g, "<u>$1</u>")
    // Inline code `text`
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    // Inline image ![alt](url)
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img src="$2" alt="$1" class="article-img" />')
    // Link [text](url)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
}

/** Convert a markdown table block to an HTML table string */
function tableToHtml(lines: string[]): string {
  const rows = lines.map((line) =>
    line
      .trim()
      .replace(/^\|/, "")
      .replace(/\|$/, "")
      .split("|")
      .map((cell) => cell.trim())
  );

  const headerCells = rows[0] ?? [];
  const bodyRows = rows.slice(1).filter((row) => !row.every((cell) => /^[-:\s]+$/.test(cell)));

  const thead = `<thead><tr>${headerCells.map((h) => `<th>${parseInlineHtml(esc(h))}</th>`).join("")}</tr></thead>`;
  const tbody = `<tbody>${bodyRows.map((row) => `<tr>${row.map((cell) => `<td>${parseInlineHtml(esc(cell))}</td>`).join("")}</tr>`).join("")}</tbody>`;

  return `<div class="article-table-wrap"><table class="article-table">${thead}${tbody}</table></div>`;
}

/**
 * Convert raw article content Markdown string to renderable HTML.
 * Mermaid blocks become <pre class="mermaid">…</pre>.
 */
export function contentToHtml(raw: string): string {
  if (!raw) return "";

  const htmlParts: string[] = [];
  const codeBlockRegex = /```([\s\S]*?)```/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  const processTextSegment = (segment: string) => {
    const lines = segment.split("\n");
    const tableBuffer: string[] = [];

    const flushTable = () => {
      if (tableBuffer.length > 0) {
        htmlParts.push(tableToHtml([...tableBuffer]));
        tableBuffer.length = 0;
      }
    };

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) {
        flushTable();
        continue;
      }

      const isTableLine =
        (trimmed.startsWith("|") && trimmed.includes("|", 1)) ||
        /^[^|\n]+\|[^|\n]+\|/.test(trimmed);

      if (isTableLine) {
        tableBuffer.push(trimmed);
        continue;
      }

      flushTable();

      // Headings
      if (trimmed.startsWith("### ")) {
        htmlParts.push(`<h3 class="article-h3">${parseInlineHtml(esc(trimmed.slice(4)))}</h3>`);
      } else if (trimmed.startsWith("## ")) {
        htmlParts.push(`<h2 class="article-h2">${parseInlineHtml(esc(trimmed.slice(3)))}</h2>`);
      } else if (trimmed.startsWith("# ")) {
        htmlParts.push(`<h1 class="article-h1">${parseInlineHtml(esc(trimmed.slice(2)))}</h1>`);
      }
      // Blockquote
      else if (trimmed.startsWith("> ")) {
        htmlParts.push(`<blockquote class="article-quote">${parseInlineHtml(esc(trimmed.slice(2)))}</blockquote>`);
      }
      // Unordered list
      else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        htmlParts.push(`<ul class="article-ul"><li>${parseInlineHtml(esc(trimmed.slice(2)))}</li></ul>`);
      }
      // Ordered list
      else if (/^\d+[.)]\s/.test(trimmed)) {
        const text = trimmed.replace(/^\d+[.)]\s/, "");
        htmlParts.push(`<ol class="article-ol"><li>${parseInlineHtml(esc(text))}</li></ol>`);
      }
      // Standalone image
      else if (/^!\[.*?\]\(.*?\)$/.test(trimmed)) {
        const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
        if (imgMatch) {
          htmlParts.push(
            `<figure class="article-figure"><img src="${esc(imgMatch[2])}" alt="${esc(imgMatch[1])}" class="article-img" /><figcaption>${esc(imgMatch[1])}</figcaption></figure>`
          );
        }
      }
      // Divider
      else if (/^[-=]{3,}$/.test(trimmed)) {
        htmlParts.push(`<hr class="article-hr" />`);
      }
      // Default paragraph
      else {
        htmlParts.push(`<p class="article-p">${parseInlineHtml(esc(trimmed))}</p>`);
      }
    }

    flushTable();
  };

  while ((match = codeBlockRegex.exec(raw)) !== null) {
    const textBefore = raw.substring(lastIndex, match.index);
    if (textBefore) processTextSegment(textBefore);

    const rawBlock = match[1].trim();
    const firstLineEnd = rawBlock.indexOf("\n");
    let lang = "";
    let body = rawBlock;

    if (firstLineEnd !== -1) {
      lang = rawBlock.slice(0, firstLineEnd).trim().toLowerCase();
      body = rawBlock.slice(firstLineEnd + 1).trim();
    }

    if (lang === "mermaid" || lang === "diagram") {
      // Store as <pre class="mermaid"> for client-side hydration
      htmlParts.push(
        `<pre class="mermaid" data-diagram="true">${esc(body)}</pre>`
      );
    } else {
      htmlParts.push(
        `<div class="article-code-block"><span class="code-lang">${esc(lang || "code")}</span><pre><code>${esc(body)}</code></pre></div>`
      );
    }

    lastIndex = codeBlockRegex.lastIndex;
  }

  const remaining = raw.substring(lastIndex);
  if (remaining) processTextSegment(remaining);

  return htmlParts.join("\n");
}
