type HeaderType = "full" | "minimal";

interface RouteConfig {
  pattern: string;
  headerType: HeaderType;
}

export const routeConfigs: RouteConfig[] = [
  { pattern: "/", headerType: "full" }, // Changed from "/*" to "/" for better default
  { pattern: "/user/*", headerType: "minimal" },
  { pattern: "/user", headerType: "minimal" },
  { pattern: "/seller", headerType: "minimal" },
  { pattern: "/seller/*", headerType: "minimal" },
  { pattern: "/admin", headerType: "minimal" },
  { pattern: "/admin/*", headerType: "minimal" },
];

export const matchRoute = (pathname: string): RouteConfig | undefined => {
  // Exact match first
  const exactMatch = routeConfigs.find((route) => {
    // Convert dynamic segments like [id] to match non-slash characters
    const regexPattern = route.pattern
      .replace(/\[.*?\]/g, "[^/]+") // Handle [id]
      .replace(/\//g, "\\/") // Escape slashes
      .replace(/\*/g, ".*"); // Wildcards handled as ".*"

    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(pathname);
  });

  if (exactMatch) return exactMatch;

  // Wildcard match (e.g., /account/*)
  const wildcardMatch = routeConfigs.find((route) => {
    if (route.pattern.includes("*")) {
      const basePattern = route.pattern
        .replace(/\*/g, ".*")
        .replace(/\//g, "\\/");
      const regex = new RegExp(`^${basePattern}`);
      return regex.test(pathname);
    }
    return false;
  });

  return wildcardMatch;
};
