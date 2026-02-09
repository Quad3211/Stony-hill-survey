import { Loader2 } from "lucide-react";

const LoadingSpinner = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] w-full">
      <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      <p className="mt-4 text-sm text-gray-500 font-medium animate-pulse">
        Loading resources...
      </p>
    </div>
  );
};

export default LoadingSpinner;
