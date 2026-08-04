/**
 * Converts a string into a URL-safe slug.
 * e.g. "Men's T-Shirts & Tops!" => "mens-t-shirts-tops"
 */
const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[''']/g, '')          // Remove apostrophes
    .replace(/&/g, 'and')           // & → and
    .replace(/[^\w\s-]/g, '')       // Remove non-word chars (except - and space)
    .replace(/[\s_]+/g, '-')        // Spaces and underscores → hyphens
    .replace(/-+/g, '-')            // Collapse multiple hyphens
    .replace(/^-+|-+$/g, '');       // Trim leading/trailing hyphens
};

export default slugify;
