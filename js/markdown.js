import { el, frag } from './events.js';

// Minimal Markdown subset for abstracts: paragraphs, "- " lists, **bold**, *italic*, [links](https://…).
// Builds DOM nodes instead of HTML strings, so abstract text can never inject markup.

const INLINE = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

const renderInline = text => {
    const nodes = [];
    let last = 0;
    for (const match of text.matchAll(INLINE)) {
        const [whole, bold, italic, linkText, href] = match;
        nodes.push(text.slice(last, match.index));
        if (bold) nodes.push(el('strong', {}, ...renderInline(bold)));
        else if (italic) nodes.push(el('em', {}, ...renderInline(italic)));
        else if (/^https?:\/\//.test(href)) nodes.push(el('a', { href, target: '_blank', rel: 'noopener' }, ...renderInline(linkText)));
        else nodes.push(whole);
        last = match.index + whole.length;
    }
    nodes.push(text.slice(last));
    return nodes;
};

const LIST_ITEM = /^[-*]\s+/;

const renderBlock = block => {
    const lines = block.split('\n').map(line => line.trim());
    return lines.every(line => LIST_ITEM.test(line))
        ? el('ul', {}, ...lines.map(line => el('li', {}, ...renderInline(line.replace(LIST_ITEM, '')))))
        : el('p', {}, ...renderInline(lines.join(' ')));
};

export const renderMarkdown = text =>
    frag(...text.trim().replace(/\r\n/g, '\n').split(/\n\s*\n/).map(renderBlock));

// Plain text of the first paragraph, e.g. for meta descriptions.
export const markdownSummary = text => renderMarkdown(text).firstChild?.textContent ?? '';
