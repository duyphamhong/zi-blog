'use client'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="text-3xl font-black">Something went wrong</h1>
      <p className="mt-4 text-slate-600">
        We could not load this page. Reference: {error.digest || 'unavailable'}
      </p>
      <button
        className="mt-8 rounded-xl bg-cyan-700 px-5 py-3 font-bold text-white"
        onClick={reset}
        type="button"
      >
        Try again
      </button>
    </div>
  )
}
