import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import DarkModeToggle from '../components/DarkModeToggle'
import Analytics from '../components/Analytics'
import MentorContent from '../components/MentorContent'
import NotificationBell from '../components/NotificationBell'
import { useToast } from '../components/Toast'

export default function MentorDashboard() {
  const router = useRouter()
  const toast = useToast()
  const [students, setStudents] = useState([])
  const [allSubmissions, setAllSubmissions] = useState({})
  const [feedbacks, setFeedbacks] = useState({})
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentSubmissions, setStudentSubmissions] = useState({})
  const [studentFeedbacks, setStudentFeedbacks] = useState({})
  const [feedbackDrafts, setFeedbackDrafts] = useState({})
  const [loading, setLoading] = useState(false)
  const [view, setView] = useState('summary')

  useEffect(() => {
    const userRole = localStorage.getItem('user_role')
    if (userRole !== 'mentor') {
      router.push('/')
      return
    }

    fetchAllData()
  }, [router])

  const mentorName = typeof window !== 'undefined' ? localStorage.getItem('user_name') || 'Mentor' : 'Mentor'

  const fetchAllData = async () => {
    try {
      setLoading(true)

      const { data: studentsData } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'student')

      if (studentsData) {
        setStudents(studentsData)
      }

      const { data: submissionsData } = await supabase
        .from('submissions')
        .select('*')

      if (submissionsData) {
        const map = {}
        submissionsData.forEach((sub) => {
          if (!map[sub.user_id]) {
            map[sub.user_id] = {}
          }
          map[sub.user_id][sub.week_number] = sub
        })
        setAllSubmissions(map)
      }

      // Fetch all feedbacks
      const { data: feedbackData } = await supabase
        .from('submission_feedback')
        .select('*')

      if (feedbackData) {
        const map = {}
        feedbackData.forEach((fb) => {
          const key = `${fb.user_id}_${fb.week_number}`
          map[key] = fb
        })
        setFeedbacks(map)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectStudent = (student) => {
    setSelectedStudent(student)
    setStudentSubmissions(allSubmissions[student.id] || {})
    // Load this student's feedbacks
    const fbMap = {}
    Object.entries(feedbacks).forEach(([key, fb]) => {
      if (fb.user_id === student.id) {
        fbMap[fb.week_number] = fb
      }
    })
    setStudentFeedbacks(fbMap)
  }

  const handleSaveFeedback = async (userId, weekNumber) => {
    const key = `${userId}_${weekNumber}`
    const draft = feedbackDrafts[key]
    if (!draft || !draft.trim()) {
      toast('Please write a comment first', 'error')
      return
    }

    try {
      const existing = feedbacks[key]

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('submission_feedback')
          .update({ comment: draft, updated_at: new Date().toISOString() })
          .eq('id', existing.id)

        if (error) throw error
      } else {
        // Insert new
        const { error } = await supabase
          .from('submission_feedback')
          .insert({
            user_id: userId,
            week_number: weekNumber,
            comment: draft,
          })

        if (error) throw error
      }

      toast(`Feedback saved for Week ${weekNumber}`, 'success')
      // Clear draft
      setFeedbackDrafts((prev) => {
        const next = { ...prev }
        delete next[key]
        return next
      })
      fetchAllData()
    } catch (err) {
      toast('Error saving feedback: ' + err.message, 'error')
    }
  }

  const downloadFile = async (fileUrl) => {
    if (!fileUrl) {
      toast('No file to download', 'error')
      return
    }

    try {
      const { data, error } = await supabase.storage
        .from('submission-files')
        .download(fileUrl)

      if (error) throw error

      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', fileUrl.split('-').pop())
      document.body.appendChild(link)
      link.click()
      link.parentChild?.removeChild(link)
      toast('Downloaded!', 'success')
    } catch (err) {
      toast('Error: ' + err.message, 'error')
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {mentorName} 👋</h1>
            <p className="text-gray-500 dark:text-gray-400">Mentor Dashboard · Multi-Echelon Optimization</p>
          </div>
          <div className="flex items-center gap-4">
            <NotificationBell students={students} allSubmissions={allSubmissions} />
            <DarkModeToggle />
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* View Tabs */}
        <div className="flex gap-3 mb-8 animate-fade-in">
          {[
            { key: 'summary', label: 'Summary View' },
            { key: 'detail', label: 'Student View' },
            { key: 'analytics', label: '📊 Analytics' },
            { key: 'content', label: '📚 Content' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setView(tab.key)}
              className={`px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 ${
                view === tab.key
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading data...
            </div>
          </div>
        )}

        {/* Analytics View */}
        {view === 'analytics' && !loading && (
          <Analytics students={students} allSubmissions={allSubmissions} />
        )}

        {/* Content View */}
        {view === 'content' && (
          <MentorContent />
        )}

        {/* Summary View */}
        {view === 'summary' && !loading && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-x-auto animate-fade-in transition-colors duration-300">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 dark:bg-gray-700 border-b border-gray-300 dark:border-gray-600">
                  <th className="px-6 py-4 text-left font-semibold text-gray-800 dark:text-gray-200">Student</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-800 dark:text-gray-200">Email</th>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((week) => (
                    <th key={week} className="px-4 py-4 text-center font-semibold text-gray-800 dark:text-gray-200">
                      W{week}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-center font-semibold text-gray-800 dark:text-gray-200">Progress</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const submissions = allSubmissions[student.id] || {}
                  const completed = Object.keys(submissions).length
                  const percentage = Math.round((completed / 8) * 100)

                  return (
                    <tr key={student.id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            handleSelectStudent(student)
                            setView('detail')
                          }}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold cursor-pointer transition-colors duration-200"
                        >
                          {student.name}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600 dark:text-gray-400">{student.email}</td>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((week) => (
                        <td key={week} className="px-4 py-4 text-center">
                          {submissions[week] ? (
                            <span className="text-green-600 dark:text-green-400 font-bold">✓</span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-600">-</span>
                          )}
                        </td>
                      ))}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-500"
                              style={{
                                width: `${percentage}%`,
                                backgroundColor: percentage === 100 ? '#22C55E' : '#3B82F6',
                              }}
                            />
                          </div>
                          <span className={`font-semibold text-sm ${percentage === 100 ? 'text-green-600 dark:text-green-400' : 'text-gray-600 dark:text-gray-400'}`}>
                            {percentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Student Detail View */}
        {view === 'detail' && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow transition-colors duration-300">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Students ({students.length})</h2>
                </div>
                <div className="overflow-y-auto max-h-96">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150 ${
                        selectedStudent?.id === student.id ? 'bg-blue-100 dark:bg-blue-900/30' : ''
                      }`}
                    >
                      <p className="font-semibold text-gray-900 dark:text-white">{student.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              {selectedStudent ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow transition-colors duration-300">
                  <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">{selectedStudent.name}</h2>
                    <p className="text-gray-500 dark:text-gray-400">{selectedStudent.email}</p>
                  </div>

                  <div className="p-6">
                    {/* Mini week grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 animate-fade-in-stagger">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((week) => (
                        <div
                          key={week}
                          className={`p-4 rounded-xl text-center border-2 transition-all duration-300 ${
                            studentSubmissions[week]
                              ? 'bg-green-50 dark:bg-green-900/20 border-green-500 dark:border-green-600'
                              : 'bg-gray-50 dark:bg-gray-700 border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          <p className="font-bold text-gray-900 dark:text-white">Week {week}</p>
                          {studentSubmissions[week] ? (
                            <p className="text-green-600 dark:text-green-400 text-sm font-semibold">✓</p>
                          ) : (
                            <p className="text-gray-400 dark:text-gray-500 text-sm">-</p>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Submission details with feedback */}
                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((week) => {
                        const sub = studentSubmissions[week]
                        const fbKey = `${selectedStudent.id}_${week}`
                        const existingFeedback = feedbacks[fbKey]
                        const draftValue = feedbackDrafts[fbKey] ?? (existingFeedback?.comment || '')

                        return (
                          <div
                            key={week}
                            className={`p-4 rounded-xl border transition-colors duration-300 ${
                              sub
                                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-bold text-gray-900 dark:text-white">Week {week}</h3>
                              {sub && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(sub.submitted_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            {sub ? (
                              <div className="space-y-3">
                                {sub.file_name && (
                                  <div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">File: {sub.file_name}</p>
                                    <button
                                      onClick={() => downloadFile(sub.file_url)}
                                      className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mt-1 transition-all duration-200"
                                    >
                                      Download
                                    </button>
                                  </div>
                                )}
                                {sub.reflection_text && (
                                  <div>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 font-semibold">Reflection:</p>
                                    <p className="text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 p-2 rounded border border-gray-300 dark:border-gray-600 mt-1">
                                      {sub.reflection_text}
                                    </p>
                                  </div>
                                )}

                                {/* Feedback section */}
                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                    💬 Your Feedback
                                    {existingFeedback && (
                                      <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 font-normal">
                                        Last edited {new Date(existingFeedback.updated_at || existingFeedback.created_at).toLocaleDateString()}
                                      </span>
                                    )}
                                  </p>
                                  <textarea
                                    value={draftValue}
                                    onChange={(e) => {
                                      const key = `${selectedStudent.id}_${week}`
                                      setFeedbackDrafts((prev) => ({ ...prev, [key]: e.target.value }))
                                    }}
                                    placeholder="Write feedback for this submission..."
                                    rows={3}
                                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  />
                                  <button
                                    onClick={() => handleSaveFeedback(selectedStudent.id, week)}
                                    className="mt-2 text-sm bg-green-600 hover:bg-green-700 text-white font-semibold px-4 py-1.5 rounded-lg transition-all duration-200"
                                  >
                                    {existingFeedback ? 'Update Feedback' : 'Post Feedback'}
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400">Not submitted</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-12 text-center transition-colors duration-300">
                  <p className="text-gray-500 dark:text-gray-400 text-lg">Select a student to view submissions</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
