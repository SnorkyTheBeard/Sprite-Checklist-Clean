(() => {
  'use strict';

  const baseData = Array.isArray(window.SPRITE_DATA) ? window.SPRITE_DATA : [];
  const rarities = ['Rare','Epic','Legendary','Mythic'];
  const defaultRarity = 'Rare';
  const hasOwn = (object,key) => Object.prototype.hasOwnProperty.call(object || {},key);

  function appStorageScope() {
    const firstPathPart = decodeURIComponent(location.pathname.split('/').filter(Boolean)[0] || 'root');
    return firstPathPart.toLowerCase().replace(/[^a-z0-9_-]+/g,'-') || 'root';
  }

  const STORAGE_SCOPE = appStorageScope();
  const PROGRESS_KEY = `galaxy_sprite_tracker_progress_v2_${STORAGE_SCOPE}`;
  const VIEW_MODES_KEY = `galaxy_sprite_tracker_view_modes_v1_${STORAGE_SCOPE}`;
  const SPRITE_CARD_EDITS_KEY = `galaxy_sprite_tracker_sprite_cards_v1_${STORAGE_SCOPE}`;
  const LEGACY_PROGRESS_KEY = 'galaxy_sprite_tracker_progress_v1';
  const CARD_REORDER_MIME = 'application/x-sprite-card';
  const GITHUB_TOKEN_SESSION_KEY = `galaxy_sprite_tracker_github_token_${STORAGE_SCOPE}`;
  const GITHUB_API_VERSION = '2026-03-10';
  const GITHUB_PUBLISH_TARGET = {
    owner:'SnorkyTheBeard',
    repo:'Sprite-Checklist-Clean',
    branch:'main'
  };

  function clearRetiredEditorStorage(storage) {
    if (!storage) return;
    const prefixes = [
      'galaxy_sprite_tracker_design_',
      'galaxy_sprite_tracker_owner_unlocked_',
      'galaxy_sprite_tracker_cloud_sync_'
    ];
    const keys = [];
    try {
      for (let index = 0; index < storage.length; index += 1) {
        const key = storage.key(index);
        if (key && prefixes.some((prefix) => key.startsWith(prefix))) keys.push(key);
      }
      keys.forEach((key) => storage.removeItem(key));
    } catch {
      /* Storage can be unavailable in strict private-browsing modes. */
    }
  }

  clearRetiredEditorStorage(window.localStorage);
  clearRetiredEditorStorage(window.sessionStorage);

  function readJson(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || 'null');
      return value && typeof value === 'object' && !Array.isArray(value) ? value : null;
    } catch {
      return null;
    }
  }

  function loadProgress() {
    const current = readJson(PROGRESS_KEY);
    if (current) return current;
    if (!STORAGE_SCOPE.startsWith('sprite-checklist')) return {};
    const legacy = readJson(LEGACY_PROGRESS_KEY);
    if (!legacy) return {};
    try { localStorage.setItem(PROGRESS_KEY,JSON.stringify(legacy)); } catch { /* Keep it in memory. */ }
    return legacy;
  }

  function loadSpriteCardEdits() {
    const saved = readJson(SPRITE_CARD_EDITS_KEY);
    return {
      families:saved?.families && typeof saved.families === 'object' ? saved.families : {},
      customFamilies:Array.isArray(saved?.customFamilies) ? saved.customFamilies : [],
      lastPublishedSnapshot:saved?.lastPublishedSnapshot || ''
    };
  }

  function loadViewModes() {
    return readJson(VIEW_MODES_KEY) || {};
  }

  const DEFAULT_HEADER = {
    kicker:'',
    title:'Sprite Checklist',
    subtitle:'',
    collectedLabel:'In Collection',
    masteredLabel:'Mastered',
    masterPrompt:'Tap crown to master',
    footerNote:'Progress is saved on this device.',
    showSummary:true,
    summaryPositions:{
      mode:'normal',
      collected:{ x:25, y:78 },
      mastered:{ x:75, y:78 }
    }
  };

  const DEFAULT_PAGES = Object.fromEntries(rarities.map((rarity) => [rarity,{
    eyebrow:'Sprite Checklist',
    title:`${rarity} Sprites`,
    description:''
  }]));

  const DEFAULT_VARIANT_BACKGROUNDS = {
    base:'assets/variant-backgrounds/variant-well-base.webp',
    gold:'assets/variant-backgrounds/variant-well-gold.webp',
    gummy:'assets/variant-backgrounds/variant-well-gummy.webp',
    galaxy:'assets/variant-backgrounds/variant-well-galaxy.webp',
    cube:'assets/variant-backgrounds/variant-well-cube.webp',
    gem:'assets/variant-backgrounds/variant-well-gem.webp',
    quack:'assets/variant-backgrounds/variant-well-quack.webp',
    holofoil:'assets/variant-backgrounds/variant-well-holofoil.webp'
  };

  const DEFAULT_PAGE_BACKGROUNDS = {
    Rare:{ enabled:true, color:'#071a3c', image:'assets/page-backgrounds/page-bg-rare.webp', mode:'tile' },
    Epic:{ enabled:true, color:'#170b38', image:'assets/page-backgrounds/page-bg-epic.webp', mode:'tile' },
    Legendary:{ enabled:true, color:'#160f08', image:'assets/page-backgrounds/page-bg-legendary.webp', mode:'tile' },
    Mythic:{ enabled:true, color:'#16091d', image:'assets/page-backgrounds/page-bg-mythic.webp', mode:'tile' }
  };

  const DEFAULT_THEME = {
    bodyFont:'playful', headingFont:'playful', buttonFont:'system', summaryFont:'body',
    customFontData:'', customFontName:'',
    baseSize:17, titleSize:56, pageTitleSize:38, groupTitleSize:20, spriteLabelSize:23, checklistButtonSize:13,
    textColor:'#f9f001', mutedColor:'#c8c3e5',
    bodyBgColor:'#050505', bodyBgImage:'', bodyBgMode:'cover', useBuiltInBodyArt:false, showStars:true,
    headerBgColor:'#21184d', headerBgImage:'', headerBgMode:'cover', headerBgPosition:'center', headerTextColor:'#fff', headerOpacity:100, headerHeight:220,
    collectionStyle:'open', collectionBgColor:'#f3dfb4', collectionBgImage:'', collectionBgMode:'cover', useBuiltInCollectionArt:true, collectionTextColor:'#2a2144', collectionBorderColor:'#ffe097', collectionRadius:24,
    cardBgColor:'#fffaf0', cardBgImage:'', cardBgMode:'cover', cardTextColor:'#33234e', cardBorderColor:'#bca8cf', cardRadius:20,
    wellBgColor:'#e7ddfa', wellBgImage:'', wellBgMode:'cover', useBuiltInWellArt:true, wellBorderColor:'#b9a8d5',
    useVariantBackgrounds:true, variantBgMode:'cover', variantBackgrounds:DEFAULT_VARIANT_BACKGROUNDS,
    tabBgColor:'#14133d', tabActiveColor:'#ffcf55',
    summaryStyle:'text', summaryTextEffect:'shadow', summaryEffectColor:'#000', summaryEffectStrength:6, summaryNumberSize:20, summaryLabelSize:12, summaryNumberColor:'#fff', summaryLabelColor:'#c8c3e5', summaryBgColor:'#302b5c', summaryBorderColor:'#564d80', summaryRadius:16, summaryOpacity:100, summaryShowBars:false,
    buttonBgColor:'#fff', buttonTextColor:'#33234e', accentColor:'#59c8ff',
    leftArt:'', rightArt:'', artWidth:120,
    pageBackgrounds:DEFAULT_PAGE_BACKGROUNDS,
    pageHeaderBackgrounds:Object.fromEntries(rarities.map((rarity) => [rarity,{ enabled:false, image:'', mode:'cover', position:'center' }]))
  };

  const FONT_OPTIONS = {
    system:'-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Arial,sans-serif',
    rounded:'"Trebuchet MS","Arial Rounded MT Bold",Arial,sans-serif',
    storybook:'Georgia,"Times New Roman",serif',
    playful:'"Sprite Playful","Trebuchet MS",cursive',
    bold:'Impact,"Arial Black",sans-serif',
    mono:'"Courier New",monospace',
    custom:'"UserCustomFont",sans-serif'
  };

  function cloneJson(value) {
    try { return JSON.parse(JSON.stringify(value)); } catch { return {}; }
  }

  function normalizePoint(value,fallback) {
    return {
      x:Math.max(7,Math.min(93,Number(value?.x) || fallback.x)),
      y:Math.max(10,Math.min(92,Number(value?.y) || fallback.y))
    };
  }

  function normalizeDesign(stored) {
    const source = stored && typeof stored === 'object' ? cloneJson(stored) : {};
    const storedTheme = source.theme || {};
    const summaryPositions = source.header?.summaryPositions || {};
    return {
      _meta:{ ...(source._meta || {}) },
      header:{
        ...DEFAULT_HEADER,
        ...(source.header || {}),
        summaryPositions:{
          mode:summaryPositions.mode === 'free' ? 'free' : 'normal',
          collected:normalizePoint(summaryPositions.collected,DEFAULT_HEADER.summaryPositions.collected),
          mastered:normalizePoint(summaryPositions.mastered,DEFAULT_HEADER.summaryPositions.mastered)
        }
      },
      pages:Object.fromEntries(rarities.map((rarity) => [rarity,{ ...DEFAULT_PAGES[rarity], ...(source.pages?.[rarity] || {}) }])),
      families:source.families && typeof source.families === 'object' ? source.families : {},
      customFamilies:Array.isArray(source.customFamilies) ? source.customFamilies : [],
      theme:{
        ...DEFAULT_THEME,
        ...storedTheme,
        variantBackgrounds:{ ...DEFAULT_VARIANT_BACKGROUNDS, ...(storedTheme.variantBackgrounds || {}) },
        pageBackgrounds:Object.fromEntries(rarities.map((rarity) => [rarity,{ ...DEFAULT_PAGE_BACKGROUNDS[rarity], ...(storedTheme.pageBackgrounds?.[rarity] || {}) }])),
        pageHeaderBackgrounds:Object.fromEntries(rarities.map((rarity) => [rarity,{ ...DEFAULT_THEME.pageHeaderBackgrounds[rarity], ...(storedTheme.pageHeaderBackgrounds?.[rarity] || {}) }]))
      }
    };
  }

  function normalizeVariantBackgroundKey(value) {
    return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  }

  function applyArtConfig(target,config) {
    if (!config || typeof config !== 'object') return target;
    const theme = target.theme;

    const copyImage = (entry,imageKey,fitKey,fitTarget) => {
      if (!entry || typeof entry !== 'object') return;
      if (hasOwn(entry,'image') && entry.image !== null) theme[imageKey] = String(entry.image || '');
      if (entry.fit) theme[fitTarget || fitKey] = entry.fit;
    };

    copyImage(config.siteBackground,'bodyBgImage','bodyBgMode');
    copyImage(config.mainHeader,'headerBgImage','headerBgMode');
    if (config.mainHeader?.position) theme.headerBgPosition = config.mainHeader.position;

    Object.entries(config.text || {}).forEach(([key,value]) => {
      if (hasOwn(DEFAULT_HEADER,key) && value !== null) target.header[key] = value;
    });
    Object.entries(config.pages || {}).forEach(([rarity,values]) => {
      if (!rarities.includes(rarity) || !values || typeof values !== 'object') return;
      ['eyebrow','title','description'].forEach((key) => {
        if (hasOwn(values,key) && values[key] !== null) target.pages[rarity][key] = values[key];
      });
    });

    Object.entries(config.rarityBackgrounds || {}).forEach(([rarity,entry]) => {
      if (!rarities.includes(rarity) || entry === null || entry === undefined) return;
      const page = theme.pageBackgrounds[rarity];
      page.enabled = true;
      if (typeof entry === 'string') page.image = entry;
      else if (typeof entry === 'object') {
        if (hasOwn(entry,'image')) page.image = String(entry.image || '');
        if (entry.fit) page.mode = entry.fit;
        if (entry.color) page.color = entry.color;
        if (hasOwn(entry,'enabled')) page.enabled = Boolean(entry.enabled);
      }
    });

    Object.entries(config.rarityHeaders || {}).forEach(([rarity,entry]) => {
      if (!rarities.includes(rarity) || entry === null || entry === undefined) return;
      const header = theme.pageHeaderBackgrounds[rarity];
      if (typeof entry === 'string') {
        header.image = entry;
        header.enabled = Boolean(entry);
      } else if (typeof entry === 'object') {
        if (hasOwn(entry,'image')) header.image = String(entry.image || '');
        if (entry.fit) header.mode = entry.fit;
        if (entry.position) header.position = entry.position;
        header.enabled = hasOwn(entry,'enabled') ? Boolean(entry.enabled) : Boolean(header.image);
      }
    });

    Object.entries(config.variantBackgrounds || {}).forEach(([rawKey,value]) => {
      if (value === null) return;
      const key = normalizeVariantBackgroundKey(rawKey);
      if (key) theme.variantBackgrounds[key] = String(value || '');
    });

    Object.entries(config.groupBackgrounds || {}).forEach(([familyId,entry]) => {
      if (!entry || typeof entry !== 'object') return;
      const family = target.families[familyId] ||= {};
      if (hasOwn(entry,'visible')) family.visible = Boolean(entry.visible);
      if (hasOwn(entry,'image')) {
        family.customBg = Boolean(entry.image || entry.color);
        family.bgImage = String(entry.image || '');
      }
      if (entry.fit) family.bgMode = entry.fit;
      if (entry.color) {
        family.customBg = true;
        family.bgColor = entry.color;
      }
    });

    Object.entries(config.sprites || {}).forEach(([familyId,variants]) => {
      if (!variants || typeof variants !== 'object') return;
      const family = target.families[familyId] ||= {};
      family.variants ||= {};
      Object.entries(variants).forEach(([variantId,entry]) => {
        if (!entry || typeof entry !== 'object') return;
        const variant = family.variants[variantId] ||= {};
        if (hasOwn(entry,'image') && entry.image !== null) variant.image = String(entry.image || '');
        if (hasOwn(entry,'visible')) variant.visible = Boolean(entry.visible);
        if (hasOwn(entry,'cardBackground')) {
          variant.customCard = Boolean(entry.cardBackground || entry.cardColor);
          variant.cardImage = String(entry.cardBackground || '');
        }
        if (entry.cardFit) variant.cardMode = entry.cardFit;
        if (entry.cardColor) {
          variant.customCard = true;
          variant.cardColor = entry.cardColor;
        }
      });
    });

    if (config.sideArt && typeof config.sideArt === 'object') {
      if (hasOwn(config.sideArt,'left') && config.sideArt.left !== null) theme.leftArt = String(config.sideArt.left || '');
      if (hasOwn(config.sideArt,'right') && config.sideArt.right !== null) theme.rightArt = String(config.sideArt.right || '');
      if (config.sideArt.width !== null && config.sideArt.width !== undefined) theme.artWidth = Number(config.sideArt.width) || theme.artWidth;
    }
    return target;
  }

  const design = applyArtConfig(
    normalizeDesign(window.PUBLISHED_DESIGN && typeof window.PUBLISHED_DESIGN === 'object' ? window.PUBLISHED_DESIGN : {}),
    window.SPRITE_ART_CONFIG
  );
  let state = loadProgress();
  let spriteCardEdits = loadSpriteCardEdits();
  let spriteViewModes = loadViewModes();
  let spriteEditMode = false;
  let activeRarity = rarityFromHash() || defaultRarity;
  let toastTimer = 0;

  const tabsEl = document.getElementById('rarityTabs');
  const collectionsEl = document.getElementById('collections');
  const pageTitleEl = document.getElementById('activePageTitle');
  const pageEyebrowEl = document.getElementById('pageEyebrow');
  const pageDescriptionEl = document.getElementById('pageDescription');
  const pageCountEl = document.getElementById('pageCount');
  const collectedTotalEl = document.getElementById('collectedTotal');
  const masteredTotalEl = document.getElementById('masteredTotal');
  const collectedBarEl = document.getElementById('collectedBar');
  const masteredBarEl = document.getElementById('masteredBar');
  const resetDialog = document.getElementById('resetDialog');
  const statusToast = document.getElementById('statusToast');
  const spriteSearchForm = document.getElementById('spriteSearchForm');
  const spriteSearchInput = document.getElementById('spriteSearchInput');
  const spriteSearchResults = document.getElementById('spriteSearchResults');
  const spriteSearchStatus = document.getElementById('spriteSearchStatus');
  const clearSpriteSearchBtn = document.getElementById('clearSpriteSearchBtn');
  const spriteEditorToggle = document.getElementById('spriteEditorToggle');
  const spriteViewToggle = document.getElementById('spriteViewToggle');
  const addSpriteDialog = document.getElementById('addSpriteDialog');
  const addSpriteForm = document.getElementById('addSpriteForm');
  const addSpriteFamilyId = document.getElementById('addSpriteFamilyId');
  const newSpriteName = document.getElementById('newSpriteName');
  const addSpriteGroupBtn = document.getElementById('addSpriteGroupBtn');
  const addSpriteGroupDialog = document.getElementById('addSpriteGroupDialog');
  const addSpriteGroupForm = document.getElementById('addSpriteGroupForm');
  const newSpriteGroupName = document.getElementById('newSpriteGroupName');
  const addSpriteGroupRarity = document.getElementById('addSpriteGroupRarity');
  const publishSpritesBtn = document.getElementById('publishSpritesBtn');
  const publishSpritesDialog = document.getElementById('publishSpritesDialog');
  const publishSpritesForm = document.getElementById('publishSpritesForm');
  const githubTokenInput = document.getElementById('githubTokenInput');
  const publishSpritesStatus = document.getElementById('publishSpritesStatus');

  function saveProgress() {
    try {
      localStorage.setItem(PROGRESS_KEY,JSON.stringify(state));
      return true;
    } catch {
      showToast('Progress could not be saved in this browser.');
      return false;
    }
  }

  function currentSpriteViewMode() {
    return spriteViewModes[activeRarity] === 'list' ? 'list' : 'card';
  }

  function applySpriteViewMode() {
    const listView = currentSpriteViewMode() === 'list';
    document.body.classList.toggle('sprite-list-view',listView);
    spriteViewToggle.setAttribute('aria-pressed',String(listView));
    spriteViewToggle.textContent = listView ? 'Card view' : 'List view';
    spriteViewToggle.setAttribute('aria-label',`Use ${listView ? 'card' : 'list'} view on the ${activeRarity} page`);
  }

  function setSpriteViewMode(mode) {
    spriteViewModes[activeRarity] = mode === 'list' ? 'list' : 'card';
    try { localStorage.setItem(VIEW_MODES_KEY,JSON.stringify(spriteViewModes)); } catch { /* The choice can remain active for this visit. */ }
    applySpriteViewMode();
    renderCollections();
    updateCounters();
    showToast(`${activeRarity}: ${currentSpriteViewMode() === 'list' ? 'list' : 'card'} view`);
  }

  function saveSpriteCardEdits() {
    try {
      localStorage.setItem(SPRITE_CARD_EDITS_KEY,JSON.stringify(spriteCardEdits));
      updatePublishButton();
      return true;
    } catch {
      showToast('The sprite change could not be saved. Try a smaller image.');
      return false;
    }
  }

  function familyCardEdits(familyId) {
    spriteCardEdits.families ||= {};
    const existing = spriteCardEdits.families[familyId];
    const edits = existing && typeof existing === 'object' && !Array.isArray(existing)
      ? existing
      : (spriteCardEdits.families[familyId] = {});
    if (!Array.isArray(edits.added)) edits.added = [];
    if (!Array.isArray(edits.deleted)) edits.deleted = [];
    if (!Array.isArray(edits.order)) edits.order = [];
    if (!Array.isArray(edits.publishedAdded)) edits.publishedAdded = [];
    if (!edits.images || typeof edits.images !== 'object' || Array.isArray(edits.images)) edits.images = {};
    return edits;
  }

  function rarityFromHash() {
    const value = decodeURIComponent(location.hash.slice(1)).toLowerCase();
    return rarities.find((rarity) => rarity.toLowerCase() === value) || null;
  }

  function allFamilies() {
    const publishedCustom = Array.isArray(design.customFamilies) ? design.customFamilies : [];
    const localCustom = Array.isArray(spriteCardEdits.customFamilies) ? spriteCardEdits.customFamilies : [];
    const unique = new Map();
    [...baseData,...publishedCustom,...localCustom].forEach((family) => {
      if (family?.id && !unique.has(family.id)) unique.set(family.id,family);
    });
    return [...unique.values()];
  }

  function familyRarity(family) {
    return design.families[family.id]?.rarity || family.rarity;
  }

  function familyView(family) {
    const custom = design.families[family.id] || {};
    return {
      name:hasOwn(custom,'name') ? custom.name : family.name,
      visible:hasOwn(custom,'visible') ? Boolean(custom.visible) : true,
      deleted:Boolean(custom.deleted),
      customBg:Boolean(custom.customBg),
      bgColor:custom.bgColor || design.theme.collectionBgColor,
      bgImage:hasOwn(custom,'bgImage') ? custom.bgImage : '',
      bgMode:custom.bgMode || 'cover'
    };
  }

  function variantView(family,variant) {
    const custom = design.families[family.id]?.variants?.[variant.id] || {};
    const cardEdits = spriteCardEdits.families?.[family.id] || {};
    return {
      name:hasOwn(custom,'name') ? custom.name : variant.name,
      image:hasOwn(cardEdits.images,variant.id) ? cardEdits.images[variant.id] : (hasOwn(custom,'image') ? custom.image : variant.image),
      visible:hasOwn(custom,'visible') ? Boolean(custom.visible) : true,
      deleted:Boolean(custom.deleted) || (Array.isArray(cardEdits.deleted) && cardEdits.deleted.includes(variant.id)),
      customCard:Boolean(custom.customCard),
      cardColor:custom.cardColor || design.theme.cardBgColor,
      cardImage:hasOwn(custom,'cardImage') ? custom.cardImage : '',
      cardMode:custom.cardMode || 'cover'
    };
  }

  function familyVariants(family) {
    const base = Array.isArray(family.variants) ? family.variants : [];
    const added = Array.isArray(design.families[family.id]?.addedVariants) ? design.families[family.id].addedVariants : [];
    const locallyAdded = Array.isArray(spriteCardEdits.families?.[family.id]?.added) ? spriteCardEdits.families[family.id].added : [];
    const unique = new Map();
    [...base,...added,...locallyAdded].forEach((variant) => {
      if (variant?.id && !unique.has(variant.id)) unique.set(variant.id,variant);
    });
    return [...unique.values()].filter((variant) => !variantView(family,variant).deleted);
  }

  function orderedVariants(family) {
    const variants = familyVariants(family);
    const byId = new Map(variants.map((variant) => [variant.id,variant]));
    const localOrder = spriteCardEdits.families?.[family.id]?.order;
    const saved = Array.isArray(localOrder) && localOrder.length
      ? localOrder
      : (Array.isArray(design.families[family.id]?.order) ? design.families[family.id].order : []);
    const order = [
      ...saved.filter((id,index) => byId.has(id) && saved.indexOf(id) === index),
      ...variants.map((variant) => variant.id).filter((id) => !saved.includes(id))
    ];
    return order.map((id) => byId.get(id)).filter(Boolean);
  }

  function visibleVariants(family) {
    return orderedVariants(family).filter((variant) => {
      const view = variantView(family,variant);
      return !view.deleted && view.visible;
    });
  }

  function saveCardEditOrRestore(previousEdits) {
    if (saveSpriteCardEdits()) return true;
    spriteCardEdits = previousEdits;
    return false;
  }

  function uniqueVariantId(family,name) {
    const base = String(name || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'new-sprite';
    const reserved = new Set([
      ...(Array.isArray(family.variants) ? family.variants : []),
      ...(Array.isArray(design.families[family.id]?.addedVariants) ? design.families[family.id].addedVariants : []),
      ...(Array.isArray(spriteCardEdits.families?.[family.id]?.added) ? spriteCardEdits.families[family.id].added : [])
    ].map((variant) => variant?.id).filter(Boolean));
    let id = base;
    let suffix = 2;
    while (reserved.has(id)) id = `${base}-${suffix++}`;
    return id;
  }

  function uniqueFamilyId(name) {
    const slug = String(name || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || 'new-group';
    const base = `custom-${slug}`;
    const reserved = new Set(allFamilies().map((family) => family.id));
    let id = base;
    let suffix = 2;
    while (reserved.has(id)) id = `${base}-${suffix++}`;
    return id;
  }

  function openAddSpriteGroupDialog() {
    newSpriteGroupName.value = '';
    addSpriteGroupRarity.textContent = activeRarity;
    addSpriteGroupDialog.showModal();
    setTimeout(() => newSpriteGroupName.focus(),0);
  }

  function addSpriteGroup(name) {
    const previousEdits = cloneJson(spriteCardEdits);
    const id = uniqueFamilyId(name);
    spriteCardEdits.customFamilies ||= [];
    spriteCardEdits.customFamilies.push({
      id,
      name,
      rarity:activeRarity,
      variants:[{ id:'base', name:'Base', image:'' }]
    });
    familyCardEdits(id).order = ['base'];
    if (!saveCardEditOrRestore(previousEdits)) return null;
    return id;
  }

  function openAddSpriteDialog(familyId) {
    const family = allFamilies().find((item) => item.id === familyId);
    if (!family) return;
    addSpriteFamilyId.value = familyId;
    newSpriteName.value = '';
    document.getElementById('addSpriteDialogTitle').textContent = `Add sprite to ${familyView(family).name || 'this row'}`;
    addSpriteDialog.showModal();
    setTimeout(() => newSpriteName.focus(),0);
  }

  function addSpriteCard(family,name) {
    const previousEdits = cloneJson(spriteCardEdits);
    const edits = familyCardEdits(family.id);
    const id = uniqueVariantId(family,name);
    const currentOrder = orderedVariants(family).map((variant) => variant.id);
    edits.added.push({ id, name, image:'' });
    edits.order = [...currentOrder,id];
    if (!saveCardEditOrRestore(previousEdits)) return null;
    return id;
  }

  function deleteSpriteCard(family,variant) {
    const view = variantView(family,variant);
    if (!window.confirm(`Delete the ${view.name || 'selected'} sprite card from ${familyView(family).name || 'this row'}?`)) return;
    const previousEdits = cloneJson(spriteCardEdits);
    const edits = familyCardEdits(family.id);
    const addedIndex = edits.added.findIndex((item) => item.id === variant.id);
    const isPublishedVariant = (Array.isArray(family.variants) && family.variants.some((item) => item.id === variant.id))
      || (Array.isArray(design.families[family.id]?.addedVariants) && design.families[family.id].addedVariants.some((item) => item.id === variant.id))
      || edits.publishedAdded.includes(variant.id);
    if (addedIndex >= 0) edits.added.splice(addedIndex,1);
    if (isPublishedVariant && !edits.deleted.includes(variant.id)) edits.deleted.push(variant.id);
    edits.order = orderedVariants(family).map((item) => item.id).filter((id) => id !== variant.id);
    delete edits.images[variant.id];
    if (!saveCardEditOrRestore(previousEdits)) return;
    if (state[family.id]) delete state[family.id][variant.id];
    saveProgress();
    renderTabs();
    renderCollections();
    updateCounters();
    showToast('Sprite card deleted');
  }

  function saveVariantOrder(family,order,message = 'Sprite cards moved') {
    const previousEdits = cloneJson(spriteCardEdits);
    familyCardEdits(family.id).order = order;
    if (!saveCardEditOrRestore(previousEdits)) return false;
    renderCollections();
    updateCounters();
    showToast(message);
    return true;
  }

  function moveSpriteCard(family,variantId,offset) {
    const visible = visibleVariants(family);
    const from = visible.findIndex((variant) => variant.id === variantId);
    const target = from + offset;
    if (from < 0 || target < 0 || target >= visible.length) return;
    const order = orderedVariants(family).map((variant) => variant.id);
    const fromIndex = order.indexOf(variantId);
    const targetIndex = order.indexOf(visible[target].id);
    [order[fromIndex],order[targetIndex]] = [order[targetIndex],order[fromIndex]];
    saveVariantOrder(family,order);
  }

  function reorderSpriteCard(family,sourceId,targetId,placeAfter) {
    const order = orderedVariants(family).map((variant) => variant.id);
    const from = order.indexOf(sourceId);
    if (from < 0 || sourceId === targetId || !order.includes(targetId)) return;
    order.splice(from,1);
    const target = order.indexOf(targetId);
    order.splice(target + (placeAfter ? 1 : 0),0,sourceId);
    saveVariantOrder(family,order);
  }

  function variantState(familyId,variantId) {
    state[familyId] ||= {};
    state[familyId][variantId] ||= { collected:false, mastered:false };
    return state[familyId][variantId];
  }

  function imageMode(mode) {
    if (mode === 'contain') return { size:'contain', repeat:'no-repeat' };
    if (mode === 'tile') return { size:'600px 600px', repeat:'repeat' };
    if (mode === 'repeat') return { size:'auto', repeat:'repeat' };
    if (mode === 'stretch') return { size:'100% 100%', repeat:'no-repeat' };
    return { size:'cover', repeat:'no-repeat' };
  }

  function imagePosition(position) {
    if (position === 'upper') return 'center 20%';
    if (position === 'top') return 'center top';
    if (position === 'bottom') return 'center bottom';
    return 'center';
  }

  function displayImageSource(source) {
    const value = String(source || '');
    const version = Number(design._meta?.publishedAt || 0);
    if (!value || !version || !/^(?:\.\/)?published-assets\//.test(value)) return value;
    return `${value}${value.includes('?') ? '&' : '?'}v=${version}`;
  }

  function readFileAsDataUrl(file) {
    return new Promise((resolve,reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  function isImageFile(file) {
    return Boolean(file && (file.type?.startsWith('image/') || /\.(png|jpe?g|webp|gif|avif|bmp)$/i.test(file.name || '')));
  }

  function droppedImageFile(dataTransfer) {
    if (!dataTransfer) return null;
    return [...dataTransfer.files].find(isImageFile)
      || [...dataTransfer.items].map((item) => item.kind === 'file' ? item.getAsFile() : null).find(isImageFile)
      || null;
  }

  function hasDroppedImage(dataTransfer) {
    if (!dataTransfer) return false;
    return [...dataTransfer.files].some(isImageFile)
      || [...dataTransfer.items].some((item) => item.kind === 'file' && (!item.type || item.type.startsWith('image/')))
      || [...dataTransfer.types].includes('Files');
  }

  async function resizeSpriteImage(file) {
    const url = URL.createObjectURL(file);
    try {
      const image = new Image();
      await new Promise((resolve,reject) => {
        image.onload = resolve;
        image.onerror = reject;
        image.src = url;
      });
      if (!image.naturalWidth || !image.naturalHeight) throw new Error('invalid-image');
      const maxWidth = 768;
      const maxHeight = 768;
      const targetBytes = 180000;
      const sourceType = String(file.type || '').toLowerCase();
      if (['image/png','image/jpeg','image/webp','image/avif'].includes(sourceType)
        && image.naturalWidth <= maxWidth
        && image.naturalHeight <= maxHeight
        && file.size <= targetBytes) return readFileAsDataUrl(file);

      let scale = Math.min(1,maxWidth / image.naturalWidth,maxHeight / image.naturalHeight);
      let quality = .9;
      let bestResult = '';
      let bestBytes = Infinity;
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) throw new Error('canvas-unavailable');
      for (let attempt = 0; attempt < 18; attempt += 1) {
        canvas.width = Math.max(1,Math.round(image.naturalWidth * scale));
        canvas.height = Math.max(1,Math.round(image.naturalHeight * scale));
        context.imageSmoothingEnabled = true;
        context.imageSmoothingQuality = 'high';
        context.clearRect(0,0,canvas.width,canvas.height);
        context.drawImage(image,0,0,canvas.width,canvas.height);
        const result = canvas.toDataURL('image/webp',quality);
        const encodedLength = Math.max(0,result.length - result.indexOf(',') - 1);
        const estimatedBytes = Math.ceil(encodedLength * .75);
        if (estimatedBytes < bestBytes) {
          bestResult = result;
          bestBytes = estimatedBytes;
        }
        if (estimatedBytes <= targetBytes) return result;
        if (quality > .72) quality = Math.max(.72,quality - .05);
        else {
          const shrink = Math.max(.7,Math.min(.9,Math.sqrt(targetBytes / estimatedBytes) * .96));
          scale *= shrink;
          quality = .9;
        }
      }
      if (!bestResult) throw new Error('image-conversion-failed');
      return bestResult;
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  async function replaceSpriteImage(family,variant,file) {
    if (!isImageFile(file)) throw new Error('not-an-image');
    showToast('Preparing sprite image…');
    const image = await resizeSpriteImage(file);
    const previousEdits = cloneJson(spriteCardEdits);
    familyCardEdits(family.id).images[variant.id] = image;
    if (!saveCardEditOrRestore(previousEdits)) return false;
    renderCollections();
    updateCounters();
    showToast('Sprite image saved');
    return true;
  }

  function spriteCardEditsFingerprint() {
    return JSON.stringify({
      families:spriteCardEdits.families || {},
      customFamilies:Array.isArray(spriteCardEdits.customFamilies) ? spriteCardEdits.customFamilies : []
    });
  }

  function hasUnpublishedSpriteChanges() {
    const families = spriteCardEdits.families || {};
    const hasFamilyChanges = Object.values(families).some((edits) => edits && typeof edits === 'object' && (
      (Array.isArray(edits.added) && edits.added.length)
      || (Array.isArray(edits.deleted) && edits.deleted.length)
      || (Array.isArray(edits.order) && edits.order.length)
      || (edits.images && typeof edits.images === 'object' && Object.keys(edits.images).length)
    ));
    const hasNewGroups = Array.isArray(spriteCardEdits.customFamilies) && spriteCardEdits.customFamilies.length > 0;
    const hasChanges = hasFamilyChanges || hasNewGroups;
    return Boolean(hasChanges && spriteCardEdits.lastPublishedSnapshot !== spriteCardEditsFingerprint());
  }

  function updatePublishButton() {
    if (!publishSpritesBtn) return;
    const pending = hasUnpublishedSpriteChanges();
    publishSpritesBtn.disabled = !pending;
    publishSpritesBtn.textContent = pending ? 'Publish sprite changes' : 'No changes to publish';
  }

  function setPublishStatus(message,state = '') {
    publishSpritesStatus.textContent = message;
    publishSpritesStatus.dataset.state = state;
  }

  function setPublishBusy(busy) {
    const submit = document.getElementById('confirmPublishSpritesBtn');
    const cancel = document.getElementById('cancelPublishSpritesBtn');
    githubTokenInput.disabled = busy;
    submit.disabled = busy;
    cancel.disabled = busy;
    submit.textContent = busy ? 'Publishing…' : 'Publish changes';
  }

  async function githubRequest(token,path,options = {}) {
    const response = await fetch(`https://api.github.com${path}`,{
      method:options.method || 'GET',
      headers:{
        Accept:'application/vnd.github+json',
        Authorization:`Bearer ${token}`,
        'X-GitHub-Api-Version':GITHUB_API_VERSION,
        ...(options.body ? { 'Content-Type':'application/json' } : {})
      },
      body:options.body ? JSON.stringify(options.body) : undefined,
      cache:'no-store'
    });
    const text = await response.text();
    let result = null;
    try { result = text ? JSON.parse(text) : null; } catch { result = null; }
    if (!response.ok) {
      const error = new Error(result?.message || `GitHub returned ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return result;
  }

  function decodeBase64Utf8(value) {
    const binary = atob(String(value || '').replace(/\s/g,''));
    const bytes = Uint8Array.from(binary,(character) => character.charCodeAt(0));
    return new TextDecoder().decode(bytes);
  }

  function parsePublishedDesignFile(source) {
    const text = String(source || '').replace(/^\uFEFF/,'');
    const equals = text.indexOf('=');
    const semicolon = text.lastIndexOf(';');
    if (!/window\.PUBLISHED_DESIGN\s*=/.test(text) || equals < 0 || semicolon <= equals) throw new Error('The published design file could not be read.');
    const parsed = JSON.parse(text.slice(equals + 1,semicolon).trim());
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) throw new Error('The published design file is invalid.');
    return parsed;
  }

  function cleanAssetPart(value,fallback) {
    return String(value || '').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'') || fallback;
  }

  function publishedImageAsset(familyId,variantId,dataUrl) {
    const match = String(dataUrl || '').match(/^data:(image\/(?:png|jpe?g|webp|avif|gif));base64,([a-z0-9+/=\s]+)$/i);
    if (!match) throw new Error('One sprite image could not be prepared for publishing.');
    const mime = match[1].toLowerCase();
    const extension = mime === 'image/jpeg' || mime === 'image/jpg' ? 'jpg' : mime.split('/')[1];
    return {
      path:`published-assets/sprite-${cleanAssetPart(familyId,'group')}-${cleanAssetPart(variantId,'sprite')}.${extension}`,
      content:match[2].replace(/\s/g,'')
    };
  }

  function buildPublishedSpriteDesign(basePublishedDesign) {
    const nextDesign = cloneJson(basePublishedDesign);
    nextDesign.families ||= {};
    nextDesign.customFamilies = Array.isArray(nextDesign.customFamilies) ? nextDesign.customFamilies : [];
    const assets = [];

    (Array.isArray(spriteCardEdits.customFamilies) ? spriteCardEdits.customFamilies : []).forEach((localFamily) => {
      if (!localFamily?.id) return;
      const publishedFamily = nextDesign.customFamilies.find((family) => family.id === localFamily.id);
      const familyRecord = {
        id:localFamily.id,
        name:localFamily.name || 'New sprite group',
        rarity:rarities.includes(localFamily.rarity) ? localFamily.rarity : defaultRarity,
        variants:Array.isArray(localFamily.variants) && localFamily.variants.length
          ? cloneJson(localFamily.variants)
          : [{ id:'base', name:'Base', image:'' }]
      };
      if (publishedFamily) Object.assign(publishedFamily,familyRecord);
      else nextDesign.customFamilies.push(familyRecord);
      const familyDesign = nextDesign.families[localFamily.id] ||= {};
      familyDesign.name = familyRecord.name;
      familyDesign.rarity = familyRecord.rarity;
      familyDesign.visible = true;
      familyDesign.deleted = false;
      familyDesign.variants ||= {};
      familyRecord.variants.forEach((variant) => {
        if (!variant?.id) return;
        familyDesign.variants[variant.id] ||= {};
        familyDesign.variants[variant.id].deleted = false;
      });
    });

    Object.entries(spriteCardEdits.families || {}).forEach(([familyId,rawEdits]) => {
      if (!rawEdits || typeof rawEdits !== 'object' || Array.isArray(rawEdits)) return;
      const edits = rawEdits;
      const family = nextDesign.families[familyId] ||= {};
      family.variants ||= {};
      family.addedVariants = Array.isArray(family.addedVariants) ? family.addedVariants : [];

      (Array.isArray(edits.added) ? edits.added : []).forEach((variant) => {
        if (!variant?.id) return;
        const existing = family.addedVariants.find((item) => item.id === variant.id);
        if (existing) {
          existing.name = variant.name || existing.name;
        } else {
          family.addedVariants.push({ id:variant.id, name:variant.name || 'New sprite', image:'' });
        }
        family.variants[variant.id] ||= {};
        family.variants[variant.id].deleted = false;
      });

      (Array.isArray(edits.deleted) ? edits.deleted : []).forEach((variantId) => {
        const addedIndex = family.addedVariants.findIndex((item) => item.id === variantId);
        if (addedIndex >= 0) {
          family.addedVariants.splice(addedIndex,1);
          delete family.variants[variantId];
        } else {
          family.variants[variantId] ||= {};
          family.variants[variantId].deleted = true;
        }
      });

      if (Array.isArray(edits.order) && edits.order.length) {
        const deleted = new Set(Array.isArray(edits.deleted) ? edits.deleted : []);
        family.order = edits.order.filter((id,index,array) => id && !deleted.has(id) && array.indexOf(id) === index);
      }

      Object.entries(edits.images && typeof edits.images === 'object' ? edits.images : {}).forEach(([variantId,dataUrl]) => {
        if (Array.isArray(edits.deleted) && edits.deleted.includes(variantId)) return;
        const asset = publishedImageAsset(familyId,variantId,dataUrl);
        assets.push(asset);
        family.variants[variantId] ||= {};
        family.variants[variantId].image = asset.path;
        family.variants[variantId].deleted = false;
      });
    });
    nextDesign._meta = { ...(nextDesign._meta || {}), publishedAt:Date.now() };
    return { nextDesign, assets };
  }

  function githubPublishError(error) {
    if (error?.status === 401) return 'GitHub did not accept that token. Check it and try again.';
    if (error?.status === 403) return 'That token cannot write to this repository. Give it Contents: Read and write permission.';
    if (error?.status === 404) return 'The repository or branch was not available to that token. Make sure Sprite-Checklist-Clean is selected.';
    if (error?.status === 409 || error?.status === 422) return 'The repository changed while publishing. Wait a moment, then try again.';
    return error?.message || 'The sprite changes could not be published.';
  }

  async function publishSpriteChanges(token) {
    if (!hasUnpublishedSpriteChanges()) throw new Error('There are no new sprite changes to publish.');
    const { owner,repo,branch } = GITHUB_PUBLISH_TARGET;
    const repository = `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
    const reference = await githubRequest(token,`${repository}/git/ref/heads/${encodeURIComponent(branch)}`);
    const headSha = reference?.object?.sha;
    if (!headSha) throw new Error('GitHub did not return the current branch.');
    const headCommit = await githubRequest(token,`${repository}/git/commits/${headSha}`);
    const baseTreeSha = headCommit?.tree?.sha;
    if (!baseTreeSha) throw new Error('GitHub did not return the current file tree.');
    const publishedFile = await githubRequest(token,`${repository}/contents/published-design.js?ref=${encodeURIComponent(branch)}`);
    const basePublishedDesign = parsePublishedDesignFile(decodeBase64Utf8(publishedFile?.content));
    const { nextDesign,assets } = buildPublishedSpriteDesign(basePublishedDesign);
    const treeEntries = [];

    for (const asset of assets) {
      const blob = await githubRequest(token,`${repository}/git/blobs`,{
        method:'POST',
        body:{ content:asset.content, encoding:'base64' }
      });
      treeEntries.push({ path:asset.path, mode:'100644', type:'blob', sha:blob.sha });
    }

    const publishedSource = `// Generated by Sprite Checklist. Artwork is stored in published-assets.\nwindow.PUBLISHED_DESIGN = ${JSON.stringify(nextDesign)};\n`;
    const designBlob = await githubRequest(token,`${repository}/git/blobs`,{
      method:'POST',
      body:{ content:publishedSource, encoding:'utf-8' }
    });
    treeEntries.push({ path:'published-design.js', mode:'100644', type:'blob', sha:designBlob.sha });
    const tree = await githubRequest(token,`${repository}/git/trees`,{
      method:'POST',
      body:{ base_tree:baseTreeSha, tree:treeEntries }
    });
    const commit = await githubRequest(token,`${repository}/git/commits`,{
      method:'POST',
      body:{ message:'Publish sprite card changes', tree:tree.sha, parents:[headSha] }
    });
    await githubRequest(token,`${repository}/git/refs/heads/${encodeURIComponent(branch)}`,{
      method:'PATCH',
      body:{ sha:commit.sha, force:false }
    });

    design.families = cloneJson(nextDesign.families || {});
    design.customFamilies = cloneJson(nextDesign.customFamilies || []);
    design._meta = { ...(design._meta || {}), ...(nextDesign._meta || {}) };
    Object.entries(nextDesign.families || {}).forEach(([familyId,family]) => {
      if (!spriteCardEdits.families?.[familyId]) return;
      familyCardEdits(familyId).publishedAdded = (Array.isArray(family.addedVariants) ? family.addedVariants : []).map((variant) => variant.id);
    });
    spriteCardEdits.lastPublishedSnapshot = spriteCardEditsFingerprint();
    saveSpriteCardEdits();
    renderAll();
    return commit.sha;
  }

  function openPublishSpritesDialog() {
    if (!hasUnpublishedSpriteChanges()) return showToast('There are no new sprite changes to publish.');
    try { githubTokenInput.value = sessionStorage.getItem(GITHUB_TOKEN_SESSION_KEY) || ''; } catch { githubTokenInput.value = ''; }
    setPublishBusy(false);
    setPublishStatus(`Ready to publish to ${GITHUB_PUBLISH_TARGET.owner}/${GITHUB_PUBLISH_TARGET.repo}.`);
    publishSpritesDialog.showModal();
    setTimeout(() => githubTokenInput.focus(),0);
  }

  function safeCssUrl(source) {
    return displayImageSource(source).replace(/["\n\r]/g,'');
  }

  function applyCustomBackground(element,color,image,mode) {
    const source = safeCssUrl(image);
    const sizing = imageMode(mode);
    element.style.backgroundColor = color || 'transparent';
    element.style.backgroundImage = source ? `url("${source}")` : 'none';
    element.style.backgroundPosition = 'center';
    element.style.backgroundSize = sizing.size;
    element.style.backgroundRepeat = sizing.repeat;
  }

  function applyImageSurface(root,prefix,image,mode,builtInFallback = '') {
    const source = safeCssUrl(image);
    const sizing = imageMode(mode);
    root.style.setProperty(`--theme-${prefix}-image`,source ? `url("${source}")` : (builtInFallback || 'none'));
    root.style.setProperty(`--theme-${prefix}-size`,sizing.size);
    root.style.setProperty(`--theme-${prefix}-repeat`,sizing.repeat);
  }

  function colorWithOpacity(color,percentage) {
    const match = String(color || '').match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i);
    if (!match) return color || 'transparent';
    const channels = match.slice(1).map((part) => parseInt(part,16));
    const alpha = Math.max(0,Math.min(100,Number(percentage ?? 100))) / 100;
    return `rgba(${channels.join(',')},${alpha})`;
  }

  function summaryTextShadow(theme) {
    const strength = Math.max(0,Math.min(20,Number(theme.summaryEffectStrength) || 0));
    if (!strength || theme.summaryTextEffect === 'none') return 'none';
    const color = theme.summaryEffectColor || '#000';
    if (theme.summaryTextEffect === 'glow') return `0 0 ${Math.max(2,Math.round(strength / 2))}px ${color},0 0 ${strength}px ${color}`;
    return `0 ${Math.max(1,Math.round(strength / 3))}px ${strength}px ${color}`;
  }

  function setCss(root,name,value,unit = '') {
    if (value !== undefined && value !== null && value !== '') root.style.setProperty(name,`${value}${unit}`);
  }

  function summaryFont(theme) {
    if (theme.summaryFont === 'heading') return 'var(--font-heading)';
    if (theme.summaryFont === 'button') return 'var(--font-button)';
    if (theme.summaryFont === 'body') return 'var(--font-body)';
    return FONT_OPTIONS[theme.summaryFont] || 'var(--font-body)';
  }

  function applyTheme() {
    const theme = design.theme;
    const root = document.documentElement;
    let customFontStyle = document.getElementById('userCustomFontStyle');
    if (!customFontStyle) {
      customFontStyle = document.createElement('style');
      customFontStyle.id = 'userCustomFontStyle';
      document.head.appendChild(customFontStyle);
    }
    customFontStyle.textContent = theme.customFontData
      ? `@font-face{font-family:"UserCustomFont";src:url("${safeCssUrl(theme.customFontData)}");font-display:swap;}`
      : '';

    setCss(root,'--font-body',FONT_OPTIONS[theme.bodyFont] || FONT_OPTIONS.playful);
    setCss(root,'--font-heading',FONT_OPTIONS[theme.headingFont] || FONT_OPTIONS.playful);
    setCss(root,'--font-button',FONT_OPTIONS[theme.buttonFont] || FONT_OPTIONS.system);
    setCss(root,'--font-summary',summaryFont(theme));
    setCss(root,'--theme-base-size',theme.baseSize,'px');
    setCss(root,'--theme-title-size',theme.titleSize,'px');
    setCss(root,'--theme-page-title-size',theme.pageTitleSize,'px');
    setCss(root,'--theme-group-title-size',theme.groupTitleSize,'px');
    setCss(root,'--theme-sprite-label-size',theme.spriteLabelSize,'px');
    setCss(root,'--theme-checklist-button-size',theme.checklistButtonSize,'px');
    setCss(root,'--theme-text',theme.textColor);
    setCss(root,'--theme-muted',theme.mutedColor);
    setCss(root,'--theme-body-bg',theme.bodyBgColor);
    setCss(root,'--theme-header-text',theme.headerTextColor);
    setCss(root,'--theme-header-height',theme.headerHeight,'px');
    setCss(root,'--theme-header-surface',colorWithOpacity(theme.headerBgColor,theme.headerOpacity));
    setCss(root,'--theme-collection-bg',theme.collectionBgColor);
    setCss(root,'--theme-collection-text',theme.collectionTextColor);
    setCss(root,'--theme-collection-border',theme.collectionBorderColor);
    setCss(root,'--theme-collection-radius',theme.collectionRadius,'px');
    setCss(root,'--theme-card-bg',theme.cardBgColor);
    setCss(root,'--theme-card-text',theme.cardTextColor);
    setCss(root,'--theme-card-border',theme.cardBorderColor);
    setCss(root,'--theme-card-radius',theme.cardRadius,'px');
    setCss(root,'--theme-well-bg',theme.wellBgColor);
    setCss(root,'--theme-well-border',theme.wellBorderColor);
    setCss(root,'--theme-tab-bg',theme.tabBgColor);
    setCss(root,'--theme-tab-active',theme.tabActiveColor);
    setCss(root,'--theme-summary-surface',colorWithOpacity(theme.summaryBgColor,theme.summaryOpacity));
    setCss(root,'--theme-summary-border',theme.summaryBorderColor);
    setCss(root,'--theme-summary-number',theme.summaryNumberColor);
    setCss(root,'--theme-summary-label',theme.summaryLabelColor);
    setCss(root,'--theme-summary-radius',theme.summaryRadius,'px');
    setCss(root,'--theme-summary-number-size',theme.summaryNumberSize,'px');
    setCss(root,'--theme-summary-label-size',theme.summaryLabelSize,'px');
    setCss(root,'--theme-summary-text-shadow',summaryTextShadow(theme));
    setCss(root,'--theme-button-bg',theme.buttonBgColor);
    setCss(root,'--theme-button-text',theme.buttonTextColor);
    setCss(root,'--theme-accent',theme.accentColor);
    setCss(root,'--theme-art-width',theme.artWidth,'px');

    applyImageSurface(root,'body',theme.bodyBgImage,theme.bodyBgMode);
    const pageHeader = theme.pageHeaderBackgrounds?.[activeRarity] || {};
    const usePageHeader = Boolean(pageHeader.enabled && pageHeader.image);
    applyImageSurface(root,'header',usePageHeader ? pageHeader.image : theme.headerBgImage,usePageHeader ? pageHeader.mode : theme.headerBgMode);
    root.style.setProperty('--theme-header-position',imagePosition(usePageHeader ? pageHeader.position : theme.headerBgPosition));
    applyImageSurface(root,'collection',theme.collectionBgImage,theme.collectionBgMode,theme.useBuiltInCollectionArt ? 'linear-gradient(180deg,rgba(255,255,255,.24),rgba(255,255,255,0))' : 'none');
    applyImageSurface(root,'card',theme.cardBgImage,theme.cardBgMode);
    applyImageSurface(root,'well',theme.wellBgImage,theme.wellBgMode,theme.useBuiltInWellArt ? 'radial-gradient(circle at 40% 25%,#fff 0,#e7ddfa 42%,#b8a1e8 100%)' : 'none');
    const page = theme.pageBackgrounds?.[activeRarity] || {};
    root.style.setProperty('--theme-page-bg',page.enabled ? page.color || 'transparent' : 'transparent');
    applyImageSurface(root,'page',page.enabled ? page.image : '',page.mode || 'cover');

    document.body.classList.toggle('hide-stars',!theme.showStars);
    document.body.classList.toggle('collection-open',theme.collectionStyle !== 'boxed');
    const hero = document.getElementById('hero');
    hero.classList.toggle('summary-text-only',theme.summaryStyle !== 'boxed');
    hero.classList.toggle('summary-bars-hidden',!theme.summaryShowBars);
    const leftArt = document.getElementById('leftCustomArt');
    const rightArt = document.getElementById('rightCustomArt');
    leftArt.src = displayImageSource(theme.leftArt);
    rightArt.src = displayImageSource(theme.rightArt);
    leftArt.hidden = !theme.leftArt;
    rightArt.hidden = !theme.rightArt;
  }

  function renderOptionalText(element,value) {
    const text = String(value ?? '');
    element.textContent = text;
    element.hidden = !text;
  }

  function applySummaryPositions() {
    const hero = document.getElementById('hero');
    const positions = design.header.summaryPositions;
    const free = positions.mode === 'free' && design.header.showSummary;
    hero.classList.toggle('summary-free-positioning',free);
    ['collected','mastered'].forEach((key) => {
      const box = document.querySelector(`[data-summary-box="${key}"]`);
      if (!box) return;
      if (free) {
        box.style.setProperty('--summary-x',`${positions[key].x}%`);
        box.style.setProperty('--summary-y',`${positions[key].y}%`);
      } else {
        box.style.removeProperty('--summary-x');
        box.style.removeProperty('--summary-y');
      }
    });
  }

  function renderHeader() {
    renderOptionalText(document.getElementById('headerKicker'),design.header.kicker);
    renderOptionalText(document.getElementById('headerTitle'),design.header.title);
    renderOptionalText(document.getElementById('headerSubtitle'),design.header.subtitle);
    document.getElementById('collectedLabel').textContent = design.header.collectedLabel || 'In Collection';
    document.getElementById('masteredLabel').textContent = design.header.masteredLabel || 'Mastered';
    document.getElementById('summary').hidden = !design.header.showSummary;
    renderOptionalText(document.getElementById('footerNote'),design.header.footerNote);
    applySummaryPositions();
  }

  function variantBackgroundSource(variant) {
    if (!design.theme.useVariantBackgrounds) return '';
    const backgrounds = design.theme.variantBackgrounds || {};
    const idKey = normalizeVariantBackgroundKey(variant.id);
    if (idKey && hasOwn(backgrounds,idKey)) return backgrounds[idKey] || '';
    const nameKey = normalizeVariantBackgroundKey(variant.name);
    return nameKey && hasOwn(backgrounds,nameKey) ? backgrounds[nameKey] || '' : '';
  }

  function applyVariantBackground(element,variant) {
    const source = variantBackgroundSource(variant);
    if (!source) return;
    applyCustomBackground(element,design.theme.wellBgColor,source,design.theme.variantBgMode || 'cover');
    element.classList.add('has-variant-background');
  }

  function crownSvg() {
    return '<svg viewBox="0 0 64 52" aria-hidden="true"><path d="M8 42 4 14l17 13L32 5l11 22 17-13-4 28H8Z"/><path d="M10 46h44"/></svg>';
  }

  function updateCard(card,current,family,variant) {
    const view = variantView(family,variant);
    const variantName = view.name || 'Unnamed';
    const groupName = familyView(family).name || 'sprite';
    card.classList.toggle('collected',Boolean(current.collected));
    card.classList.toggle('mastered',Boolean(current.mastered));
    const collectedAction = `${current.collected ? 'Remove' : 'Mark'} ${variantName} ${groupName} ${current.collected ? 'from collection' : 'as collected'}`;
    const masteredAction = `${current.mastered ? 'Remove mastery from' : 'Mark'} ${variantName} ${groupName}${current.mastered ? '' : ' as mastered'}`;
    const imageButton = card.querySelector('.image-button');
    const collectButton = card.querySelector('.collect-button');
    const crownButton = card.querySelector('.crown-button');
    imageButton.setAttribute('aria-label',spriteEditMode ? `Upload image for ${variantName} ${groupName}` : collectedAction);
    if (spriteEditMode) imageButton.removeAttribute('aria-pressed');
    else imageButton.setAttribute('aria-pressed',String(Boolean(current.collected)));
    collectButton.setAttribute('aria-label',collectedAction);
    collectButton.setAttribute('aria-pressed',String(Boolean(current.collected)));
    crownButton.setAttribute('aria-label',masteredAction);
    crownButton.setAttribute('aria-pressed',String(Boolean(current.mastered)));
    collectButton.querySelector('.collect-label').textContent = design.header.collectedLabel || 'In Collection';
    const masterText = current.mastered ? (design.header.masteredLabel || 'Mastered') : design.header.masterPrompt;
    const masterLabel = card.querySelector('.master-label');
    masterLabel.textContent = masterText || '';
    masterLabel.hidden = !masterText;
  }

  function commitCardChange(card,family,variant,current,message) {
    updateCard(card,current,family,variant);
    saveProgress();
    updateCounters();
    showToast(`${variantView(family,variant).name || family.name}: ${message}`);
  }

  function cardDropAfter(card,event) {
    const rect = card.getBoundingClientRect();
    return currentSpriteViewMode() === 'list'
      ? event.clientY > rect.top + rect.height / 2
      : event.clientX > rect.left + rect.width / 2;
  }

  function makeCard(family,variant,{ eager = false } = {}) {
    const current = variantState(family.id,variant.id);
    const view = variantView(family,variant);
    const familyInfo = familyView(family);
    const rowVariants = visibleVariants(family);
    const rowIndex = rowVariants.findIndex((item) => item.id === variant.id);
    const listView = currentSpriteViewMode() === 'list';
    const card = document.createElement('article');
    card.className = 'card';
    card.dataset.familyId = family.id;
    card.dataset.variantId = variant.id;
    if (view.customCard) applyCustomBackground(card,view.cardColor,view.cardImage,view.cardMode);

    const crown = document.createElement('button');
    crown.type = 'button';
    crown.className = 'crown-button';
    crown.innerHTML = crownSvg();

    const imageWrap = document.createElement('div');
    imageWrap.className = 'image-wrap';
    applyVariantBackground(imageWrap,variant);
    const imageButton = document.createElement('button');
    imageButton.type = 'button';
    imageButton.className = 'image-button';
    const imageSource = displayImageSource(view.image);
    if (imageSource) {
      const image = document.createElement('img');
      image.src = imageSource;
      image.alt = `${view.name || familyInfo.name || 'Sprite'} artwork`;
      image.width = 512;
      image.height = 512;
      image.loading = eager ? 'eager' : 'lazy';
      image.decoding = 'async';
      if (eager) image.fetchPriority = 'high';
      image.addEventListener('error', () => {
        image.remove();
        const fallback = document.createElement('span');
        fallback.className = 'image-fallback';
        fallback.textContent = 'Image unavailable';
        imageButton.prepend(fallback);
      },{ once:true });
      imageButton.appendChild(image);
    } else {
      const fallback = document.createElement('span');
      fallback.className = 'image-fallback';
      fallback.textContent = 'Artwork coming soon';
      imageButton.appendChild(fallback);
    }
    const badge = document.createElement('span');
    badge.className = 'check-badge';
    badge.setAttribute('aria-hidden','true');
    badge.textContent = '✓';
    imageButton.appendChild(badge);
    const uploadHint = document.createElement('span');
    uploadHint.className = 'sprite-image-edit-hint';
    uploadHint.textContent = 'Drop image or tap to upload';
    uploadHint.setAttribute('aria-hidden','true');
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.accept = 'image/*';
    fileInput.hidden = true;
    imageWrap.append(imageButton,uploadHint,fileInput);

    const editorTools = document.createElement('div');
    editorTools.className = 'sprite-card-tools';
    editorTools.setAttribute('aria-label',`Move or delete ${view.name || 'sprite'} card`);
    const moveLeft = document.createElement('button');
    moveLeft.type = 'button';
    moveLeft.className = 'sprite-move-step';
    moveLeft.textContent = listView ? '↑' : '←';
    moveLeft.disabled = rowIndex <= 0;
    moveLeft.setAttribute('aria-label',`Move ${view.name || 'sprite'} ${listView ? 'up' : 'left'}`);
    const moveHandle = document.createElement('button');
    moveHandle.type = 'button';
    moveHandle.className = 'sprite-move-handle';
    moveHandle.textContent = 'Drag';
    moveHandle.draggable = true;
    moveHandle.setAttribute('aria-label',`Drag ${view.name || 'sprite'} to move it`);
    const moveRight = document.createElement('button');
    moveRight.type = 'button';
    moveRight.className = 'sprite-move-step';
    moveRight.textContent = listView ? '↓' : '→';
    moveRight.disabled = rowIndex < 0 || rowIndex === rowVariants.length - 1;
    moveRight.setAttribute('aria-label',`Move ${view.name || 'sprite'} ${listView ? 'down' : 'right'}`);
    const deleteButton = document.createElement('button');
    deleteButton.type = 'button';
    deleteButton.className = 'sprite-delete-button';
    deleteButton.textContent = '×';
    deleteButton.title = 'Delete sprite card';
    deleteButton.setAttribute('aria-label',`Delete ${view.name || 'sprite'} card`);
    editorTools.append(moveLeft,moveHandle,moveRight,deleteButton);

    const title = document.createElement('h4');
    title.textContent = view.name || '';
    title.hidden = !view.name;

    const listLabel = document.createElement('div');
    listLabel.className = 'sprite-list-label';
    const listGroupName = document.createElement('strong');
    listGroupName.textContent = familyInfo.name || family.name || 'Sprite';
    const listVariantName = document.createElement('span');
    listVariantName.textContent = view.name || 'Unnamed';
    listLabel.append(listGroupName,listVariantName);

    const collect = document.createElement('button');
    collect.type = 'button';
    collect.className = 'collect-button';
    const box = document.createElement('span');
    box.className = 'box';
    box.setAttribute('aria-hidden','true');
    const collectLabel = document.createElement('span');
    collectLabel.className = 'collect-label';
    collect.append(box,collectLabel);

    const masterLabel = document.createElement('div');
    masterLabel.className = 'master-label';
    card.append(crown,imageWrap,editorTools,title,listLabel,collect,masterLabel);

    const toggleCollected = () => {
      current.collected = !current.collected;
      if (!current.collected) current.mastered = false;
      commitCardChange(card,family,variant,current,current.collected ? 'Added to collection' : 'Removed from collection');
    };
    imageButton.addEventListener('click',() => {
      if (spriteEditMode) return fileInput.click();
      toggleCollected();
    });
    collect.addEventListener('click',toggleCollected);
    crown.addEventListener('click',() => {
      current.mastered = !current.mastered;
      if (current.mastered) current.collected = true;
      commitCardChange(card,family,variant,current,current.mastered ? 'Mastered' : 'Mastery removed');
    });
    moveLeft.addEventListener('click',() => moveSpriteCard(family,variant.id,-1));
    moveRight.addEventListener('click',() => moveSpriteCard(family,variant.id,1));
    deleteButton.addEventListener('click',() => deleteSpriteCard(family,variant));

    const acceptImage = async (file) => {
      imageWrap.classList.add('drop-saving');
      uploadHint.textContent = 'Saving image…';
      try {
        await replaceSpriteImage(family,variant,file);
      } catch {
        showToast('Choose a PNG, JPG, WebP, GIF, or AVIF image.');
      } finally {
        imageWrap.classList.remove('drop-saving','drop-ready');
        uploadHint.textContent = 'Drop image or tap to upload';
        fileInput.value = '';
      }
    };
    fileInput.addEventListener('change',() => {
      if (fileInput.files?.[0]) acceptImage(fileInput.files[0]);
    });
    imageWrap.addEventListener('dragenter',(event) => {
      if (!spriteEditMode || !hasDroppedImage(event.dataTransfer)) return;
      event.preventDefault();
      imageWrap.classList.add('drop-ready');
    });
    imageWrap.addEventListener('dragover',(event) => {
      if (!spriteEditMode || !hasDroppedImage(event.dataTransfer)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
      imageWrap.classList.add('drop-ready');
    });
    imageWrap.addEventListener('dragleave',(event) => {
      if (!imageWrap.contains(event.relatedTarget)) imageWrap.classList.remove('drop-ready');
    });
    imageWrap.addEventListener('drop',(event) => {
      if (!spriteEditMode || !hasDroppedImage(event.dataTransfer)) return;
      event.preventDefault();
      event.stopPropagation();
      const file = droppedImageFile(event.dataTransfer);
      if (file) acceptImage(file);
      else showToast('Drop an image file onto the sprite card.');
    });

    moveHandle.addEventListener('dragstart',(event) => {
      if (!spriteEditMode) return event.preventDefault();
      const payload = JSON.stringify({ familyId:family.id, variantId:variant.id });
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData(CARD_REORDER_MIME,payload);
      event.dataTransfer.setData('text/plain',payload);
      card.classList.add('is-reordering');
    });
    moveHandle.addEventListener('dragend',() => {
      document.querySelectorAll('.card').forEach((item) => item.classList.remove('is-reordering','reorder-before','reorder-after'));
    });
    card.addEventListener('dragover',(event) => {
      if (!spriteEditMode || ![...event.dataTransfer.types].includes(CARD_REORDER_MIME)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
      const placeAfter = cardDropAfter(card,event);
      card.classList.toggle('reorder-before',!placeAfter);
      card.classList.toggle('reorder-after',placeAfter);
    });
    card.addEventListener('dragleave',(event) => {
      if (!card.contains(event.relatedTarget)) card.classList.remove('reorder-before','reorder-after');
    });
    card.addEventListener('drop',(event) => {
      if (!spriteEditMode || ![...event.dataTransfer.types].includes(CARD_REORDER_MIME)) return;
      event.preventDefault();
      card.classList.remove('reorder-before','reorder-after');
      try {
        const payload = event.dataTransfer.getData(CARD_REORDER_MIME) || event.dataTransfer.getData('text/plain');
        const source = JSON.parse(payload);
        if (source.familyId !== family.id) return showToast('Sprite cards stay in their current row.');
        const placeAfter = cardDropAfter(card,event);
        reorderSpriteCard(family,source.variantId,variant.id,placeAfter);
      } catch {
        showToast('That sprite card could not be moved.');
      }
    });
    updateCard(card,current,family,variant);
    return card;
  }

  function familyStats(family) {
    const group = familyView(family);
    if (group.deleted || !group.visible) return { total:0, collected:0, mastered:0 };
    return familyVariants(family).reduce((totals,variant) => {
      const view = variantView(family,variant);
      if (view.deleted || !view.visible) return totals;
      const current = variantState(family.id,variant.id);
      totals.total += 1;
      totals.collected += current.collected ? 1 : 0;
      totals.mastered += current.mastered ? 1 : 0;
      return totals;
    },{ total:0, collected:0, mastered:0 });
  }

  function rarityStats(rarity) {
    return allFamilies().filter((family) => familyRarity(family) === rarity).reduce((totals,family) => {
      const stats = familyStats(family);
      totals.total += stats.total;
      totals.collected += stats.collected;
      totals.mastered += stats.mastered;
      return totals;
    },{ total:0, collected:0, mastered:0 });
  }

  function overallStats() {
    return rarities.reduce((totals,rarity) => {
      const stats = rarityStats(rarity);
      totals.total += stats.total;
      totals.collected += stats.collected;
      totals.mastered += stats.mastered;
      return totals;
    },{ total:0, collected:0, mastered:0 });
  }

  function handleTabKeys(event) {
    if (!['ArrowLeft','ArrowRight','Home','End'].includes(event.key)) return;
    event.preventDefault();
    const currentIndex = rarities.indexOf(activeRarity);
    let nextIndex = currentIndex;
    if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + rarities.length) % rarities.length;
    if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % rarities.length;
    if (event.key === 'Home') nextIndex = 0;
    if (event.key === 'End') nextIndex = rarities.length - 1;
    switchRarity(rarities[nextIndex],{ historyMode:'push', focusTab:true, announce:true });
  }

  function renderTabs() {
    tabsEl.replaceChildren();
    rarities.forEach((rarity) => {
      const stats = rarityStats(rarity);
      const button = document.createElement('button');
      const count = document.createElement('small');
      button.type = 'button';
      button.className = 'tab';
      button.id = `tab-${rarity.toLowerCase()}`;
      button.setAttribute('role','tab');
      button.setAttribute('aria-controls','checklistPage');
      button.setAttribute('aria-selected',String(rarity === activeRarity));
      button.tabIndex = rarity === activeRarity ? 0 : -1;
      button.append(document.createTextNode(rarity),count);
      count.textContent = `${stats.collected}/${stats.total}`;
      button.addEventListener('click',() => switchRarity(rarity,{ historyMode:'push', announce:true }));
      button.addEventListener('keydown',handleTabKeys);
      tabsEl.appendChild(button);
    });
  }

  function renderCollections() {
    collectionsEl.replaceChildren();
    const page = design.pages[activeRarity] || DEFAULT_PAGES[activeRarity];
    renderOptionalText(pageEyebrowEl,page.eyebrow);
    renderOptionalText(pageTitleEl,page.title);
    renderOptionalText(pageDescriptionEl,page.description);
    document.getElementById('checklistPage').setAttribute('aria-labelledby','activePageTitle');
    let eagerImagesRemaining = 2;

    allFamilies().filter((family) => familyRarity(family) === activeRarity).forEach((family) => {
      const group = familyView(family);
      if (group.deleted || !group.visible) return;
      const rowVariants = visibleVariants(family);
      if (!rowVariants.length && !spriteEditMode) return;
      const stats = familyStats(family);
      const section = document.createElement('section');
      section.className = 'collection';
      section.dataset.rarity = familyRarity(family);
      section.dataset.familyId = family.id;
      if (group.customBg) {
        section.classList.add('has-custom-background');
        applyCustomBackground(section,group.bgColor,group.bgImage,group.bgMode);
      }

      const header = document.createElement('div');
      header.className = 'collection-head';
      const title = document.createElement('h3');
      title.textContent = group.name || '';
      title.hidden = !group.name;
      const meta = document.createElement('div');
      const progressCounts = document.createElement('div');
      const masteredCount = document.createElement('span');
      const count = document.createElement('span');
      const hint = document.createElement('span');
      const headerActions = document.createElement('div');
      const addButton = document.createElement('button');
      meta.className = 'collection-meta';
      progressCounts.className = 'collection-progress-counts';
      progressCounts.setAttribute('aria-label',`${group.name || 'Sprite'} progress`);
      masteredCount.className = 'collection-count collection-mastered-count';
      masteredCount.textContent = `${stats.mastered} / ${stats.total} mastered`;
      count.className = 'collection-count';
      count.textContent = `${stats.collected} / ${stats.total} collected`;
      hint.className = 'row-hint';
      hint.setAttribute('aria-hidden','true');
      hint.textContent = 'Swipe variants →';
      progressCounts.append(masteredCount,count);
      meta.append(progressCounts,hint);
      headerActions.className = 'collection-head-actions';
      addButton.type = 'button';
      addButton.className = 'add-sprite-button';
      addButton.textContent = '+ Add sprite';
      addButton.addEventListener('click',() => openAddSpriteDialog(family.id));
      headerActions.append(meta,addButton);
      header.append(title,headerActions);

      const row = document.createElement('div');
      row.className = 'variant-row';
      row.setAttribute('aria-label',`${group.name || 'Sprite'} variants`);
      rowVariants.forEach((variant) => {
        const image = variantView(family,variant).image;
        const eager = Boolean(image && eagerImagesRemaining > 0);
        if (eager) eagerImagesRemaining -= 1;
        row.appendChild(makeCard(family,variant,{ eager }));
      });
      if (!rowVariants.length) {
        const empty = document.createElement('p');
        empty.className = 'empty-sprite-row';
        empty.textContent = 'No sprite cards in this row.';
        row.appendChild(empty);
      }
      section.append(header,row);
      collectionsEl.appendChild(section);
    });
  }

  function updateCounters() {
    const overall = overallStats();
    const page = rarityStats(activeRarity);
    collectedTotalEl.textContent = `${overall.collected} / ${overall.total}`;
    masteredTotalEl.textContent = `${overall.mastered} / ${overall.total}`;
    pageCountEl.textContent = `${page.collected} / ${page.total}`;
    collectedBarEl.style.width = `${overall.total ? overall.collected / overall.total * 100 : 0}%`;
    masteredBarEl.style.width = `${overall.total ? overall.mastered / overall.total * 100 : 0}%`;

    collectionsEl.querySelectorAll('.collection').forEach((section) => {
      const family = allFamilies().find((item) => item.id === section.dataset.familyId);
      if (!family) return;
      const stats = familyStats(family);
      section.querySelector('.collection-count:not(.collection-mastered-count)').textContent = `${stats.collected} / ${stats.total} collected`;
      section.querySelector('.collection-mastered-count').textContent = `${stats.mastered} / ${stats.total} mastered`;
    });
    tabsEl.querySelectorAll('.tab').forEach((tab) => {
      const rarity = rarities.find((name) => tab.id === `tab-${name.toLowerCase()}`);
      if (!rarity) return;
      const stats = rarityStats(rarity);
      tab.querySelector('small').textContent = `${stats.collected}/${stats.total}`;
    });
  }

  function renderAll() {
    applyTheme();
    renderHeader();
    renderTabs();
    applySpriteViewMode();
    renderCollections();
    updateCounters();
    updatePublishButton();
  }

  function switchRarity(rarity,options = {}) {
    if (!rarities.includes(rarity)) return;
    const changed = activeRarity !== rarity;
    activeRarity = rarity;
    applyTheme();
    renderTabs();
    applySpriteViewMode();
    renderCollections();
    updateCounters();
    const hash = `#${rarity.toLowerCase()}`;
    if (options.historyMode === 'push' && location.hash !== hash) history.pushState({ rarity },'',hash);
    else if (location.hash !== hash) history.replaceState({ rarity },'',hash);
    const activeTab = document.getElementById(`tab-${rarity.toLowerCase()}`);
    activeTab?.scrollIntoView({ block:'nearest', inline:'center' });
    if (options.focusTab) activeTab?.focus();
    if (options.announce && changed) showToast(`${rarity} page`);
  }

  function normalizeSearchText(value) {
    return String(value || '').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  }

  function searchableSprites() {
    return allFamilies().flatMap((family) => {
      const group = familyView(family);
      if (group.deleted || !group.visible) return [];
      const rarity = familyRarity(family);
      return orderedVariants(family).flatMap((variant) => {
        const view = variantView(family,variant);
        if (view.deleted || !view.visible) return [];
        const groupName = group.name || 'Unnamed sprite';
        const variantName = view.name || 'Unnamed variant';
        return [{
          familyId:family.id,
          variantId:variant.id,
          rarity,
          groupName,
          variantName,
          searchText:normalizeSearchText(`${groupName} ${variantName} ${rarity}`)
        }];
      });
    });
  }

  function findSpriteMatches(query) {
    const normalized = normalizeSearchText(query);
    if (!normalized) return [];
    const tokens = normalized.split(' ');
    return searchableSprites().filter((entry) => tokens.every((token) => entry.searchText.includes(token))).map((entry) => {
      const group = normalizeSearchText(entry.groupName);
      const variant = normalizeSearchText(entry.variantName);
      const combined = `${group} ${variant}`;
      const score = variant === normalized ? 0 : (group === normalized ? 1 : (combined.startsWith(normalized) ? 2 : 3));
      return { ...entry, score };
    }).sort((a,b) => a.score - b.score || a.groupName.localeCompare(b.groupName) || a.variantName.localeCompare(b.variantName)).slice(0,12);
  }

  function spriteSearchState(entry) {
    const current = state[entry.familyId]?.[entry.variantId] || {};
    if (current.mastered) return design.header.masteredLabel || 'Mastered';
    if (current.collected) return design.header.collectedLabel || 'In Collection';
    return 'Not collected';
  }

  function closeSpriteSearchResults() {
    spriteSearchResults.hidden = true;
    spriteSearchInput.setAttribute('aria-expanded','false');
  }

  function openSpriteSearchResult(entry) {
    closeSpriteSearchResults();
    spriteSearchInput.blur();
    switchRarity(entry.rarity,{ historyMode:'push' });
    requestAnimationFrame(() => {
      const card = [...document.querySelectorAll('.card')].find((item) => item.dataset.familyId === entry.familyId && item.dataset.variantId === entry.variantId);
      if (!card) return showToast('That sprite is currently hidden.');
      const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
      card.scrollIntoView({ behavior:reducedMotion ? 'auto' : 'smooth', block:'center', inline:'center' });
      card.classList.add('search-target');
      setTimeout(() => card.classList.remove('search-target'),2600);
      card.querySelector('.collect-button')?.focus({ preventScroll:true });
      const message = `${entry.groupName} — ${entry.variantName} on the ${entry.rarity} page`;
      spriteSearchStatus.textContent = message;
      showToast(message);
    });
  }

  function renderSpriteSearchResults() {
    const query = spriteSearchInput.value.trim();
    clearSpriteSearchBtn.hidden = !query;
    spriteSearchResults.replaceChildren();
    if (!query) return closeSpriteSearchResults();
    const matches = findSpriteMatches(query);
    if (!matches.length) {
      const empty = document.createElement('p');
      empty.className = 'sprite-search-empty';
      empty.textContent = 'No matching sprites';
      spriteSearchResults.appendChild(empty);
    } else {
      matches.forEach((entry) => {
        const button = document.createElement('button');
        const text = document.createElement('span');
        const title = document.createElement('strong');
        const detail = document.createElement('small');
        const status = document.createElement('span');
        button.type = 'button';
        button.className = 'sprite-search-result';
        button.setAttribute('role','option');
        title.textContent = `${entry.groupName} — ${entry.variantName}`;
        detail.textContent = `${entry.rarity} sprite`;
        status.className = 'sprite-search-result-status';
        status.textContent = spriteSearchState(entry);
        text.append(title,detail);
        button.append(text,status);
        button.addEventListener('click',() => openSpriteSearchResult(entry));
        spriteSearchResults.appendChild(button);
      });
    }
    spriteSearchResults.hidden = false;
    spriteSearchInput.setAttribute('aria-expanded','true');
    spriteSearchStatus.textContent = `${matches.length} matching sprite${matches.length === 1 ? '' : 's'}`;
    return matches;
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    statusToast.textContent = message;
    statusToast.classList.add('show');
    toastTimer = setTimeout(() => statusToast.classList.remove('show'),2400);
  }

  function resetProgress() {
    state = {};
    saveProgress();
    resetDialog.close();
    renderAll();
    showToast('Checklist progress reset');
  }

  function setSpriteEditMode(enabled) {
    spriteEditMode = Boolean(enabled);
    document.body.classList.toggle('sprite-edit-mode',spriteEditMode);
    spriteEditorToggle.setAttribute('aria-pressed',String(spriteEditMode));
    spriteEditorToggle.textContent = spriteEditMode ? 'Done editing' : 'Edit sprites';
    renderCollections();
    updateCounters();
    showToast(spriteEditMode ? 'Sprite editing on' : 'Sprite editing off');
  }

  spriteSearchInput.addEventListener('input',renderSpriteSearchResults);
  spriteSearchInput.addEventListener('focus',() => {
    if (spriteSearchInput.value.trim()) renderSpriteSearchResults();
  });
  spriteSearchInput.addEventListener('keydown',(event) => {
    if (event.key === 'Escape') {
      closeSpriteSearchResults();
      spriteSearchInput.blur();
    }
    if (event.key === 'ArrowDown' && !spriteSearchResults.hidden) {
      const first = spriteSearchResults.querySelector('.sprite-search-result');
      if (first) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  spriteSearchResults.addEventListener('keydown',(event) => {
    if (!['ArrowDown','ArrowUp','Escape'].includes(event.key)) return;
    event.preventDefault();
    if (event.key === 'Escape') {
      closeSpriteSearchResults();
      return spriteSearchInput.focus();
    }
    const options = [...spriteSearchResults.querySelectorAll('.sprite-search-result')];
    const current = options.indexOf(document.activeElement);
    const offset = event.key === 'ArrowDown' ? 1 : -1;
    options[(current + offset + options.length) % options.length]?.focus();
  });
  spriteSearchForm.addEventListener('submit',(event) => {
    event.preventDefault();
    const matches = findSpriteMatches(spriteSearchInput.value);
    if (matches[0]) openSpriteSearchResult(matches[0]);
    else {
      renderSpriteSearchResults();
      spriteSearchStatus.textContent = 'No matching sprites';
    }
  });
  clearSpriteSearchBtn.addEventListener('click',() => {
    spriteSearchInput.value = '';
    closeSpriteSearchResults();
    clearSpriteSearchBtn.hidden = true;
    spriteSearchStatus.textContent = 'Search cleared';
    spriteSearchInput.focus();
  });
  document.addEventListener('pointerdown',(event) => {
    if (!event.target.closest('.sprite-search')) closeSpriteSearchResults();
  });
  spriteEditorToggle.addEventListener('click',() => setSpriteEditMode(!spriteEditMode));
  spriteViewToggle.addEventListener('click',() => setSpriteViewMode(currentSpriteViewMode() === 'list' ? 'card' : 'list'));
  addSpriteGroupBtn.addEventListener('click',openAddSpriteGroupDialog);
  publishSpritesBtn.addEventListener('click',openPublishSpritesDialog);
  publishSpritesForm.addEventListener('submit',async (event) => {
    event.preventDefault();
    const token = githubTokenInput.value.trim();
    if (!token) return setPublishStatus('Paste a GitHub token first.','error');
    try { sessionStorage.setItem(GITHUB_TOKEN_SESSION_KEY,token); } catch { /* The token can remain in the input for this tab. */ }
    setPublishBusy(true);
    setPublishStatus('Publishing sprite changes to GitHub…');
    let published = false;
    try {
      const commitSha = await publishSpriteChanges(token);
      const link = document.createElement('a');
      link.href = `https://github.com/${GITHUB_PUBLISH_TARGET.owner}/${GITHUB_PUBLISH_TARGET.repo}/commit/${commitSha}`;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'View the GitHub commit';
      publishSpritesStatus.replaceChildren(document.createTextNode('Published. The public site should update shortly. '),link);
      publishSpritesStatus.dataset.state = 'success';
      showToast('Sprite changes published');
      published = true;
    } catch (error) {
      setPublishStatus(githubPublishError(error),'error');
    } finally {
      setPublishBusy(false);
      if (published) {
        const submit = document.getElementById('confirmPublishSpritesBtn');
        submit.disabled = true;
        submit.textContent = 'Published';
      }
    }
  });
  document.getElementById('cancelPublishSpritesBtn').addEventListener('click',() => publishSpritesDialog.close());
  addSpriteForm.addEventListener('submit',(event) => {
    event.preventDefault();
    const family = allFamilies().find((item) => item.id === addSpriteFamilyId.value);
    const name = newSpriteName.value.trim();
    if (!family || !name) return;
    const id = addSpriteCard(family,name);
    if (!id) return;
    addSpriteDialog.close();
    renderTabs();
    renderCollections();
    updateCounters();
    showToast(`${name} sprite card added — tap its image area to upload artwork`);
  });
  document.getElementById('cancelAddSpriteBtn').addEventListener('click',() => addSpriteDialog.close());
  addSpriteGroupForm.addEventListener('submit',(event) => {
    event.preventDefault();
    const name = newSpriteGroupName.value.trim();
    if (!name) return;
    const id = addSpriteGroup(name);
    if (!id) return;
    addSpriteGroupDialog.close();
    renderTabs();
    renderCollections();
    updateCounters();
    document.querySelector(`.collection[data-family-id="${id}"]`)?.scrollIntoView({ behavior:'smooth', block:'center' });
    showToast(`${name} added to ${activeRarity} — upload the Base sprite image`);
  });
  document.getElementById('cancelAddSpriteGroupBtn').addEventListener('click',() => addSpriteGroupDialog.close());
  window.addEventListener('hashchange',() => switchRarity(rarityFromHash() || defaultRarity));
  document.getElementById('resetBtn').addEventListener('click',() => resetDialog.showModal());
  document.getElementById('confirmResetBtn').addEventListener('click',resetProgress);

  renderAll();
  const activeHash = `#${activeRarity.toLowerCase()}`;
  if (location.hash !== activeHash) history.replaceState({ rarity:activeRarity },'',activeHash);
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js?v=65',{ updateViaCache:'none' }).then((registration) => registration.update()).catch(() => {});
  }
})();
