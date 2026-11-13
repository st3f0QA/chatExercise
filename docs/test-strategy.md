# Test strategy

Run the browser suite with `npm run test:e2e`; Playwright launches the local app through its `webServer` configuration. Run `npm run build` for strict client type-checking and a production bundle.

The suite covers:

- Guest read-only access and the absence of a message input or sender-name field.
- Registration validation paths, password masking/reveal, session restoration after reload, login, and logout.
- Regular and admin roles, including authorized message composition.
- Admin confirmation, persistent history reset, realtime clearing in another client, and denied delete requests for guests and regular members.
- Immediate message and emoji delivery between two isolated browser contexts.

Page objects in `e2e/pages` keep browser actions out of test assertions. The shared fixture creates collision-resistant member accounts because local account data persists between runs. The suite runs with one worker because tests share a persistent room and the admin test deliberately clears it. UI selectors use explicit `data-testid` attributes rather than styling classes or fragile text-only selectors.
