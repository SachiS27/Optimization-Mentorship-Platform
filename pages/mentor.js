import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function MentorDashboard() {
  const router = useRouter()
  const [students, setStudents] = useState([])
  const [allSubmissions, setAllSubmissions] = useState({})
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [studentSubmissions, setStudentSubmissions] = useState({})
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
    } catch (err) {
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectStudent = (student) => {
    setSelectedStudent(student)
    setStudentSubmissions(allSubmissions[student.id] || {})
  }

  const downloadFile = async (fileUrl) => {
    if (!fileUrl) {
      alert('No file')
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
    } catch (err) {
      alert('Error: ' + err.message)
    }
  }

  const handleLogout = () => {
    localStorage.clear()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Mentor Dashboard</h1>
            <p className="text-gray-600">Multi-Echelon Optimization</p>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Log Out
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setView('summary')}
            className={`px-6 py-2 rounded-lg font-semibold ${
              view === 'summary'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-800 border border-gray-300'
            }`}
          >
            Summary View
          </button>
          <button
            onClick={() => setView('detail')}
            className={`px-6 py-2 rounded-lg font-semibold ${
              view === 'detail'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-800 border border-gray-300'
            }`}
          >
            Student View
          </button>
        </div>

        {view === 'summary' ? (
          <div className="bg-white rounded-lg shadow overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="px-6 py-4 text-left font-semibold text-gray-800">Student</th>
                  <th className="px-6 py-4 text-center font-semibold text-gray-800">Email</th>
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((week) => (
                    <th key={week} className="px-4 py-4 text-center font-semibold text-gray-800">
                      W{week}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-center font-semibold text-gray-800">Progress</th>
                </tr>
              </thead>
              <tbody>
                {students.map((student) => {
                  const submissions = allSubmissions[student.id] || {}
                  const completed = Object.keys(submissions).length
                  const percentage = Math.round((completed / 8) * 100)

                  return (
                    <tr key={student.id} className="border-b border-gray-200 hover:bg-blue-50">
                      <td className="px-6 py-4">
                        <button
                          onClick={() => {
                            handleSelectStudent(student)
                            setView('detail')
                          }}
                          className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                        >
                          {student.name}
                        </button>
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-600">{student.email}</td>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((week) => (
                        <td key={week} className="px-4 py-4 text-center">
                          {submissions[week] ? (
                            <span className="text-green-600 font-bold">✓</span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                      ))}
                      <td className="px-6 py-4 text-center">
                        <span className={`font-semibold ${percentage === 100 ? 'text-green-600' : 'text-gray-600'}`}>
                          {percentage}%
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-xl font-bold text-gray-800">Students ({students.length})</h2>
                </div>
                <div className="overflow-y-auto max-h-96">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => handleSelectStudent(student)}
                      className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-blue-50 ${
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

            <div className="lg:col-span-2">
              {selectedStudent ? (
                <div className="bg-white rounded-lg shadow">
                  <div className="p-6 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-800">{selectedStudent.name}</h2>
                    <p className="text-gray-600">{selectedStudent.email}</p>
                  </div>

                  <div className="p-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((week) => (
                        <div
                          key={week}
                          className={`p-4 rounded-lg text-center border-2 ${
                            studentSubmissions[week]
                              ? 'bg-green-50 border-green-500'
                              : 'bg-gray-50 border-gray-300'
                          }`}
                        >
                          <p className="font-bold text-gray-800">Week {week}</p>
                          {studentSubmissions[week] ? (
                            <p className="text-green-600 text-sm font-semibold">✓</p>
                          ) : (
                            <p className="text-gray-400 text-sm">-</p>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-4">
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((week) => {
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
                              <div className="space-y-2">
                                {sub.file_name && (
                                  <div>
                                    <p className="text-sm text-gray-700 font-semibold">File: {sub.file_name}</p>
                                    <button
                                      onClick={() => downloadFile(sub.file_url)}
                                      className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded mt-1"
                                    >
                                      Download
                                    </button>
                                  </div>
                                )}
                                {sub.reflection_text && (
                                  <div>
                                    <p className="text-sm text-gray-700 font-semibold">Reflection:</p>
                                    <p className="text-sm text-gray-700 bg-white p-2 rounded border border-gray-300 mt-1">
                                      {sub.reflection_text}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <p className="text-sm text-gray-600">Not submitted</p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow p-12 text-center">
                  <p className="text-gray-600 text-lg">Select a student to view submissions</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
