import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  return dayjs(dateStr).format('MMM D, YYYY')
}

export const formatDateTime = (dateStr) => {
  if (!dateStr) return 'N/A'
  return dayjs(dateStr).format('MMM D, YYYY h:mm A')
}

export const formatRelative = (dateStr) => {
  if (!dateStr) return 'N/A'
  return dayjs(dateStr).fromNow()
}
