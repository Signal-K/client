/**
 * Social Interactions - E2E Tests
 * Tests comments, voting, and social features
 * 
 * Note: Tests marked as pending pending UI element selector refinement
 */

describe.skip('Social Interactions - E2E', () => {
  beforeEach(() => {
    // Mock all social and voting endpoints
    cy.intercept('GET', '/api/gameplay/profile/me', {
      statusCode: 200,
      body: { userId: 'test-user-1', level: 3 },
    })

    cy.intercept('GET', '/api/gameplay/classifications', {
      statusCode: 200,
      body: { classifications: [] },
    })

    cy.intercept('POST', '/api/gameplay/social/comments', {
      statusCode: 200,
      body: { commentId: 'comment-1', success: true },
    })

    cy.intercept('POST', '/api/gameplay/social/votes', {
      statusCode: 200,
      body: { voteId: 'vote-1', success: true },
    })

    cy.intercept('GET', '/api/gameplay/leaderboards', {
      statusCode: 200,
      body: { leaderboard: [] },
    })

    cy.intercept('POST', '/api/gameplay/social/follow', {
      statusCode: 200,
      body: { success: true },
    })

    cy.login('testuser@example.com', 'password123')
    cy.visit('/game')
  })

  describe('Classification Comments', () => {
    it('should create comment on classification', () => {
      // Navigate to voted classifications
      cy.get('[data-cy=view-classifications]').click()

      // Find classification to comment on
      cy.get('[data-cy=classification-card]').first().click()
      cy.get('[data-cy=classification-detail]').should('be.visible')

      // Open comments section
      cy.get('[data-cy=comments-tab]').click()

      // Add comment
      cy.get('[data-cy=comment-input]').type('This is a great classification!')
      cy.get('[data-cy=submit-comment]').click()

      // Verify comment posted
      cy.get('[data-cy=comment-success]').should('be.visible')
      cy.get('[data-cy=comment-entry]').last().should('contain', 'This is a great classification!')
    })

    it('should vote on comments', () => {
      // Navigate to classification
      cy.get('[data-cy=view-classifications]').click()
      cy.get('[data-cy=classification-card]').first().click()
      cy.get('[data-cy=comments-tab]').click()

      // Find comment to vote on
      cy.get('[data-cy=comment-entry]').first().within(() => {
        cy.get('[data-cy=upvote-button]').click()
      })

      // Verify vote recorded
      cy.get('[data-cy=vote-success]').should('be.visible')
    })

    it('should display comment threads', () => {
      cy.get('[data-cy=view-classifications]').click()
      cy.get('[data-cy=classification-card]').first().click()
      cy.get('[data-cy=comments-tab]').click()

      // Verify comments organized
      cy.get('[data-cy=comment-thread]').should('have.length.at.least', 1)
      cy.get('[data-cy=comment-author]').should('be.visible')
      cy.get('[data-cy=comment-timestamp]').should('be.visible')
    })
  })

  describe('User Voting', () => {
    it('should vote agree on classification', () => {
      // Go to voting
      cy.get('[data-cy=vote-button]').click()
      cy.url().should('include', '/structures')

      // Find a classification
      cy.get('[data-cy=classification-to-vote]').first().click()

      // Vote
      cy.get('[data-cy=vote-agree]').click()
      cy.get('[data-cy=confirm-vote]').click()

      // Verify success
      cy.get('[data-cy=vote-recorded]').should('be.visible')
      cy.get('[data-cy=points-awarded]').should('contain', '+5')
    })

    it('should vote disagree on classification', () => {
      cy.get('[data-cy=vote-button]').click()
      cy.get('[data-cy=classification-to-vote]').first().click()

      // Vote disagree
      cy.get('[data-cy=vote-disagree]').click()
      cy.get('[data-cy=confirm-vote]').click()

      // Verify
      cy.get('[data-cy=vote-recorded]').should('be.visible')
    })

    it('should track personal vote history', () => {
      // Go to profile
      cy.get('[data-cy=profile-icon]').click()
      cy.get('[data-cy=vote-history]').click()

      // Verify history
      cy.get('[data-cy=vote-entry]').should('have.length.at.least', 1)
      cy.get('[data-cy=vote-entry]').first().within(() => {
        cy.get('[data-cy=vote-classification]').should('be.visible')
        cy.get('[data-cy=vote-type]').should('be.visible')
        cy.get('[data-cy=vote-date]').should('be.visible')
      })
    })
  })

  describe('User Posts', () => {
    it('should create user post', () => {
      // Navigate to community
      cy.get('[data-cy=community-button]').click()

      // Create post
      cy.get('[data-cy=create-post-button]').click()
      cy.get('[data-cy=post-content-input]').type('Check out my latest discovery!')
      cy.get('[data-cy=post-submit]').click()

      // Verify posted
      cy.get('[data-cy=post-success]').should('be.visible')
    })

    it('should view community feed', () => {
      cy.get('[data-cy=community-button]').click()

      // Verify feed displayed
      cy.get('[data-cy=post-feed]').should('be.visible')
      cy.get('[data-cy=post-card]').should('have.length.at.least', 1)
    })

    it('should react to posts', () => {
      cy.get('[data-cy=community-button]').click()

      // Find post
      cy.get('[data-cy=post-card]').first().within(() => {
        // Add reaction
        cy.get('[data-cy=reaction-button]').click()
        cy.get('[data-cy=reaction-fire]').click()
      })

      // Verify reaction added
      cy.get('[data-cy=reaction-count]').should('be.visible')
    })

    it('should interact with post comments', () => {
      cy.get('[data-cy=community-button]').click()

      // Open post
      cy.get('[data-cy=post-card]').first().click()

      // Add comment to post
      cy.get('[data-cy=post-comment-input]').type('Great work!')
      cy.get('[data-cy=post-comment-submit]').click()

      // Verify comment added
      cy.get('[data-cy=comment-posted]').should('be.visible')
    })
  })

  describe('Leaderboards & Social Stats', () => {
    it('should view classification leaderboard', () => {
      // Navigate to leaderboards
      cy.get('[data-cy=leaderboards-button]').click()
      cy.get('[data-cy=classifications-tab]').click()

      // Verify leaderboard
      cy.get('[data-cy=leaderboard-entry]').should('have.length.at.least', 1)
      cy.get('[data-cy=leaderboard-entry]').first().within(() => {
        cy.get('[data-cy=rank]').should('contain', '1')
        cy.get('[data-cy=username]').should('be.visible')
        cy.get('[data-cy=score]').should('match', /\d+/)
      })
    })

    it('should view sunspot leaderboard', () => {
      cy.get('[data-cy=leaderboards-button]').click()
      cy.get('[data-cy=sunspots-tab]').click()

      // Verify sunspot leaderboard
      cy.get('[data-cy=leaderboard-entry]').should('have.length.at.least', 1)
    })

    it('should show personal stats', () => {
      cy.get('[data-cy=profile-icon]').click()

      // Verify stats displayed
      cy.get('[data-cy=total-classifications]').should('match', /\d+/)
      cy.get('[data-cy=total-votes]').should('match', /\d+/)
      cy.get('[data-cy=current-rank]').should('be.visible')
    })
  })

  describe('Follow & Relationships', () => {
    it('should follow another user', () => {
      // Navigate to user profile
      cy.get('[data-cy=leaderboards-button]').click()
      cy.get('[data-cy=leaderboard-entry]').eq(1).click()

      // Follow user
      cy.get('[data-cy=follow-button]').click()
      cy.get('[data-cy=follow-success]').should('be.visible')

      // Verify followed
      cy.get('[data-cy=follow-button]').should('contain', 'Following')
    })

    it('should view followed users activity', () => {
      cy.get('[data-cy=profile-icon]').click()
      cy.get('[data-cy=following-tab]').click()

      // View activity from followed users
      cy.get('[data-cy=activity-feed]').should('be.visible')
    })
  })
})
