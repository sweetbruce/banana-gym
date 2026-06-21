const DRILLS = {
  flash: { name: "Tile Rush", short: "Find 2- and 3-letter words from loose tiles." },
  unscramble: { name: "Unscramble", short: "Spot the big word and its smaller partner." },
  glue: { name: "Glue Words", short: "Place short connector words." },
  trouble: { name: "Trouble Tile", short: "Find words in this rack that use an awkward tile." },
  flex: { name: "Hooks & Crosses", short: "Build boards with growth points and crossings." },
  peel: { name: "Main Practice", short: "Use every tile, then take one more." },
  learn: { name: "Learn to Play", short: "A guided tour of the basic rules." },
  rebuild: { name: "Rebuild Challenge", short: "Repair a messy grid." },
  review: { name: "Word Bank Review", short: "Revisit missed words." }
};

const DEFAULT_SETTINGS = {
  difficulty: "casual",
  adaptive: true,
  playerName: "",
  playerEmoji: "",
  globalScores: true,
  globalScoresUserSet: false,
  enabledDrills: {
    flash: true,
    unscramble: true,
    trouble: true,
    flex: true
  }
};

const TIME_TRIAL_SECONDS = 120;
const TIME_TRIAL_DURATIONS = [120, 300];
const LEADERBOARD_LIMIT = 10;
const LEADERBOARD_TABLE = "banana_gym_scores";
const LEADERBOARD_CONFIG = globalThis.BANANA_GYM_LEADERBOARD || {};
const ARCADE_EMOJIS = [0x1F34C, 0x1F3C6, 0x2B50, 0x1F525, 0x1F9E0, 0x1F4AA, 0x1F31F].map((code) => String.fromCodePoint(code));

const TIME_TRIAL_MODES = [
  {
    mode: "words",
    id: "peel",
    label: "Words Trial",
    practiceTitle: "Words Trial",
    short: "Score every valid word on the board.",
    prompt: "Build fast. Your score is the number of valid words on the board."
  },
  {
    mode: "letters",
    id: "peel",
    label: "Letters Trial",
    practiceTitle: "Letters Trial",
    short: "Score every valid letter you place.",
    prompt: "Build fast. Your score is the number of valid letters on the board."
  },
  {
    mode: "scrabble",
    id: "peel",
    label: "Scrabble-Style Trial",
    practiceTitle: "Scrabble-Style Trial",
    short: "Score valid words using Scrabble letter values.",
    prompt: "Build higher-value words. Your score uses Scrabble letter values without board multipliers."
  },
  {
    mode: "flex",
    id: "flex",
    label: "Hooks & Crosses Trial",
    practiceTitle: "Hooks & Crosses Trial",
    short: "Build the most flexible board you can.",
    prompt: "Build a board with open hooks and crosses. Your board score is the target."
  }
];

const DAILY_TILE_RUSH_POOL = [
  { id: "flash", seconds: 90, short: "Find 2-letter words.", wordMode: "twos", dailyKey: "flash-twos", practiceTitle: "Tile Rush: 2-Letter" },
  { id: "flash", seconds: 90, short: "Find 3-letter words.", wordMode: "threes", dailyKey: "flash-threes", practiceTitle: "Tile Rush: 3-Letter" },
  { id: "flash", seconds: 90, short: "Find every possible word.", wordMode: "all", dailyKey: "flash-all", practiceTitle: "Tile Rush: All Words" }
];

const DAILY_TROUBLE_POOL = [
  { id: "trouble", seconds: 90, short: "Practice trouble tiles.", troubleProfile: "Messy Hand", dailyKey: "trouble", practiceTitle: "Trouble Tile" }
];

const DAILY_WORKOUT_FINISHERS = TIME_TRIAL_MODES;

const DRILL_ORDER = ["flash", "unscramble", "trouble", "flex"];
const TROUBLE_LETTERS = ["J", "Q", "X", "Z", "K", "V"];
const UNSCRAMBLE_RACK_SIZE = 10;
const UNSCRAMBLE_BIG_LENGTHS = [6, 7, 8];

const PRACTICE_DRILL_OPTIONS = [
  { id: "flash", label: "Tile Rush: 2-Letter", short: "Find every 2-letter word in the hand.", wordMode: "twos" },
  { id: "flash", label: "Tile Rush: 3-Letter", short: "Find every 3-letter word in the hand.", wordMode: "threes" },
  { id: "flash", label: "Tile Rush: All Words", short: "Larger hand. Find every valid word you can make.", wordMode: "all" },
  { id: "unscramble", label: "Unscramble", short: "Find one big word and one smaller word from 10 tiles." },
  ...TROUBLE_LETTERS.map((letter) => ({
    id: "trouble",
    label: `Trouble Tile: ${letter}`,
    short: `Find words that rescue ${letter}.`,
    troubleLetter: letter,
    troubleProfile: "Messy Hand"
  })),
  { id: "flex", label: "Hooks & Crosses", short: "Build boards with growth points and crossings." }
];

const TIME_TRIAL_STARTER_RACKS = [
  ["T", "R", "A", "I", "N", "S", "E", "L", "D", "O", "P", "M"],
  ["S", "T", "A", "R", "E", "L", "I", "N", "D", "O", "G", "P"],
  ["C", "A", "R", "T", "S", "E", "N", "I", "O", "L", "D", "H"],
  ["P", "L", "A", "N", "E", "T", "S", "R", "I", "O", "M", "C"]
];

const WORD_FINDING_MODES = {
  twos: {
    id: "twos",
    label: "2-letter words",
    targetLength: 2,
    rackSize: 7,
    seedCount: 5,
    minPossible: 5,
    maxPossible: 18,
    prompt: "Find valid 2-letter words you can make from these tiles."
  },
  threes: {
    id: "threes",
    label: "3-letter words",
    targetLength: 3,
    rackSize: 8,
    seedCount: 5,
    minPossible: 6,
    maxPossible: 24,
    prompt: "Find valid 3-letter words you can make from these tiles."
  },
  all: {
    id: "all",
    label: "all words",
    rackSize: 10,
    seedCount: 6,
    minPossible: 18,
    maxPossible: 70,
    prompt: "Find every valid word you can make from this larger hand."
  }
};

const TROUBLE_WORD_MODE = {
  id: "trouble",
  label: "trouble-tile words",
  rackSize: 9,
  seedCount: 5,
  minPossible: 5,
  maxPossible: 24
};

const LEARN_STEPS = [
  {
    key: "intro",
    title: "Goal of the Game",
    copy: "Build your own connected crossword grid. Every word on the board should be valid, and the round keeps growing as players take more tiles.",
    goal: "Read the goal, then start with a simple word.",
    action: "Start Lesson",
    board: false
  },
  {
    key: "first-word",
    title: "Make Your First Word",
    copy: "Tap a tile, then tap an open square. Use C, A, and T to make CAT in one row.",
    goal: "Make CAT as one connected word.",
    waiting: "Make CAT on the board to continue.",
    action: "Next"
  },
  {
    key: "cross-word",
    title: "Cross an Existing Word",
    copy: "Words can share letters like a crossword. Use R and T under the A in CAT to make ART going down.",
    goal: "Make ART crossing through the A.",
    waiting: "Make ART using the shared A to continue.",
    action: "Next"
  },
  {
    key: "invalid",
    title: "Watch for Red Tiles",
    copy: "Brooke's Bananagram Gym checks the board after every move. Put Q and Z next to each other to see how invalid words get marked red.",
    goal: "Create one red invalid word.",
    waiting: "Place Q beside Z to trigger the red invalid highlight.",
    action: "Next"
  },
  {
    key: "trade",
    title: "Trade In a Tough Tile",
    copy: "If a tile is blocking you, select it and tap Trade In. In Bananagrams this swaps one tile for three from the bunch.",
    goal: "Select Q, then tap Trade In.",
    waiting: "Select Q and use Trade In to continue.",
    action: "Next"
  },
  {
    key: "take-one",
    title: "Take 1 When Empty",
    copy: "When your tray is empty and every tile is played, call Take 1. Everyone takes one new tile and keeps building.",
    goal: "Tap Take 1 with an empty tray.",
    waiting: "Tap Take 1 to draw one new tile.",
    action: "Next"
  },
  {
    key: "finish",
    title: "Ready for Brooke's Bananagram Gym",
    copy: "You have the basics: make valid connected words, cross through existing letters, trade in stuck tiles, and take one when your tray is empty.",
    goal: "Jump into a workout or pick one drill to practice.",
    action: "Back to Menu",
    board: false
  }
];

const TROUBLE_RACK_PROFILES = [
  { label: "Obvious", rackSize: 5, seedCount: 2, minPossible: 1, maxPossible: 10 },
  { label: "Easy", rackSize: 7, seedCount: 3, minPossible: 3, maxPossible: 16 },
  { label: "Rescue Reps", rackSize: 8, seedCount: 4, minPossible: 4, maxPossible: 22 },
  { label: "Messy Hand", rackSize: 10, seedCount: 5, minPossible: 5, maxPossible: 30 }
];

const GLUE_PUZZLES = [
  {
    hint: "Use O and A to bridge CAT, NIP, and TAR.",
    tray: ["O", "A", "S", "E", "I"],
    words: [
      { word: "CAT", row: 5, col: 3, direction: "across" },
      { word: "NIP", row: 6, col: 6, direction: "down" },
      { word: "TAR", row: 9, col: 7, direction: "across" }
    ]
  },
  {
    hint: "Use O and E to bridge DOG, HEN, and TAR.",
    tray: ["O", "E", "A", "S", "I"],
    words: [
      { word: "DOG", row: 5, col: 3, direction: "across" },
      { word: "HEN", row: 6, col: 6, direction: "down" },
      { word: "TAR", row: 9, col: 7, direction: "across" }
    ]
  },
  {
    hint: "Two O tiles can connect SUN, RIB, and PAN.",
    tray: ["O", "O", "E", "A", "I"],
    words: [
      { word: "SUN", row: 5, col: 3, direction: "across" },
      { word: "RIB", row: 6, col: 6, direction: "down" },
      { word: "PAN", row: 9, col: 7, direction: "across" }
    ]
  },
  {
    hint: "Use I and E to bridge BUS, TIN, and RAT.",
    tray: ["I", "E", "A", "O", "S"],
    words: [
      { word: "BUS", row: 5, col: 3, direction: "across" },
      { word: "TIN", row: 6, col: 6, direction: "down" },
      { word: "RAT", row: 9, col: 7, direction: "across" }
    ]
  }
];

const GLUE_CONNECTOR_LENGTH = 5;
const GLUE_DISTRACTOR_COUNT = 2;

const TILE_DISTRIBUTION = {
  A: 13, B: 3, C: 3, D: 6, E: 18, F: 3, G: 4, H: 3, I: 12, J: 2, K: 2, L: 5, M: 3,
  N: 8, O: 11, P: 3, Q: 2, R: 9, S: 6, T: 9, U: 6, V: 3, W: 3, X: 2, Y: 3, Z: 2
};

const SCRABBLE_TILE_VALUES = {
  A: 1, B: 3, C: 3, D: 2, E: 1, F: 4, G: 2, H: 4, I: 1, J: 8, K: 5, L: 1, M: 3,
  N: 1, O: 1, P: 3, Q: 10, R: 1, S: 1, T: 1, U: 1, V: 4, W: 4, X: 8, Y: 4, Z: 10
};

const WORDS = [
  "AA", "AB", "AD", "AE", "AG", "AH", "AI", "AL", "AM", "AN", "AR", "AS", "AT", "AW", "AX", "AY",
  "BA", "BE", "BI", "BO", "BY", "DA", "DE", "DO", "ED", "EF", "EH", "EL", "EM", "EN", "ER", "ES", "ET",
  "EW", "EX", "FA", "FE", "GI", "GO", "HA", "HE", "HI", "HM", "HO", "ID", "IF", "IN", "IS", "IT", "JO",
  "KA", "KI", "LA", "LI", "LO", "MA", "ME", "MI", "MM", "MO", "MU", "MY", "NA", "NE", "NO", "NU", "OD",
  "OE", "OF", "OH", "OI", "OM", "ON", "OP", "OR", "OS", "OW", "OX", "OY", "PA", "PE", "PI", "QI", "RE",
  "SH", "SI", "SO", "TA", "TE", "TI", "TO", "UH", "UM", "UN", "UP", "US", "UT", "WE", "WO", "XI", "XU",
  "YA", "YE", "YO", "ZA",
  "ACE", "ACT", "AGE", "AGO", "AID", "AIL", "AIR", "ALE", "ANT", "APE", "APT", "ARC", "ARE", "ARK", "ARM",
  "ART", "ASH", "ATE", "AWE", "AXE", "BAD", "BAG", "BAN", "BAR", "BAT", "BAY", "BED", "BEE", "BET", "BIG",
  "BIN", "BIT", "BOA", "BOG", "BOX", "BOY", "BRA", "BUN", "BUS", "BUT", "BUY", "CAB", "CAN", "CAR", "CAT",
  "COB", "COD", "COG", "COT", "COW", "CRY", "CUE", "CUP", "CUT", "DAB", "DAY", "DEN", "DID", "DIE", "DIG",
  "DIM", "DIN", "DOG", "DOT", "DRY", "DUE", "DUG", "EAR", "EAT", "EEL", "EGG", "ELF", "ELM", "END", "ERA",
  "ETA", "FAN", "FAR", "FAT", "FAX", "FED", "FEN", "FEW", "FIG", "FIN", "FIR", "FIT", "FIX", "FLU", "FLY",
  "FOE", "FOG", "FOR", "FOX", "FRY", "FUN", "FUR", "GAP", "GAS", "GEL", "GET", "GIN", "GNU", "GOT", "GUM",
  "GUN", "GUT", "GUY", "GYM", "HAD", "HAM", "HAS", "HAT", "HAY", "HEX", "HID", "HIM", "HIP", "HIT", "HOP",
  "HOT", "HOW", "HUE", "HUG", "HUT", "ICE", "INK", "ION", "IVY", "JAB", "JAG", "JAM", "JAR", "JAW", "JET",
  "JIG", "JOB", "JOG", "JOT", "JOY", "JUG", "JUT", "KEN", "KEY", "KIN", "KIT", "LAB", "LAD", "LAG", "LAP",
  "LAW", "LAY", "LED", "LEG", "LET", "LID", "LIE", "LIP", "LIT", "LOG", "LOT", "LOW", "MAD", "MAN", "MAP",
  "MAT", "MAY", "MET", "MIX", "MOB", "MOP", "MOW", "MUD", "MUG", "NAP", "NET", "NEW", "NIB", "NIL", "NIP",
  "NIT", "NOD", "NOR", "NOT", "NOW", "NUT", "OAK", "OAR", "OAT", "ODD", "OFF", "OIL", "OLD", "ONE", "ORE",
  "OUR", "OUT", "OVA", "OWL", "OWN", "PAD", "PAL", "PAN", "PAT", "PAW", "PAY", "PEA", "PEN", "PET", "PIE",
  "PIN", "PIT", "PLY", "POD", "POP", "POT", "PRO", "PRY", "PUB", "PUN", "PUP", "PUT", "QAT", "QIS", "RAD",
  "RAG", "RAM", "RAN", "RAP", "RAT", "RAW", "RAY", "RED", "REV", "RIB", "RID", "RIG", "RIM", "RIP", "ROB",
  "ROD", "ROT", "ROW", "RUG", "RUN", "RUT", "RYE", "SAD", "SAG", "SAP", "SAT", "SAW", "SAY", "SEA", "SEE",
  "SET", "SEW", "SEX", "SHE", "SHY", "SIN", "SIP", "SIR", "SIT", "SIX", "SKI", "SKY", "SLY", "SOD", "SON",
  "SOT", "SOW", "SOY", "SPA", "SPY", "STY", "SUE", "SUM", "SUN", "TAB", "TAG", "TAN", "TAP", "TAR", "TEA",
  "TEN", "THE", "TIE", "TIN", "TIP", "TOE", "TON", "TOP", "TOW", "TOY", "TRY", "TUB", "TUG", "TUX", "URN",
  "USE", "VAN", "VAT", "VEX", "VIA", "VIE", "WAG", "WAR", "WAS", "WAX", "WAY", "WEB", "WED", "WET", "WHO",
  "WHY", "WIG", "WIN", "WIT", "WON", "WOW", "YAK", "YAM", "YAP", "YAW", "YEA", "YES", "YET", "YIN", "YIP",
  "ZAG", "ZAP", "ZAX", "ZED", "ZEN", "ZIG", "ZIP", "ZIT", "ZONE", "AQUA", "QUIT", "QUIZ", "JINX", "JAZZ",
  "AMEN", "FUME", "HEN", "JUNE", "MEN",
  "BANANA", "SUSHI", "TRAIN", "STARE", "RATES", "TEARS", "ASTER", "LATER", "ALTER", "ALERT", "TRAIL", "TRIAL"
];

const STARTER_WORD_PATCH = [
  "ABLE", "ACID", "ACRE", "ALSO", "AREA", "BAKE", "BALL", "BANK", "BASE", "BEAM", "BEAR", "BEAT",
  "BELL", "BEND", "BEST", "BIRD", "BLOW", "BLUE", "BOAT", "BODY", "BONE", "BOOK", "BORN", "BOTH",
  "BOWL", "CAKE", "CALL", "CALM", "CAMP", "CARD", "CARE", "CART", "CASE", "CASH", "CAST", "CAVE",
  "CELL", "CHAT", "CHIP", "CITY", "CLAY", "COAL", "COAT", "COLD", "COME", "COOK", "COOL", "COPY",
  "CORD", "CORE", "CORN", "COST", "DARK", "DATE", "DEAL", "DEAR", "DECK", "DEEP", "DESK", "DIRT",
  "DONE", "DOOR", "DOWN", "DRAW", "DROP", "DUST", "EACH", "EARN", "EAST", "EASY", "EDGE", "EVEN",
  "EVER", "FACE", "FACT", "FAIR", "FALL", "FARM", "FAST", "FEAR", "FEED", "FEEL", "FILE", "FILL",
  "FILM", "FIND", "FIRE", "FISH", "FIVE", "FLAT", "FLOW", "FOOD", "FOOL", "FOOT", "FORM", "FOUR",
  "FREE", "FROG", "FULL", "GAIN", "GAME", "GATE", "GAVE", "GIFT", "GIRL", "GIVE", "GLAD", "GOAL",
  "GOLD", "GOOD", "GRAY", "GROW", "HALF", "HALL", "HAND", "HARD", "HARM", "HEAD", "HEAR", "HEAT",
  "HELP", "HILL", "HOLD", "HOME", "HOPE", "HORN", "HOUR", "IDEA", "INTO", "IRON", "JOIN", "JUMP",
  "JUST", "KIND", "KING", "KNEW", "KNOW", "LAKE", "LAMP", "LAND", "LANE", "LAST", "LEAD", "LEAF",
  "LEFT", "LIFE", "LIFT", "LINE", "LIST", "LIVE", "LOAD", "LONG", "LOOK", "LOST", "LOVE", "MADE",
  "MAIL", "MAIN", "MAKE", "MALE", "MANY", "MARK", "MEAL", "MEAN", "MILE", "MILK", "MIND", "MINE",
  "MISS", "MOON", "MORE", "MOST", "MOVE", "NAME", "NEAR", "NECK", "NEED", "NEXT", "NICE", "NINE",
  "OPEN", "OVER", "PAGE", "PAIN", "PAIR", "PARK", "PART", "PASS", "PATH", "PICK", "PLAN", "PLAY",
  "PLOT", "PULL", "PUSH", "RAIN", "READ", "REAL", "RICH", "RIDE", "RING", "ROAD", "ROCK", "ROLL",
  "ROOM", "ROOT", "ROPE", "RULE", "SAFE", "SAIL", "SAME", "SAND", "SAVE", "SEAT", "SEED", "SEND",
  "SHIP", "SHOP", "SHUT", "SIDE", "SIGN", "SING", "SIZE", "SNOW", "SOFT", "SOIL", "SOME", "SONG",
  "SOON", "SORT", "STAR", "STAY", "STEP", "STOP", "SUCH", "SURE", "TAIL", "TAKE", "TALK", "TALL",
  "TEAM", "TELL", "TENT", "TEST", "THAN", "THAT", "THEN", "THIN", "THIS", "TIME", "TOLD", "TREE",
  "TRIP", "TURN", "UNIT", "UPON", "VERY", "VIEW", "WAIT", "WALK", "WALL", "WANT", "WARM", "WASH",
  "WIND", "WISH", "WORD", "WORK", "YARD", "YEAR"
];

