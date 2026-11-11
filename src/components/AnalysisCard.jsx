/** Glass card with an optional icon, title and action slot. */
export default function AnalysisCard({ icon: Icon, title, subtitle, action, children, className = '', bodyClassName = '' }) {
  return (
    <section className={`card ${className}`}>
      {(title || action) && (
        <header className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            {Icon && (
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/12 text-primary ring-1 ring-primary/20">
                <Icon className="h-4.5 w-4.5" aria-hidden="true" />
              </span>
            )}
            <div>
              {title && <h2 className="text-base font-semibold text-ink">{title}</h2>}
              {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
            </div>
          </div>
          {action}
        </header>
      )}
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
