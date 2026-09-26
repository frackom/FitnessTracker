using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace FitnessTracker.Api.Migrations
{
    /// <inheritdoc />
    public partial class SeedAdditionalExercises : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Exercises",
                columns: new[] { "Id", "Description", "ImageUrl", "MuscleGroup", "Name" },
                values: new object[,]
                {
                    { 3, "Cable pulling exercise", "/assets/ExerciseImages/latpulldown.jpg", "Back", "Lat Pulldown" },
                    { 4, "Machine chest exercise", "/assets/ExerciseImages/chestfly.jpg", "Chest", "Chest Fly" },
                    { 5, "Machine lower-body exercise", "/assets/ExerciseImages/legpress.jpg", "Legs", "Leg Press" }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DeleteData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: 3);

            migrationBuilder.DeleteData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: 4);

            migrationBuilder.DeleteData(
                table: "Exercises",
                keyColumn: "Id",
                keyValue: 5);
        }
    }
}
