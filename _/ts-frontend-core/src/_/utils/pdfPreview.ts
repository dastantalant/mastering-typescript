import {getDocument} from "../src/plugins/pdfjs.ts";

const cache = new Map<string, Promise<string>>();

const dataUriToUint8 = (uri: string) => {
    const b64 = uri.split(',')[1]; const bin = atob(b64);
    const a = new Uint8Array(bin.length); for (let i=0;i<bin.length;i++) a[i]=bin.charCodeAt(i);
    return a;
};

export function getPdfPreviewUrl(src: string, targetWidth = 1000) {
    if (cache.has(src)) return cache.get(src)!;
    const p = (async () => {
        const isData = src.startsWith('data:');
        const task = getDocument(isData ? { data: dataUriToUint8(src) } : { url: src });
        const pdf = await task.promise;

        const page = await pdf.getPage(1);
        const v1 = page.getViewport({ scale: 1 });
        const scale = Math.min(1.5, targetWidth / v1.width); // safety cap
        const vp = page.getViewport({ scale });

        const canvas = document.createElement('canvas');
        canvas.width = Math.floor(vp.width);
        canvas.height = Math.floor(vp.height);
        await page.render({ canvasContext: canvas.getContext('2d')!, viewport: vp }).promise;

        const blob: Blob = await new Promise(res => canvas.toBlob(b => res(b!), 'image/png'));
        const url = URL.createObjectURL(blob);
        await pdf.destroy();
        return url;
    })();

    cache.set(src, p);
    return p;
}
