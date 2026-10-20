export const SEGMENTOS = {
  futebol: { nome: "Escolinha de esporte", ex: "Futebol, futsal, vôlei, basquete" },
  academia: { nome: "Academia", ex: "Musculação, funcional, pilates, crossfit" },
  natacao: { nome: "Natação", ex: "Natação infantil, adulto, hidro" },
  danca: { nome: "Dança", ex: "Balé, jazz, hip-hop, dança de salão" },
  lutas: { nome: "Lutas", ex: "Judô, jiu-jitsu, muay thai, karatê" },
  cursos: { nome: "Cursos e aulas", ex: "Idiomas, reforço, música" },
} as const;
export type Segmento = keyof typeof SEGMENTOS;
