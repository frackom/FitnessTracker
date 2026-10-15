Cypress.Commands.add("getInputByLabel", (labelText) => {
  return cy.contains("label", labelText).then(($label) => {
    const inputId = $label.attr("for");

    expect(inputId, "label is linked to an input")
      .to.be.a("string");

    return cy.get(`#${CSS.escape(inputId)}`);
  });
});