import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { CategoryType, ProductCondition } from '../types';

const CreateProduct = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', price: '', category: 'apuntes' as CategoryType,
    condition: 'bueno' as ProductCondition, subject: '', university: '',
  });
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    setImages(files);
    setPreviews(files.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((img) => fd.append('images', img));
      const { data } = await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      navigate(`/products/${data.product.id}`);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(msg ?? 'Error al publicar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page">
      <div className="form-page">
        <h1>Publicar producto</h1>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-group">
            <label>Categoría *</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as CategoryType })}>
              <option value="apuntes">Apuntes</option>
              <option value="laptops">Laptops</option>
              <option value="accesorios">Accesorios</option>
            </select>
          </div>

          <div className="form-group">
            <label>Título *</label>
            <input type="text" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ej: Apuntes de Cálculo III — UNC 2024"
              required minLength={3} />
          </div>

          <div className="form-group">
            <label>Descripción *</label>
            <textarea value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Describe el producto con detalle..."
              rows={4} required minLength={10} />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Precio (COP) *</label>
              <input type="number" value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0" min="0" required />
            </div>
            <div className="form-group">
              <label>Estado</label>
              <select value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value as ProductCondition })}>
                <option value="nuevo">Nuevo</option>
                <option value="como_nuevo">Como nuevo</option>
                <option value="bueno">Bueno</option>
                <option value="aceptable">Aceptable</option>
              </select>
            </div>
          </div>

          {form.category === 'apuntes' && (
            <div className="form-group">
              <label>Materia</label>
              <input type="text" value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Ej: Cálculo Diferencial" />
            </div>
          )}

          <div className="form-group">
            <label>Universidad</label>
            <input type="text" value={form.university}
              onChange={(e) => setForm({ ...form, university: e.target.value })}
              placeholder="Ej: Universidad Nacional" />
          </div>

          <div className="form-group">
            <label>Imágenes (máx. 5)</label>
            <input type="file" accept="image/*" multiple onChange={handleImages} />
            {previews.length > 0 && (
              <div className="image-previews">
                {previews.map((src, i) => (
                  <img key={i} src={src} alt={`Preview ${i + 1}`} className="image-preview" />
                ))}
              </div>
            )}
          </div>

          <div className="form-actions">
            <button type="button" className="btn btn-outline" onClick={() => navigate(-1)}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Publicando...' : 'Publicar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProduct;
