// Extra wording so repeated scans of the same hand don't read word-for-word the same.
//
// The *meaning* of a reading is still decided only by the measured features
// (see utils/palmRules.js). Each scan has its own seed, and the seed only picks
// *which phrasing* of that same meaning is shown.

/** Alternative phrasings for rules. The rule's own `text` is always variant #0. */
export const RULE_VARIANTS = {
  // ------------------------------------------------------- personality ---
  'p-head-straight': [
    {
      en: 'Your head line runs almost level across the palm. Palmists read this as a practical, organised mind — you like to know the facts and have a plan before you act.',
      km: 'ខ្សែប្រាជ្ញារបស់អ្នករត់ស្ទើរតែស្មើកាត់បាតដៃ។ ហោរាបាតដៃអានវាថាជាគំនិតជាក់ស្តែង និងមានរបៀប — អ្នកចូលចិត្តដឹងការពិត និងមានផែនការមុននឹងធ្វើអ្វីមួយ។',
    },
    {
      en: 'A level head line is the classic "realist" sign in palmistry: clear reasoning, a good memory for details and a preference for solutions that actually work.',
      km: 'ខ្សែប្រាជ្ញាស្មើ គឺជាសញ្ញា "អ្នកប្រាកដនិយម" បុរាណក្នុងហោរាសាស្ត្របាតដៃ៖ ការវែកញែកច្បាស់ ការចងចាំព័ត៌មានលម្អិតបានល្អ និងចូលចិត្តដំណោះស្រាយដែលដំណើរការពិតប្រាកដ។',
    },
  ],
  'p-head-gentle': [
    {
      en: 'Your head line bends softly downward. Tradition reads this as a mind that mixes logic with imagination — you can be sensible and creative at the same time.',
      km: 'ខ្សែប្រាជ្ញារបស់អ្នកទេចុះបន្តិចៗ។ ប្រពៃណីអានវាថាជាគំនិតដែលលាយតក្កវិជ្ជាជាមួយការស្រមើស្រមៃ — អ្នកអាចមានហេតុផល និងច្នៃប្រឌិតក្នុងពេលតែមួយ។',
    },
    {
      en: 'A gentle slope in the head line is often called the "flexible thinker" sign: you weigh the facts, but you also listen to ideas that are not yet proven.',
      km: 'ការទេបន្តិចនៃខ្សែប្រាជ្ញា ច្រើនតែហៅថាសញ្ញា "អ្នកគិតបត់បែន"៖ អ្នកថ្លឹងថ្លែងការពិត ប៉ុន្តែអ្នកក៏ស្តាប់គំនិតដែលមិនទាន់បានបញ្ជាក់ដែរ។',
    },
  ],
  'p-head-steep': [
    {
      en: 'Your head line drops toward the lower palm. Palmists see this as a rich inner world — strong imagination, deep feelings and a talent for seeing things differently.',
      km: 'ខ្សែប្រាជ្ញារបស់អ្នកធ្លាក់ចុះទៅបាតដៃខាងក្រោម។ ហោរាបាតដៃមើលឃើញវាថាជាពិភពខាងក្នុងដ៏សម្បូរបែប — ការស្រមើស្រមៃខ្លាំង អារម្មណ៍ជ្រៅ និងទេពកោសល្យមើលរឿងខុសពីគេ។',
    },
    {
      en: 'A steep head line is traditionally the mark of the dreamer and the artist: you often think in pictures, stories and feelings rather than lists.',
      km: 'ខ្សែប្រាជ្ញាទេខ្លាំង តាមប្រពៃណីជាសញ្ញារបស់អ្នកស្រមៃ និងសិល្បករ៖ អ្នកច្រើនតែគិតជារូបភាព រឿងរ៉ាវ និងអារម្មណ៍ ជាជាងជាបញ្ជី។',
    },
  ],
  'p-head-long': [
    {
      en: 'Because your head line stretches far across the palm, tradition says you rarely settle for the first answer — you like to explore every option.',
      km: 'ដោយសារខ្សែប្រាជ្ញារបស់អ្នកលាតឆ្ងាយកាត់បាតដៃ ប្រពៃណីនិយាយថាអ្នកកម្រពេញចិត្តនឹងចម្លើយដំបូងណាស់ — អ្នកចូលចិត្តស្វែងរកជម្រើសទាំងអស់។',
    },
  ],
  'p-head-short': [
    {
      en: 'A compact head line is traditionally read as a "doer" — you trust your first instinct and prefer to learn by trying.',
      km: 'ខ្សែប្រាជ្ញាខ្លី តាមប្រពៃណីត្រូវបានអានថាជា "អ្នកធ្វើ" — អ្នកជឿលើសភាវគតិដំបូងរបស់អ្នក ហើយចូលចិត្តរៀនតាមរយៈការសាកល្បង។',
    },
  ],
  'p-head-life-joined': [
    {
      en: 'Your head and life lines share a starting point. Traditionally this shows someone thoughtful and loyal to family, who looks carefully before taking a leap.',
      km: 'ខ្សែប្រាជ្ញា និងខ្សែជីវិតរបស់អ្នកមានចំណុចចាប់ផ្តើមរួមគ្នា។ តាមប្រពៃណី វាបង្ហាញពីមនុស្សដែលគិតវែងឆ្ងាយ និងស្មោះត្រង់នឹងគ្រួសារ ដែលមើលឱ្យច្បាស់មុននឹងលោត។',
    },
  ],
  'p-head-life-separate': [
    {
      en: 'Your head line begins a little apart from the life line — an old sign of confidence and of someone who learned early to make their own decisions.',
      km: 'ខ្សែប្រាជ្ញារបស់អ្នកចាប់ផ្តើមដាច់បន្តិចពីខ្សែជីវិត — ជាសញ្ញាចាស់នៃទំនុកចិត្ត និងមនុស្សដែលបានរៀនសម្រេចចិត្តដោយខ្លួនឯងតាំងពីក្មេង។',
    },
  ],
  'p-life-wide': [
    {
      en: 'The wide curve of your life line is traditionally read as lots of energy and a love of new places, people and experiences.',
      km: 'ខ្សែជីវិតកោងទូលាយរបស់អ្នក តាមប្រពៃណីត្រូវបានអានថាជាថាមពលច្រើន និងការស្រឡាញ់កន្លែង មនុស្ស និងបទពិសោធន៍ថ្មីៗ។',
    },
  ],
  'p-life-close': [
    {
      en: 'Your life line stays near the thumb. Tradition reads this as a gentle, home-loving nature that recharges best in quiet, familiar places.',
      km: 'ខ្សែជីវិតរបស់អ្នកនៅជិតមេដៃ។ ប្រពៃណីអានវាថាជាចរិតទន់ភ្លន់ ស្រឡាញ់ផ្ទះ ដែលបញ្ចូលថាមពលឡើងវិញបានល្អបំផុតនៅកន្លែងស្ងប់ស្ងាត់ និងធ្លាប់ស្គាល់។',
    },
  ],
  'p-life-gentle': [
    {
      en: 'Your life line has a balanced curve — traditionally a sign of someone who can enjoy a busy day and also enjoy a quiet one.',
      km: 'ខ្សែជីវិតរបស់អ្នកមានកោងមានតុល្យភាព — តាមប្រពៃណីជាសញ្ញានៃមនុស្សដែលអាចរីករាយនឹងថ្ងៃមមាញឹក ហើយក៏រីករាយនឹងថ្ងៃស្ងប់ស្ងាត់ដែរ។',
    },
  ],

  // -------------------------------------------------------------- love ---
  'l-heart-index': [
    {
      en: 'Your heart line reaches up toward the index finger and the Mount of Jupiter. Palmists call this the idealist\'s heart: you give a lot in love and hope to receive the same respect back.',
      km: 'ខ្សែបេះដូងរបស់អ្នកលាតឡើងទៅរកម្រាមចង្អុល និងទួលព្រហស្បតិ៍។ ហោរាបាតដៃហៅវាថាបេះដូងរបស់អ្នកមានឧត្តមគតិ៖ អ្នកផ្តល់ច្រើនក្នុងស្នេហា ហើយសង្ឃឹមថានឹងទទួលបានការគោរពដូចគ្នាវិញ។',
    },
    {
      en: 'A heart line ending under the index finger (on the Mount of Jupiter) is traditionally linked with choosing partners carefully — once you commit, you are very loyal.',
      km: 'ខ្សែបេះដូងដែលបញ្ចប់នៅក្រោមម្រាមចង្អុល (លើទួលព្រហស្បតិ៍) តាមប្រពៃណីត្រូវបានភ្ជាប់ទៅនឹងការជ្រើសរើសដៃគូដោយប្រុងប្រយ័ត្ន — ពេលអ្នកសន្យាហើយ អ្នកស្មោះត្រង់ខ្លាំងណាស់។',
    },
  ],
  'l-heart-between': [
    {
      en: 'Your heart line ends in the space between the index and middle fingers — traditionally the most balanced position: caring and warm, but also sensible.',
      km: 'ខ្សែបេះដូងរបស់អ្នកបញ្ចប់នៅចន្លោះម្រាមចង្អុល និងម្រាមកណ្តាល — តាមប្រពៃណីជាទីតាំងមានតុល្យភាពបំផុត៖ យកចិត្តទុកដាក់ និងកក់ក្តៅ ប៉ុន្តែក៏មានហេតុផលដែរ។',
    },
    {
      en: 'Palmists read this heart-line ending as a person who mixes romance with common sense — you can follow your heart without losing your head.',
      km: 'ហោរាបាតដៃអានចុងខ្សែបេះដូងបែបនេះថាជាមនុស្សដែលលាយស្នេហាជាមួយសុភវិនិច្ឆ័យ — អ្នកអាចធ្វើតាមបេះដូង ដោយមិនបាត់បង់ហេតុផល។',
    },
  ],
  'l-heart-middle': [
    {
      en: 'Your heart line stops under the middle finger, on the Mount of Saturn. Traditionally this means you show love by doing — helping, fixing and being there — more than by saying sweet words.',
      km: 'ខ្សែបេះដូងរបស់អ្នកឈប់នៅក្រោមម្រាមកណ្តាល លើទួលសៅរ៍។ តាមប្រពៃណី នេះមានន័យថាអ្នកបង្ហាញក្តីស្រឡាញ់តាមរយៈការធ្វើ — ជួយ ជួសជុល និងនៅក្បែរ — ច្រើនជាងការនិយាយពាក្យផ្អែមល្ហែម។',
    },
    {
      en: 'A heart line ending below the middle finger (on the Mount of Saturn) is traditionally read as a practical lover: steady, protective and focused on real support.',
      km: 'ខ្សែបេះដូងដែលបញ្ចប់នៅក្រោមម្រាមកណ្តាល (លើទួលសៅរ៍) តាមប្រពៃណីត្រូវបានអានថាជាអ្នកស្រឡាញ់បែបជាក់ស្តែង៖ នឹងនរ ការពារ និងផ្តោតលើការគាំទ្រពិតប្រាកដ។',
    },
  ],
  'l-heart-curved': [
    {
      en: 'The strong curve in your heart line is traditionally read as a romantic, expressive nature — you like to show your feelings and enjoy being close to people.',
      km: 'កោងខ្លាំងនៃខ្សែបេះដូងរបស់អ្នក តាមប្រពៃណីត្រូវបានអានថាជាចរិតមនោសញ្ចេតនា និងបង្ហាញអារម្មណ៍ — អ្នកចូលចិត្តបង្ហាញអារម្មណ៍ និងរីករាយនៅជិតមនុស្ស។',
    },
  ],
  'l-heart-straight': [
    {
      en: 'Your heart line is fairly straight — traditionally a calm, quiet way of loving, where trust is built slowly and kept for a long time.',
      km: 'ខ្សែបេះដូងរបស់អ្នកត្រង់ល្មម — តាមប្រពៃណីជារបៀបស្រឡាញ់ស្ងប់ស្ងាត់ ដែលការទុកចិត្តត្រូវបានកសាងយឺតៗ ហើយរក្សាបានយូរ។',
    },
  ],
  'l-heart-gentle': [
    {
      en: 'The soft curve of your heart line is traditionally read as warm but careful — friendly with everyone, truly open with only a few.',
      km: 'កោងស្រាលនៃខ្សែបេះដូងរបស់អ្នក តាមប្រពៃណីត្រូវបានអានថាកក់ក្តៅ ប៉ុន្តែប្រុងប្រយ័ត្ន — រួសរាយជាមួយគ្រប់គ្នា ប៉ុន្តែបើកចិត្តពិតតែជាមួយមនុស្សតិចតួច។',
    },
  ],
  'l-heart-long': [
    {
      en: 'A heart line that runs far across the palm is traditionally a sign of a big heart — you tend to put the people you love first.',
      km: 'ខ្សែបេះដូងដែលរត់ឆ្ងាយកាត់បាតដៃ តាមប្រពៃណីជាសញ្ញានៃចិត្តធំ — អ្នកច្រើនតែដាក់មនុស្សដែលអ្នកស្រឡាញ់ជាអាទិភាព។',
    },
  ],
  'l-heart-short': [
    {
      en: 'A shorter heart line is traditionally read as someone who loves sincerely but also needs freedom and time for themselves.',
      km: 'ខ្សែបេះដូងខ្លី តាមប្រពៃណីត្រូវបានអានថាជាមនុស្សដែលស្រឡាញ់ដោយស្មោះ ប៉ុន្តែក៏ត្រូវការសេរីភាព និងពេលវេលាសម្រាប់ខ្លួនឯងដែរ។',
    },
  ],

  // ------------------------------------------------------------ career ---
  'c-head-straight': [
    {
      en: 'At work, a level head line is traditionally linked with planning, numbers and systems — jobs where clear thinking and accuracy matter.',
      km: 'ក្នុងការងារ ខ្សែប្រាជ្ញាស្មើ តាមប្រពៃណីត្រូវបានភ្ជាប់ទៅនឹងការរៀបចំផែនការ លេខ និងប្រព័ន្ធ — ការងារដែលការគិតច្បាស់ និងភាពត្រឹមត្រូវសំខាន់។',
    },
    {
      en: 'Palmists traditionally see a straight head line as a strong sign for management, engineering, finance or any role that rewards organisation.',
      km: 'ហោរាបាតដៃមើលឃើញខ្សែប្រាជ្ញាត្រង់ថាជាសញ្ញាល្អសម្រាប់ការគ្រប់គ្រង វិស្វកម្ម ហិរញ្ញវត្ថុ ឬតួនាទីណាដែលឱ្យតម្លៃលើភាពមានរបៀប។',
    },
  ],
  'c-head-gentle': [
    {
      en: 'A gently sloping head line is traditionally good for work that mixes ideas with practice — design, teaching, marketing or problem-solving with people.',
      km: 'ខ្សែប្រាជ្ញាទេបន្តិច តាមប្រពៃណីល្អសម្រាប់ការងារដែលលាយគំនិតជាមួយការអនុវត្ត — ការរចនា ការបង្រៀន ទីផ្សារ ឬការដោះស្រាយបញ្ហាជាមួយមនុស្ស។',
    },
    {
      en: 'In career terms, tradition reads this slope as adaptable: you can follow a process, and you can also invent a new one when needed.',
      km: 'ផ្នែកអាជីព ប្រពៃណីអានការទេនេះថាជាការបត់បែន៖ អ្នកអាចធ្វើតាមដំណើរការ ហើយក៏អាចបង្កើតដំណើរការថ្មីពេលចាំបាច់ដែរ។',
    },
  ],
  'c-head-steep': [
    {
      en: 'A steep head line is traditionally linked with creative careers — art, music, writing, content, or any work where imagination is the main tool.',
      km: 'ខ្សែប្រាជ្ញាទេខ្លាំង តាមប្រពៃណីត្រូវបានភ្ជាប់ទៅនឹងអាជីពច្នៃប្រឌិត — សិល្បៈ តន្ត្រី ការសរសេរ មាតិកា ឬការងារណាដែលការស្រមើស្រមៃជាឧបករណ៍ចម្បង។',
    },
    {
      en: 'Palmists say this head line does best in work with freedom to experiment, rather than strict routines.',
      km: 'ហោរាបាតដៃនិយាយថា ខ្សែប្រាជ្ញាបែបនេះធ្វើបានល្អបំផុតក្នុងការងារដែលមានសេរីភាពក្នុងការសាកល្បង ជាជាងទម្លាប់តឹងរ៉ឹង។',
    },
  ],
  'c-fate-clear': [
    {
      en: 'Your fate line is clearly visible. Tradition reads this as a strong sense of direction — you often know what you want to build and keep working toward it.',
      km: 'ខ្សែវាសនារបស់អ្នកមើលឃើញច្បាស់។ ប្រពៃណីអានវាថាជាការដឹងទិសដៅច្បាស់ — អ្នកច្រើនតែដឹងថាចង់កសាងអ្វី ហើយបន្តខិតខំឆ្ពោះទៅរកវា។',
    },
    {
      en: 'A visible fate line is traditionally linked with responsibility and steady progress — the kind of career that grows step by step.',
      km: 'ខ្សែវាសនាដែលមើលឃើញ តាមប្រពៃណីត្រូវបានភ្ជាប់ទៅនឹងការទទួលខុសត្រូវ និងការរីកចម្រើនជាប់លាប់ — អាជីពដែលរីកចម្រើនមួយជំហានម្តងៗ។',
    },
  ],
  'c-fate-faint': [
    {
      en: 'Your fate line is faint or missing — which is very common. Palmists say this means your path is not "fixed": you are free to change direction and create your own way.',
      km: 'ខ្សែវាសនារបស់អ្នកស្រាល ឬមិនមាន — ដែលជារឿងធម្មតាណាស់។ ហោរាបាតដៃនិយាយថា នេះមានន័យថាផ្លូវរបស់អ្នកមិន "កំណត់ជាស្រេច" ទេ៖ អ្នកមានសេរីភាពផ្លាស់ប្តូរទិសដៅ និងបង្កើតផ្លូវផ្ទាល់ខ្លួន។',
    },
    {
      en: 'Without a strong fate line, tradition sees a self-made path — success that comes from your own choices rather than a set plan.',
      km: 'ដោយគ្មានខ្សែវាសនាខ្លាំង ប្រពៃណីមើលឃើញផ្លូវដែលខ្លួនឯងបង្កើត — ជោគជ័យដែលមកពីការជ្រើសរើសរបស់អ្នក ជាជាងផែនការដែលកំណត់ទុក។',
    },
  ],
  'c-fate-wrist': [
    {
      en: 'A fate line starting near the wrist is traditionally read as early focus — you may have known your interests from a young age.',
      km: 'ខ្សែវាសនាចាប់ផ្តើមជិតកដៃ តាមប្រពៃណីត្រូវបានអានថាជាការផ្តោតតាំងពីដំបូង — អ្នកប្រហែលជាដឹងពីចំណាប់អារម្មណ៍របស់អ្នកតាំងពីក្មេង។',
    },
  ],
  'c-fate-later': [
    {
      en: 'A fate line that starts higher on the palm is traditionally read as a "late bloomer" sign — your real direction becomes clearer with experience.',
      km: 'ខ្សែវាសនាដែលចាប់ផ្តើមខ្ពស់លើបាតដៃ តាមប្រពៃណីត្រូវបានអានថាជាសញ្ញា "រីកយឺត" — ទិសដៅពិតរបស់អ្នកកាន់តែច្បាស់ជាមួយបទពិសោធន៍។',
    },
  ],

  // ----------------------------------------------------------- fortune ---
  'f-life-long': [
    {
      en: 'Your life line reaches far down the palm. Tradition reads this as strong stamina — the energy to keep going until things work out.',
      km: 'ខ្សែជីវិតរបស់អ្នកលាតចុះឆ្ងាយលើបាតដៃ។ ប្រពៃណីអានវាថាជាកម្លាំងស៊ូទ្រាំខ្លាំង — ថាមពលដើម្បីបន្តរហូតដល់អ្វីៗទទួលបានជោគជ័យ។',
    },
    {
      en: 'A long, sweeping life line is traditionally linked with resilience: setbacks slow you down, but they rarely stop you.',
      km: 'ខ្សែជីវិតវែង តាមប្រពៃណីត្រូវបានភ្ជាប់ទៅនឹងភាពធន់៖ ឧបសគ្គអាចធ្វើឱ្យអ្នកយឺត ប៉ុន្តែកម្របញ្ឈប់អ្នកណាស់។',
    },
  ],
  'f-life-short': [
    {
      en: 'A shorter life line does not mean a short life — palmists are clear on this. It is traditionally read as energy that comes in strong bursts, so rest matters for you.',
      km: 'ខ្សែជីវិតខ្លីមិនមានន័យថាជីវិតខ្លីទេ — ហោរាបាតដៃបញ្ជាក់ច្បាស់អំពីរឿងនេះ។ តាមប្រពៃណី វាត្រូវបានអានថាជាថាមពលដែលមកជាដំណាក់កាលខ្លាំងៗ ដូច្នេះការសម្រាកសំខាន់សម្រាប់អ្នក។',
    },
  ],
  'f-fate-long': [
    {
      en: 'A long, clear fate line is traditionally a sign of steady luck — opportunities that keep building on each other over time.',
      km: 'ខ្សែវាសនាវែង និងច្បាស់ តាមប្រពៃណីជាសញ្ញានៃសំណាងជាប់លាប់ — ឱកាសដែលបន្តកសាងលើគ្នាទៅវិញទៅមកតាមពេលវេលា។',
    },
  ],
  'f-fate-absent': [
    {
      en: 'With a faint or missing fate line, tradition says your luck is "open" — it is shaped by the choices and chances you take, not written in advance.',
      km: 'ជាមួយខ្សែវាសនាស្រាល ឬមិនមាន ប្រពៃណីនិយាយថាសំណាងរបស់អ្នក "បើកចំហ" — វាត្រូវបានបង្កើតដោយការជ្រើសរើស និងឱកាសដែលអ្នកចាប់យក មិនមែនសរសេរទុកជាមុនទេ។',
    },
  ],
};

