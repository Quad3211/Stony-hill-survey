import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Home, AlertTriangle } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col items-center justify-center p-4 bg-gray-50 text-center">
      <div className="bg-white p-8 rounded-2xl shadow-lg border border-gray-200 max-w-md w-full">
        <div className="h-20 w-20 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="h-10 w-10 text-amber-500" />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">404</h1>
        <h2 className="text-xl font-bold text-gray-800 mb-4">Page Not Found</h2>
        <p className="text-gray-600 mb-8">
          The page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/">
          <Button className="flex items-center gap-2 mx-auto">
            <Home className="w-4 h-4" />
            Go Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
