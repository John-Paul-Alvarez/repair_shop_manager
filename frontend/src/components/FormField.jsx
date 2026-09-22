import { useState } from "react";
function FormField({
  name,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  hint,
  maxLength,
  placeholder,
  required = true,
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="form-field">
      <label htmlFor={name}>{label}</label>
      <div className="field-input-wrap">
        <input
          id={name}
          name={name}
          type={type === "password" && show ? "text" : type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          maxLength={maxLength}
          placeholder={placeholder}
          required={required}
          aria-invalid={!!error}
          aria-describedby={
            error ? name + "-error" : hint ? name + "-hint" : undefined
          }
        />
        {type === "password" && (
          <button
            type="button"
            className="password-toggle"
            aria-label={show ? "Hide password" : "Show password"}
            aria-pressed={show}
            onClick={() => setShow(!show)}
          >
            {show ? "Hide" : "Show"}
          </button>
        )}
      </div>
      {error ? (
        <p className="field-error" id={name + "-error"}>
          {error}
        </p>
      ) : (
        hint && (
          <p className="field-hint" id={name + "-hint"}>
            {hint}
          </p>
        )
      )}
    </div>
  );
}
export { FormField as default };
