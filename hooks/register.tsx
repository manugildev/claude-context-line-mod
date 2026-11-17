import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Snap } from '../types'

const snapAtom = atom({ plugin: 'context-line', key: 'snap' } as const, null)

const fmtK = (n: number): string => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  return `${Math.floor(n / 1000)}k`
}

const bar = (pct: number): string => {
  const filled = Math.min(5, Math.floor((pct + 10) / 20))
  return '●'.repeat(filled) + '○'.repeat(5 - filled)
}

export const register: Register = on => {
  let model = 'model'

  on('session.measure', async ($, e, next) => {
    const cwd: string = await $.session.cwd()
    let branch = ''
    try {
      const r = await $.process.run(['git', 'branch', '--show-current'], { cwd })
      branch = r.exitCode === 0 ? r.stdout.trim() : ''
    } catch {
      branch = ''
    }
    const usage = await $.session.usage({ breakdown: 'summary' })
    const startedAt = usage.startedAt
    const shownModel: string | undefined = usage.context.breakdown?.model
    await update($, snapAtom, (old: Snap | null): Snap => ({
      model: shownModel ?? old?.model ?? model,
      percent: Math.floor(e.context.percent ?? 0),
      tokens: e.context.tokens ?? 0,
      window: e.context.window,
      usd: e.cost?.usd ?? 0,
      startedAt,
      folder: cwd.split('/').filter(Boolean).pop() ?? cwd,
      branch,
    }))
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined && e.usage?.model) {
      const m = e.usage.model
      model = m
      await update($, snapAtom, (old: Snap | null) => (old ? { ...old, model: m } : old))
    }
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey) return next(e)
    let s = await read($, snapAtom)
    if (s === null) {
      // No measurement yet (a fresh load or a new session): read the figures now
      const usage = await $.session.usage({ breakdown: 'summary' })
      const cwd: string = await $.session.cwd()
      let branch = ''
      try {
        const r = await $.process.run(['git', 'branch', '--show-current'], { cwd })
        branch = r.exitCode === 0 ? r.stdout.trim() : ''
      } catch {
        branch = ''
      }
      s = {
        model: usage.context.breakdown?.model ?? model,
        percent: Math.floor(usage.context.percent ?? 0),
        tokens: usage.context.tokens ?? 0,
        window: usage.context.window,
        usd: usage.cost?.usd ?? 0,
        startedAt: usage.startedAt,
        folder: cwd.split('/').filter(Boolean).pop() ?? cwd,
        branch,
      }
    }

    const { Box, Text } = $.ui.resolve(e)
    const barColor = s.percent >= 90 ? 'red' : s.percent >= 70 ? 'yellow' : 'green'
    const mins = Math.max(0, Math.floor(((await $.clock.now()) - s.startedAt) / 60000))
    const time =
      mins >= 1440
        ? `${Math.floor(mins / 1440)}d ${Math.floor((mins % 1440) / 60)}h`
        : mins >= 60
          ? `${Math.floor(mins / 60)}h ${mins % 60}m`
          : `${mins}m`

    const stats = [
      <Text color="cyan">[{s.model}]</Text>,
      <Text color={barColor}>
        {bar(s.percent)} {s.percent}%
      </Text>,
      <Text color="yellow">
        {fmtK(s.tokens)}/{fmtK(s.window)}
      </Text>,
      <Text>{'🕐 '}{time}</Text>,
      <Text>${s.usd.toFixed(2)}</Text>,
    ]
    const where = [<Text>{'📁 '}{s.folder}</Text>]
    if (s.branch) where.push(<Text color="magenta">{'🌿 '}{s.branch}</Text>)

    // Estimated widths in cells (an emoji and its space take 3), joined by " | " (3)
    const statsWidth =
      s.model.length + 2 + 5 + 1 + String(s.percent).length + 1 +
      fmtK(s.tokens).length + 1 + fmtK(s.window).length +
      3 + time.length + 1 + s.usd.toFixed(2).length + (stats.length - 1) * 3
    const whereWidth = 3 + s.folder.length + (s.branch ? 2 + 3 + s.branch.length : 0)
    const hasRoom = statsWidth + whereWidth + 6 <= e.props.bodyColumns

    const withBars = (nodes: typeof stats, keep: boolean) =>
      nodes.map((node, i) => (
        <Box key={`i${i}`} flexDirection="row" columnGap={1}>
          {node}
          {keep || i < nodes.length - 1 ? <Text dimColor>|</Text> : null}
        </Box>
      ))

    if (hasRoom) {
      // Wide: stats on the left, folder and branch at the right edge, no separator between
      return (
        <Box flexDirection="row" justifyContent="space-between">
          <Box flexDirection="row" columnGap={1}>
            {withBars(stats, false)}
          </Box>
          <Box flexDirection="row" columnGap={2}>
            {where}
          </Box>
        </Box>
      )
    }

    // Narrow: one wrapping row, every item with its separator
    return (
      <Box flexDirection="row" flexWrap="wrap" columnGap={1}>
        {withBars([...stats, ...where], false)}
      </Box>
    )
  })
}
