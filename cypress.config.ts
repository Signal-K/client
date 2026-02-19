import { defineConfig } from 'cypress'

export default defineConfig({
    e2e: {
        baseUrl: process.env.CYPRESS_baseUrl || 'http://localhost:3000',
        supportFile: 'cypress/support/e2e.ts',
        specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
        setupNodeEvents(on, config) {
            const supabaseUrl =
                process.env.SUPABASE_URL ||
                process.env.NEXT_PUBLIC_SUPABASE_URL ||
                'http://127.0.0.1:54321'
            const supabaseServiceRoleKey =
                process.env.SUPABASE_SERVICE_ROLE_KEY ||
                process.env.CYPRESS_SUPABASE_SERVICE_ROLE_KEY ||
                ''

            config.env.SUPABASE_URL = supabaseUrl
            config.env.SUPABASE_SERVICE_ROLE_KEY = supabaseServiceRoleKey

            const authHeaders = {
                apikey: supabaseServiceRoleKey,
                Authorization: `Bearer ${supabaseServiceRoleKey}`,
                'Content-Type': 'application/json',
            }

            async function cleanupUserData(userId: string) {
                if (!userId || !supabaseServiceRoleKey) return

                const restBase = `${supabaseUrl}/rest/v1`
                const tablesWithUserId = [
                    'nps_surveys',
                ]
                const tablesWithAuthor = [
                    'comments',
                    'classifications',
                    'linked_anomalies',
                ]

                for (const table of tablesWithUserId) {
                    await fetch(`${restBase}/${table}?user_id=eq.${encodeURIComponent(userId)}`, {
                        method: 'DELETE',
                        headers: {
                            ...authHeaders,
                            Prefer: 'return=minimal',
                        },
                    })
                }

                for (const table of tablesWithAuthor) {
                    await fetch(`${restBase}/${table}?author=eq.${encodeURIComponent(userId)}`, {
                        method: 'DELETE',
                        headers: {
                            ...authHeaders,
                            Prefer: 'return=minimal',
                        },
                    })
                }

                await fetch(`${restBase}/profiles?id=eq.${encodeURIComponent(userId)}`, {
                    method: 'DELETE',
                    headers: {
                        ...authHeaders,
                        Prefer: 'return=minimal',
                    },
                })
            }

            on('task', {
                async createSupabaseTestUser({
                    email,
                    password,
                }: {
                    email: string
                    password: string
                }) {
                    if (!supabaseServiceRoleKey) {
                        throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for Cypress user creation')
                    }

                    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
                        method: 'POST',
                        headers: authHeaders,
                        body: JSON.stringify({
                            email,
                            password,
                            email_confirm: true,
                        }),
                    })

                    if (!response.ok) {
                        const message = await response.text()
                        throw new Error(`Failed to create test user: ${message}`)
                    }

                    const user = await response.json()
                    return {
                        id: user.id,
                        email: user.email,
                        password,
                    }
                },
                async cleanupSupabaseTestUser({ userId }: { userId: string }) {
                    if (!supabaseServiceRoleKey || !userId) return null

                    await cleanupUserData(userId)
                    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
                        method: 'DELETE',
                        headers: authHeaders,
                    })

                    if (!response.ok) {
                        const message = await response.text()
                        throw new Error(`Failed to delete test user: ${message}`)
                    }

                    return null
                },
                async waitForSupabaseHealth() {
                    const response = await fetch(`${supabaseUrl}/auth/v1/health`)
                    return response.ok
                },
            })

            return config
        },
        env: {
            SKIP_USER_CREATION_TESTS: process.env.SKIP_USER_CREATION_TESTS === 'true',
        },
        viewportWidth: 1280,
        viewportHeight: 720,
        video: process.env.CI ? true : false,
        screenshotOnRunFailure: true,
        defaultCommandTimeout: 10000,
        // Next.js dev-mode cold compiles can exceed 10s in CI.
        requestTimeout: 60000,
        responseTimeout: 60000,
        pageLoadTimeout: 120000,
        // Docker-specific settings
        chromeWebSecurity: false,
        retries: {
            runMode: 2,
            openMode: 0
        }
    },
    component: {
        devServer: {
            framework: 'next',
            bundler: 'webpack',
        },
    },
});
