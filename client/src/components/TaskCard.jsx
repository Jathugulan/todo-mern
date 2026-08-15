import { Calendar, Check, Edit, Trash2, AlertCircle } from 'lucide-react';

export default function TaskCard({ task, onToggle, onEdit, onDelete }) {
  const categoryColors = {
    Work: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    Personal: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    Shopping: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
    Health: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    General: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
  };

  const priorityColors = {
    High: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    Medium: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    Low: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
  };

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && !task.completed;

  return (
    <div
      className={`group glass-card rounded-2xl p-4 sm:p-5 border transition-all duration-200 hover:shadow-xl hover:shadow-indigo-500/5 ${
        task.completed
          ? 'border-slate-800/60 bg-slate-900/40 opacity-75'
          : 'border-slate-800 hover:border-slate-700'
      }`}
    >
      <div className="flex items-start gap-3 sm:gap-3.5">
        {/* Checkbox Touch Button */}
        <button
          onClick={() => onToggle(task._id)}
          title={task.completed ? 'Mark as incomplete' : 'Mark as completed'}
          className={`mt-0.5 w-6 h-6 sm:w-5 sm:h-5 rounded-lg border flex items-center justify-center transition-all duration-200 shrink-0 ${
            task.completed
              ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-500/30'
              : 'border-slate-600 hover:border-indigo-400 bg-slate-950/50'
          }`}
        >
          {task.completed && <Check className="w-4 h-4 sm:w-3.5 sm:h-3.5 stroke-[3]" />}
        </button>

        {/* Task Details Container */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1.5 flex-wrap">
            <h3
              className={`text-sm sm:text-base font-semibold leading-snug break-words max-w-full transition-all ${
                task.completed ? 'line-through text-slate-500' : 'text-slate-100'
              }`}
            >
              {task.title}
            </h3>

            {/* Category & Priority Badges */}
            <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
              <span
                className={`text-[10px] sm:text-[11px] font-medium px-2.5 py-0.5 rounded-full border ${
                  categoryColors[task.category] || categoryColors.General
                }`}
              >
                {task.category || 'General'}
              </span>
              <span
                className={`text-[10px] sm:text-[11px] font-semibold px-2.5 py-0.5 rounded-full border capitalize ${
                  priorityColors[
                    task.priority
                      ? task.priority.charAt(0).toUpperCase() + task.priority.slice(1)
                      : 'Low'
                  ] || priorityColors.Low
                }`}
              >
                {task.priority}
              </span>
            </div>
          </div>

          {/* Task Description */}
          {task.description && (
            <p
              className={`text-xs mt-1 leading-relaxed break-words max-w-full ${
                task.completed ? 'text-slate-600 line-through' : 'text-slate-400'
              }`}
            >
              {task.description}
            </p>
          )}

          {/* Footer Metadata & Actions */}
          <div className="flex items-center justify-between mt-3.5 pt-3 border-t border-slate-800/80 text-xs gap-2">
            {/* Due Date */}
            <div className="flex items-center gap-1.5 min-w-0 truncate">
              {task.dueDate ? (
                <span
                  className={`flex items-center gap-1 font-medium truncate ${
                    isOverdue ? 'text-rose-400 font-semibold' : 'text-slate-400'
                  }`}
                >
                  {isOverdue ? <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" /> : <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />}
                  <span className="truncate">{formatDate(task.dueDate)}</span>
                  {isOverdue && <span className="text-[9px] sm:text-[10px] uppercase font-bold ml-1 tracking-wider bg-rose-500/20 text-rose-300 px-1.5 py-0.2 rounded shrink-0">Overdue</span>}
                </span>
              ) : (
                <span className="text-slate-600 text-[11px]">No due date</span>
              )}
            </div>

            {/* Action buttons: Edit & Delete */}
            <div className="flex items-center gap-1 shrink-0">
              <button
                onClick={() => onEdit(task)}
                title="Edit task"
                className="p-1.5 sm:p-2 text-slate-400 hover:text-indigo-400 hover:bg-slate-800 rounded-xl transition-all"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDelete(task._id)}
                title="Delete task"
                className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
