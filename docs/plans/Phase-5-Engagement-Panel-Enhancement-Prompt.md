# Codex Prompt — Enhance Zi-Blog Engagement Panel UI/UX

Enhance the existing Zi-Blog Engagement Panel UI/UX.

Before implementation:

1. Read the root `AGENTS.md` and all applicable module-level instruction files.
2. Inspect the existing post detail page, engagement components, reaction APIs, anonymous-profile implementation, community feature flags, comments implementation, share tracking, analytics tracking, and design-system components.
3. Reuse existing business logic and APIs.
4. Do not duplicate reaction, comment, profile, or analytics logic.
5. Do not change backend behavior unless required to support the UI.
6. Follow the existing Tailwind CSS and component conventions.
7. Keep article content rendered as a Server Component. Isolate interactive functionality into small Client Components.

## Goal

Replace the current basic Like, Dislike, Share, Anonymous Profile, and Comment UI with a polished and modern Engagement Panel.

The final UI should feel like a cohesive community interaction area rather than a collection of default HTML buttons and form fields.

Use the following visual direction:

- Clean white cards
- Light page background
- Teal/cyan primary accent consistent with Zi-Blog
- Subtle borders and shadows
- Rounded corners
- Compact interaction controls
- Clear visual hierarchy
- Accessible hover, focus, active, loading, and error states
- Responsive behavior for desktop, tablet, and mobile

Do not copy the reference design mechanically. Adapt it to the current Zi-Blog design system.

---

## 1. Engagement Panel

Create or enhance:

```text
components/community/engagement-panel.tsx
```

The panel should appear after the article content and before the comment section.

Suggested layout:

```text
┌─────────────────────────────────────────────────────────────┐
│ Bài viết này hữu ích với bạn?                              │
│                                                             │
│ [ 👍 Thích 128 ] [ 👎 Không thích 4 ]       [ ↗ Chia sẻ ] │
│                                                             │
│ Optional social-proof text                                 │
└─────────────────────────────────────────────────────────────┘
```

Requirements:

- Use a white card with a subtle border and soft shadow.
- Use approximately 16px border radius.
- Use 20–24px internal padding.
- Keep the panel visually compact.
- Like and Dislike controls must show icons and counts.
- Share must use a button rather than plain text links.
- Personalized reaction state must not be included in shared public caching.
- Continue using existing feature flags.
- When post reactions are disabled, do not render reaction controls.
- When share tracking is disabled, do not render tracked share controls.
- Do not show empty unused space when a feature is disabled.

---

## 2. Reaction Buttons

Create or enhance:

```text
components/community/post-reaction-buttons.tsx
```

Display:

```text
[ 👍 Thích 128 ]   [ 👎 Không thích 4 ]
```

Active states:

```text
[ 👍 Đã thích 128 ]
```

or:

```text
[ 👎 Không thích 5 ]
```

Requirements:

- Only one reaction may be active at a time.
- Preserve existing like/dislike switching behavior.
- Support optimistic UI updates.
- Roll back counts and active state if the request fails.
- Prevent duplicate requests while a mutation is pending.
- Show a small loading state without changing button width.
- Add subtle press animation, such as scale down/up.
- Avoid excessive animation.
- Use `aria-pressed` for active reaction buttons.
- Add meaningful accessible labels.
- Show a visible keyboard-focus state.
- Ensure icons are decorative where appropriate.
- Handle:
  - feature disabled
  - rate limited
  - blocked anonymous profile
  - network error
  - invalid post state
- Display errors as a compact inline message or toast using existing project patterns.

Suggested visual states:

```text
Default:
white background, neutral border

Hover:
light teal background or stronger border

Active:
light teal background, teal border, teal icon and text

Disabled:
reduced opacity, no interaction
```

Do not use a strong filled-primary style for both reaction buttons.

---

## 3. Share Menu

Create or enhance:

```text
components/community/share-menu.tsx
```

Replace separate text links such as:

```text
Chia sẻ lên LinkedIn
Chia sẻ lên X
```

with:

```text
[ ↗ Chia sẻ ]
```

