import { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {
  fetchEvents, searchEvents, setFilters, clearFilters,
  selectEvents, selectPagination, selectFilters, selectEventsLoading,
} from '../../features/events/eventSlice';
import EventCard from '../../components/events/EventCard';

const CATEGORIES = ['concerts', 'sports', 'theatre', 'comedy', 'art', 'standup', 'conference', 'festival', 'other'];
const SORT_OPTIONS = [
  { value: 'date_asc', label: 'Date: Soonest' },
  { value: 'date_desc', label: 'Date: Latest' },
  { value: 'price_asc', label: 'Price: Low → High' },
  { value: 'price_desc', label: 'Price: High → Low' },
  { value: 'popular', label: 'Most Popular' },
];

const EventsListPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const events = useSelector(selectEvents);
  const pagination = useSelector(selectPagination);
  const filters = useSelector(selectFilters);
  const isLoading = useSelector(selectEventsLoading);

  const [searchInput, setSearchInput] = useState(searchParams.get('q') || '');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  // Initial load
  useEffect(() => {
    const params = { page, ...filters };
    if (searchInput.trim()) {
      dispatch(searchEvents({ q: searchInput, page }));
    } else {
      dispatch(fetchEvents(params));
    }
  }, [filters, page]);

  const handleCategoryClick = (cat) => {
    const newCat = filters.category === cat ? '' : cat;
    dispatch(setFilters({ category: newCat }));
    setPage(1);
  };

  const handleSearch = useCallback((e) => {
    if (e.key === 'Enter') {
      if (searchInput.trim()) {
        dispatch(searchEvents({ q: searchInput, page: 1 }));
      } else {
        dispatch(fetchEvents({ page: 1, ...filters }));
      }
      setPage(1);
    }
  }, [searchInput, filters]);

  const handleSortChange = (e) => {
    dispatch(setFilters({ sortBy: e.target.value }));
    setPage(1);
  };

  const handleClear = () => {
    dispatch(clearFilters());
    setSearchInput('');
    setPage(1);
  };

  // Skeleton loader
  const Skeleton = () => (
    <div style={{ border: '1px solid #e2e8f0', borderRadius: '1rem', overflow: 'hidden' }}>
      <div style={{ aspectRatio: '16/9', background: '#f1f5f9', animation: 'pulse 1.5s ease-in-out infinite' }} />
      <div style={{ padding: '1rem' }}>
        {[100, 70, 50].map((w) => (
          <div key={w} style={{ height: '12px', background: '#f1f5f9', borderRadius: '4px', width: `${w}%`, marginBottom: '0.5rem', animation: 'pulse 1.5s ease-in-out infinite' }} />
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ paddingTop: '5rem', minHeight: '100vh', background: '#f8fafc' }}>
      {/* Page Header */}
      <div style={{ background: '#0f172a', padding: '2.5rem 0', marginBottom: '2rem' }}>
        <div className="container">
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(1.5rem, 4vw, 2rem)', color: 'white', marginBottom: '1rem' }}>
            Browse Events
          </h1>

          {/* Search Bar */}
          <div style={{ position: 'relative', maxWidth: '600px' }}>
            <input
              id="events-search"
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearch}
              placeholder="Search events, cities, artists... (press Enter)"
              style={{
                width: '100%', padding: '0.875rem 1rem 0.875rem 3rem',
                borderRadius: '0.75rem', border: 'none', fontSize: '0.9375rem',
                background: 'rgba(255,255,255,0.1)', color: 'white',
                outline: 'none',
              }}
            />
            <span style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', fontSize: '1.125rem' }}>🔍</span>
          </div>
        </div>
      </div>

      <div className="container">
        <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>

          {/* Filter Sidebar */}
          <aside style={{ width: '240px', flexShrink: 0, position: 'sticky', top: '5.5rem' }} className="filter-sidebar">
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '1rem', padding: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.9375rem' }}>Filters</h3>
                {(filters.category || filters.city || filters.sortBy !== 'date_asc') && (
                  <button onClick={handleClear} style={{ background: 'none', border: 'none', color: '#4f46e5', fontWeight: 600, fontSize: '0.8125rem', cursor: 'pointer' }}>
                    Clear all
                  </button>
                )}
              </div>

              {/* Categories */}
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.625rem' }}>Category</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginBottom: '1.25rem' }}>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    id={`filter-cat-${cat}`}
                    onClick={() => handleCategoryClick(cat)}
                    style={{
                      padding: '0.4rem 0.75rem', borderRadius: '0.5rem', border: '1.5px solid',
                      borderColor: filters.category === cat ? '#4f46e5' : '#e2e8f0',
                      background: filters.category === cat ? '#eef2ff' : 'white',
                      color: filters.category === cat ? '#4f46e5' : '#374151',
                      fontWeight: 500, fontSize: '0.8125rem', cursor: 'pointer',
                      textAlign: 'left', textTransform: 'capitalize', transition: 'all 150ms',
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* City */}
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>City</p>
              <input
                id="filter-city"
                type="text"
                value={filters.city}
                onChange={(e) => dispatch(setFilters({ city: e.target.value }))}
                placeholder="e.g. Mumbai"
                className="input-field"
                style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem', marginBottom: '1.25rem' }}
              />

              {/* Sort */}
              <p style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>Sort By</p>
              <select
                id="filter-sort"
                value={filters.sortBy}
                onChange={handleSortChange}
                className="input-field"
                style={{ fontSize: '0.875rem', padding: '0.5rem 0.75rem' }}
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </aside>

          {/* Main Content */}
          <div style={{ flex: 1, minWidth: 0 }}>
            {/* Results header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                {isLoading ? 'Loading...' : `${pagination.total || 0} event${pagination.total !== 1 ? 's' : ''} found`}
                {filters.city && ` in ${filters.city}`}
              </p>
            </div>

            {/* Event Grid */}
            {isLoading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} />)}
              </div>
            ) : events.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem 2rem', background: 'white', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎟️</div>
                <h3 style={{ color: '#0f172a', marginBottom: '0.5rem' }}>No events found</h3>
                <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>Try adjusting your filters or search terms</p>
                <button onClick={handleClear} style={{ padding: '0.625rem 1.5rem', background: '#4f46e5', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 600, cursor: 'pointer' }}>
                  Clear Filters
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.25rem' }}>
                {events.map((event) => <EventCard key={event._id} event={event} />)}
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2.5rem' }}>
                <button
                  id="page-prev"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
                >
                  ← Prev
                </button>
                {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    id={`page-${p}`}
                    onClick={() => setPage(p)}
                    style={{
                      padding: '0.5rem 0.875rem', borderRadius: '0.5rem',
                      border: '1px solid', borderColor: p === page ? '#4f46e5' : '#e2e8f0',
                      background: p === page ? '#4f46e5' : 'white',
                      color: p === page ? 'white' : '#374151',
                      fontWeight: p === page ? 700 : 400, cursor: 'pointer',
                    }}
                  >
                    {p}
                  </button>
                ))}
                <button
                  id="page-next"
                  disabled={!pagination.hasNext}
                  onClick={() => setPage((p) => p + 1)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '0.5rem', border: '1px solid #e2e8f0', background: 'white', cursor: !pagination.hasNext ? 'not-allowed' : 'pointer', opacity: !pagination.hasNext ? 0.5 : 1 }}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        .input-field { width: 100%; border: 1.5px solid #e2e8f0; border-radius: 0.625rem; box-sizing: border-box; }
        @media (max-width: 768px) { .filter-sidebar { display: none; } }
      `}</style>
    </div>
  );
};

export default EventsListPage;
