export async function fetchJSON(path, options){
    const r = await fetch(path, options);
    const payload = (await r.json()) || {};
    if (!r.ok) {
        throw new Error(payload.error || payload.message || 'Unknown error from backend server');
    }
    return payload;
}

export function postJSON(url, data){
    const body = {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    };
    return fetchJSON(url, body);
}