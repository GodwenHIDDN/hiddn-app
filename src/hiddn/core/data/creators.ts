export type Creator = { id: string; name: string; joinedAt: string; profileImage?: string; palette?: string[] };

export async function fetchCreatorsMock(): Promise<Creator[]> {
  const now = Date.now();
  const hours = (h: number) => new Date(now - h*3600_000).toISOString();
  const list: Creator[] = Array.from({length: 12}).map((_,i)=>({
    id: `c-${i+1}`,
    name: `Creator ${i+1}`,
    joinedAt: hours(i*4),
    profileImage: `https://source.unsplash.com/featured/?portrait,person&sig=${3100+i}`,
    palette: undefined
  }));
  return list;
}
