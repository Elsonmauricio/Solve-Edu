import { describe, test, expect } from '@jest/globals';
import { sanitizeRichText } from '../../src/utils/sanitizer.js';

describe('Sanitizer Utility', () => {
  test('Deve remover tags de script maliciosas', () => {
    const dirty = '<script>alert("xss")</script><p>Conteúdo Seguro</p>';
    const clean = sanitizeRichText(dirty);
    expect(clean).toBe('<p>Conteúdo Seguro</p>');
    expect(clean).not.toContain('<script>');
  });

  test('Deve remover atributos de evento (onmouseover, onclick)', () => {
    const dirty = '<b onmouseover="alert(1)">Texto</b>';
    const clean = sanitizeRichText(dirty);
    expect(clean).toBe('<b>Texto</b>');
    expect(clean).not.toContain('onmouseover');
  });

  test('Deve manter tags de formatação permitidas', () => {
    const dirty = '<h1>Título</h1><p>Parágrafo com <strong>negrito</strong>.</p>';
    const clean = sanitizeRichText(dirty);
    expect(clean).toBe(dirty);
  });
});