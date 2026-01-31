'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/Button';
import { TaskModal } from '@/components/TaskModal';
import type { Task } from '@/types';
import { getTasks, createTask, updateTask, deleteTask, toggleTaskStatus } from '@/services/task.service';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Search, Filter, Trash2, Edit2, CheckCircle, Clock, AlertCircle, CheckSquare } from 'lucide-react';

export default function DashboardPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTasks();
    }
  }, [page, statusFilter, searchTerm, isAuthenticated]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const data = await getTasks(page, statusFilter || undefined, searchTerm || undefined);
      setTasks(data.tasks);
      setTotalPages(data.pagination.totalPages);
    } catch (error) {
      toast.error('Failed to load tasks');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrUpdate = async (title: string, description: string, status: string) => {
    try {
      if (editingTask) {
        await updateTask(editingTask.id, { title, description, status: status as any });
        toast.success('Task updated');
      } else {
        await createTask(title, description, status);
        toast.success('Task created');
      }
      fetchTasks();
    } catch (error) {
      toast.error(editingTask ? 'Failed to update task' : 'Failed to create task');
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await deleteTask(id);
      toast.success('Task deleted');
      fetchTasks();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleToggle = async (task: Task) => {
    try {
      await toggleTaskStatus(task.id);
      toast.success(`Task marked as ${task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED'}`);
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: t.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED' } : t));
    } catch (error) {
      toast.error('Failed to update status');
      fetchTasks();
    }
  };

  const openCreateModal = () => {
    setEditingTask(undefined);
    setIsModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'IN_PROGRESS': return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  if (!isAuthenticated) return null;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl font-bold text-gray-900">My Tasks</h1>
          <Button onClick={openCreateModal}>
            <Plus className="h-5 w-5 mr-1" />
            New Task
          </Button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
              placeholder="Search tasks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 min-w-[200px]">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>

        {isLoading && tasks.length === 0 ? (
           <div className="text-center py-12">
            <svg className="animate-spin h-10 w-10 text-indigo-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
           </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200 border-dashed">
            <CheckSquare className="mx-auto h-12 w-12 text-gray-300" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No tasks found</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by creating a new task.</p>
            <div className="mt-6">
              <Button onClick={openCreateModal}>
                <Plus className="h-5 w-5 mr-1" />
                New Task
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {tasks.map((task) => (
                <li key={task.id}>
                  <div className="px-4 py-4 flex items-center sm:px-6 hover:bg-gray-50 transition-colors">
                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                      <div className="flex items-center truncate">
                        <div className="flex-shrink-0 cursor-pointer" onClick={() => handleToggle(task)}>
                          {getStatusIcon(task.status)}
                        </div>
                        <div className="ml-4 truncate">
                           <div className="flex text-sm">
                            <p className={`font-medium truncate ${task.status === 'COMPLETED' ? 'text-gray-500 line-through' : 'text-indigo-600'}`}>
                              {task.title}
                            </p>
                          </div>
                          {task.description && (
                            <div className="mt-1 flex">
                              <p className="text-sm text-gray-500 truncate">
                                {task.description}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 flex-shrink-0 sm:mt-0 sm:ml-5">
                         <div className="flex -space-x-1 overflow-hidden">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                              ${task.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                                task.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' : 
                                'bg-gray-100 text-gray-800'}`}>
                              {task.status.replace('_', ' ').toLowerCase()}
                            </span>
                         </div>
                      </div>
                    </div>
                    <div className="ml-5 flex-shrink-0 flex gap-2">
                       <button
                        onClick={() => openEditModal(task)}
                        className="p-1 text-gray-400 hover:text-gray-500"
                       >
                         <Edit2 className="h-5 w-5" />
                       </button>
                       <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                       >
                         <Trash2 className="h-5 w-5" />
                       </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-lg shadow-sm">
                <div className="flex-1 flex justify-between sm:hidden">
                    <Button 
                        variant="secondary" 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                    >
                        Previous
                    </Button>
                    <Button 
                        variant="secondary" 
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                    >
                        Next
                    </Button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing page <span className="font-medium">{page}</span> of <span className="font-medium">{totalPages}</span>
                        </p>
                    </div>
                    <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                             <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
                            >
                                Previous
                            </button>
                             <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:bg-gray-100"
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        )}

        <TaskModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateOrUpdate}
          initialData={editingTask}
          title={editingTask ? 'Edit Task' : 'Create Task'}
        />
      </div>
    </Layout>
  );
}
