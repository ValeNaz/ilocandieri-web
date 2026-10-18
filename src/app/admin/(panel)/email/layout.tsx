import { EmailTabs } from "./EmailTabs";
import { isEmailConfigured } from "@/lib/email";

export default function EmailLayout({ children }: { children: React.ReactNode }) {
  const configured = isEmailConfigured();
  return (
    <>
      {!configured && (
        <div role="alert" className="mb-6 rounded-card border border-warning/30 bg-warning-soft px-5 py-4 text-warning">
          <p className="font-semibold">SMTP non configurato: le email non vengono inviate.</p>
          <p className="mt-1 text-sm">I messaggi restano nel registro come «Email non configurata». Dopo aver inserito le credenziali del server di posta (variabili <code>SMTP_HOST</code>, <code>SMTP_USER</code>…) potrai usare «Riprova» su ciascuno.</p>
        </div>
      )}
      <EmailTabs />
      {children}
    </>
  );
}
