const exercises = [
  {
    id: 1,
    name: "Bench Press",
    muscleGroup: "Chest",
    description: "A chest exercise.",
  },
  {
    id: 2,
    name: "Squat",
    muscleGroup: "Legs",
    description: "A leg exercise.",
  },
];

const routine = {
  id: 12,
  name: "Strength",
  description: "Full body workout",
  exercises: [
    {
      exerciseId: 1,
      name: "Bench Press",
      muscleGroup: "Chest",
      position: 1,
      targetSets: 3,
      targetReps: 8,
    },
  ],
};

function addExercise(name) {
  cy.contains(".exercise-card", name).within(() => {
    cy.contains("button", "Add exercise").click();
  });
}

function visitBuilder(path = "/routines/create") {
  cy.visit(path);
  cy.wait("@getExercises");
  cy.contains("h2", "Available exercises").should("be.visible");
}

describe("Routines", () => {
  beforeEach(() => {
    cy.mockAuth();
    
    cy.intercept("GET", "**/api/exercises", exercises)
      .as("getExercises");

    cy.intercept("GET", "**/api/routines", [routine])
      .as("getRoutines");

    cy.intercept("GET", "**/api/routines/12", routine)
      .as("getRoutine");
  });

  it("lists saved routines and opens their details", () => {
    cy.visit("/routines");
    cy.wait("@getRoutines");

    cy.contains(".routine-card", "Strength").within(() => {
      cy.contains("Full body workout").should("be.visible");
      cy.contains("Bench Press").should("be.visible");
      cy.contains("1 exercise").should("be.visible");
      cy.contains("a", "View routine").click();
    });

    cy.wait("@getRoutine");
    cy.location("pathname").should("eq", "/routines/12");
    cy.contains("h1", "Strength").should("be.visible");
    cy.contains(".routine-details-exercise", "Bench Press")
      .should("contain.text", "3 × 8");
  });

  it("shows an empty state and links to routine creation", () => {
    cy.intercept("GET", "**/api/routines", [])
      .as("emptyRoutines");

    cy.visit("/routines");
    cy.wait("@emptyRoutines");

    cy.contains("No routines yet").should("be.visible");
    cy.contains("a", "Create your first routine").click();

    cy.location("pathname").should("eq", "/routines/create");
    cy.contains("h1", "Create a routine").should("be.visible");
  });

  it("creates a routine with the selected sets and reps", () => {
    cy.intercept("POST", "**/api/routines", (request) => {
      expect(request.body).to.deep.equal({
        name: "Upper body",
        description: "Chest training",
        exercises: [
          {
            exerciseId: 1,
            targetSets: 4,
            targetReps: 10,
          },
        ],
      });

      request.reply({
        statusCode: 201,
        body: { id: 20, name: "Upper body" },
      });
    }).as("createRoutine");

    visitBuilder();

    cy.getInputByLabel("Routine name").type("Upper body");
    cy.getInputByLabel("Description").type("Chest training");

    addExercise("Bench Press");

    cy.contains(".selected-exercise", "Bench Press")
      .within(() => {
        cy.getInputByLabel("Sets")
            .type("{selectall}4")
            .should("have.value", "4");
        cy.getInputByLabel("Reps")
        .type("{selectall}10")
        .should("have.value", "10");
      });

    cy.contains("button", "Save routine").click();
    cy.wait("@createRoutine");

    cy.contains("Upper body was created successfully.")
      .should("be.visible");

    cy.getInputByLabel("Routine name").should("have.value", "");
    cy.getInputByLabel("Description").should("have.value", "");
    cy.contains("No exercises selected.").should("be.visible");
  });

  it("prevents duplicate exercises and allows removing them", () => {
    visitBuilder();

    addExercise("Bench Press");

    cy.contains(".exercise-card", "Bench Press")
      .within(() => {
        cy.contains("button", "Added").should("be.disabled");
      });

    cy.get(".selected-exercise").should("have.length", 1);

    cy.contains(".selected-exercise", "Bench Press")
      .within(() => {
        cy.contains("button", "Remove").click();
      });

    cy.get(".selected-exercise").should("not.exist");
    cy.contains("No exercises selected.").should("be.visible");

    cy.contains(".exercise-card", "Bench Press")
      .within(() => {
        cy.contains("button", "Add exercise")
          .should("not.be.disabled");
      });
  });

  it("rejects a whitespace-only name without sending a request", () => {
    cy.intercept("POST", "**/api/routines", cy.stub()
      .as("createRequest"));

    visitBuilder();

    // Spaces satisfy HTML's required check, but fail name.trim().
    cy.getInputByLabel("Routine name").type("   ");
    addExercise("Bench Press");

    cy.contains("button", "Save routine").click();

    cy.contains('[role="alert"]', "Enter a routine name.")
      .should("be.visible");

    cy.get("@createRequest").should("not.have.been.called");
  });

  it("requires at least one exercise", () => {
    cy.intercept("POST", "**/api/routines", cy.stub()
      .as("createRequest"));

    visitBuilder();

    cy.getInputByLabel("Routine name").type("Empty routine");
    cy.contains("button", "Save routine").click();

    cy.contains('[role="alert"]', "Add at least one exercise.")
      .should("be.visible");

    cy.get("@createRequest").should("not.have.been.called");
  });

  it("edits an existing routine and opens the updated details", () => {
    const updatedRoutine = {
      ...routine,
      name: "Leg day",
      description: "Updated training plan",
      exercises: [
        {
          exerciseId: 2,
          name: "Squat",
          muscleGroup: "Legs",
          position: 1,
          targetSets: 4,
          targetReps: 6,
        },
      ],
    };

    cy.intercept("PUT", "**/api/routines/12", (request) => {
      expect(request.body).to.deep.equal({
        name: "Leg day",
        description: "Updated training plan",
        exercises: [
          {
            exerciseId: 2,
            targetSets: 4,
            targetReps: 6,
          },
        ],
      });

      request.reply({
        statusCode: 200,
        body: updatedRoutine,
      });
    }).as("updateRoutine");

    visitBuilder("/routines/12/edit");
    cy.wait("@getRoutine");

    cy.getInputByLabel("Routine name")
      .should("have.value", "Strength")
      .clear()
      .type("Leg day");

    cy.getInputByLabel("Description")
      .clear()
      .type("Updated training plan");

    cy.contains(".selected-exercise", "Bench Press")
      .within(() => {
        cy.contains("button", "Remove").click();
      });

    addExercise("Squat");

    cy.contains(".selected-exercise", "Squat").within(() => {
      cy.getInputByLabel("Sets")
        .type("{selectall}4")
        .should("have.value", "4");
      cy.getInputByLabel("Reps")
        .type("{selectall}6")
        .should("have.value", "6");
    });

    // The details page should receive the updated routine.
    cy.intercept("GET", "**/api/routines/12", updatedRoutine)
      .as("getUpdatedRoutine");

    cy.contains("button", "Update Routine").click();
    cy.wait("@updateRoutine");
    cy.wait("@getUpdatedRoutine");

    cy.location("pathname").should("eq", "/routines/12");
    cy.contains("h1", "Leg day").should("be.visible");

    cy.contains(".routine-details-exercise", "Squat")
      .should("contain.text", "4 × 6");

    cy.get(".routine-details-exercise")
      .should("not.contain.text", "Bench Press");
  });

  it("keeps the routine when deletion is cancelled", () => {
    cy.intercept("DELETE", "**/api/routines/12", cy.stub()
      .as("deleteRequest"));

    cy.visit("/routines/12");
    cy.wait("@getRoutine");

    cy.contains("button", "Delete routine").click();

    cy.get('[role="dialog"]').within(() => {
      cy.contains("Delete routine?").should("be.visible");

      cy.contains('Are you sure you want to delete "Strength"?')
        .should("be.visible");

      cy.contains("button", /^Cancel$/).click();
    });

    cy.get('[role="dialog"]').should("not.exist");
    cy.location("pathname").should("eq", "/routines/12");
    cy.contains("h1", "Strength").should("be.visible");
    cy.get("@deleteRequest").should("not.have.been.called");
  });

  it("deletes the routine after confirmation", () => {
    cy.intercept("DELETE", "**/api/routines/12", {
      statusCode: 204,
    }).as("deleteRoutine");

    cy.intercept("GET", "**/api/routines", [])
      .as("remainingRoutines");

    cy.visit("/routines/12");
    cy.wait("@getRoutine");

    cy.contains("button", "Delete routine").click();

    cy.get('[role="dialog"]').within(() => {
      cy.contains("button", /^Delete$/).click();
    });

    cy.wait("@deleteRoutine");
    cy.location("pathname").should("eq", "/routines");
    cy.wait("@remainingRoutines");

    cy.get('[role="dialog"]').should("not.exist");
    cy.contains("No routines yet").should("be.visible");
  });

  it("shows a deletion error and allows retrying", () => {
    cy.intercept("DELETE", "**/api/routines/12", {
      statusCode: 500,
      body: {},
    }).as("failedDelete");

    cy.visit("/routines/12");
    cy.wait("@getRoutine");

    cy.contains("button", "Delete routine").click();

    cy.get('[role="dialog"]').within(() => {
      cy.contains("button", /^Delete$/).click();
    });

    cy.wait("@failedDelete");

    cy.get('[role="dialog"]').within(() => {
      cy.contains('[role="alert"]', "Unable to delete the routine.")
        .should("be.visible");

      cy.contains("button", /^Delete$/)
        .should("not.be.disabled");

      cy.contains("button", /^Cancel$/)
        .should("not.be.disabled");
    });

    cy.location("pathname").should("eq", "/routines/12");

    cy.intercept("DELETE", "**/api/routines/12", {
      statusCode: 204,
    }).as("retryDelete");

    cy.intercept("GET", "**/api/routines", [])
      .as("remainingRoutines");

    cy.get('[role="dialog"]').within(() => {
      cy.contains("button", /^Delete$/).click();
    });

    cy.wait("@retryDelete");
    cy.location("pathname").should("eq", "/routines");
    cy.wait("@remainingRoutines");

    cy.contains("No routines yet").should("be.visible");
  });

  it("preserves form data when creation fails", () => {
    cy.intercept("POST", "**/api/routines", {
      statusCode: 500,
      body: { message: "Unable to save right now." },
    }).as("failedCreate");

    visitBuilder();

    cy.getInputByLabel("Routine name").type("Upper body");
    cy.getInputByLabel("Description").type("Chest training");
    addExercise("Bench Press");

    cy.contains("button", "Save routine").click();
    cy.wait("@failedCreate");

    cy.contains('[role="alert"]', "Unable to save right now.")
      .should("be.visible");

    cy.getInputByLabel("Routine name")
      .should("have.value", "Upper body");

    cy.getInputByLabel("Description")
      .should("have.value", "Chest training");

    cy.contains(".selected-exercise", "Bench Press")
      .should("be.visible");

    cy.contains("button", "Save routine")
      .should("not.be.disabled");
  });

  it("preserves edited data when updating fails", () => {
    cy.intercept("PUT", "**/api/routines/12", {
      statusCode: 500,
      body: { message: "Unable to update right now." },
    }).as("failedUpdate");

    visitBuilder("/routines/12/edit");
    cy.wait("@getRoutine");

    cy.getInputByLabel("Routine name").clear().type("New name");
    cy.contains("button", "Update Routine").click();
    cy.wait("@failedUpdate");

    cy.contains('[role="alert"]', "Unable to update right now.")
      .should("be.visible");

    cy.location("pathname").should("eq", "/routines/12/edit");
    cy.getInputByLabel("Routine name").should("have.value", "New name");

    cy.contains("button", "Update Routine")
      .should("not.be.disabled");
  });

  it("shows an error when routines cannot be loaded", () => {
    cy.intercept("GET", "**/api/routines", {
      statusCode: 500,
      body: {},
    }).as("failedList");

    cy.visit("/routines");
    cy.wait("@failedList");

    cy.contains("Unable to load routines.")
      .should("be.visible");
  });

  it("shows an error when routine details cannot be loaded", () => {
    cy.intercept("GET", "**/api/routines/12", {
      statusCode: 500,
      body: {},
    }).as("failedDetails");

    cy.visit("/routines/12");
    cy.wait("@failedDetails");

    cy.contains("h1", "Unable to load routine")
      .should("be.visible");

    cy.contains('[role="alert"]', "Unable to load the routine.")
      .should("be.visible");
  });
});