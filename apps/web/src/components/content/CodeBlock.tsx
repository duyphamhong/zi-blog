'use client'

import { Highlight, themes } from 'prism-react-renderer'
import { useState } from 'react'

export function CodeBlock({
  code,
  filename,
  language,
  copyLabel = 'Copy code',
  copiedLabel = 'Copied',
}: {
  code: string
  filename?: null | string
  language: string
  copyLabel?: string
  copiedLabel?: string
}) {
  const [copied, setCopied] = useState(false)

  async function copy(): Promise<void> {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <figure className="my-8 overflow-hidden rounded-xl border border-slate-700 bg-slate-950">
      <figcaption className="flex items-center justify-between border-b border-slate-700 px-4 py-2 text-xs text-slate-300">
        <span>{filename || language}</span>
        <button
          className="rounded px-2 py-1 hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-cyan-400"
          onClick={copy}
          type="button"
        >
          {copied ? copiedLabel : copyLabel}
        </button>
      </figcaption>
      <Highlight code={code.trimEnd()} language={language} theme={themes.nightOwl}>
        {({ className, getLineProps, getTokenProps, style, tokens }) => (
          <pre className={`${className} overflow-x-auto p-5 text-sm`} style={style}>
            <code>
              {tokens.map((line, lineIndex) => (
                <span {...getLineProps({ line })} key={lineIndex}>
                  {line.map((token, tokenIndex) => (
                    <span {...getTokenProps({ token })} key={tokenIndex} />
                  ))}
                  {'\n'}
                </span>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </figure>
  )
}
