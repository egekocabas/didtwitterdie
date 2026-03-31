import { lazy, Suspense } from "react";
import { useData } from "./hooks/useData";
import Layout from "./components/Layout";
import LoadingSkeleton from "./components/LoadingSkeleton";
import Footer from "./components/Footer";
import HeroSection from "./components/HeroSection";

const TrendsChart = lazy(() => import("./components/TrendsChart"));
const RankingChart = lazy(() => import("./components/RankingChart"));
const VerdictSection = lazy(() => import("./components/VerdictSection"));

interface ErrorStateProps {
  message: string;
}

function ErrorState({ message }: ErrorStateProps) {
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

  if (!data) return null;

  return (
    <Layout>
      <div className="space-y-20">
        <HeroSection radar={data.radar} tranco={data.tranco} />
        <Suspense fallback={<LoadingSkeleton />}>
          <RankingChart data={data.tranco} />
          <TrendsChart />
          <VerdictSection data={data} />
        </Suspense>
        <Footer updatedAt={data.updated_at} />
      </div>
    </Layout>
  );
}

export default App;
