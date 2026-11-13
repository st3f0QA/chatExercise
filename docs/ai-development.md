# Development principles

Keep the app intentionally small and keep responsibilities easy to locate:

- UI components render state and emit user intent; API and socket details stay in `services`.
- Authentication rules and password handling stay on the server. Never accept role or sender identity from the browser.
- Registration and message boundaries validate untrusted input on the server, even when the browser also validates forms.
- Add abstractions when they clarify an ownership boundary or remove repeated behavior. Avoid framework layers that only forward calls.
- Keep page objects focused on reusable user actions and assert outcomes in tests.
- Add a unique, stable `data-testid` when adding a meaningful DOM control or testable state.
- For behavior changes, update the closest E2E test and run `npm run build` and `npm run test:e2e`.

The JSON repository and in-memory session store are local-development conveniences, not production infrastructure. Document and replace these boundaries before deployment.
