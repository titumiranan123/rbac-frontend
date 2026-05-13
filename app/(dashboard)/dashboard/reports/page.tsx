import { redirect } from 'next/navigation';
import { getData, getServerToken } from '@/lib/getData';
import ReportsClient from './_components/ReportsClient';

export default async function ReportsPage() {
  const token = await getServerToken();
  if (!token) redirect('/login');

  return <ReportsClient />;
}