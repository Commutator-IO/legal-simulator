/**
 * L'inventaire des systèmes d'IA et le catalogue des produits.
 *
 * La correction du défaut structurel de la première version : la qualification
 * était stockée dans un objet unique, alors qu'une organisation a douze
 * systèmes d'IA et qu'un fabricant a un catalogue. Le livrable réel de l'AI Act
 * *est* l'inventaire — la qualification n'en est qu'une colonne, et c'est
 * l'inventaire qu'une autorité demande d'abord, parce qu'il révèle les systèmes
 * que personne n'avait pensé à qualifier.
 *
 * Chaque entrée enveloppe les réponses de `qualification.ts` avec ce qui fait
 * d'une réponse une pièce de dossier : un nom, un responsable, une date.
 */

import type { Suivi } from './suivi'
import { suiviVide } from './suivi'
import { REPONSES_CRA_VIDES, REPONSES_IA_VIDES, qualifierCra, qualifierIa } from './qualification'
import type { ReponsesCra, ReponsesIa } from './qualification'

// ---------------------------------------------------------------------------
// Systèmes d'IA
// ---------------------------------------------------------------------------

export type SystemeIa = {
  id: string
  suivi: Suivi
  nom: string
  /** Éditeur, ou « interne ». Un système acheté sur étagère reste à inventorier. */
  fournisseur: string
  /** Le métier qui s'en sert, et pour quoi faire. */
  usage: string
  /** Statut de déploiement : ce qui est en pilote compte déjà. */
  statut: StatutSysteme
  reponses: ReponsesIa
}

export type StatutSysteme = 'envisage' | 'pilote' | 'production' | 'retire'

export const STATUTS_SYSTEME: { id: StatutSysteme; label: string; note: string }[] = [
  {
    id: 'envisage',
    label: 'Envisagé',
    note: "Le bon moment pour qualifier : après le choix du fournisseur, la qualification ne change plus que le budget.",
  },
  {
    id: 'pilote',
    label: 'Pilote',
    note: "Un pilote sur données réelles est une mise en service au sens du règlement, pas une expérimentation exemptée.",
  },
  { id: 'production', label: 'En production', note: 'Toutes les obligations sont dues.' },
  {
    id: 'retire',
    label: 'Retiré',
    note: "Conserver la fiche : les journaux de l'article 12 et la documentation survivent au retrait.",
  },
]

export function systemeVide(id: string): SystemeIa {
  return {
    id,
    suivi: suiviVide(),
    nom: '',
    fournisseur: '',
    usage: '',
    statut: 'envisage',
    reponses: { ...REPONSES_IA_VIDES },
  }
}

/** Le tableau de bord de l'inventaire : ce qui alerte, et dans quel ordre. */
export type EtatInventaire = {
  total: number
  interdits: number
  hautRisque: number
  transparence: number
  /** Systèmes en production dont la fiche n'a pas de responsable. */
  orphelins: number
  /** Systèmes jamais qualifiés — la case la plus dangereuse. */
  nonQualifies: number
}

export function etatInventaire(systemes: SystemeIa[]): EtatInventaire {
  let interdits = 0
  let hautRisque = 0
  let transparence = 0
  let orphelins = 0
  let nonQualifies = 0

  for (const s of systemes) {
    if (s.statut === 'retire') continue
    const q = qualifierIa(s.reponses)
    if (q.niveau === 'interdit') interdits++
    if (q.niveau === 'haut-risque') hautRisque++
    if (q.niveau === 'transparence') transparence++
    // « Hors champ » alors que rien n'a été coché n'est pas une qualification,
    // c'est une absence de qualification : les compter à part évite qu'un
    // inventaire vide s'affiche comme un inventaire sain.
    if (!s.reponses.estSystemeIa && !s.reponses.modeleUsageGeneral) nonQualifies++
    if (!s.suivi.responsable.trim()) orphelins++
  }

  return {
    total: systemes.filter((s) => s.statut !== 'retire').length,
    interdits,
    hautRisque,
    transparence,
    orphelins,
    nonQualifies,
  }
}

// ---------------------------------------------------------------------------
// Produits
// ---------------------------------------------------------------------------

export type Produit = {
  id: string
  suivi: Suivi
  nom: string
  /** Version ou gamme : la conformité CRA s'apprécie par version mise sur le marché. */
  version: string
  /** Date de mise sur le marché prévue ou effective — elle décide du régime applicable. */
  miseSurLeMarche: string
  reponses: ReponsesCra
}

export function produitVide(id: string): Produit {
  return {
    id,
    suivi: suiviVide(),
    nom: '',
    version: '',
    miseSurLeMarche: '',
    reponses: { ...REPONSES_CRA_VIDES },
  }
}

export type EtatCatalogue = {
  total: number
  dansLeChamp: number
  /** Produits exigeant un organisme notifié — le chemin critique du calendrier. */
  organismeNotifie: number
  /** Produits dont la période de support annoncée est sous le plancher légal. */
  supportInsuffisant: number
  orphelins: number
}

export function etatCatalogue(produits: Produit[]): EtatCatalogue {
  let dansLeChamp = 0
  let organismeNotifie = 0
  let supportInsuffisant = 0
  let orphelins = 0

  for (const p of produits) {
    const r = qualifierCra(p.reponses)
    if (r.dansLeChamp) {
      dansLeChamp++
      // La classe II et les produits critiques ferment la voie de
      // l'auto-évaluation : c'est le seul cas où le calendrier dépend d'un
      // tiers, donc le seul qu'il faut voir de loin.
      if (p.reponses.categorie === 'important-ii' || p.reponses.categorie === 'critique') {
        organismeNotifie++
      }
      if (r.alerteSupport) supportInsuffisant++
    }
    if (!p.suivi.responsable.trim()) orphelins++
  }

  return { total: produits.length, dansLeChamp, organismeNotifie, supportInsuffisant, orphelins }
}
