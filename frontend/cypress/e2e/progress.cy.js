describe("Exercise progress", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/api/exercises", [
      { id: 1, name: "Bench Press" },
      { id: 3, name: "Lat Pulldown" },
      { id: 2, name: "Squat" },
    ]);
  });

  it("shows the workouts in chronological order", () => {
    cy.intercept("GET", "**/api/workouts", [
      {
        id: 2,
        routineName: "Upper body",
        completedAtUtc: "2026-09-30T12:00:00Z",
        sets: [
          {
            exerciseId: 1,
            exerciseName: "Bench Press",
            weightKg: 50,
          },
          {
            exerciseId: 1,
            exerciseName: "Bench Press",
            weightKg: 55,
          },
        ],
      },
      {
        id: 1,
        routineName: "Full body",
        completedAtUtc: "2026-09-28T12:00:00Z",
        sets: [
          {
            exerciseId: 1,
            exerciseName: "Bench Press",
            weightKg: 45,
          },
          {
            exerciseId: 2,
            exerciseName: "Squat",
            weightKg: 0,
          },
        ],
      },
    ]).as("getWorkouts");

    cy.visit("/progress");
    cy.wait("@getWorkouts");

    cy.get("#progress-exercise").should("have.value", "1");
    cy.get(".progress-chart circle").should("have.length", 2);

    cy.get(".progress-table tbody tr").should("have.length", 2);

    cy.get(".progress-table tbody tr")
      .first()
      .should("contain.text", "45 kg");

    cy.get(".progress-table tbody tr")
      .last()
      .should("contain.text", "55 kg");
  });

  it("shows the full library and handles exercises without logs", () => {
    cy.intercept("GET", "**/api/workouts", [
      {
        id: 1,
        routineName: "Full body",
        completedAtUtc: "2026-09-28T12:00:00Z",
        sets: [
          {
            exerciseId: 1,
            exerciseName: "Bench Press",
            weightKg: 45,
          },
          {
            exerciseId: 2,
            exerciseName: "Squat",
            weightKg: 0,
          },
        ],
      },
    ]);

    cy.visit("/progress");

    cy.get("#progress-exercise option").should("have.length", 3);
    cy.get("#progress-exercise").select("Lat Pulldown");

    cy.contains("No progress recorded yet for Lat Pulldown")
      .should("be.visible");

    cy.get(".progress-chart").should("not.exist");
    cy.contains("Highest logged:").should("not.exist");

    cy.get("#progress-exercise").select("Squat");

    cy.get(".progress-chart circle").should("have.length", 1);

    cy.get(".progress-table tbody tr")
      .should("have.length", 1)
      .and("contain.text", "0 kg");

    cy.contains("Log another workout").should("be.visible");
  });

  it("shows an empty state when there are no saved workouts", () => {
    cy.intercept("GET", "**/api/workouts", []);

    cy.visit("/progress");

    cy.get("#progress-exercise option").should("have.length", 3);

    cy.contains("No progress recorded yet for Bench Press")
      .should("be.visible");

    cy.get(".progress-chart").should("not.exist");
  });

  it("shows an error when workout history cannot be loaded", () => {
    cy.intercept("GET", "**/api/workouts", {
      statusCode: 500,
      body: {},
    });

    cy.visit("/progress");

    cy.get('[role="alert"]')
      .should("contain.text", "Unable to load workout history.");
  });

  it("shows an error when the exercise library cannot be loaded", () => {
    cy.intercept("GET", "**/api/workouts", []);

    cy.intercept("GET", "**/api/exercises", {
      statusCode: 500,
      body: {},
    });

    cy.visit("/progress");

    cy.get('[role="alert"]')
      .should("contain.text", "Unable to load exercises.");
  });
});