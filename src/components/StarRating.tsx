interface Props {
  rating: number;
  max?: number;
  interactive?: boolean;
  onChange?: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
}

const StarRating = ({ rating, max = 5, interactive = false, onChange, size = 'md' }: Props) => {
  return (
    <div className={`star-rating star-rating--${size}`}>
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <span
          key={star}
          className={`star ${star <= Math.round(rating) ? 'star--filled' : 'star--empty'}`}
          onClick={interactive && onChange ? () => onChange(star) : undefined}
          style={{ cursor: interactive ? 'pointer' : 'default' }}
        >
          {star <= Math.round(rating) ? '★' : '☆'}
        </span>
      ))}
      {!interactive && <span className="star-value">({rating.toFixed(1)})</span>}
    </div>
  );
};

export default StarRating;
