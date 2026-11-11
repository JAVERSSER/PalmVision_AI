// Static content for reading reports (bilingual).

export const CATEGORIES = ['personality', 'love', 'career', 'fortune'];

export const CATEGORY_META = {
  personality: {
    icon: 'Sparkles',
    color: '#A78BFA',
    title: { en: 'Personality Reading', km: 'ការអានបុគ្គលិកលក្ខណៈ' },
    tagline: { en: 'How tradition reads your temperament and thinking style', km: 'របៀបដែលប្រពៃណីអានចរិត និងរបៀបគិតរបស់អ្នក' },
    lines: ['head', 'life', 'heart'],
  },
  love: {
    icon: 'Heart',
    color: '#EF4444',
    title: { en: 'Love Reading', km: 'ការអានស្នេហា' },
    tagline: { en: 'What the heart line traditionally says about affection', km: 'អ្វីដែលខ្សែបេះដូងនិយាយតាមប្រពៃណីអំពីក្តីស្រឡាញ់' },
    lines: ['heart'],
  },
  career: {
    icon: 'Briefcase',
    color: '#3B82F6',
    title: { en: 'Career Reading', km: 'ការអានអាជីព' },
    tagline: { en: 'Head and fate lines as palmists read them for work', km: 'ខ្សែប្រាជ្ញា និងខ្សែវាសនា តាមការអានរបស់ហោរាបាតដៃសម្រាប់ការងារ' },
    lines: ['head', 'fate'],
  },
  fortune: {
    icon: 'Star',
    color: '#D8B56D',
    title: { en: 'Fortune Reading', km: 'ការអានសំណាង' },
    tagline: { en: 'Traditional symbols of luck, momentum and opportunity', km: 'និមិត្តសញ្ញាប្រពៃណីនៃសំណាង សន្ទុះ និងឱកាស' },
    lines: ['fate', 'life'],
  },
};

export const LINE_NAMES = {
  life: { en: 'Life Line', km: 'ខ្សែជីវិត' },
  head: { en: 'Head Line', km: 'ខ្សែប្រាជ្ញា' },
  heart: { en: 'Heart Line', km: 'ខ្សែបេះដូង' },
  fate: { en: 'Fate Line', km: 'ខ្សែវាសនា' },
};

export const LINE_DESCRIPTIONS = {
  life: {
    en: 'Curves around the base of the thumb. Traditionally associated with vitality, energy and approach to life — palmistry tradition itself says it does not show lifespan.',
    km: 'កោងជុំវិញគល់មេដៃ។ តាមប្រពៃណីភ្ជាប់ទៅនឹងភាពរស់រវើក ថាមពល និងរបៀបរស់នៅ — ប្រពៃណីហោរាសាស្ត្របាតដៃខ្លួនឯងនិយាយថា វាមិនបង្ហាញរយៈពេលជីវិតទេ។',
  },
  head: {
    en: 'Runs across the middle of the palm from the thumb side. Traditionally associated with thinking style, learning and decision-making.',
    km: 'រត់កាត់កណ្តាលបាតដៃពីខាងមេដៃ។ តាមប្រពៃណីភ្ជាប់ទៅនឹងរបៀបគិត ការរៀនសូត្រ និងការសម្រេចចិត្ត។',
  },
  heart: {
    en: 'The upper horizontal line below the fingers. Traditionally associated with emotions, affection and relationships.',
    km: 'ខ្សែផ្តេកខាងលើនៅក្រោមម្រាមដៃ។ តាមប្រពៃណីភ្ជាប់ទៅនឹងអារម្មណ៍ ក្តីស្រឡាញ់ និងទំនាក់ទំនង។',
  },
  fate: {
    en: 'A vertical line running up the centre of the palm toward the middle finger. Not everyone has one. Traditionally associated with direction and career path.',
    km: 'ខ្សែបញ្ឈរដែលរត់ឡើងកណ្តាលបាតដៃទៅរកម្រាមកណ្តាល។ មិនមែនគ្រប់គ្នាមានវាទេ។ តាមប្រពៃណីភ្ជាប់ទៅនឹងទិសដៅ និងផ្លូវអាជីព។',
  },
};

