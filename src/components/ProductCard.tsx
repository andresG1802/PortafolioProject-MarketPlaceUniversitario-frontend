import { Link } from 'react-router-dom';
import { Product } from '../types';
import CategoryBadge from './CategoryBadge';
import StarRating from './StarRating';

interface Props {
  product: Product;
  isFavorited?: boolean;
  onToggleFavorite?: (productId: number) => void;
}

const ProductCard = ({ product, isFavorited = false, onToggleFavorite }: Props) => {
  const imageUrl = product.images[0]
    ? `http://localhost:4000${product.images[0]}`
    : null;

  return (
    <div className={`product-card ${product.status !== 'disponible' ? 'product-card--sold' : ''}`}>
      <Link to={`/products/${product.id}`} className="product-card__image-link">
        {imageUrl
          ? <img src={imageUrl} alt={product.title} className="product-card__image" />
          : <div className="product-card__no-image">Sin imagen</div>
        }
        {product.status === 'vendido' && (
          <span className="product-card__status-badge">Vendido</span>
        )}
        {product.status === 'pausado' && (
          <span className="product-card__status-badge product-card__status-badge--paused">Pausado</span>
        )}
      </Link>

      <div className="product-card__body">
        <div className="product-card__header">
          <CategoryBadge category={product.category} />
          {onToggleFavorite && (
            <button
              className={`btn-icon ${isFavorited ? 'btn-icon--active' : ''}`}
              onClick={() => onToggleFavorite(product.id)}
              title={isFavorited ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            >
              {isFavorited ? '♥' : '♡'}
            </button>
          )}
        </div>

        <Link to={`/products/${product.id}`} className="product-card__title">
          {product.title}
        </Link>

        <p className="product-card__price">${Number(product.price).toLocaleString('es')}</p>

        {product.sellerName && (
          <div className="product-card__seller">
            <span>{product.sellerName}</span>
            {product.sellerReputation !== undefined && product.sellerReputation > 0 && (
              <StarRating rating={product.sellerReputation} size="sm" />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;
