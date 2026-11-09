export const COMPLAINT_CATEGORIES = [
  { value: 'item-not-as-described', label: 'Item not as described' },
  { value: 'damaged-part', label: 'Damaged part' },
  { value: 'wrong-part', label: 'Wrong part' },
  { value: 'missing-item', label: 'Missing item' },
  { value: 'delivery-problem', label: 'Delivery problem' },
  { value: 'pickup-problem', label: 'Pickup problem' },
  { value: 'seller-communication', label: 'Seller communication' },
  { value: 'other', label: 'Other' },
]

export const COMPLAINT_STATUS_LABELS = { open: 'Open', 'in-discussion': 'In discussion', resolved: 'Resolved' }

export function complaintCategoryLabel(value) {
  return COMPLAINT_CATEGORIES.find((category) => category.value === value)?.label || 'Other'
}
