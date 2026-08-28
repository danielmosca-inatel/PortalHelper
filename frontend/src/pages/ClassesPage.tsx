import { useQuery } from '@tanstack/react-query'
import { fetchJson, type ClassSummary } from '../lib/api'

export function ClassesPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['classes'],
    queryFn: () => fetchJson<ClassSummary[]>('/classes'),
  })

  if (isLoading) return <div className="p-8 text-sm text-neutral-500">Loading classes…</div>
  if (error) return <div className="p-8 text-sm text-red-500">Failed to load classes.</div>

  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold">Classes</h2>
      <ul className="mt-4 divide-y divide-neutral-200 dark:divide-neutral-800">
        {data?.map((c) => (
          <li key={c.id} className="flex justify-between py-2 text-sm">
            <span>{c.name}</span>
            <span className="text-neutral-500">{c.students} students</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
