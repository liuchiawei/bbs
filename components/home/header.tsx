import { t } from "@/lib/constants";
export default function HomeHeader() {
  return (
    // TODO: style, animations, etc.
    <header className="my-8 text-center space-y-4">
      <h1 className="text-5xl font-bold">{t("HOME_WELCOME")}</h1>
      <p className="text-xl text-muted-foreground">{t("HOME_SUBTITLE")}</p>
    </header>
  );
}
