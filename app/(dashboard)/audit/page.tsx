import { redirect } from 'next/navigation';
import { getData, getServerToken } from '@/lib/getData';
import AuditClient from './_components/AuditClient';

export default async function AuditPage() {
  const token = await getServerToken();
  if (!token) redirect('/login');

  return <AuditClient />;
}