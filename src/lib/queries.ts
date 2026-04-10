// GROQ queries for Sanity content
// $locale is 'de' or 'en'

export const siteSettingsQuery = `*[_type == "siteSettings"][0]{
  festivalDate,
  raceDate,
  festivalEndDate,
  registrationOpen,
  registrationDeadline,
  registrationFee,
  stripeProductId
}`;

export const postsQuery = `*[_type == "post"] | order(publishedAt desc){
  _id,
  title,
  slug,
  excerpt,
  publishedAt,
  categories,
  coverImage,
  "imageUrl": coverImage.asset->url
}`;

export const postBySlugQuery = `*[_type == "post" && (slug.de.current == $slug || slug.en.current == $slug)][0]{
  _id,
  title,
  slug,
  excerpt,
  body,
  publishedAt,
  categories,
  coverImage,
  "imageUrl": coverImage.asset->url
}`;

export const sponsorsQuery = `*[_type == "sponsor"] | order(order asc){
  _id,
  name,
  logo,
  url,
  tier,
  "logoUrl": logo.asset->url
}`;

export const eventsQuery = `*[_type == "event"] | order(date asc){
  _id,
  title,
  slug,
  date,
  excerpt,
  entryType,
  format,
  image,
  "imageUrl": image.asset->url
}`;

export const resultsQuery = `*[_type == "result"] | order(year desc){
  _id,
  year,
  event,
  category,
  placements
}`;

export const resultsByYearQuery = `*[_type == "result" && year == $year] | order(event asc){
  _id,
  year,
  event,
  category,
  placements
}`;

export const galleryQuery = `*[_type == "galleryItem"] | order(year desc){
  _id,
  image,
  caption,
  year,
  event,
  photographer,
  "imageUrl": image.asset->url
}`;

export const galleryByYearQuery = `*[_type == "galleryItem" && year == $year] | order(_createdAt desc){
  _id,
  image,
  caption,
  year,
  event,
  photographer,
  "imageUrl": image.asset->url
}`;

export const registrationCountQuery = `count(*[_type == "registration" && status in ["paid", "confirmed"]])`;
