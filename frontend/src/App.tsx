import { useCallback, useEffect, useMemo, useState } from 'react'
import './App.css'

type Note = {
  id: number
  title: string
  content: string
  created_at: string
}

type Resource = {
  id: number
  title: string
  technology: string
  level: string
  description: string
  url: string
}

const technologies = [
  'All',
  'Linux',
  'AWS',
  'Docker',
  'Kubernetes',
  'Terraform',
  'Jenkins',
  'Git',
]

function App() {
  const [notes, setNotes] = useState<Note[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [resources, setResources] = useState<Resource[]>([])
  const [resourceSearch, setResourceSearch] = useState('')
  const [technology, setTechnology] = useState('All')
  const [resourceLoading, setResourceLoading] = useState(false)
  const [resourceError, setResourceError] = useState('')

  const loadNotes = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/notes')

      if (!response.ok) {
        throw new Error('Could not load notes from the server.')
      }

      const data: Note[] = await response.json()
      setNotes(data)
    } catch {
      setError('Unable to connect to LearnLens AI. Check that the backend is running.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loadResources = useCallback(async () => {
    setResourceLoading(true)
    setResourceError('')

    try {
      const params = new URLSearchParams()

      if (technology !== 'All') {
        params.set('technology', technology)
      }

      if (resourceSearch.trim()) {
        params.set('search', resourceSearch.trim())
      }

      const query = params.toString()
      const response = await fetch(`/api/resources${query ? `?${query}` : ''}`)

      if (!response.ok) {
        throw new Error('Could not load learning resources.')
      }

      const data: { count: number; resources: Resource[] } =
        await response.json()

      setResources(data.resources)
    } catch {
      setResourceError('Unable to load resources. Please try again.')
    } finally {
      setResourceLoading(false)
    }
  }, [technology, resourceSearch])

  useEffect(() => {
    void loadNotes()
  }, [loadNotes])

  useEffect(() => {
    void loadResources()
  }, [loadResources])

  const filteredNotes = useMemo(() => {
    const query = search.toLowerCase().trim()

    if (!query) return notes

    return notes.filter((note) =>
      `${note.title} ${note.content}`.toLowerCase().includes(query)
    )
  }, [notes, search])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!title.trim() || !content.trim()) {
      setError('Please enter both a title and note content.')
      return
    }

    setSaving(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/notes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      })

      if (!response.ok) {
        throw new Error('Could not save your note.')
      }

      setTitle('')
      setContent('')
      setSuccess('Your note was saved successfully.')
      await loadNotes()
    } catch {
      setError('Unable to save your note. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleString()
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">L</div>
          <div>
            <h1>LearnLens</h1>
            <span>AI Knowledge Hub</span>
          </div>
        </div>

        <nav className="navigation">
          <a className="nav-link active" href="#dashboard">
            <span>▦</span> Dashboard
          </a>
          <a className="nav-link" href="#resource-finder">
            <span>⌕</span> Resource Finder
          </a>
          <a className="nav-link" href="#create-note">
            <span>＋</span> Create note
          </a>
          <a className="nav-link" href="#saved-notes">
            <span>▤</span> My notes
          </a>
        </nav>

        <div className="sidebar-bottom">
          <div className="status-dot" />
          <span>LearnLens API workspace</span>
          <small>Version 1.1.0</small>
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR PERSONAL KNOWLEDGE SPACE</p>
            <h2>Dashboard</h2>
          </div>
          <div className="user-avatar">LL</div>
        </header>

        <section className="welcome-section">
          <div>
            <p className="welcome-label">WELCOME TO LEARNLENS AI</p>
            <h2>Turn what you learn into knowledge.</h2>
            <p className="welcome-description">
              Discover learning resources, save your ideas, and organize your
              developer knowledge in one place.
            </p>
          </div>
          <div className="welcome-art" aria-hidden="true">
            <span>✦</span>
            <div className="art-card">Aa</div>
            <span>✧</span>
          </div>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon purple">▤</span>
            <div>
              <p>Total notes</p>
              <strong>{notes.length}</strong>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon green">✓</span>
            <div>
              <p>Backend</p>
              <strong className="connected-text">Connected</strong>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon orange">⚡</span>
            <div>
              <p>Learning resources</p>
              <strong>{resources.length} available</strong>
            </div>
          </div>
        </section>

        <section className="panel resource-panel" id="resource-finder">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">LEARN SOMETHING NEW</p>
              <h3>Learning Resource Finder</h3>
            </div>
            <span className="heading-icon">⌕</span>
          </div>

          <p className="resource-intro">
            Explore curated documentation and tutorials for popular DevOps
            technologies.
          </p>

          <div className="resource-search">
            <span>⌕</span>
            <input
              type="search"
              placeholder="Search resources or technologies..."
              value={resourceSearch}
              onChange={(event) => setResourceSearch(event.target.value)}
            />
          </div>

          <div className="technology-filters" aria-label="Filter by technology">
            {technologies.map((item) => (
              <button
                type="button"
                key={item}
                className={`technology-filter ${technology === item ? 'selected' : ''}`}
                onClick={() => setTechnology(item)}
                aria-pressed={technology === item}
              >
                {item}
              </button>
            ))}
          </div>

          {resourceError && (
            <p className="message error-message">{resourceError}</p>
          )}

          {resourceLoading ? (
            <div className="empty-state">Loading learning resources...</div>
          ) : resources.length === 0 ? (
            <div className="empty-state">
              <span className="empty-icon">⌕</span>
              <h4>No resources found</h4>
              <p>Try another keyword or technology.</p>
            </div>
          ) : (
            <div className="resource-grid">
              {resources.map((resource) => (
                <article className="resource-card" key={resource.id}>
                  <div className="resource-card-top">
                    <span className="resource-technology">
                      {resource.technology}
                    </span>
                    <span className="resource-level">{resource.level}</span>
                  </div>
                  <h4>{resource.title}</h4>
                  <p>{resource.description}</p>
                  <a
                    className="resource-link"
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Explore resource <span>↗</span>
                  </a>
                </article>
              ))}
            </div>
          )}

          <p className="collection-footer">
            Showing {resources.length} learning resources
          </p>
        </section>

        <section className="workspace-grid">
          <div className="panel create-panel" id="create-note">
            <div className="panel-heading">
              <div>
                <p className="eyebrow">CAPTURE AN IDEA</p>
                <h3>Create a new note</h3>
              </div>
              <span className="heading-icon">＋</span>
            </div>

            <form onSubmit={handleSubmit}>
              <label htmlFor="note-title">Note title</label>
              <input
                id="note-title"
                type="text"
                placeholder="e.g. Docker networking"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                maxLength={255}
                required
              />

              <label htmlFor="note-content">Your notes</label>
              <textarea
                id="note-content"
                placeholder="Write what you learned today..."
                value={content}
                onChange={(event) => setContent(event.target.value)}
                rows={6}
                required
              />

              <button className="save-button" type="submit" disabled={saving}>
                {saving ? 'Saving...' : '＋ Save note'}
              </button>
            </form>

            {error && <p className="message error-message">{error}</p>}
            {success && <p className="message success-message">{success}</p>}
          </div>

          <div className="panel notes-panel" id="saved-notes">
            <div className="panel-heading notes-heading">
              <div>
                <p className="eyebrow">YOUR COLLECTION</p>
                <h3>Saved notes</h3>
              </div>
              <button
                className="refresh-button"
                onClick={() => void loadNotes()}
                disabled={loading}
                type="button"
              >
                ↻ Refresh
              </button>
            </div>

            <div className="search-box">
              <span>⌕</span>
              <input
                type="search"
                placeholder="Search your notes..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            {loading ? (
              <div className="empty-state">Loading your notes...</div>
            ) : filteredNotes.length === 0 ? (
              <div className="empty-state">
                <span className="empty-icon">▤</span>
                <h4>{search ? 'No matching notes' : 'No notes yet'}</h4>
                <p>
                  {search
                    ? 'Try another search term.'
                    : 'Create your first note to start building your knowledge library.'}
                </p>
              </div>
            ) : (
              <div className="notes-list">
                {filteredNotes.map((note) => (
                  <article className="note-card" key={note.id}>
                    <div className="note-card-top">
                      <span className="note-number">
                        NOTE #{String(note.id).padStart(3, '0')}
                      </span>
                      <span className="note-indicator" />
                    </div>
                    <h4>{note.title}</h4>
                    <p className="note-content">{note.content}</p>
                    <div className="note-date">
                      <span>◷</span> {formatDate(note.created_at)}
                    </div>
                  </article>
                ))}
              </div>
            )}

            <p className="collection-footer">
              Showing {filteredNotes.length} of {notes.length} notes
            </p>
          </div>
        </section>

        <footer className="footer">
          <span>LearnLens AI</span>
          <span>Built for curious minds and lifelong learners.</span>
        </footer>
      </main>
    </div>
  )
}

export default App
