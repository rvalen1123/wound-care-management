const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
})

export const formatCurrency = (value: number): string => {
  return currencyFormatter.format(value)
}

export const formatDate = (date: string | Date): string => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`
}

export const formatUnits = (value: number): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  })
}

// Format a number with commas for thousands
export const formatNumber = (value: number): string => {
  return value.toLocaleString('en-US')
}

// Format a phone number as (XXX) XXX-XXXX
export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3]
  }
  return phone
}

// Format a string to title case
export const toTitleCase = (str: string): string => {
  return str.replace(
    /\w\S*/g,
    txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  )
}

// Format a status to a display-friendly string with color
export const formatStatus = (status: string): { text: string; color: string } => {
  const statusMap: Record<string, { text: string; color: string }> = {
    pending: { text: 'Pending', color: 'text-yellow-600' },
    approved: { text: 'Approved', color: 'text-green-600' },
    paid: { text: 'Paid', color: 'text-green-600' },
    partial: { text: 'Partially Paid', color: 'text-yellow-600' },
    outstanding: { text: 'Outstanding', color: 'text-red-600' },
    failed: { text: 'Failed', color: 'text-red-600' },
    processed: { text: 'Processed', color: 'text-green-600' }
  }

  return statusMap[status.toLowerCase()] || { text: toTitleCase(status), color: 'text-gray-600' }
}
