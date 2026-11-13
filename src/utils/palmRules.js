// Traditional palmistry rule library.
//
// Each rule maps *measured* features (see services/palmAnalysis.js →
// extractFeatures) to a traditional interpretation. Rules never invent
// features: if a line was not detected, rules that depend on it don't fire.
// Texts describe what palmistry tradition *says*; they are not predictions.
//
// Rule shape:
//   { id, category, line, when(features) → boolean, weight, heading:{en,km}, text:{en,km} }

const L = (f, id) => f.lines?.[id] || {};
const seen = (f, id) => !!L(f, id).visible;

export const PALM_RULES = [
  // ------------------------------------------------------- PERSONALITY ---
  {
    id: 'p-head-straight', category: 'personality', line: 'head', weight: 3,
    when: (f) => seen(f, 'head') && L(f, 'head').slope === 'straight',
    heading: { en: 'A straight head line', km: 'ខ្សែប្រាជ្ញាត្រង់' },
    text: {
      en: 'Palmists traditionally link a straight, level head line with logical, structured thinking. It is read as a mind that likes facts, clear plans and step-by-step reasoning before reaching a conclusion.',
      km: 'តាមប្រពៃណីហោរាសាស្ត្របាតដៃ ខ្សែប្រាជ្ញាដែលត្រង់ និងស្មើ ត្រូវបានភ្ជាប់ទៅនឹងការគិតបែបតក្កវិជ្ជា និងមានរបៀបរៀបរយ។ វាត្រូវបានអានថាជាគំនិតដែលចូលចិត្តការពិត ផែនការច្បាស់លាស់ និងការវែកញែកជាជំហានៗ មុននឹងសម្រេចចិត្ត។',
    },
  },
  {
    id: 'p-head-gentle', category: 'personality', line: 'head', weight: 3,
    when: (f) => seen(f, 'head') && L(f, 'head').slope === 'gentle',
    heading: { en: 'A gently sloping head line', km: 'ខ្សែប្រាជ្ញាទេរបន្តិច' },
    text: {
      en: 'A head line that slopes gently toward the lower palm is traditionally read as a balance between logic and imagination — someone who can analyse a problem and still see creative possibilities in it.',
      km: 'ខ្សែប្រាជ្ញាដែលទេចុះបន្តិចទៅផ្នែកខាងក្រោមនៃបាតដៃ តាមប្រពៃណីត្រូវបានអានថាជាតុល្យភាពរវាងតក្កវិជ្ជា និងការស្រមើស្រមៃ — មនុស្សដែលអាចវិភាគបញ្ហា ហើយនៅតែមើលឃើញលទ្ធភាពច្នៃប្រឌិតក្នុងនោះ។',
    },
  },
  {
    id: 'p-head-steep', category: 'personality', line: 'head', weight: 3,
    when: (f) => seen(f, 'head') && L(f, 'head').slope === 'steep',
    heading: { en: 'A steeply sloping head line', km: 'ខ្សែប្រាជ្ញាទេចុះខ្លាំង' },
    text: {
      en: 'A head line that dips steeply toward the base of the palm is the classic sign palmists associate with imagination, intuition and an artistic way of seeing the world.',
      km: 'ខ្សែប្រាជ្ញាដែលទេចុះខ្លាំងទៅគល់បាតដៃ គឺជាសញ្ញាបុរាណដែលហោរាបាតដៃភ្ជាប់ទៅនឹងការស្រមើស្រមៃ វិចារណញាណ និងរបៀបមើលពិភពលោកបែបសិល្បៈ។',
    },
  },
  {
    id: 'p-head-long', category: 'personality', line: 'head', weight: 2,
    when: (f) => seen(f, 'head') && L(f, 'head').length === 'long',
    heading: { en: 'A long head line', km: 'ខ្សែប្រាជ្ញាវែង' },
    text: {
      en: 'Its length across the palm is traditionally read as thoroughness — a tendency to consider many angles and think things through in detail.',
      km: 'ប្រវែងរបស់វាឆ្លងកាត់បាតដៃ តាមប្រពៃណីត្រូវបានអានថាជាភាពល្អិតល្អន់ — ទំនោរពិចារណាលើទិដ្ឋភាពជាច្រើន និងគិតឱ្យបានលម្អិត។',
    },
  },
  {
    id: 'p-head-short', category: 'personality', line: 'head', weight: 2,
    when: (f) => seen(f, 'head') && L(f, 'head').length === 'short',
    heading: { en: 'A shorter head line', km: 'ខ្សែប្រាជ្ញាខ្លី' },
    text: {
      en: 'A shorter head line is traditionally associated with quick, decisive thinking — preferring action and practical results over long deliberation.',
      km: 'ខ្សែប្រាជ្ញាខ្លី តាមប្រពៃណីត្រូវបានភ្ជាប់ទៅនឹងការគិតរហ័ស និងម៉ឺងម៉ាត់ — ចូលចិត្តសកម្មភាព និងលទ្ធផលជាក់ស្តែង ជាងការពិចារណាយូរ។',
    },
  },
  {
    id: 'p-head-life-joined', category: 'personality', line: 'head', weight: 2,
    when: (f) => seen(f, 'head') && seen(f, 'life') && L(f, 'head').joinedWithLife,
    heading: { en: 'Head and life lines begin together', km: 'ខ្សែប្រាជ្ញា និងខ្សែជីវិតចាប់ផ្តើមជាមួយគ្នា' },
    text: {
      en: 'Where the head and life lines start joined, palmists traditionally see a careful, considerate nature — someone who likes to understand a situation before stepping into it.',
      km: 'នៅពេលខ្សែប្រាជ្ញា និងខ្សែជីវិតចាប់ផ្តើមភ្ជាប់គ្នា ហោរាបាតដៃតាមប្រពៃណីមើលឃើញចរិតប្រុងប្រយ័ត្ន និងយកចិត្តទុកដាក់ — មនុស្សដែលចូលចិត្តយល់ពីស្ថានការណ៍មុននឹងចូលរួម។',
    },
  },
  {
    id: 'p-head-life-separate', category: 'personality', line: 'head', weight: 2,
    when: (f) => seen(f, 'head') && seen(f, 'life') && !L(f, 'head').joinedWithLife,
    heading: { en: 'Head and life lines begin apart', km: 'ខ្សែប្រាជ្ញា និងខ្សែជីវិតចាប់ផ្តើមដាច់ពីគ្នា' },
    text: {
      en: 'A gap between the start of the head and life lines is traditionally read as independence and a willingness to take the first step without waiting for permission.',
      km: 'គម្លាតរវាងចំណុចចាប់ផ្តើមនៃខ្សែប្រាជ្ញា និងខ្សែជីវិត តាមប្រពៃណីត្រូវបានអានថាជាឯករាជ្យភាព និងឆន្ទៈក្នុងការបោះជំហានដំបូងដោយមិនរង់ចាំការអនុញ្ញាត។',
    },
  },
  {
    id: 'p-life-wide', category: 'personality', line: 'life', weight: 2,
    when: (f) => seen(f, 'life') && L(f, 'life').curvature === 'wide',
    heading: { en: 'A wide, sweeping life line', km: 'ខ្សែជីវិតកោងធំទូលាយ' },
    text: {
      en: 'A life line that sweeps widely into the palm is traditionally linked with enthusiasm and outgoing energy. (In palmistry the life line is said to describe vitality and approach to life — not how long a life will be.)',
      km: 'ខ្សែជីវិតដែលកោងទូលាយចូលក្នុងបាតដៃ តាមប្រពៃណីត្រូវបានភ្ជាប់ទៅនឹងភាពរីករាយ និងថាមពលសកម្ម។ (ក្នុងហោរាសាស្ត្របាតដៃ ខ្សែជីវិតត្រូវបាននិយាយថាពិពណ៌នាអំពីភាពរស់រវើក និងរបៀបរស់នៅ — មិនមែនរយៈពេលនៃជីវិតទេ។)',
    },
  },
  {
    id: 'p-life-close', category: 'personality', line: 'life', weight: 2,
    when: (f) => seen(f, 'life') && L(f, 'life').curvature === 'close',
    heading: { en: 'A life line close to the thumb', km: 'ខ្សែជីវិតនៅជិតមេដៃ' },
    text: {
      en: 'A life line that hugs the thumb is traditionally read as a calm, reserved temperament that values comfort, routine and close circles.',
      km: 'ខ្សែជីវិតដែលនៅជិតមេដៃ តាមប្រពៃណីត្រូវបានអានថាជាចរិតស្ងប់ស្ងាត់ និងសង្រួម ដែលឱ្យតម្លៃលើភាពកក់ក្តៅ ទម្លាប់ និងរង្វង់មិត្តភក្តិជិតស្និទ្ធ។',
    },
  },
  {
    id: 'p-life-gentle', category: 'personality', line: 'life', weight: 1,
    when: (f) => seen(f, 'life') && L(f, 'life').curvature === 'gentle',
    heading: { en: 'A balanced life-line arc', km: 'ខ្សែជីវិតកោងមានតុល្យភាព' },
    text: {
      en: 'A moderately curved life line is traditionally read as a steady temperament — able to be sociable without needing constant activity.',
      km: 'ខ្សែជីវិតដែលកោងមធ្យម តាមប្រពៃណីត្រូវបានអានថាជាចរិតនឹងនរ — អាចរួសរាយរាក់ទាក់ ដោយមិនចាំបាច់មានសកម្មភាពជានិច្ច។',
    },
  },
  {
    id: 'p-heart-curved', category: 'personality', line: 'heart', weight: 1,
    when: (f) => seen(f, 'heart') && L(f, 'heart').curvature === 'curved',
    heading: { en: 'An expressive heart line', km: 'ខ្សែបេះដូងបង្ហាញអារម្មណ៍' },
    text: {
      en: 'A noticeably curved heart line is traditionally associated with warmth and openly expressed feelings.',
      km: 'ខ្សែបេះដូងដែលកោងគួរឱ្យកត់សម្គាល់ តាមប្រពៃណីត្រូវបានភ្ជាប់ទៅនឹងភាពកក់ក្តៅ និងការបង្ហាញអារម្មណ៍ដោយបើកចំហ។',
    },
  },
  {
    id: 'p-heart-straight', category: 'personality', line: 'heart', weight: 1,
    when: (f) => seen(f, 'heart') && L(f, 'heart').curvature === 'straight',
    heading: { en: 'A composed heart line', km: 'ខ្សែបេះដូងស្ងប់ស្ងាត់' },
    text: {
      en: 'A straighter heart line is traditionally read as emotional composure — feelings that run deep but are shared selectively.',
      km: 'ខ្សែបេះដូងដែលត្រង់ តាមប្រពៃណីត្រូវបានអានថាជាការគ្រប់គ្រងអារម្មណ៍បានល្អ — អារម្មណ៍ជ្រាលជ្រៅ ប៉ុន្តែចែករំលែកតែជាមួយមនុស្សដែលបានជ្រើសរើស។',
    },
  },
  {
    id: 'p-head-breaks', category: 'personality', line: 'head', weight: 1,
    when: (f) => seen(f, 'head') && L(f, 'head').breaks >= 2,
    heading: { en: 'Breaks along the head line', km: 'ការដាច់តាមខ្សែប្រាជ្ញា' },
    text: {
      en: 'Gaps detected along the head line are traditionally read as changes of direction in interests or ways of thinking.',
      km: 'ចន្លោះដាច់ដែលរកឃើញតាមខ្សែប្រាជ្ញា តាមប្រពៃណីត្រូវបានអានថាជាការផ្លាស់ប្តូរទិសដៅនៃចំណាប់អារម្មណ៍ ឬរបៀបគិត។',
    },
  },

  // -------------------------------------------------------------- LOVE ---
  {
    id: 'l-heart-index', category: 'love', line: 'heart', weight: 3,
    when: (f) => seen(f, 'heart') && L(f, 'heart').endsAt === 'index',
    heading: { en: 'Heart line ends below the index finger', km: 'ខ្សែបេះដូងបញ្ចប់នៅក្រោមម្រាមចង្អុល' },
    text: {
      en: 'A heart line reaching toward the index finger (the "Mount of Jupiter" — the small raised pad of skin at the base of the index finger) is traditionally read as idealism in love — high standards, loyalty, and a wish for a partner who is also a friend.',
      km: 'ខ្សែបេះដូងដែលលាតដល់ម្រាមចង្អុល ("ទួលព្រហស្បតិ៍" — ផ្នែកសាច់ប៉ោងតូចនៅគល់ម្រាមចង្អុល) តាមប្រពៃណីត្រូវបានអានថាជាឧត្តមគតិក្នុងស្នេហា — ស្តង់ដារខ្ពស់ ភាពស្មោះត្រង់ និងបំណងចង់បានដៃគូដែលជាមិត្តផងដែរ។',
    },
  },
  {
    id: 'l-heart-between', category: 'love', line: 'heart', weight: 3,
    when: (f) => seen(f, 'heart') && L(f, 'heart').endsAt === 'between',
    heading: { en: 'Heart line ends between index and middle fingers', km: 'ខ្សែបេះដូងបញ្ចប់នៅចន្លោះម្រាមចង្អុល និងម្រាមកណ្តាល' },
    text: {
      en: 'Ending between the index and middle fingers is often called the "balanced" heart line: palmists read it as warmth combined with realism — caring deeply while keeping both feet on the ground.',
      km: 'ការបញ្ចប់នៅចន្លោះម្រាមចង្អុល និងម្រាមកណ្តាល ត្រូវបានហៅថាខ្សែបេះដូង "មានតុល្យភាព"៖ ហោរាបាតដៃអានវាថាជាភាពកក់ក្តៅរួមជាមួយភាពប្រាកដនិយម — ស្រឡាញ់យ៉ាងជ្រាលជ្រៅ ខណៈនៅតែមានស្មារតីច្បាស់លាស់។',
    },
  },
  {
    id: 'l-heart-middle', category: 'love', line: 'heart', weight: 3,
    when: (f) => seen(f, 'heart') && L(f, 'heart').endsAt === 'middle',
    heading: { en: 'Heart line ends below the middle finger', km: 'ខ្សែបេះដូងបញ្ចប់នៅក្រោមម្រាមកណ្តាល' },
    text: {
      en: 'A heart line that ends beneath the middle finger (the "Mount of Saturn" — the small raised pad of skin at the base of the middle finger) is traditionally read as a direct, action-oriented way of loving — showing care through deeds more than words.',
      km: 'ខ្សែបេះដូងដែលបញ្ចប់នៅក្រោមម្រាមកណ្តាល ("ទួលសៅរ៍" — ផ្នែកសាច់ប៉ោងតូចនៅគល់ម្រាមកណ្តាល) តាមប្រពៃណីត្រូវបានអានថាជារបៀបស្រឡាញ់ដោយផ្ទាល់ និងផ្តោតលើសកម្មភាព — បង្ហាញការយកចិត្តទុកដាក់តាមរយៈទង្វើច្រើនជាងពាក្យសម្តី។',
    },
  },
  {
    id: 'l-heart-curved', category: 'love', line: 'heart', weight: 2,
    when: (f) => seen(f, 'heart') && L(f, 'heart').curvature === 'curved',
    heading: { en: 'A curved heart line', km: 'ខ្សែបេះដូងកោង' },
    text: {
      en: 'Its curve is traditionally linked with emotional openness — someone who expresses affection readily and values romance.',
      km: 'ភាពកោងរបស់វា តាមប្រពៃណីត្រូវបានភ្ជាប់ទៅនឹងការបើកចំហផ្លូវចិត្ត — មនុស្សដែលបង្ហាញក្តីស្រឡាញ់បានងាយ និងឱ្យតម្លៃលើមនោសញ្ចេតនា។',
    },
  },
  {
    id: 'l-heart-straight', category: 'love', line: 'heart', weight: 2,
    when: (f) => seen(f, 'heart') && L(f, 'heart').curvature === 'straight',
    heading: { en: 'A straight heart line', km: 'ខ្សែបេះដូងត្រង់' },
    text: {
      en: 'A straighter heart line is traditionally read as a thoughtful, private emotional style — affection that is steady and sincere rather than showy.',
      km: 'ខ្សែបេះដូងដែលត្រង់ តាមប្រពៃណីត្រូវបានអានថាជារបៀបអារម្មណ៍ដែលគិតពិចារណា និងឯកជន — ក្តីស្រឡាញ់ដែលនឹងនរ និងស្មោះស្ម័គ្រ ជាជាងការបង្អួត។',
    },
  },
  {
    id: 'l-heart-gentle', category: 'love', line: 'heart', weight: 1,
    when: (f) => seen(f, 'heart') && L(f, 'heart').curvature === 'gentle',
    heading: { en: 'A gently curved heart line', km: 'ខ្សែបេះដូងកោងបន្តិច' },
    text: {
      en: 'A gentle curve is traditionally read as a mix of openness and discretion — warm with people you trust, more reserved with everyone else.',
      km: 'ភាពកោងបន្តិច តាមប្រពៃណីត្រូវបានអានថាជាការលាយបញ្ចូលគ្នារវាងការបើកចំហ និងការប្រុងប្រយ័ត្ន — កក់ក្តៅជាមួយមនុស្សដែលអ្នកទុកចិត្ត និងសង្រួមជាមួយអ្នកដទៃ។',
    },
  },
  {
    id: 'l-heart-long', category: 'love', line: 'heart', weight: 2,
    when: (f) => seen(f, 'heart') && L(f, 'heart').length === 'long',
    heading: { en: 'A long heart line', km: 'ខ្សែបេះដូងវែង' },
    text: {
      en: 'A long heart line is traditionally associated with generosity and devotion in close relationships.',
      km: 'ខ្សែបេះដូងវែង តាមប្រពៃណីត្រូវបានភ្ជាប់ទៅនឹងចិត្តសប្បុរស និងការលះបង់ក្នុងទំនាក់ទំនងជិតស្និទ្ធ។',
    },
  },
  {
    id: 'l-heart-short', category: 'love', line: 'heart', weight: 2,
    when: (f) => seen(f, 'heart') && L(f, 'heart').length === 'short',
    heading: { en: 'A shorter heart line', km: 'ខ្សែបេះដូងខ្លី' },
    text: {
      en: 'A shorter heart line is traditionally read as independence in love — valuing personal space and a partner who respects it.',
      km: 'ខ្សែបេះដូងខ្លី តាមប្រពៃណីត្រូវបានអានថាជាឯករាជ្យភាពក្នុងស្នេហា — ឱ្យតម្លៃលើលំហផ្ទាល់ខ្លួន និងដៃគូដែលគោរពវា។',
    },
  },
  {
    id: 'l-heart-rises', category: 'love', line: 'heart', weight: 1,
    when: (f) => seen(f, 'heart') && L(f, 'heart').risesTowardFingers,
    heading: { en: 'Heart line rises toward the fingers', km: 'ខ្សែបេះដូងឡើងទៅរកម្រាមដៃ' },
    text: {
      en: 'A heart line that rises as it crosses the palm is traditionally read as optimism and hopefulness in relationships.',
      km: 'ខ្សែបេះដូងដែលឡើងខ្ពស់ពេលឆ្លងកាត់បាតដៃ តាមប្រពៃណីត្រូវបានអានថាជាសុទិដ្ឋិនិយម និងក្តីសង្ឃឹមក្នុងទំនាក់ទំនង។',
    },
  },
  {
    id: 'l-heart-breaks', category: 'love', line: 'heart', weight: 1,
    when: (f) => seen(f, 'heart') && L(f, 'heart').breaks >= 1,
    heading: { en: 'Breaks in the heart line', km: 'ការដាច់ក្នុងខ្សែបេះដូង' },
    text: {
      en: 'Interruptions along the heart line are traditionally read as distinct emotional chapters — periods of growth that shape how you love.',
      km: 'ការដាច់តាមខ្សែបេះដូង តាមប្រពៃណីត្រូវបានអានថាជាជំពូកអារម្មណ៍ផ្សេងៗ — រយៈពេលនៃការលូតលាស់ដែលកំណត់របៀបដែលអ្នកស្រឡាញ់។',
    },
  },
  {
    id: 'l-heart-faint', category: 'love', line: 'heart', weight: 1,
    when: (f) => seen(f, 'heart') && L(f, 'heart').visibility === 'faint',
    heading: { en: 'A faint heart line', km: 'ខ្សែបេះដូងស្រាល' },
    text: {
      en: 'A lighter heart line is traditionally read as sensitivity — feelings that take time to surface and are shared once trust is built.',
      km: 'ខ្សែបេះដូងស្រាល តាមប្រពៃណីត្រូវបានអានថាជាភាពរសើប — អារម្មណ៍ដែលត្រូវការពេលវេលាដើម្បីបង្ហាញ ហើយត្រូវបានចែករំលែកនៅពេលមានការទុកចិត្ត។',
    },
  },

  // ------------------------------------------------------------ CAREER ---
  {
    id: 'c-head-straight', category: 'career', line: 'head', weight: 3,
    when: (f) => seen(f, 'head') && L(f, 'head').slope === 'straight',
    heading: { en: 'Analytical head line', km: 'ខ្សែប្រាជ្ញាបែបវិភាគ' },
    text: {
      en: 'Traditional palmistry associates a straight head line with work that rewards analysis and precision — fields such as science, engineering, finance, law or operations.',
      km: 'ហោរាសាស្ត្របាតដៃប្រពៃណីភ្ជាប់ខ្សែប្រាជ្ញាត្រង់ទៅនឹងការងារដែលផ្តល់តម្លៃដល់ការវិភាគ និងភាពជាក់លាក់ — ដូចជាវិទ្យាសាស្ត្រ វិស្វកម្ម ហិរញ្ញវត្ថុ ច្បាប់ ឬប្រតិបត្តិការ។',
    },
  },
  {
    id: 'c-head-gentle', category: 'career', line: 'head', weight: 3,
    when: (f) => seen(f, 'head') && L(f, 'head').slope === 'gentle',
    heading: { en: 'Balanced head line', km: 'ខ្សែប្រាជ្ញាមានតុល្យភាព' },
    text: {
      en: 'A gently sloping head line is traditionally read as suited to roles that mix structure with creativity — teaching, product design, marketing, architecture or research.',
      km: 'ខ្សែប្រាជ្ញាដែលទេបន្តិច តាមប្រពៃណីត្រូវបានអានថាសមស្របនឹងតួនាទីដែលលាយរចនាសម្ព័ន្ធជាមួយការច្នៃប្រឌិត — ការបង្រៀន ការរចនាផលិតផល ទីផ្សារ ស្ថាបត្យកម្ម ឬការស្រាវជ្រាវ។',
    },
  },
  {
    id: 'c-head-steep', category: 'career', line: 'head', weight: 3,
    when: (f) => seen(f, 'head') && L(f, 'head').slope === 'steep',
    heading: { en: 'Creative head line', km: 'ខ្សែប្រាជ្ញាច្នៃប្រឌិត' },
    text: {
      en: 'Palmists traditionally connect a steeply sloping head line with creative work — writing, art, music, design, or any role where original ideas matter most.',
      km: 'ហោរាបាតដៃតាមប្រពៃណីភ្ជាប់ខ្សែប្រាជ្ញាដែលទេខ្លាំងទៅនឹងការងារច្នៃប្រឌិត — ការសរសេរ សិល្បៈ តន្ត្រី ការរចនា ឬតួនាទីណាដែលគំនិតថ្មីមានសារៈសំខាន់បំផុត។',
    },
  },
  {
    id: 'c-head-long', category: 'career', line: 'head', weight: 2,
    when: (f) => seen(f, 'head') && L(f, 'head').length === 'long',
    heading: { en: 'Strategic reach', km: 'ការគិតបែបយុទ្ធសាស្ត្រ' },
    text: {
      en: 'A long head line is traditionally read as an aptitude for long-range planning and complex projects.',
      km: 'ខ្សែប្រាជ្ញាវែង តាមប្រពៃណីត្រូវបានអានថាជាសមត្ថភាពក្នុងការរៀបចំផែនការរយៈពេលវែង និងគម្រោងស្មុគស្មាញ។',
    },
  },
  {
    id: 'c-head-short', category: 'career', line: 'head', weight: 2,
    when: (f) => seen(f, 'head') && L(f, 'head').length === 'short',
    heading: { en: 'Fast execution', km: 'ការអនុវត្តរហ័ស' },
    text: {
      en: 'A shorter head line is traditionally read as a talent for fast, hands-on execution — getting things done rather than over-planning.',
      km: 'ខ្សែប្រាជ្ញាខ្លី តាមប្រពៃណីត្រូវបានអានថាជាទេពកោសល្យក្នុងការអនុវត្តរហ័ស និងដោយផ្ទាល់ — បំពេញការងារជាជាងរៀបចំផែនការច្រើនពេក។',
    },
  },
  {
    id: 'c-fate-clear', category: 'career', line: 'fate', weight: 3,
    when: (f) => seen(f, 'fate') && ['clear', 'moderate'].includes(L(f, 'fate').visibility),
    heading: { en: 'A visible fate line', km: 'ខ្សែវាសនាដែលមើលឃើញ' },
    text: {
      en: 'A clearly visible fate line is traditionally read as a strong sense of direction and purpose in work — a feeling of following a chosen path.',
      km: 'ខ្សែវាសនាដែលមើលឃើញច្បាស់ តាមប្រពៃណីត្រូវបានអានថាជាការយល់ដឹងច្បាស់អំពីទិសដៅ និងគោលបំណងក្នុងការងារ — អារម្មណ៍ថាកំពុងដើរតាមផ្លូវដែលបានជ្រើសរើស។',
    },
  },
  {
    id: 'c-fate-faint', category: 'career', line: 'fate', weight: 3,
    when: (f) => !seen(f, 'fate') || L(f, 'fate').visibility === 'faint',
    heading: { en: 'A faint or absent fate line', km: 'ខ្សែវាសនាស្រាល ឬមិនមាន' },
    text: {
      en: 'Many palms show little or no fate line. Traditionally this is read not as a lack of success but as a self-made, flexible path — someone who shapes their own direction and may enjoy several different careers.',
      km: 'បាតដៃជាច្រើនបង្ហាញខ្សែវាសនាតិចតួច ឬគ្មានសោះ។ តាមប្រពៃណី នេះមិនត្រូវបានអានថាជាការខ្វះភាពជោគជ័យទេ ប៉ុន្តែជាផ្លូវដែលខ្លួនឯងកសាង និងបត់បែន — មនុស្សដែលកំណត់ទិសដៅដោយខ្លួនឯង ហើយអាចរីករាយនឹងអាជីពផ្សេងៗគ្នាជាច្រើន។',
    },
  },
  {
    id: 'c-fate-wrist', category: 'career', line: 'fate', weight: 2,
    when: (f) => seen(f, 'fate') && L(f, 'fate').origin === 'wrist',
    heading: { en: 'Fate line rising from the wrist', km: 'ខ្សែវាសនាចាប់ផ្តើមពីកដៃ' },
    text: {
      en: 'A fate line starting near the wrist is traditionally read as an early sense of vocation — knowing from a young age what kind of work feels meaningful.',
      km: 'ខ្សែវាសនាដែលចាប់ផ្តើមជិតកដៃ តាមប្រពៃណីត្រូវបានអានថាជាការដឹងពីអាជីពតាំងពីដំបូង — ដឹងតាំងពីក្មេងថាការងារបែបណាដែលមានអត្ថន័យ។',
    },
  },
  {
    id: 'c-fate-later', category: 'career', line: 'fate', weight: 2,
    when: (f) => seen(f, 'fate') && ['lower', 'middle'].includes(L(f, 'fate').origin),
    heading: { en: 'Fate line starting higher up', km: 'ខ្សែវាសនាចាប់ផ្តើមខ្ពស់' },
    text: {
      en: 'When the fate line begins higher on the palm, palmists traditionally say the sense of direction grows with experience — a path that becomes clearer over time.',
      km: 'នៅពេលខ្សែវាសនាចាប់ផ្តើមខ្ពស់នៅលើបាតដៃ ហោរាបាតដៃតាមប្រពៃណីនិយាយថា ការយល់ដឹងអំពីទិសដៅរីកចម្រើនតាមបទពិសោធន៍ — ផ្លូវដែលកាន់តែច្បាស់តាមពេលវេលា។',
    },
  },
  {
    id: 'c-fate-breaks', category: 'career', line: 'fate', weight: 1,
    when: (f) => seen(f, 'fate') && L(f, 'fate').breaks >= 1,
    heading: { en: 'Breaks in the fate line', km: 'ការដាច់ក្នុងខ្សែវាសនា' },
    text: {
      en: 'Breaks in the fate line are traditionally read as changes of role, field or direction — turning points rather than setbacks.',
      km: 'ការដាច់ក្នុងខ្សែវាសនា តាមប្រពៃណីត្រូវបានអានថាជាការផ្លាស់ប្តូរតួនាទី វិស័យ ឬទិសដៅ — ចំណុចប្រែប្រួល មិនមែនជាឧបសគ្គទេ។',
    },
  },

  // ----------------------------------------------------------- FORTUNE ---
  {
    id: 'f-life-long', category: 'fortune', line: 'life', weight: 3,
    when: (f) => seen(f, 'life') && L(f, 'life').length === 'long',
    heading: { en: 'A long, continuous life line', km: 'ខ្សែជីវិតវែង និងជាប់លាប់' },
    text: {
      en: 'Palmists traditionally read a long life line as resilience and steady energy for pursuing opportunities. (Tradition is explicit that it does not measure lifespan.)',
      km: 'ហោរាបាតដៃតាមប្រពៃណីអានខ្សែជីវិតវែងថាជាភាពធន់ និងថាមពលនឹងនរសម្រាប់ស្វែងរកឱកាស។ (ប្រពៃណីបញ្ជាក់ច្បាស់ថា វាមិនវាស់រយៈពេលនៃជីវិតទេ។)',
    },
  },
  {
    id: 'f-life-short', category: 'fortune', line: 'life', weight: 2,
    when: (f) => seen(f, 'life') && L(f, 'life').length !== 'long',
    heading: { en: 'A shorter visible life line', km: 'ខ្សែជីវិតដែលមើលឃើញខ្លី' },
    text: {
      en: 'Only part of the life line was clearly visible. Traditional palmists stress this says nothing about lifespan; it is read instead as energy that comes in focused bursts.',
      km: 'មានតែផ្នែកខ្លះនៃខ្សែជីវិតប៉ុណ្ណោះដែលមើលឃើញច្បាស់។ ហោរាបាតដៃប្រពៃណីសង្កត់ធ្ងន់ថា នេះមិននិយាយអ្វីអំពីរយៈពេលជីវិតទេ ផ្ទុយទៅវិញវាត្រូវបានអានថាជាថាមពលដែលមកជាដំណាក់កាលផ្តោតអារម្មណ៍។',
    },
  },
  {
    id: 'f-fate-long', category: 'fortune', line: 'fate', weight: 3,
    when: (f) => seen(f, 'fate') && L(f, 'fate').length === 'long' && L(f, 'fate').visibility !== 'faint',
    heading: { en: 'A long fate line', km: 'ខ្សែវាសនាវែង' },
    text: {
      en: 'A long fate line is traditionally considered a sign of steady progress — fortune built gradually through consistent effort.',
      km: 'ខ្សែវាសនាវែង តាមប្រពៃណីត្រូវបានចាត់ទុកថាជាសញ្ញានៃការរីកចម្រើនជាលំដាប់ — សំណាងដែលកសាងបន្តិចម្តងៗតាមរយៈការខិតខំប្រឹងប្រែងជាប់លាប់។',
    },
  },
  {
    id: 'f-fate-absent', category: 'fortune', line: 'fate', weight: 2,
    when: (f) => !seen(f, 'fate') || L(f, 'fate').visibility === 'faint',
    heading: { en: 'Fortune without a strong fate line', km: 'សំណាងដោយគ្មានខ្សែវាសនាច្បាស់' },
    text: {
      en: 'Traditional readers say that without a strong fate line, fortune is less "written" and more chosen — luck tends to follow initiative and timing.',
      km: 'អ្នកមើលបាតដៃតាមប្រពៃណីនិយាយថា បើគ្មានខ្សែវាសនាច្បាស់ សំណាងមិនសូវ "ត្រូវបានសរសេរ" ទេ ប៉ុន្តែត្រូវបានជ្រើសរើសច្រើនជាង — សំណាងតែងតែដើរតាមគំនិតផ្តួចផ្តើម និងពេលវេលា។',
    },
  },
  {
    id: 'f-heart-rises', category: 'fortune', line: 'heart', weight: 1,
    when: (f) => seen(f, 'heart') && L(f, 'heart').risesTowardFingers,
    heading: { en: 'An upward-reaching heart line', km: 'ខ្សែបេះដូងលាតឡើងលើ' },
    text: {
      en: 'A heart line that rises toward the fingers is traditionally linked with an optimistic outlook — which palmists say attracts good opportunities through people.',
      km: 'ខ្សែបេះដូងដែលឡើងទៅរកម្រាមដៃ តាមប្រពៃណីត្រូវបានភ្ជាប់ទៅនឹងទស្សនៈសុទិដ្ឋិនិយម — ដែលហោរាបាតដៃនិយាយថាទាក់ទាញឱកាសល្អៗតាមរយៈមនុស្ស។',
    },
  },
  {
    id: 'f-joined-caution', category: 'fortune', line: 'head', weight: 1,
    when: (f) => seen(f, 'head') && seen(f, 'life') && L(f, 'head').joinedWithLife,
    heading: { en: 'Considered decisions', km: 'ការសម្រេចចិត្តដោយពិចារណា' },
    text: {
      en: 'Joined head and life lines are traditionally read as caution with money and risk — fortune protected by careful decisions.',
      km: 'ខ្សែប្រាជ្ញា និងខ្សែជីវិតដែលភ្ជាប់គ្នា តាមប្រពៃណីត្រូវបានអានថាជាការប្រុងប្រយ័ត្នជាមួយលុយកាក់ និងហានិភ័យ — សំណាងដែលត្រូវបានការពារដោយការសម្រេចចិត្តប្រកបដោយការប្រុងប្រយ័ត្ន។',
    },
  },
  {
    id: 'f-many-breaks', category: 'fortune', line: null, weight: 1,
    when: (f) => ['life', 'head', 'heart', 'fate'].reduce((s, id) => s + (seen(f, id) ? L(f, id).breaks || 0 : 0), 0) >= 4,
    heading: { en: 'A palm of many chapters', km: 'បាតដៃនៃជំពូកជាច្រើន' },
    text: {
      en: 'Several interruptions across the major lines are traditionally read as a life of many chapters — fortune that arrives through change and reinvention.',
      km: 'ការដាច់ជាច្រើនលើខ្សែសំខាន់ៗ តាមប្រពៃណីត្រូវបានអានថាជាជីវិតនៃជំពូកជាច្រើន — សំណាងដែលមកតាមរយៈការផ្លាស់ប្តូរ និងការកែប្រែខ្លួនឡើងវិញ។',
    },
  },

  // ------------------------------------------------ extra combinations ---
  {
    id: 'p-fingers-long', category: 'personality', line: null, weight: 2,
    when: (f) => (f.palmShape?.fingerRatio ?? 0) >= 1.1,
    heading: { en: 'Long fingers', km: 'ម្រាមដៃវែង' },
    text: {
      en: 'Fingers that are long compared with the palm are traditionally read as patience and an eye for detail — someone who enjoys getting the small things right.',
      km: 'ម្រាមដៃដែលវែងបើធៀបនឹងបាតដៃ តាមប្រពៃណីត្រូវបានអានថាជាការអត់ធ្មត់ និងការយកចិត្តទុកដាក់លើព័ត៌មានលម្អិត — មនុស្សដែលចូលចិត្តធ្វើរឿងតូចៗឱ្យបានត្រឹមត្រូវ។',
    },
  },
  {
    id: 'p-fingers-short', category: 'personality', line: null, weight: 2,
    when: (f) => f.palmShape && f.palmShape.fingerRatio <= 0.9,
    heading: { en: 'Shorter fingers', km: 'ម្រាមដៃខ្លី' },
    text: {
      en: 'Fingers that are short compared with the palm are traditionally read as a big-picture thinker — quick to grasp the whole idea and impatient with too much detail.',
      km: 'ម្រាមដៃដែលខ្លីបើធៀបនឹងបាតដៃ តាមប្រពៃណីត្រូវបានអានថាជាអ្នកគិតមើលរូបភាពធំ — យល់គំនិតទាំងមូលបានលឿន ហើយមិនសូវចូលចិត្តលម្អិតពេក។',
    },
  },
  {
    id: 'l-heart-clear', category: 'love', line: 'heart', weight: 2,
    when: (f) => seen(f, 'heart') && L(f, 'heart').visibility === 'clear',
    heading: { en: 'A deep, clear heart line', km: 'ខ្សែបេះដូងជ្រៅ និងច្បាស់' },
    text: {
      en: 'A heart line that shows deeply and clearly is traditionally read as emotional honesty — when you care about someone, it is hard for you to hide it.',
      km: 'ខ្សែបេះដូងដែលឃើញជ្រៅ និងច្បាស់ តាមប្រពៃណីត្រូវបានអានថាជាភាពស្មោះត្រង់ផ្នែកអារម្មណ៍ — ពេលអ្នកស្រឡាញ់នរណាម្នាក់ អ្នកពិបាកលាក់វាណាស់។',
    },
  },
  {
    id: 'c-fate-to-fingers', category: 'career', line: 'fate', weight: 2,
    when: (f) => seen(f, 'fate') && L(f, 'fate').endsNear === 'fingers',
    heading: { en: 'Fate line climbs toward the fingers', km: 'ខ្សែវាសនាឡើងទៅដល់ម្រាមដៃ' },
    text: {
      en: 'A fate line that keeps climbing past the heart line is traditionally read as ambition that keeps growing with age — goals that stay active well into later life.',
      km: 'ខ្សែវាសនាដែលឡើងហួសខ្សែបេះដូង តាមប្រពៃណីត្រូវបានអានថាជាមហិច្ឆតាដែលកាន់តែរីកចម្រើនតាមអាយុ — គោលដៅដែលនៅតែសកម្មរហូតដល់វ័យចាស់។',
    },
  },
  {
    id: 'c-fate-heart', category: 'career', line: 'fate', weight: 2,
    when: (f) => seen(f, 'fate') && L(f, 'fate').endsNear === 'heartLine',
    heading: { en: 'Fate line stops at the heart line', km: 'ខ្សែវាសនាឈប់នៅខ្សែបេះដូង' },
    text: {
      en: 'Where the fate line ends near the heart line, palmists traditionally say later career choices are guided by the heart — by people, passion and what feels meaningful.',
      km: 'នៅពេលខ្សែវាសនាបញ្ចប់ជិតខ្សែបេះដូង ហោរាបាតដៃនិយាយថា ការជ្រើសរើសអាជីពនៅពេលក្រោយត្រូវបានដឹកនាំដោយបេះដូង — ដោយមនុស្ស ចំណង់ចំណូលចិត្ត និងអ្វីដែលមានអត្ថន័យ។',
    },
  },
  {
    id: 'c-head-joined', category: 'career', line: 'head', weight: 1,
    when: (f) => seen(f, 'head') && seen(f, 'life') && L(f, 'head').joinedWithLife,
    heading: { en: 'A careful planner at work', km: 'អ្នករៀបចំផែនការប្រុងប្រយ័ត្នក្នុងការងារ' },
    text: {
      en: 'Head and life lines that start together are traditionally linked at work with preparation — you tend to do your homework before a big move.',
      km: 'ខ្សែប្រាជ្ញា និងខ្សែជីវិតដែលចាប់ផ្តើមជាមួយគ្នា តាមប្រពៃណីត្រូវបានភ្ជាប់ក្នុងការងារទៅនឹងការត្រៀមខ្លួន — អ្នកតែងតែសិក្សាឱ្យបានច្បាស់មុនពេលធ្វើការសម្រេចចិត្តធំ។',
    },
  },
  {
    id: 'f-clear-lines', category: 'fortune', line: null, weight: 2,
    when: (f) => ['life', 'head', 'heart', 'fate'].filter((id) => L(f, id).visibility === 'clear').length >= 3,
    heading: { en: 'A clearly marked palm', km: 'បាតដៃមានខ្សែច្បាស់' },
    text: {
      en: 'When most major lines are deep and clear, palmists traditionally read it as focused energy — luck that comes from knowing what you want and going after it.',
      km: 'នៅពេលខ្សែសំខាន់ៗភាគច្រើនជ្រៅ និងច្បាស់ ហោរាបាតដៃអានវាថាជាថាមពលដែលផ្តោត — សំណាងដែលមកពីការដឹងថាខ្លួនចង់បានអ្វី ហើយខិតខំដើម្បីវា។',
    },
  },
  {
    id: 'f-faint-lines', category: 'fortune', line: null, weight: 1,
    when: (f) => ['life', 'head', 'heart'].filter((id) => L(f, id).visibility === 'faint').length >= 2,
    heading: { en: 'A softly marked palm', km: 'បាតដៃមានខ្សែស្រាល' },
    text: {
      en: 'Lighter, finer lines are traditionally read as sensitivity to surroundings — good fortune tends to follow when you are in a calm, supportive place.',
      km: 'ខ្សែស្រាល និងល្អិត តាមប្រពៃណីត្រូវបានអានថាជាភាពរសើបចំពោះបរិយាកាស — សំណាងល្អច្រើនតែមកនៅពេលអ្នកនៅកន្លែងស្ងប់ និងមានការគាំទ្រ។',
    },
  },
];

