import { useEffect, useState } from "react";
import "../styles/ExercisesPage.css";

function ExercisesPage() {
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadExercises() {
      try {
        const response = await fetch(
          "https://localhost:7022/api/exercises"
        );

        if (!response.ok) {
          throw new Error("Failed to load exercises");
        }

        const data = await response.json();
        setExercises(data);
      } catch (error) {
        setError(error.message);
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
    return <p className="error-message">{error}</p>;
  }

  return (
    <main className="exercises-page">
      <h1>Exercise Library</h1>

      <div className="exercise-grid">
        {exercises.map((exercise) => (
            <article className="exercise-card" key={exercise.id}>
            <img
                className="exercise-image"
                src={exercise.imageUrl || "/images/exercises/exercise-placeholder.jpg"}
                alt={`${exercise.name} demonstration`}
            />

            <div className="exercise-content">
                <h2>{exercise.name}</h2>
                <p className="muscle-group">{exercise.muscleGroup}</p>
                <p>{exercise.description}</p>
            </div>
            </article>
        ))}
      </div>
    </main>
  );
}

export default ExercisesPage;