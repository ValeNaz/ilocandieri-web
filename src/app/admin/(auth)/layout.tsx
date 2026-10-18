import { Wordmark } from "@/components/public/Wordmark";
import { Pattern } from "@/components/ui";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-[1fr_1.1fr]">
      <div className="flex flex-col justify-center px-6 py-12 sm:px-14">
        <div className="mx-auto w-full max-w-md">
          <Wordmark className="mb-10" />
          {children}
        </div>
      </div>
      <Pattern variant="agrumi" className="hidden lg:block" />
    </div>
  );
}
