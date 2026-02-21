import { defineConfig } from 'cypress'
import dotenv from 'dotenv'
import { execSync } from 'node:child_process'

dotenv.config({ path: '.env.local' })
dotenv.config()

function tryReadLocalSupabaseJwtKeys() {
    try {
        const statusEnv = execSync('supabase status -o env', { encoding: 'utf8' })
        const map = Object.fromEntries(
            statusEnv
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean)
                .map((line) => {
                    const [key, ...rest] = line.split('=')
                    return [key, rest.join('=').replace(/^"|"$/g, '')]
                })
        ) as Record<string, string>

        return {
            anonKey: map.ANON_KEY || map.PUBLISHABLE_KEY || '',
            serviceRoleKey: map.SERVICE_ROLE_KEY || '',
            secretKey: map.SECRET_KEY || '',
        }
    } catch {
        return { anonKey: '', serviceRoleKey: '', secretKey: '' }
    }
}

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
            const supabaseAnonKey =
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
                process.env.SUPABASE_ANON_KEY ||
                process.env.CYPRESS_SUPABASE_ANON_KEY ||
                ''
            const supabaseServiceRoleKey =
                process.env.SUPABASE_SERVICE_ROLE_KEY ||
                process.env.CYPRESS_SUPABASE_SERVICE_ROLE_KEY ||
                ''
            const supabaseSecretKey =
                process.env.SUPABASE_SECRET_KEY ||
                process.env.CYPRESS_SUPABASE_SECRET_KEY ||
                ''

            let resolvedAnonKey = supabaseAnonKey
            let resolvedServiceRoleKey = supabaseServiceRoleKey
            let resolvedSecretKey = supabaseSecretKey
            if (supabaseUrl.includes('127.0.0.1')) {
                const localKeys = tryReadLocalSupabaseJwtKeys()
                if (localKeys.anonKey) {
                    resolvedAnonKey = localKeys.anonKey
                }
                if (localKeys.serviceRoleKey) {
                    resolvedServiceRoleKey = localKeys.serviceRoleKey
                }
                if (localKeys.secretKey) {
                    resolvedSecretKey = localKeys.secretKey
                }
            }

            config.env.SUPABASE_URL = supabaseUrl
            config.env.SUPABASE_ANON_KEY = resolvedAnonKey
            config.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = resolvedAnonKey
            config.env.SUPABASE_SERVICE_ROLE_KEY = resolvedServiceRoleKey
            config.env.SUPABASE_SECRET_KEY = resolvedSecretKey

            const restAuthHeaders = {
                apikey: resolvedServiceRoleKey,
                Authorization: `Bearer ${resolvedServiceRoleKey}`,
                'Content-Type': 'application/json',
            }
            const adminKey = resolvedSecretKey || resolvedServiceRoleKey
            const adminAuthHeaders = {
                apikey: adminKey,
                Authorization: `Bearer ${adminKey}`,
                'Content-Type': 'application/json',
            }

            async function cleanupUserData(userId: string) {
                if (!userId || !resolvedServiceRoleKey) return

                const restBase = `${supabaseUrl}/rest/v1`
                const tablesWithUserId = [
                    'nps_surveys',
                ]
                const tablesWithAuthor = [
                    'comments',
                    'classifications',
                    'linked_anomalies',
                ]
                const tablesWithOwner = [
                    'mineralDeposits',
                    'user_mineral_inventory',
                ]

                for (const table of tablesWithUserId) {
                    await fetch(`${restBase}/${table}?user_id=eq.${encodeURIComponent(userId)}`, {
                        method: 'DELETE',
                        headers: {
                            ...restAuthHeaders,
                            Prefer: 'return=minimal',
                        },
                    })
                }

                for (const table of tablesWithAuthor) {
                    await fetch(`${restBase}/${table}?author=eq.${encodeURIComponent(userId)}`, {
                        method: 'DELETE',
                        headers: {
                            ...restAuthHeaders,
                            Prefer: 'return=minimal',
                        },
                    })
                }

                for (const table of tablesWithOwner) {
                    await fetch(`${restBase}/${table}?owner=eq.${encodeURIComponent(userId)}`, {
                        method: 'DELETE',
                        headers: {
                            ...restAuthHeaders,
                            Prefer: 'return=minimal',
                        },
                    })
                }

                await fetch(`${restBase}/profiles?id=eq.${encodeURIComponent(userId)}`, {
                    method: 'DELETE',
                    headers: {
                        ...restAuthHeaders,
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
                    if (!resolvedServiceRoleKey) {
                        throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for Cypress user creation')
                    }

                    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
                        method: 'POST',
                        headers: adminAuthHeaders,
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
                    if (!resolvedServiceRoleKey || !userId) return null

                    await cleanupUserData(userId)
                    const response = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
                        method: 'DELETE',
                        headers: adminAuthHeaders,
                    })

                    if (!response.ok) {
                        const message = await response.text()
                        throw new Error(`Failed to delete test user: ${message}`)
                    }

                    return null
                },
                async waitForSupabaseHealth() {
                    try {
                        const controller = new AbortController()
                        const timeout = setTimeout(() => controller.abort(), 5000)
                        const response = await fetch(`${supabaseUrl}/auth/v1/health`, {
                            signal: controller.signal,
                        })
                        clearTimeout(timeout)
                        return response.ok
                    } catch {
                        return false
                    }
                },
                async countSupabaseRows({
                    table,
                    filters = {},
                }: {
                    table: string
                    filters?: Record<string, string | number | boolean>
                }) {
                    if (!resolvedServiceRoleKey) {
                        throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for row count checks')
                    }

                    const params = new URLSearchParams()
                    params.set('select', 'id')
                    for (const [key, value] of Object.entries(filters)) {
                        params.set(key, `eq.${encodeURIComponent(String(value))}`)
                    }

                    const response = await fetch(`${supabaseUrl}/rest/v1/${table}?${params.toString()}`, {
                        method: 'GET',
                        headers: restAuthHeaders,
                    })

                    if (!response.ok) {
                        const message = await response.text()
                        throw new Error(`Failed to fetch ${table} rows: ${message}`)
                    }

                    const rows = (await response.json()) as Array<{ id: number }>
                    return Array.isArray(rows) ? rows.length : 0
                },
                async fetchAnomalies({
                    deploymentType,
                }: {
                    deploymentType: 'stellar' | 'planetary'
                }) {
                    if (!resolvedServiceRoleKey) {
                        throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for fetchAnomalies')
                    }

                    const sets =
                        deploymentType === 'stellar'
                            ? ['diskDetective', 'superwasp-variable', 'telescope-superwasp-variable']
                            : ['telescope-tess', 'telescope-minorPlanet']

                    const orFilter = sets.map((s) => `anomalySet.eq.${s}`).join(',')
                    const params = new URLSearchParams()
                    params.set('select', 'id,anomalySet')
                    params.set('or', `(${orFilter})`)
                    params.set('limit', '20')

                    const response = await fetch(
                        `${supabaseUrl}/rest/v1/anomalies?${params.toString()}`,
                        {
                            method: 'GET',
                            headers: restAuthHeaders,
                        },
                    )

                    if (!response.ok) {
                        const message = await response.text()
                        throw new Error(`Failed to fetch anomalies: ${message}`)
                    }

                    const rows = (await response.json()) as Array<{ id: number; anomalySet: string }>
                    return rows
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