const BUNDLED_CASUAL_WORDS = Array.isArray(globalThis.BANANAGRAMS_CASUAL_WORDS)
  ? globalThis.BANANAGRAMS_CASUAL_WORDS
  : [];
const BUNDLED_SCRABBLE_WORDS = Array.isArray(globalThis.BANANAGRAMS_SCRABBLE_WORDS)
  ? globalThis.BANANAGRAMS_SCRABBLE_WORDS
  : BUNDLED_CASUAL_WORDS;
const BLOCKED_WORDS = new Set(["SLEE", "USMC"]);
const STARTER_WORDS = cleanWordList([...BUNDLED_SCRABBLE_WORDS, ...WORDS, ...STARTER_WORD_PATCH]);

const DICTIONARY_STORAGE_KEY = "bananaGymDictionary.v2";
let dictionaryState = loadDictionary();
let WORD_SET = new Set(dictionaryState.words);
let glueWordDataCache = null;
let wordLengthDataCache = null;
const STORAGE_KEY = "bananaGymState";
const BOARD_SIZE = 11;

let state = {
  settings: loadSettings(),
  stats: loadStats(),
  session: null,
  dictionary: dictionaryState.meta,
  lastRound: null,
  workout: null,
  pendingWorkoutStep: null,
  practiceTimerSeconds: null,
  lastGluePuzzleIndex: -1,
  lastGluePuzzleSignature: "",
  board: [],
  tray: [],
  bag: [],
  selectedTileId: null,
  hintOverride: null,
  history: []
};

const uiFeedback = {
  audioContext: null,
  lastSoundAt: 0
};

const els = {
  splashScreen: document.querySelector("#splashScreen"),
  welcomeCard: document.querySelector("#welcomeCard"),
  welcomeLearnButton: document.querySelector("#welcomeLearnButton"),
  welcomeSkipButton: document.querySelector("#welcomeSkipButton"),
  homeView: document.querySelector("#homeView"),
  sessionView: document.querySelector("#sessionView"),
  summaryView: document.querySelector("#summaryView"),
  summaryTitle: document.querySelector("#summaryTitle"),
  homeMenu: document.querySelector("#homeMenu"),
  drillsMenu: document.querySelector("#drillsMenu"),
  trialsMenu: document.querySelector("#trialsMenu"),
  dailyWorkoutButton: document.querySelector("#dailyWorkoutButton"),
  practiceDrillsButton: document.querySelector("#practiceDrillsButton"),
  practiceModeButtons: document.querySelectorAll("[data-practice-mode]"),
  timeTrialsButton: document.querySelector("#timeTrialsButton"),
  learnToPlayButton: document.querySelector("#learnToPlayButton"),
  mainPracticeGrid: document.querySelector("#mainPracticeGrid"),
  presetGrid: document.querySelector("#presetGrid"),
  settingsButton: document.querySelector("#settingsButton"),
  dailyWorkoutDialog: document.querySelector("#dailyWorkoutDialog"),
  startDailyWorkoutButton: document.querySelector("#startDailyWorkoutButton"),
  cancelDailyWorkoutButton: document.querySelector("#cancelDailyWorkoutButton"),
  settingsDialog: document.querySelector("#settingsDialog"),
  drillSettings: document.querySelector("#drillSettings"),
  dictionaryStatus: document.querySelector("#dictionaryStatus"),
  dictionaryFileInput: document.querySelector("#dictionaryFileInput"),
  importDictionaryButton: document.querySelector("#importDictionaryButton"),
  resetDictionaryButton: document.querySelector("#resetDictionaryButton"),
  difficultySelect: document.querySelector("#difficultySelect"),
  playerNameInput: document.querySelector("#playerNameInput"),
  playerEmojiSelect: document.querySelector("#playerEmojiSelect"),
  globalScoresToggle: document.querySelector("#globalScoresToggle"),
  arcadeProfileDialog: document.querySelector("#arcadeProfileDialog"),
  arcadeHandleInput: document.querySelector("#arcadeHandleInput"),
  arcadeEmojiSelect: document.querySelector("#arcadeEmojiSelect"),
  arcadeProfilePreviewEmoji: document.querySelector("#arcadeProfilePreviewEmoji"),
  arcadeProfilePreviewName: document.querySelector("#arcadeProfilePreviewName"),
  saveArcadeProfileButton: document.querySelector("#saveArcadeProfileButton"),
  skipArcadeProfileButton: document.querySelector("#skipArcadeProfileButton"),
  adaptiveToggle: document.querySelector("#adaptiveToggle"),
  resetSettingsButton: document.querySelector("#resetSettingsButton"),
  saveSettingsButton: document.querySelector("#saveSettingsButton"),
  backButton: document.querySelector("#backButton"),
  doneButton: document.querySelector("#doneButton"),
  playAgainButton: document.querySelector("#playAgainButton"),
  currentDrillName: document.querySelector("#currentDrillName"),
  sessionExplainer: document.querySelector("#sessionExplainer"),
  sessionMeta: document.querySelector("#sessionMeta"),
  sessionScoreStrip: document.querySelector("#sessionScoreStrip"),
  drillKicker: document.querySelector("#drillKicker"),
  drillTitle: document.querySelector("#drillTitle"),
  drillPrompt: document.querySelector("#drillPrompt"),
  drillSurface: document.querySelector("#drillSurface"),
  boardWrap: document.querySelector("#boardWrap"),
  board: document.querySelector("#board"),
  boardHint: document.querySelector("#boardHint"),
  tray: document.querySelector("#tray"),
  undoButton: document.querySelector("#undoButton"),
  shuffleButton: document.querySelector("#shuffleButton"),
  dumpButton: document.querySelector("#dumpButton"),
  peelButton: document.querySelector("#peelButton"),
  metricGrid: document.querySelector("#metricGrid"),
  summaryDetails: document.querySelector("#summaryDetails"),
  sessionActions: document.querySelector("#sessionActions")
};

init();

function init() {
  renderHome();
  renderSettings();
  renderDictionaryStatus();
  initBoard();
  bindEvents();
  startSplashIntro();
}

function startSplashIntro() {
  if (!els.splashScreen) return;
  if (!state.stats.welcomeChoiceMade) {
    showWelcomePrompt();
    return;
  }
  fadeSplash();
}

function showWelcomePrompt() {
  if (!els.welcomeCard) {
    fadeSplash();
    return;
  }
  els.welcomeCard.hidden = false;
  els.splashScreen.classList.add("awaiting-welcome");
}

function completeWelcomeChoice(destination) {
  state.stats.welcomeChoiceMade = true;
  saveAll();
  fadeSplash(() => {
    if (destination === "learn") startLearnToPlay({ fromWelcome: true });
  }, 120);
}

function fadeSplash(afterHidden, delay = 650) {
  window.setTimeout(() => {
    els.splashScreen.classList.add("leaving");
  }, delay);
  window.setTimeout(() => {
    els.splashScreen.classList.add("hidden");
    if (typeof afterHidden === "function") afterHidden();
  }, delay + 500);
}

function bindEvents() {
  bindUiFeedback();
  els.welcomeLearnButton?.addEventListener("click", () => completeWelcomeChoice("learn"));
  els.welcomeSkipButton?.addEventListener("click", () => completeWelcomeChoice("menu"));
  els.dailyWorkoutButton.addEventListener("click", openDailyWorkoutIntro);
  els.practiceDrillsButton.addEventListener("click", () => showHomeMenu("drills"));
  els.timeTrialsButton.addEventListener("click", openTimeTrialsMenu);
  els.learnToPlayButton.addEventListener("click", () => startLearnToPlay());
  els.saveArcadeProfileButton?.addEventListener("click", saveArcadeProfileFromDialog);
  els.skipArcadeProfileButton?.addEventListener("click", skipArcadeProfileDialog);
  els.arcadeHandleInput?.addEventListener("input", renderArcadeProfilePreview);
  els.arcadeEmojiSelect?.addEventListener("change", renderArcadeProfilePreview);
  els.startDailyWorkoutButton.addEventListener("click", () => {
    els.dailyWorkoutDialog.close();
    startDailyWorkout();
  });
  els.cancelDailyWorkoutButton.addEventListener("click", () => els.dailyWorkoutDialog.close());
  document.querySelectorAll("[data-home-menu]").forEach((button) => {
    button.addEventListener("click", () => showHomeMenu(button.dataset.homeMenu));
  });
  els.practiceModeButtons.forEach((button) => {
    button.addEventListener("click", () => setPracticeMode(button.dataset.practiceMode));
  });
  els.settingsButton.addEventListener("click", () => els.settingsDialog.showModal());
  els.saveSettingsButton.addEventListener("click", saveSettingsFromDialog);
  els.importDictionaryButton.addEventListener("click", () => els.dictionaryFileInput.click());
  els.dictionaryFileInput.addEventListener("change", importDictionaryFile);
  els.resetDictionaryButton.addEventListener("click", resetDictionary);
  els.resetSettingsButton.addEventListener("click", () => {
    state.settings = structuredClone(DEFAULT_SETTINGS);
    state.settings = normalizeSettings(state.settings);
    saveAll();
    renderSettings();
    renderHome();
  });
  els.backButton.addEventListener("click", exitToHome);
  els.doneButton.addEventListener("click", () => {
    state.workout = null;
    state.pendingWorkoutStep = null;
    showView("home");
    showHomeMenu("home");
    renderHome();
  });
  els.playAgainButton.addEventListener("click", playAgain);
  els.undoButton.addEventListener("click", undoMove);
  els.shuffleButton.addEventListener("click", shuffleTray);
  els.dumpButton.addEventListener("click", dumpSelected);
  els.peelButton.addEventListener("click", peel);
  els.tray.addEventListener("dragover", (event) => event.preventDefault());
  els.tray.addEventListener("drop", onDropToTray);
  els.tray.addEventListener("click", () => {
    if (state.selectedTileId) moveTileToTray(state.selectedTileId);
  });
}

function bindUiFeedback() {
  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : event.target?.parentElement;
    const button = target?.closest("button");
    if (!button || button.disabled || !isFeedbackButton(button)) return;
    triggerUiFeedback(button.classList.contains("primary") || button.classList.contains("recommended") ? "primary" : "tap");
  }, { passive: true });
}

function isFeedbackButton(button) {
  return Boolean(button.closest("#splashScreen, #homeView, #dailyWorkoutDialog, #settingsDialog, #arcadeProfileDialog"));
}

function triggerUiFeedback(kind = "tap") {
  triggerHaptic(kind);
  playUiSound(kind);
}

function triggerHaptic(kind) {
  if (!navigator.vibrate) return;
  navigator.vibrate(kind === "primary" ? 18 : 8);
}

function playUiSound(kind) {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  const now = Date.now();
  if (now - uiFeedback.lastSoundAt < 45) return;
  uiFeedback.lastSoundAt = now;

  try {
    const context = uiFeedback.audioContext || new AudioContextClass();
    uiFeedback.audioContext = context;
    if (context.state === "suspended") context.resume();

    const start = context.currentTime;
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(kind === "primary" ? 660 : 480, start);
    oscillator.frequency.exponentialRampToValueAtTime(kind === "primary" ? 880 : 540, start + 0.06);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(kind === "primary" ? 0.035 : 0.024, start + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.08);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(start);
    oscillator.stop(start + 0.09);
  } catch {
    uiFeedback.audioContext = null;
  }
}

