export function generatePatientUMID() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const getLetters = (length) =>
    Array.from({ length }, () => letters[Math.floor(Math.random() * letters.length)]).join('');

  const getNumber = () =>
    String(Math.floor(Math.random() * 100000)).padStart(5, '0');

  const part1 = getLetters(2);
  const part2 = getNumber();
  const part3 = getLetters(2);

  return `${part1}${part2}${part3}`;
}

// Default export for convenience
export default generatePatientUMID;
