export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    try {
      // First, try to get the asset from KV storage
      const response = await env.ASSETS.fetch(request);
      
      // If we get a successful response (not 404), return it
      if (response.status !== 404) {
        return response;
      }

      // If it's a 404 and the path looks like a file (has an extension), return the 404
      if (pathname.includes('.') && pathname.match(/\.[a-zA-Z0-9]+$/)) {
        return response;
      }

      // For all other paths (SPA routes), serve index.html
      const indexRequest = new Request(new URL('/index.html', request.url), {
        method: request.method,
        headers: request.headers,
        body: request.body
      });
      
      return await env.ASSETS.fetch(indexRequest);
    } catch (error) {
      console.error('Worker error:', error);
      
      // Fallback: try to serve index.html for any error
      try {
        const indexRequest = new Request(new URL('/index.html', request.url), {
          method: 'GET',
          headers: new Headers()
        });
        return await env.ASSETS.fetch(indexRequest);
      } catch (fallbackError) {
        return new Response('Service Temporarily Unavailable', { 
          status: 503,
          headers: {
            'Content-Type': 'text/plain'
          }
        });
      }
    }
  },
};