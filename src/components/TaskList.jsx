import { Play, MoreVertical } from 'lucide-react';

const todayTasks = [
  { id: 1, title: 'Finish Figma Mockups', category: 'Dev', categoryColor: 'bg-emerald-500/10 text-emerald-500', time: '25min', completed: false },
  { id: 2, title: 'Review PRs', category: 'Work', categoryColor: 'bg-blue-500/10 text-blue-500', time: '1hr', completed: true },
];

const upcomingTasks = [
  { id: 3, title: 'Read chapter 2 of GET 203', category: 'Study', categoryColor: 'bg-amber-500/10 text-amber-500', time: '1hr', completed: false },
  { id: 4, title: 'Gym session', category: 'Health', categoryColor: 'bg-purple-500/10 text-purple-500', time: '1.5hr', completed: false },
];

function TaskItem({ task }) {
  return (
    <div className={`group flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:border-border hover:bg-surface/50 transition-all duration-300 ${task.completed ? 'opacity-50' : ''}`}>
      <button className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors ${task.completed ? 'bg-primary border-primary' : 'border-border hover:border-primary'}`}>
        {task.completed && <div className="w-2 h-2 bg-white rounded-full" />}
      </button>
      
      <div className="flex-1 min-w-0">
        <h4 className={`text-base font-medium truncate ${task.completed ? 'line-through text-textSecondary' : 'text-textPrimary'}`}>
          {task.title}
        </h4>
        <div className="flex items-center gap-3 mt-1.5">
          <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${task.categoryColor}`}>
            {task.category}
          </span>
          <span className="text-xs text-textSecondary flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            {task.time}
          </span>
        </div>
      </div>
      
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button className="p-2 text-textSecondary hover:text-primary hover:bg-primary/10 rounded-lg transition-colors">
          <Play size={18} />
        </button>
        <button className="p-2 text-textSecondary hover:text-white hover:bg-white/10 rounded-lg transition-colors">
          <MoreVertical size={18} />
        </button>
      </div>
    </div>
  );
}

export default function TaskList() {
  return (
    <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
      <div>
        <h3 className="font-semibold text-textSecondary uppercase tracking-wider text-xs mb-4 px-4">Today's Tasks</h3>
        <div className="space-y-1">
          {todayTasks.map(task => <TaskItem key={task.id} task={task} />)}
        </div>
      </div>
      
      <div>
        <h3 className="font-semibold text-textSecondary uppercase tracking-wider text-xs mb-4 px-4">Upcoming</h3>
        <div className="space-y-1">
          {upcomingTasks.map(task => <TaskItem key={task.id} task={task} />)}
        </div>
      </div>
    </div>
  );
}
