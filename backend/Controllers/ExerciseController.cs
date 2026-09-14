using FitnessTracker.Api.Models;
using Microsoft.AspNetCore.Mvc;

namespace FitnessTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExercisesController : ControllerBase
{
    private static readonly List<Exercise> Exercises =
    [
        new Exercise
        {
            Id = 1,
            Name = "Bench Press",
            MuscleGroup = "Chest",
            Description = "Barbell pressing exercise",
            ImageUrl = "/assets/ExerciseImages/chestpress.jpg"
        },
        new Exercise
        {
            Id = 2,
            Name = "Squat",
            MuscleGroup = "Legs",
            Description = "Compound lower-body exercise",
            ImageUrl = "/assets/ExerciseImages/squat.jpg"
        }
    ];

    [HttpGet]
    public ActionResult<IEnumerable<Exercise>> GetExercises()
    {
        return Ok(Exercises);
    }

    [HttpGet("{id:int}")]
    public ActionResult<Exercise> GetExercise(int id)
    {
        Exercise? exercise = Exercises.FirstOrDefault(
            exercise => exercise.Id == id
        );

        if (exercise is null)
        {
            return NotFound();
        }

        return Ok(exercise);
    }
}