/**
 * Mock data for Study Dashboard
 * This structure matches the expected backend response format
 * Replace this with actual API calls when backend is ready
 */

export interface WeeklyActivity {
  day: string;
  tasks: number;
  timeSpent: number; // minutes
}

export interface TopicProgress {
  id: string;
  name: string;
  progress: number; // 0-100
  tasksCompleted: number;
  tasksTotal: number;
  accuracy: number; // 0-100
}

export interface RecentActivity {
  id: string;
  timestamp: Date;
  topic: string;
  result: 'correct' | 'incorrect';
  timeSpent: number; // minutes
  taskType: string;
}

export interface StudyDashboardData {
  totals: {
    tasksSolved: number;
    tasksTotal: number;
    timeSpent: number; // minutes
    accuracy: number; // 0-100
  };
  today: {
    tasksSolved: number;
    timeSpent: number; // minutes
  };
  streak: {
    current: number; // days
    longest: number; // days
  };
  weeklyActivity: WeeklyActivity[];
  topics: TopicProgress[];
  recent: RecentActivity[];
  weakAreas: string[];
}

// Mock data
export const mockStudyDashboard: StudyDashboardData = {
  totals: {
    tasksSolved: 342,
    tasksTotal: 500,
    timeSpent: 2840, // ~47 hours
    accuracy: 78,
  },
  today: {
    tasksSolved: 12,
    timeSpent: 35,
  },
  streak: {
    current: 7,
    longest: 14,
  },
  weeklyActivity: [
    { day: 'Пн', tasks: 8, timeSpent: 25 },
    { day: 'Вт', tasks: 12, timeSpent: 40 },
    { day: 'Ср', tasks: 15, timeSpent: 45 },
    { day: 'Чт', tasks: 10, timeSpent: 30 },
    { day: 'Пт', tasks: 18, timeSpent: 55 },
    { day: 'Сб', tasks: 5, timeSpent: 15 },
    { day: 'Вс', tasks: 12, timeSpent: 35 },
  ],
  topics: [
    {
      id: '1',
      name: 'Алгебра',
      progress: 85,
      tasksCompleted: 85,
      tasksTotal: 100,
      accuracy: 82,
    },
    {
      id: '2',
      name: 'Геометрия',
      progress: 72,
      tasksCompleted: 72,
      tasksTotal: 100,
      accuracy: 75,
    },
    {
      id: '3',
      name: 'Текстовые задачи',
      progress: 65,
      tasksCompleted: 65,
      tasksTotal: 100,
      accuracy: 70,
    },
    {
      id: '4',
      name: 'Тригонометрия',
      progress: 58,
      tasksCompleted: 58,
      tasksTotal: 100,
      accuracy: 68,
    },
    {
      id: '5',
      name: 'Производные',
      progress: 45,
      tasksCompleted: 45,
      tasksTotal: 100,
      accuracy: 72,
    },
  ],
  recent: [
    {
      id: '1',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 min ago
      topic: 'Алгебра',
      result: 'correct',
      timeSpent: 5,
      taskType: 'Квадратные уравнения',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      topic: 'Геометрия',
      result: 'correct',
      timeSpent: 8,
      taskType: 'Площадь треугольника',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      topic: 'Текстовые задачи',
      result: 'incorrect',
      timeSpent: 12,
      taskType: 'Задачи на движение',
    },
    {
      id: '4',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      topic: 'Тригонометрия',
      result: 'correct',
      timeSpent: 6,
      taskType: 'Синусы и косинусы',
    },
    {
      id: '5',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      topic: 'Алгебра',
      result: 'correct',
      timeSpent: 4,
      taskType: 'Линейные уравнения',
    },
  ],
  weakAreas: ['Текстовые задачи', 'Тригонометрия'],
};

