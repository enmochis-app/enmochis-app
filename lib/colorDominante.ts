export function colorDominanteDeBase64(base64: string, contentType: string): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const tam = 32;
        canvas.width = tam;
        canvas.height = tam;
        const ctx = canvas.getContext("2d");
        if (!ctx) return resolve(null);
        ctx.drawImage(img, 0, 0, tam, tam);
        const { data } = ctx.getImageData(0, 0, tam, tam);
        let r = 0, g = 0, b = 0, n = 0;
        for (let i = 0; i < data.length; i += 4) {
          if (data[i + 3] < 16) continue;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          n++;
        }
        if (!n) return resolve(null);
        const hex = (v: number) => Math.round(v / n).toString(16).padStart(2, "0");
        resolve(`#${hex(r)}${hex(g)}${hex(b)}`);
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = `data:${contentType};base64,${base64}`;
  });
}
