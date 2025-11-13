export const cn = (...inputs) =>
  inputs
    .flat()
    .filter(Boolean)
    .join(' ');

