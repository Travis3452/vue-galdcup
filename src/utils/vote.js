export function voteStatus(session, now = Date.now()) {
  if (!session) return null
  const start = new Date(session.startTime).getTime()
  const end = new Date(session.endTime).getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 'UNAVAILABLE'
  if (session.isFinished || now >= end) return 'FINISHED'
  return now < start ? 'UPCOMING' : 'LIVE'
}

export function matchingVoteSession(session, boardId, sessionId) {
  return Boolean(session?.id && String(session.boardId) === String(boardId)
    && (!sessionId || String(session.id) === String(sessionId)))
}
