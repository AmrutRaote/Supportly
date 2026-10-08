"use client";

import * as React from "react";
import { useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { signOutAction } from "@/modules/auth/actions";

interface LogoutButtonProps extends React.ComponentProps<typeof Button> {
  showIcon?: boolean;
}

export function LogoutButton({
  children = "Sign out",
  showIcon = true,
  disabled,
  variant = "outline",
  ...props
}: LogoutButtonProps) {
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await signOutAction();
    });
  };

  return (
    <Button
      variant={variant}
      disabled={disabled || isPending}
      onClick={handleLogout}
      {...props}
    >
      {isPending ? (
        <Loader2 className="animate-spin" />
      ) : showIcon ? (
        <LogOut />
      ) : null}
      {isPending ? "Signing out..." : children}
    </Button>
  );
}
