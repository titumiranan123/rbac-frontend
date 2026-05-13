import { redirect } from "next/navigation";
import { getData, getServerToken } from "@/lib/getData";
import UsersClient from "./_components/UsersClient";
import { PaginatedResult, User } from "@/types";

export default async function UsersPage() {
  const token = await getServerToken();
  if (!token) redirect("/login");

  const { data, error, status } = await getData<PaginatedResult<User>>(
    "/users?page=1&limit=20",
    token,
  );

  if (status === 401) redirect("/login");
  if (status === 403) redirect("/403");
  if (error || !data) {
    return (
      <div className="p-6 w-full">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error || "Failed to load users"}
        </div>
      </div>
    );
  }

  return <UsersClient initialData={data} />;
}
