# Competition calendar submissions

Choose **Add a Competition Calendar Event** or **Change a Competition Calendar Event** in GitHub's new issue picker. New event requests collect the date, venue, organiser, sanctioning status, entry details, summary, and supporting evidence. Change requests identify the existing competition and list the replacement values, including cancellations or postponements.

Create the repository labels `calendar-submission` and `needs-review` before using the forms. GitHub only applies labels that already exist. The submission workflow also recognises the default `[Calendar Add]:` and `[Calendar Change]:` title prefixes so it can acknowledge requests before label setup. It posts one calendar acknowledgment per issue, including when the issue is edited or labelled again.

## Maintainer review

1. Verify the details against the organiser's announcement or public contact. Confirm sanctioning separately; submitting an issue does not grant it. Ask for missing or conflicting information in the issue.
2. Find the existing event in `src/data/competitions.json` or `src/data/completed_competitions.json`. For additions, assign a unique stable ID such as `hobart-hoist-2027`. Preserve the ID when changing a date or venue, and avoid duplicate entries across the files.
3. Map the submitted values to the fields in `src/utils/competitions.ts`. Dates use `YYYY-MM-DD`; unknown registration URLs and closing dates use `null`. Set `sanctioned` to `true` only when confirmed. Organiser and evidence fields support review and have no dedicated calendar data fields.
4. Leave `statusOverride` as `null` for date-based status. Registration opens automatically when both a registration URL and an unexpired closing date are present. Use `cancelled` for cancellations or `completed` for finished events. A postponement without a confirmed date needs an explicit maintainer decision: the current data model has no postponed status, so do not invent a date or mark it completed.
5. Keep upcoming entries in `competitions.json` and past entries in `completed_competitions.json`. Update `resultsUrl` if a verified results link is supplied. Full scorecards belong in the separate meet results submission process.
6. Open a pull request referencing the issue. Run `npm run validate` and `npm run build`; the existing PR workflow also runs link and content checks. Merge after review, then close the issue once the published listing has been checked.

The issue workflow acknowledges requests. Maintainers make and review the data changes; it does not automatically create a pull request or publish submitted content.
