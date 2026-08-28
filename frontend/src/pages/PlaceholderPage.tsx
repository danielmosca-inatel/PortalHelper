export function PlaceholderPage({ title, description }: { title: string; description: string }) {
  return (
    <div className="p-8">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-neutral-500">{description}</p>
    </div>
  )
}