function renderHome() {
  renderDailyWorkoutCompletion();
  renderPracticeModeToggle();
  els.mainPracticeGrid.innerHTML = "";
  getTimeTrialMenuOptions().forEach((trial) => {
    const complete = isCompletedToday(getTimeTrialCompletionKey(trial.mode, trial.seconds));
    const todayScore = getCompletedTodayScore(getTimeTrialCompletionKey(trial.mode, trial.seconds));
    const button = document.createElement("button");
    button.className = `preset-card${complete ? " is-complete" : ""}`;
    button.innerHTML = `
      ${renderMenuTitle(trial.menuLabel, complete, todayScore)}
      <span>${escapeHtml(trial.menuShort)}</span>
    `;
    button.setAttribute("aria-label", `${trial.menuLabel}. ${complete ? `Completed today. Today's score ${todayScore || "recorded"}. ` : ""}${trial.menuShort}`);
    button.addEventListener("click", () => startTimeTrial(trial, trial.seconds));
    els.mainPracticeGrid.append(button);
  });

  els.presetGrid.innerHTML = "";
  const visibleOptions = PRACTICE_DRILL_OPTIONS.filter((option) => state.settings.enabledDrills[option.id]);
  const drillOptions = visibleOptions.length ? visibleOptions : PRACTICE_DRILL_OPTIONS;
  drillOptions.forEach((option) => {
    const practiceOptions = getPracticeSessionOptions(option);
    const completionKey = getPracticeCompletionKey(practiceOptions, state.practiceTimerSeconds);
    const complete = isCompletedToday(completionKey);
    const todayScore = getCompletedTodayScore(completionKey);
    const short = state.practiceTimerSeconds ? `90 sec score run. ${option.short}` : option.short;
    const button = document.createElement("button");
    button.className = `preset-card${complete ? " is-complete" : ""}`;
    button.innerHTML = `${renderMenuTitle(option.label, complete, todayScore)}<span>${escapeHtml(short)}</span>`;
    button.setAttribute("aria-label", `${option.label}. ${complete ? `Completed today. Today's score ${todayScore || "recorded"}. ` : ""}${short}`);
    button.addEventListener("click", () => startDrill(option.id, practiceOptions));
    els.presetGrid.append(button);
  });
}

function getPracticeSessionOptions(option) {
  return {
    ...option,
    timeLimitSeconds: state.practiceTimerSeconds
  };
}

function setPracticeMode(mode) {
  state.practiceTimerSeconds = mode === "90" ? 90 : null;
  renderPracticeModeToggle();
  renderHome();
  if (state.practiceTimerSeconds && hasGlobalScoresEnabled() && !hasArcadeProfile()) {
    maybePromptArcadeProfile({ force: true });
  }
}

function renderPracticeModeToggle() {
  els.practiceModeButtons.forEach((button) => {
    const active = button.dataset.practiceMode === (state.practiceTimerSeconds ? "90" : "untimed");
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
}

function renderDailyWorkoutCompletion() {
  const complete = isCompletedToday("daily-workout");
  els.dailyWorkoutButton.classList.toggle("is-complete", complete);
  els.dailyWorkoutButton.innerHTML = renderMenuTitle("5-Min Daily Workout", complete);
  els.dailyWorkoutButton.setAttribute(
    "aria-label",
    `5-Min Daily Workout. ${complete ? "Completed today. " : ""}Two random 90-second word drills, then one random 2-minute time trial.`
  );
}

function getTimeTrialMenuOptions() {
  return TIME_TRIAL_MODES.flatMap((trial) => TIME_TRIAL_DURATIONS.map((seconds) => ({
    ...trial,
    seconds,
    menuLabel: `${trial.label} (${formatDurationLabel(seconds)})`,
    menuShort: `${formatDurationLabel(seconds)}. ${trial.short}`
  })));
}

function renderMenuTitle(label, complete, scoreLabel = "") {
  const score = complete && scoreLabel ? ` <span class="completion-score">Today&apos;s Score: ${escapeHtml(String(scoreLabel))}</span>` : "";
  return `<strong>${escapeHtml(label)}${complete ? ' <span class="completion-mark" aria-hidden="true">&#9989;</span>' : ""}${score}</strong>`;
}

function getTodayKey() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function getCompletedTodayState() {
  const today = getTodayKey();
  const completed = state.stats.completedToday;
  if (completed?.date === today && Array.isArray(completed.items)) {
    completed.scores = completed.scores || {};
    return completed;
  }
  state.stats.completedToday = { date: today, items: [], scores: {} };
  return state.stats.completedToday;
}

function isCompletedToday(key) {
  return getCompletedTodayState().items.includes(key);
}

function getCompletedTodayScore(key) {
  if (!key) return "";
  return getCompletedTodayState().scores?.[key] || "";
}

function markCompletedToday(key, scoreLabel = "") {
  if (!key) return;
  const completed = getCompletedTodayState();
  if (!completed.items.includes(key)) completed.items.push(key);
  if (scoreLabel) completed.scores[key] = String(scoreLabel);
}

function getPracticeCompletionKey(option, seconds = null) {
  const suffix = seconds ? `:${seconds}` : "";
  if (option.id === "flash") return `drill:flash:${option.wordMode || "mixed"}${suffix}`;
  if (option.id === "trouble") return `drill:trouble:${option.troubleLetter || "mixed"}${suffix}`;
  return `drill:${option.id}${suffix}`;
}

function getTimeTrialCompletionKey(mode, seconds = TIME_TRIAL_SECONDS) {
  return `trial:${mode || "letters"}:${seconds || TIME_TRIAL_SECONDS}`;
}

function getSessionCompletionKey(session, nextWorkoutStep) {
  if (session.mode === "daily") return nextWorkoutStep === null ? "daily-workout" : null;
  if (session.mode === "main") return getTimeTrialCompletionKey(session.timeTrialMode, session.timeLimitSeconds);
  if (session.mode !== "drill") return null;
  return getPracticeCompletionKey({
    id: session.drillId,
    wordMode: session.wordMode || session.flashMode || "mixed",
    troubleLetter: session.troubleLetter || "mixed"
  }, session.timeLimitSeconds);
}

function formatDurationLabel(seconds) {
  const minutes = Math.round((seconds || TIME_TRIAL_SECONDS) / 60);
  return `${minutes} min`;
}

function getTimeTrialBestKey(mode, seconds = TIME_TRIAL_SECONDS) {
  return `${mode || "letters"}:${seconds || TIME_TRIAL_SECONDS}`;
}

function getTimeTrialScoreKey(mode, seconds = TIME_TRIAL_SECONDS) {
  return `trial:${mode || "letters"}:${seconds || TIME_TRIAL_SECONDS}`;
}

function getPersonalBest(mode, seconds = TIME_TRIAL_SECONDS) {
  return state.stats.personalBests?.[getTimeTrialBestKey(mode, seconds)] || null;
}

function getScoreTrackContext(session) {
  if (!session?.timeLimitSeconds) return null;
  if (session.timeTrialMode) {
    const best = getPersonalBest(session.timeTrialMode, session.timeLimitSeconds);
    return {
      type: "trial",
      key: getTimeTrialScoreKey(session.timeTrialMode, session.timeLimitSeconds),
      label: session.timeTrialLabel || "Time Trial",
      yourHighScore: best?.score ?? "--"
    };
  }
  if (session.timeLimitSeconds === 90 && ["flash", "trouble", "unscramble", "flex"].includes(session.drillId)) {
    const key = getDrillHighScoreKey(session);
    const best = getDrillHighScore(key);
    return {
      type: "drill",
      key,
      label: session.practiceTitle || DRILLS[session.drillId]?.name || "Drill",
      yourHighScore: best?.displayScore ?? "--"
    };
  }
  return null;
}

function getDrillHighScoreKey(session) {
  if (session.drillId === "flash") return `drill:flash:${session.wordMode || session.flashMode || "mixed"}:${session.timeLimitSeconds || 90}`;
  if (session.drillId === "trouble") return `drill:trouble:${session.troubleLetter || "mixed"}:${session.timeLimitSeconds || 90}`;
  if (session.drillId === "unscramble") return `drill:unscramble:${session.timeLimitSeconds || 90}`;
  return `drill:${session.drillId}:${session.timeLimitSeconds || 90}`;
}

function getDrillHighScore(key) {
  return state.stats.drillHighScores?.[key] || null;
}

function recordDrillHighScore(session) {
  const context = getScoreTrackContext(session);
  if (!context || context.type !== "drill") return null;
  const current = makeDrillHighScoreRecord(session, context.key);
  state.stats.drillHighScores = state.stats.drillHighScores || {};
  const previous = state.stats.drillHighScores[context.key] || null;
  const isNew = !previous || current.score > previous.score || (current.score === previous.score && current.tieBreak > previous.tieBreak);
  if (isNew) state.stats.drillHighScores[context.key] = current;
  session.drillHighScore = {
    key: context.key,
    current,
    previous,
    best: isNew ? current : previous,
    isNew
  };
  if (isNew && hasGlobalScoresEnabled()) {
    session.leaderboardSubmitPromise = submitLeaderboardScore(session)
      .then(() => true)
      .catch(() => false);
  }
  return session.drillHighScore;
}

function makeDrillHighScoreRecord(session, key) {
  let score = getSessionScore(session);
  let tieBreak = score;
  let displayScore = String(score);
  if (session.drillId === "flash") {
    score = getPercentNumber(session.flashFoundCount || 0, session.flashPossibleCount || 0);
    tieBreak = session.flashFoundCount || 0;
    displayScore = `${score}%`;
  }
  if (session.drillId === "trouble") {
    score = getPercentNumber(session.troubleFoundCount || 0, session.troublePossibleCount || 0);
    tieBreak = session.troubleFoundCount || 0;
    displayScore = `${score}%`;
  }
  if (session.drillId === "unscramble") {
    score = session.unscrambleScore || 0;
    tieBreak = session.unscrambleRounds?.length || 0;
    displayScore = String(score);
  }
  return {
    key,
    drillId: session.drillId,
    label: session.practiceTitle || DRILLS[session.drillId]?.name || "Drill",
    durationSeconds: session.timeLimitSeconds,
    score,
    tieBreak,
    displayScore,
    playerName: getPlayerName(),
    playerEmoji: getPlayerEmoji(),
    playedAt: new Date().toISOString()
  };
}

function recordPersonalBest(session) {
  if (!session.timeTrialResult) return null;
  const key = getTimeTrialBestKey(session.timeTrialMode, session.timeLimitSeconds);
  const current = makePersonalBestRecord(session, key);
  state.stats.personalBests = state.stats.personalBests || {};
  const previous = state.stats.personalBests[key] || null;
  const isNew = !previous || current.score > previous.score;
  if (isNew) state.stats.personalBests[key] = current;
  session.personalBest = {
    key,
    current,
    previous,
    best: isNew ? current : previous,
    isNew
  };
  if (isNew && hasGlobalScoresEnabled()) {
    session.leaderboardSubmitPromise = submitLeaderboardScore(session)
      .then(() => true)
      .catch(() => false);
  }
  return session.personalBest;
}

function makePersonalBestRecord(session, key) {
  const result = session.timeTrialResult || {};
  return {
    key,
    mode: result.mode || session.timeTrialMode || "letters",
    durationSeconds: session.timeLimitSeconds || TIME_TRIAL_SECONDS,
    label: session.timeTrialLabel || result.label || "Time Trial",
    score: result.score || 0,
    words: result.words || 0,
    letters: result.letters || 0,
    invalid: result.invalid || 0,
    scrabble: result.scrabble || 0,
    hooks: result.hooks || 0,
    crosses: result.crosses || 0,
    playerName: getPlayerName(),
    playerEmoji: getPlayerEmoji(),
    playedAt: new Date().toISOString()
  };
}

function hasArcadeProfile() {
  return Boolean(sanitizePlayerName(state.settings.playerName));
}

function getPlayerName() {
  const custom = sanitizePlayerName(state.settings.playerName);
  if (custom) return custom;
  if (!state.stats.playerTag) {
    state.stats.playerTag = `PLY${Math.floor(100 + Math.random() * 900)}`;
  }
  return state.stats.playerTag;
}

function getDefaultPlayerEmoji() {
  return ARCADE_EMOJIS[0];
}

function getPlayerEmoji() {
  return sanitizePlayerEmoji(state.settings.playerEmoji) || getDefaultPlayerEmoji();
}

function sanitizePlayerName(name) {
  return String(name || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .trim()
    .slice(0, 10);
}

function sanitizePlayerEmoji(value) {
  const emoji = String(value || "").trim();
  return ARCADE_EMOJIS.includes(emoji) ? emoji : "";
}

function hasLeaderboardBackend() {
  return Boolean(LEADERBOARD_CONFIG.supabaseUrl && LEADERBOARD_CONFIG.supabaseAnonKey);
}

function hasGlobalScoresEnabled() {
  return Boolean(state.settings.globalScores && hasLeaderboardBackend());
}

function openDailyWorkoutIntro() {
  if (els.dailyWorkoutDialog?.showModal) {
    els.dailyWorkoutDialog.showModal();
    return;
  }
  startDailyWorkout();
}

function openTimeTrialsMenu() {
  showHomeMenu("trials");
  maybePromptArcadeProfile();
}

function maybePromptArcadeProfile({ force = false } = {}) {
  if (!els.arcadeProfileDialog?.showModal) return;
  const shouldPrompt = force || (!hasArcadeProfile() && (hasGlobalScoresEnabled() || !state.stats.arcadeProfilePrompted));
  if (!shouldPrompt) return;
  renderArcadeProfileDialog();
  state.stats.arcadeProfilePrompted = true;
  saveAll();
  els.arcadeProfileDialog.showModal();
  window.setTimeout(() => els.arcadeHandleInput?.focus(), 60);
}

function renderArcadeProfileDialog() {
  if (!els.arcadeHandleInput || !els.arcadeEmojiSelect) return;
  els.arcadeHandleInput.value = sanitizePlayerName(state.settings.playerName) || "";
  els.arcadeEmojiSelect.value = getPlayerEmoji();
  renderArcadeProfilePreview();
}

function renderArcadeProfilePreview() {
  const name = sanitizePlayerName(els.arcadeHandleInput?.value) || "JAC";
  const emoji = sanitizePlayerEmoji(els.arcadeEmojiSelect?.value) || getPlayerEmoji();
  if (els.arcadeProfilePreviewName) els.arcadeProfilePreviewName.textContent = name;
  if (els.arcadeProfilePreviewEmoji) els.arcadeProfilePreviewEmoji.textContent = emoji;
}

function saveArcadeProfileFromDialog() {
  state.settings = {
    ...state.settings,
    playerName: sanitizePlayerName(els.arcadeHandleInput?.value),
    playerEmoji: sanitizePlayerEmoji(els.arcadeEmojiSelect?.value) || getDefaultPlayerEmoji()
  };
  state.stats.arcadeProfilePrompted = true;
  saveAll();
  renderSettings();
  renderHome();
  els.arcadeProfileDialog.close();
}

function skipArcadeProfileDialog() {
  state.stats.arcadeProfilePrompted = true;
  saveAll();
  els.arcadeProfileDialog.close();
}

function showHomeMenu(menu) {
  const panels = {
    home: els.homeMenu,
    drills: els.drillsMenu,
    trials: els.trialsMenu
  };
  Object.entries(panels).forEach(([key, panel]) => {
    const active = key === menu;
    panel.classList.toggle("active", active);
    panel.setAttribute("aria-hidden", String(!active));
  });
}

function renderSettings() {
  state.settings = normalizeSettings(state.settings);
  els.difficultySelect.value = state.settings.difficulty;
  els.playerNameInput.value = sanitizePlayerName(state.settings.playerName) || "";
  els.playerNameInput.placeholder = state.stats.playerTag || "JAC";
  els.playerEmojiSelect.value = getPlayerEmoji();
  els.adaptiveToggle.checked = state.settings.adaptive;
  const hasBackend = hasLeaderboardBackend();
  els.globalScoresToggle.checked = Boolean(state.settings.globalScores && hasBackend);
  els.globalScoresToggle.disabled = !hasBackend;
  els.globalScoresToggle.closest(".toggle-row")?.classList.toggle("is-disabled", !hasBackend);
  els.globalScoresToggle.title = hasBackend ? "Global high scores are enabled by default." : "Add Supabase config to enable global high scores.";
  els.drillSettings.innerHTML = "";
  DRILL_ORDER.forEach((id) => {
    const drill = DRILLS[id];
    const label = document.createElement("label");
    label.className = "drill-toggle";
    label.innerHTML = `<span>${drill.name}</span><input type="checkbox" data-drill="${id}" ${state.settings.enabledDrills[id] ? "checked" : ""}>`;
    els.drillSettings.append(label);
  });
  renderDictionaryStatus();
}

function renderDictionaryStatus() {
  const meta = state.dictionary || dictionaryState.meta;
  const note = meta.source === "imported" ? "Imported list is active alongside the built-in Scrabble-style list." : "Built-in Scrabble-style approved list is active.";
  els.dictionaryStatus.textContent = `${meta.name}: ${meta.count.toLocaleString()} words. ${note}`;
}

function saveSettingsFromDialog() {
  const enabledDrills = {};
  DRILL_ORDER.forEach((id) => {
    enabledDrills[id] = true;
  });
  els.drillSettings.querySelectorAll("input[type='checkbox']").forEach((input) => {
    enabledDrills[input.dataset.drill] = input.checked;
  });
  state.settings = {
    difficulty: els.difficultySelect.value,
    playerName: sanitizePlayerName(els.playerNameInput.value),
    playerEmoji: sanitizePlayerEmoji(els.playerEmojiSelect.value) || getDefaultPlayerEmoji(),
    adaptive: els.adaptiveToggle.checked,
    globalScores: Boolean(els.globalScoresToggle.checked && hasLeaderboardBackend()),
    globalScoresUserSet: true,
    enabledDrills
  };
  saveAll();
  renderHome();
}

function buildTimeTrialStep(trial, seconds = trial.seconds || TIME_TRIAL_SECONDS) {
  const duration = formatDurationLabel(seconds);
  const step = {
    id: trial.id,
    seconds,
    short: `${duration}. ${trial.short}`,
    dailyKey: `trial-${trial.mode}-${seconds}`,
    practiceTitle: `${trial.practiceTitle || trial.label} (${duration})`,
    timeTrialMode: trial.mode,
    timeTrialLabel: trial.label,
    timeTrialPrompt: trial.prompt,
    timeTrialDurationLabel: duration
  };
  if (trial.id === "peel") step.fixedLetters = shuffle(randomItem(TIME_TRIAL_STARTER_RACKS));
  return step;
}

function startTimeTrial(trial, seconds = trial.seconds || TIME_TRIAL_SECONDS) {
  const step = buildTimeTrialStep(trial, seconds);
  state.workout = null;
  state.pendingWorkoutStep = null;
  state.session = createSession(step.id, {
    mode: "main",
    timeLimitSeconds: step.seconds,
    fixedLetters: step.fixedLetters || null,
    practiceTitle: step.practiceTitle,
    timeTrialMode: step.timeTrialMode,
    timeTrialLabel: step.timeTrialLabel,
    timeTrialPrompt: step.timeTrialPrompt,
    timeTrialDurationLabel: step.timeTrialDurationLabel,
    timerId: null,
    tilesDrawn: step.id === "peel" ? (step.fixedLetters?.length || 12) : 0
  });
  state.session.timerId = window.setInterval(tickMainPractice, 250);
  resetTiles(step.id === "peel" ? (step.fixedLetters?.length || 12) : 12, step.fixedLetters ? [...step.fixedLetters] : null);
  loadDrill(step.id);
  showView("session");
  tickMainPractice();
}

function startMainPractice(seconds, mode = "letters") {
  const trial = TIME_TRIAL_MODES.find((item) => item.mode === mode) || TIME_TRIAL_MODES[1];
  startTimeTrial(trial, seconds);
}

function startDailyWorkout() {
  state.workout = {
    steps: buildDailyWorkoutSteps(),
    results: [],
    startedAt: Date.now()
  };
  state.pendingWorkoutStep = null;
  startWorkoutStep(0);
}

function buildDailyWorkoutSteps() {
  const finisher = buildTimeTrialStep(randomItem(DAILY_WORKOUT_FINISHERS));
  const tileRush = { ...randomItem(DAILY_TILE_RUSH_POOL) };
  const troubleTile = { ...randomItem(DAILY_TROUBLE_POOL) };
  return [
    ...shuffle([tileRush, troubleTile]),
    finisher
  ];
}

function startWorkoutStep(index) {
  if (!state.workout?.steps[index]) {
    state.workout = null;
    state.pendingWorkoutStep = null;
    showView("home");
    renderHome();
    return;
  }

  const step = state.workout.steps[index];
  state.session = createSession(step.id, {
    mode: "daily",
    workoutIndex: index,
    workoutTotal: state.workout.steps.length,
    timeLimitSeconds: step.seconds || null,
    wordMode: step.wordMode || null,
    troubleProfile: step.troubleProfile || null,
    troubleLetter: step.troubleLetter || null,
    fixedLetters: step.fixedLetters || null,
    practiceTitle: step.practiceTitle || null,
    timeTrialMode: step.timeTrialMode || null,
    timeTrialLabel: step.timeTrialLabel || null,
    timeTrialPrompt: step.timeTrialPrompt || null,
    timeTrialDurationLabel: step.timeTrialDurationLabel || null,
    timerId: null,
    tilesDrawn: step.id === "peel" ? (step.fixedLetters?.length || 12) : 0
  });
  if (state.session.timeLimitSeconds) state.session.timerId = window.setInterval(tickMainPractice, 250);
  resetTiles(step.id === "peel" ? (step.fixedLetters?.length || 12) : 12, step.fixedLetters ? [...step.fixedLetters] : null);
  loadDrill(step.id);
  showView("session");
  if (state.session.timeLimitSeconds) tickMainPractice();
}

function startDrill(id, options = {}) {
  state.workout = null;
  state.pendingWorkoutStep = null;
  state.session = createSession(id, {
    mode: "drill",
    wordMode: options.wordMode || null,
    troubleProfile: options.troubleProfile || null,
    troubleLetter: options.troubleLetter || null,
    practiceTitle: options.label || options.practiceTitle || null,
    timeLimitSeconds: options.timeLimitSeconds || null,
    timerId: null
  });
  if (state.session.timeLimitSeconds) state.session.timerId = window.setInterval(tickMainPractice, 250);
  resetTiles(12);
  loadDrill(id);
  showView("session");
  if (state.session.timeLimitSeconds) tickMainPractice();
}

function startLearnToPlay(options = {}) {
  state.workout = null;
  state.pendingWorkoutStep = null;
  if (!state.stats.learnGateEntered || options.gated) {
    state.stats.learnGateEntered = true;
    saveAll();
  }
  state.session = createSession("learn", {
    mode: "learn",
    learnStep: 0,
    learnStepKey: ""
  });
  loadDrill("learn");
  showView("session");
}

function createSession(id, overrides = {}) {
  return {
    drillId: id,
    drills: [id],
    mode: "drill",
    currentIndex: 0,
    startedAt: Date.now(),
    words: 0,
    dumps: 0,
    peels: 0,
    misses: 0,
    completedDrills: 0,
    flashAttempts: [],
    ...overrides
  };
}

function loadDrill(id) {
  const drill = DRILLS[id];
  const title = state.session.practiceTitle || (id === "peel" ? "Main Practice" : drill.name);
  const isDaily = state.session.mode === "daily";
  els.sessionView.dataset.drill = id;
  els.currentDrillName.textContent = title;
  els.drillTitle.textContent = title;
  els.drillKicker.textContent = isDaily
    ? `Step ${state.session.workoutIndex + 1} of ${state.session.workoutTotal}`
    : state.session.mode === "learn" ? "Guided Lesson" : state.session.mode === "main" ? "Take 1 Challenge" : state.session.timeLimitSeconds ? "90 Sec Score Run" : "Practice Drill";
  const usesTimer = Boolean(state.session.timeLimitSeconds);
  setSessionMeta(
    usesTimer ? formatTime(state.session.timeLimitSeconds) : isDaily ? `${state.session.workoutIndex + 1}/${state.session.workoutTotal}` : "",
    { timer: usesTimer }
  );
  renderSessionScoreStrip();
  els.drillSurface.innerHTML = "";
  els.sessionActions.innerHTML = "";
  els.sessionExplainer.textContent = "";
  clearLearnHighlights();
  els.boardWrap.classList.toggle("hidden", !["glue", "flex", "peel", "rebuild", "learn"].includes(id));
  els.boardWrap.classList.remove("zoom-close", "zoom-mid", "zoom-far", "infinite-grid");
  els.boardWrap.classList.toggle("infinite-grid", ["peel", "flex"].includes(id) && (state.session.mode === "main" || state.session.timeLimitSeconds));
  window.scrollTo({ top: 0, behavior: "smooth" });

  if (id === "flash") renderFlash();
  if (id === "unscramble") renderUnscramble();
  if (id === "glue") renderGlue();
  if (id === "trouble") renderTrouble();
  if (id === "flex") renderFlex();
  if (id === "peel") renderPeel();
  if (id === "learn") renderLearn();
  if (id === "rebuild") renderRebuild();
  if (id === "review") renderReview();
  els.sessionExplainer.textContent = els.drillPrompt.textContent;
}

function tickMainPractice() {
  if (!state.session || !state.session.timeLimitSeconds) return;
  const elapsed = Math.floor((Date.now() - state.session.startedAt) / 1000);
  const remaining = Math.max(0, state.session.timeLimitSeconds - elapsed);
  setSessionMeta(formatTime(remaining), {
    timer: true,
    low: remaining <= 10,
    final: remaining <= 3
  });
  if (remaining <= 0) completeRound();
}

function setSessionMeta(text, options = {}) {
  els.sessionMeta.textContent = text || "";
  els.sessionMeta.classList.toggle("session-timer", Boolean(options.timer));
  els.sessionMeta.classList.toggle("is-low", Boolean(options.low));
  els.sessionMeta.classList.toggle("is-final", Boolean(options.final));
}

function renderSessionScoreStrip() {
  if (!els.sessionScoreStrip) return;
  const session = state.session;
  const context = getScoreTrackContext(session);
  if (!context) {
    els.sessionScoreStrip.hidden = true;
    els.sessionScoreStrip.innerHTML = "";
    return;
  }

  const globalEnabled = hasGlobalScoresEnabled();
  els.sessionScoreStrip.hidden = false;
  els.sessionScoreStrip.innerHTML = `
    <span><strong>Your High Score</strong><em>${escapeHtml(String(context.yourHighScore))}</em></span>
    ${globalEnabled ? '<span><strong>Global High Score</strong><em id="sessionGlobalHighScore">--</em></span>' : ""}
  `;
  if (globalEnabled) loadSessionGlobalHighScore(session);
}

async function loadSessionGlobalHighScore(session) {
  const target = document.querySelector("#sessionGlobalHighScore");
  if (!target) return;
  const context = getScoreTrackContext(session);
  if (!context?.key) return;
  try {
    const scores = await fetchLeaderboardScores(context.key);
    target.textContent = scores[0]?.display_score ?? scores[0]?.score ?? "--";
  } catch {
    target.textContent = "--";
  }
}

function completeRound() {
  if (!state.session) {
    showView("home");
    return;
  }
  if (state.session.timerId) window.clearInterval(state.session.timerId);
  if (state.session.unscrambleNextTimer) window.clearTimeout(state.session.unscrambleNextTimer);
  if (state.session.drillId === "flash" && !state.session.flashMissed) scoreTileFlash();
  if (state.session.drillId === "trouble" && !state.session.troubleScored) scoreTroubleTile();
  if (state.session.drillId === "flex") state.session.flexScore = calculateFlexScore();
  if (state.session.drillId === "glue") updateGlueStatus();
  const boardScore = getBoardScore();
  state.session.lettersPlaced = boardScore.validTiles;
  state.session.invalidTiles = boardScore.invalidTiles;
  if (["main", "daily"].includes(state.session.mode) && state.session.timeTrialMode) {
    state.session.timeTrialResult = calculateTimeTrialResult(state.session);
    state.session.words = state.session.timeTrialResult.words || state.session.words;
    recordPersonalBest(state.session);
  }
  recordDrillHighScore(state.session);
  const nextWorkoutStep = getNextWorkoutStep(state.session);
  markCompletedToday(getSessionCompletionKey(state.session, nextWorkoutStep), getTodayScoreLabel(state.session));
  state.stats.sessions = (state.stats.sessions || 0) + 1;
  state.stats.words = (state.stats.words || 0) + state.session.words;
  state.stats.dumps = (state.stats.dumps || 0) + state.session.dumps;
  state.stats.peels = (state.stats.peels || 0) + state.session.peels;
  state.stats.lettersPlaced = (state.stats.lettersPlaced || 0) + state.session.lettersPlaced;
  saveAll();
  if (state.session.mode === "daily") recordWorkoutResult(state.session);
  state.pendingWorkoutStep = nextWorkoutStep;
  renderSummary();
  state.lastRound = getRoundConfig(state.session);
  if (state.session.mode === "daily" && nextWorkoutStep === null) state.workout = null;
  state.session = null;
  showView("summary");
}

function getNextWorkoutStep(session) {
  if (session.mode !== "daily" || !state.workout) return null;
  const nextIndex = session.workoutIndex + 1;
  return nextIndex < state.workout.steps.length ? nextIndex : null;
}

function recordWorkoutResult(session) {
  if (!state.workout) return;
  const result = makeWorkoutResult(session);
  state.workout.results = state.workout.results || [];
  state.workout.results[session.workoutIndex] = result;
}

function makeWorkoutResult(session) {
  const title = session.practiceTitle || (session.drillId === "peel" ? "Time Trial" : DRILLS[session.drillId]?.name || "Drill");
  if (session.drillId === "flash") {
    const missed = session.flashMissed?.length ?? Math.max(0, (session.flashPossibleCount || 0) - (session.flashFoundCount || 0));
    return {
      title,
      score: formatPercent(session.flashFoundCount || 0, session.flashPossibleCount || 0),
      detail: `${session.flashFoundCount || 0} found, ${missed} missed`
    };
  }
  if (session.drillId === "trouble") {
    const missed = session.troubleMissed?.length ?? Math.max(0, (session.troublePossibleCount || 0) - (session.troubleFoundCount || 0));
    return {
      title,
      score: formatPercent(session.troubleFoundCount || 0, session.troublePossibleCount || 0),
      detail: `${session.troubleFoundCount || 0} found, ${missed} missed using ${session.troubleLetter || "-"}`
    };
  }
  if (session.drillId === "unscramble") {
    return {
      title,
      score: session.unscrambleScore || 0,
      detail: `${session.unscrambleRounds?.length || 0} solved racks, ${session.unscrambleInvalidCount || 0} misses`
    };
  }
  if (session.drillId === "glue") {
    return {
      title,
      score: session.glueSolved ? "Done" : `${session.glueComponents || 0} islands`,
      detail: session.glueSolved ? "Connected the board" : `${session.glueInvalidTiles || 0} invalid tiles`
    };
  }
  if (session.drillId === "flex") {
    return {
      title,
      score: getSessionScore(session),
      detail: getTimeTrialDetail(session) || `${getFlexMetric(session.flexScore, "hooks")} hooks, ${getFlexMetric(session.flexScore, "crosses")} crosses`
    };
  }
  if (session.drillId === "peel") {
    return {
      title,
      score: getSessionScore(session),
      detail: getTimeTrialDetail(session) || `${session.invalidTiles || 0} invalid, ${session.peels || 0} Take 1`
    };
  }
  return {
    title,
    score: session.words || 0,
    detail: "Completed"
  };
}

function exitToHome() {
  if (state.session?.timerId) window.clearInterval(state.session.timerId);
  state.session = null;
  showView("home");
  showHomeMenu("home");
  renderHome();
}

function getRoundConfig(session) {
  return {
    mode: session.mode,
    drillId: session.drillId,
    timeLimitSeconds: session.timeLimitSeconds || null,
    troubleProfile: session.troubleProfile || null,
    troubleLetter: session.troubleLetter || null,
    wordMode: session.wordMode || null,
    practiceTitle: session.practiceTitle || null,
    timeTrialMode: session.timeTrialMode || null,
    timeTrialLabel: session.timeTrialLabel || null,
    timeTrialPrompt: session.timeTrialPrompt || null,
    fixedLetters: session.fixedLetters ? [...session.fixedLetters] : null
  };
}

function playAgain() {
  if (state.pendingWorkoutStep !== null) {
    const nextIndex = state.pendingWorkoutStep;
    state.pendingWorkoutStep = null;
    startWorkoutStep(nextIndex);
    return;
  }

  const round = state.lastRound;
  if (!round) {
    showView("home");
    renderHome();
    return;
  }
  if (round.mode === "main") startMainPractice(round.timeLimitSeconds || TIME_TRIAL_SECONDS, round.timeTrialMode || "letters");
  else if (round.mode === "daily") startDailyWorkout();
  else startDrill(round.drillId, round);
}

function renderSummary() {
  els.summaryView.dataset.drill = state.session?.drillId || "";
  els.summaryView.dataset.mode = state.session?.mode || "";
  els.summaryDetails.innerHTML = "";
  const current = state.session;
  const isFinalDailySummary = current?.mode === "daily" && state.pendingWorkoutStep === null;
  const flashMissedCount = current?.drillId === "flash"
    ? current.flashMissed?.length ?? Math.max(0, (current.flashPossibleCount || 0) - (current.flashFoundCount || 0))
    : 0;
  const troubleMissedCount = current?.drillId === "trouble"
    ? current.troubleMissed?.length ?? Math.max(0, (current.troublePossibleCount || 0) - (current.troubleFoundCount || 0))
    : 0;
  els.summaryTitle.textContent = isFinalDailySummary ? "Workout Complete" : "Round Complete";
  const metrics = current?.drillId === "peel"
    ? getPeelSummaryMetrics(current)
    : current?.drillId === "flex"
      ? getFlexSummaryMetrics(current)
    : current?.drillId === "glue"
      ? [
          ["Connected", current.glueSolved ? "Yes" : "No"],
          ["Islands", current.glueComponents || 0],
          ["Glue Tiles", current.glueTiles || 0],
          ["Invalid", current.glueInvalidTiles || 0]
        ]
    : current?.drillId === "flash"
      ? [
          ["Score", formatPercent(current.flashFoundCount || 0, current.flashPossibleCount || 0)],
          ["Found", current.flashFoundCount || 0],
          ["Missed", flashMissedCount]
        ]
    : current?.drillId === "trouble"
      ? [
          ["Score", formatPercent(current.troubleFoundCount || 0, current.troublePossibleCount || 0)],
          ["Found", current.troubleFoundCount || 0],
          ["Missed", troubleMissedCount],
          ["Trouble", current.troubleLetter || "-"]
        ]
    : current?.drillId === "unscramble"
      ? [
          ["Score", current.unscrambleScore || 0],
          ["Racks", current.unscrambleRounds?.length || 0],
          ["Big", current.unscrambleBigFoundCount || 0],
          ["Small", current.unscrambleSmallFoundCount || 0]
        ]
    : [
        ["Words", current?.words || 0],
        ["Take 1", current?.peels || 0],
        ["Trades", current?.dumps || 0],
        ["Misses", current?.misses || 0]
      ];
  els.metricGrid.innerHTML = metrics.map(([label, value]) => `<div class="metric"><strong>${value}</strong><span>${label}</span></div>`).join("");
  if (isFinalDailySummary) renderWorkoutSummaryDetails();
  else if (isTimeTrialSession(current)) renderTimeTrialSummaryDetails(current);
  else if (current?.drillId === "flex") renderFlexSummaryDetails(current);
  else if (current?.drillId === "flash") renderFlashSummaryDetails(current);
  else if (current?.drillId === "unscramble") renderUnscrambleSummaryDetails(current);
  else if (current?.drillId === "trouble") renderTroubleSummaryDetails(current);
  renderDrillHighScoreSummary(current);

  if (current?.mode === "daily") {
    els.playAgainButton.textContent = state.pendingWorkoutStep !== null ? "Next Exercise" : "Repeat 5-Min Workout";
    els.doneButton.textContent = "Back to Menu";
  } else {
    els.playAgainButton.textContent = "Play Again";
    els.doneButton.textContent = "Back to Menu";
  }
}

function renderWorkoutSummaryDetails() {
  const results = (state.workout?.results || []).filter(Boolean);
  els.summaryDetails.innerHTML = `
    <div class="workout-summary-list">
      ${results.map((result) => `
        <div class="workout-summary-item">
          <strong>${escapeHtml(result.title)}</strong>
          <span>${escapeHtml(String(result.score))}</span>
          <p>${escapeHtml(result.detail)}</p>
        </div>
      `).join("")}
    </div>
  `;
}

function isTimeTrialSession(session) {
  return Boolean(session?.timeTrialResult && session.timeTrialMode && session.timeLimitSeconds);
}

function renderTimeTrialSummaryDetails(session) {
  const bestInfo = session.personalBest || {
    best: getPersonalBest(session.timeTrialMode, session.timeLimitSeconds),
    isNew: false
  };
  const best = bestInfo.best || bestInfo.current;
  const previous = bestInfo.previous;
  const bestLabel = bestInfo.isNew ? "New High Score" : "Your High Score";
  const detail = getTimeTrialDetail(session);
  const previousCopy = previous ? `Previous best: ${previous.score}.` : "First saved score for this mode.";
  els.summaryDetails.innerHTML = `
    <div class="summary-score-card personal-best-card">
      <span>${bestLabel}</span>
      <strong>${escapeHtml(String(best?.score ?? session.timeTrialResult.score ?? 0))}</strong>
      <em>${escapeHtml(`${formatDurationLabel(session.timeLimitSeconds)} ${session.timeTrialLabel || "Time Trial"}`)}</em>
      <p>${escapeHtml(bestInfo.isNew ? previousCopy : `${detail}. Score to beat: ${best?.score ?? 0}.`)}</p>
    </div>
    ${session.timeTrialResult.mode === "scrabble" ? renderScrabbleScoreBreakdown(session.timeTrialResult) : ""}
    <div class="leaderboard-card">
      ${renderLeaderboardCard(session, `${formatDurationLabel(session.timeLimitSeconds)} ${session.timeTrialLabel || "Time Trial"}`, best?.score ?? session.timeTrialResult.score ?? 0)}
    </div>
  `;
  if (hasGlobalScoresEnabled()) syncLeaderboardPanel(session);
}

function renderScrabbleScoreBreakdown(result) {
  const rows = result.letterBreakdown || [];
  if (!rows.length) return "";
  return `
    <div class="summary-list scrabble-breakdown">
      <strong>Scrabble-Style Breakdown</strong>
      <div class="scrabble-breakdown-grid">
        ${rows.map((item) => `
          <span class="scrabble-breakdown-row">
            <b>${escapeHtml(item.letter)}</b>
            <em>${item.count} x ${item.value}</em>
            <strong>${item.total}</strong>
          </span>
        `).join("")}
      </div>
      <p>Counts are based on scored letter uses across valid words, so shared crossing tiles may count in more than one word.</p>
    </div>
  `;
}

function renderDrillHighScoreSummary(session) {
  if (!session?.drillHighScore) return;
  const scoreInfo = session.drillHighScore;
  const best = scoreInfo.best || scoreInfo.current;
  const previous = scoreInfo.previous;
  const label = scoreInfo.isNew ? "New High Score" : "Your High Score";
  const drillLabel = session.practiceTitle || DRILLS[session.drillId]?.name || "Practice Drill";
  const previousCopy = previous ? `Previous high score: ${previous.displayScore}.` : "First saved score for this drill.";
  els.summaryDetails.insertAdjacentHTML("afterbegin", `
    <div class="summary-score-card personal-best-card">
      <span>${label}</span>
      <strong>${escapeHtml(String(best?.displayScore ?? scoreInfo.current?.displayScore ?? getSessionScore(session)))}</strong>
      <em>${escapeHtml(`${formatDurationLabel(session.timeLimitSeconds)} ${drillLabel}`)}</em>
      <p>${escapeHtml(scoreInfo.isNew ? previousCopy : `Score to beat: ${best?.displayScore ?? "--"}.`)}</p>
    </div>
    <div class="leaderboard-card">
      ${renderLeaderboardCard(session, `${formatDurationLabel(session.timeLimitSeconds)} ${drillLabel}`, best?.displayScore ?? scoreInfo.current?.displayScore ?? getSessionScore(session))}
    </div>
  `);
  if (hasGlobalScoresEnabled()) syncLeaderboardPanel(session);
}

function renderLeaderboardCard(session, label, fallbackScore) {
  return `
    <div>
      <strong>Global Top 10</strong>
      <span>${escapeHtml(label)}</span>
    </div>
    <ol id="leaderboardRows" class="leaderboard-rows">
      <li><span>1</span><strong>${renderPlayerDisplay(getPlayerName(), getPlayerEmoji())}</strong><em>${escapeHtml(String(fallbackScore ?? getSessionScore(session)))}</em></li>
    </ol>
    <p id="leaderboardStatus">${hasGlobalScoresEnabled() ? "Loading global high scores..." : "High scores are saved on this device. Enable global scores in Settings after backend setup."}</p>
  `;
}

async function syncLeaderboardPanel(session) {
  const status = document.querySelector("#leaderboardStatus");
  const rows = document.querySelector("#leaderboardRows");
  if (!status || !rows) return;
  const payload = buildLeaderboardPayload(session);
  if (!payload?.score_key) return;

  try {
    const highScoreInfo = session.personalBest || session.drillHighScore;
    if (highScoreInfo?.isNew) {
      status.textContent = "Submitting new high score...";
      const submitted = await (session.leaderboardSubmitPromise || submitLeaderboardScore(session).then(() => true));
      if (!submitted) throw new Error("Leaderboard submit failed");
    }
    status.textContent = "Loading global high scores...";
    const scores = await fetchLeaderboardScores(payload.score_key);
    rows.innerHTML = scores.length
      ? scores.map((score, index) => renderLeaderboardRow(score, index)).join("")
      : `<li><span>1</span><strong>${renderPlayerDisplay(getPlayerName(), getPlayerEmoji())}</strong><em>${escapeHtml(payload.display_score)}</em></li>`;
    status.textContent = scores.length ? "Global board loaded." : "No global scores yet. Your score is ready to lead it.";
  } catch {
    status.textContent = "Global board could not be reached. Your high score is saved locally.";
  }
}

function renderLeaderboardRow(score, index) {
  return `
    <li>
      <span>${index + 1}</span>
      <strong>${renderPlayerDisplay(score.player_name || score.playerName || "PLAYER", score.player_emoji || score.playerEmoji || "")}</strong>
      <em>${escapeHtml(String(score.display_score || score.displayScore || score.score || 0))}</em>
    </li>
  `;
}

function renderPlayerDisplay(name, emoji) {
  const badge = sanitizePlayerEmoji(emoji) || getDefaultPlayerEmoji();
  return `<span class="leaderboard-emoji">${escapeHtml(badge)}</span>${escapeHtml(sanitizePlayerName(name) || "PLAYER")}`;
}

async function submitLeaderboardScore(session) {
  const payload = buildLeaderboardPayload(session);
  if (!payload) throw new Error("Leaderboard payload missing");
  const response = await fetch(getLeaderboardUrl(), {
    method: "POST",
    headers: getLeaderboardHeaders({ Prefer: "return=minimal" }),
    body: JSON.stringify(payload)
  });
  if (!response.ok) throw new Error("Leaderboard submit failed");
}

async function fetchLeaderboardScores(scoreKey) {
  const params = [
    "select=player_name,player_emoji,score,display_score,tie_break,words,letters,invalid,hooks,crosses,created_at",
    `score_key=eq.${encodeURIComponent(scoreKey)}`,
    "order=score.desc,tie_break.desc,created_at.asc",
    `limit=${LEADERBOARD_LIMIT}`
  ].join("&");
  const response = await fetch(`${getLeaderboardUrl()}?${params}`, {
    headers: getLeaderboardHeaders()
  });
  if (!response.ok) throw new Error("Leaderboard fetch failed");
  return response.json();
}

function buildLeaderboardPayload(session) {
  if (!session?.timeLimitSeconds) return null;
  const result = session.timeTrialResult || null;
  if (result) {
    const score = result.score || 0;
    return {
      score_key: getTimeTrialScoreKey(session.timeTrialMode || result.mode, session.timeLimitSeconds),
      score_type: "time_trial",
      label: session.timeTrialLabel || result.label || "Time Trial",
      duration_seconds: session.timeLimitSeconds || TIME_TRIAL_SECONDS,
      score,
      tie_break: getTimeTrialTieBreak(result),
      display_score: String(score),
      player_name: getPlayerName(),
      player_emoji: getPlayerEmoji(),
      words: result.words || 0,
      letters: result.letters || 0,
      invalid: result.invalid || 0,
      hooks: result.hooks || 0,
      crosses: result.crosses || 0,
      metadata: {
        mode: session.timeTrialMode || result.mode || "letters",
        scrabble: result.scrabble || 0,
        letterBreakdown: result.letterBreakdown || null,
        detail: getTimeTrialDetail(session)
      },
      created_at: new Date().toISOString()
    };
  }

  const highScore = session.drillHighScore?.current || makeDrillHighScoreRecord(session, getDrillHighScoreKey(session));
  if (!highScore) return null;
  const flexScore = session.drillId === "flex" ? session.flexScore || calculateFlexScore() : null;
  return {
    score_key: highScore.key,
    score_type: "drill",
    label: highScore.label,
    duration_seconds: session.timeLimitSeconds,
    score: highScore.score || 0,
    tie_break: highScore.tieBreak || 0,
    display_score: highScore.displayScore || String(highScore.score || 0),
    player_name: getPlayerName(),
    player_emoji: getPlayerEmoji(),
    words: session.words || 0,
    letters: session.lettersPlaced || 0,
    invalid: session.invalidTiles || 0,
    hooks: flexScore ? getFlexMetric(flexScore, "hooks") : 0,
    crosses: flexScore ? getFlexMetric(flexScore, "crosses") : 0,
    metadata: {
      drillId: session.drillId,
      wordMode: session.wordMode || session.flashMode || null,
      troubleLetter: session.troubleLetter || null,
      possible: session.flashPossibleCount || session.troublePossibleCount || null,
      found: session.flashFoundCount || session.troubleFoundCount || null
    },
    created_at: new Date().toISOString()
  };
}

function getTimeTrialTieBreak(result) {
  if (!result) return 0;
  if (result.mode === "flex") return (result.hooks || 0) + (result.crosses || 0);
  if (result.mode === "words") return result.letters || 0;
  return result.words || result.letters || 0;
}

function getLeaderboardUrl() {
  const base = String(LEADERBOARD_CONFIG.supabaseUrl || "").replace(/\/$/, "");
  return `${base}/rest/v1/${encodeURIComponent(LEADERBOARD_CONFIG.table || LEADERBOARD_TABLE)}`;
}

function getLeaderboardHeaders(extra = {}) {
  const key = LEADERBOARD_CONFIG.supabaseAnonKey;
  return {
    apikey: key,
    Authorization: `Bearer ${key}`,
    "Content-Type": "application/json",
    ...extra
  };
}

function summaryLine() {
  if (!state.session) return "Good work. Your practice history is saved on this device.";
  if (state.session.mode === "daily") return state.pendingWorkoutStep !== null ? "Exercise complete. Keep the workout moving when you are ready." : "Daily workout complete. Nice balanced practice.";
  if (state.session.drillId === "peel") return "Good run. Letters placed is the score to beat next time.";
  if (state.session.drillId === "flex") return "Board score rewards hooks that keep the grid open and crosses that make tiles work twice.";
  if (state.session.drillId === "glue") return state.session.glueSolved ? "All word islands are connected." : "Glue Words ends when every word island becomes one connected valid board.";
  if (state.session.drillId === "flash") return "Review what you found and what you missed.";
  if (state.session.drillId === "unscramble") return "Big-word recognition builds the habit of spotting an anchor before the rack gets noisy.";
  if (state.session.drillId === "trouble") return `Review what you found and missed using ${state.session.troubleLetter || "the trouble tile"}.`;
  if (state.session.dumps > state.session.peels) return "A lot of tiles got traded in today. Next session will keep an eye on trouble tiles.";
  if (state.session.peels > 1) return "Nice Take 1 tempo. The grid work is starting to behave.";
  return "Solid reps. Short daily practice is how the word reflex gets built.";
}

function getFlexMetric(flexScore, label) {
  return flexScore?.metrics.find(([metricLabel]) => metricLabel === label)?.[1] || 0;
}

function getPeelSummaryMetrics(session) {
  if (!session.timeTrialResult) {
    return [
      ["Score", session.lettersPlaced || 0],
      ["Invalid", session.invalidTiles || 0],
      ["Take 1", session.peels || 0],
      ["Trades", session.dumps || 0]
    ];
  }
  return [
    [session.timeTrialResult.label || "Score", session.timeTrialResult.score || 0],
    ["Words", session.timeTrialResult.words || 0],
    ["Letters", session.timeTrialResult.letters || 0],
    ["Invalid", session.timeTrialResult.invalid || 0]
  ];
}

function getFlexSummaryMetrics(session) {
  if (session.timeTrialResult?.mode === "flex") {
    return [
      ["Board Score", session.timeTrialResult.score || 0],
      ["Hooks", session.timeTrialResult.hooks || 0],
      ["Crosses", session.timeTrialResult.crosses || 0]
    ];
  }
  return [
    ["Hooks", getFlexMetric(session.flexScore, "hooks")],
    ["Crosses", getFlexMetric(session.flexScore, "crosses")]
  ];
}

function getSessionScore(session) {
  if (session.timeTrialResult) return session.timeTrialResult.score;
  if (session.drillId === "flex") return session.flexScore?.score || 0;
  if (session.drillId === "peel") return session.lettersPlaced || 0;
  return session.words || 0;
}

function getTimeTrialDetail(session) {
  if (!session.timeTrialResult) return "";
  const result = session.timeTrialResult;
  if (result.mode === "flex") {
    return `${result.hooks} hooks, ${result.crosses} crosses`;
  }
  return `${result.words} words, ${result.letters} letters, ${result.invalid} invalid`;
}

function getTodayScoreLabel(session) {
  if (!session) return "";
  if (session.timeTrialResult) return session.timeTrialResult.score || 0;
  if (session.drillId === "flash") return formatPercent(session.flashFoundCount || 0, session.flashPossibleCount || 0);
  if (session.drillId === "trouble") return formatPercent(session.troubleFoundCount || 0, session.troublePossibleCount || 0);
  if (session.drillId === "unscramble") return session.unscrambleScore || 0;
  if (session.drillId === "flex") return session.flexScore?.score || 0;
  if (session.drillId === "glue") return session.glueSolved ? "Done" : `${session.glueComponents || 0} islands`;
  return session.words || 0;
}

function calculateTimeTrialResult(session) {
  const mode = session.timeTrialMode || "letters";
  const words = getValidBoardWords();
  const letters = session.lettersPlaced || 0;
  const invalid = session.invalidTiles || 0;
  const scrabbleBreakdown = getScrabbleLetterBreakdown(words);
  const scrabble = scrabbleBreakdown.total;

  if (mode === "words") {
    return { mode, label: "Words", score: words.length, words: words.length, letters, invalid, scrabble };
  }
  if (mode === "scrabble") {
    return { mode, label: "Score", score: scrabble, words: words.length, letters, invalid, scrabble, letterBreakdown: scrabbleBreakdown.items };
  }
  if (mode === "flex") {
    const flexScore = session.flexScore || calculateFlexScore();
    return {
      mode,
      label: "Board Score",
      score: flexScore.score || 0,
      words: words.length,
      letters,
      invalid,
      scrabble,
      hooks: getFlexMetric(flexScore, "hooks"),
      crosses: getFlexMetric(flexScore, "crosses")
    };
  }
  return { mode: "letters", label: "Letters", score: letters, words: words.length, letters, invalid, scrabble };
}

function getValidBoardWords() {
  return getBoardWords().filter((word) => WORD_SET.has(word.text));
}

function getWordScore(word) {
  return [...word].reduce((total, letter) => total + (SCRABBLE_TILE_VALUES[letter] || 0), 0);
}

function getScrabbleLetterBreakdown(words) {
  const counts = {};
  words.forEach((word) => {
    [...word.text].forEach((letter) => {
      counts[letter] = (counts[letter] || 0) + 1;
    });
  });
  const items = Object.keys(counts)
    .sort((a, b) => a.localeCompare(b))
    .map((letter) => {
      const count = counts[letter];
      const value = SCRABBLE_TILE_VALUES[letter] || 0;
      return { letter, count, value, total: count * value };
    });
  return {
    items,
    total: items.reduce((sum, item) => sum + item.total, 0)
  };
}

function formatPercent(found, possible) {
  return `${getPercentNumber(found, possible)}%`;
}

function getPercentNumber(found, possible) {
  if (!possible) return 0;
  return Math.round((found / possible) * 100);
}

function makeUnscrambleSetup() {
  const data = getWordLengthData();
  let best = null;

  for (let attempt = 0; attempt < 180; attempt++) {
    const bigLength = randomItem(UNSCRAMBLE_BIG_LENGTHS);
    const smallLength = UNSCRAMBLE_RACK_SIZE - bigLength;
    const bigWord = randomItem(data.byLength.get(bigLength) || []);
    const smallWord = randomItem(data.byLength.get(smallLength) || []);
    if (!bigWord || !smallWord) continue;

    const letters = shuffle([...bigWord, ...smallWord]);
    const bigAnswers = getPossibleWordsForLength(letters, bigLength, data);
    const smallAnswers = getPossibleWordsForLength(letters, smallLength, data);
    if (!bigAnswers.length || !smallAnswers.length) continue;

    const score = scoreUnscrambleRack(bigAnswers.length, smallAnswers.length, smallLength);
    const setup = { letters, bigLength, smallLength, bigAnswers, smallAnswers, score };
    if (!best || score < best.score) best = setup;
    if (score === 0) return setup;
  }

  if (best) return best;

  const fallbackBig = "BANANA";
  const fallbackSmall = "GAME";
  const letters = shuffle([...fallbackBig, ...fallbackSmall]);
  return {
    letters,
    bigLength: 6,
    smallLength: 4,
    bigAnswers: getPossibleWordsForLength(letters, 6, data),
    smallAnswers: getPossibleWordsForLength(letters, 4, data),
    score: 99
  };
}

function scoreUnscrambleRack(bigCount, smallCount, smallLength) {
  const targetSmall = smallLength === 2 ? 6 : smallLength === 3 ? 10 : 14;
  const bigPenalty = bigCount >= 1 && bigCount <= 10 ? 0 : Math.min(Math.abs(bigCount - 5), 8);
  const smallPenalty = smallCount >= 2 && smallCount <= targetSmall ? 0 : Math.abs(smallCount - targetSmall);
  return bigPenalty + smallPenalty;
}

function getPossibleWordsForLength(letters, length, data = getWordLengthData()) {
  return (data.byLength.get(length) || [])
    .filter((word) => canBuildWord(word, letters))
    .sort((a, b) => a.localeCompare(b));
}

function getWordLengthData() {
  const cacheKey = `${state.dictionary?.source || "starter"}:${state.dictionary?.count || WORD_SET.size}:${WORD_SET.size}`;
  if (wordLengthDataCache?.key === cacheKey) return wordLengthDataCache.data;
  const byLength = new Map();
  [...WORD_SET]
    .filter((word) => /^[A-Z]+$/.test(word))
    .forEach((word) => {
      if (!byLength.has(word.length)) byLength.set(word.length, []);
      byLength.get(word.length).push(word);
    });
  wordLengthDataCache = { key: cacheKey, data: { byLength } };
  return wordLengthDataCache.data;
}

function makeWordFindingSetup(mode) {
  const candidates = getWordFindingCandidates(mode);
  const targetCount = mode.seedCount || 4;
  let best = null;

  for (let attempt = 0; attempt < 250; attempt++) {
    let letters = mode.trouble ? [mode.trouble] : [];
    let seedsAdded = 0;

    for (const word of shuffle(candidates)) {
      const next = mergeWordIntoRack(letters, word, mode.rackSize);
      if (!next) continue;
      letters = next;
      seedsAdded += 1;
      if (seedsAdded >= targetCount) break;
    }

    letters = fillWordFindingRack(letters, mode.rackSize);
    letters = mode.trouble ? focusTroubleRack(letters, mode.trouble) : shuffle(letters);
    const possible = getPossibleWordsForMode(letters, mode);
    const score = scoreWordFindingRack(possible.length, mode);
    const setup = { letters, possible, mode, score };

    if (!best || setup.score < best.score) best = setup;
    if (score === 0) return setup;
  }

  if (best) return best;

  const letters = mode.trouble
    ? focusTroubleRack(fillWordFindingRack([mode.trouble], mode.rackSize), mode.trouble)
    : drawLetters(mode.rackSize || 7);
  return { letters, possible: getPossibleWordsForMode(letters, mode), mode, score: 0 };
}

function getWordFindingCandidates(mode) {
  const maxLength = Math.min(mode.rackSize || 8, mode.trouble ? 5 : mode.targetLength || 5);
  return [...WORD_SET]
    .filter((word) => /^[A-Z]+$/.test(word))
    .filter((word) => word.length >= 2 && word.length <= maxLength)
    .filter((word) => wordMatchesMode(word, mode));
}

function wordMatchesMode(word, mode) {
  if (mode.targetLength && word.length !== mode.targetLength) return false;
  if (mode.trouble && !word.includes(mode.trouble)) return false;
  return true;
}

function fillWordFindingRack(letters, rackSize) {
  const rack = [...letters];
  const bag = makeBag();
  while (rack.length < rackSize && bag.length) {
    const index = Math.floor(Math.random() * bag.length);
    rack.push(bag.splice(index, 1)[0]);
  }
  return rack;
}

function focusTroubleRack(letters, trouble) {
  const rack = [...letters];
  const index = rack.indexOf(trouble);
  if (index >= 0) rack.splice(index, 1);
  return [trouble, ...shuffle(rack)];
}

function scoreWordFindingRack(possibleCount, mode) {
  const min = mode.minPossible || 1;
  const max = mode.maxPossible || 30;
  if (possibleCount >= min && possibleCount <= max) return 0;
  return possibleCount < min ? min - possibleCount : possibleCount - max;
}

function getPossibleWordsForMode(letters, mode) {
  return getPossibleWords(letters).filter((word) => wordMatchesMode(word, mode));
}

function renderFlash() {
  const mode = WORD_FINDING_MODES[state.session.wordMode] || randomItem(Object.values(WORD_FINDING_MODES));
  const setup = makeWordFindingSetup(mode);
  const letters = setup.letters;
  state.session.flashAttempts = [];
  state.session.flashMode = mode.id;
  state.session.flashLabel = mode.label;
  state.session.flashLetters = letters;
  state.session.flashAnswers = setup.possible;
  els.drillPrompt.textContent = mode.prompt;
  els.drillSurface.innerHTML = `
    <div class="flash-panel">
      <div class="attempt-log">
        <div class="attempt-list">
          <strong>&#127820; Valid</strong>
          <div id="validAttempts"></div>
        </div>
        <div class="attempt-list">
          <strong>&#10060; Invalid</strong>
          <div id="invalidAttempts"></div>
        </div>
      </div>
      ${renderLetterRows(letters)}
      <div class="word-entry">
        <input id="wordInput" maxlength="32" placeholder="${escapeHtml(getWordInputPlaceholder(mode))}">
        <button id="submitWord">Submit</button>
      </div>
      <p id="wordFeedback"></p>
    </div>
  `;
  els.sessionActions.innerHTML = `<button id="finishFlash" class="primary">Done</button>`;
  bindWordInput(letters, {
    trackAttempts: true,
    isTargetWord: (word) => wordMatchesMode(word, mode),
    offTargetMessage: (word) => `${word} is valid, but this round is only ${mode.label}.`
  });
  document.querySelector("#finishFlash").addEventListener("click", finishTileFlash);
  renderFlashAttempts();
}

function renderUnscramble() {
  state.session.unscrambleScore = state.session.unscrambleScore || 0;
  state.session.unscrambleRounds = state.session.unscrambleRounds || [];
  state.session.unscrambleBigFoundCount = state.session.unscrambleBigFoundCount || 0;
  state.session.unscrambleSmallFoundCount = state.session.unscrambleSmallFoundCount || 0;
  state.session.unscrambleInvalidCount = state.session.unscrambleInvalidCount || 0;
  els.drillPrompt.textContent = "Find both target words from the same 10 tiles. The two word lengths always add to 10.";
  state.board = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, () => null);
  state.tray = [];
  dealUnscrambleRound();
}

function dealUnscrambleRound() {
  if (!state.session || state.session.drillId !== "unscramble") return;
  const setup = makeUnscrambleSetup();
  state.session.unscrambleRoundNumber = (state.session.unscrambleRoundNumber || 0) + 1;
  state.session.unscrambleCurrent = {
    ...setup,
    bigFound: "",
    smallFound: "",
    attempts: [],
    solved: false
  };
  renderUnscrambleRound();
}

function renderUnscrambleRound() {
  const round = state.session.unscrambleCurrent;
  if (!round) return;
  els.drillSurface.innerHTML = `
    <div class="flash-panel unscramble-panel">
      <div class="unscramble-status" id="unscrambleStatus">Rack ${state.session.unscrambleRoundNumber || 1} · ${round.bigLength} + ${round.smallLength}</div>
      <div class="unscramble-targets">
        <div class="unscramble-target" data-target="big">
          <strong>${round.bigLength}-letter word</strong>
          <span id="unscrambleBigTarget">Not found yet</span>
        </div>
        <div class="unscramble-target" data-target="small">
          <strong>${round.smallLength}-letter word</strong>
          <span id="unscrambleSmallTarget">Not found yet</span>
        </div>
      </div>
      <div class="attempt-log">
        <div class="attempt-list">
          <strong>&#127820; Found</strong>
          <div id="validAttempts"></div>
        </div>
        <div class="attempt-list">
          <strong>&#10060; Try Again</strong>
          <div id="invalidAttempts"></div>
        </div>
      </div>
      ${renderLetterRows(round.letters)}
      <div class="word-entry">
        <input id="wordInput" maxlength="32" placeholder="Enter a ${round.bigLength}- or ${round.smallLength}-letter word">
        <button id="submitWord">Submit</button>
      </div>
      <p id="wordFeedback"></p>
    </div>
  `;
  els.sessionActions.innerHTML = `<button id="finishUnscramble" class="primary">Done</button>`;
  bindUnscrambleInput();
  document.querySelector("#finishUnscramble").addEventListener("click", finishUnscrambleDrill);
  renderUnscrambleProgress();
}

function bindUnscrambleInput() {
  const input = document.querySelector("#wordInput");
  const submit = document.querySelector("#submitWord");
  const feedback = document.querySelector("#wordFeedback");
  const trySubmit = () => {
    const round = state.session?.unscrambleCurrent;
    const word = input.value.trim().toUpperCase();
    if (!round || !word || round.solved) return;

    if (!canBuildWord(word, round.letters)) {
      rejectUnscrambleWord(word, "Those letters are not all available.");
      input.value = "";
      return;
    }

    if (!WORD_SET.has(word)) {
      rejectUnscrambleWord(word, `${word} is not in the active dictionary.`);
      addMiss(word);
      input.value = "";
      return;
    }

    if (word.length === round.bigLength) {
      acceptUnscrambleWord("big", word);
      input.value = "";
      return;
    }

    if (word.length === round.smallLength) {
      acceptUnscrambleWord("small", word);
      input.value = "";
      return;
    }

    rejectUnscrambleWord(word, `${word} is valid, but this rack needs ${round.bigLength}- and ${round.smallLength}-letter words.`);
    input.value = "";
  };
  submit.addEventListener("click", trySubmit);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") trySubmit();
  });
  bindLetterRowToInput(input);
  input.focus();
  feedback.textContent = `Find a ${state.session.unscrambleCurrent.bigLength}-letter word and a ${state.session.unscrambleCurrent.smallLength}-letter word.`;
}

function acceptUnscrambleWord(kind, word) {
  const round = state.session.unscrambleCurrent;
  const feedback = document.querySelector("#wordFeedback");
  if (kind === "big" && round.bigFound) {
    feedback.textContent = `Already found the big word: ${round.bigFound}.`;
    return;
  }
  if (kind === "small" && round.smallFound) {
    feedback.textContent = `Already found the smaller word: ${round.smallFound}.`;
    return;
  }

  if (kind === "big") {
    round.bigFound = word;
    state.session.unscrambleBigFoundCount += 1;
  } else {
    round.smallFound = word;
    state.session.unscrambleSmallFoundCount += 1;
  }
  round.attempts.push({ word, valid: true });
  state.session.unscrambleScore += 1;
  state.session.words = state.session.unscrambleScore;
  feedback.textContent = `${word} found.`;
  renderUnscrambleProgress();
  if (round.bigFound && round.smallFound) finishUnscrambleRound();
}

function rejectUnscrambleWord(word, message) {
  state.session.misses += 1;
  state.session.unscrambleInvalidCount += 1;
  state.session.unscrambleCurrent.attempts.push({ word, valid: false });
  document.querySelector("#wordFeedback").textContent = message;
  renderUnscrambleProgress();
}

function renderUnscrambleProgress() {
  const round = state.session?.unscrambleCurrent;
  if (!round) return;
  const bigTarget = document.querySelector("#unscrambleBigTarget");
  const smallTarget = document.querySelector("#unscrambleSmallTarget");
  const status = document.querySelector("#unscrambleStatus");
  if (bigTarget) bigTarget.textContent = round.bigFound || "Not found yet";
  if (smallTarget) smallTarget.textContent = round.smallFound || "Not found yet";
  document.querySelectorAll(".unscramble-target").forEach((target) => {
    const solved = target.dataset.target === "big" ? round.bigFound : round.smallFound;
    target.classList.toggle("solved", Boolean(solved));
  });
  if (status) {
    status.textContent = round.solved
      ? "Nice. Loading the next rack..."
      : `Rack ${state.session.unscrambleRoundNumber || 1} · ${round.bigLength} + ${round.smallLength} · Score ${state.session.unscrambleScore || 0}`;
  }
  renderUnscrambleAttempts();
}

function renderUnscrambleAttempts() {
  const valid = document.querySelector("#validAttempts");
  const invalid = document.querySelector("#invalidAttempts");
  const attempts = state.session?.unscrambleCurrent?.attempts || [];
  if (!valid || !invalid) return;
  valid.innerHTML = attempts.filter((attempt) => attempt.valid).map(wordPill).join("");
  invalid.innerHTML = attempts.filter((attempt) => !attempt.valid).map((attempt) => wordPill(attempt, true)).join("");
}

function finishUnscrambleRound() {
  const round = state.session.unscrambleCurrent;
  if (!round || round.solved) return;
  round.solved = true;
  state.session.unscrambleRounds.push({
    bigLength: round.bigLength,
    smallLength: round.smallLength,
    bigFound: round.bigFound,
    smallFound: round.smallFound,
    letters: round.letters
  });
  state.session.completedDrills = state.session.unscrambleRounds.length;
  renderUnscrambleProgress();
  const input = document.querySelector("#wordInput");
  const submit = document.querySelector("#submitWord");
  if (input) input.disabled = true;
  if (submit) submit.disabled = true;
  state.session.unscrambleNextTimer = window.setTimeout(() => {
    if (!state.session || state.session.drillId !== "unscramble") return;
    state.session.unscrambleNextTimer = null;
    dealUnscrambleRound();
  }, 850);
}

function finishUnscrambleDrill() {
  if (!state.session || state.session.drillId !== "unscramble") return;
  if (state.session.unscrambleNextTimer) window.clearTimeout(state.session.unscrambleNextTimer);
  state.session.unscrambleNextTimer = null;
  completeRound();
}

function renderGlue() {
  const puzzle = nextGluePuzzle();
  state.session.gluePuzzle = puzzle;
  state.session.glueBoardNumber = (state.session.glueBoardNumber || 0) + 1;
  state.session.glueSolved = false;
  state.session.glueLoading = false;
  setSessionMeta("", {});
  els.drillPrompt.textContent = "Connect every word island into one valid board. Starter tiles are locked; use as many hand tiles as needed.";
  els.drillSurface.innerHTML = `
    <div class="glue-status" id="glueStatus">
      <strong>Connect the islands</strong>
      <span id="glueStatusText">${puzzle.hint}</span>
    </div>
  `;
  state.session.glueReady = false;
  resetTiles(puzzle.tray.length, shuffle(puzzle.tray));
  puzzle.words.forEach((item) => placeStarterWord(item.word, item.row, item.col, item.direction, true));
  state.session.glueReady = true;
  renderTiles();
}

function nextGluePuzzle() {
  for (let attempt = 0; attempt < 12; attempt++) {
    const puzzle = generateGluePuzzle();
    if (puzzle.signature !== state.lastGluePuzzleSignature) {
      state.lastGluePuzzleSignature = puzzle.signature;
      return puzzle;
    }
  }
  const puzzle = generateGluePuzzle();
  state.lastGluePuzzleSignature = puzzle.signature;
  return puzzle;
}

function generateGluePuzzle() {
  return generateProceduralGluePuzzle() || nextTemplateGluePuzzle();
}

function generateProceduralGluePuzzle() {
  const data = getGlueWordData();
  if (!data) return null;

  for (let attempt = 0; attempt < 300; attempt++) {
    const center = randomItem(data.centers);
    const centerStartRow = center.length === 4 ? 3 : 4;
    const centerPositions = shuffle([...center].map((_, index) => index));

    for (const leftCenterIndex of centerPositions) {
      const leftBridges = data.bridgesByEnd.get(center[leftCenterIndex]) || [];
      if (!leftBridges.length) continue;

      for (const rightCenterIndex of centerPositions.filter((index) => index !== leftCenterIndex)) {
        const rightBridges = data.bridgesByStart.get(center[rightCenterIndex]) || [];
        if (!rightBridges.length) continue;

        const leftBridge = randomItem(leftBridges);
        const rightOptions = rightBridges.filter((word) => word !== leftBridge);
        const rightBridge = randomItem(rightOptions.length ? rightOptions : rightBridges);
        const leftRow = centerStartRow + leftCenterIndex;
        const rightRow = centerStartRow + rightCenterIndex;
        const leftAnchor = pickGlueAnchor(data.anchorsByLetter, leftBridge[0], leftRow);
        const rightAnchor = pickGlueAnchor(data.anchorsByLetter, rightBridge[rightBridge.length - 1], rightRow);

        if (!leftAnchor || !rightAnchor) continue;
        if ([leftAnchor.word, rightAnchor.word].includes(center) || leftAnchor.word === rightAnchor.word) continue;

        const tray = [
          ...leftBridge.slice(1, -1),
          ...rightBridge.slice(1, -1),
          ...drawGlueDistractors(GLUE_DISTRACTOR_COUNT)
        ];
        const leftCol = 5 - leftBridge.length + 1;
        const rightCol = 5 + rightBridge.length - 1;

        return {
          hint: `Connect ${leftAnchor.word}, ${center}, and ${rightAnchor.word}.`,
          tray,
          words: [
            { word: leftAnchor.word, row: leftAnchor.row, col: leftCol, direction: "down" },
            { word: center, row: centerStartRow, col: 5, direction: "down" },
            { word: rightAnchor.word, row: rightAnchor.row, col: rightCol, direction: "down" }
          ],
          signature: [leftAnchor.word, center, rightAnchor.word, leftBridge, rightBridge, leftRow, rightRow].join("-")
        };
      }
    }
  }

  return null;
}

function getGlueWordData() {
  const cacheKey = `${state.dictionary?.source || "starter"}:${state.dictionary?.count || WORD_SET.size}`;
  if (glueWordDataCache?.key === cacheKey) return glueWordDataCache.data;

  const preferred = STARTER_WORDS.filter((word) => WORD_SET.has(word) && isGlueCandidate(word));
  const active = preferred.length >= 60 ? preferred : [...WORD_SET].filter(isGlueCandidate);
  const bridges = active.filter((word) => word.length === GLUE_CONNECTOR_LENGTH);
  const centers = active.filter((word) => word.length >= 3 && word.length <= 4);
  const anchors = centers;

  if (!bridges.length || !centers.length || !anchors.length) {
    glueWordDataCache = { key: cacheKey, data: null };
    return null;
  }

  glueWordDataCache = {
    key: cacheKey,
    data: {
      centers,
      bridgesByStart: groupWordsByLetter(bridges, (word) => word[0]),
      bridgesByEnd: groupWordsByLetter(bridges, (word) => word[word.length - 1]),
      anchorsByLetter: groupAnchorsByLetter(anchors)
    }
  };

  return glueWordDataCache.data;
}

function isGlueCandidate(word) {
  return /^[A-Z]+$/.test(word) && word.length >= 3 && word.length <= GLUE_CONNECTOR_LENGTH;
}

function groupWordsByLetter(words, getLetter) {
  return words.reduce((map, word) => {
    const letter = getLetter(word);
    if (!map.has(letter)) map.set(letter, []);
    map.get(letter).push(word);
    return map;
  }, new Map());
}

function groupAnchorsByLetter(words) {
  return words.reduce((map, word) => {
    [...new Set(word)].forEach((letter) => {
      if (!map.has(letter)) map.set(letter, []);
      map.get(letter).push(word);
    });
    return map;
  }, new Map());
}

function pickGlueAnchor(anchorsByLetter, letter, targetRow) {
  const placements = [];
  (anchorsByLetter.get(letter) || []).forEach((word) => {
    [...word].forEach((char, index) => {
      const row = targetRow - index;
      if (char === letter && row >= 0 && row + word.length <= BOARD_SIZE) {
        placements.push({ word, row });
      }
    });
  });
  return placements.length ? randomItem(placements) : null;
}

function drawGlueDistractors(count) {
  const bag = makeBag();
  const letters = [];
  for (let i = 0; i < count && bag.length; i++) {
    const index = Math.floor(Math.random() * bag.length);
    letters.push(bag.splice(index, 1)[0]);
  }
  return letters;
}

function nextTemplateGluePuzzle() {
  if (GLUE_PUZZLES.length === 1) return { ...GLUE_PUZZLES[0], signature: "template-0" };
  let index = Math.floor(Math.random() * GLUE_PUZZLES.length);
  if (index === state.lastGluePuzzleIndex) index = (index + 1) % GLUE_PUZZLES.length;
  state.lastGluePuzzleIndex = index;
  return { ...GLUE_PUZZLES[index], signature: `template-${index}` };
}

function renderTrouble() {
  const setup = makeTroubleWordSetup(state.session.troubleProfile, state.session.troubleLetter);
  const trouble = setup.trouble;
  const letters = setup.letters;
  state.session.troubleLetter = trouble;
  state.session.troubleLevel = setup.profile.label;
  state.session.troubleLabel = `${trouble} words`;
  state.session.troubleLetters = letters;
  state.session.troublePossible = setup.possible;
  state.session.troubleAttempts = [];
  state.session.troubleScored = false;
  els.drillPrompt.textContent = `${setup.profile.label}: find valid words from these tiles that use ${trouble}.`;
  els.drillSurface.innerHTML = `
    <div class="flash-panel">
      <div class="attempt-log">
        <div class="attempt-list">
          <strong>&#127820; Valid</strong>
          <div id="validAttempts"></div>
        </div>
        <div class="attempt-list">
          <strong>&#10060; Invalid</strong>
          <div id="invalidAttempts"></div>
        </div>
      </div>
      ${renderLetterRows(letters, 0)}
      <div class="word-entry">
        <input id="wordInput" maxlength="32" placeholder="Enter a word using ${escapeHtml(trouble)}">
        <button id="submitWord">Submit</button>
      </div>
      <p id="wordFeedback"></p>
    </div>
  `;
  els.sessionActions.innerHTML = `<button id="finishTrouble" class="primary">Done</button>`;
  state.board = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, () => null);
  state.tray = [];
  bindTroubleInput(letters, trouble);
  document.querySelector("#finishTrouble").addEventListener("click", finishTroubleTile);
  renderTroubleAttempts();
}

function makeTroubleWordSetup(profileLabel = null, selectedTrouble = null) {
  const profile = TROUBLE_RACK_PROFILES.find((item) => item.label === profileLabel) || randomItem(TROUBLE_RACK_PROFILES);
  const trouble = TROUBLE_LETTERS.includes(selectedTrouble) ? selectedTrouble : randomItem(TROUBLE_LETTERS);
  const mode = {
    ...TROUBLE_WORD_MODE,
    ...profile,
    label: `${trouble} words`,
    trouble
  };
  const setup = makeWordFindingSetup(mode);
  return { ...setup, trouble, profile };
}

function mergeWordIntoRack(rack, word, maxLength) {
  const next = [...rack];
  const counts = countLetters(next);
  countLetters([...word]).forEach((needed, letter) => {
    const missing = needed - (counts.get(letter) || 0);
    for (let i = 0; i < missing; i++) next.push(letter);
  });
  return next.length <= maxLength ? next : null;
}

function countLetters(letters) {
  return letters.reduce((counts, letter) => {
    counts.set(letter, (counts.get(letter) || 0) + 1);
    return counts;
  }, new Map());
}

function finishTroubleTile() {
  if (!state.session || state.session.drillId !== "trouble") return;
  scoreTroubleTile();
  completeRound();
}

function renderFlex() {
  els.drillPrompt.textContent = state.session.timeTrialPrompt || "Build a board with open hooks for future plays and crosses where words share tiles.";
  els.drillSurface.innerHTML = `
    <div class="flex-score" id="flexScore">
      <div class="board-score">
        <span>Board Score</span>
        <strong id="flexScoreValue">0</strong>
        <em id="flexScoreLabel">Start building</em>
      </div>
      <div class="flex-metrics" id="flexMetrics"></div>
      <details class="flex-details">
        <summary>Score details</summary>
        <p class="score-notes" id="flexNotes">Hooks keep the board expandable. Crosses make more words with fewer tiles.</p>
        <div class="flex-breakdown" id="flexBreakdown"></div>
      </details>
    </div>
  `;
  els.sessionActions.innerHTML = `<button id="finishFlex" class="primary">Done</button>`;
  resetTiles(14);
  document.querySelector("#finishFlex").addEventListener("click", completeRound);
}

function getWordInputPlaceholder(mode) {
  if (mode.targetLength === 2) return "Enter any 2-letter word";
  if (mode.targetLength === 3) return "Enter any 3-letter word";
  return "Enter any valid word";
}

function renderLetterRows(letters, focusIndices = []) {
  const focusSet = new Set(Array.isArray(focusIndices) ? focusIndices : [focusIndices]);
  const rows = splitLetterRows(letters);
  let offset = 0;
  return `
    <div class="letter-row balanced">
      ${rows.map((row) => {
        const rowMarkup = row.map((letter, index) => {
          const letterIndex = offset + index;
          const focusClass = focusSet.has(letterIndex) ? " focus" : "";
          return `<span class="letter-chip${focusClass}">${escapeHtml(letter)}</span>`;
        }).join("");
        offset += row.length;
        return `<div class="letter-line">${rowMarkup}</div>`;
      }).join("")}
    </div>
  `;
}

function splitLetterRows(letters) {
  if (letters.length <= 6) return [letters];
  const firstRowCount = Math.ceil(letters.length / 2);
  return [letters.slice(0, firstRowCount), letters.slice(firstRowCount)];
}

function renderPeel() {
  els.drillPrompt.textContent = state.session.timeTrialPrompt || (state.session.mode === "main" || state.session.timeLimitSeconds
    ? "Place as many letters as you can before time runs out. Take 1 when your tray is empty."
    : "Use every tray tile in valid words. Take 1 when your tray is empty.");
  const fixedLetters = state.session.fixedLetters ? [...state.session.fixedLetters] : null;
  resetTiles(fixedLetters?.length || 12, fixedLetters);
  els.sessionActions.innerHTML = `<button id="finishPeel" class="primary">Done</button>`;
  document.querySelector("#finishPeel").addEventListener("click", completeRound);
}

function renderRebuild() {
  els.drillPrompt.textContent = "Repair the starter grid, then fit the tray tiles without freezing.";
  resetTiles(8, ["Q", "I", "A", "T", "S", "R", "E", "X"]);
  placeStarterWord("TEA", 5, 4, "across");
  placeStarterWord("RAT", 4, 5, "down");
}

function renderReview() {
  const missed = state.stats.missedWords?.length ? state.stats.missedWords.slice(-6) : ["QI", "ZA", "QAT", "VEX", "ZAX", "JO"];
  els.drillPrompt.textContent = "Read these out loud and picture one quick placement for each.";
  els.drillSurface.innerHTML = `<div class="letter-row">${missed.map((word) => `<span class="letter-chip">${word}</span>`).join("")}</div>`;
}

function renderLearn() {
  const step = getCurrentLearnStep();
  if (!step) return finishLearnToPlay();

  if (state.session.learnStepKey !== step.key) setupLearnStep(step);

  els.currentDrillName.textContent = "Learn to Play";
  els.drillTitle.textContent = step.title;
  els.drillPrompt.textContent = step.copy;
  els.sessionExplainer.textContent = step.copy;
  setSessionMeta(`${state.session.learnStep + 1}/${LEARN_STEPS.length}`, {});
  els.boardWrap.classList.toggle("hidden", step.board === false);
  updateLearnControlFocus(step);
  updateLearnTargets(step);

  els.drillSurface.innerHTML = `
    <div class="learn-card" id="learnCard">
      <span class="learn-step-label">Step ${state.session.learnStep + 1} of ${LEARN_STEPS.length}</span>
      <h2>${escapeHtml(step.title)}</h2>
      <p>${escapeHtml(step.copy)}</p>
      <div class="learn-goal">
        <strong>Goal</strong>
        <span id="learnGoalStatus">${escapeHtml(step.goal)}</span>
      </div>
    </div>
  `;
  els.sessionActions.innerHTML = `<button id="learnNext" class="primary">${escapeHtml(step.action)}</button>`;
  document.querySelector("#learnNext").addEventListener("click", goToNextLearnStep);
  updateLearnProgress();
}

function setupLearnStep(step) {
  state.session.learnStepKey = step.key;
  state.session.learnStartDumps = state.session.dumps || 0;
  state.session.learnStartPeels = state.session.peels || 0;
  state.session.learnStepComplete = false;
  state.hintOverride = null;

  if (step.key === "intro" || step.key === "finish") {
    resetTiles(0);
    return;
  }

  if (step.key === "first-word") {
    resetTiles(3, ["C", "A", "T"]);
    return;
  }

  if (step.key === "cross-word") {
    resetTiles(2, ["R", "T"]);
    placeStarterWord("CAT", 5, 4, "across", true);
    return;
  }

  if (step.key === "invalid") {
    resetTiles(2, ["Q", "Z"]);
    return;
  }

  if (step.key === "trade") {
    resetTiles(1, ["Q"]);
    return;
  }

  if (step.key === "take-one") {
    resetTiles(0);
    placeStarterWord("CAT", 5, 4, "across", true);
  }
}

function getCurrentLearnStep() {
  if (!state.session || state.session.drillId !== "learn") return null;
  return LEARN_STEPS[state.session.learnStep] || null;
}

function goToNextLearnStep() {
  const step = getCurrentLearnStep();
  if (!step) return;

  if (!isLearnStepComplete(step)) {
    showBoardHint(step.waiting || step.goal);
    updateLearnProgress();
    return;
  }

  if (state.session.learnStep >= LEARN_STEPS.length - 1) {
    finishLearnToPlay();
    return;
  }

  state.session.learnStep += 1;
  state.session.learnStepKey = "";
  renderLearn();
}

function finishLearnToPlay() {
  clearLearnHighlights();
  state.stats.learnCompleted = true;
  saveAll();
  state.session = null;
  showView("home");
  showHomeMenu("home");
  renderHome();
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateLearnProgress() {
  const step = getCurrentLearnStep();
  if (!step) return;

  const complete = isLearnStepComplete(step);
  const button = document.querySelector("#learnNext");
  const status = document.querySelector("#learnGoalStatus");
  const card = document.querySelector("#learnCard");

  if (button) {
    button.disabled = !complete;
    button.textContent = step.action;
  }

  if (status) status.textContent = complete ? getLearnCompleteText(step) : step.goal;
  if (card) card.classList.toggle("complete", complete);
  state.session.learnStepComplete = complete;
}

function isLearnStepComplete(step) {
  if (!state.session || state.session.drillId !== "learn") return false;
  if (step.key === "intro" || step.key === "finish") return true;
  if (step.key === "first-word") return learnCellsSpell([learnIndex(5, 4), learnIndex(5, 5), learnIndex(5, 6)], "CAT") && !getInvalidCells().size;
  if (step.key === "cross-word") return learnCellsSpell([learnIndex(5, 5), learnIndex(6, 5), learnIndex(7, 5)], "ART") && !getInvalidCells().size;
  if (step.key === "invalid") return learnCellsOccupied([learnIndex(5, 5), learnIndex(5, 6)]) && getInvalidCells().size > 0;
  if (step.key === "trade") return (state.session.dumps || 0) > (state.session.learnStartDumps || 0);
  if (step.key === "take-one") return (state.session.peels || 0) > (state.session.learnStartPeels || 0);
  return false;
}

function learnIndex(row, col) {
  return row * BOARD_SIZE + col;
}

function learnCellsSpell(cells, text) {
  return cells.map((index) => state.board[index]?.letter || "").join("") === text;
}

function learnCellsOccupied(cells) {
  return cells.every((index) => state.board[index]);
}

function updateLearnTargets(step) {
  Array.from(els.board.children).forEach((cell) => cell.classList.remove("learn-target"));
  getLearnTargetCells(step).forEach((index) => {
    els.board.children[index]?.classList.add("learn-target");
  });
}

function getLearnTargetCells(step) {
  if (step.key === "first-word") return [learnIndex(5, 4), learnIndex(5, 5), learnIndex(5, 6)];
  if (step.key === "cross-word") return [learnIndex(6, 5), learnIndex(7, 5)];
  if (step.key === "invalid") return [learnIndex(5, 5), learnIndex(5, 6)];
  return [];
}

function getLearnCompleteText(step) {
  if (step.key === "intro") return "Ready.";
  if (step.key === "invalid") return "Red invalid word spotted.";
  if (step.key === "trade") return "Tile traded in for three new tiles.";
  if (step.key === "take-one") return "Take 1 added a new tile.";
  if (step.key === "finish") return "Lesson complete.";
  return "Nice. You can continue.";
}

function updateLearnControlFocus(step) {
  clearLearnHighlights();
  if (step.key === "trade") els.dumpButton.classList.add("learn-highlight");
  if (step.key === "take-one") els.peelButton.classList.add("learn-highlight");
}

function clearLearnHighlights() {
  [els.undoButton, els.shuffleButton, els.dumpButton, els.peelButton].forEach((button) => {
    button.classList.remove("learn-highlight");
  });
}

function bindWordInput(letters, options = {}) {
  const input = document.querySelector("#wordInput");
  const submit = document.querySelector("#submitWord");
  const feedback = document.querySelector("#wordFeedback");
  const trySubmit = () => {
    const word = input.value.trim().toUpperCase();
    if (!word) return;
    if (!canBuildWord(word, letters)) {
      feedback.textContent = "Those letters are not all available.";
      state.session.misses += 1;
      addMiss(word);
      trackWordAttempt(word, false, options.trackAttempts);
      input.value = "";
      return;
    }
    if (WORD_SET.has(word)) {
      if (options.isTargetWord && !options.isTargetWord(word)) {
        feedback.textContent = typeof options.offTargetMessage === "function"
          ? options.offTargetMessage(word)
          : `${word} is valid, but it does not match this round's target.`;
        state.session.misses += 1;
        trackWordAttempt(word, false, options.trackAttempts);
        input.value = "";
        return;
      }
      feedback.textContent = `${word} counts. Nice quick recognition.`;
      input.value = "";
      state.session.words += 1;
      trackWordAttempt(word, true, options.trackAttempts);
    } else {
      feedback.textContent = `${word} is not in the active dictionary. Add/import it if your table allows it.`;
      state.session.misses += 1;
      addMiss(word);
      trackWordAttempt(word, false, options.trackAttempts);
      input.value = "";
    }
  };
  submit.addEventListener("click", trySubmit);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") trySubmit();
  });
  bindLetterRowToInput(input);
  input.focus();
}

