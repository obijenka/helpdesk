import { useEffect, useState } from 'react';
import { profileApi } from '../api/profile';
import Avatar from '../components/ui/Avatar';
import ProfileInfo from '../components/profile/ProfileInfo';
import PasswordForm from '../components/profile/PasswordForm';
import ProfileStats from '../components/profile/ProfileStats';

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = () => {
    profileApi
      .get()
      .then((res) => setProfile(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">Загрузка...</p>;
  }

  if (!profile) {
    return <p className="text-sm text-red-600">Не удалось загрузить профиль</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">Профиль</h1>

      {/* Карточка с аватаром */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 flex items-center gap-4">
        <Avatar name={profile.fullName} size="lg" />
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {profile.fullName}
          </h2>
          <p className="text-sm text-gray-500">{profile.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {profile.department || '—'} · {profile.position || profile.role}
          </p>
        </div>
      </div>

      {/* Статистика */}
      <div className="mb-6">
        <ProfileStats stats={profile.stats} />
      </div>

      {/* Две колонки */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProfileInfo profile={profile} onUpdated={loadProfile} />
        <PasswordForm />
      </div>
    </div>
  );
}