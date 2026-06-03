import { supabase } from './supabase'

// Fetch viewed submission keys from database
export async function getDbViewedSubmissions(mentorId) {
  try {
    const { data } = await supabase
      .from('mentor_submission_views')
      .select('user_id, week_number')
      .eq('mentor_id', mentorId)
    if (data) {
      return new Set(data.map((v) => `${v.user_id}_w${v.week_number}`))
    }
  } catch (e) {
    console.error('Error fetching viewed submissions:', e)
  }
  return new Set()
}

// Mark all current submissions as viewed in database
export async function markAllSubmissionsViewed(mentorId, students, allSubmissions) {
  try {
    const rows = []
    students.forEach((student) => {
      const subs = allSubmissions[student.id] || {}
      Object.keys(subs).forEach((weekNum) => {
        rows.push({
          mentor_id: mentorId,
          user_id: student.id,
          week_number: Number(weekNum),
        })
      })
    })

    if (rows.length === 0) return

    // Upsert all — UNIQUE(mentor_id, user_id, week_number) handles duplicates
    const { error } = await supabase
      .from('mentor_submission_views')
      .upsert(rows, { onConflict: 'mentor_id,user_id,week_number' })

    if (error) console.error('Error marking viewed:', error)
  } catch (e) {
    console.error('Error marking viewed:', e)
  }
}

// Check if a specific submission is viewed (from a pre-loaded Set)
export function isSubmissionViewed(studentId, weekNumber, viewedSet) {
  return viewedSet.has(`${studentId}_w${weekNumber}`)
}
