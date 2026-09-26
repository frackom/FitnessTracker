import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import ExercisesPage from "./pages/ExercisesPage.jsx";
import RoutineCreationPage from "./pages/RoutineCreationPage.jsx";
import RoutinesPage from "./pages/RoutinesPage.jsx";
import RoutineDetailsPage from "./pages/RoutineDetailsPage.jsx";

function App() {
  return (
    <BrowserRouter>
      <Navbar />

      <Routes>
        <Route path="/" element={<Navigate to="/routines" replace />} />
        <Route path="/exercises" element={<ExercisesPage />} />
        <Route path="/routines" element={<RoutinesPage />} />
        <Route path="/routines/create" element={<RoutineCreationPage />} />
        <Route path="/routines/:id" element={<RoutineDetailsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;