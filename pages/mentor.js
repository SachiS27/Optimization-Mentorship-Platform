import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function MentorDashboard() {
  const router = useRouter()
  const [students, setStudents] = useState([])
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentSubmissions, setStudentSubmissions] = useState({})
  const [loading, setLoading] = useState(false)
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [newStudentEmail, setNewStudentEmail] = useState('')
  const [newStudentName, setNewStudentName] = useState('')
  const [newStudentPassword, setNewStudentPassword] = useState('')

  useEffect(() => {
    // Check auth
    const userRole = localStorage.getItem('user_role')
    if (userRole !== 'mentor') {
      router.push('/')
      return
    }

    fetchStudents()
  }, [router])

  const fetchStudents = async () => {
    try {
      const { data } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'student')

      if (data) {
        setStudents(data)
      }
    } catch (err) {
      console.error('Error fetching students:', err)
    }
  }

  const fetchStudentSubmissions = async (studentId) => {
    try {
      setLoading(true)
      const { data } = await supabase
        .from('submissions')
        .select('*')
        .eq('user_id', studentId)

      if (data) {
        const submissionMap = {}
        data.forEach((sub) => {
          submissionMap[sub.week_number] = sub
        })
        setStudentSubmissions(submissionMap)
      }
    } catch (err) {
      console.error('Error fetching submissions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectStudent = (student) => {
    setSelectedStudent(student)
    fetchStudentSubmissions(student.id)
  }

  const handleAddStudent = async (e) => {
    e.preventDefault()
    if (!newStudentEmail || !newStudentName || !newStudentPassword) {
      alert('Please fill all fields')
      return
    }

    try {
      const { error } = await supabase
        .from('users')
        .insert([
          {
            email: newStudentEmail,
            name: newStudentName,
            password_hash: newStudentPassword,
            role: 'student',
          },
        ])

      if (error) throw error

      alert('Student added successfully!')
      setNewStudentEmail('')
      setNewStudentName('')
      setNewStudentPassword('')
      setShowAddStudent(false)
      fetchStudents()
    } catch (err) {
      alert('Error adding student: ' + err.message)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('user_id')
    localStorage.removeItem('user_role')
    localStorage.removeItem('user_email')
    router.push('/')
  }

  const downloadFile = async (fileUrl) => {
    if (!fileUrl) {
      alert('No file to download')
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
      link.setAttribute('download', fileUrl.split('/').pop())
      document.body.appendChild(link)
      link.click()
      link.parentChild.removeChild(link)
    } catch (err) {
      alert('Error downloading: ' + err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mentor Dashboard</h1>
            <p className="text-gray-600">Multi-Echelon Optimization Program</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition"
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Students List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  Students ({students.length})
                </h2>
                <button
                  onClick={() => setShowAddStudent(!showAddStudent)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition"
                >
                  {showAddStudent ? 'Cancel' : 'Add Student'}
                </button>
              </div>

              {showAddStudent && (
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                  <form onSubmit={handleAddStudent} className="space-y-4">
                    <input
                      type="text"
                      placeholder="Student Name"
                      value={newStudentName}
                      onChange={(e) => setNewStudentName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      required
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={newStudentEmail}
                      onChange={(e) => setNewStudentEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      required
                    />
                    <input
                      type="password"
                      placeholder="Password"
                      value={newStudentPassword}
                      onChange={(e) => setNewStudentPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      required
                    />
                    <button
                      type="submit"
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg text-sm transition"
                    >
                      Add Student
                    </button>
                  </form>
                </div>
              )}

              <div className="overflow-y-auto max-h-96">
                {students.map((student) => (
                  <div
                    key={student.id}
                    onClick={() => handleSelectStudent(student)}
                    className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-blue-50 transition ${
                      selectedStudent?.id === student.id ? 'bg-blue-100' : ''
                    }`}
                  >
                    <p className="font-semibold text-gray-800">{student.name}</p>
                    <p className="text-sm text-gray-600">{student.email}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Submissions View */}
          <div className="lg:col-span-2">
            {selectedStudent ? (
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">
                    {selectedStudent.name}'s Submissions
                  </h2>
                  <p className="text-gray-600">{selectedStudent.email}</p>
                </div>

                {loading ? (
                  <div className="p-6 text-center text-gray-600">Loading...</div>
                ) : (
                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                      {/* POA Grid Item */}
                      <div
                        className={`p-4 rounded-lg text-center border-2 ${
                          studentSubmissions[0]
                            ? 'bg-green-50 border-green-500'
                            : 'bg-gray-50 border-gray-300'
                        }`}
                      >
                        <p className="font-bold text-gray-800">POA</p>
                        {studentSubmissions[0] ? (
                          <p className="text-green-600 text-sm font-semibold">✓</p>
                        ) : (
                          <p className="text-gray-400 text-sm">-</p>
                        )}
                      </div>

                      {/* Week Grid Items */}
                      {Array.from({ length: 8 }, (_, i) => i + 1).map((week) => {
                        const isSubmitted = studentSubmissions[week]
                        return (
                          <div
                            key={week}
                            className={`p-4 rounded-lg text-center border-2 ${
                              isSubmitted
                                ? 'bg-green-50 border-green-500'
                                : 'bg-gray-50 border-gray-300'
                            }`}
                          >
                            <p className="font-bold text-gray-800">W{week}</p>
                            {isSubmitted ? (
                              <p className="text-green-600 text-sm font-semibold">✓</p>
                            ) : (
                              <p className="text-gray-400 text-sm">-</p>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Detailed Submissions */}
                    <div className="space-y-6">
                      {/* POA Submission */}
                      {(() => {
                        const sub = studentSubmissions[0]
                        return (
                          <div
                            key="poa"
                            className={`p-4 rounded-lg border ${
                              sub
                                ? 'bg-green-50 border-green-200'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-bold text-gray-800">Plan of Action</h3>
                              {sub && (
                                <span className="text-xs text-gray-600">
                                  {new Date(sub.submitted_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            {sub ? (
                              <div className="space-y-3">
                                {sub.file_name && (
                                  <div>
                                    <p className="text-sm text-gray-700 font-semibold mb-1">
                                      File: {sub.file_name}
                                    </p>
                                    <button
                                      onClick={() => downloadFile(sub.file_url)}
                                      className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition"
                                    >
                                      Download
                                    </button>
                                  </div>
                                )}
                                {sub.reflection_text && (
                                  <div>
                                    <p className="text-sm text-gray-700 font-semibold mb-1">
                                      Reflection:
                                    </p>
                                    <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-300">
                                      {sub.reflection_text}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600 italic">
                                Not submitted
                              </p>
                            )}
                          </div>
                        )
                      })()}

                      {/* Week Submissions */}
                      {Array.from({ length: 8 }, (_, i) => i + 1).map((week) => {
                        const sub = studentSubmissions[week]
                        return (
                          <div
                            key={week}
                            className={`p-4 rounded-lg border ${
                              sub
                                ? 'bg-green-50 border-green-200'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <h3 className="font-bold text-gray-800">Week {week}</h3>
                              {sub && (
                                <span className="text-xs text-gray-600">
                                  {new Date(sub.submitted_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>

                            {sub ? (
                              <div className="space-y-3">
                                {sub.file_name && (
                                  <div>
                                    <p className="text-sm text-gray-700 font-semibold mb-1">
                                      File: {sub.file_name}
                                    </p>
                                    <button
                                      onClick={() => downloadFile(sub.file_url)}
                                      className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition"
                                    >
                                      Download
                                    </button>
                                  </div>
                                )}
                                {sub.reflection_text && (
                                  <div>
                                    <p className="text-sm text-gray-700 font-semibold mb-1">
                                      Reflection:
                                    </p>
                                    <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-300">
                                      {sub.reflection_text}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600 italic">
                                Not submitted
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-600 text-lg">
                  Select a student to view their submissions
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
