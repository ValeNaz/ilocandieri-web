/** An email address that may only wrap right after the "@" (never "gmail.c / om"). */
export function EmailText({ email }: { email: string }) {
  const at = email.indexOf("@");
  if (at < 0) return <>{email}</>;
  return <><span className="whitespace-nowrap">{email.slice(0, at + 1)}</span><wbr /><span className="whitespace-nowrap">{email.slice(at + 1)}</span></>;
}
