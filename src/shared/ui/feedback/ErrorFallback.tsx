type ErrorFallbackProps = {
  actionLabel: string;
  description: string;
  onAction: () => void;
  title: string;
};

export function ErrorFallback({
  actionLabel,
  description,
  onAction,
  title,
}: ErrorFallbackProps) {
  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-6 py-12 text-fg">
      <section
        aria-labelledby="error-title"
        className="rounded-14 w-full max-w-xl border border-line bg-surface p-8 text-center shadow-popover"
        role="alert"
      >
        <h1 className="text-2xl font-semibold" id="error-title">
          {title}
        </h1>
        <p className="mt-3 text-sm text-fg-2">{description}</p>
        <button
          className="rounded-8 mt-6 bg-accent px-5 py-3 font-semibold text-accent-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          onClick={onAction}
          type="button"
        >
          {actionLabel}
        </button>
      </section>
    </main>
  );
}
