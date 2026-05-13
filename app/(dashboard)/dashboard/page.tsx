import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getData, getServerToken } from '@/lib/getData';
import DashboardClient from './_components/DashboardClient';
import { PaginatedResult } from '@/types';

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const allCookies = cookieStore.getAll();
  const token = allCookies.find(c => c.name === 'accessToken')?.value || await getServerToken();
  if (!token) redirect('/login');

  const [{ data: usersData }, { data: auditData }] = await Promise.all([
    getData<PaginatedResult<any>>('/users?limit=1', token),
    getData<PaginatedResult<any>>('/audit?limit=1', token),
  ]);

  const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  const permissionsCount = payload.grantedPermissions?.length || 0;

  return (
    <DashboardClient
      usersCount={usersData?.meta?.total || 0}
      permissionsCount={permissionsCount}
      auditLogsCount={auditData?.meta?.total || 0}
    />
  );
}