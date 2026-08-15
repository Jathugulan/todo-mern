import { CheckCircle2, Clock, ListTodo, AlertTriangle } from 'lucide-react';

export default function TaskStats({ total, completed, pending, highPriority }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
      {/* Card 1: Total Tasks */}
      <div className="glass-card p-4 rounded-2xl flex items-center justify-between border border-slate-800 hover:border-indigo-500/30 transition-all">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Tasks</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">{total}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
          <ListTodo className="w-5 h-5" />
        </div>
      </div>

      {/* Card 2: Completed Tasks */}
      <div className="glass-card p-4 rounded-2xl flex items-center justify-between border border-slate-800 hover:border-emerald-500/30 transition-all">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{completed}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
          <CheckCircle2 className="w-5 h-5" />
        </div>
      </div>

      {/* Card 3: Pending Tasks */}
      <div className="glass-card p-4 rounded-2xl flex items-center justify-between border border-slate-800 hover:border-amber-500/30 transition-all">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Pending</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{pending}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
          <Clock className="w-5 h-5" />
        </div>
      </div>

      {/* Card 4: High Priority Tasks */}
      <div className="glass-card p-4 rounded-2xl flex items-center justify-between border border-slate-800 hover:border-rose-500/30 transition-all">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">High Priority</p>
          <p className="text-2xl font-bold text-rose-400 mt-1">{highPriority}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
