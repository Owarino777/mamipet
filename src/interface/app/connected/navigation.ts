export function navigateBack(
  router: { push: (href: string) => void },
  fallbackHref: string,
) {
  router.push(fallbackHref);
}
