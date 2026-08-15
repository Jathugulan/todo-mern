import { useState, useEffect, useCallback } from 'react';
import API from '../api/axios';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import TaskStats from '../components/TaskStats';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { Plus, Sparkles, Filter, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();

  // Tasks and UI States
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, completed

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Helper for Toast Feedback
  const showFeedback = (msg, type = 'success') => {
    if (type === 'success') {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(''), 3000);
    } else {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(''), 4000);
    }
  };

  // 1. Fetch Tasks from GET /api/tasks
  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage('');
    try {
      const res = await API.get('/tasks');
      if (res.data.success) {
        setTasks(res.data.data || []);
      }
    } catch (err) {
      console.error('Fetch tasks error:', err);
      setErrorMessage('Failed to fetch tasks from server. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // 2. Mark Task Complete (Toggle Status)
  const handleToggleTask = async (id) => {
    const targetTask = tasks.find((t) => t._id === id);
    if (!targetTask) return;

    const newCompletedStatus = !targetTask.completed;

    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === id ? { ...t, completed: newCompletedStatus } : t))
    );

    try {
      const res = await API.put(`/tasks/${id}`, { completed: newCompletedStatus });
      if (!res.data.success) {
        // Revert on failure
        fetchTasks();
        showFeedback('Failed to update task status.', 'error');
      } else {
        showFeedback(
          newCompletedStatus ? 'Task marked as completed! 🎉' : 'Task marked as pending.',
          'success'
        );
      }
    } catch (err) {
      console.error('Toggle task error:', err);
      fetchTasks();
      showFeedback('Error updating task completion status.', 'error');
    }
  };

  // 3. Delete Task with Confirmation
  const handleDeleteTask = async (id) => {
    const confirmDelete = window.confirm('Are you sure you want to delete this task?');
    if (!confirmDelete) return;

    // Optimistic remove
    setTasks((prev) => prev.filter((t) => t._id !== id));

    try {
      const res = await API.delete(`/tasks/${id}`);
      if (res.data.success) {
        showFeedback('Task deleted successfully.', 'success');
      } else {
        fetchTasks();
        showFeedback('Failed to delete task.', 'error');
      }
    } catch (err) {
      console.error('Delete task error:', err);
      fetchTasks();
      showFeedback('Error deleting task.', 'error');
    }
  };

  // 4. Create or Edit Task
  const handleSaveTask = async (taskData) => {
    if (taskToEdit) {
      // PUT /api/tasks/:id
      try {
        const res = await API.put(`/tasks/${taskToEdit._id}`, taskData);
        if (res.data.success) {
          setTasks((prev) =>
            prev.map((t) => (t._id === taskToEdit._id ? res.data.data : t))
          );
          showFeedback('Task updated successfully!', 'success');
        }
      } catch (err) {
        console.error('Update task error:', err);
        showFeedback('Failed to update task. Please check input.', 'error');
        throw err;
      }
    } else {
      // POST /api/tasks
      try {
        const res = await API.post('/tasks', taskData);
        if (res.data.success) {
          setTasks((prev) => [res.data.data, ...prev]);
          showFeedback('Task created successfully! 🚀', 'success');
        }
      } catch (err) {
        console.error('Create task error:', err);
        showFeedback('Failed to create task. Please check input.', 'error');
        throw err;
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

  // Filter tasks locally by status and search keyword
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'completed'
        ? task.completed
        : !task.completed;

    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  // Calculate Metrics
  const totalCount = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = totalCount - completedCount;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Header / Navbar Component */}
      <Navbar
        user={user}
        logout={logout}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenModal={handleOpenCreateModal}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Toast Feedback Banners */}
        {successMessage && (
          <div className="mb-5 p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl flex items-center gap-2.5 text-emerald-400 text-xs sm:text-sm animate-fade-in shadow-lg">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mb-5 p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-2.5 text-rose-400 text-xs sm:text-sm animate-fade-in shadow-lg">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Welcome Section */}
        <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Welcome back, {user?.name || 'User'}! 👋
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Here is an overview of your tasks and productivity metrics.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 active:scale-[0.98] transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
        </div>

        {/* Task Metrics Stats Summary Component */}
        <TaskStats
          total={totalCount}
          completed={completedCount}
          pending={pendingCount}
        />

        {/* Status Filter Bar */}
        <div className="glass-panel p-3 sm:p-4 rounded-2xl mb-6 border border-slate-800 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-indigo-400 hidden sm:inline" />
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">Filter:</span>
            <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 rounded-xl border border-slate-800">
              {['all', 'pending', 'completed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                    statusFilter === status
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-600/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400 font-medium">
            Showing <span className="text-slate-200 font-bold">{filteredTasks.length}</span> of{' '}
            <span className="text-slate-200 font-bold">{totalCount}</span> tasks
          </p>
        </div>

        {/* Task List / Grid Area */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-indigo-400 animate-spin mb-3" />
            <p className="text-xs sm:text-sm text-slate-400">Loading your tasks...</p>
          </div>
        ) : filteredTasks.length === 0 ? (
          /* Empty State Component */
          <div className="glass-panel rounded-3xl p-8 sm:p-12 text-center max-w-lg mx-auto border border-slate-800 my-8 animate-fade-in">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mx-auto mb-4">
              <Sparkles className="w-7 h-7 sm:w-8 sm:h-8" />
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-100">No tasks found</h3>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xs mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'No tasks match your current filter or search criteria.'
                : 'Your task list is empty. Click below to create your first task!'}
            </p>
            <button
              onClick={handleOpenCreateModal}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Create Task</span>
            </button>
          </div>
        ) : (
          /* Task Card Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTasks.map((task) => (
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

      {/* Task Creation / Edit Modal Component */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />
    </div>
  );
}