/** Human labels for measured feature values. */
export const VALUE_LABELS = {
  visibility: {
    clear: { en: 'clearly visible', km: 'មើលឃើញច្បាស់' },
    moderate: { en: 'moderately visible', km: 'មើលឃើញមធ្យម' },
    faint: { en: 'faint', km: 'ស្រាល' },
    none: { en: 'not detected', km: 'រកមិនឃើញ' },
  },
  length: {
    short: { en: 'short', km: 'ខ្លី' },
    medium: { en: 'medium length', km: 'ប្រវែងមធ្យម' },
    long: { en: 'long', km: 'វែង' },
  },
  curvature: {
    straight: { en: 'straight', km: 'ត្រង់' },
    gentle: { en: 'gently curved', km: 'កោងបន្តិច' },
    curved: { en: 'curved', km: 'កោង' },
    close: { en: 'close to the thumb', km: 'ជិតមេដៃ' },
    wide: { en: 'wide arc', km: 'កោងទូលាយ' },
  },
  slope: {
    straight: { en: 'level', km: 'ស្មើ' },
    gentle: { en: 'gently sloping', km: 'ទេបន្តិច' },
    steep: { en: 'steeply sloping', km: 'ទេខ្លាំង' },
  },
  endsAt: {
    index: { en: 'ends below the index finger', km: 'បញ្ចប់នៅក្រោមម្រាមចង្អុល' },
    between: { en: 'ends between index and middle fingers', km: 'បញ្ចប់នៅចន្លោះម្រាមចង្អុល និងម្រាមកណ្តាល' },
    middle: { en: 'ends below the middle finger', km: 'បញ្ចប់នៅក្រោមម្រាមកណ្តាល' },
  },
  origin: {
    wrist: { en: 'starts near the wrist', km: 'ចាប់ផ្តើមជិតកដៃ' },
    lower: { en: 'starts in the lower palm', km: 'ចាប់ផ្តើមនៅបាតដៃខាងក្រោម' },
    middle: { en: 'starts mid-palm', km: 'ចាប់ផ្តើមនៅកណ្តាលបាតដៃ' },
  },
  shape: {
    square: { en: 'square palm', km: 'បាតដៃរាងការ៉េ' },
    long: { en: 'long palm', km: 'បាតដៃវែង' },
  },
  fingers: {
    short: { en: 'shorter fingers', km: 'ម្រាមដៃខ្លី' },
    long: { en: 'longer fingers', km: 'ម្រាមដៃវែង' },
  },
};

