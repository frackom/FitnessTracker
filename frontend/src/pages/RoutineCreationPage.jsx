import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getExercises } from "../services/exercisesApi";
import { createRoutine, getRoutineById, updateRoutine } from "../services/routinesApi";
import ExerciseCard from "../components/ExerciseCard.jsx";
import {
  Alert, Box, Button,
  Card, Container, Stack,
  TextField, Typography,
} from "@mui/material";

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
  <Box
  sx={{
    bgcolor: "background.default",
    color: "text.primary",
    minHeight: "calc(100vh - 64px)",
  }}>
    <Container
      component="main"
      className="routine-builder"
      maxWidth="lg"
      sx={{ py: { xs: 3, md: 6 } }}
    >
      <Box component="header" sx={{ mb: 4 }}>
        <Typography component="h1" variant="h4" sx={{ mb: 1.5 }}>
          {isEditing ? "Edit routine" : "Create a routine"}
        </Typography>

        <Typography color="text.secondary">
          Select exercises and choose the target sets and repetitions.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {successMessage && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        <Card
          component="section"
          variant="outlined"
          className="routine-details"
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 4,
            display: "grid",
            gap: 3,
          }}
        >
          <TextField
            label="Routine name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            fullWidth
            slotProps={{
              htmlInput: { maxLength: 100 },
            }}
          />

          <TextField
            label="Description"
            value={description}
            rows={3}
            multiline
            fullWidth
            onChange={(event) => setDescription(event.target.value)}
            slotProps={{
              htmlInput: { maxLength: 500 },
            }}
          />
        </Card>

        <Box component="section" sx={{ mb: 4 }}>
          <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
            Available exercises
          </Typography>

          {isLoading ? (
            <Typography color="text.secondary">
              Loading exercises...
            </Typography>
          ) : (
            <Box
              className="routine-exercise-grid"
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
              {availableExercises.map((exercise) => {
                const isSelected = selectedExercises.some(
                  (selected) => selected.exerciseId === exercise.id
                );

                return (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    action={
                      <Button
                        type="button"
                        variant="outlined"
                        fullWidth
                        disabled={isSelected}
                        onClick={() => addExercise(exercise)}
                      >
                        {isSelected ? "Added" : "Add exercise"}
                      </Button>
                    }
                  />
                );
              })}
            </Box>
          )}
        </Box>

        <Box component="section" sx={{ mb: 4 }}>
          <Typography component="h2" variant="h6" sx={{ mb: 2 }}>
            Selected exercises
          </Typography>

          {selectedExercises.length === 0 ? (
            <Typography color="text.secondary">
              No exercises selected.
            </Typography>
          ) : (
            <Stack className="selected-exercises" spacing={2}>
              {selectedExercises.map((exercise, index) => (
                <Card
                  component="article"
                  variant="outlined"
                  className="selected-exercise"
                  key={exercise.exerciseId}
                  sx={{
                    p: 2,
                    display: "grid",
                    gridTemplateColumns: {
                      xs: "1fr",
                      sm: "minmax(0, 1fr) 100px 100px auto",
                    },
                    alignItems: "center",
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography
                      component="span"
                      className="exercise-position"
                      color="primary.main"
                      sx={{ mr: 1, fontWeight: 700 }}
                    >
                      {index + 1}
                    </Typography>

                    <Typography
                      component="strong"
                      sx={{ fontWeight: 600 }}
                    >
                      {exercise.name}
                    </Typography>

                    <Typography
                      variant="body2"
                      color="text.secondary"
                    >
                      {exercise.muscleGroup}
                    </Typography>
                  </Box>

                  <TextField
                    label="Sets"
                    type="number"
                    size="small"
                    value={exercise.targetSets}
                    onChange={(event) =>
                      updateExercise(
                        exercise.exerciseId,
                        "targetSets",
                        event.target.value
                      )
                    }
                    slotProps={{
                      htmlInput: { min: 1, max: 20 },
                    }}
                  />

                  <TextField
                    label="Reps"
                    type="number"
                    size="small"
                    value={exercise.targetReps}
                    onChange={(event) =>
                      updateExercise(
                        exercise.exerciseId,
                        "targetReps",
                        event.target.value
                      )
                    }
                    slotProps={{
                      htmlInput: { min: 1, max: 100 },
                    }}
                  />

                  <Button
                    type="button"
                    color="error"
                    className="remove-button"
                    onClick={() =>
                      removeExercise(exercise.exerciseId)
                    }
                  >
                    Remove
                  </Button>
                </Card>
              ))}
            </Stack>
          )}
        </Box>

        <Button
          className="save-routine-button"
          type="submit"
          variant="contained"
          size="large"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Saving..."
            : isEditing
              ? "Update Routine"
              : "Save routine"}
        </Button>
      </form>
    </Container>
  </Box>
);
}

export default RoutineCreationPage;