/** Opening sentence of each summary. `{hand}` is "left" / "right". */
export const SUMMARY_LEADS = [
  {
    en: 'Based on the visible features of your {hand} palm, traditional palmistry would read it like this:',
    km: 'ផ្អែកលើលក្ខណៈដែលមើលឃើញនៃបាតដៃ{hand}របស់អ្នក ហោរាសាស្ត្របាតដៃប្រពៃណីនឹងអានវាដូចនេះ៖',
  },
  {
    en: 'Here is what the lines of your {hand} hand suggest in traditional palmistry:',
    km: 'នេះជាអ្វីដែលខ្សែនៃដៃ{hand}របស់អ្នកបង្ហាញតាមហោរាសាស្ត្របាតដៃប្រពៃណី៖',
  },
  {
    en: 'Looking at the shape and lines of your {hand} palm, a traditional palm reader would say:',
    km: 'ពេលមើលរាង និងខ្សែនៃបាតដៃ{hand}របស់អ្នក អ្នកមើលបាតដៃតាមប្រពៃណីនឹងនិយាយថា៖',
  },
  {
    en: 'Your {hand} palm, read the traditional way:',
    km: 'បាតដៃ{hand}របស់អ្នក អានតាមរបៀបប្រពៃណី៖',
  },
];

/** Friendly tips shown under each reading (two are picked per scan). */
export const TIPS = {
  personality: [
    { en: 'Write down one decision you made this week and whether you used logic or gut feeling — patterns appear quickly.', km: 'សរសេរការសម្រេចចិត្តមួយដែលអ្នកបានធ្វើសប្តាហ៍នេះ ហើយថាតើអ្នកប្រើហេតុផល ឬអារម្មណ៍ — អ្នកនឹងឃើញលំនាំយ៉ាងឆាប់។' },
    { en: 'Ask a close friend which word describes you best, and compare it with this reading.', km: 'សួរមិត្តជិតស្និទ្ធថាពាក្យមួយណាពិពណ៌នាអ្នកបានល្អបំផុត ហើយប្រៀបធៀបវាជាមួយការអាននេះ។' },
    { en: 'Give your strongest trait a small challenge this week — use it somewhere new.', km: 'ផ្តល់បញ្ហាប្រឈមតូចមួយដល់ចរិតខ្លាំងបំផុតរបស់អ្នកសប្តាហ៍នេះ — ប្រើវានៅកន្លែងថ្មី។' },
    { en: 'Notice which activities give you energy and which ones drain it.', km: 'កត់សម្គាល់ថាសកម្មភាពណាផ្តល់ថាមពលដល់អ្នក ហើយមួយណាធ្វើឱ្យអស់កម្លាំង។' },
    { en: 'Try scanning your other hand too — palmists compare both hands for a fuller picture.', km: 'សាកស្កេនដៃម្ខាងទៀតរបស់អ្នកផង — ហោរាបាតដៃប្រៀបធៀបដៃទាំងពីរដើម្បីទទួលបានរូបភាពពេញលេញ។' },
  ],
  love: [
    { en: 'Tell someone you care about one specific thing you appreciate about them today.', km: 'ប្រាប់មនុស្សដែលអ្នកស្រឡាញ់ពីរឿងជាក់លាក់មួយដែលអ្នកកោតសរសើរចំពោះពួកគេថ្ងៃនេះ។' },
    { en: 'Think about how you like to receive care — and let the people close to you know.', km: 'គិតថាតើអ្នកចូលចិត្តទទួលការយកចិត្តទុកដាក់តាមរបៀបណា — ហើយប្រាប់មនុស្សជិតស្និទ្ធឱ្យដឹង។' },
    { en: 'Good relationships need both closeness and space. Check which one you need more of right now.', km: 'ទំនាក់ទំនងល្អត្រូវការទាំងភាពជិតស្និទ្ធ និងលំហផ្ទាល់ខ្លួន។ ពិនិត្យមើលថាតើអ្នកត្រូវការមួយណាច្រើនជាងពេលនេះ។' },
    { en: 'Listen fully in your next conversation — no phone, no planning your answer.', km: 'ស្តាប់ឱ្យពេញលេញក្នុងការសន្ទនាបន្ទាប់ — គ្មានទូរស័ព្ទ គ្មានការគិតចម្លើយទុកមុន។' },
    { en: 'Kindness to yourself counts too. Do one small thing today just because it makes you happy.', km: 'ការចិត្តល្អចំពោះខ្លួនឯងក៏សំខាន់ដែរ។ ធ្វើរឿងតូចមួយថ្ងៃនេះ ដោយសារតែវាធ្វើឱ្យអ្នកសប្បាយចិត្ត។' },
  ],
  career: [
    { en: 'List three tasks you enjoyed this month. What do they have in common?', km: 'រាយការងារបីដែលអ្នករីករាយក្នុងខែនេះ។ តើពួកវាមានអ្វីដូចគ្នា?' },
    { en: 'Spend 20 minutes this week learning something linked to your goals.', km: 'ចំណាយ ២០ នាទីក្នុងសប្តាហ៍នេះ ដើម្បីរៀនអ្វីមួយដែលទាក់ទងនឹងគោលដៅរបស់អ្នក។' },
    { en: 'Talk to someone who does the work you are curious about — one conversation can open a door.', km: 'និយាយជាមួយនរណាម្នាក់ដែលធ្វើការងារដែលអ្នកចង់ដឹង — ការសន្ទនាមួយអាចបើកទ្វារបាន។' },
    { en: 'Break one big goal into a first step you can finish today.', km: 'បំបែកគោលដៅធំមួយទៅជាជំហានដំបូងដែលអ្នកអាចបញ្ចប់បានថ្ងៃនេះ។' },
    { en: 'Write down a skill people often ask you for help with — it may be a hidden strength.', km: 'សរសេរជំនាញដែលមនុស្សច្រើនតែសុំជំនួយពីអ្នក — វាអាចជាចំណុចខ្លាំងដែលលាក់កំបាំង។' },
  ],
  fortune: [
    { en: 'Say "yes" to one small new opportunity this week and see where it leads.', km: 'និយាយ "បាទ/ចាស" ចំពោះឱកាសថ្មីតូចមួយក្នុងសប្តាហ៍នេះ ហើយមើលថាវានាំទៅណា។' },
    { en: 'Luck often follows preparation — finish one task you have been putting off.', km: 'សំណាងច្រើនតែមកតាមការត្រៀមខ្លួន — បញ្ចប់ការងារមួយដែលអ្នកបានពន្យារពេល។' },
    { en: 'Keep a short list of good things that happen each day for a week.', km: 'កត់ត្រាបញ្ជីខ្លីនៃរឿងល្អៗដែលកើតឡើងរៀងរាល់ថ្ងៃ រយៈពេលមួយសប្តាហ៍។' },
    { en: 'Reconnect with an old friend — many opportunities come through people.', km: 'ទាក់ទងមិត្តចាស់ម្នាក់ឡើងវិញ — ឱកាសជាច្រើនមកតាមរយៈមនុស្ស។' },
    { en: 'Take care of your energy: good sleep and short breaks make it easier to notice chances.', km: 'ថែរក្សាថាមពលរបស់អ្នក៖ ការគេងល្អ និងការសម្រាកខ្លីៗ ធ្វើឱ្យងាយស្រួលកត់សម្គាល់ឱកាស។' },
  ],
};

