import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Alert, Box, Button, Card, CardActions,
  CardContent, Chip, CircularProgress, 
  Container, Stack, Typography,
} from "@mui/material";
import { getRoutines } from "../services/routinesApi.js";

function RoutinesPage() {
  const [routines, setRoutines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadRoutines() {
      try {
        const data = await getRoutines();
        if (active) setRoutines(data);
      } catch (requestError) {
        if (active) setError(requestError.message);
      } finally {
        if (active) setIsLoading(false);
      }
    }

    loadRoutines();

    return () => {
      active = false;
    };
  }, []);

  return (
    <Box
      sx={{
        bgcolor: "background.default",
        color: "text.primary",
        minHeight: "calc(100vh - 64px)",
      }}
    >
      <Container
        component="main"
        className="routines-page"
        maxWidth="lg"
        sx={{ py: { xs: 3, md: 6 } }}
      >
        <Stack
          component="header"
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={3}
          sx={{ mb: 4 }}
        >
          <Box>
            <Typography component="h1" variant="h4">
              My Routines
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 1.5 }}>
              View and manage your saved workout routines.
            </Typography>
          </Box>

          <Button
            component={Link}
            to="/routines/create"
            variant="outlined"
            className="routines-create-link"
            startIcon={<span aria-hidden="true">+</span>}
            sx={{
              flexShrink: 0,
              px: 2.5,
              py: 1.2,
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
            }}
          >
            Create routine
          </Button>
        </Stack>

        {isLoading ? (
          <Stack
            role="status"
            alignItems="center"
            spacing={2}
            sx={{ py: 8 }}
          >
            <CircularProgress size={32} />
            <Typography color="text.secondary">
              Loading routines...
            </Typography>
          </Stack>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : routines.length === 0 ? (
          <Card
            component="section"
            variant="outlined"
            className="routines-empty"
            sx={{ p: { xs: 3, md: 6 }, textAlign: "center" }}
          >
            <Typography component="h2" variant="h5">
              No routines yet
            </Typography>

            <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
              Create your first routine by selecting exercises.
            </Typography>

            <Button
              component={Link}
              to="/routines/create"
              variant="contained"
            >
              Create your first routine
            </Button>
          </Card>
        ) : (
          <Box
            component="section"
            className="routines-grid"
            aria-label="Saved routines"
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, minmax(0, 1fr))",
              },
              gap: 3,
            }}
          >
            {routines.map((routine) => (
              <Card
                component="article"
                variant="outlined"
                className="routine-card"
                key={routine.id}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  minWidth: 0,
                }}
              >
                <CardContent sx={{ p: 3, flexGrow: 1 }}>
                  <Typography
                    component="h2"
                    variant="h5"
                    sx={{ overflowWrap: "anywhere", mb: 1.5 }}
                  >
                    {routine.name}
                  </Typography>

                  {routine.description && (
                    <Typography
                      className="routine-card-description"
                      color="text.secondary"
                      sx={{ mb: 2, overflowWrap: "anywhere" }}
                    >
                      {routine.description}
                    </Typography>
                  )}

                  <Chip
                    className="routine-card-count"
                    label={`${routine.exercises.length} ${
                      routine.exercises.length === 1
                        ? "exercise"
                        : "exercises"
                    }`}
                    variant="outlined"
                    size="small"
                  />

                  <Box
                    component="ul"
                    className="routine-card-exercises"
                    sx={{ listStyle: "none", p: 0, mt: 2, mb: 0 }}
                  >
                    {routine.exercises.map((exercise) => (
                      <Box
                        component="li"
                        key={exercise.exerciseId}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: 2,
                          py: 1.5,
                          borderBottom: 1,
                          borderColor: "divider",
                        }}
                      >
                        <Typography
                          component="span"
                          variant="body2"
                          sx={{ minWidth: 0, overflowWrap: "anywhere" }}
                        >
                          {exercise.name}
                        </Typography>

                        <Typography
                          component="span"
                          variant="body2"
                          color="text.secondary"
                          sx={{ flexShrink: 0 }}
                        >
                          {exercise.targetSets} × {exercise.targetReps}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </CardContent>

                <CardActions sx={{ px: 3, pb: 3, pt: 0 }}>
                  <Button
                    component={Link}
                    className="routine-card-link"
                    to={`/routines/${routine.id}`}
                    variant="outlined"
                    fullWidth
                  >
                    View routine
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        )}
      </Container>
    </Box>
  );
}

export default RoutinesPage;