import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getRoutineById } from "../services/routinesApi.js";
import { completeWorkout } from "../services/workoutsApi.js";
import "../styles/WorkoutPage.css";

function WorkoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [routine, setRoutine] = useState(null);
  const [sets, setSets] = useState([]);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    getRoutineById(id).then((data) => {
      if (!active) return;
      setRoutine(data);
      setSets(data.exercises.flatMap((exercise) =>
        Array.from({ length: exercise.targetSets }, (_, index) => ({
          exerciseId: exercise.exerciseId,
          setNumber: index + 1,
          reps: String(exercise.targetReps),
          weightKg: "",
          completed: false,
        }))
      ));
    }).catch((requestError) => { if (active) setError(requestError.message); });
    return () => { active = false; };
  }, [id]);

  function updateSet(exerciseId, setNumber, changes) {
    setSets((previous) => previous.map((set) =>
      set.exerciseId === exerciseId && set.setNumber === setNumber
        ? { ...set, ...changes } : set
    ));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const completed = sets.filter((set) => set.completed);
    if (!completed.length) {
      setError("Complete at least one set before saving.");
      return;
    }
    if (completed.some((set) => !Number.isInteger(Number(set.reps)) ||
      Number(set.reps) < 1 || set.weightKg === "" ||
      !Number.isFinite(Number(set.weightKg)) || Number(set.weightKg) < 0)) {
      setError("Completed sets need valid reps and weight (0 kg is allowed).");
      return;
    }
    try {
      setSaving(true);
      setError("");
      await completeWorkout({
        routineId: Number(id),
        sets: completed.map(({ exerciseId, setNumber, reps, weightKg }) => ({
          exerciseId, setNumber, reps: Number(reps), weightKg: Number(weightKg),
        })),
      });
      navigate("/workouts");
    } catch (requestError) {
      setError(requestError.message);
      setSaving(false);
    }
  }

  if (!routine && !error) return <main className="workout-page"><p>Loading workout...</p></main>;
  if (!routine) return <main className="workout-page"><p role="alert">{error}</p><Link to="/routines">Back to routines</Link></main>;

  return (
    <main className="workout-page">
      <Link to={`/routines/${id}`}>← Back to routine</Link>
      <h1>{routine.name}</h1>
      <p>Enter the weight and reps you actually performed, then check each completed set.</p>
      <form onSubmit={handleSubmit}>
        {[...routine.exercises].sort((a, b) => a.position - b.position).map((exercise) => (
          <section className="workout-exercise" key={exercise.exerciseId}>
            <h2>{exercise.name}</h2>
            <p>Target: {exercise.targetSets} × {exercise.targetReps}</p>
            {sets.filter((set) => set.exerciseId === exercise.exerciseId).map((set) => (
              <div className="workout-set" key={set.setNumber}>
                <span>Set {set.setNumber}</span>
                <label>Reps <input type="number" min="1" max="1000" value={set.reps}
                  onChange={(event) => updateSet(set.exerciseId, set.setNumber, { reps: event.target.value })} /></label>
                <label>Weight (kg) <input type="number" min="0" max="10000" step="0.01"
                  value={set.weightKg} placeholder="0"
                  onChange={(event) => updateSet(set.exerciseId, set.setNumber, { weightKg: event.target.value })} /></label>
                <label className="workout-done"><input type="checkbox" checked={set.completed}
                  onChange={(event) => updateSet(set.exerciseId, set.setNumber, { completed: event.target.checked })} /> Done</label>
              </div>
            ))}
          </section>
        ))}
        {error && <p role="alert" className="workout-error">{error}</p>}
        <button className="workout-save" disabled={saving} type="submit">{saving ? "Saving..." : "Complete workout"}</button>
      </form>
    </main>
  );
}

export default WorkoutPage;
