import 'server-only'

export interface GmailRuntimeConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
}

const required = (name: string) => process.env[name]?.trim() ?? ''

export function getGmailRuntimeConfig(): GmailRuntimeConfig | null {
  const config: GmailRuntimeConfig = {
    clientId: required('GMAIL_CLIENT_ID'),
    clientSecret: required('GMAIL_CLIENT_SECRET'),
    redirectUri: required('GMAIL_REDIRECT_URI'),
  }
  return Object.values(config).every(Boolean) ? config : null
}

export const isDemoMode = () => process.env.SEEN_DEMO_MODE !== 'false'

export function integrationReadiness() {
  const missing = [
    'GMAIL_CLIENT_ID',
    'GMAIL_CLIENT_SECRET',
    'GMAIL_REDIRECT_URI',
    'GEMINI_API_KEY',
    'APP_ENCRYPTION_KEY',
    'SEEN_SESSION_SECRET',
  ].filter((name) => !required(name))
  return { configured: missing.length === 0, missing }
}
