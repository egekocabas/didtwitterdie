import { useData } from "./hooks/useData";
import Layout from "./components/Layout";
import LoadingSkeleton from "./components/LoadingSkeleton";
import Footer from "./components/Footer";

function SectionPlaceholder({ title, description }) {
  return (
    <section className="space-y-3">
      <h2 className="text-2xl font-bold">{title}</h2>
      {description && (
        <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
      )}
      <div className="h-[300px] rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 dark:text-gray-600 text-sm">
        Chart coming in Phase 5
      </div>
    </section>
  );
}

function ErrorState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center">
      <p className="text-lg font-semibold text-red-500">Failed to load data</p>
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
        {/* Section 1: Hero */}
        <section className="text-center space-y-6 py-12">
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
            Did Twitter Die?
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg max-w-xl mx-auto">
            Tracking the slow death (or survival) of Twitter since the rebrand to X on July 24, 2023.
          </p>
          <div className="flex justify-center gap-8 sm:gap-16 flex-wrap">
            <div className="space-y-1">
              <p className="text-5xl sm:text-7xl font-bold text-[#1DA1F2]">
                #{data.radar?.twitter?.at(-1)?.rank ?? "—"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">twitter.com today</p>
            </div>
            <div className="space-y-1">
              <p className="text-5xl sm:text-7xl font-bold text-gray-900 dark:text-gray-100">
                #{data.radar?.x?.at(-1)?.rank ?? "—"}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">x.com today</p>
            </div>
          </div>
        </section>

        {/* Section 2: DNS Popularity over time */}
        <SectionPlaceholder
          title="Who's winning the URL bar?"
          description="DNS popularity rank over time — lower rank number means more popular."
        />

        {/* Section 3: Google Trends (deferred) */}
        <section className="space-y-3">
          <h2 className="text-2xl font-bold">What people Google</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Search interest for "twitter" vs "x.com" over time.
          </p>
          <div className="h-[300px] rounded-xl bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
            <p className="text-gray-400 dark:text-gray-500 text-sm">Coming soon — Google Trends integration</p>
          </div>
        </section>

        {/* Section 4: Tranco combined ranking */}
        <SectionPlaceholder
          title="The consensus of 5 data sources"
          description="Tranco aggregated domain ranking combining Cloudflare DNS, Cisco Umbrella, Chrome UX Report, Majestic, and Farsight."
        />

        {/* Section 5: Regional breakdown */}
        <SectionPlaceholder
          title="Where does Twitter still rule?"
          description="Per-country DNS popularity rank — who still types twitter.com vs x.com."
        />

        {/* Section 6: Verdict */}
        <SectionPlaceholder
          title="The verdict"
          description="A summary score based on all available data."
        />

        <Footer updatedAt={data.updated_at} />
      </div>
    </Layout>
  );
}

export default App;
