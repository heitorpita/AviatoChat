export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer'

  const variants = {
    primary: 'bg-brand-orange text-white hover:bg-orange-600 active:scale-95',
    secondary: 'bg-brand-teal text-white hover:bg-cyan-600 active:scale-95',
    ghost: 'bg-transparent text-brand-sky border border-brand-teal hover:bg-brand-teal/20 active:scale-95',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-95',
    amber: 'bg-brand-amber text-brand-navy hover:bg-yellow-400 active:scale-95',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3 text-lg',
  }

  return (
    <button className={`${base} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  )
}
