import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { getRoutineById } from "../services/routinesApi.js";
import { completeWorkout } from "../services/workoutsApi.js";
import {
  Alert, Button, Card,
  Container, Stack, TextField,
  Typography, Box
} from "@mui/material";

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
          reps: "",
          weightKg: "",
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
    const completed = sets.filter((set) => set.reps.trim() !== "" && Number(set.reps) !== 0);
    if (!completed.length) {
      setError("Enter reps and weight for at least one set before saving.");
      return;
    }
    if (completed.some((set) => !Number.isInteger(Number(set.reps)) ||
      Number(set.reps) < 1 || Number(set.reps) > 1000 || set.weightKg.trim() === "" ||
      !Number.isFinite(Number(set.weightKg)) || Number(set.weightKg) < 0 || Number(set.weightKg) > 10000)) {
      setError("Sets with reps need valid reps and weight (0 kg is allowed).");
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

if (!routine && !error) {
  return (
    <Box
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
        minHeight: "calc(100vh - 64px)",
      }}>
      <Container component="main" maxWidth="md" sx={{ py: 6 }}>
        <Typography role="status" color="text.secondary">
          Loading workout...
        </Typography>
      </Container>
    </Box>
  );
}

if (!routine) {
  return (
    <Box
    sx={{
      bgcolor: "background.default",
      color: "text.primary",
      minHeight: "calc(100vh - 64px)",
    }}>
      <Container component="main" maxWidth="md" sx={{ py: 6 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>

        <Button component={Link} to="/routines">
          Back to routines
        </Button>
      </Container>
    </Box>
  );
}

return (
  <Box
    sx={{
      bgcolor: "background.default",
      color: "text.primary",
      minHeight: "calc(100vh - 64px)",
    }}>
    <Container
      component="main"
      className="workout-page"
      maxWidth="md"
      sx={{ py: { xs: 3, md: 6 } }}
    >
      <Button
        component={Link}
        to={`/routines/${id}`}
        sx={{ mb: 3 }}
      >
        ← Back to routine
      </Button>

      <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
        {routine.name}
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Enter the reps and weight you performed. Leave reps blank or
        enter 0 to skip a set. Weight is in kg; 0 kg is allowed.
      </Typography>

      <form onSubmit={handleSubmit} noValidate>
        {[...routine.exercises]
          .sort((a, b) => a.position - b.position)
          .map((exercise) => (
            <Card
              component="section"
              variant="outlined"
              className="workout-exercise"
              key={exercise.exerciseId}
              sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}
            >
              <Typography component="h2" variant="h6" sx={{ mb: 1 }}>
                {exercise.name}
              </Typography>

              <Typography color="text.secondary" sx={{ mb: 3 }}>
                Target: {exercise.targetSets} × {exercise.targetReps}
              </Typography>

              {sets
                .filter((set) => set.exerciseId === exercise.exerciseId)
                .map((set) => (
                  <Stack
                    className="workout-set"
                    key={set.setNumber}
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{ mb: 2 }}
                  >
                    <Typography
                      variant="body2"
                      sx={{ flexShrink: 0, minWidth: 40 }}
                    >
                      Set {set.setNumber}
                    </Typography>

                    <TextField
                      label="Reps"
                      type="number"
                      size="small"
                      fullWidth
                      value={set.reps}
                      placeholder={String(exercise.targetReps)}
                      onChange={(event) =>
                        updateSet(set.exerciseId, set.setNumber, {
                          reps: event.target.value,
                        })
                      }
                      slotProps={{
                        htmlInput: { min: 0, max: 1000, step: 1 },
                      }}
                    />

                    <TextField
                      label="Weight (kg)"
                      type="number"
                      size="small"
                      fullWidth
                      value={set.weightKg}
                      placeholder="0"
                      onChange={(event) =>
                        updateSet(set.exerciseId, set.setNumber, {
                          weightKg: event.target.value,
                        })
                      }
                      slotProps={{
                        htmlInput: { min: 0, max: 10000, step: 0.01 },
                      }}
                    />
                  </Stack>
                ))}
            </Card>
          ))}

        {error && (
          <Alert
            severity="error"
            className="workout-error"
            sx={{ mb: 3 }}
          >
            {error}
          </Alert>
        )}

        <Button
          className="workout-save"
          disabled={saving}
          type="submit"
          variant="contained"
          size="large"
        >
          {saving ? "Saving..." : "Complete workout"}
        </Button>
      </form>
    </Container>
  </Box>
);
}

export default WorkoutPage;
