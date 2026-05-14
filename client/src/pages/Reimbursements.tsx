import PageHeader from '../components/layout/PageHeader';

export default function Reimbursements() {
  return (
    <div className="min-h-screen bg-background text-white pb-24">
      <PageHeader title="Reimbursements" />
      <div className="px-4">
        <p className="text-muted">Reimbursements — pending reimbursements (coming soon)</p>
      </div>
    </div>
  );
}
