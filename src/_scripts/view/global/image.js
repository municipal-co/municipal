import React from "react";

export default function Image({src, sizes, loading, alt, className}) {
  const srcsetSizes = [48, 90, 106, 112, 256, 320, 375, 480, 640, 750, 828, 1080, 1200, 1920, 2048, 3840];
  const buildSrcset = () => {
    const sizesList = srcsetSizes.map(size => {
      return `${src}&width=${size} ${size}w`
    })

    return sizesList;
  }

  return (
    <img
      className={className}
      src={src}
      srcSet={buildSrcset()}
      sizes={sizes}
      loading={loading}
      alt={alt || ""}
    />
  )
}
