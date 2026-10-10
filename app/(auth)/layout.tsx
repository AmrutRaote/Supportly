import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-1 items-center justify-center p-6">
            <div className="flex flex-col w-full max-w-sm gap-6">
                <Link href="/" className="flex items-center gap-2 self-center font-bold text-2xl">
                    Supportly
                </Link>
                {children}
            </div>
        </div>
    );
}
