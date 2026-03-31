import { lazy, Suspense } from "react";
import { useData } from "@/hooks/useData";
import { usePageMeta } from "@/hooks/usePageMeta";
import Layout from "@/components/Layout";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import MethodologyPage from "@/pages/MethodologyPage";
import PrivacyPage from "@/pages/PrivacyPage";

const TrendsChart = lazy(() => import("@/components/TrendsChart"));
const RankingChart = lazy(() => import("@/components/RankingChart"));
const SocialMediaServiceSection = lazy(() => import("@/components/SocialMediaServiceSection"));
const WikipediaAttentionSection = lazy(() => import("@/components/WikipediaAttentionSection"));
const DirectRankSignalsSection = lazy(() => import("@/components/DirectRankSignalsSection"));
const VerdictSection = lazy(() => import("@/components/VerdictSection"));

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

function DashboardPage() {
  usePageMeta({
    title: "Did Twitter Die?",
    description:
      "Real data comparing twitter.com vs x.com popularity — DNS queries, search interest, and domain rankings since the July 2023 rebrand.",
    canonicalPath: "/",
  });

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
          <WikipediaAttentionSection data={data.wikipedia} />
          <DirectRankSignalsSection umbrella={data.umbrella} majestic={data.majestic} />
          <SocialMediaServiceSection data={data.radarServices} />
          <VerdictSection data={data} />
        </Suspense>
        <Footer updatedAt={data.updated_at} currentPage="dashboard" />
      </div>
    </Layout>
  );
}

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname || "/";
}

function App() {
  const pathname = normalizePathname(window.location.pathname);

  if (pathname === "/methodology") {
    return (
      <Layout>
        <MethodologyPage />
        <Footer currentPage="methodology" />
      </Layout>
    );
  }

  if (pathname === "/privacy") {
    return (
      <Layout>
        <PrivacyPage />
        <Footer currentPage="privacy" />
      </Layout>
    );
  }

  return <DashboardPage />;
}

export default App;
