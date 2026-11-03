<template>
 <section class="surface panel-padding management">
  <header class="section-heading"><div><h1>갈드컵 관리</h1><p class="field-help">{{ board.currentBoard?.topic }} · 정책, 신고와 이용 제한</p></div></header>
  <template v-if="allowed">
   <nav class="manage-tabs" aria-label="갈드컵 관리 메뉴"><button v-for="t in tabs" :key="t.id" type="button" class="ui-button" :class="tab===t.id ? '' : 'ui-button-secondary'" :aria-pressed="tab===t.id" @click="changeTab(t.id)" :disabled="pending">{{ t.label }}</button></nav>
   <BoardPolicyView v-if="tab==='policy'" @close="router.push(base)" />
   <template v-else>
    <p v-if="error" role="alert" class="field-error">{{ error }}</p><p v-if="loading" role="status">불러오는 중입니다…</p>
    <template v-if="tab==='reports'">
     <div class="report-filter"><label class="status-select"><span class="sr-only">신고 상태</span><select v-model="status" class="form-control" :disabled="pending" @change="page=0; selected=null; detail=null; load()"><option value="OPEN">미처리</option><option value="RESOLVED">처리 완료</option><option value="DISMISSED">기각</option></select></label></div>
     <article v-for="r in rows" :key="r.id" class="manage-card report-card">
      <div class="report-heading"><h2><router-link :to="base+'/posts/'+r.postId">{{ r.title }}</router-link></h2><p class="field-help">{{ r.authorNickname }} · 신고 {{ r.reportCount }}건 · {{ date(r.lastReportedAt) }}</p></div>
      <p v-if="r.resolution">처리 사유: {{ r.resolution }}</p>
      <div class="actions report-actions"><button class="ui-button ui-button-secondary" :disabled="pending" :aria-expanded="detail?.id===r.id" :aria-controls="'report-reasons-'+r.id" @click="toggleReasons(r)">{{ detail?.id===r.id ? '신고 사유 닫기' : '신고 사유 보기' }}</button><button v-if="r.status==='OPEN'" class="ui-button" :disabled="pending" @click="selected=r; action='RESOLVE'; reason=''; permanent=false; until=''">신고 처리</button></div>
     <section v-if="detail?.id===r.id" :id="'report-reasons-'+r.id" class="report-details" aria-label="신고 사유"><h2>신고 사유</h2><p v-for="d in detailRows" :key="d.id" class="report-reason">{{ d.reason }} <small>{{ date(d.createdAt) }}</small></p><AppPagination :current-page="detailPage" :total-pages="detailTotal" :disabled="loading || pending" @change="p=>showReasons(detail,p)" /></section>
     </article>

    </template>
    <template v-else>
     <form class="search-users" @submit.prevent="searchUsers"><label><span class="sr-only">닉네임 검색</span><input v-model="nickname" class="form-control" placeholder="닉네임으로 검색" maxlength="14" required /></label><button class="ui-button ui-button-secondary" :disabled="pending">검색</button></form>
     <p v-if="searched && !users.length" class="field-help">검색 결과가 없습니다.</p>
     <div v-for="u in users" :key="u.id" class="user-result"><span>{{ u.nickname }}</span><button class="ui-button ui-button-danger-outline" :disabled="pending" @click="selected=u; reason=''; permanent=false; until=''">차단</button></div>
     <article v-for="b in rows" :key="b.id" class="manage-card ban-row"><h2>{{ b.nickname }} <span class="badge">{{ b.active ? '차단 중' : b.revokedAt ? '해제됨' : '만료됨' }}</span></h2><p>{{ b.reason }}</p><p class="field-help">{{ date(b.createdAt) }} ~ {{ b.expiresAt ? date(b.expiresAt) : '영구' }}</p><button v-if="b.active" class="ui-button ui-button-secondary" :disabled="pending" @click="revoke(b)">차단 해제</button></article>
    </template>
    <p v-if="!loading && !rows.length" class="field-help">표시할 기록이 없습니다.</p><button v-if="error" class="ui-button ui-button-secondary" @click="load">다시 시도</button>
    <AppPagination :current-page="page" :total-pages="totalPages" :disabled="loading || pending" @change="p=>{page=p;load()}" />
    <form v-if="selected" ref="actionForm" class="manage-card action-form" @submit.prevent="submit">
     <h2>{{ tab==='reports' ? '신고 처리: '+selected.title : selected.nickname+' 차단' }}</h2>
     <label v-if="tab==='reports'">처리 방법<select v-model="action" class="form-control"><option value="RESOLVE">처리 완료</option><option value="DISMISS">기각</option><option value="DELETE">게시글 삭제</option><option value="BAN">작성자 차단</option><option value="DELETE_AND_BAN">삭제 및 작성자 차단</option></select></label>
     <label><span class="sr-only">처리 사유 (필수)</span><textarea placeholder="처리 사유를 입력해 주세요 (필수)" v-model="reason" class="form-control" maxlength="500" required rows="3"></textarea></label>
     <template v-if="needsBan"><label><input v-model="permanent" type="checkbox" /> 영구 차단</label><label v-if="!permanent">차단 종료 일시<input v-model="until" type="datetime-local" class="form-control" required /></label><p class="field-help">이 갈드컵의 새 게시글·댓글 작성만 제한합니다. 조회는 가능합니다.</p></template>
     <div class="actions"><button class="ui-button ui-button-danger" :disabled="pending">{{ pending ? '처리 중…' : '확인 및 적용' }}</button><button type="button" class="ui-button ui-button-secondary" :disabled="pending" @click="selected=null">취소</button></div>
    </form>
   </template>
  </template><p v-else role="alert">갈드컵 관리자만 접근할 수 있습니다.</p>
 </section>
