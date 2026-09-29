describe("Exercise library", () => {
  it("displays exercises returned by the API", () => {
    cy.intercept("GET", "**/api/exercises", {
        fixture: "exercises.json",
    }).as("getExercises");

    cy.visit("/exercises");

    cy.wait("@getExercises");

    cy.contains("h1", "Exercise Library").should("be.visible");

    cy.get(".exercise-card").should("have.length", 5);

    const expectedExercises = [
        ["Bench Press", "Chest"],
        ["Squat", "Legs"],
        ["Lat Pulldown", "Back"],
        ["Chest Fly", "Chest"],
        ["Leg Press", "Legs"],
    ];

    expectedExercises.forEach(([name, muscleGroup]) => {
        cy.contains(".exercise-card", name)
        .should("be.visible")
        .and("contain.text", muscleGroup);
    });
    });

  it("displays an error when exercises cannot be loaded", () => {
    cy.intercept("GET", "**/api/exercises", {
      statusCode: 500,
      body: {},
    }).as("getExercisesFailure");

    cy.visit("/exercises");

    cy.wait("@getExercisesFailure");

    cy.contains("Unable to load exercises").should("be.visible");
  });
});