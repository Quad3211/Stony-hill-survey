import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Textarea } from "../../components/ui/Textarea";
import SuccessModal from "../../components/SuccessModal";
import toast from "react-hot-toast";

const schema = z.object({
  dormCondition: z.string().min(1, "Dorm condition is required"),
  cleanliness: z.string().min(1, "Cleanliness rating is required"),
  foodQuality: z.string().min(1, "Food quality rating is required"),
  review: z.string().min(10, "Review must be at least 10 characters"),
});

type FormData = z.infer<typeof schema>;

const ResidentialSurvey = () => {
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
        type: "Residential",
        read: false,
        timestamp: serverTimestamp(),
      });
      setSubmitted(true);
      toast.success("Survey submitted successfully!");
    } catch (error) {
      console.error("Error submitting survey:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to submit survey: ${errorMessage}`);
    }
  };

  if (submitted) {
    return <SuccessModal />;
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Residential Experience Survey
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Tell us about your life on campus. Your honest feedback helps
            improve living conditions for everyone.
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-indigo-600 px-6 py-4">
            <h3 className="text-lg font-medium text-white">Survey Form</h3>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              <Input
                label="Dorm Condition"
                placeholder="e.g., Room 101, Block A - Faucet leaking..."
                error={errors.dormCondition?.message}
                {...register("dormCondition")}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cleanliness (1-5)
                  </label>
                  <select
                    {...register("cleanliness")}
                    className="block w-full h-10 rounded-md border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 border"
                  >
                    <option value="">Select a rating</option>
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Average</option>
                    <option value="4">4 - Good</option>
                    <option value="5">5 - Excellent</option>
                  </select>
                  {errors.cleanliness && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.cleanliness.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Food Quality (1-5)
                  </label>
                  <select
                    {...register("foodQuality")}
                    className="block w-full h-10 rounded-md border-gray-300 bg-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 border"
                  >
                    <option value="">Select a rating</option>
                    <option value="1">1 - Poor</option>
                    <option value="2">2 - Fair</option>
                    <option value="3">3 - Average</option>
                    <option value="4">4 - Good</option>
                    <option value="5">5 - Excellent</option>
                  </select>
                  {errors.foodQuality && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.foodQuality.message}
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
                  className="w-full"
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

export default ResidentialSurvey;
