/** The scrapbook contents. Copy lives here, never inside a component. */
import photo1 from "@/assets/images/photo-1.jpg";
import photo2 from "@/assets/images/photo-2.jpg";
import photo3 from "@/assets/images/photo-3.jpg";
import photo4 from "@/assets/images/photo-4.jpg";

export type Memory = {
  src: string;
  alt: string;
  caption: string;
  date: string;
  story: string;
  rotation: number;
  tapeRotation: number;
  tapeWidth: number;
  offset: string;
  secret?: string;
};

export const memories: Memory[] = [
  {
    src: photo2,
    alt: "Foto Saat Kita SKB",
    caption: "Foto saat kita SKB",
    date: "suatu hari yang indah",
    story:
      "Ahahah foto kita saat nunggu sebelum tampil di backstage,awal awal saat aku tau tentang F aowkaowk",
    rotation: -3,
    tapeRotation: -8,
    tapeWidth: 118,
    offset: "md:mt-24",
  },
  {
    src: photo3,
    alt: "Fotoo violinn 1!!",
    caption: "Foto Violinn 1!!",
    date: "Suatu hari di gracak",
    story:
      "Hari kita dimana latian skb,kgnn bngttt pgn lgi,kita belum terlalu deket si pas itu hehe,untung sekarang udah",
    rotation: 2.6,
    tapeRotation: 6,
    tapeWidth: 96,
    offset: "md:-mt-6",
    secret:
      "you clicked five times. okay — this was the day I knew we are very very very good friend.",
  },
  {
    src: photo4,
    alt: "Foto Aftershow wisuda",
    caption: "",
    date: "Suatu siang yang sedih",
    story:
      "disini ak sedi bgt si aslinya soalnya tampilan terkahir,but untung lah setlah itu ak ngajak jalan jalan wkwkw",
    rotation: -1.8,
    tapeRotation: -5,
    tapeWidth: 108,
    offset: "md:mt-16",
  },
  {
    src: photo1,
    alt: "Foto selff di sbyy yayy",
    caption: "Foto selff di sbyy yayy",
    date: "Tanggall 7 Juliii",
    story: "the best best dayy ever in my lifee,setelah kesedihan ak dada dada itu (hehe) akhirnya kita ketemu lagi tanggal 7 julii yowww",
    rotation: 3.2,
    tapeRotation: 8,
    tapeWidth: 124,
    offset: "md:mt-4",
  },
];

export const finalePhotos = [photo2, photo3, photo4, photo1];
export const openingPhoto = photo1;
