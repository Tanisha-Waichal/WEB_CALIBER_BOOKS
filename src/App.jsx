import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [data, setData] = useState([])
  const [search, setSearch] = useState('')
  const [yearFilter, setYearFilter] = useState('All Years')
  const [sortBy, setSortBy] = useState('Sort By')
  const [currentPage, setCurrentPage] = useState(1)
  const [darkMode, setDarkMode] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const booksPerPage = 9

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true)
        const response = await axios.get('/books.json')
        const books = Array.isArray(response.data) ? response.data : response.data.data || response.data
        console.log('Books fetched:', books)
        setData(books)
        setError('')
      } catch (err) {
        console.error('Error fetching books:', err)
        setError('Failed to load books. Please try again later.')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  const filteredBooks = [...data]
    .filter((book) => {
      const query = search.toLowerCase()
      const matchesSearch =
        !query ||
        (book.title && book.title.toLowerCase().includes(query)) ||
        (book.author && book.author.toLowerCase().includes(query))

      const matchesYear =
        yearFilter === 'All Years' ||
        (yearFilter === 'Before 2000' && Number(book.publishedYear) < 2000) ||
        (yearFilter === '2000 and After' && Number(book.publishedYear) >= 2000)

      return matchesSearch && matchesYear
    })
    .sort((a, b) => {
      if (sortBy === 'Title A-Z') {
        return (a.title || '').localeCompare(b.title || '')
      }

      if (sortBy === 'Title Z-A') {
        return (b.title || '').localeCompare(a.title || '')
      }

      return 0
    })

  const totalPages = Math.max(1, Math.ceil(filteredBooks.length / booksPerPage))
  const indexOfLastBook = currentPage * booksPerPage
  const indexOfFirstBook = indexOfLastBook - booksPerPage
  const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook)

  useEffect(() => {
    setCurrentPage(1)
  }, [search, yearFilter, sortBy])

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1)
    }
  }

  const getPageNumbers = () => {
    const pages = []
    const maxPagesToShow = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
    let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }

    for (let i = startPage; i <= endPage; i += 1) {
      pages.push(i)
    }
    return pages
  }

  return (
    <div className={`app-wrapper ${darkMode ? 'dark-mode' : ''}`}>
      <header className="app-header">
        <div className="header-container">
          <div className="brand-section">
            <span className="brand-icon">📚</span>
            <div className="brand-info">
              <h1>BookHunt</h1>
              <p>Discover your next favourite book</p>
            </div>
          </div>

          <button
            type="button"
            className="theme-btn"
            onClick={() => setDarkMode(!darkMode)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      <main className="app-main">
        <div className="content-wrapper">
          <section className="hero-section">
            <h2>Find Your Next Book</h2>
            <p>Search and explore thousands of books</p>

            <div className="search-container">
              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search for a book by title or author..."
                className="search-input"
              />
              <button type="button" className="search-btn">
                🔍 Search
              </button>
            </div>
          </section>

          <section className="filters-section">
            <select
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value)}
              className="filter-select"
            >
              <option>All Years</option>
              <option>Before 2000</option>
              <option>2000 and After</option>
            </select>

            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="filter-select"
            >
              <option>Sort By</option>
              <option>Title A-Z</option>
              <option>Title Z-A</option>
            </select>

            <div className="results-badge">
              {filteredBooks.length} books found
            </div>
          </section>

          <section className="books-section">
            {loading ? (
              <div className="state-box loading-state">
                <span className="spinner">📚</span>
                <p>Loading books...</p>
              </div>
            ) : error ? (
              <div className="state-box error-state">
                <p>{error}</p>
              </div>
            ) : currentBooks.length > 0 ? (
              <>
                <div className="books-grid">
                  {currentBooks.map((book, index) => (
                    <article key={`${book.id}-${index}`} className="book-card">
                      <div className="card-top-bar" />
                      <span className="genre-badge">{book.genre || 'General'}</span>
                      <h3 className="book-title">{book.title}</h3>
                      <p className="book-author">by {book.author || 'Unknown Author'}</p>
                      <p className="book-year">
                        📅 Published: <strong>{book.publishedYear || 'N/A'}</strong>
                      </p>
                      {book.description && (
                        <p className="book-description">{book.description}</p>
                      )}
                    </article>
                  ))}
                </div>

                {totalPages > 1 && (
                  <>
                    <nav className="pagination-nav" aria-label="Pagination">
                      <button
                        type="button"
                        className="page-btn nav-btn"
                        disabled={currentPage === 1}
                        onClick={handlePrevious}
                      >
                        ← Previous
                      </button>

                      <div className="page-numbers">
                        {getPageNumbers().map((page) => (
                          <button
                            key={`page-${page}`}
                            type="button"
                            className={`page-btn ${currentPage === page ? 'active' : ''}`}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        className="page-btn nav-btn"
                        disabled={currentPage === totalPages}
                        onClick={handleNext}
                      >
                        Next →
                      </button>
                    </nav>

                    <p className="page-info">
                      Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> •
                      Showing <strong>{currentBooks.length}</strong> of{' '}
                      <strong>{filteredBooks.length}</strong> books
                    </p>
                  </>
                )}
              </>
            ) : (
              <div className="state-box empty-state">
                <span className="empty-icon">🔍</span>
                <p>No books match your search.</p>
                <small>Try adjusting your filters or search terms.</small>
              </div>
            )}
          </section>
        </div>
      </main>

      <footer className="app-footer">
        <p>© 2026 BookHunt | Book Discovery Website</p>
        <small>Made with 💙 for book lovers</small>
      </footer>
    </div>
  )
}

export default App