function bindTroubleInput(letters, trouble) {
  const input = document.querySelector("#wordInput");
  const submit = document.querySelector("#submitWord");
  const feedback = document.querySelector("#wordFeedback");
  const trySubmit = () => {
    const word = input.value.trim().toUpperCase();
    if (!word) return;

    if (!canBuildWord(word, letters)) {
      feedback.textContent = "Those letters are not all available.";
      state.session.misses += 1;
      addMiss(word);
      trackTroubleAttempt(word, false);
      input.value = "";
      return;
    }

    if (!word.includes(trouble)) {
      feedback.textContent = `${word} does not use ${trouble}.`;
      state.session.misses += 1;
      trackTroubleAttempt(word, false);
      input.value = "";
      return;
    }

    if (WORD_SET.has(word)) {
      feedback.textContent = `${word} rescues ${trouble}.`;
      trackTroubleAttempt(word, true);
      input.value = "";
    } else {
      feedback.textContent = `${word} is not in the active dictionary.`;
      state.session.misses += 1;
      addMiss(word);
      trackTroubleAttempt(word, false);
      input.value = "";
    }
  };
  submit.addEventListener("click", trySubmit);
  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter") trySubmit();
  });
  bindLetterRowToInput(input);
  input.focus();
}

function bindLetterRowToInput(input) {
  document.querySelectorAll(".letter-row .letter-chip").forEach((tile) => {
    tile.setAttribute("role", "button");
    tile.setAttribute("tabindex", "0");
    tile.setAttribute("aria-label", `Add ${tile.textContent.trim()}`);
    const addLetter = () => appendTileLetterToInput(input, tile.textContent);
    tile.addEventListener("click", addLetter);
    tile.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        addLetter();
      }
    });
  });
}

