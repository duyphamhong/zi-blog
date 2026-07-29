'use client'

import { useEffect, useState } from 'react'

type Comment = { content: string; createdAt: string; displayName: string; id: number }
type Props = { postId: number | string; labels: { empty: string; error: string; heading: string } }

export function CommentSection({ labels, postId }: Props) {
  const [comments, setComments] = useState<Comment[]>([])
  const [failed, setFailed] = useState(false)
  useEffect(() => { void fetch(`/api/community/posts/${postId}/comments`).then(async (response) => response.ok ? response.json() as Promise<{ comments: Comment[] }> : Promise.reject()).then((value) => setComments(value.comments)).catch(() => setFailed(true)) }, [postId])
  return <section className="mt-12" aria-labelledby="comments-heading"><h2 className="text-2xl font-bold" id="comments-heading">{labels.heading}</h2>{failed ? <p role="status">{labels.error}</p> : comments.length === 0 ? <p>{labels.empty}</p> : <ul>{comments.map((comment) => <li className="mt-4 rounded border p-4" key={comment.id}><strong>{comment.displayName}</strong><p>{comment.content}</p></li>)}</ul>}</section>
}
