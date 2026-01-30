export function isTextInputFocused(): boolean {
  const element = document.activeElement;
  if (!(element instanceof HTMLElement)) return false;

  if (element.matches('input, textarea, select')) return true;
  if (element.isContentEditable || element.matches('[contenteditable="true"], [contenteditable=""]')) return true;

  return false;
}
