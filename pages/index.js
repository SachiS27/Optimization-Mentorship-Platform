import { useState } from 'react'
import { useRouter } from 'next/router'
import { supabase } from '../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // Get user from database
      const { data: users, error: queryError } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single()

      if (queryError || !users) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      // Simple password check (in production, use bcrypt)
      if (users.password_hash !== password) {
        setError('Invalid email or password')
        setLoading(false)
        return
      }

      // Store auth in localStorage
      localStorage.setItem('user_id', users.id)
      localStorage.setItem('user_role', users.role)
      localStorage.setItem('user_email', users.email)

      // Redirect based on role
      if (users.role === 'mentor') {
        router.push('/mentor')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Error logging in: ' + err.message)
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          Mentorship Platform
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Multi-Echelon Optimization
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200 disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600 text-center">
            Demo credentials:
          </p>
          <p className="text-xs text-gray-500 text-center mt-2">
            Mentor: mentor@program.in / mentor123
          </p>
          <p className="text-xs text-gray-500 text-center">
            Student: student1@program.in / pass123
          </p>
        </div>
      </div>
    </div>
  )
}
