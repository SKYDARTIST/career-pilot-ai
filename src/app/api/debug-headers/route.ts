import { NextResponse } from 'next/server';

export async function GET(request: Request) {
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
        headers[key] = value;
    });

    console.log('--- DEBUG HEADERS ---');
    console.log(JSON.stringify(headers, null, 2));
    console.log('---------------------');

    return NextResponse.json({
        msg: 'Headers received',
        headers
    });
}
