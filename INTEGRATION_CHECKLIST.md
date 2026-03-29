# Integration Checklist - What You Need to Do

This checklist shows exactly what you need to do to integrate all the new features into your existing pages.

---

## ✅ Already Done (Backend & Frontend API)

- ✅ Database migrations for new fields
- ✅ Backend API endpoints for all features
- ✅ TypeScript types updated
- ✅ All API functions added to `api.ts`
- ✅ All new React components created
- ✅ Content parser for hashtags/mentions
- ✅ Search bar with filters
- ✅ Pin button component
- ✅ Retweet button component with modal
- ✅ Settings panel component
- ✅ Post badges for retweets and pins

---

## 📋 Your Todo List

### Phase 1: Profile Page (`src/components/Page/Profil.tsx`)

**Add Settings Panel:**
```tsx
// 1. Import at top
import { SettingsPanel } from '@/components/ui/Profile/SettingsPanel'

// 2. Add to your page (only show if user is viewing their own profile)
{isOwnProfile && (
  <div className="mt-6">
    <h2 className="text-lg font-semibold mb-4">Paramètres</h2>
    <SettingsPanel />
  </div>
)}
```

**Add Pin Button to Posts:**
```tsx
// 1. Import at top
import { PinButton } from '@/components/ui/Posts/PinButton'

// 2. For each post in your list:
{isOwnProfile && (
  <PinButton
    postId={post.id}
    isPinned={post.isPinned || false}
    isAuthor={true}
    onPinChange={(isPinned) => {
      // Update your posts state
      setPosts(prev => prev.map(p => 
        p.id === post.id ? {...p, isPinned} : p
      ))
    }}
  />
)}
```

**Display Pinned Post First:**
```tsx
// 1. Import at top
import { PinnedPostBadge } from '@/components/ui/Posts/PostBadges'

// 2. Separate and sort posts
const pinnedPosts = posts.filter(p => p.isPinned)
const regularPosts = posts.filter(p => !p.isPinned)

// 3. Display pinned posts first
{pinnedPosts.map(post => (
  <div key={post.id} className="border-l-4 border-primary bg-primary/5 p-4">
    <PinnedPostBadge />
    {/* Your post display here */}
  </div>
))}

{regularPosts.map(post => (
  // Your regular post display
))}
```

---

### Phase 2: FilActu (Feed) Page (`src/components/Page/FilActu.tsx`)

**Add Search Bar with Filters:**
```tsx
// 1. Import at top
import { SearchBarWithFilters } from '@/components/ui/Searchbar/SearchBarWithFilters'
import { useState } from 'react'

// 2. Add state for search
const [searchResults, setSearchResults] = useState([])
const [isSearching, setIsSearching] = useState(false)

// 3. Add component above your posts
<SearchBarWithFilters
  onResultsUpdate={(results) => {
    setSearchResults(results.posts || [])
    setIsSearching(results.posts?.length > 0)
  }}
/>

// 4. Display results or normal feed
{isSearching ? (
  searchResults.map(post => <YourPostComponent post={post} />)
) : (
  posts.map(post => <YourPostComponent post={post} />)
)}
```

**Add Retweet Button:**
```tsx
// 1. Import at top
import { RetweetButton } from '@/components/ui/Posts/RetweetButton'
import { RetweetBadge, RetweetComment } from '@/components/ui/Posts/PostBadges'

// 2. For each post, check if it's a retweet and display badge
{post.retweetOf && (
  <>
    <RetweetBadge
      retweeterName={post.author.name}
      retweeterHandle={post.author.mail}
      showComment={post.content.length > 0}
    />
    {post.content && <RetweetComment comment={post.content} />}
  </>
)}

// 3. Add retweet button to your action buttons
<RetweetButton
  postId={post.id}
  isRetweeted={/* check if user retweeted */}
  isAuthor={post.author.id === currentUser.id}
  onRetweetChange={() => {
    // Refresh posts or update state
  }}
/>
```

---

### Phase 3: Post Content Enhancement (All Pages)

**Add Hashtag/Mention Highlighting (US 3.5):**
```tsx
// 1. Import at top of component
import { parseContent, renderHighlightedContent } from '@/lib/contentParser'

// 2. Replace plain text display
// Before:
// <p>{post.content}</p>

// After:
// <p>{renderHighlightedContent(parseContent(post.content))}</p>
```

---

## 📝 Files You Need to Modify

### Must Modify:
1. **`src/components/Page/Profil.tsx`**
   - Add SettingsPanel import and display
   - Add PinButton to posts
   - Separate and display pinned posts first

2. **`src/components/Page/FilActu.tsx`**
   - Add SearchBarWithFilters import and display
   - Add RetweetButton to posts
   - Add logic to display retweet badges
   - Replace content with highlighted version

3. **`src/components/ui/FilActu/post.tsx`** (optional, but recommended)
   - Update content display to use parseContent/renderHighlightedContent
   - Update to include isPinned field
   - Add retweetOf field

