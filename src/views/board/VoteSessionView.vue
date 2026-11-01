<template>
  <section class="surface panel-padding vote-panel" aria-label="갈드컵 투표">
    <div class="section-heading"><h2>갈드컵 투표</h2><span v-if="voteSession" class="badge" :class="voteStatus === 'LIVE' ? 'badge-danger' : 'badge-neutral'">{{ voteStatus === 'LIVE' ? '진행 중' : voteStatus === 'UPCOMING' ? '시작 예정' : voteStatus === 'FINISHED' ? '종료' : '확인 필요' }}</span></div>
    <p v-if="boardStore.voteError" role="alert" class="field-error">{{ boardStore.voteError }} <button type="button" class="ui-button ui-button-secondary ui-button-small" @click="boardStore.fetchActiveVoteSession(boardId)">다시 시도</button></p>
    <p v-if="liveError" role="status" class="field-help mb-4">{{ liveError }}</p>
    <template v-if="voteSession">
      <div class="vote-content" :class="{ 'vote-content-collapsed': !isExpanded }">
        <div class="vote-intro">
          <h3 class="vote-topic">{{ voteSession.topic }}</h3><p v-if="voteSession.description" class="vote-description">{{ voteSession.description }}</p>
          <div class="vote-facts"><span>{{ (voteSession.totalVotes || 0).toLocaleString() }}명 참여</span><button type="button" class="ui-button ui-button-secondary ui-button-small" :aria-expanded="isExpanded" @click="isExpanded = !isExpanded">{{ isExpanded ? '상세 접기' : '상세 보기' }}<span aria-hidden="true">{{ isExpanded ? ' −' : ' ＋' }}</span></button></div>
          <dl v-show="isExpanded" class="vote-dates"><div><dt>시작</dt><dd>{{ formatDateTime(voteSession.startTime) }}</dd></div><div><dt>종료</dt><dd>{{ formatDateTime(voteSession.endTime) }}</dd></div></dl>
        </div>
        <div v-show="isExpanded" class="vote-choices">
          <div :class="isDuel ? 'vote-options-duel' : 'vote-options-list'">
            <div v-for="(option, index) in voteSession.options" :key="option.id ?? index" class="vote-option">
              <img :src="option.imageUrl || '/images/option-placeholder.svg'" :alt="option.label" loading="lazy" width="240" height="240" />
              <div class="min-w-0"><p class="option-label" :class="{ 'option-label-clamp': expandedTextIndex !== index }">{{ option.label }}</p>
                <button v-if="option.label?.length > 30" type="button" class="option-expand ui-button ui-button-secondary ui-button-small" :aria-expanded="expandedTextIndex === index" @click="toggleTextExpand(index)">{{ expandedTextIndex === index ? '접기' : '더보기' }}</button>
                <p v-if="voteStatus === 'FINISHED'" class="option-result">{{ (option.count || 0).toLocaleString() }}표 · {{ calculatePercentage(option.count).toFixed(0) }}%</p>
              </div>
            </div>
          </div>
          <p v-if="voteStatus === 'LIVE'" class="vote-blind-note">공정한 투표를 위해 종료 후 결과가 공개됩니다.</p>
        </div>
      </div>
      <div class="vote-footer">
        <button type="button" class="ui-button vote-submit" :disabled="voteStatus !== 'LIVE'" @click="onVoteClick">{{ voteStatus === 'UPCOMING' ? '시작 전입니다' : voteStatus === 'FINISHED' ? '종료된 투표입니다' : voteStatus === 'LIVE' ? '투표 참여하기' : '참여할 수 없습니다' }}</button>
        <nav class="vote-links" aria-label="투표 더 보기"><router-link class="ui-button ui-button-secondary ui-button-small" :to="{ name:'OpinionAnalysis', params:{ boardId, voteSessionId:voteSession.id } }">AI 여론 분석<span aria-hidden="true">›</span></router-link><router-link class="ui-button ui-button-secondary ui-button-small" :to="{ name:'VoteHistory', params:{ boardId } }">지난 투표 결과<span aria-hidden="true">›</span></router-link></nav>
      </div>
    </template>
    <div v-else class="vote-empty"><p class="font-semibold">아직 진행 중인 투표가 없습니다</p><p class="field-help">게시글에서 의견을 나누거나<br />지난 투표 결과를 확인해 보세요.</p><router-link class="ui-button ui-button-secondary mt-5" :to="{ name:'VoteHistory', params:{ boardId } }">지난 투표 보기</router-link></div>
    <Teleport to="body"><VoteModal v-if="isVoteModalOpen" :board-id="boardId" :vote-session-id="voteSession?.id" @close="isVoteModalOpen = false" @voted="boardStore.fetchActiveVoteSession(boardId)" /></Teleport>
  </section>
