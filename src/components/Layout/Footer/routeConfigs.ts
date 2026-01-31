type FooterType = "full" | "account";

interface RouteConfig {
  pattern: string;
  footerType: FooterType; // Use lowercase for consistency with other codebases
}

export const routeConfigs: RouteConfig[] = [
  { pattern: "/", footerType: "full" }, // "/" is better as a default than "/*"
  { pattern: "/account", footerType: "account" },
  { pattern: "/account/*", footerType: "account" },
  { pattern: "/seller", footerType: "account" },
  { pattern: "/seller/*", footerType: "account" },
  { pattern: "/admin", footerType: "account" },
  { pattern: "/admin/*", footerType: "account" },
];

export const matchRoute = (pathname: string): RouteConfig | undefined => {
  // First: try exact or dynamic matches
  const exactMatch = routeConfigs.find((route) => {
    const regexPattern = route.pattern
      .replace(/\[.*?\]/g, "[^/]+") // Replace [dynamic] segments
      .replace(/\//g, "\\/") // Escape slashes
      .replace(/\*/g, ".*"); // Handle wildcard (if present)

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(pathname);
  });

  if (exactMatch) return exactMatch;

  // Second: fallback to wildcard matches (partial paths)
  const wildcardMatch = routeConfigs.find((route) => {
    if (route.pattern.includes("*")) {
      const wildcardPattern = route.pattern
        .replace(/\*/g, ".*")
        .replace(/\//g, "\\/");

      const regex = new RegExp(`^${wildcardPattern}`);
      return regex.test(pathname);
    }
    return false;
  });

  return wildcardMatch;
};