/**
 * Plain-language explanations of palmistry words. An entry is shown under a
 * reading when its `match` pattern appears in that reading's text.
 */
export const GLOSSARY = [
  {
    id: 'jupiter',
    match: /Jupiter|ព្រហស្បតិ៍/,
    term: { en: 'Mount of Jupiter', km: 'ទួលព្រហស្បតិ៍' },
    text: {
      en: 'The small raised pad of skin at the base of the index (pointing) finger. Palmistry names each finger pad after a planet; Jupiter\'s pad is linked with ambition, leadership and ideals.',
      km: 'ផ្នែកសាច់ប៉ោងតូចនៅគល់ម្រាមចង្អុល។ ហោរាសាស្ត្របាតដៃដាក់ឈ្មោះផ្នែកប៉ោងក្រោមម្រាមដៃនីមួយៗតាមឈ្មោះភព។ ទួលព្រហស្បតិ៍ ត្រូវបានភ្ជាប់ទៅនឹងមហិច្ឆតា ភាពជាអ្នកដឹកនាំ និងឧត្តមគតិ។',
    },
  },
  {
    id: 'saturn',
    match: /Saturn|សៅរ៍/,
    term: { en: 'Mount of Saturn', km: 'ទួលសៅរ៍' },
    text: {
      en: 'The small raised pad of skin at the base of the middle finger, named after the planet Saturn. In palmistry it stands for responsibility, patience and a serious, practical side.',
      km: 'ផ្នែកសាច់ប៉ោងតូចនៅគល់ម្រាមកណ្តាល ដាក់ឈ្មោះតាមភពសៅរ៍ (Saturn)។ ក្នុងហោរាសាស្ត្របាតដៃ វាតំណាងឱ្យការទទួលខុសត្រូវ ការអត់ធ្មត់ និងចរិតម៉ឺងម៉ាត់ ជាក់ស្តែង។',
    },
  },
  {
    id: 'element',
    match: /Earth hand|Air hand|Fire hand|Water hand|ដៃធាតុ/,
    term: { en: 'Hand elements', km: 'ធាតុនៃដៃ' },
    text: {
      en: 'Palmistry sorts hands into four "elements" by palm shape and finger length: Earth (square palm, short fingers), Air (square palm, long fingers), Fire (long palm, short fingers) and Water (long palm, long fingers).',
      km: 'ហោរាសាស្ត្របាតដៃបែងចែកដៃជា "ធាតុ" បួន តាមរាងបាតដៃ និងប្រវែងម្រាមដៃ៖ ដី (បាតដៃការ៉េ ម្រាមខ្លី) ខ្យល់ (បាតដៃការ៉េ ម្រាមវែង) ភ្លើង (បាតដៃវែង ម្រាមខ្លី) និងទឹក (បាតដៃវែង ម្រាមវែង)។',
    },
  },
  {
    id: 'fate',
    match: /fate line|ខ្សែវាសនា/i,
    term: { en: 'Fate line', km: 'ខ្សែវាសនា' },
    text: {
      en: 'A vertical line that runs up the middle of the palm toward the middle finger. Many people have only a faint one, or none at all — that is normal.',
      km: 'ខ្សែបញ្ឈរដែលរត់ឡើងកណ្តាលបាតដៃទៅរកម្រាមកណ្តាល។ មនុស្សជាច្រើនមានតែខ្សែស្រាល ឬគ្មានសោះ — នោះជារឿងធម្មតា។',
    },
  },
  {
    id: 'head',
    match: /head line|ខ្សែប្រាជ្ញា/i,
    term: { en: 'Head line', km: 'ខ្សែប្រាជ្ញា' },
    text: {
      en: 'The line that runs across the middle of the palm, starting between the thumb and index finger. Palmistry links it with how you think and decide.',
      km: 'ខ្សែដែលរត់កាត់កណ្តាលបាតដៃ ចាប់ផ្តើមពីចន្លោះមេដៃ និងម្រាមចង្អុល។ ហោរាសាស្ត្របាតដៃភ្ជាប់វាទៅនឹងរបៀបគិត និងសម្រេចចិត្ត។',
    },
  },
  {
    id: 'heart',
    match: /heart line|ខ្សែបេះដូង/i,
    term: { en: 'Heart line', km: 'ខ្សែបេះដូង' },
    text: {
      en: 'The top horizontal line, just below the fingers. Palmistry links it with feelings and relationships.',
      km: 'ខ្សែផ្តេកខាងលើបំផុត នៅក្រោមម្រាមដៃ។ ហោរាសាស្ត្របាតដៃភ្ជាប់វាទៅនឹងអារម្មណ៍ និងទំនាក់ទំនង។',
    },
  },
  {
    id: 'life',
    match: /life line|ខ្សែជីវិត/i,
    term: { en: 'Life line', km: 'ខ្សែជីវិត' },
    text: {
      en: 'The curved line around the base of the thumb. In palmistry it describes energy and lifestyle — it does NOT show how long you will live.',
      km: 'ខ្សែកោងជុំវិញគល់មេដៃ។ ក្នុងហោរាសាស្ត្របាតដៃ វាពិពណ៌នាអំពីថាមពល និងរបៀបរស់នៅ — វាមិនបង្ហាញថាអ្នកនឹងរស់បានយូរប៉ុណ្ណាទេ។',
    },
  },
];
