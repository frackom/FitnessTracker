import {
  BrowserRouter, Navigate,
  Outlet, Route, Routes,
} from "react-router-dom";
import {
  Alert, Box, Button,
  CircularProgress
} from "@mui/material";

import { AuthProvider, useAuth } from "./context/AuthContext";
import Navbar from "./components/Navbar.jsx";
import ExercisesPage from "./pages/ExercisesPage.jsx";
import RoutineCreationPage from "./pages/RoutineCreationPage.jsx";
import RoutinesPage from "./pages/RoutinesPage.jsx";
import RoutineDetailsPage from "./pages/RoutineDetailsPage.jsx";
import WorkoutPage from "./pages/WorkoutPage.jsx";
import WorkoutHistoryPage from "./pages/WorkoutHistoryPage.jsx";
import ProgressPage from "./pages/ProgressPage.jsx";
import WelcomePage from "./pages/WelcomePage.jsx";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

function AppRoutes() {
  const { user, loading, sessionError } = useAuth();

  if (loading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: "100vh" }}>
        <CircularProgress aria-label="Checking your session" />
      </Box>
    );
  }

  if (sessionError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{sessionError}</Alert>
        <Button onClick={() => window.location.reload()} sx={{ mt: 2 }}>
          Retry
        </Button>
      </Box>
    );
  }

  return (
    <Routes>
      <Route
        path="/"
        element={
          user ? <Navigate to="/routines" replace /> : <WelcomePage />
        }
      />

      <Route element={<ProtectedLayout />}>
        <Route path="/exercises" element={<ExercisesPage />} />
        <Route path="/routines" element={<RoutinesPage />} />
        <Route path="/routines/create" element={<RoutineCreationPage />} />
        <Route path="/routines/:id" element={<RoutineDetailsPage />} />
        <Route path="/routines/:id/edit" element={<RoutineCreationPage />} />
        <Route path="/workouts" element={<WorkoutHistoryPage />} />
        <Route path="/routines/:id/workout" element={<WorkoutPage />} />
        <Route path="/progress" element={<ProgressPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function ProtectedLayout() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <>
      <Navbar />
      <Outlet />
    </>
  );
}

export default App;