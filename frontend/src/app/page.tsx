import Link from "next/link";
import { ArrowRight, Box, Code2, Users2, Zap } from "lucide-react";


export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-zinc-950 font-sans">
      {/* Header */}
      <header className="absolute left-0 right-0 top-0 z-50 flex h-24 items-center justify-between bg-transparent px-8">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black text-white dark:bg-white dark:text-black">
            <Code2 size={18} />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
            DevCollab
          </span>
        </div>
        <div className="flex items-center gap-6">
          <Link
            href="/login"
            className="text-sm font-semibold text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-cyan-400"
          >
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-full bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white transition-transform hover:scale-105 dark:bg-white dark:text-zinc-950 dark:hover:bg-cyan-50"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="relative overflow-hidden px-6 pb-32 pt-40 text-center">

          <div className="relative z-10 mx-auto max-w-4xl">
            <h1 className="mb-8 text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-7xl">
              The workspace for <br />
              <span className="text-zinc-400 dark:text-zinc-600">
                elite engineering teams.
              </span>
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-zinc-600 dark:text-zinc-400 sm:text-xl">
              DevCollab brings your projects, tasks, discussions, and team chat
              into a single, unified platform designed for velocity and scale.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/register"
                className="flex h-12 items-center gap-2 rounded-full bg-zinc-900 px-8 text-base font-medium text-white transition-all hover:scale-105 hover:bg-zinc-800 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
              >
                Start building for free <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 sm:grid-cols-3">
              {[
                {
                  title: "Kanban & Tracking",
                  description: "Organize issues effortlessly with drag-and-drop boards designed specifically for agile software cycles.",
                  icon: Box,
                  color: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                },
                {
                  title: "Real-time Chat",
                  description: "Project-bound WebSockets mean your team is always in sync, without the noise of external chat apps.",
                  icon: Zap,
                  color: "bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400"
                },
                {
                  title: "Community & Jobs",
                  description: "Foster a culture of sharing with organizational posts, and recruit top talent directly within the platform.",
                  icon: Users2,
                  color: "bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400"
                }
              ].map((feature, i) => (
                <div 
                  key={i}
                  className="group relative flex flex-col items-start text-left rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
                >
                  <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${feature.color}`}>
                    <feature.icon size={26} />
                  </div>
                  <h3 className="mb-3 text-xl font-bold text-zinc-900 dark:text-zinc-50 transition-colors group-hover:text-primary">
                    {feature.title}
                  </h3>
                  <p className="text-base leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="px-6 py-12">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-black text-white dark:bg-white dark:text-black">
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
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                  Aditya Verma
                </span>
              </p>
              <a 
                href="mailto:adiverma8858@gmail.com" 
                className="text-xs text-zinc-400 hover:text-zinc-900 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors"
              >
                adiverma8858@gmail.com
              </a>
            </div>

          </div>
        </div>
      </footer>
    </div>
  );
}
