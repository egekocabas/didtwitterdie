import { useData } from "./hooks/useData";
import Layout from "./components/Layout";
import LoadingSkeleton from "./components/LoadingSkeleton";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";
import DnsChart from "./components/DnsChart";
import TrendsChart from "./components/TrendsChart";
import RankingChart from "./components/RankingChart";
import RegionalChart from "./components/RegionalChart";
import VerdictSection from "./components/VerdictSection";

function ErrorState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center">
      <p className="text-lg font-semibold text-red-500 dark:text-red-400">Failed to load data</p>
      <p className="text-sm text-gray-500 dark:text-gray-400">{message}</p>
    </div>
  );
}

function App() {
  const { data, loading, error } = useData();

  if (loading) {
    return (
      <Layout>
        <LoadingSkeleton />
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorState message={error} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-20">
        <HeroSection radar={data.radar} />
        <DnsChart data={data.radar} />
        <TrendsChart />
        <RankingChart data={data.tranco} />
        <RegionalChart data={data.radar} />
        <VerdictSection data={data} />
        <Footer updatedAt={data.updated_at} />
      </div>
    </Layout>
  );
}

export default App;