</template>
<script setup>
import { computed, ref, watch, onUnmounted, defineAsyncComponent } from 'vue';
import { useRoute } from 'vue-router';
import { useBoardStore } from '@/stores/board';
import { useUserStore } from '@/stores/user';
import { useClock } from '@/composables/useClock';
import { voteStatus as getVoteStatus } from '@/utils/vote';
import { tokenExpiresSoon } from '@/utils/tokenExpiry';
const VoteModal = defineAsyncComponent(() => import('@/views/board/VoteView.vue'));

/**
 * 라우트 및 스토어 인스턴스 초기화
 */
const route = useRoute();
const boardStore = useBoardStore();
const userStore = useUserStore();
const now = useClock();
const liveError = ref('');
let connectionVersion = 0;
let disposed = false;

/**
 * UI 토글 및 모달 상태 관리
 */
const isExpanded = ref(true);
const isVoteModalOpen = ref(false);
const expandedTextIndex = ref(null);

/**
 * STOMP 웹소켓 클라이언트 참조 변수
 */
let client = null;

/**
 * 현재 게시판 ID 및 활성 투표 세션 정보
 */
const boardId = computed(() => route.params.boardId);
const voteSession = computed(() => boardStore.activeVoteSession);

/**
 * 1:1 대결 구도 여부 판단 (투표 옵션 2개 기준)
 */
const isDuel = computed(() => voteSession.value?.options?.length === 2);

/**
 * 투표 세션의 현재 상태 (UPCOMING, LIVE, FINISHED)
 */
const voteStatus = computed(() => getVoteStatus(voteSession.value, now.value));

/**
 * 긴 항목 텍스트의 펼침/접기 토글
 */
const toggleTextExpand = (index) => {
  expandedTextIndex.value = expandedTextIndex.value === index ? null : index;
};

/**
 * 일시 문자열 포맷팅 (MM월 DD일 HH:mm)
 */
const formatDateTime = (dateStr) => {
  if (!dateStr || !Number.isFinite(new Date(dateStr).getTime())) return '';
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('ko-KR', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false
  }).format(date);
};

/**
 * 옵션별 득표율 백분율 계산
 */
const calculatePercentage = (count) => {
  if (!voteSession.value?.options || count == null) return 0;
  
  const total = voteSession.value.totalVotes || voteSession.value.options.reduce((acc, cur) => acc + Number(cur.count || 0), 0);
  
  return total <= 0 ? 0 : Math.min(100, Math.max(0, (Number(count) / total) * 100)) || 0;
};

/**
 * STOMP 웹소켓 연결 및 인증 헤더 전달
 */
const disconnectWebSocket = () => {
  connectionVersion++;
  const previous = client;
  client = null;
  previous?.deactivate({ force: true }).catch(() => {});
};
const connectWebSocket = async () => {
  const version = connectionVersion;
  const sessionId = voteSession.value?.id;
  if (!sessionId || voteStatus.value !== 'LIVE' || client || disposed) return;
  try {
    const base = new URL(import.meta.env.VITE_API_BASE_URL || window.location.origin, window.location.origin);
    base.protocol = base.protocol === 'https:' ? 'wss:' : 'ws:';
    base.pathname = (base.pathname.endsWith('/') ? base.pathname.slice(0, -1) : base.pathname) + '/ws-galdcup';
    base.search = ''; base.hash = '';
    const { Client } = await import('@stomp/stompjs');
    if (disposed || version !== connectionVersion) return;
    const socket = new Client({
      brokerURL: base.toString(), reconnectDelay: 5000, connectionTimeout: 10000,
      heartbeatIncoming: 10000, heartbeatOutgoing: 10000,
      beforeConnect: async () => {
        if (tokenExpiresSoon(userStore.accessToken)) await userStore.reissue();
        if (disposed || version !== connectionVersion) { await socket.deactivate({ force: true }); return; }
        socket.connectHeaders = userStore.accessToken ? { Authorization: `Bearer ${userStore.accessToken}` } : {};
      },
      onConnect: () => {
        if (version !== connectionVersion || String(boardStore.activeVoteSession?.id) !== String(sessionId)) return;
        liveError.value = '';
        socket.subscribe(`/topic/votes/${sessionId}`, message => {
          if (version !== connectionVersion || String(boardStore.activeVoteSession?.id) !== String(sessionId)) return;
          const count = Number(message.body);
          if (Number.isSafeInteger(count) && count >= 0) boardStore.activeVoteSession.totalVotes = count;
        });
      },
      onWebSocketClose: () => { if (!disposed && version === connectionVersion) liveError.value = '실시간 연결이 끊겼습니다. 자동으로 다시 연결합니다.'; },
      onStompError: () => { if (!disposed && version === connectionVersion) liveError.value = '실시간 집계에 연결하지 못했습니다. 새로고침해 다시 시도해 주세요.'; },
    });
    client = socket;
    socket.activate();
  } catch {
    if (!disposed && version === connectionVersion) liveError.value = '실시간 연결을 준비하지 못했습니다. 새로고침해 다시 시도해 주세요.';
  }
};