function appendTileLetterToInput(input, value) {
  const letter = (value || "").trim().toUpperCase();
  if (!letter) return;
  const start = input.selectionStart ?? input.value.length;
  const end = input.selectionEnd ?? input.value.length;
  const next = `${input.value.slice(0, start)}${letter}${input.value.slice(end)}`;
  input.value = next.toUpperCase();
  input.focus();
  const cursor = start + letter.length;
  input.setSelectionRange(cursor, cursor);
}

function trackWordAttempt(word, valid, shouldTrack) {
  if (!shouldTrack) return;
  state.session.flashAttempts.push({ word, valid });
  renderFlashAttempts();
}

function trackTroubleAttempt(word, valid) {
  state.session.troubleAttempts.push({ word, valid });
  renderTroubleAttempts();
}

function renderFlashAttempts() {
  const valid = document.querySelector("#validAttempts");
  const invalid = document.querySelector("#invalidAttempts");
  if (!valid || !invalid) return;
  const attempts = state.session?.flashAttempts || [];
  valid.innerHTML = attempts.filter((attempt) => attempt.valid).map(wordPill).join("");
  invalid.innerHTML = attempts.filter((attempt) => !attempt.valid).map((attempt) => wordPill(attempt, true)).join("");
}

function renderTroubleAttempts() {
  const valid = document.querySelector("#validAttempts");
  const invalid = document.querySelector("#invalidAttempts");
  if (!valid || !invalid) return;
  const attempts = state.session?.troubleAttempts || [];
  const found = uniqueWords(attempts.filter((attempt) => attempt.valid).map((attempt) => attempt.word));
  valid.innerHTML = found.map((word) => wordPill({ word })).join("");
  invalid.innerHTML = attempts.filter((attempt) => !attempt.valid).map((attempt) => wordPill(attempt, true)).join("");
}

