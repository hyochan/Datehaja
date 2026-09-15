import { readFileSync, writeFileSync } from "node:fs";

/**
 * Stamp the film's identity into the bundle that links to it.
 *
 * The page is content-hashed and always ships fresh; the film is not. It keeps
 * its name across rebuilds, and the CDN in front of the submitted URL caches it
 * for four hours, so a new film reached a viewer hours late while every check
 * passed. Writing the hash here makes each rebuild a distinct URL, and it is
 * taken from the bytes just produced, so it cannot describe a different film.
 */
export function writeDemoAssetVersion(sha256) {
  const version = sha256.slice(0, 8);
  const path = "src/demoAssets.ts";
  const source = readFileSync(path, "utf8");
  const next = source.replace(
    /export const demoAssetVersion = "[0-9a-f]*";/,
    `export const demoAssetVersion = "${version}";`,
  );
  if (next === source && !source.includes(`"${version}"`)) {
    throw new Error(`Could not find demoAssetVersion in ${path}`);
  }
  writeFileSync(path, next);
  return version;
}
