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

  useEffect(() => {
    const userId = localStorage.getItem('user_id')
    const userRole = localStorage.getItem('user_role')
    const userEmail = localStorage.getItem('user_email')

    if (!userId || userRole !== 'student') {
      router.push('/')
      return
    }

    setUser({ id: userId, role: userRole, email: userEmail })
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
    } catch (err) {
      console.error(err)
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
      alert('Submitted!')
      setFile(null)
      setReflection('')
      setSelectedWeek(null)
      fetchData(user.id)
    } catch (err) {
      alert('Error: ' + err.message)
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
      alert('Deleted!')
      setSelectedWeek(null)
      fetchData(user.id)
    } catch (err) {
      alert('Error: ' + err.message)
    }
    setLoading(false)
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push('/')
  }

  if (!user) return <div className="text-center mt-20">Loading...</div>

  const completed = Object.keys(submissions).length

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome</h1>
            <p className="text-gray-600">{user.email}</p>
          </div>
          <button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg">
            Log Out
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Progress</h2>
          <p className="text-gray-600">
            Completed: <span className="font-bold text-blue-600">{completed}/8</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(week => (
            <div
              key={week}
              onClick={() => setSelectedWeek(week)}
              className={`p-6 rounded-lg shadow cursor-pointer ${
                submissions[week] ? 'bg-green-50 border-2 border-green-500' : 'bg-white border-2 border-gray-200'
              } ${selectedWeek === week ? 'ring-4 ring-blue-400' : ''}`}
            >
              <h3 className="font-bold">Week {week}</h3>
              <p className="text-sm mt-2">{submissions[week] ? '✓ Done' : 'Not done'}</p>
            </div>
          ))}
        </div>

        {selectedWeek && (
          <div className="bg-white rounded-lg shadow p-8 max-w-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Week {selectedWeek}</h2>
              {submissions[selectedWeek] && (
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={loading}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg"
                >
                  Delete
                </button>
              )}
            </div>

            {submissions[selectedWeek] ? (
              <div className="space-y-6 mb-6">
                <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">Submitted on {new Date(submissions[selectedWeek].submitted_at).toLocaleDateString()}</p>
                </div>
                
                {submissions[selectedWeek].file_name && (
                  <div>
                    <p className="text-sm font-semibold mb-2">File: {submissions[selectedWeek].file_name}</p>
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
                          }
                        } catch (err) {
                          alert('Error downloading file: ' + err.message)
                        }
                      }}
                      className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                    >
                      Download File
                    </button>
                  </div>
                )}

                {submissions[selectedWeek].reflection_text && (
                  <div>
                    <p className="text-sm font-semibold mb-2">Your Reflection:</p>
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm text-gray-700">{submissions[selectedWeek].reflection_text}</p>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setFile(null)
                    setReflection('')
                  }}
                  className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg"
                >
                  Edit Submission
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">File</label>
                  <input type="file" onChange={(e) => setFile(e.target.files?.[0])} className="w-full px-4 py-2 border rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Reflection</label>
                  <textarea value={reflection} onChange={(e) => setReflection(e.target.value)} className="w-full h-32 px-4 py-2 border rounded-lg" />
                </div>
                <div className="flex gap-4">
                  <button type="submit" disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg">
                    {loading ? 'Submitting...' : 'Submit'}
                  </button>
                  <button type="button" onClick={() => setSelectedWeek(null)} className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 py-2 rounded-lg">
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
