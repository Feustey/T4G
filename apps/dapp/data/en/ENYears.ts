export const years = [
  {
    value: '',
    label: 'Select a Year',
    disabled: true,
  },
];

for (let year = new Date().getFullYear(); year >= 1950; year--) {
  const objet = { value: `${year}`, label: `${year}`, disabled: false };
  years.push(objet);
}
