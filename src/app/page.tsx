import { DashboardClient } from '@/components/dashboard-client';
import { Header } from '@/components/header';

export default async function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <DashboardClient />
      </main>
    </div>
  );
}
