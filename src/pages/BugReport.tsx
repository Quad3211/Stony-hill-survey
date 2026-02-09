import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Textarea } from "../components/ui/Textarea";
import SuccessModal from "../components/SuccessModal";
import toast from "react-hot-toast";

const schema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  priority: z.enum(["Low", "Medium", "High"]),
});

type FormData = z.infer<typeof schema>;

const BugReport = () => {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      priority: "Medium",
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await addDoc(collection(db, "submissions"), {
        ...data,
        type: "Bug Report",
        read: false,
        timestamp: serverTimestamp(),
      });
      setSubmitted(true);
      toast.success("Bug report submitted successfully!");
    } catch (error) {
      console.error("Error submitting bug report:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      toast.error(`Failed to submit bug report: ${errorMessage}`);
    }
  };

  if (submitted) {
    return (
      <SuccessModal
        title="Report Submitted"
        message="Thank you for helping us improve. We will review your report shortly."
      />
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Report a Bug
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Encountered an issue? Please let us know so we can fix it.
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-red-600 px-6 py-4">
            <h3 className="text-lg font-medium text-white">Bug Details</h3>
          </div>

          <div className="p-8">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Issue Title"
                placeholder="Brief summary of the problem"
                error={errors.title?.message}
                {...register("title")}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <div className="mt-1">
                  <Textarea
                    {...register("description")}
                    placeholder="Describe what happened, steps to reproduce, etc."
                    rows={6}
                    className="resize-none"
                  />
                </div>
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  {...register("priority")}
                  className="block w-full h-10 rounded-md border-gray-300 bg-white shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm px-3 border"
                >
                  <option value="Low">Low - Minor issue</option>
                  <option value="Medium">Medium - Standard issue</option>
                  <option value="High">High - Critical failure</option>
                </select>
                {errors.priority && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.priority.message}
                  </p>
                )}
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  size="lg"
                  className="w-full bg-red-600 hover:bg-red-700"
                >
                  {isSubmitting ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BugReport;
