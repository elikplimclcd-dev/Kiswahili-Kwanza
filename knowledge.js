/*
  knowledge.js — the assistant's "bank" of grammar Q&A.

  This is separate from data.js on purpose: data.js is the course itself
  (lessons, vocab, sentences); this file is extra explanatory material the
  assistant can draw on when someone asks a "how/why" grammar question that
  a single vocab pair doesn't answer.

  The assistant ALSO automatically searches every word and example sentence
  in data.js — you don't need to duplicate vocab here. Use this file for
  explanations, summaries, and things that span multiple lessons.

  TO ADD A NEW ENTRY, copy this shape and add it to the array below:

  {
    id: "kb-unique-id",             // any unique short id
    q: "A question a learner might type",
    a: "Your answer. Keep it a few sentences. You can include a short
        Swahili example, e.g. Ninataka chai (I want tea).",
    tags: ["extra", "keywords", "someone", "might", "type", "instead"],
    lessonId: "ch05"                // optional: id of the most relevant
                                     // chapter in data.js, adds a "go to
                                     // lesson" link and slightly boosts
                                     // this answer when someone is already
                                     // viewing that lesson. Leave off if
                                     // it doesn't map to one chapter.
  },

  No server, no rebuild step — just add entries and re-upload this file.
*/

const KNOWLEDGE_BANK = [
  {
    id: "kb-noun-classes",
    q: "What are Swahili noun classes?",
    a: "Swahili nouns are grouped into classes (ngeli) by their prefix, and everything attached to a noun — adjectives, verbs, possessives — has to agree with that class. The two biggest classes are M-/WA- for people (mtu, person \u2192 watu, people) and M-/MI- for plants and objects (mti, tree \u2192 miti, trees). Once you know a noun's class, its agreement pattern is predictable everywhere else in the sentence.",
    tags: ["noun class", "ngeli", "m-wa", "m-mi", "prefix", "agreement", "classes"],
  },
  {
    id: "kb-subject-prefix",
    q: "What is a subject prefix in Swahili verbs?",
    a: "Every Swahili verb starts with a short prefix showing who is doing the action, replacing the need for a separate pronoun. Ni- is I, u- is you, a- is he/she, tu- is we, m-/mnyi- is you-all, wa- is they. For example, Ninasoma means \"I am reading\" \u2014 ni- (I) + na- (tense) + -soma (read).",
    tags: ["subject prefix", "pronoun", "ni-", "u-", "a-", "tu-", "wa-", "who is doing"],
  },
  {
    id: "kb-tense-markers",
    q: "How do Swahili verb tenses work?",
    a: "Tense sits as a marker right after the subject prefix. -na- is present (Ninasoma, I am reading), -li- is past (Nilisoma, I read/was reading), -ta- is future (Nitasoma, I will read), and -me- is present perfect (Nimesoma, I have read). Swap the marker and keep everything else the same.",
    tags: ["tense", "na", "li", "ta", "me", "past", "future", "present", "perfect", "marker"],
    lessonId: "ch10",
  },
  {
    id: "kb-negation",
    q: "How do you make a Swahili sentence negative?",
    a: "Present-tense negation changes the subject prefix itself and drops -na-: si- (not I), hu- (not you), ha- (not he/she) \u2014 e.g. Sisomi = \"I don't read\" (compare Ninasoma, I read). Other tenses add a negative marker instead, most often -ku- for the past: Sikusoma = \"I didn't read.\"",
    tags: ["negative", "negation", "si-", "hu-", "ha-", "sikusoma", "not"],
  },
  {
    id: "kb-question-words",
    q: "What are the common Swahili question words?",
    a: "Nani? = Who?, Nini? = What?, Wapi? = Where?, Lini? = When?, Kwa nini? = Why?, Vipi?/Namna gani? = How?, and Ngapi? = How many? They usually come at the end of the sentence: Unaenda wapi? = \"Where are you going?\"",
    tags: ["question words", "nani", "nini", "wapi", "lini", "kwa nini", "vipi", "ngapi", "who what where when why how"],
  },
  {
    id: "kb-possessives",
    q: "How do Swahili possessives work?",
    a: "Possessive words (my, your, his/her...) come after the noun and change their prefix to match the noun's class, similar to adjectives. For M-/WA- nouns the base is -angu (my), -ako (your), -ake (his/her) \u2014 e.g. rafiki yangu = \"my friend.\" The prefix before -angu/-ako/-ake shifts with the noun class.",
    tags: ["possessive", "my", "your", "his", "her", "yangu", "ako", "ake"],
  },
  {
    id: "kb-plurals",
    q: "How do you make Swahili nouns plural?",
    a: "Plurals depend on the noun's class rather than a single rule like adding \"s\". The most common pattern, M-/WA-, swaps m- for wa- (mtoto, child \u2192 watoto, children). M-/MI- swaps m- for mi- (mti, tree \u2192 miti, trees). Some classes, like KI-/VI-, swap ki- for vi- (kitabu, book \u2192 vitabu, books).",
    tags: ["plural", "plurals", "watoto", "miti", "vitabu", "ki-vi", "m-wa", "m-mi"],
  },
  {
    id: "kb-greetings-overview",
    q: "What are the basic Swahili greetings?",
    a: "Hujambo? / Sijambo is the everyday how-are-you exchange (literally \"no problems?\" / \"no problems\"). Shikamoo, answered with Marahaba, is the respectful greeting used toward elders. Habari ya asubuhi/mchana/jioni? asks for news of the morning/afternoon/evening, usually answered Nzuri (good).",
    tags: ["greetings", "hujambo", "sijambo", "shikamoo", "marahaba", "habari", "hello"],
    lessonId: "ch02",
  },
  {
    id: "kb-imperative",
    q: "How do you give commands in Swahili?",
    a: "The direct command to one person is just the bare verb root, e.g. Fanya! (Do!), Funga! (Close!). For a group, add -eni: Fanyeni! (Do it, all of you!). A softer, more polite version uses a subject prefix plus -e: Ufanye! (You should do), and tu- with -e means \"let's...\": Tufanye! (Let's do it!).",
    tags: ["imperative", "command", "fanya", "fanyeni", "ufanye", "tufanye", "order"],
    lessonId: "ch04",
  },
  {
    id: "kb-adjective-agreement",
    q: "Do Swahili adjectives change to match the noun?",
    a: "Yes \u2014 most adjectives take a prefix that matches the noun's class, the same way possessives and verbs do. -zuri (good/nice) becomes mzuri for an M-/WA- noun (mtoto mzuri, a good child) but wazuri in the plural (watoto wazuri, good children).",
    tags: ["adjective", "agreement", "mzuri", "wazuri", "zuri", "describe"],
  },
  {
    id: "kb-there-is",
    q: "How do you say \"there is\" or \"there are\" in Swahili?",
    a: "Kuna means \"there is / there are\": Kuna watu wengi = \"There are many people.\" Its opposite, hakuna, means \"there isn't / there aren't\": Hakuna shida = \"No problem\" (literally \"there is no problem\").",
    tags: ["there is", "there are", "kuna", "hakuna", "exist"],
  },
  {
    id: "kb-word-order",
    q: "What is the normal Swahili word order?",
    a: "Swahili is Subject-Verb-Object, the same basic order as English: Mtoto anasoma kitabu = \"The child is reading a book.\" Because the subject is already marked on the verb itself, short sentences often drop the separate subject noun entirely: Anasoma kitabu still means \"He/she is reading a book.\"",
    tags: ["word order", "sentence structure", "subject verb object", "svo"],
  },
  {
    id: "kb-numbers",
    q: "How do Swahili numbers work?",
    a: "1\u201310 are largely their own words: moja, mbili, tatu, nne, tano, sita, saba, nane, tisa, kumi. From 11 they build on kumi na... (\"ten and...\"): kumi na moja = 11. Tens are compound too: ishirini (20), thelathini (30), and so on, then combined the same way: ishirini na tano = 25.",
    tags: ["numbers", "moja", "mbili", "tatu", "kumi", "counting", "ishirini"],
  },
  {
    id: "kb-a-of-construction",
    q: "What does the \"-a\" of construction mean in Swahili?",
    a: "The \"-a\" of/belonging-to word links two nouns, similar to English \"of\": kitabu cha mwalimu = \"the teacher's book\" (book of teacher). Like adjectives, this -a takes a prefix matching the first noun's class \u2014 cha here agrees with kitabu.",
    tags: ["of", "-a", "cha", "wa", "possession construction", "belonging"],
  },
];
