import React from 'react';

const FormGroup = ({ children, className = '', ...props }) => {
    return (
        <div className={`mb-4 ${className}`} {...props}>
            {children}
        </div>
    );
};

const FormLabel = ({ children, htmlFor, className = '', required = false, ...props }) => {
    return (
        <label
            htmlFor={htmlFor}
            className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}
            {...props}
        >
            {children}
            {required && <span className="text-red-500 ml-1">*</span>}
        </label>
    );
};

const FormControl = ({
    type = 'text',
    id,
    name,
    value,
    onChange,
    placeholder,
    className = '',
    required = false,
    disabled = false,
    ...props
}) => {
    const baseClasses = 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500';

    return (
        <input
            type={type}
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
            className={`${baseClasses} ${className}`}
            {...props}
        />
    );
};

const FormSelect = ({
    id,
    name,
    value,
    onChange,
    children,
    className = '',
    required = false,
    disabled = false,
    ...props
}) => {
    const baseClasses = 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500';

    return (
        <select
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            required={required}
            disabled={disabled}
            className={`${baseClasses} ${className}`}
            {...props}
        >
            {children}
        </select>
    );
};

const FormTextarea = ({
    id,
    name,
    value,
    onChange,
    placeholder,
    rows = 3,
    className = '',
    required = false,
    disabled = false,
    ...props
}) => {
    const baseClasses = 'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500';

    return (
        <textarea
            id={id}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            rows={rows}
            required={required}
            disabled={disabled}
            className={`${baseClasses} ${className}`}
            {...props}
        />
    );
};

const FormHelp = ({ children, className = '', ...props }) => {
    return (
        <p className={`mt-1 text-sm text-gray-500 ${className}`} {...props}>
            {children}
        </p>
    );
};

const FormError = ({ children, className = '', ...props }) => {
    return (
        <p className={`mt-1 text-sm text-red-600 ${className}`} {...props}>
            {children}
        </p>
    );
};

// Compound component pattern
const Form = {
    Group: FormGroup,
    Label: FormLabel,
    Control: FormControl,
    Select: FormSelect,
    Textarea: FormTextarea,
    Help: FormHelp,
    Error: FormError,
};

export default Form;
