// How each impact looks. Impact (good or bad for the worker) drives colour + icon + word.
// Status (added / changed / ...) is a separate plain-text chip and never carries colour.
// Red is only used for `worse`; yellow is only ever a fill behind ink text.

export const IMPACT_STYLE = {
  better: { icon: 'check', tone: 'ok', cell: 'bg-ok-soft' },
  worse: { icon: 'alert', tone: 'alert', cell: 'bg-alert-soft' },
  watch: { icon: 'refresh', tone: 'sun', cell: 'bg-sun/35' },
  same: { icon: 'minus', tone: 'neutral', cell: '' },
}

export const DETAIL_TITLE_ID = 'compare-detail-title'
