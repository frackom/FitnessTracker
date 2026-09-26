import { useEffect, useState } from "react";
import ExerciseCard from "../components/ExerciseCard.jsx";
import { getExercises } from "../services/exercisesApi.js";
import "../styles/ExercisesPage.css";

function ExercisesPage() {
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadExercises() {
      try {
        const data = await getExercises();
        setExercises(data);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadExercises();
  }, []);

  if (isLoading) {
    return <p>Loading exercises...</p>;
  }

  if (error) {
    return <p className="exercises-page-error">{error}</p>;
  }

  return (
    <main className="exercises-page">
      <h1>Exercise Library</h1>

      <div className="exercise-grid">
        {exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
          />
        ))}
      </div>
    </main>
  );
}

export default ExercisesPage;