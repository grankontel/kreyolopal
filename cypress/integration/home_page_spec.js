function preventFormSubmitDefault(selector) {
  cy.get(selector).then((form$) => {
    form$.on('submit', (e) => {
      e.preventDefault()
    })
  })
}

describe('The Home Page', () => {
  it('successfully loads', () => {
    cy.visit('/') // change URL to match your dev URL
  })
})

describe('The Register Page', () => {
    it('successfully loads', () => {
      cy.visit('/register') // change URL to match your dev URL
    })
  })

describe('login', function () {
  it('what_it_does', function () {
    cy.viewport(1280, 647)

    cy.visit('/')

    cy.get(
      '.navbar > .navbar-menu > .navbar-end > .navbar-item > .is-outlined'
    ).click()
    cy.location('pathname').should('include', 'login')

    cy.get('.box > form > .field:nth-child(1) > .control > .input').click()

    cy.get('.box > form > .field:nth-child(1) > .control > .input').type(
      'thierry.malo@egzanp.com'
    )

    cy.get('.box > form > .field:nth-child(2) > .control > .input').type(
      'admin6'
    )

    preventFormSubmitDefault("form");
    cy.get('.container > .box > form > .buttons > .is-primary').click()
    cy.location('pathname').should('eq', '/')

    cy.get(
      '#app > .navbar > .navbar-menu > .navbar-end > .navbar-item:nth-child(2)'
    ).click()
    cy.location('pathname').should('include', 'account')

    cy.get(
      '.container > .section > .account_box > .buttons > .is-warning'
    ).click()
    cy.location('pathname').should('eq', '/')
  })
})
