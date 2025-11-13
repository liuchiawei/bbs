import { RegisterForm } from "@/components/auth/register-form";
import Link from "next/link";
import { t } from "@/lib/constants";

export default function RegisterPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <RegisterForm />
      <p className="text-center mt-4 text-sm text-muted-foreground">
        {t("ALREADY_HAVE_ACCOUNT")}{" "}
        <Link href="/login" className="text-primary hover:underline">
          {t("LOGIN")}
        </Link>
      </p>
    </div>
  );
}
