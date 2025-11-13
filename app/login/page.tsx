import { LoginForm } from "@/components/auth/login-form";
import Link from "next/link";
import { t } from "@/lib/constants";

export default function LoginPage() {
  return (
    <>
      <LoginForm />
      <p className="text-center mt-4 text-sm text-muted-foreground">
        {t("DONT_HAVE_ACCOUNT")}{" "}
        <Link href="/register" className="text-primary hover:underline">
          {t("REGISTER")}
        </Link>
      </p>
    </>
  );
}
