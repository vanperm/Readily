/* ============================================================
   Readily: catalog data
   Two disjoint sets — LIBRARY_BOOKS (free, borrow, licenses) and
   STORE_BOOKS (paid, buy to own). Cover art is AI-generated artwork
   (img/covers/) with the title/author printed directly on it; the
   title/author/genre/blurb/epigraph/pages below were all written to
   match what's on each cover (see art.js for renderCoverArt()).
   ============================================================ */

const LIBRARY_BOOKS = [
  {
    id: "orchard-glass",
    title: "Paradox",
    author: "Margarita Perez",
    genre: "Science Fiction",
    year: 2019,
    blurb: "A man who has learned to slow his own time steps wrong once, and finds himself two minutes ahead of everyone he has ever loved.",
    call: "SCI 813.9 PER",
    licenses: 3,
    spine: "#5B4636",
    cover: "#909391",
    emblem: "leaf",
    epigraph: "He built the paradox to save her. He is still inside it.",
    pages: [
      "The city had learned to live at half his speed, and Adrian had stopped correcting people who called it a gift. It had taken him nine years to understand what the doctors meant when they said his perception of time had “detached”; it took considerably less time to realize that everyone he loved was aging in a current he could no longer swim against.",
      "The paradox was supposed to be simple: step back in, live the two minutes he owed, step out unchanged. Instead he stepped into a version of the morning where the coffee was still warm and his own reflection in the window hadn't arrived yet, and understood, with the particular calm of a man out of options, that a paradox does not close just because you asked it to."
    ]
  },
  {
    id: "long-orbit",
    title: "Whispers of the Night",
    author: "Mariana Napolitani",
    genre: "Fantasy",
    year: 2031,
    blurb: "A boy who dreams the same shoreline every night discovers the dreams are not his alone, and someone on the other side has been waiting to meet him.",
    call: "FAN 813.2 NAP",
    licenses: 2,
    spine: "#1c2b3a",
    cover: "#6f6a98",
    emblem: "orbit",
    epigraph: "Every dream you finish, someone else begins.",
    pages: [
      "Tomas had walked the same dream-shore for as long as he could remember: the moon too large, the water too still, two birds that never quite finished crossing the sky. He had stopped mentioning it at breakfast around age seven, when his mother's face did the thing it always did when a dream sounded too specific to be only his.",
      "It was on the four hundredth night, by his own quiet count, that he noticed the footprints in the sand were not his own size, and that they were fresh, and that whoever had left them was clearly in the habit of arriving just before he did, and leaving, he suspected, just after."
    ]
  },
  {
    id: "marguerite-letters",
    title: "You Are Not Alone",
    author: "Avery Davis",
    genre: "Fiction",
    year: 2016,
    blurb: "A boy who lost his father learns, one ordinary Tuesday, that grief has been walking a half-step behind him the whole time, not to haunt him, but to keep him company.",
    call: "FIC 813.3 DAV",
    licenses: 4,
    spine: "#7a3b52",
    cover: "#1c1c1b",
    emblem: "quill",
    epigraph: "You are not alone. You have simply not turned around yet.",
    pages: [
      "Eli had gotten good at pretending the empty half of the house didn't echo, and better still at pretending he hadn't noticed the shape that sometimes stood in it, patient, unhurried, never quite close enough to touch. His mother said grief did strange things to a boy his age. She was not wrong. She was also not quite right.",
      "It was on the ordinariest Tuesday of the year, walking home in the kind of light that makes everything look temporary, that he finally turned around instead of walking faster, and found the shape waiting exactly where it always had been: not a haunting, he understood then, but a promise nobody had said out loud. That he had never once been walking that road by himself."
    ]
  },
  {
    id: "cartographers-daughter",
    title: "The Everflame Chronicles",
    author: "Rosa Maria Aguado",
    genre: "Fantasy",
    year: 2020,
    blurb: "The last silver-haired heir of a dying flame-order must decide whether to let an ancient fire die with her, or become what it demands next.",
    call: "FAN 813.5 AGU",
    licenses: 3,
    spine: "#3a5a4a",
    cover: "#92949c",
    emblem: "compass",
    epigraph: "The flame does not choose the worthy. It only ever chooses the willing.",
    pages: [
      "Ysolde had been told her whole life that the Everflame chose its keepers the way winter chooses which trees to strip bare: without malice, without apology, and always, always without asking first. She had not expected it to choose her on the one night she had finally stopped waiting for it to.",
      "The forest went quiet the way it only does before something enormous changes its mind about staying hidden, and when she pressed her palm to the old stone and felt heat where there should have been two centuries of frost, she understood that the chronicles her grandmother kept had never once mentioned what happens after the choosing. Only before."
    ]
  },
  {
    id: "quiet-ledger",
    title: "The Story of the Princess",
    author: "Olivia Wilson",
    genre: "Fantasy",
    year: 2022,
    blurb: "A princess trained her whole life to rule a kingdom finds the throne easy to inherit and impossible to forgive.",
    call: "FAN 813.1 WIL",
    licenses: 5,
    spine: "#4a4030",
    cover: "#495b64",
    emblem: "scale",
    epigraph: "A crown remembers every hand that has ever worn it.",
    pages: [
      "Lian had been raised on the understanding that a princess does not choose her kingdom, only the manner in which she carries it, and she had believed this completely until the night her father's crown was carried to her still warm, and she realized no one had ever taught her how to carry grief and a kingdom in the same two hands.",
      "The cranes still flew over the palace lake every evening, the way they had when she was small enough to be lifted onto the railing to watch them, and she found herself standing there again now, in robes too heavy for the wind, asking them the only question her tutors had never prepared her to answer: what a story about a princess is supposed to do once the story stops being about becoming one."
    ]
  },
  {
    id: "hollow-bell",
    title: "The Story of Two Lovers",
    author: "Ketut Susilo",
    genre: "Romance",
    year: 2014,
    blurb: "Two people, engaged to marry other people, spend one sunset finding out what they were never given the chance to become.",
    call: "ROM 843.9 SUS",
    licenses: 2,
    spine: "#2b2430",
    cover: "#876a61",
    emblem: "bell",
    epigraph: "Some people are not a beginning. They are only ever an almost.",
    pages: [
      "They had met exactly once before, at a wedding that was not their own, and had not spoken since, which was either very sensible or the great regret of both their lives, depending on which one of them you believed on any given evening. The second meeting was an accident. The sunset was not.",
      "Neither of them said the thing they had both been rehearsing separately for two years, because saying it would have made it real, and there are some almosts that survive only as long as they are never quite finished. Instead they stood together and watched the light go, and let that be the whole conversation."
    ]
  },
  {
    id: "sonnets-rented-room",
    title: "The Day We Met",
    author: "Claudia Wilson",
    genre: "Romance",
    year: 2018,
    blurb: "A chance collision on the worst day of her year turns out to be the one appointment neither of them had scheduled but both of them needed.",
    call: "ROM 843.1 WIL",
    licenses: 3,
    spine: "#6b5a3a",
    cover: "#689ab5",
    emblem: "window",
    epigraph: "She was not looking for anyone. That was, apparently, the whole point.",
    pages: [
      "The coffee went everywhere, which was, in fairness, mostly her fault, and he was gracious about it in the specific way of someone who has clearly been told his whole life that he is gracious, which should have been irritating and instead was not, and she spent the rest of the walk to work trying to work out why.",
      "They exchanged names, not numbers, which felt at the time like the responsible choice, and it was only three streets later, coffee-stained and already smiling for no defensible reason, that she understood she had just made the first mistake of what she hoped would be a very long string of mistakes with him."
    ]
  },
  {
    id: "house-remembers",
    title: "The Kingdom.",
    author: "Olivia Wilson",
    genre: "Fantasy",
    year: 1998,
    blurb: "A kingdom built on one unbroken promise begins to crack the year its king finally breaks it.",
    call: "FAN 813.3 WIL",
    licenses: 3,
    spine: "#4a3a2e",
    cover: "#24211c",
    emblem: "key",
    epigraph: "A kingdom is only ever as old as its oldest kept promise.",
    pages: [
      "The kingdom of Aveline had stood for three hundred years on the strength of a single vow made by its first king: that the crown would never take more than the land could give back. It was, historians agreed, an unusually specific promise to found a country on, and an unusually durable one, until the winter it wasn't.",
      "No one could say afterward who broke it first, the king or the land, but the frost came early that year and did not leave, and in the villages people began repeating the old vow to each other like a question rather than a fact, the way you say a name aloud to see if it still answers."
    ]
  }
];

