import { redirect } from "next/navigation";
import { getServerToken } from "@/lib/getData";
import LeadsClient from "./_components/LeadsClient";

export default async function LeadsPage() {
  const token = await getServerToken();
  if (!token) redirect("/login");

  return <LeadsClient />;
}
