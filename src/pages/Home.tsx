import { Link } from "react-router-dom";

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full space-y-8 text-center">
        <div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Welcome to Stony Hill Academy
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Student Feedback & Reporting System
          </p>
        </div>
        <div className="mt-8 space-y-4">
          <Link
            to="/student/select"
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            I am a Student
          </Link>
          <Link
            to="/admin/login"
            className="group relative w-full flex justify-center py-3 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            I am an Administrator
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
