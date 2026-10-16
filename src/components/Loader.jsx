export default function Loader({ className = '' }) {
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div
        className="h-6 w-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"
        role="status"
        aria-label="Loading"
      />
    </div>
  );
}
