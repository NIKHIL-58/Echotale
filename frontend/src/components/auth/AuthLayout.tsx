import {
  BookOpen,
  Headphones,
  Library,
  PlayCircle,
  Sparkles,
} from "lucide-react";

export function AuthLayout({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(121,87,216,.10),transparent_34%),linear-gradient(135deg,#f7f5f1,#f2eef6)] px-4 py-6 md:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-48px)] w-full max-w-6xl overflow-hidden rounded-[32px] bg-white shadow-[0_24px_70px_rgba(16,20,45,0.13)] lg:grid-cols-[0.9fr_1.1fr]">
        <section className="flex flex-col justify-center px-6 py-8 sm:px-10 md:px-14 lg:px-16">
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#17112f] text-[#e5be70]">
              <BookOpen size={28} />
            </div>

            <div>
              <h2 className="text-3xl font-extrabold tracking-tight text-[#17162B]">
                EchoTale
              </h2>
              <p className="text-sm font-medium text-[#6E6A7C]">
                Listen. Feel. Remember.
              </p>
            </div>
          </div>

          <div className="mb-7">
            <h1 className="max-w-md text-4xl font-extrabold tracking-tight text-[#17162B] md:text-5xl">
              {title}
            </h1>

            {subtitle && (
              <p className="mt-3 max-w-md text-[15px] leading-7 text-[#6E6A7C]">
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </section>

        <section className="relative hidden overflow-hidden bg-[#09071d] p-10 text-white lg:block">
          <img src="/premium-story-world.png" alt="A magical audiobook story world" className="absolute inset-0 h-full w-full object-cover object-center" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#09071d]/25 via-[#09071d]/45 to-[#09071d]/95" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#09071d]/55 to-transparent" />

          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/80 backdrop-blur">
                <Sparkles size={16} />
                Curated audio stories
              </div>

              <h2 className="max-w-xl text-5xl font-extrabold leading-tight tracking-tight">
                Your next favorite story is waiting.
              </h2>

              
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/10 p-5 backdrop-blur">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">Now trending</p>
                  <h3 className="text-xl font-bold">The Last Letter</h3>
                </div>

                <button className="grid h-12 w-12 place-items-center rounded-full bg-[#f1d68f] text-[#241807] shadow-lg">
                  <PlayCircle size={26} />
                </button>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-white/15">
                <div className="h-full w-[62%] rounded-full bg-white" />
              </div>

              <div className="mt-6 grid grid-cols-3 gap-3">
                <div className="rounded-2xl bg-white/10 p-4">
                  <Headphones className="mb-3 text-white/80" size={22} />
                  <p className="text-lg font-bold">12h+</p>
                  <p className="text-xs text-white/55">Weekly listening</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <Library className="mb-3 text-white/80" size={22} />
                  <p className="text-lg font-bold">240+</p>
                  <p className="text-xs text-white/55">Stories</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-4">
                  <Sparkles className="mb-3 text-white/80" size={22} />
                  <p className="text-lg font-bold">AI</p>
                  <p className="text-xs text-white/55">Recommendations</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

