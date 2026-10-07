import Link from "next/link";
import { ModeToggle } from "@/components/ui/mode-toggle";
import { LogoutButton } from "@/modules/auth/components/logout-button";
import { getCurrentUser } from "@/modules/auth/actions";

export async function Navbar() {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    user = null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <span>Supportly</span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <span className="hidden text-sm text-muted-foreground sm:inline-block">
              {user.name || user.email}
            </span>
          )}
          <ModeToggle />
          <LogoutButton variant="outline" size="sm" />
        </div>
      </div>
    </header>
  );
}

