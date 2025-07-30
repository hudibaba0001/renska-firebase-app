import { 
  collection, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp,
  query,
  where,
  orderBy,
  limit,
  startAfter
} from 'firebase/firestore';
import { db } from '../../firebase/init';
import toast from 'react-hot-toast';

// Rate limiting for Firestore operations
const rateLimit = {
  tokens: 50,
  lastReset: Date.now(),
  resetInterval: 60000 // 1 minute
};

const checkRateLimit = () => {
  const now = Date.now();
  if (now - rateLimit.lastReset > rateLimit.resetInterval) {
    rateLimit.tokens = 50;
    rateLimit.lastReset = now;
  }
  
  if (rateLimit.tokens <= 0) {
    throw new Error('Rate limit exceeded. Please wait a moment and try again.');
  }
  
  rateLimit.tokens--;
};

// Task status options
export const TASK_STATUSES = [
  { value: 'pending', label: 'Pending', color: 'gray' },
  { value: 'in-progress', label: 'In Progress', color: 'blue' },
  { value: 'completed', label: 'Completed', color: 'green' },
  { value: 'cancelled', label: 'Cancelled', color: 'red' }
];

// Task priority options
export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', color: 'gray' },
  { value: 'medium', label: 'Medium', color: 'yellow' },
  { value: 'high', label: 'High', color: 'orange' },
  { value: 'urgent', label: 'Urgent', color: 'red' }
];

// Task types
export const TASK_TYPES = [
  { value: 'call', label: 'Phone Call', icon: 'phone' },
  { value: 'email', label: 'Email', icon: 'mail' },
  { value: 'meeting', label: 'Meeting', icon: 'calendar' },
  { value: 'follow-up', label: 'Follow-up', icon: 'refresh-cw' },
  { value: 'proposal', label: 'Proposal', icon: 'file-text' },
  { value: 'demo', label: 'Demo', icon: 'play' },
  { value: 'other', label: 'Other', icon: 'more-horizontal' }
];

// Get all tasks for a company with optional filtering and pagination
export const getTasks = async (companyId, options = {}) => {
  try {
    checkRateLimit();
    
    const {
      status,
      priority,
      type,
      assignedTo,
      customerId,
      dueDate,
      search,
      page = 1,
      limit: pageLimit = 20,
      sortBy = 'dueDate',
      sortOrder = 'asc'
    } = options;

    let q = collection(db, `companies/${companyId}/tasks`);
    const constraints = [];

    // Add filters
    if (status) {
      constraints.push(where('status', '==', status));
    }
    if (priority) {
      constraints.push(where('priority', '==', priority));
    }
    if (type) {
      constraints.push(where('type', '==', type));
    }
    if (assignedTo) {
      constraints.push(where('assignedTo', '==', assignedTo));
    }
    if (customerId) {
      constraints.push(where('customerId', '==', customerId));
    }

    // Add sorting
    constraints.push(orderBy(sortBy, sortOrder));
    constraints.push(limit(pageLimit));

    // Add pagination
    if (page > 1 && options.lastDoc) {
      constraints.push(startAfter(options.lastDoc));
    }

    const querySnapshot = await getDocs(query(q, ...constraints));
    const tasks = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    // Client-side filtering for due date and search
    let filteredTasks = tasks;
    
    if (dueDate) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      switch (dueDate) {
        case 'today':
          filteredTasks = tasks.filter(task => {
            const taskDate = task.dueDate ? new Date(task.dueDate) : null;
            return taskDate && taskDate.toDateString() === today.toDateString();
          });
          break;
        case 'overdue':
          filteredTasks = tasks.filter(task => {
            const taskDate = task.dueDate ? new Date(task.dueDate) : null;
            return taskDate && taskDate < today && task.status !== 'completed';
          });
          break;
        case 'upcoming':
          const nextWeek = new Date(today);
          nextWeek.setDate(today.getDate() + 7);
          filteredTasks = tasks.filter(task => {
            const taskDate = task.dueDate ? new Date(task.dueDate) : null;
            return taskDate && taskDate >= today && taskDate <= nextWeek;
          });
          break;
      }
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredTasks = filteredTasks.filter(task => 
        task.title?.toLowerCase().includes(searchLower) ||
        task.description?.toLowerCase().includes(searchLower) ||
        task.customer?.toLowerCase().includes(searchLower)
      );
    }

    return {
      tasks: filteredTasks.filter(task => !task.deleted),
      total: filteredTasks.length,
      hasMore: querySnapshot.docs.length === pageLimit,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1]
    };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    toast.error('Failed to load tasks');
    throw error;
  }
};

// Get a single task by ID
export const getTask = async (companyId, taskId) => {
  try {
    checkRateLimit();
    
    const docRef = doc(db, `companies/${companyId}/tasks`, taskId);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      throw new Error('Task not found');
    }
    
    return {
      id: docSnap.id,
      ...docSnap.data()
    };
  } catch (error) {
    console.error('Error fetching task:', error);
    toast.error('Failed to load task');
    throw error;
  }
};

// Create a new task
export const createTask = async (companyId, taskData) => {
  try {
    checkRateLimit();
    
    // Validate required fields
    if (!taskData.title?.trim()) {
      throw new Error('Task title is required');
    }
    if (!taskData.dueDate) {
      throw new Error('Due date is required');
    }

    const task = {
      ...taskData,
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      type: taskData.type || 'other',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, `companies/${companyId}/tasks`), task);
    
    toast.success('Task created successfully');
    return { id: docRef.id, ...task };
  } catch (error) {
    console.error('Error creating task:', error);
    toast.error(error.message || 'Failed to create task');
    throw error;
  }
};

