export type Snap = {
  model: string
  percent: number
  tokens: number
  window: number
  usd: number
  startedAt: number
  folder: string
  branch: string
}

declare module 'claude-code' {
  interface PluginState {
    'context-line': { snap: Snap | null }
  }
}
