import { useState, useEffect, useRef } from 'react'

export default function NotificationBell({ students, allSubmissions }) {
  const [open, setOpen] = useState(false)
  const [lastViewed, setLastViewed] = useState(null)
  const [notifications, setNotifications] = useState([])
  const ref = useRef(null)

  useEffect(() => {
    // Load last viewed timestamp
    const stored = localStorage.getItem('last_notification_view')
    if (stored) {
      setLastViewed(new Date(stored))
    } else {
      // First time — set to now so no old submissions show
      const now = new Date().toISOString()
      localStorage.setItem('last_notification_view', now)
      setLastViewed(new Date(now))
    }
  }, [])

  useEffect(() => {
    // Close dropdown when clicking outside
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (!lastViewed || !students.length) return

    // Build notification list from submissions after lastViewed
    const notifs = []
    students.forEach((student) => {
      const subs = allSubmissions[student.id] || {}
      Object.values(subs).forEach((sub) => {
        const submittedAt = new Date(sub.submitted_at)
        if (submittedAt > lastViewed) {
          notifs.push({
            id: sub.id || `${student.id}-${sub.week_number}`,
            studentName: student.name,
            studentEmail: student.email,
            week: sub.week_number,
            time: submittedAt,
          })
        }
      })
    })

    // Sort newest first
    notifs.sort((a, b) => b.time - a.time)
    setNotifications(notifs)
  }, [lastViewed, students, allSubmissions])

  const handleMarkRead = () => {
    const now = new Date().toISOString()
    localStorage.setItem('last_notification_view', now)
    setLastViewed(new Date(now))
    setOpen(false)
  }

  const formatTime = (date) => {
    const now = new Date()
    const diff = Math.floor((now - date) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
    return date.toLocaleDateString()
  }

  const unreadCount = notifications.length

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 focus:outline-none"
        aria-label="Notifications"
      >
        {/* Bell icon */}
        <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center animate-pulse-soft">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkRead}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-400 dark:text-gray-500 text-sm">No new submissions</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className="px-4 py-3 border-b border-gray-100 dark:border-gray-700 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">📝</span>
                    <div>
                      <p className="text-sm text-gray-900 dark:text-white">
                        <span className="font-semibold">{n.studentName}</span> submitted{' '}
                        <span className="font-semibold">Week {n.week}</span>
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{formatTime(n.time)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
