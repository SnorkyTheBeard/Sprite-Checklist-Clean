/*
  SPRITE CHECKLIST — CODE-BASED ARTWORK

  Put new artwork inside the repository, then enter its repository-relative path
  below. Example: "assets/custom/rare-header.webp"

  null = keep the image already defined by published-design.js
  ""   = intentionally remove that image

  Image fit values: "cover", "contain", "tile", "repeat", or "stretch"
  Header positions: "center", "upper", "top", or "bottom"

  Group and sprite IDs are listed in data.js. Keep IDs lowercase and unchanged.
*/
window.SPRITE_ART_CONFIG = {
  siteBackground: {
    image: null,
    fit: null
  },

  mainHeader: {
    image: null,
    fit: null,
    position: null
  },

  /* Set a value to replace published text. Leave null to keep it. */
  text: {
    kicker: null,
    title: null,
    subtitle: null,
    collectedLabel: null,
    masteredLabel: null,
    masterPrompt: null,
    footerNote: null
  },

  /* Example: Rare:{ title:"Rare Sprites", eyebrow:"", description:"" } */
  pages: {
    Rare: null,
    Epic: null,
    Legendary: null,
    Mythic: null
  },

  rarityBackgrounds: {
    Rare: { image:"assets/page-backgrounds/page-bg-rare.webp", fit:"tile", color:"#071a3c" },
    Epic: { image:"assets/page-backgrounds/page-bg-epic.webp", fit:"tile", color:"#170b38" },
    Legendary: { image:"assets/page-backgrounds/page-bg-legendary.webp", fit:"tile", color:"#160f08" },
    Mythic: { image:"assets/page-backgrounds/page-bg-mythic.webp", fit:"tile", color:"#16091d" }
  },

  rarityHeaders: {
    Rare: null,
    Epic: null,
    Legendary: null,
    Mythic: null
  },

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

  /*
    Example group background:
    groupBackgrounds: {
      water: { image:"assets/custom/water-group.webp", fit:"cover", color:"#071a3c", visible:true }
    }
  */
  groupBackgrounds: {},

  /*
    Example sprite and card artwork:
    sprites: {
      water: {
        base: {
          image: "assets/custom/water-base.webp",
          visible: true,
          cardBackground: "assets/custom/water-base-card.webp",
          cardFit: "cover",
          cardColor: "#071a3c"
        }
      }
    }
  */
  sprites: {},

  sideArt: {
    left: null,
    right: null,
    width: null
  }
};
