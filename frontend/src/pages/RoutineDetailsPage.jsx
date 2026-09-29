import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getRoutineById, deleteRoutine } from "../services/routinesApi.js";
import "../styles/RoutineDetailsPage.css";

function RoutineDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [routine, setRoutine] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    async function loadRoutine() {
      try {
        setIsLoading(true);
        setError("");

        const data = await getRoutineById(id);
        setRoutine(data);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setIsLoading(false);
      }
    }


    loadRoutine();
  }, [id]);

  async function handleDelete() {
    const shouldDelete = window.confirm(
      `Are you sure you want to delete "${routine.name}"?`
    );

    if (!shouldDelete) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError("");

      await deleteRoutine(routine.id);

      navigate("/routines");
    } catch (deleteError) {
      setDeleteError(deleteError.message);
      setIsDeleting(false);
    }
  }

  if (isLoading) {
    return (
      <main className="routine-details-page">
        <p className="routine-details-message">Loading routine...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="routine-details-page">
        <section className="routine-details-error">
          <h1>Unable to load routine</h1>
          <p>{error}</p>

          <Link to="/routines">Back to routines</Link>
        </section>
      </main>
    );
  }

  if (!routine) {
    return null;
  }

  const orderedExercises = [...routine.exercises].sort(
    (firstExercise, secondExercise) =>
      firstExercise.position - secondExercise.position
  );

  return (
    <main className="routine-details-page">
      <Link className="routine-details-back" to="/routines">
        ← Back to routines
      </Link>

      <header className="routine-details-header">
        <div>
          <h1>{routine.name}</h1>

          {routine.description && <p>{routine.description}</p>}
        </div>

        <div className="routine-details-actions">
          <button
            className="routine-details-delete"
            type="button"
            disabled={isDeleting}
            onClick={handleDelete}
          >
            {isDeleting ? "Deleting..." : "Delete routine"}
          </button>

          <Link
            className="routine-details-edit"
            to={`/routines/${routine.id}/edit`}
          >
            Edit routine
          </Link>

          <Link
            className="routine-details-start"
            to={`/routines/${routine.id}/workout`}
          >
            Start workout
          </Link>
        </div>
      </header>

      {deleteError && (
        <p className="routine-details-delete-error">
          {deleteError}
        </p>
      )}

      <section className="routine-details-summary">
        <span>
          {orderedExercises.length}{" "}
          {orderedExercises.length === 1 ? "exercise" : "exercises"}
        </span>
      </section>

      <section className="routine-details-exercises">
        {orderedExercises.map((exercise, index) => (
          <article
            className="routine-details-exercise"
            key={exercise.exerciseId}
          >
            <div className="routine-details-position">
              {index + 1}
            </div>

            {exercise.imageUrl && (
              <img
                className="routine-details-image"
                src={exercise.imageUrl}
                alt={exercise.name}
              />
            )}

            <div className="routine-details-exercise-info">
              <h2>{exercise.name}</h2>
              <p>{exercise.muscleGroup}</p>
            </div>

            <div className="routine-details-target">
              <span>Target</span>
              <strong>
                {exercise.targetSets} × {exercise.targetReps}
              </strong>
              <small>sets × reps</small>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export default RoutineDetailsPage;