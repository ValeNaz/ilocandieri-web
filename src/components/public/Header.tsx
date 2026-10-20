import { HeaderBar } from "@/components/public/art/chrome/header-bar";
import { getSetting } from "@/lib/settings";
import "./chrome.css";

/** Public header. Server wrapper: reads the essential contacts (admin settings) for the mobile menu. */
export async function Header() {
  const org = await getSetting("org");
  return <HeaderBar contacts={{ phone: org.phone, email: org.email, address: org.address }} />;
}
