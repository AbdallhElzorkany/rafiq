import { useState } from "react";
import { Formik, Form } from "formik";
import { Link, useNavigate } from "react-router";
import { Loader2 } from "lucide-react";
import axios from "axios";
import EmailInput from "./EmailInput";
import PasswordInput from "./PasswordInput";
import { useAuth } from "../../contexts/AuthContext";

const validationSchema = {
  email: (value: string) => {
    if (!value) return "Email is required";
    if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(value)) {
      return "Invalid email address";
    }
    return null;
  },
  password: (value: string) => {
    if (!value) return "Password is required";
    if (value.length < 6) return "Password must be at least 6 characters";
    return null;
  },
};

interface FormValues {
  email: string;
  password: string;
  rememberMe: boolean;
}

export default function LoginForm() {
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const navigate = useNavigate();
  const { login } = useAuth();

  const initialValues: FormValues = {
    email: "",
    password: "",
    rememberMe: false,
  };

  const validateForm = (values: FormValues) => {
    const newErrors: { [key: string]: string } = {};

    const emailError = validationSchema.email(values.email);
    if (emailError) newErrors.email = emailError;

    const passwordError = validationSchema.password(values.password);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (values: FormValues) => {
    if (validateForm(values)) {
      setErrors({});
      try {
        const response = await axios.post(
          "https://rafiq-container-server.wittyhill-43579268.germanywestcentral.azurecontainerapps.io/api/Auth/login",
          {
            email: values.email,
            password: values.password,
          },
        );

        const responseBody = response.data;

        if (responseBody?.success && responseBody?.data) {
          const responseData = responseBody.data;

          if (responseData.isAuthenticated) {
            login(responseData);

            console.log("Login success:", responseBody);

            const roles = responseData.roles || [];
            const hasAssessment = responseData.hasAssessment === true;

            if (roles.includes("Family") && !hasAssessment) {
              navigate("/assessment");
            } else {
              navigate("/dashboard");
            }
          } else {
            setErrors({ api: responseBody.message || "Authentication failed" });
          }
        } else {
          setErrors({ api: responseBody?.message || "Login failed" });
        }
      } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
          // Extract specific message based on API response
          const msg =
            error.response.data?.message ||
            error.response.data?.detail ||
            error.response.data?.title ||
            (typeof error.response.data === "string"
              ? error.response.data
              : "Invalid credentials");
          setErrors({ api: msg });
        } else {
          setErrors({
            api: "An unexpected error occurred. Please try again later.",
          });
        }
      }
    }
  };

  return (
    <Formik initialValues={initialValues} onSubmit={handleSubmit}>
      {({ isSubmitting }) => (
        <Form className="space-y-5">
          <EmailInput
            label="Email Address"
            placeholder="name@example.com"
            error={errors.email}
          />

          <PasswordInput
            label="Password"
            placeholder="••••••••"
            error={errors.password}
          />

          {errors.api && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl mt-2">
              {errors.api}
            </div>
          )}

          <div className="flex justify-end mb-6">
            <Link
              to="/forgotPassword"
              className="text-sm font-semibold text-[#188146] hover:text-[#116937] transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#188147] text-white py-3.5 px-4 rounded-xl font-semibold hover:bg-[#116937] transition-all duration-200 shadow-sm flex items-center justify-center mb-4 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Processing...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </Form>
      )}
    </Formik>
  );
}
