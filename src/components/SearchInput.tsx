interface SearchInputProps {
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

export function SearchInput({ value, placeholder, onChange }: SearchInputProps) {
  return (
    <input
      type="search"
      className="input toolbar__search"
      value={value}
      placeholder={placeholder}
      aria-label={placeholder}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}
