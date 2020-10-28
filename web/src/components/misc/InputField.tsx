import { ErrorMessage, useField } from 'formik';
import React, { InputHTMLAttributes, TextareaHTMLAttributes } from 'react';
import TextareaAutosize from 'react-autosize-textarea';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> &
  TextareaHTMLAttributes<HTMLTextAreaElement> & {
    name: string;
    label?: string;
    as?: 'input' | 'textarea';
    addClassName?: string;
  };

const InputField: React.FC<InputFieldProps> = ({
  label,
  as = 'input',
  addClassName,
  ...props
}) => {
  const [field, meta] = useField(props);
  return (
    <div className={addClassName}>
      <label className="block font-medium" htmlFor={field.name}>
        {label}
      </label>
      {as === 'input' ? (
        <input
          {...props}
          {...field}
          className={`${
            meta.touched && meta.error
              ? 'border-red-300 shadow-outline-red'
              : ''
          } form-input mt-2 w-full text-lg sm:text-base`}
          aria-invalid={!!meta.error}
        />
      ) : (
        <TextareaAutosize
          {...props}
          {...field}
          className={`${
            meta.touched && meta.error
              ? 'border-red-300 shadow-outline-red'
              : ''
          } form-textarea mt-2 w-full text-lg sm:text-base`}
          aria-invalid={!!meta.error}
        />
      )}
      <ErrorMessage
        component="div"
        name={field.name}
        className="block mt-2 text-base text-red-600 sm:text-sm"
        aria-live="polite"
      />
    </div>
  );
};

export default InputField;
