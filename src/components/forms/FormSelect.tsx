import { forwardRef } from "react";

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  required?: boolean;
  options: { value: string; label: string }[];
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(
  ({ label, error, required, options, ...props }, ref) => {
    return (
      <div className="space-y-2">
        <label className="block text-sm font-mono uppercase tracking-wide text-white/90">
          {label}
          {required && <span className="text-monad-primary ml-1">*</span>}
        </label>
        <div className="relative">
          <select
            ref={ref}
            {...props}
            className={`
              w-full min-h-12 px-4 py-3 pr-12 rounded-lg
              bg-white/5 border
              ${error ? "border-red-500" : "border-white/10"}
              text-base text-white
              focus:outline-none focus:border-monad-primary
              transition-colors
              appearance-none
              cursor-pointer
            `}
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <svg
            viewBox="0 0 20 20"
            aria-hidden="true"
            className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70"
          >
            <path
              fill="currentColor"
              d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.58l3.3-3.3a1 1 0 1 1 1.4 1.42l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.42Z"
            />
          </svg>
        </div>
        {error && <p className="text-red-500 text-sm animate-shake">{error}</p>}
      </div>
    );
  }
);

FormSelect.displayName = "FormSelect";