Clicking the button should open an accessible popover or dropdown.

Menu items:

```text
LinkedIn
Facebook
X
Sao chép liên kết
Chia sẻ bằng thiết bị
```

Requirements:

- Use existing share tracking.
- Track the correct channel:
  - `linkedin`
  - `facebook`
  - `x`
  - `copy_link`
  - `native`
- Analytics failure must not block the actual share action.
- Show success feedback after copying:
  - `Đã sao chép liên kết`
- Use the Web Share API where supported.
- Hide native-share action when unsupported.
- Close on:
  - outside click
  - Escape
  - successful selection where appropriate
- Provide correct focus management.
- On mobile, use either a full-width popover or bottom-sheet style based on existing design-system capabilities.
- Do not introduce a new UI library if the project already contains accessible Popover, Dropdown, Dialog, or Sheet components.

---

## 4. Comment Section Header

Create or enhance:

```text
components/community/comments/comment-header.tsx
```

Display:

```text
Bình luận 12                             [ Mới nhất ▾ ]
```

Supported sorting:

```text
Mới nhất
Cũ nhất
Nhiều lượt thích
```

Requirements:

- Hide the complete comment section when `commentsEnabled = false`.
- Do not fetch comments when comments are disabled.
- Do not hide the section using CSS only.
- Preserve current pagination and query behavior where available.
- The count should come from existing comment statistics or query results.
- On mobile, allow the title and sort control to wrap cleanly.

---

## 5. Anonymous Profile Presentation

Create or enhance:

```text
components/community/anonymous-profile-chip.tsx
components/community/anonymous-profile-dialog.tsx
components/community/anonymous-avatar-picker.tsx
components/community/anonymous-display-name-form.tsx
```

The comment composer should show the resolved Anonymous Profile:

```text
[Avatar] Fan of Zi
         Anonymous · A7F2

[Chỉnh sửa hồ sơ]
```

Requirements:

- Do not ask for the display name again inside every comment form.
- Reuse the current anonymous-profile API and cookie-based identity.
- Never expose or submit:
  - `anonymousProfileId`
  - `anonymousIdHash`
  - cookie token
  - ownership identifiers
- Allow users to update:
  - display name
  - preset avatar
- Do not support custom avatar uploads in this enhancement.
- Keep the stable short identity code when currently supported.
- Explain that the Anonymous Profile is stored only in the current browser.

Profile dialog structure:

```text
Chỉnh sửa hồ sơ

Tên hiển thị
[ Fan of Zi                        ] 9/40

Chọn avatar
[fox] [robot] [panda] [cat]
[monster] [developer] [dinosaur] [smile]

Hồ sơ ẩn danh chỉ được lưu trên trình duyệt này.

[Hủy]                         [Lưu thay đổi]
```

Requirements:

- Use an accessible modal dialog.
- Manage focus correctly.
- Prevent save when the name is invalid.
- Show inline validation errors.
- Show loading and success states.
- Reuse existing display-name and avatar validation.
- Do not duplicate backend validation in the UI beyond basic client feedback.

---

## 6. Comment Composer

Create or enhance:

```text
components/community/comments/comment-composer.tsx
```

Replace the current separate name input and large default textarea with a structured composer card.

Suggested structure:

```text
┌─────────────────────────────────────────────────────────────┐
│ [Avatar] Fan of Zi · Anonymous · A7F2        Chỉnh sửa hồ sơ│
│                                                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Chia sẻ suy nghĩ của bạn...                            │ │
│ │                                                       │ │
│ │                                             0 / 2000   │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                             │
│ Bình luận sẽ được kiểm duyệt trước khi hiển thị             │
│                                      [ Gửi bình luận ]      │
└─────────────────────────────────────────────────────────────┘
```

Requirements:

- Textarea initial height: approximately 100–120px.
- Allow textarea auto-growth to a reasonable maximum.
- Display character count.
- Disable submit when:
  - content is empty
  - content is invalid
  - request is pending
  - anonymous profile has no valid display name
- When a display name is missing, guide the user to create one.
- Show clear moderation messaging:
  - `Bình luận sẽ được kiểm duyệt trước khi hiển thị.`
