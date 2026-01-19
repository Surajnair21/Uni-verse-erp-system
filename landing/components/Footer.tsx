export default function Footer() {
  return (
    <footer className="relative z-[2] border-t border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="text-sm font-semibold">UniVerse</div>
            <div className="text-sm text-muted mt-1">
              AI-enabled academic management. Built with RBAC-first architecture.
            </div>
          </div>
          <div className="text-sm text-muted">
            © {new Date().getFullYear()} UniVerse. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
}
