import { Leaf } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-card/80 backdrop-blur-sm border-b sticky top-0 z-40">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
            <Leaf className="h-7 w-7 text-primary" />
            <span className="text-2xl font-bold font-headline text-foreground tracking-tight">
              HabitZen
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
