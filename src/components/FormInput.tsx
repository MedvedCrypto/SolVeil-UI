import React from "react";

interface FormInputProps {
  label: string;
  type: string;
  value: string | number;
  onChange: (value: number) => void;
  placeholder: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  type,
  value,
  onChange,
  placeholder,
}) => (
  <div className="form-group">
    <label>
      {label}:
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        placeholder={placeholder}
      />
    </label>
  </div>
);