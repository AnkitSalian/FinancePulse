import PageHeader from '../components/layout/PageHeader';

export default function Transactions() {
  return (
    <div className="min-h-screen bg-background text-white pb-24">
      <PageHeader title="Transactions" />
      <div className="px-4">
        <p className="text-muted">Transactions — list + filters (coming soon)</p>
      </div>
    </div>
  );
}
