import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'
import DarkModeToggle from '../components/DarkModeToggle'
import Confetti from '../components/Confetti'
import DropZone from '../components/DropZone'
import { useToast } from '../components/Toast'

export default function Dashboard() {
  const router = useRouter()
  const toast = useToast()
  const [user, setUser] = useState(null)
  const [submissions, setSubmissions] = useState({})
  const [weeklyContent, setWeeklyContent] = useState({})
  const [viewedContent, setViewedContent] = useState(new Set())
  const [feedbacks, setFeedbacks] = useState({})
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [file, setFile] = useState(null)
  const [reflection, setReflection] = useState('')
  const [loading, setLoading] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  useEffect(() => {
    const userId = localStorage.getItem('user_id')
    const userRole = localStorage.getItem('user_role')
    const userEmail = localStorage.getItem('user_email')
    const userName = localStorage.getItem('user_name')

    if (!userId || userRole !== 'student') {
      router.push('/')
      return
    }

    setUser({ id: userId, role: userRole, email: userEmail, name: userName })
    fetchData(userId)
  }, [router])

  const fetchData = async (userId) => {
    try {
      const { data } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', userId)

      if (data) {
        const map = {}
        data.forEach(sub => {
          map[sub.week_number] = sub
        })
        setSubmissions(map)
      }

      // Fetch mentor's weekly content
      const { data: contentData } = await supabase
        .from('weekly_content')
        .select('*')
        .order('week_number', { ascending: true })

      if (contentData) {
        const map = {}
        contentData.forEach((c) => {
          if (!map[c.week_number]) map[c.week_number] = []
          map[c.week_number].push(c)
        })
        setWeeklyContent(map)
      }

      // Fetch what this student has already viewed
      const { data: viewsData } = await supabase
        .from('content_views')
        .select('content_id')
        .eq('user_id', userId)

      if (viewsData) {
        setViewedContent(new Set(viewsData.map((v) => v.content_id)))
      }

      // Fetch feedback for this student
      const { data: feedbackData } = await supabase
        .from('submission_feedback')
        .select('*')
        .eq('user_id', userId)

      if (feedbackData) {
        const fbMap = {}
        feedbackData.forEach((fb) => {
          fbMap[fb.week_number] = fb
        })
        setFeedbacks(fbMap)
      }
    } catch (err) {
      console.error(err)
    }
  }

  const handleViewContent = async (contentItem) => {
    try {
      // Track the view
      await supabase
        .from('content_views')
        .upsert({
          content_id: contentItem.id,
          user_id: user.id,
          viewed_at: new Date().toISOString(),
        })

      // Mark as viewed locally
      setViewedContent((prev) => new Set([...prev, contentItem.id]))

      // Download the file
      const { data, error } = await supabase.storage
        .from('weekly-content')
        .download(contentItem.file_url)

      if (error) throw error

      const url = window.URL.createObjectURL(new Blob([data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', contentItem.file_name)
      document.body.appendChild(link)
      link.click()
      link.parentNode.removeChild(link)

      toast('Downloaded successfully!', 'success')
    } catch (err) {
      toast('Error downloading: ' + err.message, 'error')
    }
  }

  const completed = Object.keys(submissions).length
  const currentWeek = completed >= 8 ? 8 : completed + 1
  const allDone = completed === 8

  // Count new (unviewed) content
  const allContentItems = Object.values(weeklyContent).flat()
  const newCount = allContentItems.filter((c) => !viewedContent.has(c.id)).length

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file && !reflection) {
      toast('Please upload a file or write a reflection', 'error')
      return
    }

    setLoading(true)
    try {
      const fileName = file ? file.name : 'reflection-only'
      const fileStorageName = file ? `${user.id}-week${selectedWeek}-${Date.now()}-${fileName}` : null

      let fileUrl = null
      if (file) {
        const { error } = await supabase.storage
          .from('submission-files')
          .upload(fileStorageName, file)
        if (error) throw error
        fileUrl = fileStorageName
      }

      const { error } = await supabase
        .from('submissions')
        .upsert({
          user_id: user.id,
          week_number: selectedWeek,
          file_name: fileName,
          file_url: fileUrl,
          reflection_text: reflection,
          submitted_at: new Date().toISOString(),
        })

      if (error) throw error
      setFile(null)
      setReflection('')
      setSelectedWeek(null)
      await fetchData(user.id)
      toast('Week ' + selectedWeek + ' submitted successfully!', 'success')

      if (completed + 1 >= 8) {
        setShowConfetti(true)
      }
    } catch (err) {
      toast('Error: ' + err.message, 'error')
    }
    setLoading(false)
  }

  const handleDelete = async () => {
    if (!window.confirm(`Delete Week ${selectedWeek} submission?`)) {
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase
        .from('submissions')
        .delete()
        .eq('user_id', user.id)
        .eq('week_number', selectedWeek)

      if (error) throw error
      toast('Week ' + selectedWeek + ' deleted', 'info')
      setSelectedWeek(null)
      fetchData(user.id)
    } catch (err) {
      toast('Error: ' + err.message, 'error')
    }
    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push('/')
  }

  if (!user) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading...
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Confetti show={showConfetti} />

      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow transition-colors duration-300">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome, {user.name || 'Student'} 👋</h1>
            <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
          <div className="flex items-center gap-4">
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

      <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">

        {/* ─── Progress Timeline ─── */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 animate-fade-in transition-colors duration-300">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5">Your Journey</h2>
          <div className="flex items-center justify-between relative">
            <div className="absolute top-5 left-6 right-6 h-1 bg-gray-200 dark:bg-gray-700 rounded-full z-0" />
            <div
              className="absolute top-5 left-6 h-1 bg-blue-600 dark:bg-blue-500 rounded-full z-0 transition-all duration-700"
              style={{ width: `${((completed - 1) / 7) * (100 - 4)}%` }}
            />

            {[1, 2, 3, 4, 5, 6, 7, 8].map((week) => {
              const isDone = !!submissions[week]
              const isCurrent = week === currentWeek && !isDone
              return (
                <div key={week} className="flex flex-col items-center z-10 relative" style={{ flex: 1 }}>
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                      isDone
                        ? 'bg-blue-600 dark:bg-blue-500 text-white shadow-md'
                        : isCurrent
                        ? 'bg-white dark:bg-gray-800 border-3 border-blue-500 dark:border-blue-400 text-blue-600 dark:text-blue-400 shadow-md animate-pulse-soft'
                        : 'bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {isDone ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    ) : week}
                  </div>
                  <span className={`text-xs mt-2 font-medium ${
                    isDone ? 'text-blue-600 dark:text-blue-400' :
                    isCurrent ? 'text-blue-600 dark:text-blue-400' :
                    'text-gray-400 dark:text-gray-500'
                  }`}>
                    W{week}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {allDone ? '🎉 All weeks completed!' : `Week ${currentWeek} — ${completed}/8 done`}
            </p>
            <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
              {Math.round((completed / 8) * 100)}%
            </span>
          </div>
        </div>

        {/* ─── Celebration Banner (if all done) ─── */}
        {allDone && (
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-700 dark:to-emerald-800 rounded-xl shadow-lg p-6 animate-fade-in">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🏆</span>
              <div>
                <h3 className="text-xl font-bold text-white">Program Complete!</h3>
                <p className="text-green-100 dark:text-green-200 mt-1">
                  Amazing work — you finished all 8 weeks. Your mentor can review your submissions now.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ─── Weekly Materials from Mentor ─── */}
        {Object.keys(weeklyContent).length > 0 && (
          <div className="animate-fade-in">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">📚 Weekly Materials</h2>
              {newCount > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full animate-pulse-soft">
                  {newCount} new
                </span>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-stagger">
              {Object.entries(weeklyContent).map(([week, items]) => (
                <div
                  key={week}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 card-hover"
                >
                  <div className="px-5 py-3 bg-indigo-50 dark:bg-indigo-900/30 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-bold text-indigo-700 dark:text-indigo-300">Week {week}</h3>
                  </div>
                  <div className="p-4 space-y-3">
                    {items.map((item) => {
                      const isNew = !viewedContent.has(item.id)
                      return (
                        <button
                          key={item.id}
                          onClick={() => handleViewContent(item)}
                          className={`w-full text-left p-3 rounded-lg border transition-all duration-200 group relative ${
                            isNew
                              ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 hover:bg-blue-100 dark:hover:bg-blue-900/30'
                              : 'bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-gray-600 border-gray-200 dark:border-gray-600'
                          }`}
                        >
                          {isNew && (
                            <span className="absolute -top-2 -right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                              NEW
                            </span>
                          )}
                          <p className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate pr-8">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                            📎 {item.file_name}
                          </p>
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Week Cards Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in-stagger">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(week => (
            <div
              key={week}
              onClick={() => setSelectedWeek(week)}
              className={`p-6 rounded-xl shadow cursor-pointer card-hover transition-all duration-300 ${
                submissions[week]
                  ? 'bg-green-50 dark:bg-green-900/20 border-2 border-green-500 dark:border-green-600'
                  : week === currentWeek
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-400 dark:border-blue-500 ring-2 ring-blue-300 dark:ring-blue-600 ring-opacity-50'
                  : 'bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700'
              } ${selectedWeek === week ? 'ring-4 ring-blue-400 dark:ring-blue-500 scale-[1.02]' : ''}`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-gray-900 dark:text-white">Week {week}</h3>
                <div className="flex items-center gap-1">
                  {feedbacks[week] && (
                    <span className="text-xs bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-semibold">💬</span>
                  )}
                  {week === currentWeek && !submissions[week] && (
                    <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full font-semibold">Current</span>
                  )}
                </div>
              </div>
              <p className={`text-sm mt-2 ${
                submissions[week] ? 'text-green-600 dark:text-green-400' :
                week === currentWeek ? 'text-blue-600 dark:text-blue-400' :
                'text-gray-400 dark:text-gray-500'
              }`}>
                {submissions[week] ? '✓ Done' : week === currentWeek ? 'In progress' : 'Upcoming'}
              </p>
            </div>
          ))}
        </div>

        {/* ─── Selected Week Detail ─── */}
        {selectedWeek && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-8 max-w-2xl animate-fade-in transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Week {selectedWeek}</h2>
              {submissions[selectedWeek] && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
                >
                  Delete
                </button>
              )}
            </div>

            {submissions[selectedWeek] ? (
              <div className="space-y-6 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Submitted on {new Date(submissions[selectedWeek].submitted_at).toLocaleDateString()}
                  </p>
                </div>

                {submissions[selectedWeek].file_name && (
                  <div>
                    <p className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">
                      File: {submissions[selectedWeek].file_name}
                    </p>
                    <button
                      onClick={async () => {
                        try {
                          const { data } = await supabase.storage
                            .from('submission-files')
                            .download(submissions[selectedWeek].file_url)

                          if (data) {
                            const url = window.URL.createObjectURL(new Blob([data]))
                            const link = document.createElement('a')
                            link.href = url
                            link.setAttribute('download', submissions[selectedWeek].file_name)
                            document.body.appendChild(link)
                            link.click()
                            link.parentNode.removeChild(link)
                            toast('Downloaded!', 'success')
                          }
                        } catch (err) {
                          toast('Error downloading: ' + err.message, 'error')
                        }
                      }}
                      className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
                    >
                      Download File
                    </button>
                  </div>
                )}

                {submissions[selectedWeek].reflection_text && (
                  <div>
                    <p className="text-sm font-semibold mb-2 text-gray-900 dark:text-white">Your Reflection:</p>
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border border-gray-200 dark:border-gray-600 transition-colors duration-300">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{submissions[selectedWeek].reflection_text}</p>
                    </div>
                  </div>
                )}

                {/* Mentor Feedback */}
                {feedbacks[selectedWeek] ? (
                  <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-base">💬</span>
                      <p className="text-sm font-semibold text-purple-700 dark:text-purple-300">Feedback from Mentor</p>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{feedbacks[selectedWeek].comment}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                      {new Date(feedbacks[selectedWeek].updated_at || feedbacks[selectedWeek].created_at).toLocaleDateString()}
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-4 rounded-lg text-center">
                    <p className="text-sm text-gray-400 dark:text-gray-500">No feedback yet — check back later</p>
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">File</label>
                  <DropZone file={file} onFileChange={setFile} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Reflection</label>
                  <textarea
                    value={reflection}
                    onChange={(e) => setReflection(e.target.value)}
                    placeholder="Write your weekly reflection here..."
                    className="w-full h-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg transition-all duration-200 disabled:opacity-50 shadow-md hover:shadow-lg"
                  >
                    {loading ? 'Submitting...' : 'Submit'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedWeek(null)}
                    className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-2 rounded-lg transition-all duration-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Pulse animation for current week */}
      <style jsx global>{`
        @keyframes pulse-soft {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
          50% { box-shadow: 0 0 0 8px rgba(59, 130, 246, 0); }
        }
        .animate-pulse-soft {
          animation: pulse-soft 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
