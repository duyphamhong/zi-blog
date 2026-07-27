import Link from 'next/link'

import { Container } from '@/components/layout/Container'

export default function NotFound() {
  return (
    <Container className="py-24 text-center">
      <p className="text-sm font-black uppercase tracking-[0.25em] text-cyan-700">404</p>
      <h1 className="mt-4 text-4xl font-black">Page not found</h1>
      <p className="mt-4 text-slate-600 dark:text-slate-300">
        The content may not exist, may still be a draft, or may have moved.
      </p>
      <Link
        className="mt-8 inline-flex rounded-xl bg-cyan-700 px-5 py-3 font-bold text-white"
        href="/"
      >
        Return home
      </Link>
    </Container>
  )
}
