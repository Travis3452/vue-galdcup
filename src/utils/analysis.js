export function normalizeAnalysisResults(results) {
  if (!Array.isArray(results)) return []
  return results.filter(result => result && typeof result === 'object').map((result, index) => ({
    ...result,
    label: typeof result.label === 'string' && result.label.trim() ? result.label : `항목 ${index + 1}`,
    supportRate: Number.isFinite(Number(result.supportRate)) ? Math.min(100, Math.max(0, Number(result.supportRate))) : 0,
  })).sort((a, b) => b.supportRate - a.supportRate)
}
