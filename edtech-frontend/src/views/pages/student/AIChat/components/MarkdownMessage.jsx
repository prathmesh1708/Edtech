import React from 'react';
import styles from '../AIChat.module.css';

// Minimal, dependency-free Markdown renderer for AI answers. It builds React elements
// (never innerHTML), so model output cannot inject markup. Supports headings, bold,
// italic, inline code, code blocks, lists, blockquotes, tables, rules and https links.

const INLINE_SOURCE = /(`[^`\n]+`)|(\*\*[^*\n]+\*\*|__[^_\n]+__)|(\*[^*\s][^*\n]*\*|_[^_\s][^_\n]*_)|(\[[^\]\n]+\]\(https?:\/\/[^\s)]+\))/.source;

const renderInline = (text, keyPrefix = 'i') => {
  // A fresh regex per call: renderInline recurses for bold/italic, and a shared global
  // regex would have its lastIndex reset by the inner call (an infinite loop).
  const inlineRe = new RegExp(INLINE_SOURCE, 'g');
  const out = [];
  let last = 0;
  let match;
  let n = 0;
  while ((match = inlineRe.exec(text)) !== null) {
    if (match.index > last) out.push(text.slice(last, match.index));
    const [token] = match;
    const key = `${keyPrefix}-${n++}`;
    if (match[1]) out.push(<code key={key} className={styles.mdInlineCode}>{token.slice(1, -1)}</code>);
    else if (match[2]) out.push(<strong key={key}>{renderInline(token.slice(2, -2), key)}</strong>);
    else if (match[3]) out.push(<em key={key}>{renderInline(token.slice(1, -1), key)}</em>);
    else if (match[4]) {
      const [, label, href] = token.match(/^\[([^\]]+)\]\((.+)\)$/);
      out.push(<a key={key} href={href} target="_blank" rel="noopener noreferrer nofollow">{label}</a>);
    }
    last = match.index + token.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
};

const HEADING_RE = /^(#{1,6})\s+(.*)$/;
const HR_RE = /^\s*([-*_])(\s*\1){2,}\s*$/;
const UL_RE = /^(\s*)[-*+]\s+(.*)$/;
const OL_RE = /^(\s*)(\d+)[.)]\s+(.*)$/;
const TABLE_SEP_RE = /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)*\|?\s*$/;
const FENCE_RE = /^\s*```/;

const splitRow = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());

const isBlockStart = (line, next) =>
  FENCE_RE.test(line) || HEADING_RE.test(line) || HR_RE.test(line) || UL_RE.test(line) || OL_RE.test(line) ||
  /^\s*>/.test(line) || (line.includes('|') && next !== undefined && TABLE_SEP_RE.test(next));

const parseBlocks = (markdown) => {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) {
      i += 1;
      continue;
    }
    if (FENCE_RE.test(line)) {
      const code = [];
      i += 1;
      while (i < lines.length && !FENCE_RE.test(lines[i])) code.push(lines[i++]);
      i += 1; // closing fence (absent while an answer is still streaming)
      blocks.push({ type: 'code', text: code.join('\n') });
      continue;
    }
    const heading = line.match(HEADING_RE);
    if (heading) {
      blocks.push({ type: 'heading', level: heading[1].length, text: heading[2] });
      i += 1;
      continue;
    }
    if (HR_RE.test(line)) {
      blocks.push({ type: 'hr' });
      i += 1;
      continue;
    }
    if (line.includes('|') && lines[i + 1] !== undefined && TABLE_SEP_RE.test(lines[i + 1])) {
      const header = splitRow(line);
      const rows = [];
      i += 2;
      while (i < lines.length && lines[i].includes('|') && lines[i].trim()) rows.push(splitRow(lines[i++]));
      blocks.push({ type: 'table', header, rows });
      continue;
    }
    if (/^\s*>/.test(line)) {
      const quote = [];
      while (i < lines.length && /^\s*>/.test(lines[i])) quote.push(lines[i++].replace(/^\s*>\s?/, ''));
      blocks.push({ type: 'quote', text: quote.join('\n') });
      continue;
    }
    if (UL_RE.test(line) || OL_RE.test(line)) {
      const ordered = OL_RE.test(line);
      const re = ordered ? OL_RE : UL_RE;
      const items = [];
      const start = ordered ? Number(line.match(OL_RE)[2]) : 1;
      while (i < lines.length) {
        const m = lines[i].match(re);
        if (m) {
          items.push({ indent: Math.min(3, Math.floor(m[1].replace(/\t/g, '  ').length / 2)), text: ordered ? m[3] : m[2] });
          i += 1;
        } else if (lines[i].trim() && /^\s{2,}/.test(lines[i]) && items.length && !isBlockStart(lines[i], lines[i + 1])) {
          items[items.length - 1].text += ` ${lines[i++].trim()}`; // wrapped continuation line
        } else break;
      }
      blocks.push({ type: ordered ? 'ol' : 'ul', start, items });
      continue;
    }
    const para = [];
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i], lines[i + 1])) para.push(lines[i++]);
    blocks.push({ type: 'p', lines: para });
  }
  return blocks;
};

const renderBlock = (block, key) => {
  switch (block.type) {
    case 'code':
      return <pre key={key} className={styles.mdCode}><code>{block.text}</code></pre>;
    case 'heading': {
      const Tag = block.level <= 2 ? 'h3' : 'h4';
      return <Tag key={key} className={styles.mdHeading}>{renderInline(block.text, key)}</Tag>;
    }
    case 'hr':
      return <hr key={key} className={styles.mdRule} />;
    case 'table':
      return (
        <div key={key} className={styles.mdTableWrap}>
          <table className={styles.mdTable}>
            <thead>
              <tr>{block.header.map((c, j) => <th key={j}>{renderInline(c, `${key}-h${j}`)}</th>)}</tr>
            </thead>
            <tbody>
              {block.rows.map((row, r) => (
                <tr key={r}>{row.map((c, j) => <td key={j}>{renderInline(c, `${key}-${r}-${j}`)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case 'quote':
      return <blockquote key={key} className={styles.mdQuote}>{renderBlocks(block.text, key)}</blockquote>;
    case 'ul':
    case 'ol': {
      const Tag = block.type;
      return (
        <Tag key={key} className={styles.mdList} start={block.type === 'ol' && block.start !== 1 ? block.start : undefined}>
          {block.items.map((item, j) => (
            <li key={j} style={item.indent ? { marginLeft: `${item.indent * 1.25}em` } : undefined}>
              {renderInline(item.text, `${key}-${j}`)}
            </li>
          ))}
        </Tag>
      );
    }
    default:
      return (
        <p key={key} className={styles.mdParagraph}>
          {block.lines.map((l, j) => (
            <React.Fragment key={j}>
              {j > 0 && <br />}
              {renderInline(l, `${key}-${j}`)}
            </React.Fragment>
          ))}
        </p>
      );
  }
};

function renderBlocks(markdown, prefix = 'b') {
  return parseBlocks(markdown).map((block, i) => renderBlock(block, `${prefix}-${i}`));
}

const MarkdownMessage = ({ text }) => <div className={styles.markdown}>{renderBlocks(text || '')}</div>;

export default React.memo(MarkdownMessage);
