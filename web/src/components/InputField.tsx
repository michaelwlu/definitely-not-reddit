import { ErrorMessage, Field, useField } from 'formik';
import React, { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    name: string;
    label: string;
    as?: 'input' | 'textarea';
    addClassName?: string;
  };

const InputField: React.FC<InputFieldProps> = ({
  label,
  as,
  addClassName,
  ...props
}) => {
  const [field, meta] = useField(props);
  return (
    <div className={addClassName}>
      <label className="block font-medium" htmlFor={field.name}>
        {label}
      </label>
      <Field
        as={as}
        {...props}
        className={`form-${as ? as : 'input'} mt-2 w-full ${
          meta.touched && meta.error ? 'border-red-300 shadow-outline-red' : ''
        } `}
        aria-invalid={!!meta.error}
      />
      <ErrorMessage
        component="div"
        name={field.name}
        className="block mt-2 text-sm text-red-600"
        aria-live="polite"
      />
    </div>
  );
};

export default InputField;
