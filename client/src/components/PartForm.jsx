import { useEffect, useRef, useState } from 'react'
import { getImageUrl } from '../utils/parts.js'
import { BRANDS, CATEGORIES, CONDITIONS, QUALITIES, YEARS } from '../utils/catalogue.js'

const emptyForm = {
  title: '', description: '', price: '', category: '', subcategory: '', condition: '', carBrand: '', carModel: '', vehicleYearFrom: '', vehicleYearTo: '', partNumber: '', quality: '', location: '', city: '', contact: '',
}

function PartForm({ part, submitUrl, method, submitLabel, onSuccess, onAuthExpired }) {
  const [formData, setFormData] = useState(() => part ? {
    title: part.title || '', description: part.description || '', price: part.price || '', category: part.category || '',
    subcategory: part.subcategory || '', condition: part.condition || '', carBrand: part.carBrand || '', carModel: part.carModel || '', vehicleYearFrom: part.vehicleYearFrom || '', vehicleYearTo: part.vehicleYearTo || '', partNumber: part.partNumber || '', quality: part.quality || '', location: part.location || '', city: part.city || '', contact: part.contact || '',
  } : emptyForm)
  const [selectedImage, setSelectedImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(() => getImageUrl(part?.imagePath))
  const previewUrlRef = useRef('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => () => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
  }, [])

  function handleChange(event) {
    const { name, value } = event.target
    setFormData((currentData) => ({ ...currentData, [name]: value }))
  }

  function handleImageChange(event) {
    const image = event.target.files[0]
    if (!image) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(image.type)) {
      setError('Please choose a JPG, PNG, or WebP image.')
      event.target.value = ''
      return
    }
    if (image.size > 5 * 1024 * 1024) {
      setError('Please choose an image smaller than 5 MB.')
      event.target.value = ''
      return
    }
    setError('')
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current)
    const previewUrl = URL.createObjectURL(image)
    previewUrlRef.current = previewUrl
    setSelectedImage(image)
    setImagePreview(previewUrl)
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setSuccess('')
    if (!formData.title.trim() || !formData.description.trim() || !formData.price || !formData.category.trim() || !formData.condition.trim() || !formData.location.trim() || !formData.contact.trim()) {
      setError('Please complete all required fields.')
      return
    }
    if (Number(formData.price) <= 0 || Number.isNaN(Number(formData.price))) {
      setError('Price must be a positive number.')
      return
    }
    if (formData.vehicleYearFrom && formData.vehicleYearTo && Number(formData.vehicleYearTo) < Number(formData.vehicleYearFrom)) { setError('The ending vehicle year must be the same as or later than the starting year.'); return }

    const body = new FormData()
    Object.entries(formData).forEach(([name, value]) => body.append(name, value))
    if (selectedImage) body.append('image', selectedImage)

    setLoading(true)
    try {
      const response = await fetch(submitUrl, { method, body, credentials: 'include' })
      if (response.status === 401) {
        onAuthExpired()
        return
      }
      const data = await response.json()
      if (!response.ok) throw new Error(data.message || 'Unable to save this part.')
      setSuccess(data.message || 'Part saved successfully.')
      onSuccess(data.part)
    } catch (requestError) {
      setError(requestError.message || 'Unable to save this part.')
    } finally {
      setLoading(false)
    }
  }

  return <form className="part-form" onSubmit={handleSubmit}>
    {error && <p className="message error-message" role="alert">{error}</p>}
    {success && <p className="message success-message" role="status">{success}</p>}
    <div className="form-grid">
      <label>Title *<input name="title" value={formData.title} onChange={handleChange} /></label>
      <label>Price *<input name="price" type="number" min="0.01" step="0.01" value={formData.price} onChange={handleChange} /></label>
      <label>Category *<select name="category" value={formData.category} onChange={(event) => setFormData((current) => ({ ...current, category: event.target.value, subcategory: '' }))}><option value="">Choose a category</option>{formData.category && !CATEGORIES[formData.category] && <option value={formData.category}>{formData.category} (legacy)</option>}{Object.keys(CATEGORIES).map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label>Subcategory<select name="subcategory" value={formData.subcategory} onChange={handleChange} disabled={!formData.category}><option value="">Choose a subcategory</option>{formData.subcategory && !(CATEGORIES[formData.category] || []).includes(formData.subcategory) && <option value={formData.subcategory}>{formData.subcategory} (legacy)</option>}{(CATEGORIES[formData.category] || []).map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label>Condition *<select name="condition" value={formData.condition} onChange={handleChange}><option value="">Choose a condition</option>{formData.condition && !CONDITIONS.includes(formData.condition) && <option value={formData.condition}>{formData.condition} (legacy)</option>}{CONDITIONS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label>Quality<select name="quality" value={formData.quality} onChange={handleChange}><option value="">Choose a quality</option>{QUALITIES.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label>Car brand<select name="carBrand" value={formData.carBrand} onChange={handleChange}><option value="">Choose a brand</option>{formData.carBrand && !BRANDS.includes(formData.carBrand) && <option value={formData.carBrand}>{formData.carBrand} (legacy)</option>}{BRANDS.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label>Car model<input name="carModel" value={formData.carModel} onChange={handleChange} /></label>
      <label>Year from<select name="vehicleYearFrom" value={formData.vehicleYearFrom} onChange={handleChange}><option value="">Any year</option>{YEARS.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
      <label>Year to<select name="vehicleYearTo" value={formData.vehicleYearTo} onChange={handleChange}><option value="">Any year</option>{YEARS.map((year) => <option key={year} value={year}>{year}</option>)}</select></label>
      <label>Part number<input name="partNumber" value={formData.partNumber} onChange={handleChange} /></label>
      <label>Location *<input name="location" value={formData.location} onChange={handleChange} /></label>
      <label>City<input name="city" value={formData.city} onChange={handleChange} /></label>
      <label>Contact *<input name="contact" value={formData.contact} onChange={handleChange} /></label>
    </div>
    <label>Description *<textarea name="description" rows="5" value={formData.description} onChange={handleChange} /></label>
    <label>Photo {part ? '(optional replacement)' : '(optional)'}<input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} /></label>
    {imagePreview && <img className="form-image-preview" src={imagePreview} alt="Selected part preview" />}
    <button className="primary-button form-button" type="submit" disabled={loading}>{loading ? 'Saving...' : submitLabel}</button>
  </form>
}

export default PartForm
