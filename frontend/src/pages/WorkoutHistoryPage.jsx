import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWorkouts } from "../services/workoutsApi.js";
import "../styles/WorkoutPage.css";

function WorkoutHistoryPage() {
  const [workouts, setWorkouts] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getWorkouts().then((data) => { if (active) setWorkouts(data); })
      .catch((requestError) => { if (active) setError(requestError.message); });
    return () => { active = false; };
  }, []);

  return (
    <main className="workout-page">
      <h1>Workout history</h1>
      {error && <p role="alert">{error}</p>}
      {!workouts && !error && <p>Loading workouts...</p>}
      {workouts?.length === 0 && <p>No workouts recorded yet. <Link to="/routines">Choose a routine</Link> to get started.</p>}
      {workouts?.map((workout) => (
        <article className="workout-exercise" key={workout.id}>
          <h2>{workout.routineName}</h2>
          <p>{new Date(workout.completedAtUtc).toLocaleString()}</p>
          {[...new Set(workout.sets.map((set) => set.exerciseId))].map((exerciseId) => {
            const exerciseSets = workout.sets.filter((set) => set.exerciseId === exerciseId);
            return <div key={exerciseId} className="history-exercise">
              <strong>{exerciseSets[0].exerciseName}</strong>
              <p>{exerciseSets.map((set) => `${set.reps} reps × ${set.weightKg} kg`).join(" · ")}</p>
            </div>;
          })}
        </article>
      ))}
    </main>
  );
}

export default WorkoutHistoryPage;
