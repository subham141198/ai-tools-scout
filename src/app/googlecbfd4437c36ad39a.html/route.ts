
/**
 * @fileOverview Route handler for Google Search Console HTML verification.
 * Serves the required verification string to prove ownership of the domain.
 */

export async function GET() {
  const verificationContent = 'google-site-verification: googlecbfd4437c36ad39a.html';
  
  return new Response(verificationContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
    },
  });
}
