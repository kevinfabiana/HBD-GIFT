/* Letters collected from the SKB Surabaya team.
 * Each letter carries its own mascot, who peeks out from behind the paper. */

export type MascotId = "red-panda" | "cat" | "grizzly" | "ice-bear";

export type Letter = {
  id: string;
  from: string;
  stamp: string;
  decor: "flower" | "ribbon" | "sticker" | "stamp";
  seal: string;
  title: string;
  body: string[];
  sign: string;
  mascot: MascotId;
  mascotName: string;
};

export const lettersSection = {
  eyebrow: "little surprises",
  title: "ucapann dari team skb sbyy!",
  subtitle: "katanya masih ada beberapa surat yang belum dibuka 👀",
  hint: "ketuk salah satu surat",
};

export const letters: Letter[] = [
  {
    id: "letter-1",
    from: "dari anak skb",
    stamp: "SBY · 01",
    decor: "flower",
    seal: "A",
    title: "buat cipaa",
    body: [
      "hi tiramisu lover! happy sweet seventeen yeaaa (kok udah besar sih 🥲) semoga di umur yang 17 ini dipenuhi sama kebahagiaan dan kasih sayang 🥰 dan semoga tercapai psikologi ugm itu! seru gak sih, masih umur 17 almet coklat udah digenggaman anjay. ditunggu ktp birunya cip!",
    ],
    sign: "— Aurell (Red Panda)",
    mascot: "red-panda",
    mascotName: "Aurell",
  },
  {
    id: "letter-2",
    from: "dari anak skb",
    stamp: "SBY · 01",
    decor: "ribbon",
    seal: "A",
    title: "buat cipaa",
    body: [
      "Halo cipaa, happy birthday, may your seventeen feels like tiramisu (not everyone enjoy tiramisu but I'm sure you do, so please don't live the way people 'will like it' but the way YOU like it) and never felt too much because your muchness is what makes you yourself.",
      "Note: sorry I can't write a good letter but I hope you felt the love I gave u.",
    ],
    sign: "— Aiqaa (Cat)",
    mascot: "cat",
    mascotName: "Aiqaa",
  },
  {
    id: "letter-3",
    from: "dari anak skb",
    stamp: "SBY · 01",
    decor: "sticker",
    seal: "F",
    title: "buat cipaa",
    body: [
      "hellow cipuyy",
      "Happy birthdayy yaa smoga di umur yang baru ini segala hal di permudahh sama allahh, truss berkembang ya cipp jadii orang yang baik selalu sama orang lain, jadi orang yang selalu ceria, jadi orang yang masih nafas (HARUS). Semogaa ikan ikan yg kamu banggakan juga turut serta mendoakan kamu YEYYY HEPI BIRTDHHDAYY . semoga ikannya gak dimakan kucing lagi ya",
    ],
    sign: "— Fabioo (Grizzly)",
    mascot: "grizzly",
    mascotName: "Fabioo",
  },
  {
    id: "letter-4",
    from: "dari anak skb",
    stamp: "SBY · 01",
    decor: "stamp",
    seal: "H",
    title: "buat cipaa",
    body: [
      "weeyy habede yaks, udah besar tapi masi smoll :< eh, badan kecil tapi mimpi harus tinggii! semoga tahun ini full berkah ya, semua cita-cita kesampaian. kita usahakan PTN itu!! doa buat kita semua ;>",
    ],
    sign: "— Hilmann (Icebearr)",
    mascot: "ice-bear",
    mascotName: "Hilmann",
  },
];
