import Link from "next/link";
import { Code2, Layout, MessageSquare, Globe, GitBranch, Activity, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 font-sans">
      
      {/* Header */}
      <header className="flex h-20 items-center justify-between bg-white dark:bg-zinc-950 px-6 sm:px-10 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
            <Code2 size={18} strokeWidth={2.5} />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            DevCollab
          </span>
        </div>
        


        <div className="flex items-center gap-4">
          <Link
            href="/register"
            className="text-sm font-medium text-zinc-900 dark:text-zinc-200 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors focus:outline-none"
          >
            Create account
          </Link>
          <Link
            href="/login"
            className="rounded-md bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 focus:outline-none"
          >
            Log in
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="relative w-full min-h-[70vh] flex items-center bg-zinc-900 overflow-hidden">
          {/* Background Image Overlay */}
          <div className="absolute inset-0 z-0">
             <div 
               className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 mix-blend-overlay"
               style={{ backgroundImage: "url('https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=2070&auto=format&fit=crop')" }}
             />
             <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent"></div>
          </div>
          
          <div className="relative z-10 px-6 sm:px-10 lg:px-20 max-w-4xl text-left py-24">
            <h1 className="text-5xl sm:text-6xl lg:text-[5.5rem] font-bold tracking-tight text-white leading-[1.05] mb-8">
              Plan, build and<br />ship the experience
            </h1>
            <p className="text-lg sm:text-xl text-zinc-300 mb-10 leading-relaxed max-w-2xl font-light">
              Make velocity a staple in your workflow. Enjoy a seamless kanban session, a collective chat or our state-of-the-art git integration. No matter how you build, the doors of DevCollab are open to you.
            </p>
            <Link
              href="/register"
              className="inline-block rounded-full border-2 border-white px-10 py-3 text-base font-semibold text-white transition-all hover:bg-white hover:text-black"
            >
              Join DevCollab
            </Link>
          </div>
        </section>

        {/* FEATURES GRID (OUR REASON FOR BEING style) */}
        <section className="px-6 py-32 sm:px-10 bg-white dark:bg-zinc-950">
          <div className="mx-auto max-w-6xl">
            
            <div className="text-center mb-20 flex flex-col items-center">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-3 uppercase tracking-wide">
                OUR REASON FOR BEING
              </h2>
              <p className="text-lg text-zinc-600 dark:text-zinc-400 font-medium">
                How can we help your team?
              </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-6 gap-y-16">
              
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center group">
                <div className="mb-6 text-zinc-900 dark:text-white transition-transform group-hover:-translate-y-1">
                  <Layout size={48} strokeWidth={1.5} />
                </div>
                <h3 className="mb-2 text-[15px] font-bold leading-tight text-zinc-900 dark:text-zinc-50">
                  Kanban & Tracking
                </h3>
                <p className="text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Organize issues effortlessly.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center group">
                <div className="mb-6 text-zinc-900 dark:text-white transition-transform group-hover:-translate-y-1">
                  <MessageSquare size={48} strokeWidth={1.5} />
                </div>
                <h3 className="mb-2 text-[15px] font-bold leading-tight text-zinc-900 dark:text-zinc-50">
                  Real-time Chat
                </h3>
                <p className="text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Project-bound WebSockets.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center group">
                <div className="mb-6 text-zinc-900 dark:text-white transition-transform group-hover:-translate-y-1">
                  <Globe size={48} strokeWidth={1.5} />
                </div>
                <h3 className="mb-2 text-[15px] font-bold leading-tight text-zinc-900 dark:text-zinc-50">
                  Centralized Hub
                </h3>
                <p className="text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Foster a culture of sharing.
                </p>
              </div>

              {/* Feature 4 */}
              <div className="flex flex-col items-center text-center group">
                <div className="mb-6 text-zinc-900 dark:text-white transition-transform group-hover:-translate-y-1">
                  <GitBranch size={48} strokeWidth={1.5} />
                </div>
                <h3 className="mb-2 text-[15px] font-bold leading-tight text-zinc-900 dark:text-zinc-50">
                  Seamless Git Sync
                </h3>
                <p className="text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Connect your repositories.
                </p>
              </div>

              {/* Feature 5 */}
              <div className="flex flex-col items-center text-center group">
                <div className="mb-6 text-zinc-900 dark:text-white transition-transform group-hover:-translate-y-1">
                  <Activity size={48} strokeWidth={1.5} />
                </div>
                <h3 className="mb-2 text-[15px] font-bold leading-tight text-zinc-900 dark:text-zinc-50">
                  Global Audit Logs
                </h3>
                <p className="text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Never lose track of changes.
                </p>
              </div>

              {/* Feature 6 */}
              <div className="flex flex-col items-center text-center group">
                <div className="mb-6 text-zinc-900 dark:text-white transition-transform group-hover:-translate-y-1">
                  <ShieldCheck size={48} strokeWidth={1.5} />
                </div>
                <h3 className="mb-2 text-[15px] font-bold leading-tight text-zinc-900 dark:text-zinc-50">
                  Advanced Permissions
                </h3>
                <p className="text-[13px] leading-relaxed text-zinc-600 dark:text-zinc-400">
                  Keep your workspace secure.
                </p>
              </div>

            </div >
            
            {/* Final Call to Action */}
            <div className="mt-32 text-center flex flex-col items-center border-t border-zinc-200 dark:border-zinc-800 pt-32">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-4 uppercase tracking-wide">
                READY TO START BUILDING?
              </h2>
              <p className="text-zinc-600 dark:text-zinc-400 max-w-lg mb-8">
                Create your workspace in seconds. Connect your repositories, invite your team, and experience a faster way to ship software together.
              </p>
              <Link
                href="/register"
                className="inline-block rounded-md bg-zinc-900 px-8 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-sm"
              >
                Create your free account
              </Link>
            </div>

          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-12 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                <Code2 size={12} />
              </div>
              <span className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
                DevCollab
              </span>
              <span className="text-sm text-zinc-400 dark:text-zinc-500 ml-2">
                &copy; {new Date().getFullYear()} All rights reserved.
              </span>
            </div>

            <div className="flex flex-col items-center sm:items-end gap-1">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                Designed & developed by 
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 bg-white dark:bg-zinc-950 px-2 py-0.5 rounded-md border border-zinc-200 dark:border-zinc-800">
                  Aditya Verma
                </span>
              </p>
            </div>

          </div>
        </div>
      </footer>
    </div>
  );
}