function finishTileFlash() {
  if (!state.session || state.session.drillId !== "flash") return;
  scoreTileFlash();
  completeRound();
}

function scoreTileFlash() {
  const attempts = state.session.flashAttempts || [];
  const found = [...new Set(attempts.filter((attempt) => attempt.valid).map((attempt) => attempt.word))];
  const mode = WORD_FINDING_MODES[state.session.flashMode] || WORD_FINDING_MODES.twos;
  const answers = state.session.flashAnswers || getPossibleWordsForMode(state.session.flashLetters || [], mode);
  state.session.flashFound = found;
  state.session.flashMissed = answers.filter((word) => !found.includes(word));
  state.session.flashFoundCount = found.length;
  state.session.flashPossibleCount = answers.length;
  state.session.flashInvalidCount = attempts.filter((attempt) => !attempt.valid).length;
  state.session.words = found.length;
}

function getPossibleWords(letters) {
  return [...WORD_SET]
    .filter((word) => word.length >= 2 && canBuildWord(word, letters))
    .sort((a, b) => a.length - b.length || a.localeCompare(b));
}

function scoreTroubleTile() {
  const attempts = state.session.troubleAttempts || [];
  const found = uniqueWords(attempts.filter((attempt) => attempt.valid).map((attempt) => attempt.word));
  const possible = state.session.troublePossible || getPossibleWordsForMode(state.session.troubleLetters || [], {
    ...TROUBLE_WORD_MODE,
    trouble: state.session.troubleLetter || ""
  });
  state.session.troubleFound = found;
  state.session.troubleRescues = found;
  state.session.troubleMissed = possible.filter((word) => !found.includes(word));
  state.session.troubleFoundCount = found.length;
  state.session.troublePossibleCount = possible.length;
  state.session.troubleInvalidCount = attempts.filter((attempt) => !attempt.valid).length;
  state.session.troubleScored = true;
  state.session.words = found.length;
}

