import { X } from 'lucide-react';
import { useState } from 'react';

export default function AddTaskModal({ onClose }) {
  const [priority, setPriority] = useState('Medium');

  const getPriorityColor = (p) => {
    if (priority === p) {
      if (p === 'High') return 'bg-primary text-white';
      if (p === 'Medium') return 'bg-accent text-background';
      return 'bg-success text-background';
    }
    return 'text-textSecondary hover:text-white hover:bg-white/5';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-surface border border-border w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-200">
        
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <h2 className="font-display font-bold text-xl text-white">Add New Task</h2>
          <button 
            onClick={onClose}
            className="text-textSecondary hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <input 
              type="text" 
              placeholder="What needs to be done?" 
              className="w-full bg-transparent border-none text-lg text-white placeholder:text-textSecondary/50 focus:outline-none focus:ring-0 px-0"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-textSecondary uppercase tracking-wider">Category</label>
              <select className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer">
                <option>Work</option>
                <option>Study</option>
                <option>Personal</option>
                <option>Health</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-textSecondary uppercase tracking-wider">Priority</label>
              <div className="flex bg-background border border-border rounded-xl p-1">
                {['Low', 'Medium', 'High'].map(p => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`flex-1 text-xs py-1.5 rounded-lg font-medium transition-colors ${getPriorityColor(p)}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-textSecondary uppercase tracking-wider">Est. Time (Min)</label>
              <input 
                type="number" 
                defaultValue="25"
                className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-textSecondary uppercase tracking-wider">Due</label>
              <select className="w-full bg-background border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary transition-colors appearance-none cursor-pointer">
                <option>Today</option>
                <option>Tomorrow</option>
                <option>Next Week</option>
              </select>
            </div>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-border bg-background/50 flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-textSecondary hover:text-white hover:bg-white/5 transition-colors"
          >
            Cancel
          </button>
          <button 
            className="px-6 py-2.5 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            Add Task
          </button>
        </div>

      </div>
    </div>
  );
}
