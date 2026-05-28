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
      style={{
        display: 'flex',
        alignItems: 'center',
        width: '44px',
        height: '24px',
        borderRadius: '12px',
        padding: '2px',
        backgroundColor: value ? 'var(--accent)' : '#475569',
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'background-color 200ms',
        boxSizing: 'border-box',
        flexShrink: 0,
        outline: 'none',
      }}
    >
      <span
        style={{
          display: 'block',
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          backgroundColor: 'white',
          boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
          transition: 'transform 200ms ease-in-out',
          transform: value ? 'translateX(20px)' : 'translateX(0px)',
          flexShrink: 0,
        }}
      />
    </button>
  )
}
