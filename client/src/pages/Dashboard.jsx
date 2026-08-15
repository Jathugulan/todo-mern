import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import TaskStats from '../components/TaskStats';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import {
  Filter,
  Plus,
  Trash2,
  Search,
  Sparkles,
  ArrowUpDown,
  CheckCircle2,
} from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters & Search State
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, completed
  const [categoryFilter, setCategoryFilter] = useState('All'); // All, Work, Personal, Shopping, Health, General
  const [priorityFilter, setPriorityFilter] = useState('All'); // All, Low, Medium, High
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest'); // newest, dueDate, priority, title

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Fetch Tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter !== 'All') params.category = categoryFilter;
      if (priorityFilter !== 'All') params.priority = priorityFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (sortBy) params.sortBy = sortBy;

      const res = await API.get('/tasks', { params });
      if (res.data.success) {
        setTasks(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError('Failed to load tasks. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, categoryFilter, priorityFilter, searchQuery, sortBy]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Task Handlers
  const handleToggleTask = async (id) => {
    // Optimistic Update
    setTasks((prevTasks) =>
      prevTasks.map((t) => (t._id === id ? { ...t, completed: !t.completed } : t))
    );

    try {
      await API.patch(`/tasks/${id}/toggle`);
    } catch (err) {
      console.error('Error toggling task:', err);
      // Revert if error
      fetchTasks();
    }
  };

  const handleDeleteTask = async (id) => {
    setTasks((prev) => prev.filter((t) => t._id !== id));
    try {
      await API.delete(`/tasks/${id}`);
    } catch (err) {
      console.error('Error deleting task:', err);
      fetchTasks();
    }
  };

  const handleClearCompleted = async () => {
    if (!window.confirm('Are you sure you want to delete all completed tasks?')) return;
    setTasks((prev) => prev.filter((t) => !t.completed));
    try {
      await API.delete('/tasks/completed');
    } catch (err) {
      console.error('Error clearing completed tasks:', err);
      fetchTasks();
    }
  };

  const handleSaveTask = async (taskData) => {
    if (taskToEdit) {
      // Update Task
      const res = await API.put(`/tasks/${taskToEdit._id}`, taskData);
      if (res.data.success) {
        fetchTasks();
      }
    } else {
      // Create Task
      const res = await API.post('/tasks', taskData);
      if (res.data.success) {
        fetchTasks();
      }
    }
  };

  const handleOpenCreateModal = () => {
    setTaskToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (task) => {
    setTaskToEdit(task);
    setIsModalOpen(true);
  };

  // Metrics calculation
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Navbar */}
      <Navbar
        user={user}
        logout={logout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenModal={handleOpenCreateModal}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-8">
        {/* Metric Cards */}
        <TaskStats
          total={totalCount}
          completed={completedCount}
          pending={pendingCount}
        />

        {/* Filter & Toolbar Header */}
        <div className="glass-panel p-4 rounded-2xl mb-6 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Status Filter Pills */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
              {['all', 'pending', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    statusFilter === status
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>

            {/* Select Controls & Actions */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Category Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">Category:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="glass-input px-3 py-1.5 rounded-xl text-xs text-slate-200 focus:outline-none"
                >
                  {['All', 'General', 'Work', 'Personal', 'Shopping', 'Health'].map((cat) => (
                    <option key={cat} value={cat} className="bg-slate-900">
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority Filter */}
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-400 font-medium hidden sm:inline">Priority:</span>
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="glass-input px-3 py-1.5 rounded-xl text-xs text-slate-200 focus:outline-none"
                >
                  {['All', 'High', 'Medium', 'Low'].map((prio) => (
                    <option key={prio} value={prio} className="bg-slate-900">
                      {prio}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1.5">
                <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="glass-input px-3 py-1.5 rounded-xl text-xs text-slate-200 focus:outline-none"
                >
                  <option value="newest" className="bg-slate-900">Newest First</option>
                  <option value="dueDate" className="bg-slate-900">Due Date</option>
                  <option value="priority" className="bg-slate-900">Priority</option>
                  <option value="title" className="bg-slate-900">Alphabetical</option>
                </select>
              </div>

              {/* Clear completed button */}
              {completedCount > 0 && (
                <button
                  onClick={handleClearCompleted}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 text-xs font-semibold rounded-xl border border-rose-500/20 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Clear Completed</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Task List / Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin mb-4" />
            <p className="text-sm text-slate-400">Loading your tasks...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center max-w-lg mx-auto border border-slate-800 my-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto mb-4">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">No tasks found</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'All' || priorityFilter !== 'All'
                ? 'Try adjusting your filters or search query to see your tasks.'
                : 'Your task list is empty. Click below to add your first task!'}
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all"
            >
              <Plus className="w-4 h-4" />
              Create Task
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onToggle={handleToggleTask}
                onEdit={handleOpenEditModal}
                onDelete={handleDeleteTask}
              />
            ))}
          </div>
        )}
      </main>

      {/* Task Modal */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />
    </div>
  );
}
