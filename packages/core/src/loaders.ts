export async function loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve) => {
        const image = new Image();
        image.addEventListener('load', () => {
            resolve(image);
        });
        image.src = url;
    });
}
export const loadJSON = async<T>(url: string): Promise<T> => {
    return fetch(url)
    .then(r => r.json()).catch(err => err);
}
