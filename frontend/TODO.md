# TODO: Fix 500 Internal Server Error on POST /api/properties

## Information Gathered
- The POST /api/properties endpoint uses multer for file uploads and the addProperty controller.
- The 500 error with empty message was caused by unhandled multer errors (e.g., file size limit exceeded) that were not caught by the controller's try-catch, leading to Express default 500 response with no body.
- No global error handling middleware was present in server.js.

## Plan
- Add global error handling middleware in backend/server.js to catch multer and other unhandled errors, providing proper JSON error responses.

## Dependent Files to be edited
- backend/server.js: Add error handling middleware.

## Followup steps
- Deploy the backend changes to production.
- Test the POST /api/properties endpoint to ensure errors now return proper messages.
- If issues persist, check server logs for more details.

## Progress
- [x] Added error handling middleware to backend/server.js
- [ ] Deploy changes
- [ ] Test endpoint
