import { NextResponse } from 'next/server'
import { requireIdentity } from '@/lib/server/auth'
import { audit, listApprovedForManager } from '@/lib/server/database'
import { employeeById } from '@/lib/product'

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = requireIdentity(request, 'manager')
  if ('response' in auth) return auth.response
  const { id } = await context.params
  const employee = employeeById(id)
  if (!employee || employee.managerId !== auth.identity.employeeId) return NextResponse.json({ error: 'Employee record not found.' }, { status: 404 })
  const contributions = listApprovedForManager(auth.identity.workspaceId, id)
  audit(auth.identity, 'MANAGER_ACCESSED_CONTRIBUTIONS', 'employee', id, { contributionCount: contributions.length })
  return NextResponse.json({ contributions })
}
