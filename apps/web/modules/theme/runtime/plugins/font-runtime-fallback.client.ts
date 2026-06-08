export default defineNuxtPlugin(() => {
  const runtimeConfig = useRuntimeConfig();
  const fontName = `${runtimeConfig.public.font || ''}`.trim();

  if (!fontName || typeof document === 'undefined') {
    return;
  }

  const href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@300;400;500;600;700&display=swap`;
  const existingLink = document.head.querySelector<HTMLLinkElement>(`link[data-theme-font-fallback=\"true\"]`);

  if (existingLink && existingLink.href === href) {
    return;
  }

  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  link.dataset.themeFontFallback = 'true';
  document.head.appendChild(link);
});
