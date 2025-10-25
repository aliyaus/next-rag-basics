export default function Spinner({
    size = 20,
    stroke = 3,
    color = "currentColor",
    className = "",
    label = "Loading",
}) {
    const half = size / 2;
    const r = (size - stroke) / 2; // radius
    const dash = Math.PI * r * 0.75; // visible arc
    const gap = Math.PI * r * 0.25;  // gap arc

    return (
        <span
            role="status"
            aria-label={label}
            className={`inline-flex items-center justify-center ${className}`}
            style={{ width: size, height: size }}
        >
            <svg
                width={size}
                height={size}
                viewBox={`0 0 ${size} ${size}`}
                className="spinner-rotate"
            >
                <circle
                    cx={half}
                    cy={half}
                    r={r}
                    fill="none"
                    stroke={color}
                    strokeWidth={stroke}
                    strokeLinecap="round"
                    strokeDasharray={`${dash} ${gap}`}
                />
            </svg>
            <style jsx>{`
        .spinner-rotate {
          animation: spin 0.9s linear infinite;
          display: block;
        }
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
        </span>
    );
}