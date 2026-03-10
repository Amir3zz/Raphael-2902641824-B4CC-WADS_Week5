import { NextResponse } from "next/server";

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Assignment Logbook API Docs</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <!-- Swagger UI CSS from CDN -->
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@4/swagger-ui.css" />
  <style>
    html,body,#swagger-ui { height: 100%; margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="swagger-ui"></div>

  <!-- Swagger UI bundle from CDN -->
  <script src="https://unpkg.com/swagger-ui-dist@4/swagger-ui-bundle.js"></script>
  <script>
    window.addEventListener('load', function() {
      // Point to the OpenAPI JSON route created above
      const specUrl = '/api/openapi';
      const ui = SwaggerUIBundle({
        url: specUrl,
        dom_id: '#swagger-ui',
        deepLinking: true,
        presets: [SwaggerUIBundle.presets.apis],
        layout: "BaseLayout"
      });
      window.ui = ui;
    });
  </script>
</body>
</html>`;

export async function GET() {
  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  });
}