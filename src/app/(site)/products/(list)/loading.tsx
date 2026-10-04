export default function ProductsLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-16 md:px-6" aria-busy="true">
      <div className="h-4 w-24 animate-pulse rounded-full bg-zinc-200" />
      <div className="mt-4 h-10 w-full max-w-lg animate-pulse rounded-xl bg-zinc-200" />
      <div className="mt-4 h-5 w-full max-w-md animate-pulse rounded-full bg-zinc-100" />
      <div className="mt-10 h-11 w-full max-w-sm animate-pulse rounded-full bg-zinc-100" />
      <div className="mt-8 h-80 animate-pulse rounded-[2rem] bg-zinc-200" />
      <div className="mt-8 space-y-4">
        {[0, 1].map((i) => (
          <div key={i} className="h-32 animate-pulse rounded-3xl border border-zinc-200 bg-white" />
        ))}
      </div>
    </div>
  );
}
