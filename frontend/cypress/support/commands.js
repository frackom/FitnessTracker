Cypress.Commands.add("getInputByLabel", (labelText) => {
  return cy.contains("label", labelText).then(($label) => {
    const inputId = $label.attr("for");

    expect(inputId, "label is linked to an input")
      .to.be.a("string");

    return cy.get(`#${CSS.escape(inputId)}`);
  });
});

Cypress.Commands.add(
  "mockAuth",
  (initialUser = {
    id: "test-user-1",
    email: "test@example.com",
  }) => {
    let currentUser = initialUser;

    cy.intercept("GET", "**/api/auth/me", (request) => {
      request.reply({
        statusCode: currentUser ? 200 : 401,
        body: currentUser ?? {},
        headers: {
          "cache-control": "no-store",
        },
      });
    }).as("getCurrentUser");

    cy.intercept("GET", "**/api/auth/csrf", {
      statusCode: 200,
      body: {
        csrfToken: "test-csrf-token",
      },
    }).as("getCsrfToken");

    cy.intercept("POST", "**/api/auth/register", (request) => {
      expect(request.headers["x-csrf-token"])
        .to.equal("test-csrf-token");

      request.reply({
        statusCode: 201,
        body: {
          message: "Account created. You can now log in.",
        },
      });
    }).as("register");

    cy.intercept("POST", "**/api/auth/login", (request) => {
      expect(request.headers["x-csrf-token"])
        .to.equal("test-csrf-token");

      currentUser = {
        id: "test-user-1",
        email: request.body.email,
      };

      request.reply({
        statusCode: 200,
        body: {
          message: "Logged in successfully.",
        },
      });
    }).as("login");

    cy.intercept("POST", "**/api/auth/logout", (request) => {
      expect(request.headers["x-csrf-token"])
        .to.equal("test-csrf-token");

      currentUser = null;

      request.reply({
        statusCode: 204,
      });
    }).as("logout");
  }
);