const ALLOWED_HOSTS = new Set(['generativelanguage.googleapis.com']);

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization'
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

        const init = {
            method: request.method,
            headers: {
                'Content-Type': 'application/json'
            },
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
