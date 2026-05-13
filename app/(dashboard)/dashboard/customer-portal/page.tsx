import { redirect } from 'next/navigation';
import { getData, getServerToken } from '@/lib/getData';
import CustomerPortalClient from './_components/CustomerPortalClient';
import { PaginatedResult } from '@/types';

interface CustomerData {
  tickets: PaginatedResult<any>;
  orders: PaginatedResult<any>;
}

export default async function CustomerPortalPage() {
  const token = await getServerToken();
  if (!token) redirect('/login');

  const [ticketsRes, ordersRes] = await Promise.all([
    getData<PaginatedResult<any>>('/customer-portal/tickets?page=1&limit=20', token),
    getData<PaginatedResult<any>>('/customer-portal/orders?page=1&limit=20', token),
  ]);

  return (
    <CustomerPortalClient
      tickets={ticketsRes.data?.data || []}
      orders={ordersRes.data?.data || []}
      ticketsMeta={ticketsRes.data?.meta}
      ordersMeta={ordersRes.data?.meta}
    />
  );
}