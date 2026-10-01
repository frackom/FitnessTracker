import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProgressChart from "../components/ProgressChart.jsx";
import { getWorkouts } from "../services/workoutsApi.js";
import { getExercises } from "../services/exercisesApi.js";
import { getExerciseProgress } from "../utils/workoutProgress.js";
import "../styles/ProgressPage.css";

function ProgressPage() {
  const [workouts, setWorkouts] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadProgress() {
      try {
        const [history, library] = await Promise.all([
          getWorkouts(),
          getExercises(),
        ]);

        if (!active) return;

        const orderedExercises = [...library].sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        setWorkouts(history);
        setExercises(orderedExercises);
        setSelectedId(
          orderedExercises.length ? String(orderedExercises[0].id) : ""
        );
      } catch (requestError) {
        if (active) setError(requestError.message);
      }
    }

    loadProgress();

    return () => {
      active = false;
    };
  }, []);

  const selectedExercise = exercises.find(
    (exercise) => String(exercise.id) === selectedId
  );

  const points = getExerciseProgress(
    workouts ?? [],
    Number(selectedId)
  );

  return (
    <main className="progress-page">
      <h1>Exercise progress</h1>

      <p>
        Track the heaviest weight you logged for an exercise in each
        workout, across all routines.
      </p>

      {!workouts && !error && (
        <p role="status">Loading progress...</p>
      )}

      {error && (
        <p role="alert">
          {error} <Link to="/workouts">View workout history</Link>
        </p>
      )}

      {workouts && exercises.length === 0 && (
        <p>The exercise library is empty.</p>
      )}

      {selectedExercise && (
        <>
          <label
            className="progress-select"
            htmlFor="progress-exercise"
          >
            Exercise
            <select
              id="progress-exercise"
              value={selectedId}
              onChange={(event) => setSelectedId(event.target.value)}
            >
              {exercises.map((exercise) => (
                <option key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </option>
              ))}
            </select>
          </label>

          <section
            className="progress-panel"
            aria-labelledby="progress-chart-heading"
          >
            <h2 id="progress-chart-heading">
              {selectedExercise.name}
            </h2>

            {points.length === 0 ? (
              <p>
                No progress recorded yet for {selectedExercise.name}.{" "}
                <Link to="/routines">Complete a workout</Link> with
                this exercise to start tracking.
              </p>
            ) : (
              <>
                <p>Heaviest weight per workout · kg</p>

                <p>
                  Highest logged:{" "}
                  <strong>
                    {Math.max(...points.map((point) => point.weightKg))} kg
                  </strong>
                  {" · "}
                  {points.length}{" "}
                  {points.length === 1 ? "workout" : "workouts"}
                </p>

                <ProgressChart
                  points={points}
                  exerciseName={selectedExercise.name}
                />

                {points.length === 1 && (
                  <p>
                    Log another workout with this exercise to see a trend.
                  </p>
                )}

                <p className="progress-note">
                  Weight alone does not measure all progress; your
                  reps and sets also matter.
                </p>

                <div className="progress-table-wrapper">
                  <table className="progress-table">
                    <caption>
                      Recorded weights for {selectedExercise.name}
                    </caption>

                    <thead>
                      <tr>
                        <th scope="col">Workout date</th>
                        <th scope="col">Routine</th>
                        <th scope="col">Heaviest weight</th>
                      </tr>
                    </thead>

                    <tbody>
                      {points.map((point) => (
                        <tr key={point.workoutId}>
                          <td>
                            {new Date(
                              point.completedAtUtc
                            ).toLocaleString()}
                          </td>
                          <td>{point.routineName}</td>
                          <td>{point.weightKg} kg</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default ProgressPage;