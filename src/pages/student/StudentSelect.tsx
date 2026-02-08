import { Link } from "react-router-dom";
import { User, Home as HomeIcon, ChevronRight } from "lucide-react";

const StudentSelect = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Select Your Student Status
          </h2>
          <p className="mt-4 text-xl text-gray-600">
            Please choose the option that best describes your residency to
            proceed with the survey.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Link
            to="/student/residential"
            className="group relative flex flex-col items-center bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 hover:border-indigo-500 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <HomeIcon className="h-10 w-10 text-indigo-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Residential Student
            </h3>
            <p className="text-center text-gray-500 mb-8">
              Living on campus? Share your feedback about dorm life, food, and
              facilities.
            </p>
            <div className="mt-auto flex items-center text-indigo-600 font-medium group-hover:translate-x-1 transition-transform">
              Continue <ChevronRight className="ml-1 h-5 w-5" />
            </div>
          </Link>

          <Link
            to="/student/non-residential"
            className="group relative flex flex-col items-center bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl border border-gray-200 hover:border-indigo-500 transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <User className="h-10 w-10 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Non-Residential Student
            </h3>
            <p className="text-center text-gray-500 mb-8">
              Commuting to campus? Rate your classroom environment, teaching,
              and general facilities.
            </p>
            <div className="mt-auto flex items-center text-emerald-600 font-medium group-hover:translate-x-1 transition-transform">
              Continue <ChevronRight className="ml-1 h-5 w-5" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default StudentSelect;
