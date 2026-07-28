'use client'

import { useEffect, useRef } from 'react'

import { Button } from '@/components/ui/Button'
import { CloseIcon, SearchIcon } from '@/components/ui/Icons'
import type { AppDictionary } from '@/modules/platform'

export function SearchDialog({
  action,
  dictionary,
}: {
  action: string
  dictionary: AppDictionary
}) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)

  function openDialog(): void {
    dialogRef.current?.showModal()
    requestAnimationFrame(() => dialogRef.current?.querySelector('input')?.focus())
  }

  function closeDialog(): void {
    dialogRef.current?.close()
    triggerRef.current?.focus()
  }

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent): void {
      const target = event.target
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        openDialog()
      }
    }
    document.addEventListener('keydown', handleShortcut)
    return () => document.removeEventListener('keydown', handleShortcut)
  }, [])

  return (
    <>
      <button
        aria-haspopup="dialog"
        className="inline-flex min-h-11 items-center gap-3 rounded-control border border-border-subtle bg-canvas px-3 text-sm text-text-muted transition hover:border-brand hover:text-brand sm:min-w-48 sm:justify-between lg:min-w-64 motion-reduce:transition-none"
        onClick={openDialog}
        ref={triggerRef}
        type="button"
      >
        <span className="hidden sm:inline">{dictionary.search.placeholder}</span>
        <SearchIcon className="size-5 shrink-0" />
      </button>
      <dialog
        aria-labelledby="search-dialog-title"
        className="m-auto w-[min(42rem,calc(100%-2rem))] rounded-card border border-border-subtle bg-surface p-0 text-text-primary shadow-2xl"
        onClick={(event) => {
          if (event.target === dialogRef.current) closeDialog()
        }}
        ref={dialogRef}
      >
        <div className="flex items-center justify-between border-b border-border-subtle px-5 py-4">
          <h2 className="text-lg font-black" id="search-dialog-title">
            {dictionary.search.title}
          </h2>
          <button
            aria-label={dictionary.accessibility.close}
            className="rounded-lg p-2 text-text-muted hover:bg-brand-soft hover:text-brand"
            onClick={closeDialog}
            type="button"
          >
            <CloseIcon />
          </button>
        </div>
        <form action={action} className="p-5" role="search">
          <label className="sr-only" htmlFor="header-search-query">
            {dictionary.search.label}
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted" />
              <input
                className="min-h-12 w-full rounded-control border border-border-strong bg-canvas pl-12 pr-4 text-text-primary placeholder:text-text-muted focus:border-brand focus:outline-none"
                id="header-search-query"
                maxLength={100}
                minLength={2}
                name="q"
                placeholder={dictionary.search.placeholder}
                required
                type="search"
              />
            </div>
            <Button type="submit">{dictionary.search.button}</Button>
          </div>
          <p className="mt-3 text-xs text-text-muted">{dictionary.search.shortcutHint}</p>
        </form>
      </dialog>
    </>
  )
}
