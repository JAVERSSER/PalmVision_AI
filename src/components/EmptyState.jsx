/** Friendly empty state with icon, copy and optional action. */
export default function EmptyState({ icon: Icon, title, body, action, className = '' }) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl border border-dashed border-line px-6 py-12 text-center ${className}`}>
      {Icon && (
        <span className="mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-primary/10 text-primary">
          <Icon className="h-7 w-7" aria-hidden="true" />
        </span>
      )}
      <h3 className="text-base font-semibold text-ink">{title}</h3>
      {body && <p className="mt-1.5 max-w-sm text-sm text-muted">{body}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
