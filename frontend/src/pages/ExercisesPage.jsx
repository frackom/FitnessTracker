import { useEffect, useState } from "react";
import ExerciseCard from "../components/ExerciseCard.jsx";
import { getExercises } from "../services/exercisesApi.js";
import {
  Alert, Box,
  Container, Typography,
} from "@mui/material";

function ExercisesPage() {
  const [exercises, setExercises] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadExercises() {
      try {
        const data = await getExercises();
        setExercises(data);
      } catch (loadError) {
        setError(loadError.message);
      } finally {
        setIsLoading(false);
      }
    }

    loadExercises();
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
      maxWidth="lg"
      sx={{ py: { xs: 3, md: 6 } }}
    >
      <Typography component="h1" variant="h4" sx={{ mb: 3 }}>
        Exercise Library
      </Typography>

      {isLoading ? (
        <Typography role="status" color="text.secondary">
          Loading exercises...
        </Typography>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Box
          className="exercise-grid"
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, minmax(0, 1fr))",
              lg: "repeat(3, minmax(0, 1fr))",
            },
            gap: 3,
          }}
        >
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
            />
          ))}
        </Box>
      )}
    </Container>
  </Box>
);
}

export default ExercisesPage;