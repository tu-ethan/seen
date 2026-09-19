import 'server-only'

export interface OutlookRuntimeConfig {
  clientId: string
  clientSecret: string
  tenantId: string
  redirectUri: string
}

const required = (name: string) => process.env[name]?.trim() ?? ''

export function getOutlookRuntimeConfig(): OutlookRuntimeConfig | null {
  const config: OutlookRuntimeConfig = {
    clientId: required('MICROSOFT_CLIENT_ID'),
    clientSecret: required('MICROSOFT_CLIENT_SECRET'),
    tenantId: required('MICROSOFT_TENANT_ID') || 'common',
    redirectUri: required('MICROSOFT_REDIRECT_URI'),
  }
  return Object.values(config).every(Boolean) ? config : null
}

export const isDemoMode = () => process.env.SEEN_DEMO_MODE !== 'false'

export function integrationReadiness() {
  const missing = [
    'MICROSOFT_CLIENT_ID',
    'MICROSOFT_CLIENT_SECRET',
    'MICROSOFT_REDIRECT_URI',
    'GEMINI_API_KEY',
    'APP_ENCRYPTION_KEY',
    'SEEN_SESSION_SECRET',
  ].filter((name) => !required(name))
  return { configured: missing.length === 0, missing }
}
