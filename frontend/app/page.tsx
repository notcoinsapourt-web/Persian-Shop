import Storefront from "../components/Storefront";
import { getStoreData } from "../lib/store-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getStoreData();
  return <Storefront data={data} />;
}