### Already Updated:
- ✅ `src/lib/api.ts` - All API functions added
- ✅ `frontend/src/components/ui/Profile/SettingsPanel.tsx` - Created
- ✅ `frontend/src/components/ui/Posts/PinButton.tsx` - Created
- ✅ `frontend/src/components/ui/Posts/RetweetButton.tsx` - Created
- ✅ `frontend/src/components/ui/Posts/PostBadges.tsx` - Created
- ✅ `frontend/src/components/ui/Searchbar/SearchBarWithFilters.tsx` - Created
- ✅ `frontend/src/lib/contentParser.tsx` - Created

---

## 🚀 Quick Start Example

### FilActu Page - Complete Example
```tsx
import { useEffect, useState } from "react"
import { getPosts, getCurrentUser } from "@/lib/api"
import { SearchBarWithFilters } from "@/components/ui/Searchbar/SearchBarWithFilters"
import { RetweetButton } from "@/components/ui/Posts/RetweetButton"
import { parseContent, renderHighlightedContent } from "@/lib/contentParser"

export default function FilActu() {
  const [posts, setPosts] = useState([])
  const [filteredPosts, setFilteredPosts] = useState([])
  const [currentUser, setCurrentUser] = useState(null)
  const [isSearching, setIsSearching] = useState(false)

  useEffect(() => {
    loadPosts()
    getCurrentUser().then(setCurrentUser)
  }, [])

  async function loadPosts() {
    const data = await getPosts(1)
    setPosts(data.posts || [])
  }

  const displayPosts = isSearching ? filteredPosts : posts

  return (
    <div className="space-y-4">
      {/* New: Search Bar (US 4.3) */}
      <SearchBarWithFilters
        onResultsUpdate={(results) => {
          setFilteredPosts(results.posts || [])
          setIsSearching(results.posts?.length > 0)
        }}
      />

      {/* Posts */}
      {displayPosts.map(post => (
        <div key={post.id} className="bg-page-dark rounded p-4">
          {/* New: Retweet Badge */}
          {post.retweetOf && (
            <div className="text-sm text-secondary/60 mb-2">
              ↻ Retweeted by {post.author.name}
            </div>
          )}

          {/* New: Highlighted content (US 3.5) */}
          <p className="text-secondary">
            {renderHighlightedContent(parseContent(post.content))}
          </p>

          {/* Actions */}
          <div className="flex gap-4 mt-3 text-secondary/60">
            <button>💬</button>
            
            {/* New: Retweet Button */}
            <RetweetButton
              postId={post.id}
              isRetweeted={false}
              isAuthor={currentUser?.id === post.author.id}
            />
            
            <button>❤️</button>
            <button>↗️</button>
          </div>
        </div>
      ))}
    </div>
  )
}
```

---

## ✨ Features Summary

| Feature | Status | Files | Pages |
|---------|--------|-------|-------|
| US 2.3: Read-Only Mode | ✅ Complete | SettingsPanel.tsx | Profile |
| US 3.5: Hashtags/Mentions | ✅ Complete | contentParser.tsx | FilActu, Profile |
| US 3.6: Pin Posts | ✅ Complete | PinButton.tsx, PostBadges.tsx | Profile |
| US 4.3: Search Feed | ✅ Complete | SearchBarWithFilters.tsx | FilActu |
| Retweets | ✅ Complete | RetweetButton.tsx, PostBadges.tsx | FilActu |

---

## 📚 Documentation Files

- **`IMPLEMENTATION_GUIDE.md`** - Detailed component usage guide
- **`API_DOCUMENTATION.md`** - All backend endpoints
- **`EXAMPLE_FILACTU_INTEGRATION.tsx`** - Complete FilActu example
- **`EXAMPLE_PROFILE_INTEGRATION.tsx`** - Complete Profile example
- **`INTEGRATION_CHECKLIST.md`** - This file (you are here)

---

## 🔍 Testing Checklist

After integration:

- [ ] Settings panel appears on own profile
- [ ] Toggle read-only mode, attempt to reply → should fail
- [ ] Pin a post → appears at top
- [ ] Unpin a post → moves with others
- [ ] Retweet a post → modal appears
- [ ] Add retweet comment → shows with badge
- [ ] Remove retweet → post removed
- [ ] Search with query → results appear
- [ ] Filter search by hashtag → works
- [ ] Filter search by date → works
- [ ] Hashtags show in blue with # → clickable
- [ ] Mentions show in blue with @ → clickable

---

## ❓ Common Issues & Solutions

### Issue: "isReadOnly is not defined"
**Solution:** Make sure migration was applied and backend was restarted

### Issue: "Tag not recognized in content"
**Solution:** Make sure you're using `parseContent()` and `renderHighlightedContent()`

### Issue: "Cannot retweet own post"
**Solution:** Check if `isAuthor` is correctly set in RetweetButton props

### Issue: Search button disabled
**Solution:** Make sure search input is not empty and has been typed in

### Issue: Pin button not showing
**Solution:** Check that `isAuthor={true}` is set for PinButton

---

## 🎯 Next Steps

1. Run database migration: `php bin/console doctrine:migrations:migrate`
2. Restart Docker container: `docker-compose restart backend`
3. Start modifying your pages according to the checklist
4. Test each feature as you integrate
5. Check console for any errors

**Good luck! 🚀**
