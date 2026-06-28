import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import { Product, CategoryType, CATEGORY_LABELS } from '../types';

const CATEGORIES: CategoryType[] = ['apuntes', 'laptops', 'accesorios'];

const Home = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [search, setSearch] = useState(searchParams.get('search') ?? '');
  const category = searchParams.get('category') as CategoryType | null;

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (category) params.category = category;
      if (search) params.search = search;
      const { data } = await api.get('/products', { params });
      setProducts(data.products);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  useEffect(() => {
    if (!user) return;
    api.get('/favorites').then(({ data }) => {
      setFavorites(new Set(data.favorites.map((f: { productId: number }) => f.productId)));
    }).catch(() => {});
  }, [user]);

  const handleToggleFavorite = async (productId: number) => {
    if (!user) return;
    await api.post(`/favorites/${productId}/toggle`);
    setFavorites((prev) => {
      const next = new Set(prev);
      next.has(productId) ? next.delete(productId) : next.add(productId);
      return next;
    });
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const p = new URLSearchParams(searchParams);
    if (search) p.set('search', search);
    else p.delete('search');
    setSearchParams(p);
  };

  return (
    <div className="page">
      <section className="hero">
        <h1>Compra y vende entre estudiantes</h1>
        <p>Apuntes, laptops, accesorios y más — todo en tu comunidad universitaria</p>
        <form onSubmit={handleSearch} className="search-bar">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos..."
          />
          <button type="submit" className="btn btn-primary">Buscar</button>
        </form>
      </section>

      <section className="category-filters">
        <button
          className={`filter-chip ${!category ? 'filter-chip--active' : ''}`}
          onClick={() => setSearchParams({})}
        >
          Todos
        </button>
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`filter-chip ${category === cat ? 'filter-chip--active' : ''}`}
            onClick={() => setSearchParams({ category: cat })}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </section>

      {loading ? (
        <div className="loading">Cargando productos...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">
          <p>No se encontraron productos</p>
        </div>
      ) : (
        <>
          <p className="results-count">{total} resultado{total !== 1 ? 's' : ''}</p>
          <div className="products-grid">
            {products.map((p) => (
              <ProductCard
                key={p.id}
                product={p}
                isFavorited={favorites.has(p.id)}
                onToggleFavorite={user ? handleToggleFavorite : undefined}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Home;
