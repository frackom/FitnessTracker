using FitnessTracker.Api.Data;
using FitnessTracker.Api.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FitnessTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ExercisesController : ControllerBase
{

    private readonly FitnessTrackerDbContext _context;

    public ExercisesController(FitnessTrackerDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<Exercise>>> GetExercises()
    {
        List<Exercise> exercises =
            await _context.Exercises.ToListAsync();

        return Ok(exercises);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Exercise>> GetExercise(int id)
    {
        Exercise? exercise =
            await _context.Exercises.FindAsync(id);

        if (exercise is null)
        {
            return NotFound();
        }

        return Ok(exercise);
    }
}