export function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-brand-sky">
          {label}
        </label>
      )}
      <input
        className={`
          w-full px-4 py-2.5 rounded-xl
          bg-brand-navy/60 border border-brand-teal/40
          text-white placeholder-brand-sky/50
          focus:outline-none focus:border-brand-teal focus:ring-1 focus:ring-brand-teal
          transition-colors
          ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-400">{error}</p>}
    </div>
  )
}
