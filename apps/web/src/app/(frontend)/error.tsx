'use client'

import { usePathname } from 'next/navigation'

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const isVietnamese = usePathname().split('/')[1] === 'vi'
  return (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <h1 className="text-3xl font-black">
        {isVietnamese ? 'Đã xảy ra lỗi' : 'Something went wrong'}
      </h1>
      <p className="mt-4 text-slate-600">
        {isVietnamese ? 'Không thể tải trang này.' : 'We could not load this page.'}{' '}
        {isVietnamese ? 'Mã tham chiếu' : 'Reference'}: {error.digest || 'unavailable'}
      </p>
      <button
        className="mt-8 rounded-xl bg-cyan-700 px-5 py-3 font-bold text-white"
        onClick={reset}
        type="button"
      >
        {isVietnamese ? 'Thử lại' : 'Try again'}
      </button>
    </div>
  )
}