</template>
<script setup>
import {ref,computed,watch,nextTick} from 'vue'
import {useRoute,useRouter} from 'vue-router'
import {useBoardStore} from '@/stores/board'
import api from '@/axios'
import {getErrorMessage} from '@/utils/request'
import {notify} from '@/services/notifications'
import BoardPolicyView from './BoardPolicyView.vue'
import AppPagination from '@/components/ui/AppPagination.vue'
const route=useRoute(),router=useRouter(),board=useBoardStore()
const base=computed(()=>'/boards/'+route.params.boardId)
const endpoint=computed(()=>'/boards/'+route.params.boardId)
const allowed=computed(()=>board.isBoardManager || board.isSubManager)
const tabs=[{id:'reports',label:'게시글 신고'},{id:'bans',label:'사용자 차단'},{id:'policy',label:'운영 정책'}]
const tab=ref('reports'),rows=ref([]),page=ref(0),totalPages=ref(0),status=ref('OPEN'),loading=ref(false),pending=ref(false),error=ref('')
const actionForm=ref(null)
const selected=ref(null),action=ref('RESOLVE'),reason=ref(''),permanent=ref(false),until=ref(''),nickname=ref(''),users=ref([]),searched=ref(false)
const detail=ref(null),detailRows=ref([]),detailPage=ref(0),detailTotal=ref(0)
const needsBan=computed(()=>tab.value==='bans'||['BAN','DELETE_AND_BAN'].includes(action.value))
let request=0
function date(v){return v?new Date(v).toLocaleString('ko-KR'):''}
async function load(){const token=++request; if(!allowed.value||tab.value==='policy')return;loading.value=true;error.value='';try{const {data}=await api.get(endpoint.value+'/'+tab.value,{params:{page:page.value,...(tab.value==='reports'?{status:status.value}:{})}});if(token!==request)return;rows.value=data.content;totalPages.value=data.totalPages;if(page.value>0&&page.value>=data.totalPages){page.value=Math.max(0,data.totalPages-1);return load()}}catch(e){if(token===request){rows.value=[];error.value=getErrorMessage(e,'목록을 불러오지 못했습니다.')}}finally{if(token===request)loading.value=false}}
function changeTab(t){tab.value=t;page.value=0;rows.value=[];selected.value=null;detail.value=null;error.value='';load()}
async function run(fn){if(pending.value)return;pending.value=true;error.value='';try{await fn()}catch(e){error.value=getErrorMessage(e,'처리하지 못했습니다.')}finally{pending.value=false}}
async function searchUsers(){await run(async()=>{users.value=[];searched.value=false;const {data}=await api.get('/users/nickname/'+encodeURIComponent(nickname.value.trim()),{params:{size:10}});users.value=data.content||[];searched.value=true})}
function toggleReasons(r){if(detail.value?.id===r.id){detail.value=null;return}return showReasons(r)}
async function showReasons(r,p=0){await run(async()=>{const {data}=await api.get(endpoint.value+'/reports/'+r.id+'/submissions',{params:{page:p}});detail.value=r;detailRows.value=data.content;detailPage.value=p;detailTotal.value=data.totalPages})}
async function submit(){if(!reason.value.trim()){error.value='사유를 입력해 주세요.';return}let expiresAt=null;if(needsBan.value&&!permanent.value){const d=new Date(until.value);if(!Number.isFinite(d.getTime())||d.getTime()<=Date.now()){error.value='미래의 종료 일시를 지정해 주세요.';return}expiresAt=d.toISOString()}if(!confirm('선택한 조치를 적용하시겠습니까?'))return;await run(async()=>{const payload={reason:reason.value.trim(),permanent:needsBan.value&&permanent.value,expiresAt};if(tab.value==='reports')await api.post(endpoint.value+'/reports/'+selected.value.id+'/handle',{...payload,action:action.value});else await api.post(endpoint.value+'/bans',{...payload,userId:selected.value.id});selected.value=null;detail.value=null;notify('처리했습니다.');await load()})}
async function revoke(b){if(!confirm(b.nickname+'님의 차단을 해제하시겠습니까?'))return;await run(async()=>{await api.delete(endpoint.value+'/bans/'+b.id);notify('차단을 해제했습니다.');await load()})}
watch(selected,async value=>{if(value){await nextTick();actionForm.value?.scrollIntoView({block:'center'});actionForm.value?.querySelector('select,textarea')?.focus({preventScroll:true})}})
watch(()=>[route.params.boardId,allowed.value],()=>{selected.value=null;detail.value=null;page.value=0;load()},{immediate:true})
</script>
<style scoped>
.management .report-card { display:flex; flex-wrap:wrap; align-items:center; gap:12px 20px; }
.report-heading { display:flex; flex:1 1 360px; flex-wrap:wrap; align-items:baseline; gap:6px 16px; min-width:0; }
.report-heading h2 { min-width:0; }
.report-heading .field-help { margin-top:0; font-size:12px; overflow-wrap:anywhere; }
.report-actions { justify-content:flex-end; margin-left:auto; flex-shrink:0; }
.report-card > p { flex-basis:100%; order:1; }
.management { --management-divider:color-mix(in srgb, var(--ui-control-border) 65%, var(--ui-border)); }
.management > .section-heading { padding-bottom:20px; margin-bottom:0; border-bottom:2px solid var(--management-divider); }
.management .manage-tabs { margin:0 0 20px; padding:16px 0; border-bottom:1px solid var(--management-divider); }
.management .search-users { padding-bottom:16px; border-bottom:1px solid var(--management-divider); }
.management .manage-card, .management .user-result, .management .report-reason { border-bottom-color:var(--management-divider); }
.management .action-form { margin-top:24px; border-color:var(--management-divider); border-top-width:3px; }
.management :deep(.policy-dialog) { border-color:var(--management-divider); }
.management :deep(.policy-sidebar), .management :deep(.policy-main > header) { border-color:var(--management-divider); }
.management{min-width:0}.management h1{font-size:24px;font-weight:750}.management h2{font-size:16px;font-weight:650;overflow-wrap:anywhere}.manage-tabs,.actions,.user-result,.search-users{display:flex;flex-wrap:wrap;align-items:center;gap:10px}.manage-tabs{margin:20px 0}.manage-card{padding:20px 0;border-bottom:1px solid var(--ui-border);display:grid;gap:12px;overflow-wrap:anywhere}.manage-card p{white-space:pre-wrap}.user-result{justify-content:space-between;padding:12px 0}.action-form{margin-top:20px;padding:20px;background:var(--ui-surface-subtle);border:1px solid var(--ui-border);border-radius:12px}.action-form label,.search-users label{display:grid;gap:6px;min-width:0}.report-reason{border-bottom:1px solid var(--ui-divider);padding:10px 0}.report-reason small{display:block;color:var(--ui-text-muted)}

