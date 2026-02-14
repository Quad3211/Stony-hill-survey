import { Link } from "react-router-dom";
import { CheckCircle } from "lucide-react";
import heroBg from "../assets/hero-bg.png"; // Import the image

const Home = () => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-64px)]">
      {/* Hero Section */}
      <div className="relative bg-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            className="w-full h-full object-cover opacity-40"
            src={heroBg}
            alt="Stony Hill Academy Campus"
          />
          <div className="absolute inset-0 bg-linear-to-r from-indigo-900/90 to-purple-900/80 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:px-6 lg:py-32 lg:px-8 flex flex-col items-center text-center">
          <h1 className="text-4xl font-extrabold text-white sm:text-5xl md:text-6xl tracking-tight drop-shadow-lg">
            HEART EASTERN TVET INSTITUTE <br className="hidden md:block" />
            STONY HILL CAMPUS
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-gray-100 sm:text-xl md:mt-10 md:text-2xl font-light shadow-black/50 drop-shadow-md">
            Student Voice & Feedback System. Empowering students to shape their
            environment.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-5 w-full justify-center">
            <div className="rounded-md shadow-lg">
              <Link
                to="/student/voice"
                className="w-full flex items-center justify-center px-8 py-4 border border-transparent text-lg font-bold rounded-full text-indigo-700 bg-white hover:bg-gray-50 transition-transform transform hover:-translate-y-1 md:py-4 md:text-xl md:px-10"
              >
                Start Student Survey
              </Link>
            </div>
            <div className="rounded-md shadow-lg">
              <Link
                to="/student/dorm-life"
                className="w-full flex items-center justify-center px-8 py-4 border-2 border-white text-lg font-bold rounded-full text-white bg-transparent hover:bg-white/10 transition-transform transform hover:-translate-y-1 md:py-4 md:text-xl md:px-10"
              >
                Dorm Life Survey
              </Link>
            </div>
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
            &copy; {new Date().getFullYear()} Heart Eastern Tvet Institute Stony
            Hill Campus. All rights reserved.
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
