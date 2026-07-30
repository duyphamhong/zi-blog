import { PostReactionButtons } from './PostReactionButtons'
import { ShareMenu } from './ShareMenu'

type Props = {
  canonicalUrl: string
  labels: {
    activeLike: string
    dislike: string
    engagementHeading: string
    like: string
    reactionError: string
    copiedLink: string
    copyLink: string
    nativeShare: string
    share: string
    shareArticle: string
    shareFacebook: string
    shareLinkedIn: string
    shareX: string
  }
  postId: number | string
  reactionsEnabled: boolean
  shareEnabled: boolean
  title: string
}

export function EngagementPanel({
  canonicalUrl,
  labels,
  postId,
  reactionsEnabled,
  shareEnabled,
  title,
}: Props) {
  if (!reactionsEnabled && !shareEnabled) return null
  return (
    <section
      className="mt-12 rounded-2xl border border-border bg-surface p-5 shadow-sm sm:p-6"
      aria-labelledby="engagement-heading"
    >
      <h2 className="text-lg font-extrabold text-text-primary" id="engagement-heading">
        {labels.engagementHeading}
      </h2>
      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <>{reactionsEnabled ? <PostReactionButtons labels={labels} postId={postId} /> : null}</>
        {shareEnabled ? (
          <ShareMenu canonicalUrl={canonicalUrl} labels={labels} postId={postId} title={title} />
        ) : null}
      </div>
    </section>
  )
}
