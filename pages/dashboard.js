import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [submissions, setSubmissions] = useState({})
  const [selectedWeek, setSelectedWeek] = useState(null)
  const [file, setFile] = useState(null)
  const [reflection, setReflection] = useState('')
  const [loading, setLoading] = useState(false)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    // Check auth
    const userId = localStorage.getItem('user_id')
    const userRole = localStorage.getItem('user_role')
    const userEmail = localStorage.getItem('user_email')

    if (!userId || userRole !== 'student') {
      router.push('/')
      return
    }

    setUser({ id: userId, role: userRole, email: userEmail })

    // Fetch user name and submissions
    fetchUserData(userId)
  }, [router])

  const fetchUserData = async (userId) => {
    try {
      // Get user name
      const { data: userData } = await supabase
        .from('users')
        .select('name')
        .eq('id', userId)
        .single()

      if (userData) {
        setUserName(userData.name)
      }

      // Get submissions
      const { data: subs } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', userId)

      if (subs) {
        const submissionMap = {}
        subs.forEach((sub) => {
          submissionMap[sub.week_number] = sub
        })
        setSubmissions(submissionMap)
      }
    } catch (err) {
      console.error('Error fetching data:', err)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!file && !reflection) {
      alert('Please upload a file or write a reflection')
      return
    }

    setLoading(true)

    try {
      const fileName = file ? file.name : 'reflection-only'

      // Upload file if exists
      let fileUrl = null
      if (file) {
        const filePath = `${user.id}/week-${selectedWeek}/${fileName}`

        // Delete old file first (if exists)
        await supabase.storage
          .from('submission-files')
          .remove([filePath])

        // Then upload new file
        const { data, error } = await supabase.storage
          .from('submission-files')
          .upload(filePath, file)

        if (error) throw error
        fileUrl = data.path
      }

      // Create/update submission
      const { error: submitError } = await supabase
        .from('submissions')
        .upsert({
          user_id: user.id,
          week_number: selectedWeek,
          file_name: fileName,
          file_url: fileUrl,
          reflection_text: reflection,
          submitted_at: new Date().toISOString(),
        })

      if (submitError) throw submitError

      alert('Submission saved successfully!')
      setFile(null)
      setReflection('')
      setSelectedWeek(null)
      
      // Refresh data
      fetchUserData(user.id)
    } catch (err) {
      alert('Error submitting: ' + err.message)
    }

    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_email')
    router.push('/')
  }

  if (!user) return <div className="text-center mt-20">Loading...</div>

  const completedWeeks = Object.keys(submissions).length
  const totalWeeks = 8

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Welcome, {userName || 'Student'}
            </h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Progress Summary */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Your Progress</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600">
                Completed Weeks: <span className="font-bold text-blue-600 text-lg">{completedWeeks}/{totalWeeks}</span>
              </p>
              <p className="text-gray-600 text-sm mt-2">
                Keep going! You're making great progress.
              </p>
            </div>
            <div className="w-32 h-32 flex items-center justify-center">
              <div className="relative w-24 h-24">
                <svg className="transform -rotate-90 w-24 h-24">
                  <circle
                    cx="48"
                    cy="48"
                    r="44"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="44"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="8"
                    strokeDasharray={`${(completedWeeks / totalWeeks) * 276.3} 276.3`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold">{Math.round((completedWeeks / totalWeeks) * 100)}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Week Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 8 }, (_, i) => i + 1).map((week) => {
            const isCompleted = submissions[week]
            return (
              <div
                key={week}
                onClick={() => setSelectedWeek(week)}
                className={`p-6 rounded-lg shadow cursor-pointer transition transform hover:scale-105 ${
                  isCompleted
                    ? 'bg-green-50 border-2 border-green-500'
                    : 'bg-white border-2 border-gray-200'
                } ${selectedWeek === week ? 'ring-4 ring-blue-400' : ''}`}
              >
                <h3 className="text-lg font-bold text-gray-800">Week {week}</h3>
                {isCompleted ? (
                  <p className="text-green-600 font-semibold text-sm mt-2">✓ Submitted</p>
                ) : (
                  <p className="text-gray-600 text-sm mt-2">Not submitted</p>
                )}
                {isCompleted && submissions[week].submitted_at && (
                  <p className="text-gray-500 text-xs mt-1">
                    {new Date(submissions[week].submitted_at).toLocaleDateString()}
                  </p>
                )}
              </div>
            )
          })}
        </div>

        {/* Submission Form */}
        {selectedWeek && (
          <div className="bg-white rounded-lg shadow p-8 max-w-2xl">
            <h2 className="text-2xl font-bold mb-6">
              Week {selectedWeek} Submission
              {submissions[selectedWeek] && (
                <span className="text-green-600 text-lg ml-4">✓ Already submitted</span>
              )}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload File (Optional)
                </label>
                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0])}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  accept=".pdf,.docx,.doc,.zip,.ipynb,.py,.txt"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Accepted: PDF, DOCX, ZIP, Jupyter notebooks, Python files
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reflection (Optional)
                </label>
                <textarea
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  className="w-full h-32 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Share your thoughts, challenges, or progress..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedWeek(null)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded-lg transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
