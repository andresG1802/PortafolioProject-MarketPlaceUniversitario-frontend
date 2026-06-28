import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import CategoryBadge from '../components/CategoryBadge';
import { Favorite } from '../types';

const Favorites = () => {
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/favorites')
      .then(({ data }) => setFavorites(data.favorites))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId: number) => {
    await api.post(`/favorites/${productId}/toggle`);
    setFavorites((prev) => prev.filter((f) => f.productId !== productId));
  };

  if (loading) return <div className="loading">Cargando favoritos...</div>;

  return (
    <div className="page">
      <h1 className="page-title">Mis Favoritos</h1>

      {favorites.length === 0 ? (
        <div className="empty-state">
          <p>No tienes productos en favoritos</p>
          <Link to="/" className="btn btn-primary">Explorar productos</Link>
        </div>
      ) : (
        <div className="favorites-list">
          {favorites.map((fav) => (
            <div key={fav.id} className="favorite-item">
              {fav.productImage
                ? <img src={`http://localhost:4000${fav.productImage}`} alt={fav.productTitle} className="favorite-item__image" />
                : <div className="favorite-item__no-image">Sin imagen</div>
              }
              <div className="favorite-item__info">
                <Link to={`/products/${fav.productId}`} className="favorite-item__title">
                  {fav.productTitle}
                </Link>
                <p className="favorite-item__price">${Number(fav.productPrice).toLocaleString('es')}</p>
                {fav.productCategory && <CategoryBadge category={fav.productCategory} />}
                <p className="favorite-item__seller">Vendedor: {fav.sellerName}</p>
                {fav.productStatus === 'vendido' && <span className="status-badge">Vendido</span>}
              </div>
              <button
                className="btn-icon btn-icon--active"
                onClick={() => handleRemove(fav.productId)}
                title="Quitar de favoritos"
              >
                ♥
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Favorites;
