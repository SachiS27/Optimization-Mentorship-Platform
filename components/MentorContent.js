import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function MentorContent() {
  const [content, setContent] = useState({})
  const [views, setViews] = useState({})
  const [students, setStudents] = useState([])
  const [uploadWeek, setUploadWeek] = useState(null)
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    fetchAll()
  }, [])

  const fetchAll = async () => {
    setLoading(true)
    try {
      // Get students with emails
      const { data: studentsData } = await supabase
        .from('users')
        .select('id, name, email')
        .eq('role', 'student')
      if (studentsData) setStudents(studentsData)

      // Get all content
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
        setContent(map)
      }

      // Get all views with user details
      const { data: viewsData } = await supabase
        .from('content_views')
        .select('content_id, user_id, users(email)')

      if (viewsData) {
        // Map content_id → array of viewer IDs (extracted from email)
        const viewMap = {}
        viewsData.forEach((v) => {
          if (!viewMap[v.content_id]) viewMap[v.content_id] = []
          const email = v.users?.email || ''
          const studentId = email.split('@')[0]
          viewMap[v.content_id].push({ userId: v.user_id, studentId, email })
        })
        setViews(viewMap)
      }
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file || !title) {
      alert('Please fill in all fields')
      return
    }

    setUploading(true)
    try {
      const mentorId = localStorage.getItem('user_id')
      const fileStorageName = `content-week${uploadWeek}-${Date.now()}-${file.name}`

      const { error: storageError } = await supabase.storage
        .from('weekly-content')
        .upload(fileStorageName, file)

      if (storageError) throw storageError

      const { error: dbError } = await supabase
        .from('weekly_content')
        .insert({
          week_number: uploadWeek,
          title,
          file_name: file.name,
          file_url: fileStorageName,
          uploaded_by: mentorId,
        })

      if (dbError) throw dbError

      setUploadWeek(null)
      setTitle('')
      setFile(null)
      fetchAll()
    } catch (err) {
      alert('Error uploading: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (contentId, fileUrl) => {
    if (!window.confirm('Delete this content?')) return

    try {
      // Delete from storage
      await supabase.storage.from('weekly-content').remove([fileUrl])
      // Delete from database (views cascade)
      await supabase.from('weekly_content').delete().eq('id', contentId)
      fetchAll()
    } catch (err) {
      alert('Error deleting: ' + err.message)
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="flex items-center gap-3 text-gray-500 dark:text-gray-400">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Loading content...
      </div>
    </div>
  )

  return (
    <div className="animate-fade-in space-y-8">
      {/* Upload Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Weekly Materials</h2>
        <button
          onClick={() => setUploadWeek(uploadWeek ? null : 1)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
        >
          + Upload Material
        </button>
      </div>

      {/* Upload Form */}
      {uploadWeek && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 animate-fade-in">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Upload New Material</h3>
          <form onSubmit={handleUpload} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Week</label>
              <select
                value={uploadWeek}
                onChange={(e) => setUploadWeek(Number(e.target.value))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((w) => (
                  <option key={w} value={w}>Week {w}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="e.g., Week 3 - Data Exploration Guide"
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">File</label>
              <input
                type="file"
                onChange={(e) => setFile(e.target.files?.[0])}
                required
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={uploading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 disabled:opacity-50 shadow-md"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
              <button
                type="button"
                onClick={() => { setUploadWeek(null); setTitle(''); setFile(null) }}
                className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-2 px-6 rounded-lg transition-all duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Content Grid by Week */}
      {[1, 2, 3, 4, 5, 6, 7, 8].map((week) => {
        const weekContent = content[week] || []
        if (weekContent.length === 0) return null

        return (
          <div key={week} className="bg-white dark:bg-gray-800 rounded-xl shadow overflow-hidden transition-colors duration-300">
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700/50 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Week {week}</h3>
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {weekContent.map((item) => {
                const viewers = views[item.id] || []
                const totalStudents = students.length || 9
                const notViewed = students.filter(
                  (s) => !viewers.some((v) => v.userId === s.id)
                )
                return (
                  <div key={item.id} className="px-6 py-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 dark:text-white truncate">{item.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {item.file_name} · Uploaded {new Date(item.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDelete(item.id, item.file_url)}
                        className="ml-4 text-red-500 hover:text-red-700 dark:hover:text-red-400 text-sm font-semibold transition-colors duration-200"
                      >
                        Delete
                      </button>
                    </div>

                    {/* View stats */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 max-w-[160px] bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                        <div
                          className="h-1.5 rounded-full transition-all duration-500"
                          style={{
                            width: `${(viewers.length / totalStudents) * 100}%`,
                            backgroundColor: viewers.length === totalStudents ? '#22C55E' : '#3B82F6',
                          }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        👁 {viewers.length}/{totalStudents} viewed
                      </span>
                    </div>

                    {/* Viewer IDs */}
                    {viewers.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {viewers.map((v) => (
                          <span
                            key={v.userId}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                          >
                            ✓ {v.studentId}
                          </span>
                        ))}
                      </div>
                    )}
                    {notViewed.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {notViewed.map((s) => {
                          const sid = s.email.split('@')[0]
                          return (
                            <span
                              key={s.id}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                            >
                              ○ {sid}
                            </span>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}

      {/* Empty state */}
      {Object.keys(content).length === 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-12 text-center">
          <p className="text-4xl mb-3">📚</p>
          <p className="text-gray-500 dark:text-gray-400 text-lg">No materials uploaded yet</p>
          <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Click "+ Upload Material" to share weekly content with students</p>
        </div>
      )}
    </div>
  )
}
