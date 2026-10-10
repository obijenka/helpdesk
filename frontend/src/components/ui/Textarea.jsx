export default function Textarea({ label, error, required, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <textarea
        className={`w-full px-3 py-2 text-sm bg-white border rounded-lg resize-none
          text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent
          ${error ? 'border-red-300' : 'border-gray-300'}`}
        {...props}
      />
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}