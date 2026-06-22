import { AssessmentHeader } from '@/components/assessment/AssessmentHeader';

export default function AssessmentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AssessmentHeader />
      <main className="flex-grow flex flex-col">
        {children}
      </main>
    </div>
  );
}