export const REFLECTIONS = {
  personality: [
    { en: 'When you face a big decision, do you trust analysis or instinct first?', km: 'ពេលអ្នកប្រឈមនឹងការសម្រេចចិត្តធំ តើអ្នកជឿលើការវិភាគ ឬសភាវគតិមុន?' },
    { en: 'Which part of this description feels most like you — and which feels least?', km: 'តើផ្នែកណានៃការពិពណ៌នានេះដូចអ្នកជាងគេ — ហើយផ្នែកណាមិនដូចសោះ?' },
    { en: 'What kind of environment helps you feel most like yourself?', km: 'តើបរិយាកាសបែបណាដែលជួយឱ្យអ្នកមានអារម្មណ៍ថាជាខ្លួនឯងបំផុត?' },
    { en: 'How have your ways of thinking changed over the last few years?', km: 'តើរបៀបគិតរបស់អ្នកបានផ្លាស់ប្តូរយ៉ាងដូចម្តេចក្នុងរយៈពេលប៉ុន្មានឆ្នាំចុងក្រោយ?' },
    { en: 'What is one strength people often notice in you before you notice it yourself?', km: 'តើចំណុចខ្លាំងមួយណាដែលអ្នកដទៃកត់សម្គាល់ឃើញក្នុងខ្លួនអ្នក មុនពេលអ្នកឃើញវាដោយខ្លួនឯង?' },
  ],
  love: [
    { en: 'How do you most naturally show care — words, time, help or gestures?', km: 'តើអ្នកបង្ហាញការយកចិត្តទុកដាក់ដោយធម្មជាតិបំផុតតាមរបៀបណា — ពាក្យសម្តី ពេលវេលា ជំនួយ ឬកាយវិការ?' },
    { en: 'What does feeling truly understood by someone look like for you?', km: 'តើការមានអារម្មណ៍ថាត្រូវបានគេយល់ចិត្តពិតប្រាកដមានលក្ខណៈយ៉ាងដូចម្តេចសម្រាប់អ្នក?' },
    { en: 'Which past relationship (of any kind) taught you the most about yourself?', km: 'តើទំនាក់ទំនងកាលពីមុនមួយណា (គ្រប់ប្រភេទ) ដែលបានបង្រៀនអ្នកច្រើនបំផុតអំពីខ្លួនឯង?' },
    { en: 'How much personal space do you need to feel balanced in a close relationship?', km: 'តើអ្នកត្រូវការលំហផ្ទាល់ខ្លួនប៉ុណ្ណាដើម្បីមានអារម្មណ៍មានតុល្យភាពក្នុងទំនាក់ទំនងជិតស្និទ្ធ?' },
    { en: 'What would you like the people close to you to know about how you feel?', km: 'តើអ្នកចង់ឱ្យមនុស្សជិតស្និទ្ធដឹងអ្វីខ្លះអំពីអារម្មណ៍របស់អ្នក?' },
  ],
  career: [
    { en: 'What kind of work makes you lose track of time?', km: 'តើការងារបែបណាដែលធ្វើឱ្យអ្នកភ្លេចពេលវេលា?' },
    { en: 'Do you prefer building a plan or improvising as you go?', km: 'តើអ្នកចូលចិត្តរៀបចំផែនការ ឬធ្វើតាមស្ថានការណ៍?' },
    { en: 'If you could learn one new skill this year, what would it be?', km: 'ប្រសិនបើអ្នកអាចរៀនជំនាញថ្មីមួយនៅឆ្នាំនេះ តើវាជាអ្វី?' },
    { en: 'Which past achievement are you quietly most proud of?', km: 'តើសមិទ្ធផលកាលពីមុនមួយណាដែលអ្នកមានមោទនភាពបំផុតដោយស្ងាត់ៗ?' },
    { en: 'What would a "meaningful" career look like to you in five years?', km: 'តើអាជីព "ដែលមានអត្ថន័យ" នឹងមានលក្ខណៈដូចម្តេចសម្រាប់អ្នកក្នុងរយៈពេលប្រាំឆ្នាំ?' },
  ],
  fortune: [
    { en: 'When has a chance encounter changed your direction?', km: 'តើពេលណាដែលការជួបដោយចៃដន្យបានផ្លាស់ប្តូរទិសដៅរបស់អ្នក?' },
    { en: 'What opportunity are you currently hesitating to take?', km: 'តើឱកាសអ្វីដែលអ្នកកំពុងស្ទាក់ស្ទើរក្នុងការចាប់យក?' },
    { en: 'What does "being lucky" mean to you personally?', km: 'តើ "ការមានសំណាង" មានន័យយ៉ាងដូចម្តេចសម្រាប់អ្នកផ្ទាល់?' },
    { en: 'Which small daily habit could make good fortune more likely?', km: 'តើទម្លាប់ប្រចាំថ្ងៃតូចមួយណាដែលអាចធ្វើឱ្យសំណាងល្អកើតឡើងកាន់តែងាយ?' },
    { en: 'Who in your life tends to bring new opportunities your way?', km: 'តើនរណាក្នុងជីវិតរបស់អ្នកដែលតែងតែនាំឱកាសថ្មីៗមករកអ្នក?' },
  ],
};

export const DISCLAIMER = {
  en: 'For entertainment only. Palmistry is a traditional practice and is not scientifically proven to reveal personality, relationships, health, finances or the future. The line detection is a computer-vision estimate of visible skin creases; the interpretations are traditional palmistry conventions applied to those estimates — not predictions, diagnoses or advice.',
  km: 'សម្រាប់ការកម្សាន្តតែប៉ុណ្ណោះ។ ហោរាសាស្ត្របាតដៃគឺជាការអនុវត្តតាមប្រពៃណី ហើយមិនត្រូវបានបញ្ជាក់ដោយវិទ្យាសាស្ត្រថាអាចបង្ហាញបុគ្គលិកលក្ខណៈ ទំនាក់ទំនង សុខភាព ហិរញ្ញវត្ថុ ឬអនាគតបានទេ។ ការរកឃើញខ្សែគឺជាការប៉ាន់ស្មានដោយកុំព្យូទ័រអំពីស្នាមជ្រួញស្បែកដែលមើលឃើញ ហើយការបកស្រាយគឺជាទំនៀមទម្លាប់ហោរាសាស្ត្របាតដៃដែលអនុវត្តលើការប៉ាន់ស្មានទាំងនោះ — មិនមែនជាការទស្សន៍ទាយ ការធ្វើរោគវិនិច្ឆ័យ ឬដំបូន្មានទេ។',
};
