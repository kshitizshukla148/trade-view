export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(Number(value) || 0)

export const formatCompactNumber = (value) =>
  new Intl.NumberFormat('en-IN', {
    notation: 'compact',
    maximumFractionDigits: 1
  }).format(Number(value) || 0)

export const formatPercent = (value) => {
  const numericValue = Number(value) || 0
  return `${numericValue >= 0 ? '+' : ''}${numericValue.toFixed(2)}%`
}
