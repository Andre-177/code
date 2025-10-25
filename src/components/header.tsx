import { Bot } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <Bot className="h-5 w-5" />
        </div>
        <h1 className="text-xl font-semibold text-foreground">
          Zigbee Hall Control
        </h1>
      </div>
    </header>
  );
}
