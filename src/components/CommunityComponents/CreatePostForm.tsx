import { Formik, Form, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";
import {
  Plus,
  X,
  Send,
  Sparkles,
  Loader2,
  Tag,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../../hooks/useToast";
import type { FormValues } from "../../types/Community";

// Quick tag options for post categorization
const HASHTAGS = ["milestone", "question", "advice"];

const API_URL =
  "https://rafiq-container-server.wittyhill-43579268.germanywestcentral.azurecontainerapps.io/api/community/posts";



const validationSchema = Yup.object().shape({
  content: Yup.string()
    .required("Post content is required")
    .trim()
    .min(1, "Post cannot be empty"),
  tags: Yup.array().of(Yup.string().required()),
});

export function CreatePostForm() {
  const { user, token } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const [tagInput, setTagInput] = useState("");

  const mutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const req = await axios.post(
        API_URL,
        { content: values.content, tags: values.tags },
        { headers: { Authorization: `Bearer ${token}` } },
      );
      const res = req.data;
      if (res.success === false) {
        throw new Error("Failed to create post");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["Posts"] });
      showToast("Post created successfully", "success");
    },
  });

  const initialValues: FormValues = {
    content: "",
    tags: [],
  };

  const toggleTag = (tags: string[], tag: string): string[] => {
    return tags.includes(tag) ? tags.filter((t) => t !== tag) : [...tags, tag];
  };

  const handleSubmit = async (
    values: FormValues,
    helpers: FormikHelpers<FormValues>,
  ) => {
    try {
      await mutation.mutateAsync(values);
      helpers.resetForm();
      setTagInput("");
    } catch (error) {
      if (error) {
        const errorMessage = "Failed to create post";
        showToast(errorMessage, "error");
        helpers.setStatus(errorMessage);
      }
    } finally {
      helpers.setSubmitting(false);
    }
  };

  const maxLength = 500;

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({
        values,
        errors,
        touched,
        status,
        setFieldValue,
        setFieldTouched,
        isSubmitting,
      }) => {
        const contentLength = values.content.length;
        const contentError = touched.content && errors.content;
        return (
          <Form className="bg-white rounded-2xl p-5 shadow-lg border border-gray-100 mb-6 hover:shadow-xl transition-shadow duration-300">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-11 h-11 bg-linear-to-br from-primary to-primary-dark rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0 shadow-md">
                {user?.username?.charAt(0)?.toUpperCase() || "YO"}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">
                  {user?.username || "Guest"}
                </h3>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Create a post to share with the community
                </p>
              </div>
            </div>

            {/* API Error Alert */}
            {status && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center justify-center gap-2 text-sm text-red-600">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{status}</span>
              </div>
            )}

            {/* Content Input */}
            <div className="relative">
              <textarea
                name="content"
                placeholder="What's on your mind? Share your thoughts, ask questions, or celebrate milestones..."
                value={values.content}
                onChange={(e) => {
                  const text = e.target.value;
                  if (text.length <= maxLength) {
                    setFieldValue("content", text);
                  }
                }}
                onBlur={() => setFieldTouched("content", true)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    (e.target as HTMLTextAreaElement).form?.requestSubmit();
                  }
                }}
                className={`w-full resize-none border rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm text-gray-700 placeholder-gray-400 min-h-[100px] p-3 transition-all ${
                  contentError
                    ? "border-red-300 focus:border-red-500 focus:ring-red-200"
                    : "border-gray-200"
                }`}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {contentLength}/{maxLength}
              </div>
              {/* Field Error */}
              {contentError && (
                <div className="absolute -bottom-5 left-0 text-xs text-red-500">
                  {errors.content}
                </div>
              )}
            </div>

            {/* Tags Section */}
            <div className="mt-6 space-y-3">
              {/* Quick Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                  <Tag className="w-3 h-3" />
                  Quick tags:
                </span>
                {HASHTAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() =>
                      setFieldValue("tags", toggleTag(values.tags, tag))
                    }
                    className={`px-3 cursor-pointer py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                      values.tags.includes(tag)
                        ? "bg-primary text-white shadow-sm scale-105"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:scale-105"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Custom Tag Input */}
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-xs">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Tag className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const trimmed = tagInput.trim();
                        if (trimmed && !values.tags.includes(trimmed)) {
                          setFieldValue("tags", [...values.tags, trimmed]);
                          setTagInput("");
                        }
                      }
                    }}
                    placeholder="Add custom tag..."
                    className="w-full pl-9 pr-10 py-2 text-sm bg-gray-50 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const trimmed = tagInput.trim();
                      if (trimmed && !values.tags.includes(trimmed)) {
                        setFieldValue("tags", [...values.tags, trimmed]);
                        setTagInput("");
                      }
                    }}
                    disabled={
                      !tagInput.trim() || values.tags.includes(tagInput.trim())
                    }
                    className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer p-1.5 bg-primary text-white rounded-full hover:bg-primary-dark disabled:opacity-30 disabled:cursor-not-allowed disabled:bg-gray-300 transition-all duration-200 shadow-sm"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Selected Tags */}
              {values.tags.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-gray-100">
                  <span className="text-xs text-gray-500">Selected:</span>
                  {values.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-linear-to-r from-primary/10 to-primary/5 text-primary text-xs font-medium rounded-full border border-primary/20 shadow-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() =>
                          setFieldValue(
                            "tags",
                            values.tags.filter((t) => t !== tag),
                          )
                        }
                        className="p-0.5 cursor-pointer hover:bg-primary/20 rounded-full transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
              <span className="text-xs text-gray-500">
                Press{" "}
                <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-sans">
                  Enter
                </kbd>{" "}
                to post
              </span>
              <button
                type="submit"
                disabled={isSubmitting || !values.content.trim()}
                className="flex items-center cursor-pointer gap-2 px-6 py-2.5 bg-linear-to-r from-primary to-primary-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Posting
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Post
                  </>
                )}
              </button>
            </div>
          </Form>
        );
      }}
    </Formik>
  );
}
