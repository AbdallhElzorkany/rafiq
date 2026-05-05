import { Loader2, UploadCloud, Check, X } from "lucide-react";
import { useState } from "react";
import { Formik, Form, type FormikHelpers } from "formik";
import * as Yup from "yup";
import axios from "axios";

const validationSchema = Yup.object().shape({
  video: Yup.mixed().required("Video file is required"),
});
export default function SessionAttempt({
  sessionId,
  patientId,
}: {
  sessionId: string | undefined;
  patientId: string | undefined;
}) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const initialValues = {
    video: null as File | null,
    patientId: patientId || "",
    sessionId: sessionId || "",
  };
  const handleSubmit = async (
    values: typeof initialValues,
    formikHelpers: FormikHelpers<typeof initialValues>,
  ) => {
    const formData = new FormData();
    formData.append("SessionId", values.sessionId);
    formData.append("Video", values.video as File);
    formData.append("PatientId", values.patientId);
    try {
      const req = await axios.post(
        "https://rafiq-container-server.wittyhill-43579268.germanywestcentral.azurecontainerapps.io/api/PatientAttempts/submit",
        formData,
      );
      const res = req.data;
      if (res.success !== true) {
        throw new Error("Failed to upload session");
      }
      formikHelpers.setStatus({
        message: "Attempt uploaded successfully",
        type: "success",
      });
    } catch (error) {
      if (error) {
        formikHelpers.setStatus({
          message: "Failed to upload Attempt",
          type: "error",
        });
      }
    } finally {
      formikHelpers.setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-md border border-gray-100 p-6 sm:p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-2">
        Upload Child&apos;s Attempt
      </h2>
      <p className="text-gray-600 text-sm sm:text-base mb-6">
        Securely upload the video of your child doing the exercises.
      </p>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={handleSubmit}
      >
        {({ setFieldValue, isSubmitting, status }) => (
          <Form>
            {status && (
              <div
                className={`text-center p-4 mb-5 ${
                  status.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-600"
                    : "bg-red-50 border border-red-200 text-red-600"
                } rounded-2xl text-sm font-medium`}
              >
                {status.type === "success" ? (
                  <Check className="inline-block mr-1" />
                ) : (
                  <X className="inline-block mr-1" />
                )}{" "}
                {status.message}
              </div>
            )}

            <label
              htmlFor="video"
              className="group flex flex-col items-center justify-center gap-3 border-2 border-green-100 rounded-3xl px-4 py-10 text-center cursor-pointer hover:border-primary/70 hover:bg-primary/5 transition-colors duration-300 bg-green-50/60"
            >
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-1 shadow-md">
                <UploadCloud className="size-7 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm sm:text-base font-semibold text-primary">
                  Upload your video
                </p>
                <p className="text-xs sm:text-sm text-green-500">
                  MP4, MOV up to 50MB
                </p>
              </div>
              <div className="inline-flex items-center gap-2 mt-2 px-5 py-2.5 rounded-full bg-green-900 text-white text-xs sm:text-sm font-semibold group-hover:bg-primary transition-colors duration-300 shadow-md">
                <UploadCloud className="size-4" />
                <span>Browse files</span>
              </div>
              <input
                id="video"
                type="file"
                name="video"
                accept="video/mp4,video/quicktime"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  setFieldValue("video", file);
                  setSelectedFile(file || null);
                }}
              />
            </label>
            {selectedFile && (
              <div className="mt-4 rounded-2xl bg-green-50 border border-green-100 p-4 text-left space-y-1">
                <p className="text-xs font-semibold text-green-500 uppercase tracking-wide">
                  Selected file
                </p>
                <p className="text-sm font-medium text-green-900 break-all">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-green-500">
                  {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedFile || isSubmitting}
              className="mt-6 w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-white font-semibold py-3.5 text-sm sm:text-base disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-primary/90 transition-all shadow-md cursor-pointer disabled:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-5 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <UploadCloud className="size-5" />
                  Upload
                </>
              )}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
}
