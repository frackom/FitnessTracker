namespace FitnessTracker.Api.Responses;

public class RoutineResponse
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public List<RoutineExerciseResponse> Exercises { get; set; } = [];
}

public class RoutineExerciseResponse
{
    public int ExerciseId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string MuscleGroup { get; set; } = string.Empty;

    public string ImageUrl { get; set; } = string.Empty;

    public int Position { get; set; }

    public int TargetSets { get; set; }

    public int TargetReps { get; set; }
}