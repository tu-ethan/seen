import { redirect } from 'next/navigation'

const landingUrl = process.env.NEXT_PUBLIC_LANDING_URL || 'http://localhost:5174/'

export default function Home() { redirect(landingUrl) }
