import { NextResponse } from 'next/server'

import { getPublishedComments, normalizeCommentContent } from '@/modules/community'
import { ANONYMOUS_AVATAR_KEYS } from '@/modules/identity/anonymous/constants'
import { COMMUNITY_LIMITS, getPublicCommunityFeatures } from '@/modules/platform/community'
import { getPayloadClient } from '@/shared/payload/client'

type RouteContext = { params: Promise<{ postId: string }> }
const FEATURE_DISABLED_RESPONSE = { error: 'feature_disabled' }
const INVALID_COMMENT_RESPONSE = { error: 'invalid_comment' }

function commentProfile(value: unknown): { avatarKey: string | null; displayName: string } | null {
  if (
    !value ||
    typeof value !== 'object' ||
    !('displayName' in value) ||
    typeof value.displayName !== 'string'
  )
    return null
  const displayName = value.displayName.replace(/\s+/g, ' ').trim()
  const avatarKey =
    'avatarKey' in value && typeof value.avatarKey === 'string' ? value.avatarKey : null
  if (
    displayName.length < COMMUNITY_LIMITS.displayNameMinLength ||
    displayName.length > COMMUNITY_LIMITS.displayNameMaxLength ||
    !avatarKey ||
    !(ANONYMOUS_AVATAR_KEYS as readonly string[]).includes(avatarKey)
  )
    return null
  return { avatarKey, displayName }
}

export async function GET(_: Request, context: RouteContext): Promise<NextResponse> {
  if (!(await getPublicCommunityFeatures()).comments)
    return NextResponse.json(FEATURE_DISABLED_RESPONSE, { status: 403 })
  const { postId } = await context.params
  const comments = await getPublishedComments(postId)
  return NextResponse.json({
    comments: comments.docs.map((comment) => {
      return {
        avatarKey: comment.authorAvatarSnapshot ?? null,
        content: comment.content,
        createdAt: comment.createdAt,
        displayName: comment.authorDisplayNameSnapshot,
        id: comment.id,
      }
    }),
  })
}

export async function POST(request: Request, context: RouteContext): Promise<NextResponse> {
  if (!(await getPublicCommunityFeatures()).comments)
    return NextResponse.json(FEATURE_DISABLED_RESPONSE, { status: 403 })
  const { postId } = await context.params
  const body: unknown = await request.json().catch(() => null)
  const content = normalizeCommentContent(
    body && typeof body === 'object' && 'content' in body ? body.content : null,
    COMMUNITY_LIMITS.commentMaxLength,
  )
  if (!content) return NextResponse.json(INVALID_COMMENT_RESPONSE, { status: 400 })
  const profile = commentProfile(
    body && typeof body === 'object' && 'profile' in body ? body.profile : null,
  )
  if (!profile) return NextResponse.json({ error: 'anonymous_profile_not_ready' }, { status: 403 })
  const payload = await getPayloadClient()
  const post = await payload.find({
    collection: 'posts',
    depth: 0,
    draft: false,
    limit: 1,
    overrideAccess: true,
    pagination: false,
    where: {
      and: [
        { id: { equals: postId } },
        { _status: { equals: 'published' } },
        { visibility: { equals: 'public' } },
      ],
    },
  })
  if (post.docs.length !== 1) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  const comment = await payload.create({
    collection: 'comments',
    data: {
      authorAvatarSnapshot: profile.avatarKey,
      authorDisplayNameSnapshot: profile.displayName,
      content,
      depth: 0,
      post: Number(postId),
      replyCount: 0,
      status: 'published',
    },
    overrideAccess: true,
  })
  return NextResponse.json(
    {
      comment: {
        avatarKey: comment.authorAvatarSnapshot ?? null,
        content: comment.content,
        createdAt: comment.createdAt,
        displayName: comment.authorDisplayNameSnapshot,
        id: comment.id,
      },
      status: comment.status,
    },
    { status: 201 },
  )
}
