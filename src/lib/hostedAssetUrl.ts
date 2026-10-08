// Asset delivery is hosted separately from the embedded development preview.
// Keep the immutable path from the generated pointer, using a public host.
const ASSET_HOST = 'https://ovela-ai-companion.lovable.app';

export const hostedAssetUrl = (asset: { url: string }): string =>
  asset.url.startsWith('/__l5e/assets-v1/')
    ? `${ASSET_HOST}${asset.url}`
    : asset.url;