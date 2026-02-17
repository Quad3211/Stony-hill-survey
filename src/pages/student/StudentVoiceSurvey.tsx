import { useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { assessContent } from "../../lib/profanityFilter";
import { Button } from "../../components/ui/Button";
import { Textarea } from "../../components/ui/Textarea";
import SuccessModal from "../../components/SuccessModal";
import toast from "react-hot-toast";
import { useAppConfig } from "../../hooks/useAppConfig";
import { Loader2 } from "lucide-react";

import { processSubmission } from "../../lib/alertEngine";

// --- VALIDATION SCHEMA ---
const schema = z.object({
  // General School Experience
  generalExperienceRating: z.enum(["1", "2", "3", "4", "5"]),
  impactAreas: z.array(z.string()).min(1, "Select at least one area"),

  // Learning Environment & Support
  learningSupportRating: z.enum(["1", "2", "3", "4", "5"]),
  learningImprovements: z
    .string()
    .max(500, "Limit to 500 characters")
    .optional(),

  // School Operations & Facilities
  operationalImprovements: z.array(z.string()).optional(),
  oneOperationalChange: z
    .string()
    .max(500, "Limit to 500 characters")
    .optional(),

  // Student Well-being & School Culture
  safetyRating: z.enum(["1", "2", "3", "4", "5"]),
  cultureImprovements: z
    .string()
    .max(500, "Limit to 500 characters")
    .optional(),

  // Communication & Engagement
  communicationRating: z.enum(["1", "2", "3", "4", "5"]),
  communicationSuggestions: z
    .string()
    .max(400, "Limit to 400 characters")
    .optional(),

  // Open Feedback
  openFeedback: z.string().max(700, "Limit to 700 characters").optional(),

  // Meta
  isAnonymous: z.boolean(),
});

type SurveyFormValues = z.infer<typeof schema>;

const StudentVoiceSurvey = () => {
  const [submitted, setSubmitted] = useState(false);
  const { config, loading: configLoading } = useAppConfig();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SurveyFormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      isAnonymous: true,
      impactAreas: [],
      operationalImprovements: [],
    },
  });

  const impactAreas = watch("impactAreas");
  const operationalImprovements = watch("operationalImprovements");

  const handleCheckboxChange = (
    field: "impactAreas" | "operationalImprovements",
    value: string,
  ) => {
    const currentValues =
      field === "impactAreas" ? impactAreas : operationalImprovements;
    const newValues = currentValues?.includes(value)
      ? currentValues.filter((v) => v !== value)
      : [...(currentValues || []), value];
    setValue(field, newValues as string[]);
  };

  const onSubmit: SubmitHandler<SurveyFormValues> = async (data) => {
    try {
      // 1. Sanitize & Prepare Data
      // We still run local sanitization for immediate feedback/blocking
      const textFields: (keyof SurveyFormValues)[] = [
        "learningImprovements",
        "oneOperationalChange",
        "cultureImprovements",
        "communicationSuggestions",
        "openFeedback",
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
        toast.error("Submission rejected due to inappropriate content.");
        return;
      }

      // 2. Delegate to Alert Engine
      // Imported dynamically or top-level. I need to add the import.
      await processSubmission(processedData, "Student Voice");

      setSubmitted(true);
      toast.success("Survey submitted successfully!");
    } catch (error) {
      console.error("Error submitting survey:", error);
      toast.error("Failed to submit survey.");
    }
  };

  if (submitted) {
    return (
      <SuccessModal message="Thank you. Your feedback has been securely submitted and will be reviewed responsibly." />
    );
  }

  if (configLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Student Voice & Feedback
          </h1>
          <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
            This survey is designed to help improve the overall school
            experience. Your honest and constructive feedback will help guide
            positive changes. All responses are confidential.
          </p>
        </div>

        <div className="bg-white shadow-xl rounded-2xl overflow-hidden">
          <div className="bg-indigo-600 px-6 py-4">
            <h3 className="text-lg font-medium text-white">Survey Form</h3>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="p-6 sm:p-10 space-y-10"
          >
            {/* Section 1: General School Experience */}
            <section>
              <h4 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                1. General School Experience
              </h4>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How would you rate your overall school experience so far?
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
                          {...register("generalExperienceRating")}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-gray-700">{val}</span>
                      </label>
                    ))}
                  </div>
                  {errors.generalExperienceRating && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.generalExperienceRating.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Which areas do you believe impact your school experience the
                    most?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {config.impactAreas.map((area) => (
                      <label key={area} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={impactAreas?.includes(area)}
                          onChange={() =>
                            handleCheckboxChange("impactAreas", area)
                          }
                          className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-600">{area}</span>
                      </label>
                    ))}
                  </div>
                  {errors.impactAreas && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.impactAreas.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Section 2: Learning Environment */}
            <section>
              <h4 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                2. Learning Environment
              </h4>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How supported do you feel in your learning process? (1-5)
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
                          {...register("learningSupportRating")}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-gray-700">{val}</span>
                      </label>
                    ))}
                  </div>
                  {errors.learningSupportRating && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.learningSupportRating.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What changes or improvements would help enhance the learning
                    environment?
                  </label>
                  <Textarea
                    {...register("learningImprovements")}
                    rows={3}
                    placeholder="Optional..."
                  />
                  {errors.learningImprovements && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.learningImprovements.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Section 3: Operations & Facilities */}
            <section>
              <h4 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                3. School Operations & Facilities
              </h4>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Which operational areas could benefit most from improvement?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {config.operationalAreas.map((area) => (
                      <label key={area} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={operationalImprovements?.includes(area)}
                          onChange={() =>
                            handleCheckboxChange(
                              "operationalImprovements",
                              area,
                            )
                          }
                          className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-600">{area}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    If you could improve one operational aspect of the school,
                    what would it be and why?
                  </label>
                  <Textarea
                    {...register("oneOperationalChange")}
                    rows={3}
                    placeholder="Optional..."
                  />
                  {errors.oneOperationalChange && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.oneOperationalChange.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Section 4: Well-being */}
            <section>
              <h4 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                4. Student Well-being & School Culture
              </h4>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How safe and respected do you feel in our school? (1-5)
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
                          {...register("safetyRating")}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-gray-700">{val}</span>
                      </label>
                    ))}
                  </div>
                  {errors.safetyRating && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.safetyRating.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What changes could improve student well-being and school
                    culture?
                  </label>
                  <Textarea
                    {...register("cultureImprovements")}
                    rows={3}
                    placeholder="Optional..."
                  />
                  {errors.cultureImprovements && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.cultureImprovements.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Section 5: Communication */}
            <section>
              <h4 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                5. Communication & Engagement
              </h4>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How effective is school communication in keeping you
                    informed? (1-5)
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
                          {...register("communicationRating")}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                        />
                        <span className="text-gray-700">{val}</span>
                      </label>
                    ))}
                  </div>
                  {errors.communicationRating && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.communicationRating.message}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    What would make communication and announcements more
                    effective?
                  </label>
                  <Textarea
                    {...register("communicationSuggestions")}
                    rows={3}
                    placeholder="Optional..."
                  />
                  {errors.communicationSuggestions && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.communicationSuggestions.message}
                    </p>
                  )}
                </div>
              </div>
            </section>

            {/* Section 6: Open Feedback */}
            <section>
              <h4 className="text-xl font-semibold text-gray-900 mb-4 border-b pb-2">
                6. Open Feedback
              </h4>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Is there anything else you would like the administration to be
                  aware of?
                </label>
                <Textarea
                  {...register("openFeedback")}
                  rows={5}
                  placeholder="Concerns, Suggestions, Complaints..."
                />
                {errors.openFeedback && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.openFeedback.message}
                  </p>
                )}
              </div>
            </section>

            {/* Submission Controls */}
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

export default StudentVoiceSurvey;
