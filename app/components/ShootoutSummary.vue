<script setup lang="ts">
import { CheckIcon, XMarkIcon, MinusIcon } from '@heroicons/vue/20/solid'
import { shootoutRows, type Shootout } from '../utils/shootout'
const props = defineProps<{ shootout: Shootout; home: string; away: string; compact?: boolean }>()
const rows = computed(() => shootoutRows(props.shootout))
const names = computed(() => [props.home, props.away])
function cellLabel(side: number, index: number) {
  const cell = rows.value[side]!.cells[index]!
  return `${names.value[side]}, penal ${index + 1}: ${cell.kick ? `${cell.kick.player}, ${cell.state === 'scored' ? 'convertido' : 'fallado'}` : cell.state === 'unused' ? 'no fue necesario' : cell.next ? 'próximo lanzamiento' : 'pendiente'}`
}
</script>
<template>
  <section class="penalty-summary" :class="{ compact }" aria-label="Resultado y lanzamientos de la tanda de penales">
    <header><span>{{ compact ? 'Penales' : shootout.status === 'finished' ? 'Tanda finalizada' : 'Tanda en curso' }}</span><strong>{{ rows[0]!.score }}–{{ rows[1]!.score }}</strong></header>
    <div v-for="(row, side) in rows" :key="side" class="penalty-row"><span class="penalty-team">{{ names[side] }}</span><ol :aria-label="`Lanzamientos de ${names[side]}`"><li v-for="(cell, index) in row.cells" :key="index" :class="[cell.state, { next: cell.next }]" :aria-label="cellLabel(side, index)" :title="cellLabel(side, index)"><CheckIcon v-if="cell.state === 'scored'" aria-hidden="true"/><XMarkIcon v-else-if="cell.state === 'missed'" aria-hidden="true"/><MinusIcon v-else-if="cell.state === 'unused'" aria-hidden="true"/></li></ol></div>
    <p v-if="!compact && shootout.status === 'in_progress' && shootout.nextSide !== null">Próximo lanzamiento: <strong>{{ names[shootout.nextSide] }}</strong></p>
    <p v-else-if="!compact && shootout.status === 'finished'">{{ rows[0]!.score > rows[1]!.score ? home : away }} gana la tanda</p>
  </section>
</template>
<style scoped>
.penalty-summary{background:#20241f;border:1px solid #3c4638;border-radius:6px;padding:20px;margin-bottom:24px}.penalty-summary header{display:flex;justify-content:center;align-items:center;gap:12px;margin-bottom:17px;color:#b7c1ae;font-size:11px}.penalty-summary header strong{font-size:23px;color:#edf0e9;font-variant-numeric:tabular-nums;font-weight:500}.penalty-row{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:15px;max-width:440px;margin:12px auto}.penalty-team{font-size:12px;color:#c1c7bd;overflow-wrap:anywhere}.penalty-row ol{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:7px;max-width:235px;list-style:none;padding:0;margin:0}.penalty-row li{display:grid;place-items:center;width:21px;height:21px;border:1px solid #69715f;border-radius:50%;flex-shrink:0}.penalty-row svg{width:14px;height:14px}.penalty-row .scored{background:#34734e;border-color:#639976;color:#e4f6e9}.penalty-row .missed{background:#853e3e;border-color:#b36b68;color:#ffe5e5}.penalty-row .next{border-color:#e0e8d8;box-shadow:0 0 0 2px #dceac12b}.penalty-row .unused{border-color:transparent;color:#626a5b}.penalty-summary p{text-align:center;font-size:10px;color:#a7b19d;margin:17px 0 0}.penalty-summary p strong{font-weight:500;color:#d0d8c9}.compact{background:none;border:0;border-top:1px solid #ffffff0a;border-radius:0;padding:12px 18px 20px;margin:0}.compact header{margin-bottom:9px;font-size:9px;gap:7px}.compact header strong{font-size:12px;color:#bbd3aa}.compact .penalty-row{gap:10px;margin:7px auto}.compact .penalty-team{font-size:9px}.compact .penalty-row ol{gap:5px;max-width:165px}.compact .penalty-row li{width:16px;height:16px}.compact .penalty-row svg{width:11px;height:11px}@media(max-width:600px){.penalty-summary:not(.compact){padding:16px 12px}.penalty-row ol{gap:5px;max-width:170px}.penalty-team{font-size:11px}.penalty-row li{width:19px;height:19px}}
</style>
