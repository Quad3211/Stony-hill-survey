import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { assessContent } from "../../lib/profanityFilter";
import { Button } from "../../components/ui/Button";
import { Textarea } from "../../components/ui/Textarea";
import SuccessModal from "../../components/SuccessModal";
import toast from "react-hot-toast";
import { processSubmission } from "../../lib/alertEngine";

const schema = z.object({
  dormBlock: z.enum(["Block A", "Block B", "Block C", "Block D", "Other"]),
  roomNumber: z.string().max(20).optional(),
  satisfactionRating: z.enum(["1", "2", "3", "4", "5"]),
  complaints: z.string().max(1000).optional(),
  suggestions: z.string().max(1000).optional(),
  isAnonymous: z.boolean(),
});

type DormFormValues = z.infer<typeof schema>;

const DormLifeSurvey = () => {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<DormFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      isAnonymous: true,
      dormBlock: undefined,
    },
  });

  const onSubmit: SubmitHandler<DormFormValues> = async (data) => {
    try {
      // 1. Sanitize Data Locally
      const textFields: (keyof DormFormValues)[] = [
        "complaints",
        "suggestions",
      ];
      let blockSubmission = false;
      const processedData = { ...data };

      for (const field of textFields) {
        const content = data[field];
        if (typeof content === "string" && content.length > 0) {
          const assessment = assessContent(content);
          if (assessment.action === "hard_filter") {
            blockSubmission = true;
          } else if (assessment.action === "soft_filter") {
            (processedData as any)[field] = assessment.sanitizedText;
          }
        }
      }

      if (blockSubmission) {
        toast.error("Submission rejected due to inappropriate language.");
        return;
      }

      // 2. Delegate to Alert Engine
      await processSubmission(processedData, "Dorm Life");

      setSubmitted(true);
      toast.success("Feedback submitted successfully!");
    } catch (error) {
      console.error("Error submitting survey:", error);
      toast.error("Failed to submit survey.");
    }
  };

  if (submitted) {
    return (
      <SuccessModal message="Thank you for your feedback on dorm life. We are committed to improving your living experience." />
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Dorm Life Survey
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Share your complaints, suggestions, and experiences regarding dorm
            life.
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-indigo-600 px-6 py-4">
            <h3 className="text-lg font-medium text-white">
              Dorm Feedback Form
            </h3>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 sm:p-10 space-y-8"
          >
            {/* Dorm Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dorm Block
                </label>
                <select
                  {...register("dormBlock")}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="">Select Block</option>
                  {["Block A", "Block B", "Block C", "Block D", "Other"].map(
                    (block) => (
                      <option key={block} value={block}>
                        {block}
                      </option>
                    ),
                  )}
                </select>
                {errors.dormBlock && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.dormBlock.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Room Number (Optional)
                </label>
                <input
                  type="text"
                  {...register("roomNumber")}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                  placeholder="e.g. 101"
                />
              </div>
            </div>

            {/* Satisfaction */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Satisfaction with Dorm Life (1-5)
              </label>
              <div className="flex gap-4 flex-wrap">
                {["1", "2", "3", "4", "5"].map((val) => (
                  <label
                    key={val}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="radio"
                      value={val}
                      {...register("satisfactionRating")}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                    />
                    <span className="text-gray-700">{val}</span>
                  </label>
                ))}
              </div>
              {errors.satisfactionRating && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.satisfactionRating.message}
                </p>
              )}
            </div>

            {/* Complaints */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Complaints / Issues
              </label>
              <Textarea
                {...register("complaints")}
                rows={4}
                placeholder="Describe any issues you are facing..."
              />
              {errors.complaints && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.complaints.message}
                </p>
              )}
            </div>

            {/* Suggestions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Suggestions for Improvement
              </label>
              <Textarea
                {...register("suggestions")}
                rows={4}
                placeholder="How can we make dorm life better?"
              />
              {errors.suggestions && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.suggestions.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-6 border-t border-gray-200">
              <label className="flex items-center gap-2 mb-6">
                <input
                  type="checkbox"
                  {...register("isAnonymous")}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <span className="text-sm font-medium text-gray-700">
                  Submit Anonymously
                </span>
              </label>

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
  );
};

export default DormLifeSurvey;
