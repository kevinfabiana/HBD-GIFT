/**
 * Story configuration — the single place to personalize the whole letter.
 *
 * Edit the values below to make the story your own. The rest of the app
 * reads from here, so you do not need to hunt through components.
 */

import type { BeachLine } from "@/js/gsap/beachTimeline";

import cover1 from "@/assets/images/cover-1.jpg";
import cover2 from "@/assets/images/cover-2.jpg";
import cover3 from "@/assets/images/cover-3.jpg";
import cover4 from "@/assets/images/cover-4.jpg";

export type Track = {
  cover: string;
  title: string;
  artist: string;
  reason: string;
  /** Audio file served from /public/media — swap the file, keep the name. */
  src: string;
};

export const story = {
  /** Page metadata */
  meta: {
    title: "A Letter for Your Next Chapter",
    description:
      "Every memory is a page. Every smile is a new beginning. A quiet, illustrated journey through memories, music and hopes for the year ahead.",
    ogTitle: "A Letter for Your Next Chapter",
    ogDescription:
      "An interactive storybook of memories, music and hopes — written for someone beginning a new chapter.",
  },

  /** The gift overlay that opens the experience */
  heroGift: {
    eyebrow: "Sedikit ucapan",
    lead: "Hadiahh pertama dari kohh",
    hint: "Open when you're ready.",
    cta: "klik kotaknya buat buka",
    skip: "Skip intro",
  },

  /** The morning invitation / hero */
  hero: {
    eyebrow: "ucapan buat cipaa",
    title: "Happy Birthdayy",
    accent: "Cipaaa!!",
    tagline:
      "ucapan full dari ak yang ngoding beberapa hari 😁\nsemoga suka yaa, maaf kalo masih ada yang jelek atau agak alay wkwkwk (masih pemula 😔)\nmaaf juga belum bisa kasih domain '.com', gapunya uang 😭 jadi masih bisanya pakai domain gratisan vercel 😂",
    scrollHint: "scrollnya pelan aja 😁",
  },

  /** The handwritten letter */
  letter: {
    eyebrow: "Page one",
    title: "Kata Kata dari aku",
    paragraphs: [
      "Happy Sweetseventeen yaaa cippp,semogaa apapun yang selaluu kamu cita citakann dan ingin kann,cepat terkabull,aminnn.Terus sehat selaluuu aminnn,dannn masalah masalah yang sedang kamu hadapii semogaa cepat diringankan dan selesaii,aminnn",
      "terima kasih uda jadii selaluu tempatt cerita akuu,ngasih advice dan lain lainn itulaa,semogaa di balass oleh Allah dengan hal baikk di umur yang baruu inii aminnn",
    ],
    closing: "So here it is, one page at a time.",
  },

  /** The world that builds around the scrapbook */
  world: {
    eyebrow: "our little memories",
    title: "Our Best Moments",
    accent: "surabaya road trip",
    hand: "gabisa move onnn bngtt waaa 😭",
    openingPhotoCaption: "where it all started",
  },

  /** The scrapbook itself */
  scrapbook: {
    ariaLabel: "Scrapbook of memories",
    closeButton: "put it back",
  },

  /** The soundtrack */
  soundtrack: {
    eyebrow: "side b",
    title: "Chapter: us",
    accent: "beberapa lagu playlist kita",
  },

  /** The guitar serenade */
  guitar: {
    eyebrow: "a song, played once",
    title: "Ucapan Ulang Tahun dari",
    accent: "Ucapan dari Gitarku",
    subtitle: "(Ak gabisa nyanyi,biar gitarku aja sekalian yg nyanyi hehe)",
    missingCaption: "semogaa suka yaa",
    playingCaption: "one small song, with one sincere wish",
    note: "I hope this little song can become one of today's memories.",
    signature: "— Kevin",
  },

  /** The shore scene */
  beach: {
    lines: [
      {
        at: 0.03,
        to: 0.15,
        text: "Semoga Umur Barumu ini seperti sunrise",
        position: "left-[8%] top-[22%] max-w-[19rem] text-left",
      },
      {
        at: 0.2,
        to: 0.32,
        text: "Diawali dengan indahh dan penuh warna hangat.",
        position: "right-[9%] top-[30%] max-w-[18rem] text-right",
      },
      {
        at: 0.38,
        to: 0.5,
        text: "Meskipun di siang harinya tidak tau apa yang terjadi.",
        position: "left-[10%] top-[18%] max-w-[17rem] text-left",
      },
      {
        at: 0.55,
        to: 0.66,
        text: "Tetapi matahari terus bersinar menyinari bumi.",
        position: "right-[8%] top-[24%] max-w-[19rem] text-right",
      },
      {
        at: 0.69,
        to: 0.79,
        text: "sunset adalah salah satu contoh bahwa semua bisa berakhir dengan indah.",
        position: "left-[9%] top-[26%] max-w-[21rem] text-left",
      },
      {
        at: 0.82,
        to: 0.9,
        text: "Dan keesokan harinya,matahari bersinar lagi.",
        position: "right-[10%] top-[22%] max-w-[18rem] text-right",
      },
    ] satisfies BeachLine[],
    lastPage: {
      eyebrow: "The last page",
      title: "bagaimana pun keadaan dunia ini",
      accent: "semoga kmu selalu bahagia beneran,seperti saat kmu memperlalkukan orang lain dengan baik",
      body: "Happy birthday.semoga makinn berkembangg dan semakin baikk",
    },
  },

  /** The petal finale / wishes */
  finale: {
    eyebrow: "and the wind keeps going",
    title: "Wishes For",
    accent: "Your Next Chapter",
  },

  /** The replay / closing */
  replay: {
    eyebrow: "The end, for now",
    title: "Makasih udah liat sampe akhir",
    accent: "Sedikit ucapan dari aku",
    cta: "Ulangi Dari Awal",
  },

  /** Page footer */
  footer: "-Ur Friend,Kevin",
};

/**
 * The soundtrack tracks.
 *
 * To swap a song, just drop a new file into `public/media/` using the same
 * name as in `src`. Nothing else needs to change.
 */
export const tracks: Track[] = [
  {
    cover: cover1,
    title: "Bunga Abadi",
    artist: "chapter: us",
    reason: "Lagu kenangan jalan-jalan pertama kita.",
    src: "/media/bunga-abadi.mp3",
  },
  {
    cover: cover2,
    title: "Count On Me",
    artist: "chapter: us",
    reason: "I am always here, u can count on me.",
    src: "/media/count-on-me.mp3",
  },
  {
    cover: cover3,
    title: "Best Part",
    artist: "chapter: us",
    reason: "One of ur favorite song.",
    src: "/media/best-part.mp3",
  },
  {
    cover: cover4,
    title: "Ini Abadi",
    artist: "chapter: us",
    reason: "Salah satu lagu yang ada di playlist kita juga.",
    src: "/media/ini-abadi.mp3",
  },
  {
    cover: cover1,
    title: "Kita Kesana",
    artist: "chapter: us",
    reason: "Lagu penampilan terakhir kita di panggung Gracak.",
    src: "/media/kita-kesana.mp3",
  },
];

export type StoryConfig = typeof story;