/** Element (palm-shape) themes used across categories. */
export const ELEMENT_THEMES = {
  earth: {
    name: { en: 'Earth hand', km: 'ដៃធាតុដី' },
    shape: { en: 'square palm, shorter fingers', km: 'បាតដៃរាងការ៉េ ម្រាមដៃខ្លី' },
    personality: { en: 'Earth hands are traditionally described as practical, grounded and dependable — people who trust what they can see and build.', km: 'ដៃធាតុដីតាមប្រពៃណីត្រូវបានពិពណ៌នាថាជាមនុស្សជាក់ស្តែង មានគោលជំហរ និងគួរឱ្យទុកចិត្ត — មនុស្សដែលជឿលើអ្វីដែលពួកគេអាចមើលឃើញ និងកសាងបាន។' },
    love: { en: 'In love, the Earth hand is associated with loyalty and showing care through dependable everyday support.', km: 'ក្នុងស្នេហា ដៃធាតុដីត្រូវបានភ្ជាប់ទៅនឹងភាពស្មោះត្រង់ និងការបង្ហាញក្តីស្រឡាញ់តាមរយៈការគាំទ្រប្រចាំថ្ងៃដែលអាចទុកចិត្តបាន។' },
    career: { en: 'Career-wise it is linked with hands-on, tangible work — building, craft, agriculture, operations.', km: 'ផ្នែកអាជីព វាត្រូវបានភ្ជាប់ទៅនឹងការងារដោយដៃ និងជាក់ស្តែង — សំណង់ សិប្បកម្ម កសិកម្ម ប្រតិបត្តិការ។' },
    fortune: { en: 'Traditionally, Earth-hand fortune grows slowly and steadily, like a well-tended field.', km: 'តាមប្រពៃណី សំណាងរបស់ដៃធាតុដីរីកចម្រើនយឺតៗ ប៉ុន្តែជាប់លាប់ ដូចស្រែដែលថែទាំបានល្អ។' },
  },
  air: {
    name: { en: 'Air hand', km: 'ដៃធាតុខ្យល់' },
    shape: { en: 'square palm, longer fingers', km: 'បាតដៃរាងការ៉េ ម្រាមដៃវែង' },
    personality: { en: 'Air hands are traditionally described as curious, communicative and intellectually restless.', km: 'ដៃធាតុខ្យល់តាមប្រពៃណីត្រូវបានពិពណ៌នាថាជាមនុស្សចង់ដឹងចង់ឃើញ ចេះទំនាក់ទំនង និងមិនឈប់ស្វែងយល់។' },
    love: { en: 'In love, the Air hand is associated with friendship, conversation and a meeting of minds.', km: 'ក្នុងស្នេហា ដៃធាតុខ្យល់ត្រូវបានភ្ជាប់ទៅនឹងមិត្តភាព ការសន្ទនា និងការយល់ចិត្តគ្នា។' },
    career: { en: 'Career-wise it is linked with ideas and communication — writing, teaching, technology, media.', km: 'ផ្នែកអាជីព វាត្រូវបានភ្ជាប់ទៅនឹងគំនិត និងការទំនាក់ទំនង — ការសរសេរ ការបង្រៀន បច្ចេកវិទ្យា ប្រព័ន្ធផ្សព្វផ្សាយ។' },
    fortune: { en: 'Traditionally, Air-hand fortune arrives through networks, learning and good timing.', km: 'តាមប្រពៃណី សំណាងរបស់ដៃធាតុខ្យល់មកតាមរយៈបណ្តាញទំនាក់ទំនង ការសិក្សា និងពេលវេលាល្អ។' },
  },
  fire: {
    name: { en: 'Fire hand', km: 'ដៃធាតុភ្លើង' },
    shape: { en: 'longer palm, shorter fingers', km: 'បាតដៃវែង ម្រាមដៃខ្លី' },
    personality: { en: 'Fire hands are traditionally described as energetic, spontaneous and enthusiastic.', km: 'ដៃធាតុភ្លើងតាមប្រពៃណីត្រូវបានពិពណ៌នាថាជាមនុស្សមានថាមពល ធ្វើអ្វីៗដោយឯកឯង និងមានភាពរីករាយ។' },
    love: { en: 'In love, the Fire hand is associated with passion, warmth and bold gestures.', km: 'ក្នុងស្នេហា ដៃធាតុភ្លើងត្រូវបានភ្ជាប់ទៅនឹងចំណង់ចំណូលចិត្ត ភាពកក់ក្តៅ និងកាយវិការក្លាហាន។' },
    career: { en: 'Career-wise it is linked with leadership, entrepreneurship and roles with momentum.', km: 'ផ្នែកអាជីព វាត្រូវបានភ្ជាប់ទៅនឹងភាពជាអ្នកដឹកនាំ សហគ្រិនភាព និងតួនាទីដែលមានសន្ទុះ។' },
    fortune: { en: 'Traditionally, Fire-hand fortune favours the bold — opportunities seized quickly.', km: 'តាមប្រពៃណី សំណាងរបស់ដៃធាតុភ្លើងគាំទ្រអ្នកក្លាហាន — ឱកាសដែលចាប់យកបានយ៉ាងរហ័ស។' },
  },
  water: {
    name: { en: 'Water hand', km: 'ដៃធាតុទឹក' },
    shape: { en: 'longer palm, longer fingers', km: 'បាតដៃវែង ម្រាមដៃវែង' },
    personality: { en: 'Water hands are traditionally described as sensitive, intuitive and imaginative.', km: 'ដៃធាតុទឹកតាមប្រពៃណីត្រូវបានពិពណ៌នាថាជាមនុស្សរសើប មានវិចារណញាណ និងការស្រមើស្រមៃ។' },
    love: { en: 'In love, the Water hand is associated with empathy, devotion and deep emotional connection.', km: 'ក្នុងស្នេហា ដៃធាតុទឹកត្រូវបានភ្ជាប់ទៅនឹងការយល់ចិត្ត ការលះបង់ និងទំនាក់ទំនងផ្លូវចិត្តដ៏ជ្រាលជ្រៅ។' },
    career: { en: 'Career-wise it is linked with caring and creative work — arts, counselling, healthcare support, design.', km: 'ផ្នែកអាជីព វាត្រូវបានភ្ជាប់ទៅនឹងការងារថែទាំ និងច្នៃប្រឌិត — សិល្បៈ ការប្រឹក្សា ការគាំទ្រសុខាភិបាល ការរចនា។' },
    fortune: { en: 'Traditionally, Water-hand fortune flows through intuition and the people you help.', km: 'តាមប្រពៃណី សំណាងរបស់ដៃធាតុទឹកហូរមកតាមរយៈវិចារណញាណ និងមនុស្សដែលអ្នកជួយ។' },
  },
};

/** Applies admin overrides ({ [ruleId]: { disabled, text: {en, km} } }) to the rule list. */
export function applyRuleOverrides(rules, overrides = {}) {
  return rules
    .filter((r) => !overrides[r.id]?.disabled)
    .map((r) => {
      const o = overrides[r.id];
      if (!o?.text) return r;
      return { ...r, text: { ...r.text, ...Object.fromEntries(Object.entries(o.text).filter(([, v]) => v && v.trim())) } };
    });
}
