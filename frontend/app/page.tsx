import StoreShell from "../components/store/StoreShell";
import { getStoreData } from "../lib/store-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getStoreData();
  return <StoreShell data={data} />;
}
