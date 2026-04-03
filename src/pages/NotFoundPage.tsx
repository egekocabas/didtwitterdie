import Layout from "@/components/Layout";
import Footer from "@/components/Footer";

export default function NotFoundPage() {
  return (
    <Layout>
      <div className="space-y-16">
        <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-gray-500 dark:text-gray-400">
            404
          </p>
          <div className="space-y-3">
            <h1 className="text-4xl font-black tracking-tight text-gray-900 dark:text-white sm:text-5xl">
              Page not found
            </h1>
            <p className="max-w-2xl text-base leading-7 text-gray-600 dark:text-gray-300 sm:text-lg">
              That URL does not exist on didtwitterdie.com. Try the dashboard or one of the source
              pages below.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4 text-sm font-medium">
            <a
              href="/"
              className="underline underline-offset-4 transition-colors hover:text-gray-700 dark:hover:text-gray-200"
            >
              Dashboard
            </a>
            <a
              href="/methodology"
              className="underline underline-offset-4 transition-colors hover:text-gray-700 dark:hover:text-gray-200"
            >
              Sources & methodology
            </a>
            <a
              href="/privacy"
              className="underline underline-offset-4 transition-colors hover:text-gray-700 dark:hover:text-gray-200"
            >
              Privacy
            </a>
          </div>
        </div>
        <Footer currentPage="not-found" />
      </div>
    </Layout>
  );
}
