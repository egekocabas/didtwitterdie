import { useEffect } from "react";

interface PageMeta {
  title: string;
  description: string;
  canonicalPath: string;
}

const SITE_URL = "https://didtwitterdie.com";

export function usePageMeta({ title, description, canonicalPath }: PageMeta): void {
  useEffect(() => {
    document.title = title;

    const descriptionMeta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (descriptionMeta) {
      descriptionMeta.content = description;
    }

    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) {
      canonical.href = `${SITE_URL}${canonicalPath}`;
    }
  }, [canonicalPath, description, title]);
}
