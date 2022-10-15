export function PlaygroundGrid() {
 return (
    <div className="w-full">
      <div className="mx-auto max-w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8 gap-4">
        {Array.from({ length: 64 }, (_, index) => (
          <div key={index} className="flex items-center justify-center p-6 border border-gray-200 dark:border-gray-800">
            {index + 1}
          </div>
        ))}
      </div>
    </div>
 );
}
