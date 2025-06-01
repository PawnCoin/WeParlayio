// Multilingual support for major sports betting countries
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean;
}

export const supportedLanguages: Language[] = [
  // Major English-speaking markets
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'en-GB', name: 'English (UK)', nativeName: 'English (UK)', flag: '🇬🇧' },
  { code: 'en-AU', name: 'English (Australia)', nativeName: 'English (Australia)', flag: '🇦🇺' },
  { code: 'en-CA', name: 'English (Canada)', nativeName: 'English (Canada)', flag: '🇨🇦' },
  
  // European markets
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'pt-BR', name: 'Portuguese (Brazil)', nativeName: 'Português (Brasil)', flag: '🇧🇷' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', flag: '🇭🇺' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', flag: '🇷🇴' },
  { code: 'bg', name: 'Bulgarian', nativeName: 'Български', flag: '🇧🇬' },
  { code: 'hr', name: 'Croatian', nativeName: 'Hrvatski', flag: '🇭🇷' },
  { code: 'sr', name: 'Serbian', nativeName: 'Српски', flag: '🇷🇸' },
  { code: 'sl', name: 'Slovenian', nativeName: 'Slovenščina', flag: '🇸🇮' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', flag: '🇸🇰' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu', flag: '🇱🇻' },
  { code: 'lt', name: 'Lithuanian', nativeName: 'Lietuvių', flag: '🇱🇹' },
  { code: 'et', name: 'Estonian', nativeName: 'Eesti', flag: '🇪🇪' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦' },
  
  // Asian markets
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾' },
  { code: 'tl', name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  
  // Middle East & Africa
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', rtl: true },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', flag: '🇮🇷', rtl: true },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', rtl: true },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', flag: '🇿🇦' },
  
  // Latin America
  { code: 'es-MX', name: 'Spanish (Mexico)', nativeName: 'Español (México)', flag: '🇲🇽' },
  { code: 'es-AR', name: 'Spanish (Argentina)', nativeName: 'Español (Argentina)', flag: '🇦🇷' },
  { code: 'es-CL', name: 'Spanish (Chile)', nativeName: 'Español (Chile)', flag: '🇨🇱' },
  { code: 'es-CO', name: 'Spanish (Colombia)', nativeName: 'Español (Colombia)', flag: '🇨🇴' },
  { code: 'es-PE', name: 'Spanish (Peru)', nativeName: 'Español (Perú)', flag: '🇵🇪' },
];

