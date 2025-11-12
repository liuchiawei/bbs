export function Footer() {
  return (
    <footer className="mx-auto px-4 py-6">
      <p className="text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} BBS. All rights reserved.
      </p>
    </footer>
  );
}
