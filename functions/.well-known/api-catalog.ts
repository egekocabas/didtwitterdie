const API_CATALOG = {
  linkset: [
    {
      anchor: "https://didtwitterdie.com/api/data",
      "service-desc": [
        {
          href: "https://didtwitterdie.com/openapi.json",
          type: "application/openapi+json",
        },
      ],
      "service-doc": [
        {
          href: "https://didtwitterdie.com/api-docs.html",
          type: "text/html",
        },
      ],
      status: [
        {
          href: "https://didtwitterdie.com/api/status",
          type: "application/json",
        },
      ],
    },
  ],
};

export function onRequestGet(): Response {
  return new Response(JSON.stringify(API_CATALOG), {
    headers: {
      "Content-Type": 'application/linkset+json; profile="https://www.rfc-editor.org/info/rfc9727"',
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
