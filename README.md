# context-line

context-line is a Claude Code mod. It draws a band above the prompt that shows the state of your session at a glance. It works in the terminal and in the desktop app.

The band shows these items:

- The model name.
- A five-dot bar, the percent of the context window in use, and the tokens used out of the window size.
- The time since the session started, and the cost in US dollars.
- The folder and the git branch.

On a wide terminal, the folder and the branch sit at the right edge. On a narrow terminal, all items flow in one row that wraps, with a `|` between them.

The bar turns yellow at 70 percent and red at 90 percent.

## Install

Clone this repository into your Claude Code skills folder. The repository root is the mod folder, so the clone is the whole installation.

```
git clone https://github.com/manugildev/claude-context-line-mod.git ~/.claude/skills/context-line
```

Then start a new Claude Code session. Claude Code loads the mod from the skills folder and reloads it when you save a file.

If the band does not show, you can load the folder in one of two other ways:

- Start a session with `claude --plugin-dir ~/.claude/skills/context-line`.
- Add `"CLAUDE_CODE_PLUGIN_DIRS": "/Users/<you>/.claude/skills/context-line"` to the `env` block of `~/.claude/settings.json`. The desktop app reads this setting.

To make the mod work for one project only, clone it into `<project>/.claude/skills/context-line` instead.

## Limits

- The time is the age of the session. For a resumed session, it counts from the first launch, so it can be days.
- The mod does not show the PR state of the branch.
- The mod estimates text width to choose between the wide and the narrow layout. If the switch happens too early or too late, change the margin in `hooks/register.tsx`.
- Claude Code mods are a new feature. The API can change between versions. If the band stops working after an update, run `claude plugin validate ~/.claude/skills/context-line` and read the result.

## Files

- `.claude-plugin/plugin.json` is the manifest.
- `hooks/hooks.json` names the hooks module.
- `hooks/register.tsx` holds the code.
- `types/index.d.ts` describes the values the mod keeps in session state.

## License

MIT. See `LICENSE`.
