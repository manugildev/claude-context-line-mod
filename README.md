# context-line

context-line is a Claude Code mod. It draws a band above the prompt that shows your session at a glance. It works in the terminal and in the desktop app.

The band shows the model name, a five-dot bar with the percent of the context window in use, the tokens used, the session time, the cost in US dollars, and the folder and git branch. The bar turns yellow at 70 percent and red at 90 percent.

On a wide terminal, the folder and the branch sit at the right edge. On a narrow terminal, all items flow in one row that wraps, with a `|` between them.

## Install

Clone this repository into your Claude Code skills folder, then start a new session. Claude Code loads the mod and reloads it when you save a file.

```
git clone https://github.com/manugildev/claude-context-line-mod.git ~/.claude/skills/context-line
```

If the band does not show, use one of these:

- Start a session with `claude --plugin-dir ~/.claude/skills/context-line`.
- Add `"CLAUDE_CODE_PLUGIN_DIRS": "/Users/<you>/.claude/skills/context-line"` to the `env` block of `~/.claude/settings.json`. The desktop app reads this setting.

To use the mod in one project only, clone it into `<project>/.claude/skills/context-line`.

## Limits

- The time is the age of the session. For a resumed session, it counts from the first launch, so it can be days.
- The mod estimates text width to choose the wide or the narrow layout. If the switch is wrong, change the margin in `hooks/register.tsx`.
- Mods are a new feature and the API can change. If the band stops working after an update, run `claude plugin validate ~/.claude/skills/context-line`.

## License

MIT. See `LICENSE`.
