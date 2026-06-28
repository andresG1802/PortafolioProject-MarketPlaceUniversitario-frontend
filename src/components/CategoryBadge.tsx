import { CategoryType, CATEGORY_LABELS } from '../types';

interface Props { category: CategoryType; }

const colors: Record<CategoryType, string> = {
  apuntes: '#4f46e5',
  laptops: '#0891b2',
  accesorios: '#059669',
};

const CategoryBadge = ({ category }: Props) => (
  <span
    className="category-badge"
    style={{ backgroundColor: colors[category] }}
  >
    {CATEGORY_LABELS[category]}
  </span>
);

export default CategoryBadge;
