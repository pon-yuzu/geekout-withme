/**
 * Lightweight HTML sanitizer for Cloudflare Workers / edge runtime.
 * Strips dangerous tags and attributes from HTML strings.
 * Used for custom workbook HTML content that is rendered via set:html.
 */

// Tags that are always removed (with their content)
const DANGEROUS_TAGS = ['script', 'iframe', 'object', 'embed', 'applet', 'form', 'meta', 'link', 'base'];

// Attributes that are always removed (event handlers + dangerous attrs)
const DANGEROUS_ATTR_PATTERN = /\s+(on\w+|formaction|xlink:href|data-bind|srcdoc)\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi;

// javascript: and data: in href/src (but allow data:image/)
const DANGEROUS_URI_PATTERN = /(href|src|action)\s*=\s*["']\s*(javascript|vbscript):/gi;

export function sanitizeHtml(html: string): string {
  let sanitized = html;

  // Remove dangerous tags and their content
  for (const tag of DANGEROUS_TAGS) {
    const regex = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
    sanitized = sanitized.replace(regex, '');
    // Also remove self-closing variants
    const selfClosing = new RegExp(`<${tag}[^>]*\\/?>`, 'gi');
    sanitized = sanitized.replace(selfClosing, '');
  }

  // Remove event handler attributes (onclick, onerror, onload, etc.)
  sanitized = sanitized.replace(DANGEROUS_ATTR_PATTERN, '');

  // Remove javascript: and vbscript: URIs
  sanitized = sanitized.replace(DANGEROUS_URI_PATTERN, '$1=""');

  return sanitized;
}
