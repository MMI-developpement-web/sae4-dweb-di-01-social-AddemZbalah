# Backend API Endpoints Documentation

## User Settings (US 2.3)

### Get User Settings
```
GET /api/users/settings
Authorization: Bearer {token}

Response 200:
{
  "isReadOnly": false,
  "isPrivate": false
}
```

### Update User Settings
```
PUT /api/users/settings
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "isReadOnly": true,
  "isPrivate": false
}

Response 200:
{
  "success": true,
  "message": "Paramètres mis à jour avec succès",
  "settings": {
    "isReadOnly": true,
    "isPrivate": false
  }
}
```

## Post Operations

### Pin a Post (US 3.6)
```
POST /api/posts/{postId}/pin
Authorization: Bearer {token}

Response 200:
{
  "pinned": true,
  "post": { ... }
}
```

### Unpin a Post (US 3.6)
```
DELETE /api/posts/{postId}/pin
Authorization: Bearer {token}

Response 200:
{
  "pinned": false
}

Response 403:
{
  "error": "Vous ne pouvez désépingler que vos propres posts"
}
```

### Retweet a Post
```
POST /api/posts/{postId}/retweet
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "comment": "Optionally add a comment here"  // Optional
}

Response 201:
{
  "id": 123,
  "content": "Optional comment",
  "author": { ... },
  "retweetOf": {postId},
  "createdAt": "2025-03-29T10:00:00Z",
  ...
}

Response 400:
{
  "error": "Vous ne pouvez pas retweeter vos propres posts"
}

Response 409:
{
  "error": "Vous avez déjà retweeté ce post"
}
```

### Remove Retweet
```
DELETE /api/posts/{retweetId}/retweet
Authorization: Bearer {token}

Response 204: (No content)

Response 403:
{
  "error": "Vous ne pouvez supprimer que vos propres retweets"
}

Response 400:
{
  "error": "Ce post n'est pas un retweet"
}
```

### Create Reply to Post (with Read-Only Check)
```
POST /api/posts/{postId}/replies
Authorization: Bearer {token}
Content-Type: application/json

Request:
{
  "textContent": "This is my reply"
}

Response 201:
{
  "id": 456,
  "textContent": "This is my reply",
  ...
}

Response 403 (if post author has read-only mode):
{
  "error": "Cet utilisateur a activé le mode lecture seule, vous ne pouvez pas commenter"
}
```

## Search (US 4.3)

### Search Posts with Filters
```
GET /api/search/posts?q=query&type=tweet&date_from=2020-01-01&date_to=2025-12-31&page=1&per_page=20
Authorization: Bearer {token}

Query Parameters:
  q: string - Search query (required)
  type: "tweet" | "user" | "hashtag" - Type of search (default: "tweet")
  date_from: string (YYYY-MM-DD) - Start date filter (optional)
  date_to: string (YYYY-MM-DD) - End date filter (optional)
  author_id: number - Filter by author ID (optional)
  page: number - Page number (default: 1)
  per_page: number - Items per page (default: 20, max: 50)

Response 200:
{
  "posts": [
    {
      "id": 1,
      "content": "Post #hashtag content",
      "createdAt": "2025-03-29T10:00:00Z",
      "isPinned": false,
      "retweetOf": null,
      "author": { ... },
      ...
    },
    ...
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 20,
    "total_items": 5
  }
}
```

#### Search Examples:
- Search tweets: `/api/search/posts?q=hello&type=tweet`
- Search by hashtag: `/api/search/posts?q=css&type=hashtag` (searches for #css)
- Search users: `/api/search/posts?q=john&type=user` (searches for @john mentions)
- Date range: `/api/search/posts?q=news&date_from=2025-01-01&date_to=2025-03-29`

## Database Fields

### User Table
```sql
ALTER TABLE user ADD COLUMN is_read_only TINYINT DEFAULT 0 NOT NULL;
ALTER TABLE user ADD COLUMN is_private TINYINT DEFAULT 0 NOT NULL;
```

### Post Table
```sql
ALTER TABLE post ADD COLUMN is_pinned TINYINT DEFAULT 0 NOT NULL;
ALTER TABLE post ADD COLUMN retweet_of_id INT DEFAULT NULL;
ALTER TABLE post ADD CONSTRAINT FK_retweet_of FOREIGN KEY (retweet_of_id) REFERENCES post(id) ON DELETE CASCADE;
```

## Important Rules

1. **Read-Only Mode (US 2.3)**
   - When a user has `isReadOnly = true`, nobody can reply to their posts
   - The reply creation returns error 403

2. **Pinned Posts (US 3.6)**
   - Only the post author can pin/unpin
   - Only one post can be pinned per user (previous pin is removed)
   - Pinned posts have `isPinned = true`

3. **Retweets**
   - Cannot retweet own posts
   - Cannot retweet the same post twice
   - Retweet is a new post with `retweetOf` pointing to original
   - Changes to original post don't affect the retweet

4. **Search (US 4.3)**
   - Only returns non-censored posts
   - Type "hashtag" searches for #hashtags in content
   - Type "user" searches for @mentions in content
   - Type "tweet" searches for tweet content directly

5. **Error Codes**
   - 200: Success
   - 201: Created
   - 204: No Content (Success, no response body)
   - 400: Bad Request
   - 403: Forbidden (permission denied)
   - 404: Not Found
   - 409: Conflict (already exists)
   - 422: Unprocessable Entity (validation error)
