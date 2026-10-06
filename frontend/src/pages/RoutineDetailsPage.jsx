import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Alert, Avatar, Box, Button, Card, Chip, CircularProgress,
  Container, Stack, Typography,
} from "@mui/material";
import { getRoutineById, deleteRoutine } from "../services/routinesApi.js";

function RoutineDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [routine, setRoutine] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadRoutine() {
      try {
        setIsLoading(true);
        setError("");
        const data = await getRoutineById(id);
        if (active) setRoutine(data);
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadRoutine();
    return () => { active = false; };
  }, [id]);

  async function handleDelete() {
    if (!window.confirm(`Are you sure you want to delete "${routine.name}"?`)) {
      return;
    }

    try {
      setIsDeleting(true);
      setDeleteError("");
      await deleteRoutine(routine.id);
      navigate("/routines");
    } catch (requestError) {
      setDeleteError(requestError.message);
      setIsDeleting(false);
    }
  }

  const orderedExercises = [...(routine?.exercises ?? [])].sort(
    (a, b) => a.position - b.position
  );
  const totalSets = orderedExercises.reduce(
    (total, exercise) => total + exercise.targetSets, 0
  );

  return (
    <Box sx={{ bgcolor: "background.default", color: "text.primary", minHeight: "calc(100vh - 64px)" }}>
      <Container component="main" className="routine-details-page" maxWidth="md" sx={{ py: { xs: 3, md: 6 } }}>
        {isLoading ? (
          <Stack role="status" alignItems="center" spacing={2} sx={{ py: 8 }}>
            <CircularProgress size={32} />
            <Typography color="text.secondary">Loading routine...</Typography>
          </Stack>
        ) : error ? (
          <Stack spacing={3}>
            <Typography component="h1" variant="h4">Unable to load routine</Typography>
            <Alert severity="error">{error}</Alert>
            <Button component={Link} to="/routines" sx={{ alignSelf: "flex-start" }}>Back to routines</Button>
          </Stack>
        ) : routine ? (
          <>
            <Button component={Link} to="/routines" className="routine-details-back" sx={{ mb: 3 }}>
              ← Back to routines
            </Button>

            <Stack component="header" spacing={3} sx={{ mb: 4 }}>
              <Box>
                <Typography variant="overline" color="primary.main">Your training plan</Typography>
                <Typography component="h1" variant="h4" sx={{ overflowWrap: "anywhere" }}>{routine.name}</Typography>
                {routine.description && (
                  <Typography color="text.secondary" sx={{ mt: 1.5, overflowWrap: "anywhere" }}>{routine.description}</Typography>
                )}
              </Box>

              <Stack className="routine-details-actions" direction="row" useFlexGap flexWrap="wrap" spacing={1.5}>
                <Button component={Link} variant="contained" className="routine-details-start"
                  to={`/routines/${routine.id}/workout`} disabled={isDeleting}>
                  Start workout
                </Button>
                <Button component={Link} variant="outlined" className="routine-details-edit"
                  to={`/routines/${routine.id}/edit`} disabled={isDeleting}>
                  Edit routine
                </Button>
                <Button variant="text" color="error" className="routine-details-delete"
                  disabled={isDeleting} onClick={handleDelete}>
                  {isDeleting ? "Deleting..." : "Delete routine"}
                </Button>
              </Stack>
            </Stack>

            {deleteError && <Alert severity="error" sx={{ mb: 3 }}>{deleteError}</Alert>}

            <Stack className="routine-details-summary" direction="row" spacing={1} sx={{ mb: 3 }}>
              <Chip label={`${orderedExercises.length} ${orderedExercises.length === 1 ? "exercise" : "exercises"}`} variant="outlined" />
              <Chip label={`${totalSets} target sets`} variant="outlined" />
            </Stack>

            <Typography component="h2" variant="h6" sx={{ mb: 2 }}>Exercise plan</Typography>
            <Stack component="section" className="routine-details-exercises" spacing={2}>
              {orderedExercises.map((exercise, index) => (
                <Card component="article" variant="outlined" className="routine-details-exercise" key={exercise.exerciseId}
                  sx={{ display: "grid", gridTemplateColumns: { xs: "auto 1fr", sm: "auto 1fr auto" }, alignItems: "center", gap: 2, p: { xs: 2, sm: 2.5 } }}>
                  <Avatar sx={{ bgcolor: "primary.main", color: "primary.contrastText", width: 32, height: 32, fontSize: "0.9rem" }}>
                    {index + 1}
                  </Avatar>
                  <Stack direction="row" alignItems="center" spacing={2} sx={{ minWidth: 0 }}>
                    {exercise.imageUrl && (
                      <Box component="img" src={exercise.imageUrl} alt={exercise.name}
                        sx={{ width: { xs: 64, sm: 100 }, height: { xs: 64, sm: 80 }, objectFit: "cover", borderRadius: 1, flexShrink: 0 }} />
                    )}
                    <Box sx={{ minWidth: 0 }}>
                      <Typography component="h3" variant="h6" sx={{ fontSize: "1.05rem", overflowWrap: "anywhere" }}>{exercise.name}</Typography>
                      <Typography variant="body2" color="text.secondary">{exercise.muscleGroup}</Typography>
                    </Box>
                  </Stack>
                  <Box className="routine-details-target" sx={{ gridColumn: { xs: "2", sm: "auto" }, textAlign: { xs: "left", sm: "right" } }}>
                    <Typography variant="caption" color="text.secondary">Target</Typography>
                    <Typography variant="h6">{exercise.targetSets} × {exercise.targetReps}</Typography>
                    <Typography variant="caption" color="text.secondary">sets × reps</Typography>
                  </Box>
                </Card>
              ))}
            </Stack>
          </>
        ) : null}
      </Container>
    </Box>
  );
}

export default RoutineDetailsPage;
