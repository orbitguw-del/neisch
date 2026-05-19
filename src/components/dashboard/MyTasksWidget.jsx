import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ListTodo, AlertTriangle, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { isOverdue, daysLate } from '@/stores/taskStore'
import { formatDate, cn } from '@/lib/utils'

// Dashboard widget — open tasks assigned to the logged-in user.
const STATUS_CLS = {
  pending:     'bg-gray-100 text-gray-600',
  in_progress: 'bg-amber-50 text-amber-700',
  submitted:   'bg-blue-50 text-blue-700',
  blocked:     'bg-red-50 text-red-700',
}
const STATUS_LABEL = {
  pending: 'Pending', in_progress: 'In progress', submitted: 'Submitted', blocked: 'Blocked',
}

export default function MyTasksWidget({ profileId }) {
  const navigate = useNavigate()
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    if (!profileId) return
    let cancelled = false
    supabase
      .from('tasks')
      .select('id, title, status, due_date, site:site_id(name)')
      .eq('assigned_to_profile', profileId)
      .neq('status', 'done')
      .order('due_date', { ascending: true, nullsFirst: false })
      .then(({ data }) => { if (!cancelled) setTasks(data ?? []) })
    return () => { cancelled = true }
  }, [profileId])

  if (tasks.length === 0) return null

  const overdueCount = tasks.filter(isOverdue).length

  return (
    <div className="card overflow-hidden mb-4">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
        <div className="flex items-center gap-2">
          <ListTodo className="h-4 w-4 text-brand-600" />
          <h2 className="text-sm font-semibold text-gray-900">
            My Tasks <span className="text-gray-400">({tasks.length})</span>
          </h2>
          {overdueCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-2 py-0.5 text-xs font-semibold text-red-700">
              <AlertTriangle className="h-3 w-3" /> {overdueCount} overdue
            </span>
          )}
        </div>
        <button onClick={() => navigate('/tasks')}
          className="text-xs font-medium text-brand-600 hover:text-brand-700">
          View all →
        </button>
      </div>
      <div className="divide-y divide-gray-100">
        {tasks.slice(0, 5).map((t) => {
          const late = isOverdue(t)
          return (
            <button key={t.id} onClick={() => navigate('/tasks')}
              className="flex w-full items-center gap-3 px-5 py-3 text-left hover:bg-gray-50">
              <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium flex-shrink-0',
                STATUS_CLS[t.status] ?? STATUS_CLS.pending)}>
                {STATUS_LABEL[t.status] ?? t.status}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900 truncate">{t.title}</p>
                <p className="text-xs text-gray-500">
                  {t.site?.name ?? '—'}
                  {t.due_date && (
                    <span className={late ? 'text-red-600 font-medium' : ''}>
                      {' · '}{late ? `${daysLate(t)}d late` : `due ${formatDate(t.due_date)}`}
                    </span>
                  )}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
