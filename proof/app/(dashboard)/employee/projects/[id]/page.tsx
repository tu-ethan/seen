import { notFound } from 'next/navigation'
import ProjectDetailClient from '@/components/dashboard/ProjectDetailClient'
import { MAYA, PROJECTS } from '@/lib/fixtures'

export function generateStaticParams() {
  return MAYA.projectIds.map((id) => ({ id }))
}

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const project = PROJECTS.find((item) => item.id === id && MAYA.projectIds.includes(item.id))
  if (!project) notFound()
  return <ProjectDetailClient project={project} />
}
