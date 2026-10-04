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

  // Convert any value safely to searchable text
  const getText = (value) => {
    if (Array.isArray(value)) {
      return value.join(', ')
    }

    if (value === null || value === undefined) {
      return ''
    }

    return String(value)
  }

  // Load books
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true)

        const response = await axios.get('/books.json')

        let books = response.data

        // Handle different JSON structures
        if (Array.isArray(books)) {
          // Already an array
        } else if (Array.isArray(books.data)) {
          books = books.data
        } else if (Array.isArray(books.books)) {
          books = books.books
        } else {
          books = []
        }

        console.log('Books fetched:', books)

        setData(books)
        setError('')
      } catch (err) {
        console.error('Error fetching books:', err)
        setError('Failed to load books. Please check your books.json file.')
        setData([])
      } finally {
        setLoading(false)
      }
    }

    fetchBooks()
  }, [])

  // Search + Filter + Sort
  const filteredBooks = [...data]
    .filter((book) => {
      const query = search.trim().toLowerCase()

      const title = getText(book.title).toLowerCase()
      const authors = getText(book.authors).toLowerCase()
      const genres = getText(book.genres).toLowerCase()

      const matchesSearch =
        query === '' ||
        title.includes(query) ||
        authors.includes(query) ||
        genres.includes(query)

      const year = Number(book.firstPublishedYear)

      const matchesYear =
        yearFilter === 'All Years' ||
        (yearFilter === 'Before 2000' && year < 2000) ||
        (yearFilter === '2000 and After' && year >= 2000)

      return matchesSearch && matchesYear
    })
    .sort((a, b) => {
      const titleA = getText(a.title)
      const titleB = getText(b.title)

      if (sortBy === 'Title A-Z') {
        return titleA.localeCompare(titleB)
      }

      if (sortBy === 'Title Z-A') {
        return titleB.localeCompare(titleA)
      }

      return 0
    })

  // Pagination
  const totalPages = Math.max(
    1,
    Math.ceil(filteredBooks.length / booksPerPage)
  )

  const indexOfLastBook = currentPage * booksPerPage
  const indexOfFirstBook = indexOfLastBook - booksPerPage

  const currentBooks = filteredBooks.slice(
    indexOfFirstBook,
    indexOfLastBook
  )

  // Reset page when search/filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [search, yearFilter, sortBy])

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
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

    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxPagesToShow / 2)
    )

    let endPage = Math.min(
      totalPages,
      startPage + maxPagesToShow - 1
    )

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(
        1,
        endPage - maxPagesToShow + 1
      )
    }

    for (let i = startPage; i <= endPage; i += 1) {
      pages.push(i)
    }

    return pages
  }

  return (
    <div className={`app-wrapper ${darkMode ? 'dark-mode' : ''}`}>

      {/* HEADER */}
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
            onClick={() => setDarkMode((previous) => !previous)}
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>

        </div>
      </header>

      {/* MAIN */}
      <main className="app-main">
        <div className="content-wrapper">

          {/* HERO */}
          <section className="hero-section">

            <h2>Find Your Next Book</h2>

            <p>
              Search and explore thousands of books
            </p>

            <div className="search-container">

              <input
                type="text"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                }}
                placeholder="Search for a book by title or author..."
                className="search-input"
              />

              <button
                type="button"
                className="search-btn"
                onClick={() => setCurrentPage(1)}
              >
                🔍 Search
              </button>

            </div>

          </section>

          {/* FILTERS */}
          <section className="filters-section">

            <select
              value={yearFilter}
              onChange={(event) => {
                setYearFilter(event.target.value)
              }}
              className="filter-select"
            >
              <option>All Years</option>
              <option>Before 2000</option>
              <option>2000 and After</option>
            </select>

            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value)
              }}
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

          {/* BOOKS */}
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

                  {currentBooks.map((book, index) => {

                    const title = getText(book.title)
                    const authors = getText(book.authors)
                    const genres = getText(book.genres)
                    const description = getText(book.description)
                    const cover = getText(book.cover)

                    return (
                      <article
                        key={`${book.id || title}-${index}`}
                        className="book-card"
                      >

                        <div className="card-top-bar" />

                        <img
                          className="cover"
                          src={
                            cover ||
                            'https://via.placeholder.com/300x450?text=No+Cover'
                          }
                          alt={title || 'Book cover'}
                          onError={(event) => {
                            event.currentTarget.src =
                              'https://via.placeholder.com/300x450?text=No+Cover'
                          }}
                        />

                        <span className="genre-badge">
                          {genres || 'General'}
                        </span>

                        <h3 className="book-title">
                          {title || 'Untitled Book'}
                        </h3>

                        <p className="book-author">
                          by {authors || 'Unknown Author'}
                        </p>

                        <p className="book-year">
                          📅 Published:{' '}
                          <strong>
                            {book.firstPublishedYear || 'N/A'}
                          </strong>
                        </p>

                        {description && (
                          <p className="book-description">
                            {description}
                          </p>
                        )}

                      </article>
                    )
                  })}

                </div>

                {/* PAGINATION */}
                {totalPages > 1 && (
                  <>
                    <nav
                      className="pagination-nav"
                      aria-label="Pagination"
                    >

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
                            className={`page-btn ${
                              currentPage === page
                                ? 'active'
                                : ''
                            }`}
                            onClick={() =>
                              handlePageChange(page)
                            }
                          >
                            {page}
                          </button>

                        ))}

                      </div>

                      <button
                        type="button"
                        className="page-btn nav-btn"
                        disabled={
                          currentPage === totalPages
                        }
                        onClick={handleNext}
                      >
                        Next →
                      </button>

                    </nav>

                    <p className="page-info">
                      Page <strong>{currentPage}</strong> of{' '}
                      <strong>{totalPages}</strong> • Showing{' '}
                      <strong>{currentBooks.length}</strong> of{' '}
                      <strong>{filteredBooks.length}</strong>{' '}
                      books
                    </p>
                  </>
                )}

              </>

            ) : (

              <div className="state-box empty-state">

                <span className="empty-icon">🔍</span>

                <p>
                  No books match your search.
                </p>

                <small>
                  Try adjusting your filters or search terms.
                </small>

              </div>

            )}

          </section>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="app-footer">
        <p>
          © 2026 BookHunt | Book Discovery Website
        </p>

        <small>
          Made with 💙 for book lovers
        </small>
      </footer>

    </div>
  )
}

export default App
