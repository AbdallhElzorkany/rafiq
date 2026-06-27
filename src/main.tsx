import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import Home from "./pages/Home.tsx";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import ForgotPassword from "./pages/ForgotPassword.tsx";
import Assessment from "./pages/Assessment.tsx";
import Sessions from "./pages/Sessions.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "./contexts/AuthContext.tsx";
import { ToastProvider } from "./contexts/ToastContext.tsx";
import { ToastContainer } from "./components/Toast.tsx";
import Session from "./pages/Session.tsx";
import ProtectedRoute from "./routes/ProtectedRoute.tsx";
import PublicRoute from "./routes/PublicRoute.tsx";
import AppLayout from "./layouts/AppLayout.tsx";
import Specialists from "./pages/Specialists.tsx";
import Specialist from "./pages/Specialist.tsx";
import AIAssistant from "./pages/AIAssistant.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Patients from "./pages/Patients.tsx";
import Patient from "./pages/Patient.tsx";
// import WelcomeSection from "./components/HomeComponents/WelcomeSection.tsx";
// import Services from "./components/HomeComponents/Services.tsx";
// import Activities from "./components/HomeComponents/Activities.tsx";
// import Care from "./components/HomeComponents/Care.tsx";
import Community from "./pages/Community.tsx";
import Resources from "./pages/Resources.tsx";
import Chats from "./pages/Chats.tsx";
import Notifications from "./pages/Notifications.tsx";
import Games from "./pages/Games.tsx";
// import Settings from "./pages/Settings.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    children: [
      {
        element: (
          <PublicRoute>
            <Home />
          </PublicRoute>
        ),
        index: true,
        // children: [
        //   {
        //     index: true,
        //     element: <WelcomeSection />,
        //   },
        //   {
        //     path: "services",
        //     element: <Services />,
        //   },
        //   {
        //     path: "activities",
        //     element: <Activities />,
        //   },
        //   {
        //     path: "care",
        //     element: <Care />,
        //   },
        // ],
      },
      {
        element: (
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        ),
        children: [
          { path: "dashboard", element: <Dashboard /> },
          {
            path: "sessions",
            element: <Sessions />,
          },
          {
            path: "sessions/:sessionId",
            element: <Session />,
          },
          { path: "specialists", element: <Specialists /> },
          { path: "specialists/:specialistId", element: <Specialist /> },
          { path: "patients", element: <Patients /> },
          { path: "patients/:patientId", element: <Patient /> },
          { path: "ai-assistant", element: <AIAssistant /> },
          { path: "community", element: <Community /> },
          { path: "resources", element: <Resources /> },
          { path: "notifications", element: <Notifications /> },
          { path: "games", element: <Games /> },
          // { path: "settings", element: <Settings /> },
          {
            path: "chats",
            element: <Chats />,
            children: [{ path: ":userId" }],
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    element: (
      <PublicRoute>
        <Login />
      </PublicRoute>
    ),
  },
  {
    path: "/register",
    element: (
      <PublicRoute>
        <Register />
      </PublicRoute>
    ),
  },
  {
    path: "/forgotPassword",
    element: (
      <PublicRoute>
        <ForgotPassword />
      </PublicRoute>
    ),
  },
  {
    path: "/assessment",
    element: (
      <ProtectedRoute>
        <Assessment />
      </ProtectedRoute>
    ),
  },
]);

const queryClient = new QueryClient();
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ToastProvider>
          <RouterProvider router={router} />
          <ToastContainer />
        </ToastProvider>
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);
