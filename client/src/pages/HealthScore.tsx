import PageHeader from '../components/layout/PageHeader';

export default function HealthScore() {
  return (
    <div className="min-h-screen bg-background text-white pb-24">
      <PageHeader title="Health Score" />
      <div className="px-4">
        <p className="text-muted">Health Score — monthly score & trend (coming soon)</p>
      </div>
    </div>
  );
}
