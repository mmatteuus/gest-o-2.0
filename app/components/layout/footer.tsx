
import { FileText } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto flex h-16 items-center justify-center px-4">
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>Desenvolvido por MtsFerreira</span>
        </div>
      </div>
    </footer>
  );
}
