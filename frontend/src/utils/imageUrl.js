/**
 * Resolves full image URL for uploaded photographs
 * Works in local dev (via Vite proxy) and cross-domain production deployments
 */
export const getFullImageUrl = (path) => {
  if (!path) return ''
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  }
  
  const apiBase = import.meta.env.VITE_API_BASE_URL || ''
  if (apiBase.startsWith('http://') || apiBase.startsWith('https://')) {
    const origin = apiBase.replace(/\/api\/?$/, '')
    return `${origin}${path.startsWith('/') ? '' : '/'}${path}`
  }

  const uploadsBase = import.meta.env.VITE_UPLOADS_BASE_URL || ''
  return `${uploadsBase}${path.startsWith('/') ? '' : '/'}${path}`
}
