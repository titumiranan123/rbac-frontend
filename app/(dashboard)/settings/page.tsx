import { redirect } from 'next/navigation';
import { getData, getServerToken } from '@/lib/getData';
import SettingsClient from './_components/SettingsClient';

export default async function SettingsPage() {
  const token = await getServerToken();
  if (!token) redirect('/login');

  return <SettingsClient />;
}