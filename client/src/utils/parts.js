export const API_BASE_URL = 'http://localhost:5000'

export function getImageUrl(imagePath) {
  return imagePath ? `${API_BASE_URL}${imagePath}` : ''
}

export function getSellerId(seller) {
  return seller?._id || seller?.id || seller
}

export function isPartOwner(part, currentUser) {
  return Boolean(part && currentUser && String(getSellerId(part.seller)) === String(currentUser.id))
}
