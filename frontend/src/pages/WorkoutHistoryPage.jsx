import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getWorkouts } from "../services/workoutsApi.js";
import {
  Alert, Box, Card,
  Container, Link as MuiLink,
  Typography,
} from "@mui/material";

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
      <Typography component="h1" variant="h4" sx={{ mb: 4 }}>
        Workout History
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!workouts && !error && (
        <Typography role="status" color="text.secondary">
          Loading workouts...
        </Typography>
      )}

      {workouts?.length === 0 && (
        <Card variant="outlined" sx={{ p: 3 }}>
          <Typography color="text.secondary">
            No workouts recorded yet.{" "}
            <MuiLink component={Link} to="/routines">
              Choose a routine
            </MuiLink>{" "}
            to get started.
          </Typography>
        </Card>
      )}

      {workouts?.map((workout) => (
        <Card
          component="article"
          variant="outlined"
          className="workout-exercise"
          key={workout.id}
          sx={{ p: { xs: 2, sm: 3 }, mb: 3 }}
        >
          <Typography component="h2" variant="h6" sx={{ mb: 1 }}>
            {workout.routineName}
          </Typography>

          <Typography variant="body2" color="text.secondary">
            {new Date(workout.completedAtUtc).toLocaleString()}
          </Typography>

          {[...new Set(workout.sets.map((set) => set.exerciseId))].map(
            (exerciseId) => {
              const exerciseSets = workout.sets.filter(
                (set) => set.exerciseId === exerciseId
              );

              return (
                <Box
                  key={exerciseId}
                  className="history-exercise"
                  sx={{
                    mt: 2,
                    pt: 2,
                    borderTop: 1,
                    borderColor: "divider",
                  }}
                >
                  <Typography component="strong" sx={{ fontWeight: 600 }}>
                    {exerciseSets[0].exerciseName}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    {exerciseSets
                      .map((set) => `${set.reps} reps × ${set.weightKg} kg`)
                      .join(" · ")}
                  </Typography>
                </Box>
              );
            }
          )}
        </Card>
      ))}
    </Container>
  </Box>
);
}

export default WorkoutHistoryPage;
