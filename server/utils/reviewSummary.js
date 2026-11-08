const Review = require('../models/Review')

function emptySummary() {
  return { averageRating: null, totalReviews: 0, ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } }
}

function summaryFromRows(rows) {
  const summary = emptySummary()
  let ratingTotal = 0
  rows.forEach((row) => {
    const rating = Number(row._id)
    if (rating < 1 || rating > 5) return
    summary.ratingDistribution[rating] = row.count
    summary.totalReviews += row.count
    ratingTotal += rating * row.count
  })
  if (summary.totalReviews > 0) summary.averageRating = Number((ratingTotal / summary.totalReviews).toFixed(1))
  return summary
}

async function getCompanyReviewSummary(companyProfileId) {
  const rows = await Review.aggregate([
    { $match: { companyProfile: companyProfileId } },
    { $group: { _id: '$rating', count: { $sum: 1 } } },
  ])
  return summaryFromRows(rows)
}

async function getCompanyReviewSummaries(companyProfileIds) {
  if (!companyProfileIds.length) return new Map()
  const rows = await Review.aggregate([
    { $match: { companyProfile: { $in: companyProfileIds } } },
    { $group: { _id: { companyProfile: '$companyProfile', rating: '$rating' }, count: { $sum: 1 } } },
  ])
  const grouped = new Map()
  rows.forEach((row) => {
    const key = String(row._id.companyProfile)
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key).push({ _id: row._id.rating, count: row.count })
  })
  return new Map(companyProfileIds.map((id) => [String(id), summaryFromRows(grouped.get(String(id)) || [])]))
}

module.exports = { emptySummary, summaryFromRows, getCompanyReviewSummary, getCompanyReviewSummaries }
