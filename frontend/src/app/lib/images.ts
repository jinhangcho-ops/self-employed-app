/** 예시 메뉴 임시 사진 (실제 사진으로 교체 예정) */
export const SAMPLE_IMG: Record<string, string> = {
  kjj: '/img/menu-kjj.webp',
  jeyuk: '/img/menu-jeyuk.webp',
  djj: '/img/menu-djj.webp',
  egg: '/img/menu-egg.webp',
}

export const imgOf = (o: { id: string; img?: string }, kind: 'menu' | 'ing') =>
  o.img || (kind === 'menu' ? SAMPLE_IMG[o.id] : undefined)
