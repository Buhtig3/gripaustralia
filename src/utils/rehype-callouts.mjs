/**
 * rehype-callouts.mjs
 * 
 * Transforms GitHub-style Markdown alerts (> [!NOTE], > [!TIP], > [!IMPORTANT], > [!WARNING], > [!CAUTION])
 * into styled callout components (<aside class="callout callout-[type]">).
 */

const ICONS = {
  note: {
    title: 'Note',
    children: [
      { type: 'element', tagName: 'circle', properties: { cx: '12', cy: '12', r: '10' }, children: [] },
      { type: 'element', tagName: 'line', properties: { x1: '12', y1: '16', x2: '12', y2: '12' }, children: [] },
      { type: 'element', tagName: 'line', properties: { x1: '12', y1: '8', x2: '12.01', y2: '8' }, children: [] }
    ]
  },
  tip: {
    title: 'Tip',
    children: [
      { type: 'element', tagName: 'path', properties: { d: 'M9 18h6' }, children: [] },
      { type: 'element', tagName: 'path', properties: { d: 'M10 22h4' }, children: [] },
      { type: 'element', tagName: 'path', properties: { d: 'M12 2v1' }, children: [] },
      { type: 'element', tagName: 'path', properties: { d: 'M12 15a4.5 4.5 0 0 0 4.5-4.5c0-1.8-1.1-3.4-2.7-4.1-.6-.3-1.1-.9-1.3-1.5a.5.5 0 0 0-1 0c-.2.6-.7 1.2-1.3 1.5-1.6.7-2.7 2.3-2.7 4.1A4.5 4.5 0 0 0 12 15z' }, children: [] }
    ]
  },
  important: {
    title: 'Important',
    children: [
      { type: 'element', tagName: 'circle', properties: { cx: '12', cy: '12', r: '10' }, children: [] },
      { type: 'element', tagName: 'line', properties: { x1: '12', y1: '8', x2: '12', y2: '12' }, children: [] },
      { type: 'element', tagName: 'line', properties: { x1: '12', y1: '16', x2: '12.01', y2: '16' }, children: [] }
    ]
  },
  warning: {
    title: 'Warning',
    children: [
      { type: 'element', tagName: 'path', properties: { d: 'm21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z' }, children: [] },
      { type: 'element', tagName: 'line', properties: { x1: '12', y1: '9', x2: '12', y2: '13' }, children: [] },
      { type: 'element', tagName: 'line', properties: { x1: '12', y1: '17', x2: '12.01', y2: '17' }, children: [] }
    ]
  },
  caution: {
    title: 'Caution',
    children: [
      { type: 'element', tagName: 'polygon', properties: { points: '7.86 2 16.14 2 22 7.86 22 16.14 16.14 22 7.86 22 2 16.14 2 7.86 7.86 2' }, children: [] },
      { type: 'element', tagName: 'line', properties: { x1: '12', y1: '8', x2: '12', y2: '12' }, children: [] },
      { type: 'element', tagName: 'line', properties: { x1: '12', y1: '16', x2: '12.01', y2: '16' }, children: [] }
    ]
  }
};

const ALERT_REGEX = /^\s*\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\](?:\r?\n|\s+)?/i;

function processBlockquote(node) {
  if (!node.children || !Array.isArray(node.children)) return;

  // Find the first non-empty element child
  const firstElemIndex = node.children.findIndex(
    (c) => c.type === 'element'
  );
  if (firstElemIndex === -1) return;

  const firstElem = node.children[firstElemIndex];
  if (firstElem.tagName !== 'p' || !firstElem.children || !firstElem.children.length) return;

  // Find the first text child in this paragraph
  const firstTextIndex = firstElem.children.findIndex(
    (c) => c.type === 'text' && c.value && c.value.trim().length > 0
  );
  if (firstTextIndex === -1) return;

  const firstText = firstElem.children[firstTextIndex];
  const match = firstText.value.match(ALERT_REGEX);
  if (!match) return;

  const alertType = match[1].toLowerCase();

  // Strip the [!TYPE] marker and trailing whitespace/newline
  firstText.value = firstText.value.slice(match[0].length);

  // If the text node is now empty, remove it
  if (!firstText.value) {
    firstElem.children.splice(firstTextIndex, 1);
    // If immediately followed by a <br>, remove that as well
    if (
      firstElem.children[firstTextIndex] &&
      firstElem.children[firstTextIndex].type === 'element' &&
      firstElem.children[firstTextIndex].tagName === 'br'
    ) {
      firstElem.children.splice(firstTextIndex, 1);
    }
  }

  // If the first paragraph is now completely empty (or whitespace only), remove the paragraph
  const hasRemainingContent = firstElem.children.some((c) => {
    if (c.type === 'text') return c.value.trim().length > 0;
    return true;
  });

  if (!hasRemainingContent) {
    node.children.splice(firstElemIndex, 1);
  }

  // Convert the blockquote to an aside
  node.tagName = 'aside';
  node.properties = node.properties || {};

  const existingClasses = Array.isArray(node.properties.className)
    ? node.properties.className
    : typeof node.properties.className === 'string'
      ? node.properties.className.split(/\s+/)
      : [];

  node.properties.className = [
    ...existingClasses,
    'callout',
    `callout-${alertType}`,
    'markdown-alert',
    `markdown-alert-${alertType}`
  ];
  node.properties.role = 'note';
  node.properties['data-alert-type'] = alertType;

  // Create header with icon and title
  const iconData = ICONS[alertType] || ICONS.note;

  const svgNode = {
    type: 'element',
    tagName: 'svg',
    properties: {
      className: ['callout-icon'],
      viewBox: '0 0 24 24',
      width: '18',
      height: '18',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': 'true',
    },
    children: iconData.children,
  };

  const titleNode = {
    type: 'element',
    tagName: 'span',
    properties: { className: ['callout-title'] },
    children: [{ type: 'text', value: iconData.title }],
  };

  const headerNode = {
    type: 'element',
    tagName: 'div',
    properties: { className: ['callout-header', 'markdown-alert-title'] },
    children: [svgNode, titleNode],
  };

  // Wrap remaining children in a callout-content container
  const contentChildren = [...node.children];
  const contentNode = {
    type: 'element',
    tagName: 'div',
    properties: { className: ['callout-content'] },
    children: contentChildren,
  };

  node.children = [headerNode, contentNode];
}

export function rehypeCallouts() {
  return (tree) => {
    function walk(node) {
      if (!node) return;

      if (node.type === 'element' && node.tagName === 'blockquote') {
        processBlockquote(node);
      }

      if (node.children && Array.isArray(node.children)) {
        for (const child of node.children) {
          walk(child);
        }
      }
    }

    walk(tree);
  };
}
