export function detectProjectId(cwd = process.cwd()): string {
  return slugify(basename(cwd) || "default");
}
