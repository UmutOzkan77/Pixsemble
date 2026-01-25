const ALLOWED_HOSTS = new Set(['generativelanguage.googleapis.com']);

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,x-goog-api-key'
};

export default {
    async fetch(request) {
        if (request.method === 'OPTIONS') {
            return new Response(null, { status: 204, headers: corsHeaders });
        }

        const url = new URL(request.url);
        const target = url.searchParams.get('target');
        if (!target) {
            return new Response('Missing target parameter.', { status: 400, headers: corsHeaders });
        }

        let targetUrl;
        try {
            targetUrl = new URL(target);
        } catch (error) {
            return new Response('Invalid target URL.', { status: 400, headers: corsHeaders });
        }

        if (!ALLOWED_HOSTS.has(targetUrl.host)) {
            return new Response('Target host not allowed.', { status: 403, headers: corsHeaders });
        }

        // Clone headers to forward all metadata (like x-goog-api-key)
        const forwardHeaders = new Headers(request.headers);
        forwardHeaders.delete('Host');
        forwardHeaders.delete('Origin');
        forwardHeaders.delete('Referer'); // Let upstream request set these naturally
        if (!forwardHeaders.has('Content-Type')) {
            forwardHeaders.set('Content-Type', 'application/json');
        }

        const init = {
            method: request.method,
            headers: forwardHeaders,
            body: request.method === 'GET' ? undefined : await request.text()
        };

        const upstreamResponse = await fetch(targetUrl.toString(), init);
        const responseBody = await upstreamResponse.text();

        return new Response(responseBody, {
            status: upstreamResponse.status,
            headers: {
                'Content-Type': upstreamResponse.headers.get('Content-Type') || 'application/json',
                ...corsHeaders
            }
        });
    }
};
