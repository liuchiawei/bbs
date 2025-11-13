import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import { TRANSLATIONS, type Language } from "@/lib/constants";

export default function LoginPage() {
  // TODO: Get language from user preferences or browser settings
  const lang: Language = 'en';
  const t = TRANSLATIONS[lang];

  return (
    <div className="container mx-auto px-4 py-12">
      <LoginForm />
      <p className="text-center mt-4 text-sm text-muted-foreground">
        {t.DONT_HAVE_ACCOUNT}{" "}
        <Link href="/register" className="text-primary hover:underline">
          {t.REGISTER}
        </Link>
      </p>
    </div>
  );
}
