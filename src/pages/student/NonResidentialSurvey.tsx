import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";

const schema = z.object({
  classroomEnvironment: z
    .string()
    .min(1, "Classroom environment feedback is required"),
  teachingQuality: z.string().min(1, "Teaching quality rating is required"),
  facilities: z.string().min(1, "Facilities rating is required"),
  review: z.string().min(10, "Review must be at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

const NonResidentialSurvey = () => {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    try {
      await addDoc(collection(db, "submissions"), {
        ...data,
        type: "Non-Residential",
        read: false,
        timestamp: serverTimestamp(),
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Error submitting survey:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      alert(`Failed to submit survey. Error: ${errorMessage}`);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] bg-gray-50 p-4">
        <div className="bg-white p-12 rounded-2xl shadow-xl max-w-lg w-full text-center border top-0 border-gray-100">
          <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100 mb-8">
            <svg
              className="h-10 w-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
            Thank You!
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            Your feedback has been submitted successfully. We appreciate your
            input in making our campus better.
          </p>
          <Button onClick={() => (window.location.href = "/")} size="lg">
            Return to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Non-Residential Student Survey
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Tell us about your learning environment. Your feedback helps improve
            academic facilities for everyone.
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-emerald-600 px-6 py-4">
            <h3 className="text-lg font-medium text-white">Survey Form</h3>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <Input
                label="Classroom Environment"
                placeholder="e.g., Room 304 - AC not working..."
                error={errors.classroomEnvironment?.message}
                {...register("classroomEnvironment")}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teaching Quality (1-5)
                  </label>
                  <select
                    {...register("teachingQuality")}
                    className="block w-full h-10 rounded-md border-gray-300 bg-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 border"
                  >
                    <option value="">Select a rating</option>
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Average</option>
                    <option value="4">4 - Good</option>
                    <option value="5">5 - Excellent</option>
                  </select>
                  {errors.teachingQuality && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.teachingQuality.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facilities (1-5)
                  </label>
                  <select
                    {...register("facilities")}
                    className="block w-full h-10 rounded-md border-gray-300 bg-white shadow-sm focus:border-emerald-500 focus:ring-emerald-500 sm:text-sm px-3 border"
                  >
                    <option value="">Select a rating</option>
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Average</option>
                    <option value="4">4 - Good</option>
                    <option value="5">5 - Excellent</option>
                  </select>
                  {errors.facilities && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.facilities.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Detailed Review
                </label>
                <div className="mt-1">
                  <Textarea
                    {...register("review")}
                    placeholder="Provide more details about your experience. What is working well? What needs improvement?"
                    rows={6}
                    className="resize-none"
                  />
                </div>
                {errors.review && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.review.message}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-500">
                  Your feedback is confidential and will be used to improve
                  student services.
                </p>
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full bg-emerald-600 hover:bg-emerald-700"
                >
                  {isSubmitting ? "Submitting..." : "Submit Feedback"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NonResidentialSurvey;
