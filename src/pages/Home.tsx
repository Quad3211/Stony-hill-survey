import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle } from "lucide-react";
import heroBg from "../assets/hero-bg.png"; // Import the image

const Home = () => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <div className="relative bg-indigo-900 text-white">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover opacity-30"
            src={heroBg}
            alt="Stony Hill Academy Campus"
          />
          <div className="absolute inset-0 bg-indigo-900 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-32 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl mb-4 sm:mb-6">
            Welcome to Stony Hill Academy
          </h1>
          <p className="mt-4 sm:mt-6 max-w-2xl text-lg sm:text-xl text-indigo-100 mb-8 sm:mb-10">
            Empowering students to shape their environment. Your voice matters
            in building a better community for everyone.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link
              to="/student/select"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 md:py-4 md:text-lg md:px-8 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Start Student Survey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/admin/login"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 md:py-4 md:text-lg md:px-8 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </div>

      {/* Features/Info Section */}
      <div className="py-12 sm:py-16 bg-white overflow-hidden lg:py-24">
        <div className="relative max-w-xl mx-auto px-4 sm:px-6 lg:px-8 lg:max-w-7xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-base font-semibold text-indigo-600 tracking-wide uppercase">
              Why Feedback Matters
            </h2>
            <p className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
              Building a Better Campus Together
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center hover:bg-gray-100 transition-colors">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-green-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Anonymous & Secure
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Your feedback is completely anonymous. Feel free to share your
                honest thoughts without hesitation.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center hover:bg-gray-100 transition-colors">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-indigo-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Direct Impact
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Your suggestions go directly to the administration and student
                council to drive real improvements.
              </p>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 sm:p-8 text-center hover:bg-gray-100 transition-colors">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-10 w-10 sm:h-12 sm:w-12 text-blue-500" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                Better Community
              </h3>
              <p className="text-sm sm:text-base text-gray-600">
                Help us maintain high standards for dorms, food, and facilities
                for everyone's benefit.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Bug Report Link */}
      <div className="bg-gray-50 border-t border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center">
          <p className="text-gray-500 text-sm mb-4">
            &copy; {new Date().getFullYear()} Stony Hill Academy. All rights
            reserved.
          </p>
          <Link
            to="/report-bug"
            className="text-sm text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            Report a technical problem
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
