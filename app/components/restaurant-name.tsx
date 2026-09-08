// Plain text identifiers, not restaurant artwork. See docs/LOGO_RIGHTS.md.
const initials: Record<string, string> = {
  'Panda Express': 'PE',
  Chipotle: 'C',
  'Chick-fil-A': 'CFA',
};

export function RestaurantName({ name }: { name: string }) {
  return (
    <span className="restaurant-name">
      <span className="restaurant-initials" aria-hidden="true">
        {initials[name] ?? name.trim().charAt(0).toUpperCase()}
      </span>
      <span>{name}</span>
    </span>
  );
}
