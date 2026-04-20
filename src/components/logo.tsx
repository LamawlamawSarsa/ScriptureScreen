import { BookOpen } from 'lucide-react';
import type { SVGProps } from 'react';

export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <div className="flex items-center gap-2">
      <div className="rounded-lg bg-primary p-2">
        <BookOpen className="h-6 w-6 text-primary-foreground" />
      </div>
      <h1 className="text-xl font-bold text-primary">ScriptureStream</h1>
    </div>
  );
}
