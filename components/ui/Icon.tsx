/**
 * A dozen hand-picked glyphs, drawn on a 24-grid with a 1.6 stroke so they sit
 * at the same weight as the body type. Deliberately not an icon library — the
 * set is small enough that a dependency would cost more than it saves.
 */
type Props = React.SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...rest }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const Icon = {
  Chat: (p: Props) => (
    <Svg {...p}>
      <path d="M20 14.5a2.5 2.5 0 0 1-2.5 2.5H9l-4 3.5V6.5A2.5 2.5 0 0 1 7.5 4h10A2.5 2.5 0 0 1 20 6.5Z" />
      <path d="M9 9h7M9 12.5h4.5" />
    </Svg>
  ),
  Book: (p: Props) => (
    <Svg {...p}>
      <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H18a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 0 4 20.5Z" />
      <path d="M4 20.5A2.5 2.5 0 0 1 6.5 18H19" />
      <path d="M8 7.5h6" />
    </Svg>
  ),
  Graph: (p: Props) => (
    <Svg {...p}>
      <circle cx="6" cy="17" r="2.6" />
      <circle cx="17.5" cy="16" r="2.3" />
      <circle cx="12" cy="6.5" r="2.8" />
      <path d="M8.1 15.3 10.6 9M14.3 8.4l2.3 5.4M8.6 17.2h6.3" />
    </Svg>
  ),
  Calendar: (p: Props) => (
    <Svg {...p}>
      <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3.5v3M16 3.5v3" />
      <path d="M8 14h2.5" />
    </Svg>
  ),
  Send: (p: Props) => (
    <Svg {...p}>
      <path d="M4.5 12 20 4.5 15.5 20l-3.7-5.6L4.5 12Z" />
      <path d="m11.8 14.4 3.7-6.6" />
    </Svg>
  ),
  Camera: (p: Props) => (
    <Svg {...p}>
      <path d="M3.5 8.5A2 2 0 0 1 5.5 6.5h1.8l1.2-2h6.9l1.2 2h1.9a2 2 0 0 1 2 2v8.5a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z" />
      <circle cx="12" cy="12.8" r="3.3" />
    </Svg>
  ),
  Sparkle: (p: Props) => (
    <Svg {...p}>
      <path d="M12 3.5c.8 4.4 2.6 6.2 7 7-4.4.8-6.2 2.6-7 7-.8-4.4-2.6-6.2-7-7 4.4-.8 6.2-2.6 7-7Z" />
    </Svg>
  ),
  Close: (p: Props) => (
    <Svg {...p}>
      <path d="m6.5 6.5 11 11M17.5 6.5l-11 11" />
    </Svg>
  ),
  Chevron: (p: Props) => (
    <Svg {...p}>
      <path d="m9 5.5 6.5 6.5L9 18.5" />
    </Svg>
  ),
  Reset: (p: Props) => (
    <Svg {...p}>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20 4v4h-4" />
    </Svg>
  ),
  Check: (p: Props) => (
    <Svg {...p}>
      <path d="m5 12.5 4.5 4.5L19 6.5" />
    </Svg>
  ),
};
