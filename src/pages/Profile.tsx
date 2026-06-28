import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import StarRating from '../components/StarRating';
import { User, Product, Review } from '../types';

const Profile = () => {
  const { id } = useParams<{ id: string }>();
  const { user: authUser, updateUser } = useAuth();
  const isOwnProfile = !id || Number(id) === authUser?.id;
  const profileId = isOwnProfile ? authUser?.id : Number(id);

  const [profile, setProfile] = useState<User | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', bio: '', university: '' });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profileId) return;
    Promise.all([
      api.get(`/users/${profileId}`),
      api.get('/products', { params: { sellerId: profileId, status: undefined } }),
      api.get(`/reviews/user/${profileId}`),
    ]).then(([userRes, prodRes, revRes]) => {
      setProfile(userRes.data.user);
      setEditForm({ name: userRes.data.user.name, bio: userRes.data.user.bio ?? '', university: userRes.data.user.university ?? '' });
      setProducts(prodRes.data.products);
      setReviews(revRes.data.reviews);
    }).finally(() => setLoading(false));
  }, [profileId]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(editForm).forEach(([k, v]) => fd.append(k, v));
    if (avatarFile) fd.append('avatar', avatarFile);
    const { data } = await api.put('/users/me', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    setProfile(data.user);
    updateUser(data.user);
    setEditing(false);
  };

  if (loading) return <div className="loading">Cargando perfil...</div>;
  if (!profile) return <div className="page"><p>Usuario no encontrado</p></div>;

  return (
    <div className="page">
      <div className="profile-header">
        <div className="profile-avatar">
          {profile.avatarUrl
            ? <img src={`http://localhost:4000${profile.avatarUrl}`} alt={profile.name} />
            : <div className="avatar-placeholder avatar-placeholder--lg">{profile.name[0].toUpperCase()}</div>
          }
        </div>
        <div className="profile-info">
          <h1>{profile.name}</h1>
          {profile.university && <p className="profile-university">{profile.university}</p>}
          {profile.bio && <p className="profile-bio">{profile.bio}</p>}
          {profile.totalReviews > 0 && (
            <div className="profile-reputation">
              <StarRating rating={profile.reputationScore} />
              <span>({profile.totalReviews} reseñas)</span>
            </div>
          )}
          {isOwnProfile && (
            <button className="btn btn-outline btn-sm" onClick={() => setEditing(!editing)}>
              {editing ? 'Cancelar' : 'Editar perfil'}
            </button>
          )}
        </div>
      </div>

      {editing && (
        <form onSubmit={handleSaveProfile} className="edit-profile-form">
          <div className="form-group">
            <label>Nombre</label>
            <input type="text" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Bio</label>
            <textarea value={editForm.bio} onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })} rows={3} />
          </div>
          <div className="form-group">
            <label>Universidad</label>
            <input type="text" value={editForm.university} onChange={(e) => setEditForm({ ...editForm, university: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Foto de perfil</label>
            <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files?.[0] ?? null)} />
          </div>
          <button type="submit" className="btn btn-primary">Guardar cambios</button>
        </form>
      )}

      <section className="profile-products">
        <h2>Publicaciones ({products.length})</h2>
        {products.length === 0
          ? <p className="empty-state">Sin publicaciones aún</p>
          : (
            <div className="products-grid">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          )
        }
      </section>

      <section className="profile-reviews">
        <h2>Reseñas ({reviews.length})</h2>
        {reviews.length === 0
          ? <p className="empty-state">Sin reseñas aún</p>
          : reviews.map((r) => (
            <div key={r.id} className="review-card">
              <div className="review-card__header">
                <strong>{(r as unknown as Record<string, unknown>).reviewerName as string ?? 'Usuario'}</strong>
                <StarRating rating={r.rating} size="sm" />
                <span>{new Date(r.createdAt).toLocaleDateString('es')}</span>
              </div>
              {r.comment && <p className="review-card__comment">{r.comment}</p>}
            </div>
          ))
        }
      </section>
    </div>
  );
};

export default Profile;
