// src/components/board/scripts/VoteSession.js
import { computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useBoardStore } from '@/stores/board';
import { useUserStore } from '@/stores/user';
import api from '@/axios';

export default {
  name: 'VoteSession',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const boardStore = useBoardStore();
    const userStore = useUserStore();

    const boardId = route.params.boardId;

    const voteSession = computed(() => boardStore.currentVoteSession);
    const isManager = computed(() => boardStore.isBoardManager);

    const handleCreateVote = () => {
      router.push(`/boards/${boardId}/createVoteSession`);
    };

    const handleFinishVote = async () => {
      if (!confirm("현재 투표를 마감하고 정산하시겠습니까?")) return;
      try {
        await api.post(`/boards/${boardId}/vote-session/${voteSession.value.id}/finish`);
        alert("투표가 종료되었습니다.");
        await boardStore.fetchVoteSession(boardId);
      } catch (error) {
        alert(error.response?.data?.message || "마감 처리에 실패했습니다.");
      }
    };

    // 기존 경로 규칙 적용: /boards/ 사용
    const onVoteClick = () => {
      if (!voteSession.value) return;
      const url = `/boards/${boardId}/vote-session/${voteSession.value.id}/vote`;
      window.open(url, '_blank', 'width=800,height=600,scrollbars=yes');
    };

    // 기존 경로 규칙 적용: /boards/ 사용
    const openVoteStatusWindow = () => {
      const url = `/boards/${boardId}/vote-status`;
      window.open(url, '_blank', 'width=800,height=600,scrollbars=yes');
    };

    const formatDate = (dateStr) => {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleString('ko-KR', { dateStyle: 'short', timeStyle: 'short' });
    };

    const calculatePercentage = (count) => {
      if (!voteSession.value || !voteSession.value.options) return 0;
      const total = voteSession.value.options.reduce((acc, cur) => acc + cur.count, 0);
      return total === 0 ? 0 : (count / total) * 100;
    };

    onMounted(async () => {
      if (boardId) {
        await Promise.all([
          boardStore.fetchBoardPolicy(boardId),
          boardStore.fetchVoteSession(boardId)
        ]);
      }
    });

    return {
      voteSession,
      isManager,
      handleCreateVote,
      handleFinishVote,
      onVoteClick,
      openVoteStatusWindow,
      formatDate,
      calculatePercentage
    };
  }
};