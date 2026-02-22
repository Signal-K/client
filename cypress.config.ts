import { defineConfig } from 'cypress'
import dotenv from 'dotenv'
import { execSync } from 'node:child_process'
// import codeCoverageTask from '@cypress/code-coverage/task'

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
                const profilesResponse = await fetch(
                    `${restBase}/profiles?select=avatar_url&id=eq.${encodeURIComponent(userId)}&limit=1`,
                    {
                        method: 'GET',
                        headers: restAuthHeaders,
                    },
                )
                if (profilesResponse.ok) {
                    const profiles = (await profilesResponse.json()) as Array<{ avatar_url?: string | null }>
                    const avatarUrl = profiles[0]?.avatar_url
                    const marker = '/storage/v1/object/public/avatars/'
                    const objectPath = avatarUrl?.includes(marker) ? avatarUrl.split(marker)[1] : ''
                    if (objectPath) {
                        const encodedPath = objectPath
                            .split('/')
                            .filter(Boolean)
                            .map((part) => encodeURIComponent(part))
                            .join('/')
                        await fetch(
                            `${supabaseUrl}/storage/v1/object/avatars/${encodedPath}`,
                            {
                                method: 'DELETE',
                                headers: {
                                    apikey: resolvedServiceRoleKey,
                                    Authorization: `Bearer ${resolvedServiceRoleKey}`,
                                },
                            },
                        )
                    }
                }

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
                    if (!resolvedAnonKey) {
                        throw new Error('SUPABASE_ANON_KEY is required for Cypress user creation')
                    }

                    const response = await fetch(`${supabaseUrl}/auth/v1/signup`, {
                        method: 'POST',
                        headers: {
                            apikey: resolvedAnonKey,
                            Authorization: `Bearer ${resolvedAnonKey}`,
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            email,
                            password,
                        }),
                    })

                    if (!response.ok) {
                        const message = await response.text()
                        throw new Error(`Failed to create test user: ${message}`)
                    }

                    const payload = await response.json()
                    const user = payload?.user
                    if (!user?.id) {
                        throw new Error(`Unexpected signup response: ${JSON.stringify(payload)}`)
                    }

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
                async getSupabaseProfileById({ userId }: { userId: string }) {
                    if (!resolvedServiceRoleKey) {
                        throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for profile checks')
                    }

                    const params = new URLSearchParams()
                    params.set('select', 'id,username,full_name,avatar_url,updated_at')
                    params.set('id', `eq.${encodeURIComponent(userId)}`)
                    params.set('limit', '1')

                    const response = await fetch(`${supabaseUrl}/rest/v1/profiles?${params.toString()}`, {
                        method: 'GET',
                        headers: restAuthHeaders,
                    })

                    if (!response.ok) {
                        const message = await response.text()
                        throw new Error(`Failed to fetch profile row: ${message}`)
                    }

                    const rows = (await response.json()) as Array<{
                        id: string
                        username: string | null
                        full_name: string | null
                        avatar_url: string | null
                        updated_at: string | null
                    }>

                    return rows[0] ?? null
                },
                async checkStorageObjectExists({
                    bucket,
                    objectPath,
                }: {
                    bucket: string
                    objectPath: string
                }) {
                    if (!resolvedServiceRoleKey) {
                        throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for storage checks')
                    }

                    const slashIndex = objectPath.lastIndexOf('/')
                    const prefix = slashIndex >= 0 ? objectPath.slice(0, slashIndex + 1) : ''
                    const name = slashIndex >= 0 ? objectPath.slice(slashIndex + 1) : objectPath

                    const response = await fetch(`${supabaseUrl}/storage/v1/object/list/${bucket}`, {
                        method: 'POST',
                        headers: restAuthHeaders,
                        body: JSON.stringify({
                            prefix,
                            limit: 100,
                            offset: 0,
                        }),
                    })

                    if (!response.ok) {
                        const message = await response.text()
                        throw new Error(`Failed to list storage objects: ${message}`)
                    }

                    const rows = (await response.json()) as Array<{ name: string }>
                    return rows.some((row) => row.name === name)
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
                            : ['telescope-tess', 'telescope-minorPlanet', 'active-asteroids', 'telescope-ngts']

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
                    if (rows.length > 0) {
                        return rows
                    }

                    // Fallback for sparse CI datasets: return any anomalies so tests can verify
                    // API shape without requiring specific seeded anomaly sets.
                    const fallbackParams = new URLSearchParams()
                    fallbackParams.set('select', 'id,anomalySet')
                    fallbackParams.set('limit', '20')

                    const fallbackResponse = await fetch(
                        `${supabaseUrl}/rest/v1/anomalies?${fallbackParams.toString()}`,
                        {
                            method: 'GET',
                            headers: restAuthHeaders,
                        },
                    )

                    if (!fallbackResponse.ok) {
                        const message = await fallbackResponse.text()
                        throw new Error(`Failed to fetch fallback anomalies: ${message}`)
                    }

                    const fallbackRows = (await fallbackResponse.json()) as Array<{ id: number; anomalySet: string }>
                    return fallbackRows
                },
            })

            // Code coverage plugin disabled - @cypress/code-coverage is incompatible with Cypress 14
            // (Cypress.expose is not a function)

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
