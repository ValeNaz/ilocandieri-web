/**
 * Importing this file registers the default email templates of EVERY module, so the admin
 * (Email > Modelli) can list them and offer "Ripristina originale". Add one line per module
 * that calls registerDefaultTemplates().
 */
import "@/lib/careers/emails";
import "@/lib/content/email-templates";
import "@/lib/events/emails";
