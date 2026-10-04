import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [data, setData] = useState([])
  const [search, setSearch] = useState('')
  const [yearFilter, setYearFilter] = useState('All Years')
  const [sortBy, setSortBy] = useState('Sort By')

  useEffect(() => {
    axios
      .get('/books.json')
      .then((response) => setData(response.data))
      .catch((error) => console.error(error))
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

  return (
    <>
      <header>
        <div className="max-w-6xl mx-auto px-6 py-5 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-black-600">📚 BookHunt</h1>
            <p className="text-sm text-gray-500">Discover your next favourite book</p>
          </div>

          <button className="px-4 py-2 bg-gray-200 rounded-lg" type="button">
            🌙
          </button>
        </div>
      </header>

      <main>
        <section className="max-w-6xl mx-auto px-6 py-10">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2">Find Your Next Book</h2>
            <p className="text-gray-500">Search and explore thousands of books</p>
          </div>

          <div className="flex max-w-2xl mx-auto">
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search for a book..."
              className="flex-1 px-5 py-3 border rounded-l-lg outline-none"
            />

            <button
              className="px-6 py-3 bg-blue-600 text-white rounded-r-lg"
              type="button"
            >
              Search
            </button>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 mb-8">
          <div className="flex flex-wrap gap-4">
            <select
              className="px-4 py-2 border rounded-lg"
              value={yearFilter}
              onChange={(event) => setYearFilter(event.target.value)}
            >
              <option>All Years</option>
              <option>Before 2000</option>
              <option>2000 and After</option>
            </select>

            <select
              className="px-4 py-2 border rounded-lg"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option>Sort By</option>
              <option>Title A-Z</option>
              <option>Title Z-A</option>
            </select>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 pb-12">
          {filteredBooks.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredBooks.map((book) => (
                <article
                  key={book.id || book.title}
                  className="border rounded-xl p-5 shadow-sm bg-white"
                >
                  <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold">
                    {book.genre || 'General'}
                  </p>
                  <h3 className="mt-2 text-xl font-bold text-gray-900">{book.title}</h3>
                  <p className="mt-2 text-gray-600">by {book.author || 'Unknown Author'}</p>
                  <p className="mt-3 text-sm text-gray-500">
                    Published: {book.publishedYear || 'N/A'}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No books match your search.</p>
          )}
        </section>
      </main>

      <nav aria-label="Page navigation example">
        <ul className="pagination justify-content-center">
          <li className="page-item disabled">
            <a className="page-link">Previous</a>
          </li>
          <li className="page-item">
            <a className="page-link" href="#">
              1
            </a>
          </li>
          <li className="page-item">
            <a className="page-link" href="#">
              2
            </a>
          </li>
          <li className="page-item">
            <a className="page-link" href="#">
              3
            </a>
          </li>
          <li className="page-item">
            <a className="page-link" href="#">
              Next
            </a>
          </li>
        </ul>
      </nav>

      <footer className="bg-white border-t py-6 text-center">
        <p className="text-gray-500">© 2026 BookHunt | Book Discovery Website</p>
      </footer>
    </>
  )
}

export default App
