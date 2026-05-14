import PageHeader from '../components/layout/PageHeader';

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-white pb-24">
      <PageHeader title="FinancePulse" subtitle="Daily Pulse" />
      <div className="px-4">
        <p className="text-muted">Home — Daily Pulse (coming soon)</p>
      </div>
    </div>
  );
}
