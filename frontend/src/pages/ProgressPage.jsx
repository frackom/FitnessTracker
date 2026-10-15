import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProgressChart from "../components/ProgressChart.jsx";
import { getWorkouts } from "../services/workoutsApi.js";
import { getExercises } from "../services/exercisesApi.js";
import { getExerciseProgress } from "../utils/workoutProgress.js";
import {
  Alert, Card, Container, Link as MuiLink, Table,
  TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField,
  Typography, Box
} from "@mui/material";

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
  <Box
    sx={{
      bgcolor: "background.default",
      color: "text.primary",
      minHeight: "calc(100vh - 64px)",
    }}>
    <Container
      component="main"
      maxWidth="md"
      sx={{ py: { xs: 3, md: 6 } }}
    >
      <Typography component="h1" variant="h4" sx={{ mb: 2 }}>
        Exercise Progress
      </Typography>

      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Track the heaviest weight you logged for an exercise in each
        workout, across all routines.
      </Typography>

      {!workouts && !error && (
        <Typography role="status" color="text.secondary">
          Loading progress...
        </Typography>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}{" "}
          <MuiLink component={Link} to="/workouts">
            View workout history
          </MuiLink>
        </Alert>
      )}

      {workouts && exercises.length === 0 && (
        <Typography color="text.secondary">
          The exercise library is empty.
        </Typography>
      )}

      {selectedExercise && (
        <>
          <TextField
            select
            label="Exercise"
            value={selectedId}
            onChange={(event) => setSelectedId(event.target.value)}
            sx={{ width: { xs: "100%", sm: 320 }, mb: 3 }}
            slotProps={{
              select: { native: true },
              htmlInput: { id: "progress-exercise" },
            }}
          >
            {exercises.map((exercise) => (
              <option key={exercise.id} value={exercise.id}>
                {exercise.name}
              </option>
            ))}
          </TextField>

          <Card
            component="section"
            variant="outlined"
            aria-labelledby="progress-chart-heading"
            sx={{ p: { xs: 2, sm: 3 } }}
          >
            <Typography
              component="h2"
              variant="h6"
              id="progress-chart-heading"
              sx={{ mb: 2 }}
            >
              {selectedExercise.name}
            </Typography>

            {points.length === 0 ? (
              <Typography color="text.secondary">
                No progress recorded yet for {selectedExercise.name}.{" "}
                <MuiLink component={Link} to="/routines">
                  Complete a workout
                </MuiLink>{" "}
                with this exercise to start tracking.
              </Typography>
            ) : (
              <>
                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  Heaviest weight per workout · kg
                </Typography>

                <Typography sx={{ mb: 2 }}>
                  Highest logged:{" "}
                  <strong>
                    {Math.max(...points.map((point) => point.weightKg))} kg
                  </strong>
                  {" · "}
                  {points.length}{" "}
                  {points.length === 1 ? "workout" : "workouts"}
                </Typography>

                <ProgressChart
                  points={points}
                  exerciseName={selectedExercise.name}
                />

                {points.length === 1 && (
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    Log another workout with this exercise to see a trend.
                  </Typography>
                )}

                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mb: 3 }}
                >
                  Weight alone does not measure all progress; your reps
                  and sets also matter.
                </Typography>

                <TableContainer>
                  <Table className="progress-table">
                    <caption>
                      Recorded weights for {selectedExercise.name}
                    </caption>

                    <TableHead>
                      <TableRow>
                        <TableCell>Workout date</TableCell>
                        <TableCell>Routine</TableCell>
                        <TableCell>Heaviest weight</TableCell>
                      </TableRow>
                    </TableHead>

                    <TableBody>
                      {points.map((point) => (
                        <TableRow key={point.workoutId}>
                          <TableCell>
                            {new Date(point.completedAtUtc).toLocaleString()}
                          </TableCell>
                          <TableCell>{point.routineName}</TableCell>
                          <TableCell>{point.weightKg} kg</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </>
            )}
          </Card>
        </>
      )}
    </Container>
  </Box>
);
}

export default ProgressPage;