import { useEffect, useMemo, useState } from "react";

const filters = [
  { id: "all", label: "All tasks" },
  { id: "active", label: "To do" },
  { id: "completed", label: "Completed" },
];

async function requestTasks(path = "", options = {}) {
  const response = await fetch(`/api/tasks${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed (${response.status})`);
  }

  return response.status === 204 ? null : response.json();
}

function formatDate(date) {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(date);
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [newTask, setNewTask] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    requestTasks("", { signal: controller.signal })
      .then(setTasks)
      .catch((requestError) => {
        if (requestError.name !== "AbortError") {
          setError("Couldn't connect to the to-do service. Make sure the API and database are running, then try again.");
          console.error("Could not load tasks.", requestError);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, []);

  const visibleTasks = useMemo(() => {
    if (filter === "active") return tasks.filter((task) => !task.completed);
    if (filter === "completed") return tasks.filter((task) => task.completed);
    return tasks;
  }, [filter, tasks]);

  const remainingCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.length - remainingCount;

  async function addTask(event) {
    event.preventDefault();
    const title = newTask.trim();
    if (!title || isSaving) return;

    setIsSaving(true);
    setError("");
    try {
      const task = await requestTasks("", {
        method: "POST",
        body: JSON.stringify({ title }),
      });
      setTasks((currentTasks) => [task, ...currentTasks]);
      setNewTask("");
    } catch (requestError) {
      setError("Couldn't add the task. Please try again.");
      console.error("Could not add task.", requestError);
    } finally {
      setIsSaving(false);
    }
  }

  async function toggleTask(task) {
    if (isSaving) return;
    setIsSaving(true);
    setError("");
    try {
      const updatedTask = await requestTasks(`/${task.id}`, {
        method: "PATCH",
        body: JSON.stringify({ completed: !task.completed }),
      });
      setTasks((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === task.id ? updatedTask : currentTask,
        ),
      );
    } catch (requestError) {
      setError("Couldn't update the task. Please try again.");
      console.error("Could not update task.", requestError);
    } finally {
      setIsSaving(false);
    }
  }

  async function deleteTask(id) {
    if (isSaving) return;
    setIsSaving(true);
    setError("");
    try {
      await requestTasks(`/${id}`, { method: "DELETE" });
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
    } catch (requestError) {
      setError("Couldn't delete the task. Please try again.");
      console.error("Could not delete task.", requestError);
    } finally {
      setIsSaving(false);
    }
  }

  async function clearCompleted() {
    if (isSaving) return;
    setIsSaving(true);
    setError("");
    try {
      await requestTasks("/completed", { method: "DELETE" });
      setTasks((currentTasks) => currentTasks.filter((task) => !task.completed));
    } catch (requestError) {
      setError("Couldn't clear completed tasks. Please try again.");
      console.error("Could not clear completed tasks.", requestError);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <a className="brand" href="/" aria-label="Daylight home">
          <span className="brand-mark" aria-hidden="true">d</span>
          <span>daylight</span>
        </a>

        <div className="sidebar-label">YOUR SPACE</div>
        <nav className="filter-list" aria-label="Task filters">
          {filters.map((item) => {
            const count =
              item.id === "all"
                ? tasks.length
                : item.id === "active"
                  ? remainingCount
                  : completedCount;

            return (
              <button
                className={`filter-button ${filter === item.id ? "is-selected" : ""}`}
                key={item.id}
                onClick={() => setFilter(item.id)}
                type="button"
                aria-current={filter === item.id ? "page" : undefined}
              >
                <span className={`filter-icon icon-${item.id}`} aria-hidden="true">
                  {item.id === "all" ? "▦" : item.id === "active" ? "○" : "✓"}
                </span>
                <span>{item.label}</span>
                <span className="filter-count">{count}</span>
              </button>
            );
          })}
        </nav>

        <div className="sidebar-note">
          <span className="note-sparkle" aria-hidden="true">✳</span>
          <p>Small steps add up.</p>
          <span>Keep going at your own pace.</span>
        </div>
        <div className="sidebar-footer">A little more focus, every day.</div>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <span className="today-label">YOUR PERSONAL SPACE</span>
          <span className="today-date">{formatDate(new Date())}</span>
        </header>

        <div className="content">
          {error && <div className="error-banner" role="alert">{error}</div>}
          <div className="page-heading">
            <div>
              <div className="eyebrow">A FRESH PAGE</div>
              <h1>{filter === "completed" ? "Well done." : "Today, at your pace."}</h1>
              <p className="page-subtitle">
                {remainingCount === 0
                  ? "Your mind is clear. What would you like to do next?"
                  : `You have ${remainingCount} ${remainingCount === 1 ? "thing" : "things"} on your list. One step at a time.`}
              </p>
            </div>
            <div className="progress-card" aria-label={`${completedCount} of ${tasks.length} tasks completed`}>
              <span className="progress-ring" style={{ "--progress": tasks.length ? `${(completedCount / tasks.length) * 100}%` : "0%" }}>
                <span>{tasks.length ? Math.round((completedCount / tasks.length) * 100) : 0}<small>%</small></span>
              </span>
              <span className="progress-copy">
                <strong>{completedCount} of {tasks.length}</strong>
                <span>tasks complete</span>
              </span>
            </div>
          </div>

          <form className="add-task-form" onSubmit={addTask}>
            <span className="add-icon" aria-hidden="true">+</span>
            <label className="visually-hidden" htmlFor="new-task">Add a task</label>
            <input
              id="new-task"
              onChange={(event) => setNewTask(event.target.value)}
              placeholder="What needs your attention?"
              value={newTask}
              maxLength={180}
            />
            <button type="submit" disabled={!newTask.trim() || isSaving}>Add task</button>
          </form>

          <div className="list-heading">
            <div>
              <h2>{filter === "all" ? "Your list" : filters.find((item) => item.id === filter)?.label}</h2>
              <span>{visibleTasks.length} {visibleTasks.length === 1 ? "task" : "tasks"}</span>
            </div>
            {completedCount > 0 && (
              <button className="clear-button" onClick={clearCompleted} type="button" disabled={isSaving}>
                Clear completed
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="empty-state" role="status">
              <span className="empty-illustration" aria-hidden="true">…</span>
              <h3>Loading your tasks</h3>
              <p>Your list will be ready in a moment.</p>
            </div>
          ) : visibleTasks.length > 0 ? (
            <ul className="task-list">
              {visibleTasks.map((task) => (
                <li className={`task-row ${task.completed ? "is-complete" : ""}`} key={task.id}>
                  <button
                    className="task-check"
                    onClick={() => toggleTask(task)}
                    type="button"
                    disabled={isSaving}
                    aria-label={task.completed ? `Mark ${task.title} as not done` : `Mark ${task.title} as done`}
                    aria-pressed={task.completed}
                  >
                    {task.completed && <span aria-hidden="true">✓</span>}
                  </button>
                  <span className="task-title">{task.title}</span>
                  <span className="task-status">{task.completed ? "DONE" : "TO DO"}</span>
                  <button
                    className="delete-button"
                    onClick={() => deleteTask(task.id)}
                    type="button"
                    disabled={isSaving}
                    aria-label={`Delete ${task.title}`}
                    title="Delete task"
                  >
                    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
                      <path d="M4.5 6h11M8 6V4.5h4V6m2.5 0-.6 9.5H6.1L5.5 6m3 2.5v4m3-4v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="empty-state">
              <span className="empty-illustration" aria-hidden="true">
                {filter === "completed" ? "✳" : filter === "active" ? "☀" : "＋"}
              </span>
              <h3>
                {filter === "completed"
                  ? "Nothing completed just yet"
                  : filter === "active"
                    ? "You're all caught up"
                    : "A little space to begin"}
              </h3>
              <p>
                {filter === "completed"
                  ? "Finished tasks will find their way here."
                  : filter === "active"
                    ? "Take a breath. Your to-do list is clear."
                    : "Add a task above and make today yours."}
              </p>
            </div>
          )}

          <footer className="list-footer">
            <span><span className="footer-dot" /> Saved on this device</span>
            <span>Make room for what matters.</span>
          </footer>
        </div>
      </section>
    </main>
  );
}

export default App;
