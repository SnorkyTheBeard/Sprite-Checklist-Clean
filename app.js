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
  const LEGACY_PROGRESS_KEY = 'galaxy_sprite_tracker_progress_v1';

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

  function saveProgress() {
    try {
      localStorage.setItem(PROGRESS_KEY,JSON.stringify(state));
      return true;
    } catch {
      showToast('Progress could not be saved in this browser.');
      return false;
    }
  }

  function rarityFromHash() {
    const value = decodeURIComponent(location.hash.slice(1)).toLowerCase();
    return rarities.find((rarity) => rarity.toLowerCase() === value) || null;
  }

  function allFamilies() {
    const custom = Array.isArray(design.customFamilies) ? design.customFamilies : [];
    return [...baseData,...custom];
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
    return {
      name:hasOwn(custom,'name') ? custom.name : variant.name,
      image:hasOwn(custom,'image') ? custom.image : variant.image,
      visible:hasOwn(custom,'visible') ? Boolean(custom.visible) : true,
      deleted:Boolean(custom.deleted),
      customCard:Boolean(custom.customCard),
      cardColor:custom.cardColor || design.theme.cardBgColor,
      cardImage:hasOwn(custom,'cardImage') ? custom.cardImage : '',
      cardMode:custom.cardMode || 'cover'
    };
  }

  function familyVariants(family) {
    const base = Array.isArray(family.variants) ? family.variants : [];
    const added = Array.isArray(design.families[family.id]?.addedVariants) ? design.families[family.id].addedVariants : [];
    const unique = new Map();
    [...base,...added].forEach((variant) => {
      if (variant?.id && !unique.has(variant.id)) unique.set(variant.id,variant);
    });
    return [...unique.values()].filter((variant) => !variantView(family,variant).deleted);
  }

  function orderedVariants(family) {
    const variants = familyVariants(family);
    const byId = new Map(variants.map((variant) => [variant.id,variant]));
    const saved = Array.isArray(design.families[family.id]?.order) ? design.families[family.id].order : [];
    const order = [
      ...saved.filter((id,index) => byId.has(id) && saved.indexOf(id) === index),
      ...variants.map((variant) => variant.id).filter((id) => !saved.includes(id))
    ];
    return order.map((id) => byId.get(id)).filter(Boolean);
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
    imageButton.setAttribute('aria-label',collectedAction);
    imageButton.setAttribute('aria-pressed',String(Boolean(current.collected)));
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

  function makeCard(family,variant,{ eager = false } = {}) {
    const current = variantState(family.id,variant.id);
    const view = variantView(family,variant);
    const familyInfo = familyView(family);
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
    imageWrap.appendChild(imageButton);

    const title = document.createElement('h4');
    title.textContent = view.name || '';
    title.hidden = !view.name;

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
    card.append(crown,imageWrap,title,collect,masterLabel);

    const toggleCollected = () => {
      current.collected = !current.collected;
      if (!current.collected) current.mastered = false;
      commitCardChange(card,family,variant,current,current.collected ? 'Added to collection' : 'Removed from collection');
    };
    imageButton.addEventListener('click',toggleCollected);
    collect.addEventListener('click',toggleCollected);
    crown.addEventListener('click',() => {
      current.mastered = !current.mastered;
      if (current.mastered) current.collected = true;
      commitCardChange(card,family,variant,current,current.mastered ? 'Mastered' : 'Mastery removed');
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
      const visibleVariants = orderedVariants(family).filter((variant) => {
        const view = variantView(family,variant);
        return !view.deleted && view.visible;
      });
      if (!visibleVariants.length) return;
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
      const count = document.createElement('span');
      const hint = document.createElement('span');
      meta.className = 'collection-meta';
      count.className = 'collection-count';
      count.textContent = `${stats.collected} / ${stats.total} collected`;
      hint.className = 'row-hint';
      hint.setAttribute('aria-hidden','true');
      hint.textContent = 'Swipe variants →';
      meta.append(count,hint);
      header.append(title,meta);

      const row = document.createElement('div');
      row.className = 'variant-row';
      row.setAttribute('aria-label',`${group.name || 'Sprite'} variants`);
      visibleVariants.forEach((variant) => {
        const image = variantView(family,variant).image;
        const eager = Boolean(image && eagerImagesRemaining > 0);
        if (eager) eagerImagesRemaining -= 1;
        row.appendChild(makeCard(family,variant,{ eager }));
      });
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
      section.querySelector('.collection-count').textContent = `${stats.collected} / ${stats.total} collected`;
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
    renderCollections();
    updateCounters();
  }

  function switchRarity(rarity,options = {}) {
    if (!rarities.includes(rarity)) return;
    const changed = activeRarity !== rarity;
    activeRarity = rarity;
    applyTheme();
    renderTabs();
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
  window.addEventListener('hashchange',() => switchRarity(rarityFromHash() || defaultRarity));
  document.getElementById('resetBtn').addEventListener('click',() => resetDialog.showModal());
  document.getElementById('confirmResetBtn').addEventListener('click',resetProgress);

  renderAll();
  const activeHash = `#${activeRarity.toLowerCase()}`;
  if (location.hash !== activeHash) history.replaceState({ rarity:activeRarity },'',activeHash);
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./service-worker.js?v=44',{ updateViaCache:'none' }).then((registration) => registration.update()).catch(() => {});
  }
})();