// Update an existing task
export const updateTask = async (companyId, taskId, taskData) => {
  try {
    checkRateLimit();
    
    // Validate required fields
    if (!taskData.title?.trim()) {
      throw new Error('Task title is required');
    }
    if (!taskData.dueDate) {
      throw new Error('Due date is required');
    }

    const updateData = {
      ...taskData,
      updatedAt: serverTimestamp()
    };

    const docRef = doc(db, `companies/${companyId}/tasks`, taskId);
    await updateDoc(docRef, updateData);
    
    toast.success('Task updated successfully');
    return { id: taskId, ...updateData };
  } catch (error) {
    console.error('Error updating task:', error);
    toast.error(error.message || 'Failed to update task');
    throw error;
  }
};

// Delete a task (soft delete)
export const deleteTask = async (companyId, taskId) => {
  try {
    checkRateLimit();
    
    const docRef = doc(db, `companies/${companyId}/tasks`, taskId);
    await updateDoc(docRef, {
      deleted: true,
      deletedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    toast.success('Task deleted successfully');
  } catch (error) {
    console.error('Error deleting task:', error);
    toast.error('Failed to delete task');
    throw error;
  }
};

// Update task status
export const updateTaskStatus = async (companyId, taskId, status) => {
  try {
    checkRateLimit();
    
    if (!TASK_STATUSES.find(s => s.value === status)) {
      throw new Error('Invalid task status');
    }

    const docRef = doc(db, `companies/${companyId}/tasks`, taskId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    });
    
    toast.success('Task status updated');
  } catch (error) {
    console.error('Error updating task status:', error);
    toast.error('Failed to update task status');
    throw error;
  }
};

// Get task statistics for dashboard
export const getTaskStats = async (companyId) => {
  try {
    checkRateLimit();
    
    const tasks = await getTasks(companyId, { limit: 1000 });
    
    const stats = {
      total: tasks.tasks.length,
      byStatus: {},
      byPriority: {},
      byType: {},
      overdue: 0,
      dueToday: 0,
      upcoming: 0,
      recentTasks: tasks.tasks
        .filter(task => !task.deleted)
        .sort((a, b) => b.createdAt?.toDate?.() - a.createdAt?.toDate?.())
        .slice(0, 5)
    };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count by status
    TASK_STATUSES.forEach(status => {
      stats.byStatus[status.value] = tasks.tasks.filter(task => 
        task.status === status.value && !task.deleted
      ).length;
    });

    // Count by priority
    TASK_PRIORITIES.forEach(priority => {
      stats.byPriority[priority.value] = tasks.tasks.filter(task => 
        task.priority === priority.value && !task.deleted
      ).length;
    });

    // Count by type
    TASK_TYPES.forEach(type => {
      stats.byType[type.value] = tasks.tasks.filter(task => 
        task.type === type.value && !task.deleted
      ).length;
    });

    // Count overdue, due today, and upcoming
    tasks.tasks.forEach(task => {
      if (task.deleted) return;
      
      const taskDate = task.dueDate ? new Date(task.dueDate) : null;
      if (!taskDate) return;

      if (taskDate < today && task.status !== 'completed') {
        stats.overdue++;
      } else if (taskDate.toDateString() === today.toDateString()) {
        stats.dueToday++;
      } else if (taskDate > today && taskDate <= new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)) {
        stats.upcoming++;
      }
    });

    return stats;
  } catch (error) {
    console.error('Error fetching task stats:', error);
    return {
      total: 0,
      byStatus: {},
      byPriority: {},
      byType: {},
      overdue: 0,
      dueToday: 0,
      upcoming: 0,
      recentTasks: []
    };
  }
};

// Get tasks by customer
export const getTasksByCustomer = async (companyId, customerId) => {
  try {
    checkRateLimit();
    
    return await getTasks(companyId, { customerId });
  } catch (error) {
    console.error('Error fetching customer tasks:', error);
    toast.error('Failed to load customer tasks');
    throw error;
  }
};

// Get tasks assigned to a specific user
export const getTasksByAssignee = async (companyId, assignedTo) => {
  try {
    checkRateLimit();
    
    return await getTasks(companyId, { assignedTo });
  } catch (error) {
    console.error('Error fetching assignee tasks:', error);
    toast.error('Failed to load assignee tasks');
    throw error;
  }
};

// Export tasks to CSV
export const exportTasks = async (companyId, options = {}) => {
  try {
    checkRateLimit();
    
    const tasks = await getTasks(companyId, { ...options, limit: 1000 });
    
    const csvData = tasks.tasks.map(task => ({
      'Task Title': task.title || '',
      'Description': task.description || '',
      'Customer': task.customer || '',
      'Assigned To': task.assignedTo || '',
      'Status': task.status || '',
      'Priority': task.priority || '',
      'Type': task.type || '',
      'Due Date': task.dueDate ? new Date(task.dueDate).toLocaleDateString('sv-SE') : '',
      'Created': task.createdAt?.toDate?.()?.toLocaleDateString('sv-SE') || '',
      'Updated': task.updatedAt?.toDate?.()?.toLocaleDateString('sv-SE') || ''
    }));

    return csvData;
  } catch (error) {
    console.error('Error exporting tasks:', error);
    toast.error('Failed to export tasks');
    throw error;
  }
}; 