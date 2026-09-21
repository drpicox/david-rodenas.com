import { escapeHtml } from "../markdown/escapeHtml";

/**
 * A static host cannot answer "moved"; it can only serve a file. So the file
 * at the old address is a page whose whole content is where the page went.
 */
export function renderRedirect(to: string, origin: string): string {
  const address = escapeHtml(to);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Moved</title>
<meta http-equiv="refresh" content="0; url=${address}">
<link rel="canonical" href="${escapeHtml(origin)}${address}">
<meta name="robots" content="noindex">
</head>
<body><p>This page has moved to <a href="${address}">${address}</a>.</p></body>
</html>
`;
}
