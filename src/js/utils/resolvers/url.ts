export interface URLMeta {
    /** Date in ISO format */
    accessed: string;
    authors: Array<{
        firstname: string;
        lastname: string;
    }>;
    content_title: string;
    issued: string;
    site_title: string;
    url: string;
}

// tslint:disable cyclomatic-complexity
// Disabling rule in this instance because `||` short-circuit evaluation is counted toward the
// complexity and that feature is instrumental to this function.
// Without it, the function would _more_ complex.

/**
 * Communicates with AJAX to the WordPress server to retrieve metadata for a given web URL.
 * @param url - The URL of interest
 * @return URL Meta returned from the server
 */
export async function getFromURL(url: string): Promise<URLMeta> {
    const headers = new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' });
    const body = new URLSearchParams(`action=get_website_meta&site_url=${encodeURIComponent(url)}`);
    const req = await fetch(top.ajaxurl, {
        method: 'POST',
        headers,
        body,
        credentials: 'same-origin',
    });

    if (!req.ok) {
        throw new Error(
            req.status === 501 ? top.ABT_i18n.errors.missingPhpFeatures : req.statusText,
        );
    }

    const res: ABT.ExternalSiteMeta = await req.json();

    const content_title = res.og.title || res.sailthru.title || res.title || '';
    const site_title = res.og.site_name || '';
    let issued =
        res.issued || res.og.pubdate || res.article.published_time || res.sailthru.date || '';

    if (issued !== '') {
        issued = new Date(issued).toISOString();
    }

    return {
        accessed: new Date().toISOString(),
        authors: res.authors,
        content_title,
        issued,
        site_title,
        url,
    };
}
// tslint:enable cyclomatic-complexity
