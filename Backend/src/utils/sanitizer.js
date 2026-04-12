import sanitizeHtml from 'sanitize-html';

/**
 * Sanitiza strings HTML (Rich Text) para prevenir ataques XSS.
 * Mantém tags de formatação básicas e remove scripts ou atributos perigosos.
 */
export const sanitizeRichText = (html) => {
  if (!html || typeof html !== 'string') return html;

  return sanitizeHtml(html, {
    allowedTags: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'br', 'h1', 'h2', 'h3', 
      'blockquote', 'code', 'pre', 'span', 'div'
    ],
    allowedAttributes: {
      'a': ['href', 'name', 'target', 'rel'],
      'span': ['style'],
      'div': ['style'],
      'p': ['style']
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowProtocolRelative: false
  });
};