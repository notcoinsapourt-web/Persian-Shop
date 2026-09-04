import MaintenancePage from "../components/store/MaintenancePage";
import StoreShell from "../components/store/StoreShell";
import { getStoreData } from "../lib/store-data";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getStoreData();
  if (data.settings.websiteMaintenance) {
    return <MaintenancePage shopName={data.settings.shopName} supportUsername={data.settings.supportUsername || "@Znoxe_shope"}/>;
  }
  return <StoreShell data={data} />;
}
