describe("Authentication", () => {
  beforeEach(() => {
    cy.mockAuth(null);

    cy.intercept("GET", "**/api/routines", {
      statusCode: 200,
      body: [],
    }).as("getRoutines");
  });

  function fillLogin(email = "test@example.com") {
    cy.getInputByLabel("Email").type(email);
    cy.getInputByLabel("Password")
      .type("TestAccount123!", { log: false });
  }

  it("redirects logged-out users to the welcome page", () => {
    cy.visit("/routines");

    cy.location("pathname").should("eq", "/");
    cy.contains("h2", "Welcome back.").should("be.visible");
    cy.contains("button", /^Log in/).should("be.visible");
  });

  it("registers an account and returns to the login form", () => {
    cy.visit("/");

    cy.contains("button", /^Create an account$/).click();

    cy.getInputByLabel("Email").type("new@example.com");
    cy.getInputByLabel(/^Password/)
      .type("TestAccount123!", { log: false });
    cy.getInputByLabel("Confirm password")
      .type("TestAccount123!", { log: false });

    cy.contains("button", /^Create account$/).click();

    cy.wait("@register").then(({ request }) => {
      expect(request.body).to.deep.equal({
        email: "new@example.com",
        password: "TestAccount123!",
      });
    });

    cy.contains(
      '[role="alert"]',
      "Account created. Log in with your email and password."
    ).should("be.visible");

    cy.contains("h2", "Welcome back.").should("be.visible");
    cy.getInputByLabel("Email")
      .should("have.value", "new@example.com");
    cy.getInputByLabel("Password").should("have.value", "");
    cy.get('input[name="confirmPassword"]').should("not.exist");

    // Creating an account should not log the user in.
    cy.location("pathname").should("eq", "/");
  });

  it("rejects mismatched passwords without registering", () => {
    cy.visit("/");

    cy.contains("button", /^Create an account$/).click();

    cy.getInputByLabel("Email").type("new@example.com");
    cy.getInputByLabel(/^Password/)
      .type("TestAccount123!", { log: false });
    cy.getInputByLabel("Confirm password")
      .type("DifferentPassword123!", { log: false });

    cy.contains("button", /^Create account$/).click();

    cy.contains('[role="alert"]', "Passwords do not match.")
      .should("be.visible");

    cy.get("@register.all").should("have.length", 0);
  });

  it("logs in and restores the session after refresh", () => {
    cy.visit("/");
    fillLogin();

    cy.contains("button", /^Log in/).click();

    cy.wait("@login").then(({ request }) => {
      expect(request.body).to.deep.equal({
        email: "test@example.com",
        password: "TestAccount123!",
        rememberMe: false,
      });
    });

    cy.location("pathname").should("eq", "/routines");
    cy.contains("test@example.com").should("be.visible");

    cy.reload();

    cy.location("pathname").should("eq", "/routines");
    cy.contains("test@example.com").should("be.visible");
    cy.contains("button", /^Log out$/).should("be.visible");
  });

  it("shows a login error and stays on the welcome page", () => {
    cy.intercept("POST", "**/api/auth/login", {
      statusCode: 401,
      body: {
        message:
          "Unable to log in. Check your details or try again later.",
      },
    }).as("failedLogin");

    cy.visit("/");
    fillLogin();

    cy.contains("button", /^Log in/).click();

    cy.wait("@failedLogin");

    cy.contains(
      '[role="alert"]',
      "Unable to log in. Check your details or try again later."
    ).should("be.visible");

    cy.location("pathname").should("eq", "/");
    cy.contains("button", /^Log in/)
      .should("not.be.disabled");
  });

  it("logs out and blocks access to protected pages", () => {
    cy.visit("/");
    fillLogin();

    cy.contains("button", /^Log in/).click();
    cy.wait("@login");

    cy.location("pathname").should("eq", "/routines");

    cy.contains("button", /^Log out$/).click();
    cy.wait("@logout");

    cy.location("pathname").should("eq", "/");
    cy.contains("h2", "Welcome back.").should("be.visible");

    cy.visit("/routines");

    cy.location("pathname").should("eq", "/");
    cy.contains("button", /^Log in/).should("be.visible");
  });

  it("redirects a signed-in user away from the welcome page", () => {
    cy.visit("/");
    fillLogin();

    cy.contains("button", /^Log in/).click();
    cy.wait("@login");

    cy.location("pathname").should("eq", "/routines");

    cy.visit("/");

    cy.location("pathname").should("eq", "/routines");
    cy.contains("test@example.com").should("be.visible");
  });

  it("shows a retry screen when the session check fails", () => {
    cy.intercept("GET", "**/api/auth/me", {
      statusCode: 500,
      body: {},
    }).as("failedSession");

    cy.visit("/");
    cy.wait("@failedSession");

    cy.contains(
      '[role="alert"]',
      "Unable to check your session."
    ).should("be.visible");

    cy.intercept("GET", "**/api/auth/me", {
      statusCode: 401,
      body: {},
    }).as("retriedSession");

    cy.contains("button", /^Retry$/).click();

    cy.wait("@retriedSession");
    cy.contains("h2", "Welcome back.").should("be.visible");
  });
});