export const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.betting': 'Betting',
    'nav.live': 'Live',
    'nav.esports': 'Esports',
    'nav.fantasy': 'Fantasy',
    'nav.account': 'Account',
    'nav.support': 'Support',
    
    // Betting
    'betting.dashboard': 'Betting Dashboard',
    'betting.live_events': 'Live Events',
    'betting.upcoming': 'Upcoming Events',
    'betting.place_bet': 'Place Bet',
    'betting.bet_slip': 'Bet Slip',
    'betting.odds': 'Odds',
    'betting.stake': 'Stake',
    'betting.potential_win': 'Potential Win',
    'betting.moneyline': 'Moneyline',
    'betting.spread': 'Spread',
    'betting.total': 'Total (Over/Under)',
    'betting.player_props': 'Player Props',
    'betting.team_props': 'Team Props',
    'betting.parlays': 'Parlays',
    
    // Streaming
    'stream.live_now': 'LIVE NOW',
    'stream.starting_soon': 'Starting Soon',
    'stream.preview': '30-Second Preview',
    'stream.upgrade_required': 'Upgrade Required',
    'stream.watch_live': 'Watch Live',
    'stream.viewers': 'viewers',
    'stream.quality': 'Quality',
    'stream.full_screen': 'Full Screen',
    
    // Tiers
    'tier.bronze': 'Bronze',
    'tier.silver': 'Silver',
    'tier.gold': 'Gold',
    'tier.platinum': 'Platinum',
    'tier.diamond': 'Diamond',
    'tier.upgrade': 'Upgrade',
    'tier.current': 'Current Tier',
    'tier.benefits': 'Benefits',
    
    // Sports
    'sport.football': 'Football',
    'sport.basketball': 'Basketball',
    'sport.baseball': 'Baseball',
    'sport.hockey': 'Hockey',
    'sport.soccer': 'Soccer',
    'sport.tennis': 'Tennis',
    'sport.golf': 'Golf',
    'sport.mma': 'MMA',
    'sport.boxing': 'Boxing',
    'sport.esports': 'Esports',
    
    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.save': 'Save',
    'common.edit': 'Edit',
    'common.delete': 'Delete',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.refresh': 'Refresh',
    
    // Time
    'time.live': 'Live',
    'time.quarter': 'Quarter',
    'time.half': 'Half',
    'time.period': 'Period',
    'time.overtime': 'Overtime',
    'time.final': 'Final',
  },
  
  es: {
    // Navigation
    'nav.home': 'Inicio',
    'nav.betting': 'Apuestas',
    'nav.live': 'En Vivo',
    'nav.esports': 'Esports',
    'nav.fantasy': 'Fantasy',
    'nav.account': 'Cuenta',
    'nav.support': 'Soporte',
    
    // Betting
    'betting.dashboard': 'Panel de Apuestas',
    'betting.live_events': 'Eventos en Vivo',
    'betting.upcoming': 'Próximos Eventos',
    'betting.place_bet': 'Hacer Apuesta',
    'betting.bet_slip': 'Boleto de Apuesta',
    'betting.odds': 'Cuotas',
    'betting.stake': 'Apuesta',
    'betting.potential_win': 'Ganancia Potencial',
    'betting.moneyline': 'Línea de Dinero',
    'betting.spread': 'Hándicap',
    'betting.total': 'Total (Más/Menos)',
    'betting.player_props': 'Props de Jugador',
    'betting.team_props': 'Props de Equipo',
    'betting.parlays': 'Combinadas',
    
    // Streaming
    'stream.live_now': 'EN VIVO',
    'stream.starting_soon': 'Comenzando Pronto',
    'stream.preview': 'Vista Previa 30s',
    'stream.upgrade_required': 'Actualización Requerida',
    'stream.watch_live': 'Ver en Vivo',
    'stream.viewers': 'espectadores',
    'stream.quality': 'Calidad',
    'stream.full_screen': 'Pantalla Completa',
    
    // Tiers
    'tier.bronze': 'Bronce',
    'tier.silver': 'Plata',
    'tier.gold': 'Oro',
    'tier.platinum': 'Platino',
    'tier.diamond': 'Diamante',
    'tier.upgrade': 'Actualizar',
    'tier.current': 'Nivel Actual',
    'tier.benefits': 'Beneficios',
    
    // Sports
    'sport.football': 'Fútbol Americano',
    'sport.basketball': 'Baloncesto',
    'sport.baseball': 'Béisbol',
    'sport.hockey': 'Hockey',
    'sport.soccer': 'Fútbol',
    'sport.tennis': 'Tenis',
    'sport.golf': 'Golf',
    'sport.mma': 'MMA',
    'sport.boxing': 'Boxeo',
    'sport.esports': 'Deportes Electrónicos',
    
    // Common
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.save': 'Guardar',
    'common.edit': 'Editar',
    'common.delete': 'Eliminar',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.sort': 'Ordenar',
    'common.refresh': 'Actualizar',
    
    // Time
    'time.live': 'En Vivo',
    'time.quarter': 'Cuarto',
    'time.half': 'Medio Tiempo',
    'time.period': 'Período',
    'time.overtime': 'Tiempo Extra',
    'time.final': 'Final',
  },
  
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.betting': 'Paris',
    'nav.live': 'En Direct',
    'nav.esports': 'Esports',
    'nav.fantasy': 'Fantasy',
    'nav.account': 'Compte',
    'nav.support': 'Support',
    
    // Betting
    'betting.dashboard': 'Tableau de Paris',
    'betting.live_events': 'Événements en Direct',
    'betting.upcoming': 'Événements à Venir',
    'betting.place_bet': 'Placer un Pari',
    'betting.bet_slip': 'Ticket de Pari',
    'betting.odds': 'Cotes',
    'betting.stake': 'Mise',
    'betting.potential_win': 'Gain Potentiel',
    'betting.moneyline': 'Ligne d\'Argent',
    'betting.spread': 'Handicap',
    'betting.total': 'Total (Plus/Moins)',
    'betting.player_props': 'Props Joueur',
    'betting.team_props': 'Props Équipe',
    'betting.parlays': 'Combinés',
    
    // Streaming
    'stream.live_now': 'EN DIRECT',
    'stream.starting_soon': 'Bientôt',
    'stream.preview': 'Aperçu 30s',
    'stream.upgrade_required': 'Mise à Niveau Requise',
    'stream.watch_live': 'Regarder en Direct',
    'stream.viewers': 'spectateurs',
    'stream.quality': 'Qualité',
    'stream.full_screen': 'Plein Écran',
    
    // Sports
    'sport.football': 'Football Américain',
    'sport.basketball': 'Basketball',
    'sport.baseball': 'Baseball',
    'sport.hockey': 'Hockey',
    'sport.soccer': 'Football',
    'sport.tennis': 'Tennis',
    'sport.golf': 'Golf',
    'sport.mma': 'MMA',
    'sport.boxing': 'Boxe',
    'sport.esports': 'Esports',
  },
  
  de: {
    // Navigation
    'nav.home': 'Startseite',
    'nav.betting': 'Wetten',
    'nav.live': 'Live',
    'nav.esports': 'Esports',
    'nav.fantasy': 'Fantasy',
    'nav.account': 'Konto',
    'nav.support': 'Support',
    
    // Betting
    'betting.dashboard': 'Wett-Dashboard',
    'betting.live_events': 'Live-Events',
    'betting.upcoming': 'Kommende Events',
    'betting.place_bet': 'Wette Platzieren',
    'betting.bet_slip': 'Wettschein',
    'betting.odds': 'Quoten',
    'betting.stake': 'Einsatz',
    'betting.potential_win': 'Möglicher Gewinn',
    'betting.moneyline': 'Siegwette',
    'betting.spread': 'Handicap',
    'betting.total': 'Total (Über/Unter)',
    'betting.player_props': 'Spieler Props',
    'betting.team_props': 'Team Props',
    'betting.parlays': 'Kombinetten',
    
    // Streaming
    'stream.live_now': 'LIVE',
    'stream.starting_soon': 'Beginnt Bald',
    'stream.preview': '30s Vorschau',
    'stream.upgrade_required': 'Upgrade Erforderlich',
    'stream.watch_live': 'Live Schauen',
    'stream.viewers': 'Zuschauer',
    'stream.quality': 'Qualität',
    'stream.full_screen': 'Vollbild',
    
    // Sports
    'sport.football': 'American Football',
    'sport.basketball': 'Basketball',
    'sport.baseball': 'Baseball',
    'sport.hockey': 'Eishockey',
    'sport.soccer': 'Fußball',
    'sport.tennis': 'Tennis',
    'sport.golf': 'Golf',
    'sport.mma': 'MMA',
    'sport.boxing': 'Boxen',
    'sport.esports': 'Esports',
  },
  
  'zh-CN': {
    // Navigation
    'nav.home': '首页',
    'nav.betting': '投注',
    'nav.live': '直播',
    'nav.esports': '电竞',
    'nav.fantasy': '梦幻体育',
    'nav.account': '账户',
    'nav.support': '客服',
    
    // Betting
    'betting.dashboard': '投注面板',
    'betting.live_events': '直播赛事',
    'betting.upcoming': '即将开始',
    'betting.place_bet': '下注',
    'betting.bet_slip': '投注单',
    'betting.odds': '赔率',
    'betting.stake': '投注额',
    'betting.potential_win': '潜在收益',
    'betting.moneyline': '胜负盘',
    'betting.spread': '让分盘',
    'betting.total': '大小盘',
    'betting.player_props': '球员道具',
    'betting.team_props': '团队道具',
    'betting.parlays': '串关',
    
    // Streaming
    'stream.live_now': '正在直播',
    'stream.starting_soon': '即将开始',
    'stream.preview': '30秒预览',
    'stream.upgrade_required': '需要升级',
    'stream.watch_live': '观看直播',
    'stream.viewers': '观众',
    'stream.quality': '画质',
    'stream.full_screen': '全屏',
    
    // Sports
    'sport.football': '美式足球',
    'sport.basketball': '篮球',
    'sport.baseball': '棒球',
    'sport.hockey': '冰球',
    'sport.soccer': '足球',
    'sport.tennis': '网球',
    'sport.golf': '高尔夫',
    'sport.mma': '综合格斗',
    'sport.boxing': '拳击',
    'sport.esports': '电子竞技',
  },
  
  ja: {
    // Navigation
    'nav.home': 'ホーム',
    'nav.betting': 'ベッティング',
    'nav.live': 'ライブ',
    'nav.esports': 'eスポーツ',
    'nav.fantasy': 'ファンタジー',
    'nav.account': 'アカウント',
    'nav.support': 'サポート',
    
    // Betting
    'betting.dashboard': 'ベッティングダッシュボード',
    'betting.live_events': 'ライブイベント',
    'betting.upcoming': '今後のイベント',
    'betting.place_bet': 'ベットする',
    'betting.bet_slip': 'ベットスリップ',
    'betting.odds': 'オッズ',
    'betting.stake': 'ステーク',
    'betting.potential_win': '潜在的な勝利',
    'betting.moneyline': 'マネーライン',
    'betting.spread': 'スプレッド',
    'betting.total': 'トータル（オーバー/アンダー）',
    'betting.player_props': 'プレイヤープロップス',
    'betting.team_props': 'チームプロップス',
    'betting.parlays': 'パーレイ',
    
    // Streaming
    'stream.live_now': 'ライブ中',
    'stream.starting_soon': 'まもなく開始',
    'stream.preview': '30秒プレビュー',
    'stream.upgrade_required': 'アップグレードが必要',
    'stream.watch_live': 'ライブ視聴',
    'stream.viewers': '視聴者',
    'stream.quality': '画質',
    'stream.full_screen': 'フルスクリーン',
    
    // Sports
    'sport.football': 'アメリカンフットボール',
    'sport.basketball': 'バスケットボール',
    'sport.baseball': '野球',
    'sport.hockey': 'ホッケー',
    'sport.soccer': 'サッカー',
    'sport.tennis': 'テニス',
    'sport.golf': 'ゴルフ',
    'sport.mma': 'MMA',
    'sport.boxing': 'ボクシング',
    'sport.esports': 'eスポーツ',
  },
  
  ar: {
    // Navigation
    'nav.home': 'الرئيسية',
    'nav.betting': 'المراهنة',
    'nav.live': 'مباشر',
    'nav.esports': 'الرياضات الإلكترونية',
    'nav.fantasy': 'الفانتازي',
    'nav.account': 'الحساب',
    'nav.support': 'الدعم',
    
    // Betting
    'betting.dashboard': 'لوحة المراهنة',
    'betting.live_events': 'الأحداث المباشرة',
    'betting.upcoming': 'الأحداث القادمة',
    'betting.place_bet': 'ضع رهان',
    'betting.bet_slip': 'قسيمة الرهان',
    'betting.odds': 'الاحتمالات',
    'betting.stake': 'المبلغ',
    'betting.potential_win': 'الربح المحتمل',
    'betting.moneyline': 'خط المال',
    'betting.spread': 'الفارق',
    'betting.total': 'الإجمالي (أكثر/أقل)',
    'betting.player_props': 'خصائص اللاعب',
    'betting.team_props': 'خصائص الفريق',
    'betting.parlays': 'المراهنات المتعددة',
    
    // Streaming
    'stream.live_now': 'مباشر الآن',
    'stream.starting_soon': 'يبدأ قريباً',
    'stream.preview': 'معاينة 30 ثانية',
    'stream.upgrade_required': 'مطلوب ترقية',
    'stream.watch_live': 'شاهد مباشر',
    'stream.viewers': 'مشاهدين',
    'stream.quality': 'الجودة',
    'stream.full_screen': 'شاشة كاملة',
    
    // Sports
    'sport.football': 'كرة القدم الأمريكية',
    'sport.basketball': 'كرة السلة',
    'sport.baseball': 'البيسبول',
    'sport.hockey': 'الهوكي',
    'sport.soccer': 'كرة القدم',
    'sport.tennis': 'التنس',
    'sport.golf': 'الغولف',
    'sport.mma': 'الفنون القتالية المختلطة',
    'sport.boxing': 'الملاكمة',
    'sport.esports': 'الرياضات الإلكترونية',
  },
  
  pt: {
    // Navigation
    'nav.home': 'Início',
    'nav.betting': 'Apostas',
    'nav.live': 'Ao Vivo',
    'nav.esports': 'Esports',
    'nav.fantasy': 'Fantasy',
    'nav.account': 'Conta',
    'nav.support': 'Suporte',
    
    // Betting
    'betting.dashboard': 'Painel de Apostas',
    'betting.live_events': 'Eventos Ao Vivo',
    'betting.upcoming': 'Próximos Eventos',
    'betting.place_bet': 'Fazer Aposta',
    'betting.bet_slip': 'Bilhete de Aposta',
    'betting.odds': 'Odds',
    'betting.stake': 'Valor',
    'betting.potential_win': 'Ganho Potencial',
    'betting.moneyline': 'Linha de Dinheiro',
    'betting.spread': 'Handicap',
    'betting.total': 'Total (Acima/Abaixo)',
    'betting.player_props': 'Props do Jogador',
    'betting.team_props': 'Props da Equipe',
    'betting.parlays': 'Múltiplas',
    
    // Streaming
    'stream.live_now': 'AO VIVO',
    'stream.starting_soon': 'Começando Em Breve',
    'stream.preview': 'Preview 30s',
    'stream.upgrade_required': 'Upgrade Necessário',
    'stream.watch_live': 'Assistir Ao Vivo',
    'stream.viewers': 'espectadores',
    'stream.quality': 'Qualidade',
    'stream.full_screen': 'Tela Cheia',
    
    // Sports
    'sport.football': 'Futebol Americano',
    'sport.basketball': 'Basquete',
    'sport.baseball': 'Beisebol',
    'sport.hockey': 'Hockey',
    'sport.soccer': 'Futebol',
    'sport.tennis': 'Tênis',
    'sport.golf': 'Golfe',
    'sport.mma': 'MMA',
    'sport.boxing': 'Boxe',
    'sport.esports': 'Esports',
  },
};

