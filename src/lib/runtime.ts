export const shouldUseLocalFallback = () =>
  process.env.NODE_ENV !== 'production' || process.env.PAYLOAD_ALLOW_LOCAL_FALLBACK === 'true'
