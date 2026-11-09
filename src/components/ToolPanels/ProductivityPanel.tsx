import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  FileText,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  Tag,
  Clock,
  CheckCircle2,
  Circle,
} from 'lucide-react';
import { db } from '../../services/db';
import { TaskItem, NoteItem } from '../../types';

export const ProductivityPanel: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'tasks' | 'notes'>('tasks');
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [notes, setNotes] = useState<NoteItem[]>([]);

  // Task form state
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDueDate, setTaskDueDate] = useState('');
  const [taskPriority, setTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');

  // Note form state
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTags, setNoteTags] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [allTasks, allNotes] = await Promise.all([
      db.tasks.reverse().toArray(),
      db.notes.reverse().toArray(),
    ]);
    setTasks(allTasks);
    setNotes(allNotes);
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;

    const newTask: TaskItem = {
      title: taskTitle.trim(),
      dueDate: taskDueDate || 'Today',
      priority: taskPriority,
      completed: false,
      createdAt: new Date().toISOString(),
    };

    const id = await db.tasks.add(newTask);
    newTask.id = id;
    setTasks([newTask, ...tasks]);
    setTaskTitle('');
    setTaskDueDate('');
  };

  const handleToggleTask = async (task: TaskItem) => {
    if (!task.id) return;
    const newCompleted = !task.completed;
    await db.tasks.update(task.id, { completed: newCompleted });
    setTasks(tasks.map((t) => (t.id === task.id ? { ...t, completed: newCompleted } : t)));
  };

  const handleDeleteTask = async (id?: number) => {
    if (!id) return;
    await db.tasks.delete(id);
    setTasks(tasks.filter((t) => t.id !== id));
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) return;

    const newNote: NoteItem = {
      title: noteTitle.trim(),
      content: noteContent.trim(),
      tags: noteTags
        ? noteTags.split(',').map((t) => t.trim()).filter(Boolean)
        : ['general'],
      updatedAt: new Date().toISOString(),
    };

    const id = await db.notes.add(newNote);
    newNote.id = id;
    setNotes([newNote, ...notes]);
    setNoteTitle('');
    setNoteContent('');
    setNoteTags('');
  };

  const handleDeleteNote = async (id?: number) => {
    if (!id) return;
    await db.notes.delete(id);
    setNotes(notes.filter((n) => n.id !== id));
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 pb-12 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-mono tracking-wide text-white flex items-center gap-2.5">
            <CheckSquare className="w-6 h-6 text-cyan-400" />
            Productivity: Tasks & Notes
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Local-first task planner and note-taking system. Accessible offline and saved in your device storage.
          </p>
        </div>

        {/* Sub-tab pills */}
        <div className="flex p-1 rounded-xl bg-[#090e1c] border border-cyan-900/30">
          <button
            onClick={() => setActiveSubTab('tasks')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all ${
              activeSubTab === 'tasks'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveSubTab('notes')}
            className={`px-4 py-1.5 rounded-lg text-xs font-mono transition-all ${
              activeSubTab === 'notes'
                ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Notes ({notes.length})
          </button>
        </div>
      </div>

      {activeSubTab === 'tasks' ? (
        /* TASKS VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Task Form */}
          <form
            onSubmit={handleAddTask}
            className="bg-[#090e1c]/80 border border-cyan-900/30 rounded-2xl p-5 space-y-4"
          >
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Create New Task</span>
            </h3>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Task Title
              </label>
              <input
                type="text"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
                placeholder="What needs to be done?"
                className="w-full bg-black/40 border border-cyan-900/40 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Due Date / Time
              </label>
              <input
                type="text"
                value={taskDueDate}
                onChange={(e) => setTaskDueDate(e.target.value)}
                placeholder="e.g. Today 5 PM, Friday"
                className="w-full bg-black/40 border border-cyan-900/40 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Priority
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {(['low', 'medium', 'high'] as const).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setTaskPriority(p)}
                    className={`py-1.5 rounded-lg text-xs font-mono capitalize transition-all ${
                      taskPriority === p
                        ? p === 'high'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                          : p === 'medium'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={!taskTitle.trim()}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-medium text-xs font-mono flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>

            <div className="pt-2 text-[11px] font-mono text-cyan-300/80 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Voice: "Hey NOVA, add task buy groceries"</span>
            </div>
          </form>

          {/* Task List */}
          <div className="lg:col-span-2 space-y-2.5">
            {tasks.length === 0 ? (
              <div className="py-24 text-center text-slate-500 text-sm border border-white/5 rounded-2xl bg-[#090e1c]/40">
                No active tasks. Add one or tell NOVA to create one with your voice.
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${
                    task.completed
                      ? 'bg-white/[0.01] border-white/5 text-slate-500'
                      : 'bg-[#090e1c]/80 border-cyan-900/30 text-slate-200 hover:border-cyan-500/30'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button
                      onClick={() => handleToggleTask(task)}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors shrink-0"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <div
                        className={`text-sm font-medium truncate ${
                          task.completed ? 'line-through text-slate-500' : 'text-slate-100'
                        }`}
                      >
                        {task.title}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.dueDate}
                        </span>
                        <span>•</span>
                        <span
                          className={`uppercase font-semibold ${
                            task.priority === 'high'
                              ? 'text-rose-400'
                              : task.priority === 'medium'
                              ? 'text-amber-400'
                              : 'text-emerald-400'
                          }`}
                        >
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-white/5 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* NOTES VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Add Note Form */}
          <form
            onSubmit={handleAddNote}
            className="bg-[#090e1c]/80 border border-cyan-900/30 rounded-2xl p-5 space-y-4"
          >
            <h3 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-2">
              <Plus className="w-4 h-4" />
              <span>Capture New Note</span>
            </h3>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Note Title
              </label>
              <input
                type="text"
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Title or meeting topic..."
                className="w-full bg-black/40 border border-cyan-900/40 rounded-xl px-3.5 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Content
              </label>
              <textarea
                rows={5}
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                placeholder="Thoughts, research findings, code ideas..."
                className="w-full bg-black/40 border border-cyan-900/40 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                Tags (Comma separated)
              </label>
              <input
                type="text"
                value={noteTags}
                onChange={(e) => setNoteTags(e.target.value)}
                placeholder="ideas, marketing, dev"
                className="w-full bg-black/40 border border-cyan-900/40 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
            </div>

            <button
              type="submit"
              disabled={!noteTitle.trim()}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 font-medium text-xs font-mono flex items-center justify-center gap-1.5 transition-colors shadow-lg shadow-cyan-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Save Note</span>
            </button>
          </form>

          {/* Notes Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {notes.length === 0 ? (
              <div className="sm:col-span-2 py-24 text-center text-slate-500 text-sm border border-white/5 rounded-2xl bg-[#090e1c]/40">
                No saved notes. Create one above or speak: "Hey NOVA, save a note..."
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="bg-[#090e1c]/80 border border-cyan-900/30 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-cyan-500/30 transition-all shadow-md"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-semibold text-white tracking-wide">{note.title}</h4>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap line-clamp-6">
                      {note.content}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-slate-500">
                    <div className="flex flex-wrap gap-1">
                      {note.tags.map((t, idx) => (
                        <span key={idx} className="px-1.5 py-0.5 rounded bg-cyan-950/50 text-cyan-400 border border-cyan-500/20">
                          #{t}
                        </span>
                      ))}
                    </div>
                    <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
