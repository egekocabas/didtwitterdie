export default function Footer({ updatedAt }) {
  const formatted = updatedAt
    ? new Date(updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <footer className="mt-20 pt-8 border-t border-gray-200 dark:border-gray-800 text-center text-sm text-gray-500 dark:text-gray-400 space-y-2 pb-8">
      <p>
        Data from{" "}
        <a
          href="https://radar.cloudflare.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700 dark:hover:text-gray-300"
        >
          Cloudflare Radar
        </a>{" "}
        and{" "}
        <a
          href="https://tranco-list.eu"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-gray-700 dark:hover:text-gray-300"
        >
          Tranco List
        </a>
      </p>
      <p>Cloudflare Radar data licensed under CC BY-NC 4.0</p>
      {formatted && <p>Last updated: {formatted}</p>}
    </footer>
  );
}
