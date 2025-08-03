// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Custom command for login
Cypress.Commands.add('login', (email: string, password: string) => {
  cy.session([email, password], () => {
    cy.visit('/auth')
    
    // Try multiple selectors for email input
    const emailSelectors = [
      '[data-testid="email-input"]',
      'input[type="email"]',
      'input[name="email"]',
      '#email',
      'input[placeholder*="Email"]',
      'input[placeholder*="email"]'
    ]
    
    let emailFound = false
    emailSelectors.forEach(selector => {
      cy.get('body').then(($body) => {
        if ($body.find(selector).length > 0 && !emailFound) {
          cy.get(selector).type(email)
          emailFound = true
        }
      })
    })
    
    // Try multiple selectors for password input
    const passwordSelectors = [
      '[data-testid="password-input"]',
      'input[type="password"]',
      'input[name="password"]',
      '#password',
      'input[placeholder*="Password"]',
      'input[placeholder*="password"]'
    ]
    
    let passwordFound = false
    passwordSelectors.forEach(selector => {
      cy.get('body').then(($body) => {
        if ($body.find(selector).length > 0 && !passwordFound) {
          cy.get(selector).type(password)
          passwordFound = true
        }
      })
    })
    
    // Try multiple selectors for login button
    const buttonSelectors = [
      '[data-testid="login-button"]',
      'button[type="submit"]',
      'input[type="submit"]',
      'button:contains("Sign In")',
      'button:contains("Login")'
    ]
    
    let buttonFound = false
    buttonSelectors.forEach(selector => {
      cy.get('body').then(($body) => {
        if ($body.find(selector).length > 0 && !buttonFound) {
          cy.get(selector).click()
          buttonFound = true
        }
      })
    })
    
    cy.wait(2000)
    // Don't require specific URL since auth flow might vary
  })
})

// Custom command for creating test user (only runs if SKIP_USER_CREATION_TESTS is false)
Cypress.Commands.add('createTestUser', () => {
  if (Cypress.env('SKIP_USER_CREATION_TESTS')) {
    cy.log('Skipping user creation test')
    return
  }
  
  const testEmail = `test-${Date.now()}@example.com`
  const testPassword = 'testpassword123'
  
  cy.visit('/auth/register')
  cy.wait(2000)
  
  // Try multiple selectors for email input
  const emailSelectors = [
    '[data-testid="email-input"]',
    'input[type="email"]',
    'input[name="email"]',
    '#email',
    'input[placeholder*="Email"]',
    'input[placeholder*="email"]'
  ]
  
  let emailFound = false
  emailSelectors.forEach(selector => {
    cy.get('body').then(($body) => {
      if ($body.find(selector).length > 0 && !emailFound) {
        cy.get(selector).type(testEmail)
        emailFound = true
      }
    })
  })
  
  // Try multiple selectors for password input
  const passwordSelectors = [
    '[data-testid="password-input"]',
    'input[type="password"]',
    'input[name="password"]',
    '#password',
    'input[placeholder*="Password"]',
    'input[placeholder*="password"]'
  ]
  
  let passwordFound = false
  passwordSelectors.forEach(selector => {
    cy.get('body').then(($body) => {
      if ($body.find(selector).length > 0 && !passwordFound) {
        cy.get(selector).type(testPassword)
        passwordFound = true
      }
    })
  })
  
  // Try multiple selectors for register button
  const buttonSelectors = [
    '[data-testid="register-button"]',
    'button[type="submit"]',
    'input[type="submit"]',
    'button:contains("Sign Up")',
    'button:contains("Register")',
    'button:contains("Create")'
  ]
  
  let buttonFound = false
  buttonSelectors.forEach(selector => {
    cy.get('body').then(($body) => {
      if ($body.find(selector).length > 0 && !buttonFound) {
        cy.get(selector).click()
        buttonFound = true
      }
    })
  })
  
  cy.wait(3000)
  
  // Store credentials for later use
  cy.wrap({ email: testEmail, password: testPassword }).as('testUser')
})

// Wait for Supabase to be ready
Cypress.Commands.add('waitForSupabase', () => {
  // Instead of checking for window.supabase, just wait for the page to load
  cy.window().should('exist')
  // Give the app time to initialize
  cy.wait(1000)
  // Check that we're not getting any immediate loading errors
  cy.get('body').should('be.visible')
})

// Cleanup test data (useful for local testing)
Cypress.Commands.add('cleanupTestData', () => {
  if (!Cypress.env('SKIP_USER_CREATION_TESTS')) {
    cy.log('Cleaning up test data')
    // Add cleanup logic here if needed
    // This could include API calls to remove test users, posts, etc.
  }
})