function uniqueWords(words) {
  return [...new Set(words)];
}

function renderFlexSummaryDetails(session) {
  const score = session.flexScore?.score || 0;
  const label = session.flexScore?.label || "Start building";
  const notes = session.flexScore?.notes?.join(" ") || "Hooks and crosses are the focus.";
  els.summaryDetails.innerHTML = `
    <div class="summary-score-card">
      <span>Board Score</span>
      <strong>${score}</strong>
      <em>${escapeHtml(label)}</em>
      <p>${escapeHtml(notes)}</p>
    </div>
  `;
}

function renderFlashSummaryDetails(session) {
  const mode = WORD_FINDING_MODES[session.flashMode] || WORD_FINDING_MODES.twos;
  const possible = session.flashAnswers || getPossibleWordsForMode(session.flashLetters || [], mode);
  const found = session.flashFound || [];
  const missed = session.flashMissed || possible.filter((word) => !found.includes(word));
  els.summaryDetails.innerHTML = `
    <div class="summary-list">
      <strong>Found Words</strong>
      <div>${renderWordPills(found, "None yet")}</div>
    </div>
    <div class="summary-list">
      <strong>Missed Words</strong>
      <div>${renderWordPills(missed, "None")}</div>
    </div>
  `;
}

function renderUnscrambleSummaryDetails(session) {
  const rounds = session.unscrambleRounds || [];
  const current = session.unscrambleCurrent || null;
  const includeCurrent = current && !current.solved;
  const bigFound = [
    ...rounds.map((round) => round.bigFound).filter(Boolean),
    includeCurrent ? current.bigFound : ""
  ].filter(Boolean);
  const smallFound = [
    ...rounds.map((round) => round.smallFound).filter(Boolean),
    includeCurrent ? current.smallFound : ""
  ].filter(Boolean);
  const missedBig = !includeCurrent || current.bigFound ? [] : (current.bigAnswers || []).slice(0, 16);
  const missedSmall = !includeCurrent || current.smallFound ? [] : (current.smallAnswers || []).slice(0, 16);
  els.summaryDetails.innerHTML = `
    <div class="summary-list">
      <strong>Big Words Found</strong>
      <div>${renderWordPills(bigFound, "None yet")}</div>
    </div>
    <div class="summary-list">
      <strong>Smaller Words Found</strong>
      <div>${renderWordPills(smallFound, "None yet")}</div>
    </div>
    <div class="summary-list">
      <strong>Current Rack Misses</strong>
      <div>${renderWordPills([...missedBig, ...missedSmall], "None")}</div>
    </div>
  `;
}

function renderTroubleSummaryDetails(session) {
  const possible = session.troublePossible || getPossibleWordsForMode(session.troubleLetters || [], {
    ...TROUBLE_WORD_MODE,
    trouble: session.troubleLetter || ""
  });
  const found = session.troubleFound || [];
  const missed = session.troubleMissed || possible.filter((word) => !found.includes(word));
  els.summaryDetails.innerHTML = `
    <div class="summary-list">
      <strong>Trouble Letter</strong>
      <div><span class="letter-chip focus">${escapeHtml(session.troubleLetter || "-")}</span></div>
    </div>
    <div class="summary-list">
      <strong>Found Words</strong>
      <div>${renderWordPills(found, "None yet")}</div>
    </div>
    <div class="summary-list">
      <strong>Missed Words</strong>
      <div>${renderWordPills(missed, "None")}</div>
    </div>
  `;
}

function renderWordPills(words, emptyLabel = "None") {
  if (!words.length) return `<span>${emptyLabel}</span>`;
  const visible = words.slice(0, 16);
  const overflow = words.length - visible.length;
  return `${visible.map((word) => `<span class="word-pill">${escapeHtml(word)}</span>`).join("")}${overflow > 0 ? `<span class="word-pill">+${overflow}</span>` : ""}`;
}

