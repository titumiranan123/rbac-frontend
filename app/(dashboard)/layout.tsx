import { DynamicSidebar } from "@/components/sidebar/DynamicSidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-gray-50">
      <DynamicSidebar />
      <main className="flex-1 overflow-auto p-7">{children}</main>
    </div>
  );
}
