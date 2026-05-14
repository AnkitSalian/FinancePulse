import PageHeader from '../components/layout/PageHeader';

export default function Budget() {
  return (
    <div className="min-h-screen bg-background text-white pb-24">
      <PageHeader title="Budget" />
      <div className="px-4">
        <p className="text-muted">Budget — category budgets (coming soon)</p>
      </div>
    </div>
  );
}