function wordPill(attempt, invalid = false) {
  return `<span class="word-pill ${invalid ? "invalid" : ""}">${escapeHtml(attempt.word)}</span>`;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

function initBoard() {
  state.board = Array.from({ length: BOARD_SIZE * BOARD_SIZE }, () => null);
  els.board.innerHTML = "";
  for (let i = 0; i < BOARD_SIZE * BOARD_SIZE; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.dataset.index = i;
    cell.addEventListener("dragover", (event) => event.preventDefault());
    cell.addEventListener("drop", onDropToCell);
    cell.addEventListener("click", () => moveSelectedToCell(i));
    els.board.append(cell);
  }
}

function resetTiles(count, fixedLetters = null) {
  initBoard();
  state.history = [];
  state.selectedTileId = null;
  state.bag = makeBag();
  const letters = fixedLetters || drawLetters(count);
  state.tray = letters.map((letter) => makeTile(letter));
  renderTiles();
}

function makeBag() {
  return Object.entries(TILE_DISTRIBUTION).flatMap(([letter, count]) => Array.from({ length: count }, () => letter));
}

function drawLetters(count) {
  const bag = state.bag.length ? state.bag : makeBag();
  const letters = [];
  for (let i = 0; i < count && bag.length; i++) {
    const index = Math.floor(Math.random() * bag.length);
    letters.push(bag.splice(index, 1)[0]);
  }
  state.bag = bag;
  return letters;
}

function makeTile(letter, locked = false) {
  return { id: makeId(), letter, locked };
}

function makeId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `tile-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function renderTiles() {
  els.tray.innerHTML = "";
  state.tray.forEach((tile) => els.tray.append(createTile(tile, "tray")));
  Array.from(els.board.children).forEach((cell, index) => {
    cell.innerHTML = "";
    cell.classList.remove("valid", "invalid");
    const tile = state.board[index];
    if (tile) cell.append(createTile(tile, "board"));
  });
  validateBoard();
  updateBoardHint();
  updateFlexScore();
  updateGlueStatus();
  updateLearnProgress();
  updateBoardZoom();
}

function updateBoardZoom() {
  if (!els.boardWrap || els.boardWrap.classList.contains("hidden")) return;
  const zoomable = ["flex", "peel", "learn"].includes(state.session?.drillId);
  const placed = getPlacedIndices();
  if (!zoomable || !placed.length) {
    els.boardWrap.classList.toggle("zoom-close", zoomable);
    els.boardWrap.classList.remove("zoom-mid", "zoom-far");
    setBoardPan(0, 0);
    return;
  }

  const rows = placed.map((index) => Math.floor(index / BOARD_SIZE));
  const cols = placed.map((index) => index % BOARD_SIZE);
  const minRow = Math.min(...rows);
  const maxRow = Math.max(...rows);
  const minCol = Math.min(...cols);
  const maxCol = Math.max(...cols);
  const span = Math.max(maxRow - minRow + 1, maxCol - minCol + 1);
  const edgeDistance = Math.min(minRow, minCol, BOARD_SIZE - 1 - maxRow, BOARD_SIZE - 1 - maxCol);
  const nearEdge = edgeDistance <= 2;
  const zoomFar = nearEdge || span >= 8 || placed.length >= 22;
  const zoomMid = !zoomFar && (span >= 5 || placed.length >= 8);

  els.boardWrap.classList.toggle("zoom-close", !zoomMid && !zoomFar);
  els.boardWrap.classList.toggle("zoom-mid", zoomMid);
  els.boardWrap.classList.toggle("zoom-far", zoomFar);

  const boardWidth = els.board.offsetWidth || 560;
  const cellSize = boardWidth / BOARD_SIZE;
  const boardCenter = (BOARD_SIZE - 1) / 2;
  const centerCol = (minCol + maxCol) / 2;
  const centerRow = (minRow + maxRow) / 2;
  const panX = clampNumber((boardCenter - centerCol) * cellSize * 0.62, -boardWidth * 0.22, boardWidth * 0.22);
  const panY = clampNumber((boardCenter - centerRow) * cellSize * 0.48, -92, 92);
  setBoardPan(panX, panY);
}

function setBoardPan(x, y) {
  if (!els.boardWrap) return;
  els.boardWrap.style.setProperty("--board-pan-x", `${Math.round(x)}px`);
  els.boardWrap.style.setProperty("--board-pan-y", `${Math.round(y)}px`);
}

function clampNumber(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function updateFlexScore() {
  if (state.session?.drillId !== "flex") return;
  const scorePanel = document.querySelector("#flexScore");
  if (!scorePanel) return;
  const result = calculateFlexScore();
  document.querySelector("#flexScoreValue").textContent = result.score;
  document.querySelector("#flexScoreLabel").textContent = result.label;
  document.querySelector("#flexMetrics").innerHTML = result.metrics
    .map(([label, value]) => `<span><strong>${value}</strong>${label}</span>`)
    .join("");
  document.querySelector("#flexNotes").textContent = result.notes.join(" ");
  const breakdown = document.querySelector("#flexBreakdown");
  if (breakdown) {
    breakdown.innerHTML = result.breakdown
      .map((item) => `
        <div class="flex-breakdown-item">
          <div><strong>${escapeHtml(item.label)}</strong><span>${escapeHtml(item.value)}</span></div>
          <p>${escapeHtml(item.detail)}</p>
        </div>
      `)
      .join("");
  }
}

function calculateFlexScore() {
  const placed = getPlacedIndices();
  if (!placed.length) {
    return {
      score: 0,
      label: "Start building",
      notes: ["Place tiles to start the board score."],
      metrics: [["hooks", 0], ["crosses", 0]],
      breakdown: [
        { label: "Hooks", value: "0/60", detail: "Open squares next to words are future places to attach tiles." },
        { label: "Crosses", value: "0/40", detail: "Shared tiles let one move support both an across word and a down word." }
      ]
    };
  }

  const invalidWords = getInvalidWords();
  const invalidTiles = getInvalidCells().size;
  const openHooks = countOpenHooks();
  const crosses = placed.filter(isIntersectionTile).length;
  const islands = countComponents(placed);

  const hookPoints = Math.min(60, openHooks * 5);
  const crossPoints = Math.min(40, crosses * 14);
  const invalidPenalty = Math.min(45, invalidTiles * 12);
  const islandPenalty = Math.min(25, Math.max(0, islands - 1) * 12);

  let score = hookPoints + crossPoints;
  score -= invalidPenalty;
  score -= islandPenalty;
  score = Math.max(0, Math.min(100, Math.round(score)));

  return {
    score,
    label: score >= 80 ? "Lots of options" : score >= 60 ? "Good shape" : score >= 40 ? "Needs hooks" : "Tight board",
    notes: getFlexNotes({ invalidWords, invalidTiles, islands, openHooks, crosses }),
    metrics: [
      ["hooks", openHooks],
      ["crosses", crosses]
    ],
    breakdown: [
      {
        label: "Hooks",
        value: `${hookPoints}/60`,
        detail: `${openHooks} open neighboring square${openHooks === 1 ? "" : "s"} where future tiles can extend or connect words.`
      },
      {
        label: "Crosses",
        value: `${crossPoints}/40`,
        detail: `${crosses} shared tile${crosses === 1 ? "" : "s"} working both across and down.`
      },
      {
        label: "Quality check",
        value: invalidPenalty || islandPenalty ? `-${invalidPenalty + islandPenalty}` : "clear",
        detail: invalidPenalty || islandPenalty ? "Invalid words and disconnected islands still reduce the score, but the drill focuses on hooks and crosses." : "No invalid words or disconnected islands detected."
      }
    ]
  };
}

function getFlexNotes({ invalidWords, invalidTiles, islands, openHooks, crosses }) {
  const notes = [];
  if (invalidWords.length) {
    notes.push(`Invalid: ${invalidWords.slice(0, 4).join(", ")}.`);
    if (state.dictionary?.source !== "imported") notes.push("Rejected by the active Scrabble-style list; import another word list if your table allows it.");
  }
  else notes.push("All detected words are valid.");
  if (openHooks < 8) notes.push("Add more hooks: open squares beside words give you places to keep building.");
  if (crosses < 2) notes.push("Add crosses: shared tiles make the board stronger and more efficient.");
  if (islands > 1) notes.push("Disconnected islands lower the board score.");
  if (!invalidTiles && islands <= 1 && openHooks >= 8 && crosses >= 2) notes.push("This board has room to grow.");
  return notes;
}

function getPlacedIndices() {
  return state.board
    .map((tile, index) => tile ? index : null)
    .filter((index) => index !== null);
}

function updateGlueStatus() {
  if (state.session?.drillId !== "glue") return;
  const status = document.querySelector("#glueStatusText");
  if (!status) return;
  if (state.session.glueLoading) return;
  const placed = getPlacedIndices();
  const components = countComponents(placed);
  const invalidTiles = getInvalidCells().size;
  const glueTiles = state.board.filter((tile) => tile && !tile.locked).length;
  state.session.glueComponents = components;
  state.session.glueInvalidTiles = invalidTiles;
  state.session.glueTiles = glueTiles;

  if (invalidTiles) {
    status.textContent = `${invalidTiles} invalid tile${invalidTiles === 1 ? "" : "s"} highlighted.`;
    return;
  }

  if (components > 1) {
    status.textContent = `${components} islands remain. Connect them with short legal words.`;
    return;
  }

  status.textContent = "Connected. Nice glue work.";
  if (state.session.glueReady && !state.session.glueSolved && glueTiles >= 2) {
    finishGlueBoard();
  }
}

function finishGlueBoard() {
  state.session.glueSolved = true;
  state.session.glueLoading = true;
  state.session.glueSolvedBoards = (state.session.glueSolvedBoards || 0) + 1;
  state.session.completedDrills = state.session.glueSolvedBoards;
  state.session.words += getBoardWords().length;

  const status = document.querySelector("#glueStatusText");
  const panel = document.querySelector("#glueStatus");
  if (status) status.textContent = "Good job. Loading next board...";
  if (panel) panel.classList.add("solved");
  setSessionMeta("", {});
  showBoardHint("All word islands connected.");

  window.clearTimeout(state.session.glueNextTimer);
  state.session.glueNextTimer = window.setTimeout(() => {
    if (state.session?.drillId !== "glue" || !state.session.glueLoading) return;
    renderGlue();
  }, 1100);
}

function countOpenHooks() {
  const hooks = new Set();
  state.board.forEach((tile, index) => {
    if (!tile) return;
    getNeighborIndices(index).forEach((neighbor) => {
      if (!state.board[neighbor]) hooks.add(neighbor);
    });
  });
  return hooks.size;
}

function isIntersectionTile(index) {
  const hasHorizontal = hasTile(index - 1) && sameRow(index, index - 1) || hasTile(index + 1) && sameRow(index, index + 1);
  const hasVertical = hasTile(index - BOARD_SIZE) || hasTile(index + BOARD_SIZE);
  return hasHorizontal && hasVertical;
}

function countComponents(placed) {
  const unvisited = new Set(placed);
  let components = 0;
  while (unvisited.size) {
    components += 1;
    const stack = [unvisited.values().next().value];
    while (stack.length) {
      const index = stack.pop();
      if (!unvisited.delete(index)) continue;
      getNeighborIndices(index).forEach((neighbor) => {
        if (state.board[neighbor] && unvisited.has(neighbor)) stack.push(neighbor);
      });
    }
  }
  return components;
}

function countNeighbors(index) {
  return getNeighborIndices(index).filter((neighbor) => state.board[neighbor]).length;
}

function getNeighborIndices(index) {
  const neighbors = [];
  const row = Math.floor(index / BOARD_SIZE);
  const col = index % BOARD_SIZE;
  if (row > 0) neighbors.push(index - BOARD_SIZE);
  if (row < BOARD_SIZE - 1) neighbors.push(index + BOARD_SIZE);
  if (col > 0) neighbors.push(index - 1);
  if (col < BOARD_SIZE - 1) neighbors.push(index + 1);
  return neighbors;
}

function hasTile(index) {
  return index >= 0 && index < state.board.length && Boolean(state.board[index]);
}

function sameRow(a, b) {
  return Math.floor(a / BOARD_SIZE) === Math.floor(b / BOARD_SIZE);
}

function getBoardDensity(placed) {
  const rows = placed.map((index) => Math.floor(index / BOARD_SIZE));
  const cols = placed.map((index) => index % BOARD_SIZE);
  const height = Math.max(...rows) - Math.min(...rows) + 1;
  const width = Math.max(...cols) - Math.min(...cols) + 1;
  return placed.length / Math.max(1, height * width);
}

function updateBoardHint() {
  if (!els.boardHint) return;
  if (state.hintOverride) {
    els.boardHint.textContent = state.hintOverride;
    return;
  }
  const selected = findTile(state.selectedTileId);
  els.boardHint.textContent = selected
    ? `Selected ${selected.letter}. Tap an open square, or tap the tray to recall it.`
    : "Tap a tile, then tap an open square.";
}

function showBoardHint(message) {
  state.hintOverride = message;
  updateBoardHint();
  window.clearTimeout(showBoardHint.timer);
  showBoardHint.timer = window.setTimeout(() => {
    state.hintOverride = null;
    updateBoardHint();
  }, 1800);
}

function findTile(id) {
  if (!id) return null;
  return state.tray.find((tile) => tile.id === id) || state.board.find((tile) => tile?.id === id) || null;
}

function createTile(tile, source) {
  const div = document.createElement("div");
  div.className = `tile ${tile.id === state.selectedTileId ? "selected" : ""} ${tile.locked ? "locked" : ""}`;
  div.textContent = tile.letter;
  div.draggable = !tile.locked;
  div.dataset.id = tile.id;
  div.dataset.source = source;
  div.addEventListener("dragstart", (event) => {
    if (tile.locked) {
      event.preventDefault();
      return;
    }
    event.stopPropagation();
    state.selectedTileId = tile.id;
    div.classList.add("dragging");
    event.dataTransfer.setData("text/plain", tile.id);
  });
  div.addEventListener("dragend", () => div.classList.remove("dragging"));
  div.addEventListener("click", (event) => {
    event.stopPropagation();
    if (tile.locked) {
      showBoardHint("Starter tiles are locked.");
      return;
    }
    state.selectedTileId = tile.id === state.selectedTileId ? null : tile.id;
    renderTiles();
  });
  return div;
}

function onDropToCell(event) {
  event.preventDefault();
  const id = event.dataTransfer.getData("text/plain") || state.selectedTileId;
  moveTileToCell(id, Number(event.currentTarget.dataset.index));
}

function onDropToTray(event) {
  event.preventDefault();
  const id = event.dataTransfer.getData("text/plain") || state.selectedTileId;
  moveTileToTray(id);
}

function moveSelectedToCell(index) {
  if (state.selectedTileId) moveTileToCell(state.selectedTileId, index);
}

function moveTileToCell(id, index) {
  if (!id || state.board[index]) return;
  pushHistory();
  const tile = removeTile(id);
  if (!tile) return;
  state.board[index] = tile;
  state.selectedTileId = null;
  renderTiles();
}

function moveTileToTray(id) {
  if (!id) return;
  pushHistory();
  const tile = removeTile(id);
  if (!tile) return;
  state.tray.push(tile);
  state.selectedTileId = null;
  renderTiles();
}

function removeTile(id) {
  const trayIndex = state.tray.findIndex((tile) => tile.id === id);
  if (trayIndex >= 0) return state.tray.splice(trayIndex, 1)[0];
  const boardIndex = state.board.findIndex((tile) => tile?.id === id);
  if (boardIndex >= 0) {
    const tile = state.board[boardIndex];
    if (tile.locked) return null;
    state.board[boardIndex] = null;
    return tile;
  }
  return null;
}

function pushHistory() {
  state.history.push({
    tray: structuredClone(state.tray),
    board: structuredClone(state.board)
  });
  if (state.history.length > 30) state.history.shift();
}

function undoMove() {
  const last = state.history.pop();
  if (!last) return;
  state.tray = last.tray;
  state.board = last.board;
  renderTiles();
}

function shuffleTray() {
  state.tray = state.tray.sort(() => Math.random() - 0.5);
  renderTiles();
}

function dumpSelected() {
  const id = state.selectedTileId;
  if (!id) {
    showBoardHint("Select a tile before trading in.");
    return;
  }
  pushHistory();
  removeTile(id);
  state.selectedTileId = null;
  state.tray.push(...drawLetters(3).map((letter) => makeTile(letter)));
  state.session.dumps += 1;
  if (state.session.mode === "main") state.session.tilesDrawn += 3;
  renderTiles();
  showBoardHint("Traded in one tile and drew three.");
}

function peel() {
  if (state.tray.length) {
    showBoardHint("Use every tray tile before Take 1.");
    return;
  }
  state.tray.push(...drawLetters(1).map((letter) => makeTile(letter)));
  state.session.peels += 1;
  if (state.session.mode === "main") state.session.tilesDrawn += 1;
  renderTiles();
}

function getBoardScore() {
  const invalidCells = getInvalidCells();
  return state.board.reduce((score, tile, index) => {
    if (!tile) return score;
    if (invalidCells.has(index)) score.invalidTiles += 1;
    else score.validTiles += 1;
    return score;
  }, { validTiles: 0, invalidTiles: 0 });
}

function validateBoard() {
  const words = getBoardWords();
  const invalidCells = getInvalidCells(words);
  words.forEach((word) => {
    word.cells.forEach((cell) => {
      els.board.children[cell].classList.add(invalidCells.has(cell) ? "invalid" : "valid");
    });
  });
}

function getInvalidCells(words = getBoardWords()) {
  const invalidCells = new Set();
  words.forEach((word) => {
    if (!WORD_SET.has(word.text)) word.cells.forEach((cell) => invalidCells.add(cell));
  });
  return invalidCells;
}

function getInvalidWords(words = getBoardWords()) {
  return words
    .filter((word) => !WORD_SET.has(word.text))
    .map((word) => word.text);
}

function getBoardWords() {
  const words = [];
  for (let row = 0; row < BOARD_SIZE; row++) {
    collectLine(words, row * BOARD_SIZE, 1, BOARD_SIZE);
  }
  for (let col = 0; col < BOARD_SIZE; col++) {
    collectLine(words, col, BOARD_SIZE, BOARD_SIZE);
  }
  return words.filter((word) => word.text.length > 1);
}

function collectLine(words, start, step, length) {
  let text = "";
  let cells = [];
  for (let i = 0; i < length; i++) {
    const index = start + i * step;
    const tile = state.board[index];
    if (tile) {
      text += tile.letter;
      cells.push(index);
    } else {
      if (text.length > 1) words.push({ text, cells });
      text = "";
      cells = [];
    }
  }
  if (text.length > 1) words.push({ text, cells });
}

function placeStarterWord(word, row, col, direction, locked = false) {
  [...word].forEach((letter, offset) => {
    const index = direction === "across" ? row * BOARD_SIZE + col + offset : (row + offset) * BOARD_SIZE + col;
    state.board[index] = makeTile(letter, locked);
  });
  renderTiles();
}

function canBuildWord(word, letters) {
  const pool = [...letters];
  return [...word].every((letter) => {
    const index = pool.indexOf(letter);
    if (index < 0) return false;
    pool.splice(index, 1);
    return true;
  });
}

function addMiss(word) {
  state.stats.missedWords = state.stats.missedWords || [];
  if (!state.stats.missedWords.includes(word)) state.stats.missedWords.push(word);
  state.stats.missedWords = state.stats.missedWords.slice(-30);
  saveAll();
}

function showView(view) {
  els.homeView.classList.toggle("hidden", view !== "home");
  els.sessionView.classList.toggle("hidden", view !== "session");
  els.summaryView.classList.toggle("hidden", view !== "summary");
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
  const secs = Math.floor(seconds % 60).toString().padStart(2, "0");
  return `${mins}:${secs}`;
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function importDictionaryFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.addEventListener("load", () => {
    const importedWords = parseDictionaryText(String(reader.result || ""));
    if (!importedWords.length) {
      state.dictionary = {
        name: "Import skipped",
        count: WORD_SET.size,
        source: "built-in"
      };
      renderDictionaryStatus();
      return;
    }

    const words = mergeApprovedWords(importedWords);
    WORD_SET = new Set(words);
    glueWordDataCache = null;
    wordLengthDataCache = null;
    state.dictionary = {
      name: `${file.name} + built-in`,
      count: words.length,
      source: "imported"
    };
    persistDictionary(words, state.dictionary);
    renderDictionaryStatus();
    if (els.board.children.length) renderTiles();
  });
  reader.readAsText(file);
  event.target.value = "";
}

function parseDictionaryText(text) {
  const words = text
    .toUpperCase()
    .split(/[^A-Z]+/)
    .filter(isDictionaryWord);
  return cleanWordList(words);
}

function mergeApprovedWords(words) {
  return cleanWordList([...STARTER_WORDS, ...words]);
}

function cleanWordList(words) {
  return [...new Set(words.map((word) => String(word).toUpperCase()).filter(isDictionaryWord))]
    .sort((a, b) => a.length - b.length || a.localeCompare(b));
}

function isDictionaryWord(word) {
  return /^[A-Z]{2,15}$/.test(word) && !BLOCKED_WORDS.has(word);
}

function persistDictionary(words, meta) {
  try {
    localStorage.setItem(DICTIONARY_STORAGE_KEY, JSON.stringify({ words, meta }));
  } catch {
    state.dictionary = {
      ...meta,
      name: `${meta.name} (not saved)`,
      source: "imported"
    };
  }
}

function resetDictionary() {
  localStorage.removeItem(DICTIONARY_STORAGE_KEY);
  dictionaryState = starterDictionaryState();
  WORD_SET = new Set(dictionaryState.words);
  glueWordDataCache = null;
  wordLengthDataCache = null;
  state.dictionary = dictionaryState.meta;
  renderDictionaryStatus();
  if (els.board.children.length) renderTiles();
}

function loadSettings() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))?.settings || {};
    return normalizeSettings(saved);
  } catch {
    return normalizeSettings();
  }
}

function normalizeSettings(saved = {}) {
  const backendReady = hasLeaderboardBackend();
  const userSetGlobalScores = Boolean(saved.globalScoresUserSet);
  return {
    ...structuredClone(DEFAULT_SETTINGS),
    ...saved,
    globalScores: backendReady && (userSetGlobalScores ? Boolean(saved.globalScores) : true),
    globalScoresUserSet: userSetGlobalScores,
    enabledDrills: {
      ...DEFAULT_SETTINGS.enabledDrills,
      ...(saved.enabledDrills || {})
    }
  };
}

function loadDictionary() {
  try {
    const saved = JSON.parse(localStorage.getItem(DICTIONARY_STORAGE_KEY));
    if (Array.isArray(saved?.words) && saved.words.length) {
      const words = mergeApprovedWords(saved.words);
      return {
        words,
        meta: {
          name: saved.meta?.name || "Imported dictionary + built-in",
          count: words.length,
          source: "imported"
        }
      };
    }
  } catch {
    return starterDictionaryState();
  }
  return starterDictionaryState();
}

function starterDictionaryState() {
  return {
    words: STARTER_WORDS,
    meta: {
      name: "Built-in Scrabble-style list",
      count: STARTER_WORDS.length,
      source: "built-in"
    }
  };
}

function loadStats() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY))?.stats || {};
  } catch {
    return {};
  }
}

function saveAll() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ settings: state.settings, stats: state.stats }));
}
