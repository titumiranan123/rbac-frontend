'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api-client';
import { Ticket, Order, PaginatedResult } from '@/types';

type Tab = 'tickets' | 'orders';

export default function CustomerPortalPage() {
  const [activeTab, setActiveTab] = useState<Tab>('tickets');
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'tickets' ? '/customer-portal/tickets' : '/customer-portal/orders';
      const response = await apiClient.get(`${endpoint}?page=1&limit=20`);
      const data = response.data as PaginatedResult<Ticket> | PaginatedResult<Order>;
      if (activeTab === 'tickets') {
        setTickets((data as PaginatedResult<Ticket>).data);
      } else {
        setOrders((data as PaginatedResult<Order>).data);
      }
      setMeta(data.meta);
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Customer Portal</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex border-b border-gray-200 mb-6">
          <button
            onClick={() => setActiveTab('tickets')}
            className={`px-4 py-2 font-medium border-b-2 -mb-px ${activeTab === 'tickets' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            My Tickets
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 font-medium border-b-2 -mb-px ${activeTab === 'orders' ? 'border-orange-500 text-orange-500' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
          >
            My Orders
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : activeTab === 'tickets' ? (
          <TicketsList tickets={tickets} />
        ) : (
          <OrdersList orders={orders} />
        )}
      </div>
    </div>
  );
}

function TicketsList({ tickets }: { tickets: Ticket[] }) {
  if (tickets.length === 0) {
    return <p className="text-gray-500 text-center py-8">No tickets found</p>;
  }

  return (
    <div className="space-y-4">
      {tickets.map(ticket => (
        <div key={ticket.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{ticket.subject}</h3>
              <p className="text-sm text-gray-500 mt-1">{ticket.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                ticket.status === 'OPEN' ? 'bg-blue-100 text-blue-700' :
                ticket.status === 'CLOSED' ? 'bg-gray-100 text-gray-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                {ticket.status}
              </span>
              <span className={`px-2 py-1 text-xs font-medium rounded ${
                ticket.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                ticket.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                'bg-green-100 text-green-700'
              }`}>
                {ticket.priority}
              </span>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-2">{new Date(ticket.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}

function OrdersList({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return <p className="text-gray-500 text-center py-8">No orders found</p>;
  }

  return (
    <div className="space-y-4">
      {orders.map(order => (
        <div key={order.id} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-900">{order.orderNumber}</h3>
              <p className="text-sm text-gray-500 mt-1">Total: ${order.total.toFixed(2)}</p>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded ${
              order.status === 'DELIVERED' ? 'bg-green-100 text-green-700' :
              order.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {order.status}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-2">{new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  );
}