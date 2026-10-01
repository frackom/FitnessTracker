const routine = {
  id: 12,
  name: "Strength",
  description: "Full body workout",
  exercises: [
    { exerciseId: 1, name: "Bench Press", position: 1, targetSets: 2, targetReps: 8 },
    { exerciseId: 2, name: "Squat", position: 2, targetSets: 1, targetReps: 6 },
  ],
};

describe("Workout logging", () => {
  it("saves only completed sets and shows them in history", () => {
    cy.intercept("GET", "**/api/routines/12", routine).as("getRoutine");
    cy.intercept("POST", "**/api/workouts", (request) => {
      expect(request.body).to.deep.equal({
        routineId: 12,
        sets: [
          { exerciseId: 1, setNumber: 1, reps: 7, weightKg: 42.5 },
          { exerciseId: 2, setNumber: 1, reps: 6, weightKg: 0 },
        ],
      });
      request.reply({ statusCode: 201, body: { id: 42, completedAtUtc: "2026-09-29T10:00:00Z" } });
    }).as("saveWorkout");
    cy.intercept("GET", "**/api/workouts", [{
      id: 42,
      routineName: "Strength",
      completedAtUtc: "2026-09-29T10:00:00Z",
      sets: [
        { exerciseId: 1, exerciseName: "Bench Press", exercisePosition: 1, setNumber: 1, reps: 7, weightKg: 42.5 },
        { exerciseId: 2, exerciseName: "Squat", exercisePosition: 2, setNumber: 1, reps: 6, weightKg: 0 },
      ],
    }]).as("getWorkouts");

    cy.visit("/routines/12/workout");
    cy.wait("@getRoutine");
    cy.get('input[type="checkbox"]').should("not.exist");
    cy.get('.workout-set input[type="number"]').should((inputs) => {
      Array.from(inputs).forEach((input) => expect(input.value).to.equal(""));
    });
    cy.contains("h1", "Strength").should("be.visible");

    cy.contains(".workout-exercise", "Bench Press").within(() => {
      cy.get(".workout-set").first().within(() => {
        cy.contains("label", "Reps").find("input").clear().type("7");
        cy.contains("label", "Weight (kg)").find("input").type("42.5");
      });
    });
    cy.contains(".workout-exercise", "Squat").within(() => {
      cy.contains("label", "Reps").find("input").type("6");
      cy.contains("label", "Weight (kg)").find("input").type("0");
    });
    cy.contains("button", "Complete workout").click();
    cy.wait("@saveWorkout");
    cy.wait("@getWorkouts");
    cy.location("pathname").should("eq", "/workouts");
    cy.contains(".workout-exercise", "Strength")
      .should("contain.text", "Bench Press")
      .and("contain.text", "7 reps × 42.5 kg")
      .and("contain.text", "Squat")
      .and("contain.text", "6 reps × 0 kg");
  });

  it("requires a completed set before sending a request", () => {
    cy.intercept("GET", "**/api/routines/12", routine);
    cy.intercept("POST", "**/api/workouts", cy.stub().as("saveRequest"));
    cy.visit("/routines/12/workout");
    cy.contains(".workout-exercise", "Bench Press").find(".workout-set").first().within(() => {
      cy.contains("label", "Reps").find("input").type("0");
      cy.contains("label", "Weight (kg)").find("input").type("40");
    });
    cy.contains("button", "Complete workout").click();
    cy.contains('[role="alert"]', "Enter reps and weight for at least one set").should("be.visible");
    cy.get("@saveRequest").should("not.have.been.called");
  });

  it("shows a save error without losing entered sets", () => {
    cy.intercept("GET", "**/api/routines/12", routine);
    cy.intercept("POST", "**/api/workouts", {
      statusCode: 500,
      body: { message: "Unable to save right now." },
    }).as("saveWorkout");
    cy.visit("/routines/12/workout");
    cy.contains(".workout-exercise", "Bench Press").find(".workout-set").first().within(() => {
      cy.contains("label", "Reps").find("input").type("8");
      cy.contains("label", "Weight (kg)").find("input").type("50");
    });
    cy.contains("button", "Complete workout").click();
    cy.wait("@saveWorkout");
    cy.contains('[role="alert"]', "Unable to save right now.").should("be.visible");
    cy.contains(".workout-exercise", "Bench Press")
      .find('input[type="number"]')
      .eq(1)
      .should("have.value", "50");
  });
  it("requires weight when reps are entered", () => {
    cy.intercept("GET", "**/api/routines/12", routine);
    cy.intercept("POST", "**/api/workouts", cy.stub().as("saveRequest"));
    cy.visit("/routines/12/workout");
    cy.contains(".workout-exercise", "Bench Press").find(".workout-set").first().within(() => {
      cy.contains("label", "Reps").find("input").type("8");
    });
    cy.contains("button", "Complete workout").click();
    cy.contains('[role="alert"]', "Sets with reps need valid reps and weight").should("be.visible");
    cy.get("@saveRequest").should("not.have.been.called");
  });
});
