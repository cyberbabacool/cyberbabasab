interface ToggleProps {
  value: boolean
  onChange: (v: boolean) => void
  disabled?: boolean
}

export function Toggle({ value, onChange, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      style={{ backgroundColor: value ? 'var(--accent)' : '#334155' }}
      className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors duration-200 ease-in-out focus:outline-none disabled:opacity-50"
    >
      <span
        style={{
          transform: value ? 'translateX(20px)' : 'translateX(2px)',
          position: 'absolute',
          top: '2px',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: 'white',
          transition: 'transform 200ms ease-in-out',
          boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
        }}
      />
    </button>
  )
}
