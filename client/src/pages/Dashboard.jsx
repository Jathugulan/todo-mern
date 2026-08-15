import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import TaskStats from '../components/TaskStats';
import TaskCard from '../components/TaskCard';
import TaskModal from '../components/TaskModal';
import { Plus, Sparkles, Filter } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();

  // Initial local UI demo state (Task API integration will occur in task phase)
  const [tasks, setTasks] = useState([
    {
      _id: '1',
      title: 'Complete project documentation',
      description: 'Write comprehensive guide and API references for the team.',
      category: 'Work',
      priority: 'High',
      completed: false,
      dueDate: new Date(Date.now() + 86400000 * 2).toISOString(),
    },
    {
      _id: '2',
      title: 'Review pull requests',
      description: 'Check backend auth controller and Mongoose schemas.',
      category: 'Work',
      priority: 'Medium',
      completed: true,
      dueDate: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      _id: '3',
      title: 'Buy groceries for the week',
      description: 'Fresh vegetables, fruits, and snacks.',
      category: 'Shopping',
      priority: 'Low',
      completed: false,
      dueDate: null,
    },
  ]);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, completed
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Local Task State Handlers
  const handleToggleTask = (id) => {
    setTasks((prev) =>
      prev.map((task) =>
        task._id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleDeleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task._id !== id));
  };

  const handleSaveTask = (taskData) => {
    if (taskToEdit) {
      setTasks((prev) =>
        prev.map((t) => (t._id === taskToEdit._id ? { ...t, ...taskData } : t))
      );
    } else {
      const newTask = {
        _id: Date.now().toString(),
        ...taskData,
        completed: false,
      };
      setTasks((prev) => [newTask, ...prev]);
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

  // Filter tasks based on UI status filter and search query
  const filteredTasks = tasks.filter((task) => {
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'completed'
        ? task.completed
        : !task.completed;

    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());

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
        {filteredTasks.length === 0 ? (
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

      {/* Reusable Task Creation / Edit Modal Component */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />
    </div>
  );
}
