export default function benchmark<T, T2>(
  label: string,
  f: (x: T2) => T,
  ...args: T2[]
): T {
  console.time(label)
  const result = f.apply(null, args);
  console.timeEnd(label);
  return result;
}