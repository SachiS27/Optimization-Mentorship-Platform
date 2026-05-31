import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'

const COLORS = {
  completed: '#22C55E',
  pending: '#E5E7EB',
}

const WEEK_COLORS = ['#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF', '#EC4899', '#F43F5E', '#F97316']

export default function Analytics({ students, allSubmissions }) {
  // Calculate overall completion
  const totalPossible = students.length * 8
  const totalCompleted = students.reduce((acc, student) => {
    const subs = allSubmissions[student.id] || {}
    return acc + Object.keys(subs).length
  }, 0)
  const totalPending = totalPossible - totalCompleted
  const completionPercent = totalPossible > 0 ? Math.round((totalCompleted / totalPossible) * 100) : 0

  // Donut chart data
  const donutData = [
    { name: 'Completed', value: totalCompleted },
    { name: 'Pending', value: totalPending },
  ]

  // Bar chart data — submissions per week
  const weekData = [1, 2, 3, 4, 5, 6, 7, 8].map((week) => {
    const count = students.filter((student) => {
      const subs = allSubmissions[student.id] || {}
      return subs[week]
    }).length
    return { week: `W${week}`, submissions: count }
  })

  return (
    <div className="animate-fade-in space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 card-hover">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Total Students</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{students.length}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 card-hover">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Overall Completion</p>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">{completionPercent}%</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6 card-hover">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Submissions</p>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mt-2">{totalCompleted} / {totalPossible}</p>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Donut Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Completion Overview</h3>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={donutData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={COLORS.completed} />
                  <Cell fill={COLORS.pending} />
                </Pie>
                <text
                  x="50%"
                  y="47%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-3xl font-bold"
                  fill="currentColor"
                >
                  {completionPercent}%
                </text>
                <text
                  x="50%"
                  y="57%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-sm"
                  fill="#9CA3AF"
                >
                  complete
                </text>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1F2937',
                    border: 'none',
                    borderRadius: '8px',
                    color: '#F9FAFB',
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  formatter={(value) => (
                    <span className="text-sm text-gray-600 dark:text-gray-300">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Submissions per Week</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={weekData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis
                dataKey="week"
                tick={{ fill: '#9CA3AF', fontSize: 13 }}
                axisLine={{ stroke: '#4B5563' }}
              />
              <YAxis
                tick={{ fill: '#9CA3AF', fontSize: 13 }}
                axisLine={{ stroke: '#4B5563' }}
                domain={[0, students.length]}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: 'none',
                  borderRadius: '8px',
                  color: '#F9FAFB',
                }}
                formatter={(value) => [`${value} student${value !== 1 ? 's' : ''}`, 'Submitted']}
              />
              <Bar dataKey="submissions" radius={[6, 6, 0, 0]} maxBarSize={48}>
                {weekData.map((entry, index) => (
                  <Cell key={index} fill={WEEK_COLORS[index % WEEK_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  )
}
