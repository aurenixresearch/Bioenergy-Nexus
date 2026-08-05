# Security Spec for Community Posts Collection

## 1. Data Invariants
- A community post must always be authored by an authenticated user, with `userId` strictly matching their authenticated UID.
- The timestamp `createdAt` must be formatted correctly.
- Any likes on a post are recorded as an array of user UIDs.
- Any comments on a post are stored inside an array of comment objects containing `userId`, `authorName`, `content`, and `createdAt`.
- Mutating other fields such as `content` or `authorName` is strictly restricted to the post's owner.

## 2. The "Dirty Dozen" Payloads (Denial/Exploitation attempts)
1. **Identity Spoofing (Create)**: Submit a post with a `userId` belonging to another user.
2. **State/Field Injection (Create)**: Inject shadow fields like `isAdmin: true` into the post.
3. **Identity Spoofing (Update)**: Attempt to update `userId` of an existing post.
4. **Privilege Escalation (Update)**: Non-author attempting to edit the body text of a post.
5. **Like Tampering (Update)**: Attempting to clear the `likes` field or overwrite with a non-array.
6. **Comment Tampering (Update)**: Attempting to inject malicious comment shapes or clear all comments.
7. **Size Poisoning (Create)**: Inject an extremely long 10MB string into `content` (denial of wallet).
8. **Malicious Link Injection (Create)**: Injecting non-URL values into `researchLink`.
9. **Anonymous Posting (Create)**: Attempting to create a post without being logged in.
10. **Unauthorized Deletion (Delete)**: A non-author user trying to delete a community post.
11. **Immortality Field Breach (Update)**: Attempting to edit `createdAt` on an existing post.
12. **Malformed Array Injection (Update)**: Updating `likes` with nested objects instead of string array.

## 3. Test Cases (Mental & Automated Audit Verification)
All dirty dozen payloads must yield a `PERMISSION_DENIED` error. Only matching actions (like, comment, edit by owner) pass.
