/**
 * How the app asks for the files under `public/demo/`.
 *
 * The bundle is content-hashed, so a deploy always serves the current page —
 * but the film keeps its name across rebuilds and sits behind a four-hour CDN
 * cache, so a new film reached viewers hours late while every check passed.
 * Asking for it by hash makes each rebuild a distinct object to the cache.
 */

/**
 * The current film's hash. Written by `scripts/build-submission-demo.mjs` and
 * `scripts/narrate-submission-demo.mjs` from the bytes they just produced, so
 * it cannot describe a film that is not the one on disk. Do not edit by hand.
 */
export const demoAssetVersion = "35c3abd2";

/** A `public/demo/` path a cache will treat as new whenever the film changes. */
export const demoAsset = (file: string) => `/demo/${file}?v=${demoAssetVersion}`;