/**
 * 투표 참여 버튼 클릭 시 모달 표시
 */
const onVoteClick = () => {
  if (voteStatus.value !== 'LIVE') return;
  isVoteModalOpen.value = true;
};

/**
 * 투표 진행 상태에 따른 웹소켓 자동 연결/해제 관리
 */
watch([() => voteSession.value?.id, voteStatus, () => userStore.accessToken], (current, previous) => {
  disconnectWebSocket();
  if (current[0] !== previous?.[0]) { isVoteModalOpen.value = false; expandedTextIndex.value = null; }
  if (current[1] === 'LIVE') connectWebSocket();
  else if (previous?.[1] === 'LIVE' && current[1] === 'FINISHED') boardStore.fetchActiveVoteSession(boardId.value);
}, { immediate: true });
onUnmounted(() => { disposed = true; disconnectWebSocket(); });
</script>
<style scoped>
.vote-panel { border-top:3px solid var(--ui-primary); }
.vote-content { display:grid; gap:20px; }
.vote-intro, .vote-choices { min-width:0; }
.vote-topic { font-size:20px; line-height:1.5; font-weight:750; letter-spacing:-.025em; }
.vote-description { margin-top:10px; color:var(--ui-text-muted); font-size:14px; line-height:1.7; white-space:pre-line; }
.vote-facts { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:8px; margin-block:12px; font-size:12px; color:var(--ui-text-muted); }

.vote-options-duel { display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:12px; }
.vote-option { min-width:0; padding:12px; border:1px solid var(--ui-border); border-radius:10px; background:var(--ui-surface-subtle); }
.vote-option img { display:block; width:100%; aspect-ratio:4/3; height:auto; max-height:160px; border-radius:6px; object-fit:cover; background:var(--ui-surface); }
.option-label { margin-top:10px; font-size:14px; line-height:1.65; font-weight:650; overflow-wrap:anywhere; }
.option-label-clamp { display:-webkit-box; -webkit-line-clamp:3; -webkit-box-orient:vertical; overflow:hidden; }
.option-expand { margin-top:6px; }
.option-result { margin-top:6px; color:var(--ui-primary); font-size:13px; font-weight:650; }
.vote-options-list { display:grid; gap:12px; }
.vote-options-list .vote-option { display:grid; grid-template-columns:56px minmax(0,1fr); gap:12px; align-items:center; }
.vote-options-list .option-label { margin-top:0; }
.vote-blind-note { margin-top:16px; color:var(--ui-text-muted); font-size:12px; }
.vote-dates { display:grid; gap:8px; padding-top:16px; border-top:1px solid var(--ui-border); font-size:13px; }
.vote-dates > div { display:flex; flex-wrap:wrap; gap:12px; }
.vote-dates dt { color:var(--ui-text-muted); }
.vote-footer { display:flex; flex-wrap:wrap; align-items:center; gap:12px 24px; margin-top:24px; padding-top:20px; border-top:1px solid var(--ui-border); }
.vote-submit { width:100%; }
.vote-links { display:flex; flex:1; flex-wrap:wrap; gap:8px; }
.vote-links a { display:flex; align-items:center; justify-content:space-between; gap:12px; min-height:44px; padding-block:10px; color:var(--ui-secondary); font-size:13px; }
.vote-links a:hover { color:var(--ui-primary); }
.vote-empty { padding-block:16px; text-align:center; font-size:14px; }
@media(min-width:640px) { .vote-submit { width:auto; min-width:200px; } .vote-links { justify-content:flex-end; } .vote-links a { gap:16px; } }
@media(min-width:768px) {
  .vote-content { grid-template-columns:minmax(0,.85fr) minmax(0,1.15fr); gap:32px; }
  .vote-content-collapsed { grid-template-columns:minmax(0,1fr); }
  .vote-topic { font-size:24px; }
  .vote-options-list { grid-template-columns:repeat(2,minmax(0,1fr)); }
}
</style>
