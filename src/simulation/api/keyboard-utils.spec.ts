import { describe, it, expect, afterEach } from 'vitest';
import { isTextInputFocused } from './keyboard-utils';

function withFocusedElement<K extends keyof HTMLElementTagNameMap>(
  tagName: K,
  attrs: Record<string, string>,
  callback: () => void
): void {
  const element = document.createElement(tagName);
  for (const [key, value] of Object.entries(attrs)) {
    element.setAttribute(key, value);
  }
  document.body.appendChild(element);
  element.focus();
  try {
    callback();
  } finally {
    document.body.removeChild(element);
  }
}

describe('isTextInputFocused', () => {
  afterEach(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  });

  it('returns false when no element is focused', () => {
    expect(isTextInputFocused()).toBe(false);
  });

  it('returns true when input is focused', () => {
    withFocusedElement('input', {}, () => {
      expect(isTextInputFocused()).toBe(true);
    });
  });

  it('returns true when textarea is focused', () => {
    withFocusedElement('textarea', {}, () => {
      expect(isTextInputFocused()).toBe(true);
    });
  });

  it('returns true when select is focused', () => {
    withFocusedElement('select', {}, () => {
      expect(isTextInputFocused()).toBe(true);
    });
  });

  it('returns true when contenteditable element is focused', () => {
    withFocusedElement('div', { contenteditable: 'true' }, () => {
      expect(isTextInputFocused()).toBe(true);
    });
  });

  it('returns true when contenteditable with empty value is focused', () => {
    withFocusedElement('div', { contenteditable: '' }, () => {
      expect(isTextInputFocused()).toBe(true);
    });
  });

  it('returns false when non-input element is focused', () => {
    withFocusedElement('button', {}, () => {
      expect(isTextInputFocused()).toBe(false);
    });
  });

  it('returns false when div without contenteditable is focused', () => {
    withFocusedElement('div', { tabindex: '0' }, () => {
      expect(isTextInputFocused()).toBe(false);
    });
  });
});
