import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Classes', end: true },
  { to: '/grades', label: 'Grades' },
  { to: '/exams', label: 'Exam Dates' },
  { to: '/attendance', label: 'Attendance' },
  { to: '/assistant', label: 'AI Assistant' },
]

export function Sidebar() {
  return (
    <nav className="flex w-56 shrink-0 flex-col gap-1 border-r border-neutral-200 p-4 dark:border-neutral-800">
      <h1 className="mb-4 px-2 text-lg font-semibold">Portal Helper</h1>
      {links.map((link) => (
        <NavLink
          key={link.to}
          to={link.to}
          end={link.end}
          className={({ isActive }) =>
            `rounded-md px-2 py-1.5 text-sm ${
              isActive
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                : 'text-neutral-600 hover:bg-neutral-100 dark:text-neutral-300 dark:hover:bg-neutral-800'
            }`
          }
        >
          {link.label}
        </NavLink>
      ))}
    </nav>
  )
}