const STORE_BOOKS = [
  {
    id: "tiny-habits-architecture",
    title: "Beneath the Stars",
    author: "Hannah Morales",
    genre: "Fantasy",
    year: 2023,
    price: 14.99,
    blurb: "A girl who can read her fate in the stars discovers the sky has been lying to her for exactly as long as she's been listening.",
    call: "FAN 813.6 MOR",
    spine: "#5a4a30",
    cover: "#323a51",
    emblem: "compass",
    epigraph: "The stars do not lie. They only ever tell you what you're ready to hear.",
    pages: [
      "Every child in Ferrow was given a star at birth, a single point of light their mother would show them on the clearest night of their first year, and told that this star, and no other, would guide every important decision of their life. Wren had followed hers faithfully for seventeen years.",
      "It was the night of the falling stars, the one night the sky was allowed to contradict itself, that she watched her own star streak sideways into a dead sprint across the dark and understood, with the vertigo of a life quietly rearranging itself, that destinies were not fixed points. They were only ever the last place you happened to look."
    ]
  },
  {
    id: "currency-of-calm",
    title: "Golden Silence",
    author: "Laura Bennett",
    genre: "Self-Help",
    year: 2021,
    price: 12.99,
    blurb: "A quiet argument for treating an unhurried evening as an achievement, not an absence of one.",
    call: "SLF 158.2 BEN",
    spine: "#3a4a4a",
    cover: "#be8f57",
    emblem: "scale",
    epigraph: "Silence is not empty. It is simply not shouting yet.",
    pages: [
      "Somewhere along the way we agreed, without ever voting on it, that a full calendar was the same thing as a full life, and that silence, when it arrived uninvited on a Tuesday evening, was a problem to be solved rather than a room worth sitting in.",
      "This book asks a smaller, stranger question: what if the quiet evenings, the ones that produce nothing you could put on a resume, are not the gaps between the meaningful parts of your life, but the only parts sturdy enough to hold the rest of it up."
    ]
  },
  {
    id: "salt-road",
    title: "Stories Left in Our Uniforms",
    author: "Juliana Silva",
    genre: "Fiction",
    year: 2020,
    price: 16.99,
    blurb: "Two classmates who never once spoke in six years of the same uniform find, on the last day of school, that they'd been writing the same story separately the whole time.",
    call: "FIC 813.4 SIL",
    spine: "#7a5a3a",
    cover: "#679bc1",
    emblem: "compass",
    epigraph: "Some friendships start on the very last day, out of spite for all the days before it.",
    pages: [
      "They had shared a school, a bus route, and for one memorable year a locker number one digit apart, and had never, in six years, said more to each other than the required exchanges of borrowed pencils. It was only on the last day, uniforms already too small, that either of them said anything that counted.",
      "It turned out they had both kept a version of the other in their pocket the whole time, a whole invented friendship neither had had the nerve to start, and they spent the last afternoon of school trying, badly and honestly, to catch up on six years they'd spent close enough to touch and too shy to try."
    ]
  },
  {
    id: "stolen-manuscript",
    title: "Walk Into the Shadow",
    author: "Estelle Darcy",
    genre: "Fantasy",
    year: 2022,
    price: 15.99,
    blurb: "A woman who has spent her life fleeing her own shadow finally turns to face it, and finds it has been trying to save her the whole time.",
    call: "FAN 813.8 DAR",
    spine: "#4a3a52",
    cover: "#363e28",
    emblem: "quill",
    epigraph: "Not every shadow is something that follows you. Some of them are waiting up ahead.",
    pages: [
      "Neve had been told since childhood that her shadow was wrong, too long at noon, too dark at dusk, prone to moving half a second before she did, and she had spent thirty years perfecting the art of never looking directly at it. The forest at Ashwell did not allow her that luxury.",
      "It was waiting for her at the end of the path, kneeling in the old leaves, and when she finally made herself walk toward it instead of away, it did not attack, and it did not vanish. It only looked up, wearing her own face twenty years older, and said the thing she had spent her whole life running from hearing: that it had been protecting her, not haunting her, all along."
    ]
  },
  {
    id: "weight-of-small-decisions",
    title: "Realm of Broken Oaths",
    author: "Jonathan Patterson",
    genre: "Fantasy",
    year: 2019,
    price: 13.99,
    blurb: "A knight who broke one oath to save a kingdom must now walk back into the realm that has never forgiven him for it.",
    call: "FAN 813.7 PAT",
    spine: "#3a3a4a",
    cover: "#5e533e",
    emblem: "scale",
    epigraph: "Every realm has one oath its history refuses to forgive.",
    pages: [
      "They called him oathbreaker before they called him by his name, which was, Corin supposed, a fair trade for a kingdom that was still standing because of what he'd broken rather than what he'd kept. He had not set foot past the old cathedral gate in eleven years.",
      "The road up to it was exactly as long as he remembered, and exactly as unforgiving, birds scattering off the ruined arch the way they always had, as if even they remembered which oath had been sworn there, and which one hadn't survived the night he chose the kingdom over the vow."
    ]
  },
  {
    id: "gilded-terrace",
    title: "Whispers of Nature",
    author: "Sebastian Bennett",
    genre: "Non-Fiction",
    year: 2017,
    price: 14.49,
    blurb: "A naturalist's field notes on the small, overlooked balances that keep a wetland, and everything downstream of it, alive.",
    call: "NF 508.2 BEN",
    spine: "#6b4a3a",
    cover: "#83b599",
    emblem: "leaf",
    epigraph: "Nature does not whisper because it is quiet. It whispers because it expects you to be listening.",
    pages: [
      "I have spent eleven years cataloguing a single wetland, and I can tell you with some confidence that the loudest thing in it is never the thing worth writing down. The heron gets the attention. The lotus root quietly feeding an entire ecosystem underneath it does not.",
      "This book is an argument for paying attention to the unglamorous middle of any natural system: the insects nobody names, the grazing animal everyone overlooks, the slow work of water finding its way downhill. The wetland does not perform for us. It simply keeps its balance, whether or not we notice."
    ]
  },
  {
    id: "seven-summers",
    title: "Fall Memories",
    author: "Eleanor Whitfield",
    genre: "Fiction",
    year: 2021,
    price: 13.49,
    blurb: "A daughter returns to close up the family farmhouse for winter and finds every gate, gutter, and fence line still keeping a memory she'd forgotten she had.",
    call: "FIC 813.9 WHI",
    spine: "#3a4a5a",
    cover: "#d2c2a8",
    emblem: "window",
    epigraph: "The land keeps what the family lets go of.",
    pages: [
      "The gate still stuck the same way it always had, and Della stood there in the cold for a full minute before she remembered the trick to it, lift and pull, the exact motion her grandfather's hands had known without thinking. Nobody had oiled the hinge in the two years since he'd gone.",
      "She had come to close the house up for winter, an afternoon's job at most, and instead found herself walking the whole property before the light went, past the orchard he'd planted too close together on purpose, so the trees would have to lean on one another to grow tall, which was, she realized now, exactly the kind of thing he would never have said out loud."
    ]
  },
  {
    id: "hollow-crest",
    title: "Towards Summer",
    author: "Avery Devis",
    genre: "Self-Help",
    year: 2015,
    price: 17.99,
    blurb: "A short, honest book about the long grey stretch before things get better, and why pushing towards summer is still a decision you make in winter.",
    call: "SLF 158.3 DEV",
    spine: "#2a3a2e",
    cover: "#b3b2a8",
    emblem: "orbit",
    epigraph: "You do not wait for summer. You walk towards it, in the fog, before you can see it.",
    pages: [
      "Nobody warns you that the hardest part of getting better is the stretch where nothing visibly improves yet, the fog before the field, the long grey weeks where the only evidence you have that you're moving forward is that you decided, again this morning, to keep walking.",
      "This is a short book about that stretch. Not the breakthrough, not the after-photo, just the unglamorous middle where the actual work happens, one deliberately unremarkable morning at a time, walked towards a summer you cannot yet see and have decided to trust anyway."
    ]
  }
];
