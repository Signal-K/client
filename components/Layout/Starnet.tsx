import { Sidebar } from '@/components//Layout/Sidebar';

export default function StarnetLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen squiggly-bg bg-background text-foreground">
      <Sidebar />
      <main className="flex-1 p-8 bg-squiggly">
        {children} 
      </main>
    </div>
  );
};