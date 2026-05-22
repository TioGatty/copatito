// Achievement catalog — keep in sync with check_achievements SQL function
export interface AchievementDef {
  code: string
  icon: string
  title: string
  desc: string
  category: 'predict' | 'hit' | 'exact' | 'points' | 'accuracy' | 'pool' | 'referral'
}

export const ACHIEVEMENTS: AchievementDef[] = [
  { code: 'first_prediction',     icon: '🎯', title: 'Primer paso',      desc: 'Hiciste tu primer pronóstico',  category: 'predict' },
  { code: 'ten_predictions',      icon: '🔟', title: 'Decena',           desc: '10 pronósticos hechos',          category: 'predict' },
  { code: 'fifty_predictions',    icon: '🏃', title: 'Constante',        desc: '50 pronósticos hechos',          category: 'predict' },
  { code: 'all_in',               icon: '💯', title: 'Todo el Mundial',  desc: '100 pronósticos hechos',         category: 'predict' },

  { code: 'first_hit',            icon: '✅', title: 'Buen ojo',         desc: 'Tu primer acierto',              category: 'hit' },
  { code: 'ten_hits',             icon: '🎲', title: 'Suertudo',         desc: '10 aciertos totales',            category: 'hit' },
  { code: 'twenty_five_hits',     icon: '🧠', title: 'Estratega',        desc: '25 aciertos totales',            category: 'hit' },

  { code: 'first_exact',          icon: '🎉', title: 'Bingo',            desc: 'Acertaste un score exacto',      category: 'exact' },
  { code: 'five_exact',           icon: '🔮', title: 'Pitoniso',         desc: '5 scores exactos',               category: 'exact' },
  { code: 'oracle',               icon: '🧿', title: 'Oráculo',          desc: '15 scores exactos',              category: 'exact' },

  { code: 'fifty_points',         icon: '⭐', title: '50 puntos',         desc: 'Sumaste 50 puntos',              category: 'points' },
  { code: 'hundred_points',       icon: '🌟', title: 'Tres dígitos',     desc: 'Sumaste 100 puntos',             category: 'points' },
  { code: 'three_hundred_points', icon: '👑', title: 'Leyenda',          desc: 'Sumaste 300 puntos',             category: 'points' },

  { code: 'accuracy_50',          icon: '📊', title: 'Más de la mitad',  desc: '50% de aciertos (mín 10)',       category: 'accuracy' },
  { code: 'accuracy_70',          icon: '🚀', title: 'Insider',          desc: '70% de aciertos (mín 20)',       category: 'accuracy' },

  { code: 'pool_creator',         icon: '🏗️', title: 'Anfitrión',         desc: 'Creaste tu primer pool',         category: 'pool' },
  { code: 'pool_social',          icon: '🤝', title: 'Social',           desc: 'Estás en 2+ pools',              category: 'pool' },

  { code: 'first_referral',       icon: '🎁', title: 'Reclutador',       desc: 'Invitaste a tu primer amigo',    category: 'referral' },
  { code: 'connector',            icon: '🌐', title: 'Conector',         desc: '5 amigos invitados',             category: 'referral' },
]

export const ACH_BY_CODE = new Map(ACHIEVEMENTS.map(a => [a.code, a]))
