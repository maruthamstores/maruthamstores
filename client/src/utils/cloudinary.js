/**
 * Transforms a Cloudinary URL to include optimization parameters.
 * @param {string} url - The original Cloudinary image URL.
 * @param {number} width - The desired width of the image.
 * @param {number} height - (Optional) The desired height of the image.
 * @returns {string} - The transformed URL.
 */
export const transformCloudinaryUrl = (url, width, height) => {
    if (!url || !url.includes("cloudinary.com")) return url;

    // Parameters: 
    // f_auto: Automatically choose the best format (WebP, AVIF, etc.)
    // q_auto: Automatically optimize quality
    // w_{width}: Resize to specified width
    // c_limit: Upscale only if necessary, maintain aspect ratio
    let params = `f_auto,q_auto`;
    if (width) params += `,w_${width}`;
    if (height) params += `,h_${height}`;
    params += `,c_limit`;

    return url.replace("/upload/", `/upload/${params}/`);
};
