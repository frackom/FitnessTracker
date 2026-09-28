import "../styles/ExerciseCard.css";

function ExerciseCard({ exercise, action }) {
  return (
    <article className="exercise-card">
      <img
        className="exercise-card-image"
        src={
          exercise.imageUrl ||
          "/images/exercises/exercise-placeholder.jpg"
        }
        alt={`${exercise.name} demonstration`}
      />

      <div className="exercise-card-content">
        <h2>{exercise.name}</h2>

        <p className="exercise-card-muscle">
          {exercise.muscleGroup}
        </p>

        {exercise.description && (
          <p className="exercise-card-description">
            {exercise.description}
          </p>
        )}

        {action && (
          <div className="exercise-card-action">
            {action}
          </div>
        )}
      </div>
    </article>
  );
}

export default ExerciseCard;