import React, { useState, memo } from 'react';
import { FolderOpen, Save, Trash2, Check, X } from 'lucide-react';

const ProjectsMenu = memo(({
  isOpen,
  setIsOpen,
  projects,
  selectedProjectId,
  onSaveProject,
  onLoadProject,
  onDeleteProject,
  theme = 'dark',
}) => {
  const isLight = theme === 'light' || (typeof document !== 'undefined' && document.documentElement.classList.contains('light'));
  const [newProjectName, setNewProjectName] = useState('');

  const handleSave = () => {
    if (!newProjectName.trim()) return;
    onSaveProject(newProjectName);
    setNewProjectName('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    }
  };

  const activeProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(prev => !prev);
        }}
        className={`flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest transition-all duration-200 ease-out ${
          selectedProjectId
            ? isLight ? 'text-rose-600 hover:text-rose-700' : 'text-rose-400 hover:text-rose-300'
            : isLight ? 'text-zinc-600 hover:text-zinc-900' : 'text-zinc-600 hover:text-white'
        }`}
        title="Manage projects"
      >
        <FolderOpen
          size={12}
          className={selectedProjectId ? (isLight ? 'text-rose-600' : 'text-rose-400') : (isLight ? 'text-zinc-500' : 'text-zinc-600')}
        />
        <span>Projects</span>
        {projects.length > 0 && (
          <span className={`text-[7.5px] px-1.5 py-0.5 rounded font-mono ${
            isLight ? 'bg-black/[0.06] text-zinc-600' : 'bg-white/5 text-zinc-400'
          }`}>
            {projects.length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-[149] bg-transparent pointer-events-auto"
            onClick={() => setIsOpen(false)}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className={`absolute top-full left-0 mt-2 rounded-xl p-3.5 z-[150] w-80 space-y-2.5 animate-scale-in border ${
              isLight
                ? 'bg-white border-black/10 shadow-[0_25px_60px_rgba(0,0,0,0.38),0_10px_22px_rgba(0,0,0,0.22)] text-zinc-900'
                : 'bg-[#0d0d0d] border-white/20 shadow-[0_25px_70px_rgba(0,0,0,0.98)] text-white'
            }`}
          >
          {/* Header */}
          <div className={`flex items-center justify-between border-b pb-2 ${isLight ? 'border-black/5' : 'border-white/5'}`}>
            <div className="flex items-center gap-1.5">
              <span className={`text-[9px] font-black tracking-widest uppercase ${isLight ? 'text-zinc-700' : 'text-zinc-400'}`}>
                PROJECTS
              </span>
              <span className={`text-[7.5px] font-mono ${isLight ? 'text-zinc-500' : 'text-zinc-600'}`}>
                ({projects.length} SAVED)
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className={`p-0.5 rounded transition-colors ${isLight ? 'text-zinc-400 hover:text-zinc-900 hover:bg-black/5' : 'text-zinc-600 hover:text-white'}`}
            >
              <X size={12} />
            </button>
          </div>

          {/* Active project pill if one is loaded */}
          {activeProject && (
            <div className={`flex items-center justify-between px-2.5 py-1.5 rounded text-[8px] border ${
              isLight
                ? 'bg-rose-500/10 border-rose-500/25'
                : 'bg-rose-500/10 border-rose-500/20'
            }`}>
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                <span className={`uppercase font-bold ${isLight ? 'text-zinc-600' : 'text-zinc-400'}`}>Loaded:</span>
                <span className={`font-black uppercase truncate max-w-[120px] ${isLight ? 'text-rose-700' : 'text-rose-300'}`}>
                  {activeProject.name}
                </span>
              </div>
              <button
                onClick={() => onSaveProject(activeProject.name)}
                className={`text-[7.5px] font-bold uppercase tracking-wider underline hover:no-underline ml-1 ${
                  isLight ? 'text-rose-600 hover:text-rose-800' : 'text-rose-400 hover:text-white'
                }`}
                title="Overwrite current state to this project"
              >
                Update
              </button>
            </div>
          )}

          {/* New Project Input */}
          <div className="space-y-1">
            <span className={`text-[7.5px] font-bold uppercase tracking-wider ${isLight ? 'text-zinc-600' : 'text-zinc-500'}`}>
              Save Current Workspace
            </span>
            <div className="flex gap-1.5">
              <input
                type="text"
                placeholder="Project name..."
                value={newProjectName}
                onChange={e => setNewProjectName(e.target.value)}
                onKeyDown={handleKeyDown}
                className={`flex-1 rounded px-2 py-1 text-[8.5px] font-bold uppercase focus:outline-none focus:border-rose-500 border ${
                  isLight
                    ? 'bg-black/[0.04] border-black/10 text-zinc-900 placeholder:text-zinc-400'
                    : 'bg-white/[0.04] border-white/10 text-white placeholder:text-zinc-700'
                }`}
              />
              <button
                onClick={handleSave}
                disabled={!newProjectName.trim()}
                className={`px-2.5 py-1 rounded text-[8.5px] font-bold uppercase transition-all flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed border ${
                  isLight
                    ? 'bg-black/5 hover:bg-rose-500/15 hover:text-rose-600 text-zinc-700 border-black/10'
                    : 'bg-white/5 hover:bg-rose-500/20 hover:text-rose-400 text-zinc-300 border-white/5'
                }`}
                title="Save current workspace"
              >
                <Save size={11} />
                Save
              </button>
            </div>
          </div>

          {/* Saved Projects List */}
          <div className="space-y-1 pt-1">
            <span className={`text-[7.5px] font-bold uppercase tracking-wider ${isLight ? 'text-zinc-600' : 'text-zinc-500'}`}>
              Saved Workspaces
            </span>
            <div className="max-h-40 overflow-y-auto custom-scrollbar space-y-1 pr-0.5">
              {projects.length === 0 ? (
                <div className={`py-4 text-center text-[8px] font-black uppercase ${isLight ? 'text-zinc-400' : 'text-zinc-700'}`}>
                  No projects saved yet
                </div>
              ) : (
                projects.map(project => {
                  const isSelected = selectedProjectId === project.id;
                  const dateStr = project.createdAt
                    ? new Date(project.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })
                    : '';
                  return (
                    <div
                      key={project.id}
                      className={`group flex items-center justify-between p-1.5 rounded border transition-all duration-200 ${
                        isSelected
                          ? isLight ? 'bg-rose-500/10 border-rose-500/30' : 'bg-rose-500/15 border-rose-500/30'
                          : isLight
                            ? 'bg-black/[0.02] border-black/5 hover:bg-black/[0.05] hover:border-black/10'
                            : 'bg-white/[0.02] border-white/5 hover:bg-white/[0.05] hover:border-white/10'
                      }`}
                    >
                      <button
                        onClick={() => {
                          onLoadProject(project.id);
                          setIsOpen(false);
                        }}
                        className={`flex items-center gap-2 flex-1 text-left min-w-0 ${
                          isSelected
                            ? isLight ? 'text-rose-600 font-bold' : 'text-rose-400 font-bold'
                            : isLight ? 'text-zinc-700 group-hover:text-zinc-950' : 'text-zinc-400 group-hover:text-white'
                        }`}
                        title={`Load "${project.name}"`}
                      >
                        <FolderOpen
                          size={11}
                          className={isSelected ? (isLight ? 'text-rose-600' : 'text-rose-400') : (isLight ? 'text-zinc-400 group-hover:text-zinc-600' : 'text-zinc-600')}
                        />
                        <span className="text-[8.5px] font-bold uppercase truncate max-w-[130px]">
                          {project.name}
                        </span>
                        {dateStr && (
                          <span className={`text-[7px] ml-auto font-mono ${isLight ? 'text-zinc-400' : 'text-zinc-600'}`}>
                            {dateStr}
                          </span>
                        )}
                        {isSelected && (
                          <Check size={10} className={`${isLight ? 'text-rose-600' : 'text-rose-400'} shrink-0 ml-1`} />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteProject(project.id);
                        }}
                        className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ml-1 ${
                          isLight
                            ? 'text-zinc-400 hover:text-rose-600 hover:bg-rose-500/10'
                            : 'text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10'
                        }`}
                        title="Delete project"
                      >
                        <Trash2 size={11} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
        </>
      )}
    </div>
  );
});

ProjectsMenu.displayName = 'ProjectsMenu';
export default ProjectsMenu;
