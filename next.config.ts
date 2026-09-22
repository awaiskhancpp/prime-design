import { withPayload } from '@payloadcms/next/withPayload'
import type { NextConfig } from 'next'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(__filename)

const nextConfig: NextConfig = {
  images: {
    /*
     * Photography is what this site sells, so it is optimised for fidelity
     * rather than for the smallest possible file.
     *
     * Measured on `prime1-5.jpg` at w=1920, against the untouched original
     * (mean absolute pixel error, lower is closer to the source):
     *
     *   WebP q75 — the old default   1.477   64KB
     *   AVIF q85                     1.146   57KB
     *   AVIF q90 — what is set now   1.083   66KB
     *
     * AVIF at 90 is 27% closer to the original than the WebP 75 it replaces
     * and costs two kilobytes more, because AVIF carries detail far more
     * cheaply than WebP does. Browsers without AVIF fall back to WebP, which
     * at this quality is genuinely heavier (144KB) — that is the deliberate
     * trade, and it affects a small and shrinking minority.
     *
     * `qualities` is an allowlist, not a default: Next 16 rejects any `q` not
     * named here with a 400, and it defaults to `[75]`. 75 stays listed so
     * URLs already in the wild keep resolving. The default applied to every
     * image is set in `src/components/ui/Image.tsx`, since Next has no config
     * option for it — `quality` is a per-component prop.
     */
    qualities: [75, 90],
    formats: ['image/avif', 'image/webp'],
    localPatterns: [
      {
        pathname: '/api/media/file/**',
      },
      {
        pathname: '/**',
      },
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'primedesignandbuild.com',
        pathname: '/wp-content/uploads/**',
      },
      {
        // Vercel Blob media storage (media.url column holds these hosts).
        protocol: 'https',
        hostname: '7ipptu8y7yyecrzp.public.blob.vercel-storage.com',
        pathname: '/**',
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      '.cjs': ['.cts', '.cjs'],
      '.js': ['.ts', '.tsx', '.js', '.jsx'],
      '.mjs': ['.mts', '.mjs'],
    }

    return webpackConfig
  },
  turbopack: {
    root: path.resolve(dirname),
  },
}

export default withPayload(nextConfig, { devBundleServerPackages: false })
