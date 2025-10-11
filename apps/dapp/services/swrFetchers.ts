export const rawFetcher = (url: string) =>
  fetch(url)
    .then((res) => res.text())
    .catch((e) => console.error(e));