- After successful submission, show:
  - `Bình luận đã được gửi và đang chờ kiểm duyệt.`
- Reset the form after successful submission.
- Preserve typed text if submission fails.
- Support keyboard submission only when it does not conflict with multiline entry.
- Use the existing API and feature-flag behavior.
- Do not fetch or render this component while comments are disabled.

---

## 7. Comment Cards

Create or enhance:

```text
components/community/comments/comment-card.tsx
components/community/comments/comment-list.tsx
components/community/comments/comment-item-actions.tsx
```

Each comment should contain:

```text
Avatar
Display name
Anonymous identity code
Author badge where applicable
Timestamp
Comment content
Like count
Reply action
Report action
More menu where relevant
```

Example:

```text
🦊 Fan of Zi · A7F2                         2 giờ trước

Bài viết quá tuyệt vời, thank you!

♡ Thích 3      Trả lời      Báo cáo
```

Requirements:

- Use a subtle card or divider-based layout.
- Avoid strong dark borders around every comment.
- Use 16px or similar border radius.
- Use approximately 20px padding.
- Use muted metadata text.
- Make comment content easy to scan.
- Support the existing maximum reply depth.
- Visually indent replies without creating excessive nested boxes.
- Display an `Tác giả` badge for article-author replies where supported.
- Use relative time with a full timestamp available through tooltip or accessible text.
- Provide an overflow menu for owner/moderator actions where appropriate.
- Existing permissions must remain server-enforced.
- Do not show edit/delete actions to unauthorized visitors.
- Preserve soft-delete presentation and thread integrity.

Reply example:

```text
Fan of Zi · A7F2
└── Dev Mind · Tác giả
```

Avoid deeply nested visual indentation.

---

## 8. Comment Empty, Loading, Pending and Error States

Implement polished states for:

```text
Loading comments
No comments yet
Comment submitted and pending
Failed to load comments
Failed to submit comment
Rate limited
Comments disabled
```

Examples:

```text
Chưa có bình luận nào.
Hãy là người đầu tiên chia sẻ góc nhìn của bạn.
```

and:

```text
Bình luận đã được gửi và đang chờ kiểm duyệt.
```

Requirements:

- Use existing Skeleton, Alert, EmptyState, or Toast components.
- Avoid browser-native alert dialogs.
- Keep error messages actionable.
- Do not expose backend stack traces or internal identifiers.

---

## 9. Visual Design Tokens

Reuse the project design system when available.

Suggested reference values only:

```text
Page background:
#F7F9FC

Card background:
#FFFFFF

Primary text:
#172033

Secondary text:
#667085

Border:
#E4E7EC

Primary accent:
#0891B2

Primary hover:
#0E7490

Active reaction background:
#ECFEFF

Error:
Use the existing semantic error token
```

Suggested radius:

```text
Buttons: 10px
Cards: 14–16px
Dialogs: 16px
Avatars: full circle
```

Suggested spacing:

```text
Engagement panel to comment header:
48px desktop
32px mobile

Composer to comment list:
24px

Between comment cards:
12–16px
```

Do not hardcode arbitrary colors throughout the components.

Add or reuse semantic tokens such as:

```text
community-surface
community-border
community-accent
community-muted
reaction-active
```

only when consistent with the current design-system architecture.

---

## 10. Responsive Behavior

Desktop:

```text
Like | Dislike                           Share
```

Mobile:

```text
Like | Dislike
Share full width or aligned below
```

Requirements:

- Reaction buttons must remain easy to tap.
- Minimum interactive target size should be approximately 44px.
- Comment metadata may wrap without overlapping actions.
- Profile editing should use an appropriate mobile dialog or sheet.
- Share menu should remain within viewport boundaries.
- Avoid horizontal scrolling.
- Comment action labels may become icon-plus-tooltip controls on very narrow screens, while preserving accessible labels.

---

## 11. Accessibility

Meet the project’s accessibility requirements.

Implement:

