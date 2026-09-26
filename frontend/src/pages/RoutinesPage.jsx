import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getRoutines } from "../services/routinesApi.js";
import "../styles/RoutinesPage.css";

function RoutinesPage() {
  const [routines, setRoutines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadRoutines() {
      try {
        const data = await getRoutines();
        setRoutines(data);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadRoutines();
  }, []);

  if (isLoading) {
    return <p className="routines-message">Loading routines...</p>;
  }

  if (error) {
    return <p className="routines-error">{error}</p>;
  }

  return (
    <main className="routines-page">
      <header className="routines-header">
        <div>
          <h1>My Routines</h1>
          <p>View and manage your saved workout routines.</p>
        </div>

        <Link className="routines-create-link" to="/routines/create">
          Create routine
        </Link>
      </header>

      {routines.length === 0 ? (
        <section className="routines-empty">
          <h2>No routines yet</h2>
          <p>Create your first routine by selecting exercises.</p>

          <Link to="/routines/create">Create your first routine</Link>
        </section>
      ) : (
        <section className="routines-grid">
          {routines.map((routine) => (
            <article className="routine-card" key={routine.id}>
              <h2>{routine.name}</h2>

              {routine.description && (
                <p className="routine-card-description">
                  {routine.description}
                </p>
              )}

              <p className="routine-card-count">
                {routine.exercises.length}{" "}
                {routine.exercises.length === 1 ? "exercise" : "exercises"}
              </p>

              <ul className="routine-card-exercises">
                {routine.exercises.map((exercise) => (
                  <li key={exercise.exerciseId}>
                    <span>{exercise.name}</span>
                    <span>
                      {exercise.targetSets} × {exercise.targetReps}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                className="routine-card-link"
                to={`/routines/${routine.id}`}
              >
                View routine
              </Link>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export default RoutinesPage;