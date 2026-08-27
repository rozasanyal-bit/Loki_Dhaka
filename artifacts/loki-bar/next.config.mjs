// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Capacitor ships a static asset bundle to the native shell — there is no
  // Node server on-device, so the app must be fully statically exportable.
  // This is why no route in this project uses cookies(), headers(), or other
  // server-only/dynamic-request APIs: any of those would break `next build`
  // under output: 'export'.
  output: "export",

  images: {
    // next/image's default loader needs a server to optimize images on
    // request, which doesn't exist in a static export. Ship unoptimized
    // (already-correctly-sized) images instead.
    unoptimized: true,
  },

  // Capacitor serves from a nested path on some platforms; trailing slash
  // keeps relative asset URLs resolving correctly in the WebView.
  trailingSlash: true,
}

export default nextConfig
