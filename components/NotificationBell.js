import { useState, useEffect, useRef } from 'react'

export default function NotificationBell({ students, allSubmissions }) {
  const [open, setOpen] = useState(false)
  const [viewedIds, setViewedIds] = useState(new Set())
  const [notifications, setNotifications] = useState([])
  const ref = useRef(null)

  // Load viewed submission IDs from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('viewed_submissions')
      if (stored) {
        setViewedIds(new Set(JSON.parse(stored)))
      }
    } catch (e) {
      console.error('Error loading viewed submissions:', e)
    }
  }, [])

  // Build notification list from unviewed submissions
  useEffect(() => {
    if (!students.length) return

    const notifs = []
    students.forEach((student) => {
      const subs = allSubmissions[student.id] || {}
      Object.values(subs).forEach((sub) => {
        const subKey = `${student.id}_w${sub.week_number}`
        if (!viewedIds.has(subKey)) {
          notifs.push({
            key: subKey,
            studentName: student.name,
            week: sub.week_number,
            time: new Date(sub.submitted_at),
          })
        }
      })
    })

    // Sort newest first
    notifs.sort((a, b) => b.time - a.time)
    setNotifications(notifs)
  }, [students, allSubmissions, viewedIds])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleMarkRead = () => {
    // Mark ALL current submissions as viewed
    const newViewed = new Set(viewedIds)
    students.forEach((student) => {
      const subs = allSubmissions[student.id] || {}
      Object.keys(subs).forEach((weekNum) => {
        newViewed.add(`${student.id}_w${weekNum}`)
      })
    })
    setViewedIds(newViewed)
    localStorage.setItem('viewed_submissions', JSON.stringify([...newViewed]))
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
        <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden animate-fade-in">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">New Submissions</h3>
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
                <p className="text-gray-400 dark:text-gray-500 text-sm">All caught up! 🎉</p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.key}
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
