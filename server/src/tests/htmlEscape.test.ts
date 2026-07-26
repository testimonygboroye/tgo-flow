import { escapeHtml } from '../utils/htmlEscape';

describe('escapeHtml', () => {
  it('escapes angle brackets to prevent tag injection', () => {
    expect(escapeHtml('<img src=x onerror=alert(1)>')).toBe(
      '&lt;img src=x onerror=alert(1)&gt;'
    );
  });

  it('escapes ampersands', () => {
    expect(escapeHtml('Design & Marketing')).toBe('Design &amp; Marketing');
  });

  it('escapes quotes to prevent attribute-breaking injection', () => {
    expect(escapeHtml(`"onmouseover="alert(1)`)).toBe('&quot;onmouseover=&quot;alert(1)');
    expect(escapeHtml(`'onclick='alert(1)`)).toBe('&#39;onclick=&#39;alert(1)');
  });

  it('leaves normal text completely unchanged', () => {
    expect(escapeHtml('Bella\'s Bakery Website Project')).toBe('Bella&#39;s Bakery Website Project');
  });

  it('handles an empty string', () => {
    expect(escapeHtml('')).toBe('');
  });
});
