export function localBusiness(input) {
  const schema = {
    "@context": "https://schema.org",
    "@type": input.type || "LocalBusiness",
    name: input.name,
    url: input.url,
  };
  if (input.phone) schema.telephone = input.phone;
  if (input.priceRange) schema.priceRange = input.priceRange;
  if (input.address) {
    schema.address = {
      "@type": "PostalAddress",
      streetAddress: input.address.street,
      postalCode: input.address.zip,
      addressLocality: input.address.city,
      addressCountry: input.address.country || "CH",
    };
  }
  if (input.geo) schema.geo = { "@type": "GeoCoordinates", latitude: input.geo.lat, longitude: input.geo.lng };
  if (input.hours) schema.openingHoursSpecification = input.hours.map((h) => ({ "@type": "OpeningHoursSpecification", ...h }));
  if (input.sameAs) schema.sameAs = input.sameAs;
  return schema;
}

export function service(input) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: input.name,
    url: input.url,
  };
  if (input.description) schema.description = input.description;
  if (input.provider) {
    schema.provider = { "@type": input.provider.type || "LocalBusiness", name: input.provider.name, url: input.provider.url };
  }
  if (input.areaServed) schema.areaServed = input.areaServed;
  if (input.price) {
    schema.offers = {
      "@type": "Offer",
      priceCurrency: input.price.currency || "CHF",
      price: input.price.from,
      description: input.price.note || `ab CHF ${input.price.from}`,
    };
  }
  return schema;
}

export function faqPage(pairs) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: pairs.map((p) => ({
      "@type": "Question",
      name: p.q,
      acceptedAnswer: { "@type": "Answer", text: p.a },
    })),
  };
}

export function toScript(schema) {
  return `<script type="application/ld+json">${JSON.stringify(schema)}</script>`;
}
