import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import CategoryBadge from '../components/CategoryBadge';
import StarRating from '../components/StarRating';
import { Product, Review, CONDITION_LABELS } from '../types';

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isFavorited, setIsFavorited] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [deletingProduct, setDeletingProduct] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, favsRes] = await Promise.all([
          api.get(`/products/${id}`),
          user ? api.get('/favorites') : Promise.resolve({ data: { favorites: [] } }),
        ]);
        setProduct(prodRes.data.product);
        const faved = favsRes.data.favorites.some((f: { productId: number }) => f.productId === Number(id));
        setIsFavorited(faved);

        if (prodRes.data.product.sellerId) {
          const revRes = await api.get(`/reviews/user/${prodRes.data.product.sellerId}`);
          setReviews(revRes.data.reviews);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleToggleFavorite = async () => {
    if (!user) { navigate('/login'); return; }
    await api.post(`/favorites/${id}/toggle`);
    setIsFavorited((prev) => !prev);
  };

  const handleContact = async () => {
    if (!user) { navigate('/login'); return; }
    if (!product) return;
    const { data } = await api.post('/conversations', {
      productId: product.id,
      sellerId: product.sellerId,
    });
    navigate(`/chat/${data.conversation.id}`);
  };

  const handleMarkSold = async () => {
    if (!product) return;
    await api.patch(`/products/${product.id}/status`, { status: 'vendido' });
    setProduct({ ...product, status: 'vendido' });
  };

  const handleDelete = async () => {
    if (!product || !window.confirm('¿Eliminar este producto?')) return;
    setDeletingProduct(true);
    await api.delete(`/products/${product.id}`);
    navigate('/');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;
    await api.post('/reviews', { ...reviewForm, reviewedId: product.sellerId, productId: product.id });
    const { data } = await api.get(`/reviews/user/${product.sellerId}`);
    setReviews(data.reviews);
    setReviewForm({ rating: 5, comment: '' });
  };

  if (loading) return <div className="loading">Cargando...</div>;
  if (!product) return <div className="page"><p>Producto no encontrado</p></div>;

  const isOwner = user?.id === product.sellerId;

  return (
    <div className="page page--detail">
      <div className="product-detail">
        <div className="product-detail__gallery">
          <div className="product-detail__main-image">
            {product.images[activeImage]
              ? <img src={`http://localhost:4000${product.images[activeImage]}`} alt={product.title} />
              : <div className="no-image-lg">Sin imagen</div>
            }
          </div>
          {product.images.length > 1 && (
            <div className="product-detail__thumbnails">
              {product.images.map((img, i) => (
                <img
                  key={i}
                  src={`http://localhost:4000${img}`}
                  alt={`${product.title} ${i + 1}`}
                  className={i === activeImage ? 'thumb--active' : ''}
                  onClick={() => setActiveImage(i)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="product-detail__info">
          <div className="product-detail__tags">
            <CategoryBadge category={product.category} />
            {product.condition && (
              <span className="condition-badge">{CONDITION_LABELS[product.condition]}</span>
            )}
            {product.status !== 'disponible' && (
              <span className="status-badge">{product.status === 'vendido' ? 'Vendido' : 'Pausado'}</span>
            )}
          </div>

          <h1 className="product-detail__title">{product.title}</h1>
          <p className="product-detail__price">${Number(product.price).toLocaleString('es')}</p>
          <p className="product-detail__views">{product.views} visualizaciones</p>

          <div className="product-detail__description">
            <h3>Descripción</h3>
            <p>{product.description}</p>
          </div>

          {product.subject && <p><strong>Materia:</strong> {product.subject}</p>}
          {product.university && <p><strong>Universidad:</strong> {product.university}</p>}

          <div className="product-detail__seller">
            <h3>Vendedor</h3>
            <Link to={`/profile/${product.sellerId}`} className="seller-link">
              <span className="avatar-placeholder">{(product.sellerName ?? 'U')[0]}</span>
              <div>
                <p>{product.sellerName}</p>
                {product.sellerReputation !== undefined && product.sellerReputation > 0 && (
                  <StarRating rating={product.sellerReputation} />
                )}
              </div>
            </Link>
          </div>

          <div className="product-detail__actions">
            {isOwner ? (
              <>
                {product.status === 'disponible' && (
                  <button onClick={handleMarkSold} className="btn btn-outline">Marcar como vendido</button>
                )}
                <button onClick={handleDelete} className="btn btn-danger" disabled={deletingProduct}>
                  Eliminar
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleContact}
                  className="btn btn-primary"
                  disabled={product.status !== 'disponible'}
                >
                  Contactar vendedor
                </button>
                <button
                  onClick={handleToggleFavorite}
                  className={`btn ${isFavorited ? 'btn-outline' : 'btn-secondary'}`}
                >
                  {isFavorited ? '♥ En favoritos' : '♡ Favorito'}
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      <section className="reviews-section">
        <h2>Reseñas del vendedor ({reviews.length})</h2>
        {reviews.map((r) => (
          <div key={r.id} className="review-card">
            <div className="review-card__header">
              <strong>{(r as unknown as Record<string, unknown>).reviewerName as string ?? 'Usuario'}</strong>
              <StarRating rating={r.rating} size="sm" />
              <span className="review-card__date">{new Date(r.createdAt).toLocaleDateString('es')}</span>
            </div>
            {r.comment && <p className="review-card__comment">{r.comment}</p>}
          </div>
        ))}

        {user && !isOwner && product.status === 'vendido' && (
          <form onSubmit={handleReviewSubmit} className="review-form">
            <h3>Dejar reseña</h3>
            <StarRating
              rating={reviewForm.rating}
              interactive
              onChange={(v) => setReviewForm({ ...reviewForm, rating: v })}
            />
            <textarea
              value={reviewForm.comment}
              onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
              placeholder="Cuéntanos tu experiencia..."
              rows={3}
            />
            <button type="submit" className="btn btn-primary">Publicar reseña</button>
          </form>
        )}
      </section>
    </div>
  );
};

export default ProductDetail;
