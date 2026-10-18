using FitnessTracker.Api.Data;
using FitnessTracker.Api.Models;
using FitnessTracker.Api.Requests;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace FitnessTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[AutoValidateAntiforgeryToken]
public class WorkoutsController(FitnessTrackerDbContext context) : ControllerBase
{

    private string CurrentUserId =>
    User.FindFirstValue(ClaimTypes.NameIdentifier)
    ?? throw new InvalidOperationException(
        "The authenticated user has no user ID.");

    [HttpGet]
    public async Task<ActionResult> GetWorkouts()
    {
        var workouts = await context.Workouts.AsNoTracking()
            .Where(workout => workout.UserId == CurrentUserId)
            .OrderByDescending(workout => workout.CompletedAtUtc)
            .ThenByDescending(workout => workout.Id)
            .Select(workout => new
            {
                workout.Id,
                workout.RoutineName,
                workout.CompletedAtUtc,
                Sets = workout.Sets.OrderBy(set => set.ExercisePosition)
                    .ThenBy(set => set.SetNumber)
                    .Select(set => new
                    {
                        set.ExerciseId,
                        set.ExerciseName,
                        set.ExercisePosition,
                        set.SetNumber,
                        set.Reps,
                        set.WeightKg
                    }).ToList()
            }).ToListAsync();
        return Ok(workouts);
    }

    [HttpPost]
    public async Task<ActionResult> CompleteWorkout(CompleteWorkoutRequest request)
    {
        var routine = await context.Routines.AsNoTracking()
            .Include(item => item.RoutineExercises)
            .ThenInclude(item => item.Exercise)
            .SingleOrDefaultAsync(item =>
                item.Id == request.RoutineId &&
                item.UserId == CurrentUserId);
        if (routine is null) return NotFound(new { message = "Routine not found." });

        var exercises = routine.RoutineExercises.ToDictionary(item => item.ExerciseId);
        if (request.Sets.Any(set => !exercises.ContainsKey(set.ExerciseId)))
            return BadRequest(new { message = "A set contains an exercise outside this routine." });
        if (request.Sets.GroupBy(set => new { set.ExerciseId, set.SetNumber })
            .Any(group => group.Count() > 1))
            return BadRequest(new { message = "Set numbers must be unique for each exercise." });

        var workout = new Workout
        {
            UserId = CurrentUserId,
            RoutineId = routine.Id,
            RoutineName = routine.Name,
            CompletedAtUtc = DateTime.UtcNow,
            Sets = request.Sets.Select(set => new WorkoutSet
            {
                ExerciseId = set.ExerciseId,
                ExerciseName = exercises[set.ExerciseId].Exercise.Name,
                ExercisePosition = exercises[set.ExerciseId].Position,
                SetNumber = set.SetNumber,
                Reps = set.Reps,
                WeightKg = set.WeightKg
            }).ToList()
        };
        context.Workouts.Add(workout);
        await context.SaveChangesAsync();
        return Created($"/api/workouts/{workout.Id}", new { workout.Id, workout.CompletedAtUtc });
    }
}