// Language detection and management
export class I18nManager {
  private currentLanguage: string = 'en';
  
  constructor() {
    this.currentLanguage = this.detectLanguage();
  }
  
  private detectLanguage(): string {
    // Check URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const langFromUrl = urlParams.get('lang');
    if (langFromUrl && this.isLanguageSupported(langFromUrl)) {
      return langFromUrl;
    }
    
    // Check localStorage
    const savedLang = localStorage.getItem('weparlay_language');
    if (savedLang && this.isLanguageSupported(savedLang)) {
      return savedLang;
    }
    
    // Check browser language
    const browserLang = navigator.language || navigator.languages?.[0] || 'en';
    const lang = browserLang.toLowerCase();
    
    // Try exact match first
    if (this.isLanguageSupported(lang)) {
      return lang;
    }
    
    // Try language without region
    const langBase = lang.split('-')[0];
    if (this.isLanguageSupported(langBase)) {
      return langBase;
    }
    
    // Default to English
    return 'en';
  }
  
  private isLanguageSupported(lang: string): boolean {
    return supportedLanguages.some(l => l.code === lang);
  }
  
  getCurrentLanguage(): string {
    return this.currentLanguage;
  }
  
  setLanguage(lang: string): void {
    if (this.isLanguageSupported(lang)) {
      this.currentLanguage = lang;
      localStorage.setItem('weparlay_language', lang);
      
      // Update URL parameter
      const url = new URL(window.location.href);
      url.searchParams.set('lang', lang);
      window.history.pushState({}, '', url.toString());
      
      // Update document direction for RTL languages
      const language = supportedLanguages.find(l => l.code === lang);
      if (language?.rtl) {
        document.dir = 'rtl';
        document.documentElement.setAttribute('dir', 'rtl');
      } else {
        document.dir = 'ltr';
        document.documentElement.setAttribute('dir', 'ltr');
      }
      
      // Update HTML lang attribute
      document.documentElement.lang = lang;
    }
  }
  
