import '@testing-library/react';
if (typeof CSS === 'undefined') (globalThis as { CSS?: unknown }).CSS = {};
const css = globalThis.CSS as unknown as { registerProperty?: () => void };
css.registerProperty ??= () => {};
class RO { observe() {} unobserve() {} disconnect() {} }
class IO { observe() {} unobserve() {} disconnect() {} takeRecords() { return []; } }
globalThis.ResizeObserver ??= RO as unknown as typeof ResizeObserver;
globalThis.IntersectionObserver ??= IO as unknown as typeof IntersectionObserver;
