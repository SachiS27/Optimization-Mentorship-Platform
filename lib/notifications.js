// Shared helper to check if a submission has been viewed by the mentor
export function getViewedSubmissions() {
  try {
    const stored = typeof window !== 'undefined' ? localStorage.getItem('viewed_submissions') : null
    if (stored) return new Set(JSON.parse(stored))
  } catch (e) {
    // ignore
  }
  return new Set()
}

export function isSubmissionViewed(studentId, weekNumber) {
  const viewed = getViewedSubmissions()
  return viewed.has(`${studentId}_w${weekNumber}`)
}