.search-users { align-items:flex-end; margin-bottom:16px; }
.report-filter { display:flex; margin-bottom:16px; }
.status-select { position:relative; display:block; width:140px; max-width:100%; }
.status-select select { appearance:none; width:100%; height:44px; min-height:44px; padding:9px 36px 9px 12px; font-size:14px; cursor:pointer; }
.status-select select:disabled { cursor:not-allowed; }
.search-users label { flex:1; max-width:360px; }
.search-users .form-control, .search-users > button { height:44px; min-height:44px; }
.search-users > button { flex-shrink:0; }
.user-result { min-height:68px; padding:12px 8px; border-bottom:1px solid var(--ui-border); }
.user-result > span { min-width:0; flex:1; overflow-wrap:anywhere; }
.user-result > button { flex-shrink:0; }
.ban-row { padding:16px 8px; border-bottom:1px solid var(--ui-border); }
.ban-row > button { justify-self:start; width:auto; }
.ban-row h2 { display:flex; flex-wrap:wrap; align-items:center; gap:8px; }
@media(min-width:768px) {
 .ban-row { grid-template-columns:minmax(120px,1fr) minmax(140px,2fr) minmax(180px,2fr) auto; align-items:center; gap:16px; }
 .ban-row > button { justify-self:end; }
}
/* 목록 마지막 행에는 하단 구분선을 표시하지 않습니다. */
.management article.manage-card:last-of-type { border-bottom:0; }
.report-details { flex-basis:100%; min-width:0; order:2; padding:16px; border-radius:10px; background:var(--ui-surface-subtle); }
.report-details h2 { margin-bottom:8px; }
</style>
