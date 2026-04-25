import { FileUp, List } from "lucide-react";

import { Button } from "./ui/button";

// ---- Main Header ----
export default function AppHeader() {
  return (
    <header className="border-border/40 sticky top-0 z-50 h-14 w-full border-b bg-white">
      <div className="flex h-full items-center justify-between px-4">
        <div className="flex items-center">
          <h1 className="text-xl font-bold">Remember</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" asChild>
            <a href="/">
              <List size={18} />
              Home
            </a>
          </Button>

          <Button asChild>
            <a href="/upload">
              <FileUp size={18} />
              Upload
            </a>
          </Button>
        </div>
      </div>
    </header>
  );
}
