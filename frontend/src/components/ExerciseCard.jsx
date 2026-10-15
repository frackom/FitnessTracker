import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Typography,
} from "@mui/material";

function ExerciseCard({ exercise, action }) {
  return (
    <Card
      component="article"
      variant="outlined"
      className="exercise-card"
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CardMedia
        component="img"
        className="exercise-card-image"
        image={
          exercise.imageUrl ||
          "/images/exercises/exercise-placeholder.jpg"
        }
        alt={`${exercise.name} demonstration`}
        sx={{
          height: { xs: 220, sm: 280 },
          objectFit: "cover",
        }}
      />

      <CardContent
        className="exercise-card-content"
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
        }}
      >
        <Typography component="h2" variant="h6">
          {exercise.name}
        </Typography>

        <Chip
          className="exercise-card-muscle"
          label={exercise.muscleGroup}
          variant="outlined"
          size="small"
          sx={{ alignSelf: "flex-start" }}
        />

        {exercise.description && (
          <Typography
            className="exercise-card-description"
            variant="body2"
            color="text.secondary"
          >
            {exercise.description}
          </Typography>
        )}

        {action && (
          <Box
            className="exercise-card-action"
            sx={{ mt: "auto", pt: 1 }}
          >
            {action}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}

export default ExerciseCard;