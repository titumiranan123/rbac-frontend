import { redirect } from 'next/navigation';
import { getData, getServerToken } from '@/lib/getData';
import TasksClient from './_components/TasksClient';

export default async function TasksPage() {
  const token = await getServerToken();
  if (!token) redirect('/login');

  return <TasksClient />;
}