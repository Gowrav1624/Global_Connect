function Loading({ message = "Loading..." }) {
  return (
    <div className="min-h-[200px] flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">

        <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />

        <p className="text-sm text-gray-500">
          {message}
        </p>

      </div>
    </div>
  );
}

export default Loading;