- Semantic buttons instead of clickable divs.
- Visible keyboard-focus indicators.
- `aria-pressed` for Like and Dislike.
- Accessible Dialog and Popover behavior.
- Screen-reader-friendly form errors.
- Proper input labels.
- Correct heading hierarchy.
- Sufficient contrast.
- Reduced-motion support.
- Decorative icons hidden from assistive technology.
- Meaningful accessible names for icon-only actions.
- Focus restoration after closing dialogs and menus.

---

## 12. Component Boundaries

Recommended final structure:

```text
components/community/
├── engagement-panel.tsx
├── post-reaction-buttons.tsx
├── share-menu.tsx
├── anonymous-profile-chip.tsx
├── anonymous-profile-dialog.tsx
├── anonymous-avatar-picker.tsx
├── anonymous-display-name-form.tsx
└── comments/
    ├── comment-section.tsx
    ├── comment-header.tsx
    ├── comment-composer.tsx
    ├── comment-list.tsx
    ├── comment-card.tsx
    ├── comment-item-actions.tsx
    ├── comment-reply-form.tsx
    ├── comment-empty-state.tsx
    └── comment-status-message.tsx
```

Adapt names to existing repository conventions instead of duplicating equivalent components.

Do not create one oversized Client Component for the whole section.

---

## 13. Preserve Existing Architecture

Do not:

- Move business logic into React components.
- Call Payload collections directly from Client Components.
- Trust profile or ownership IDs from the browser.
- Increment aggregate counters directly from UI code.
- Weaken access control.
- Expose disabled comment APIs.
- Replace event-based analytics with direct counter mutation.
- Make the entire post page dynamic unnecessarily.
- Introduce a new global state library solely for this panel.
- Introduce a new component library without justification.
- Change unrelated article layout or CMS functionality.

Use existing:

```text
application services
route handlers or server actions
feature-flag service
reaction APIs
anonymous-profile APIs
comment APIs
analytics event ingestion
design-system primitives
```

---

## 14. Testing

Add or update unit/component tests for:

```text
reaction active state
reaction optimistic update
reaction rollback after failure
like-to-dislike transition
share menu opening and closing
copy-link success state
native share availability
anonymous profile validation
profile dialog save behavior
comment composer disabled state
comment character count
pending moderation success message
comments hidden when feature flag is disabled
comment sort control
mobile layout behavior where practical
keyboard navigation
accessible names and pressed states
```

Add or update E2E tests for:

```text
anonymous visitor likes a post
reaction persists after refresh
visitor changes like to dislike
visitor copies article link
share event is recorded
visitor edits Anonymous Profile
comments are absent when disabled
admin enables comments
comment section appears
anonymous visitor submits a pending comment
validation and rate-limit errors render correctly
```

Run and report actual results for:

```text
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Also run the repository’s existing relevant integration and E2E commands.

Do not claim a command passed unless it was executed.

---

## Acceptance Criteria

The enhancement is complete when:

1. The current default-looking Like, Dislike, Share, and Comment UI is replaced with a cohesive Engagement Panel.
2. Like and Dislike controls show correct counts and current visitor state.
3. Switching reactions is visually immediate and correctly rolled back on failure.
4. Share actions are available through an accessible menu.
5. Copy-link and native-share interactions provide clear feedback.
6. Anonymous Profile is displayed as an identity chip with avatar, display name, and short code.
7. Anonymous Profile can be edited through an accessible dialog.
8. The comment composer no longer asks for the name on every submission.
9. Comment cards include identity, timestamp, content, and actions.
10. Reply comments have clear but restrained visual nesting.
11. Comments are completely absent and unfetched when disabled.
12. The UI is responsive on desktop, tablet, and mobile.
13. Keyboard and screen-reader interaction is supported.
14. Existing APIs, authorization, analytics, moderation, and feature flags continue to work.
15. No unrelated backend or content-management behavior is changed.
16. Relevant tests, type checks, linting, and build pass.

After implementation, report:

```text
Summary
Existing components reused
Components added or changed
Visual and responsive changes
Feature-flag behavior
Accessibility changes
API or backend changes, if any
Tests added or updated
Commands executed and actual results
Known limitations
```
