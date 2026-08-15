import { CheckCircle2, Clock, ListTodo, TrendingUp } from 'lucide-react';

export default function TaskStats({ total, completed, pending }) {
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Total */}
      <div className="glass-card p-4 rounded-2xl flex items-center justify-between border border-slate-800 hover:border-indigo-500/30 transition-all">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Tasks</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{total}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
          <ListTodo className="w-5 h-5" />
        </div>
      </div>

      {/* Card 2: Completed */}
      <div className="glass-card p-4 rounded-2xl flex items-center justify-between border border-slate-800 hover:border-emerald-500/30 transition-all">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{completed}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* Card 3: Pending */}
      <div className="glass-card p-4 rounded-2xl flex items-center justify-between border border-slate-800 hover:border-amber-500/30 transition-all">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{pending}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      {/* Card 4: Progress */}
      <div className="glass-card p-4 rounded-2xl flex flex-col justify-between border border-slate-800 hover:border-purple-500/30 transition-all">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Progress Rate</p>
          <span className="text-xs font-semibold text-purple-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-slate-800/80 rounded-full h-2 mt-3 overflow-hidden border border-slate-700/50">
          <div
            className="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>
    </div>
  );
}
