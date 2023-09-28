export default function getCategories(): { key: string; name: string; desc: string }[] {
    return [
      { key: 'help', name: 'Help 🤸🏼‍♂️', desc: 'ask something' },
      { key: 'show', name: 'Show 🏋🏼‍♀️', desc: "share what you've made" },
      { key: 'random', name: 'Random 🧜🏼', desc: 'Post random things' },
    ];
  }  