# Contributing

## Purpose

The purpose of this document is to establish a base styleguide for contributing to this project.

## Submitting Changes

Changes (typically) must be submitted through GitHub's Pull Request (PR) workflow.

[See the GitHub Documentation for More Info.](https://help.github.com/articles/creating-a-pull-request/#creating-the-pull-request)

## Git

### Branching Style

The exact branching model used may vary per project, but in general please follow this convention:

```bash
# BRANCH_TYPE
# / (forward slash)
# BRANCH_NAME
BRANCH_TYPE/BRANCH_NAME
```

__For Example__:

```bash
feature/homepage
```

When branching for a feature, bugfix or any other feature tied directly to a ticket (in JIRA for example) add use an "__issue__" branch type the __ticket number__ for the branch name.

__For Example__:

```bash
# NOTE: Do not include the ticket summary in the branch name
issue/PROJ-123
```

### Commit Message Style

Git commit messages usually come in 2 parts: The subject line and the body.

- Subject lines are required
- Bodies are optional but can be helpful to explain additional detail behind a particular commit.

__Style__:

- Separate the _subject_ from the _body_ with a blank line
- Limit _subject_ to 50 characters
- Subject should supply useful information
- Use sentence case<sup>[1](#footnote-1)</sup> for the _subject_
- _Do not_ end the _subject_ with a period
- Use imperative mood<sup>[2](#footnote-2)</sup> for the _subject_
- Wrap the _body_ at 72 characters
- Use the _body_ to explain what and _why vs. how_

__Examples__:

```bash
# Bad
# ---
#   - "added" is _not_ in the imperative mood
#   - Subject is wordy and more than 50 characters
#   - Does not use correct casing
#   - Adds a period at the end
added homepage carousel and worked out default config and init scripts.

# Bad
# ---
#   - Subject is too brief and doesn't provide any useful info
#   - Does not use correct casing
fixes

# Other Examples to Avoid
# -----------------------
more fixes
fixed typo
stuff

# Good
# ----
#   - "Add" is in the imperative mood
#   - Subject is concise and informative and is less than 50 characters
#   - Uses correct casing
#   - Does _not_ add period at the end.
Add homepage carousel

# Good
# ----
#   - Follows subject styleguide
#   - A blank line separates subject and body
#   - Body wraps around 72 characters.
Replace GA with GTM

GTM provides several advantages over traditional GA.
All tracking tags can now be managed by the user
without a developer from the GTM console.

```

---

<sup id="footnote-1">1</sup> <small>__Sentence case__: Sentence case is when you only capitalise the first letter of the  first word in a heading – like you would in a sentence.</small>

<sup id="footnote-2">2</sup> <small>__Imperative mood__: The imperative mood is a verb form which makes a command or a request. For example: "Empty the bin, John." (the verb is in the imperative mood) versus "John empties the bin." (the verb is not in the imperative mood).</small>