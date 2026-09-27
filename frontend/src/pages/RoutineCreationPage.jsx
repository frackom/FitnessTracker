import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getExercises } from "../services/exercisesApi";
import { createRoutine, getRoutineById, updateRoutine } from "../services/routinesApi";
import ExerciseCard from "../components/ExerciseCard.jsx";
import "../styles/RoutineCreationPage.css";

function RoutineCreationPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [availableExercises, setAvailableExercises] = useState([]);
  const [selectedExercises, setSelectedExercises] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    async function loadPageData() {
      try {
        setIsLoading(true);
        setError("");

        const [exercises, routine] = await Promise.all([
          getExercises(),
          isEditing ? getRoutineById(id) : Promise.resolve(null),
        ]);

        setAvailableExercises(exercises);

        if (routine) {
          setName(routine.name);
          setDescription(routine.description ?? "");

          const orderedExercises = [...routine.exercises].sort(
            (firstExercise, secondExercise) =>
              firstExercise.position - secondExercise.position
          );

          setSelectedExercises(
            orderedExercises.map((exercise) => ({
              exerciseId: exercise.exerciseId,
              name: exercise.name,
              muscleGroup: exercise.muscleGroup,
              imageUrl: exercise.imageUrl,
              targetSets: exercise.targetSets,
              targetReps: exercise.targetReps,
            }))
          );
        }
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadPageData();
  }, [id, isEditing]);

  function addExercise(exercise) {
    const isAlreadySelected = selectedExercises.some(
      (selected) => selected.exerciseId === exercise.id
    );

    if (isAlreadySelected) {
      return;
    }

    setSelectedExercises((currentExercises) => [
      ...currentExercises,
      {
        exerciseId: exercise.id,
        name: exercise.name,
        muscleGroup: exercise.muscleGroup,
        imageUrl: exercise.imageUrl,
        targetSets: 3,
        targetReps: 8,
      },
    ]);
  }

  function removeExercise(exerciseId) {
    setSelectedExercises((currentExercises) =>
      currentExercises.filter(
        (exercise) => exercise.exerciseId !== exerciseId
      )
    );
  }

  function updateExercise(exerciseId, property, value) {
    setSelectedExercises((currentExercises) =>
      currentExercises.map((exercise) =>
        exercise.exerciseId === exerciseId
          ? {
              ...exercise,
              [property]: Number(value),
            }
          : exercise
      )
    );
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccessMessage("");

    if (!name.trim()) {
      setError("Enter a routine name.");
      return;
    }

    if (selectedExercises.length === 0) {
      setError("Add at least one exercise.");
      return;
    }

    const request = {
      name: name.trim(),
      description: description.trim(),
      exercises: selectedExercises.map((exercise) => ({
        exerciseId: exercise.exerciseId,
        targetSets: exercise.targetSets,
        targetReps: exercise.targetReps,
      })),
    };

    try {
      setIsSubmitting(true);

      if (isEditing) {
        const updatedRoutine = await updateRoutine(id, request);

        navigate(`/routines/${updatedRoutine.id}`);
        return;
      }

      const createdRoutine = await createRoutine(request);

      setSuccessMessage(
        `${createdRoutine.name} was created successfully.`
      );

      setName("");
      setDescription("");
      setSelectedExercises([]);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="routine-builder">
      <header>
        <h1>{isEditing ? "Edit routine": "Create a routine"}</h1>
        <p>
          Select exercises and choose the target sets and repetitions.
        </p>
      </header>

      {error && <p className="message error-message">{error}</p>}

      {successMessage && (
        <p className="message success-message">{successMessage}</p>
      )}

      <form onSubmit={handleSubmit}>
        <section className="routine-details">
          <label>
            Routine name
            <input
              type="text"
              value={name}
              maxLength={100}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </label>

          <label>
            Description
            <textarea
              value={description}
              maxLength={500}
              rows={3}
              onChange={(event) => setDescription(event.target.value)}
            />
          </label>
        </section>

        <section>
          <h2>Available exercises</h2>

          {isLoading ? (
            <p>Loading exercises...</p>
          ) : (
            <div className="routine-exercise-grid">
              {availableExercises.map((exercise) => {
                const isSelected = selectedExercises.some(
                  (selected) => selected.exerciseId === exercise.id
                );

                return (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    action={
                      <button
                        type="button"
                        disabled={isSelected}
                        onClick={() => addExercise(exercise)}
                      >
                        {isSelected ? "Added" : "Add exercise"}
                      </button>
                    }
                  />
                );
              })}
            </div>
          )}
        </section>

        <section>
          <h2>Selected exercises</h2>

          {selectedExercises.length === 0 ? (
            <p>No exercises selected.</p>
          ) : (
            <div className="selected-exercises">
              {selectedExercises.map((exercise, index) => (
                <article
                  className="selected-exercise"
                  key={exercise.exerciseId}
                >
                  <div>
                    <span className="exercise-position">
                      {index + 1}
                    </span>

                    <strong>{exercise.name}</strong>
                    <span>{exercise.muscleGroup}</span>
                  </div>

                  <label>
                    Sets
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={exercise.targetSets}
                      onChange={(event) =>
                        updateExercise(
                          exercise.exerciseId,
                          "targetSets",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <label>
                    Reps
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={exercise.targetReps}
                      onChange={(event) =>
                        updateExercise(
                          exercise.exerciseId,
                          "targetReps",
                          event.target.value
                        )
                      }
                    />
                  </label>

                  <button
                    type="button"
                    className="remove-button"
                    onClick={() =>
                      removeExercise(exercise.exerciseId)
                    }
                  >
                    Remove
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>

        <button
          className="save-routine-button"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Saving..." : isEditing ? "Update Routine" : "Save routine"}
        </button>
      </form>
    </main>
  );
}

export default RoutineCreationPage;