  translate(key: string, fallback?: string): string {
    const currentTranslations = translations[this.currentLanguage as keyof typeof translations] || translations.en;
    return currentTranslations[key as keyof typeof currentTranslations] || fallback || key;
  }
  
  getLanguageInfo(code: string): Language | undefined {
    return supportedLanguages.find(l => l.code === code);
  }
  
  getAllLanguages(): Language[] {
    return supportedLanguages;
  }
  
  formatNumber(number: number): string {
    return new Intl.NumberFormat(this.currentLanguage).format(number);
  }
  
  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat(this.currentLanguage, {
      style: 'currency',
      currency: currency,
    }).format(amount);
  }
  
  formatDate(date: Date): string {
    return new Intl.DateTimeFormat(this.currentLanguage).format(date);
  }
  
  formatTime(date: Date): string {
    return new Intl.DateTimeFormat(this.currentLanguage, {
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  }
}

// Global instance
export const i18n = new I18nManager();

// React hook for easier usage
export function useTranslation() {
  return {
    t: (key: string, fallback?: string) => i18n.translate(key, fallback),
    language: i18n.getCurrentLanguage(),
    setLanguage: i18n.setLanguage.bind(i18n),
    languages: i18n.getAllLanguages(),
    formatNumber: i18n.formatNumber.bind(i18n),
    formatCurrency: i18n.formatCurrency.bind(i18n),
    formatDate: i18n.formatDate.bind(i18n),
    formatTime: i18n.formatTime.bind(i18n),
  };
}