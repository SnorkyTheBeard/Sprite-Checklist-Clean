/*
  SPRITE CHECKLIST — PAGE & HEADER ART UPDATE

  Replace the repository's existing art-config.js with this file, then upload
  the included assets folder to the repository root.
*/
window.SPRITE_ART_CONFIG = {
  siteBackground: { image: null, fit: null },

  mainHeader: {
    image: "assets/header/main-header.webp",
    fit: "cover",
    position: "center"
  },

  text: {
    kicker: null,
    title: null,
    subtitle: null,
    collectedLabel: null,
    masteredLabel: null,
    masterPrompt: null,
    footerNote: null
  },

  pages: { Rare: null, Epic: null, Legendary: null, Mythic: null },

  rarityBackgrounds: {
    Rare:      { image: "assets/page-backgrounds/page-bg-rare.webp",      fit: "cover", color: "#061b45" },
    Epic:      { image: "assets/page-backgrounds/page-bg-epic.webp",      fit: "cover", color: "#190b3d" },
    Legendary: { image: "assets/page-backgrounds/page-bg-legendary.webp", fit: "cover", color: "#431400" },
    Mythic:    { image: "assets/page-backgrounds/page-bg-mythic.webp",    fit: "cover", color: "#7c5700" }
  },

  rarityHeaders: { Rare: null, Epic: null, Legendary: null, Mythic: null },

  variantBackgrounds: {
    base: "assets/variant-backgrounds/variant-well-base.webp",
    gold: "assets/variant-backgrounds/variant-well-gold.webp",
    gummy: "assets/variant-backgrounds/variant-well-gummy.webp",
    galaxy: "assets/variant-backgrounds/variant-well-galaxy.webp",
    cube: "assets/variant-backgrounds/variant-well-cube.webp",
    gem: "assets/variant-backgrounds/variant-well-gem.webp",
    quack: "assets/variant-backgrounds/variant-well-quack.webp",
    holofoil: "assets/variant-backgrounds/variant-well-holofoil.webp"
  },

  groupBackgrounds: {},
  sprites: {},
  sideArt: { left: null, right: null, width: null }
};
