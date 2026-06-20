export function Header() {
feature/user-interface-cleanup
  return null;

  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/[0.06] bg-neutral-950/60 backdrop-blur-md">
      <div className="flex items-center justify-between py-4 px-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-8">
          <Link href="/" className="text-xl font-bold tracking-tighter text-white">
            ZeroOne
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {session?.user ? (
            <AuthButtons />
          ) : (
            <Link href="/auth/signin">
              <button className="relative inline-flex items-center justify-center p-0.5 overflow-hidden text-xs font-semibold text-neutral-200 rounded-lg group bg-gradient-to-br from-indigo-500 to-purple-600 group-hover:from-indigo-500 group-hover:to-purple-600 hover:text-white focus:ring-2 focus:outline-none focus:ring-indigo-800 transition-all">
                <span className="relative px-4 py-2 transition-all ease-in duration-75 bg-neutral-950 rounded-md group-hover:bg-opacity-0">
                  Launch Console
                </span>
              </button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
 main
}
