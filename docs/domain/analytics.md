# Analytics

Article views and share actions enter through the allow-listed analytics event
endpoint. Raw events are private, deduplicated for a profile and post within a
UTC calendar day, then processed into post statistics.

An article view is an accepted article engagement signal after visibility and
interaction criteria. A unique view is one deduplicated anonymous-profile view
per post per configured window. A share action is a supported share-button
activation, not a guaranteed social-network publication.
