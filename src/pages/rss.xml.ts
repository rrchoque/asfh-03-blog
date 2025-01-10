import { sync, type APIRoute } from "astro";
import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import MarkdownIt from "markdown-it";
import xss from "xss";

const parser = new MarkdownIt();

export const GET: APIRoute = async ({ params, request, site }) => {
  const blogPosts = await getCollection("blog");

  // const items = blogPosts.map(({ data, slug, body }) => ({
  //   title: data.title,
  //   pubDate: data.date,
  //   description: data.description,
  //   link: `/posts/${slug}`,
  //   content: sanitizeHtml(parser.render(body), {
  //     allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img"]),
  //   }),
  // }));

  const items = blogPosts.map(({ data, slug, body }) => {
    const content = xss(parser.render(body)); // Usando xss para limpiar el HTML

    return {
      title: data.title,
      pubDate: new Date(data.date).toUTCString(),
      description: data.description,
      link: `${site}/posts/${slug}`,
      content: content,
      customData: `<media:content 
      url="${site + data.image.src}"
      width="${data.image.width}"
      height="${data.image.height}"
      medium="image"
      type="image/${data.image.format}"
       />`,
    };
  });

  return rss({
    // `<title>` field in output xml
    title: "Reynaldo Blog",
    // `<description>` field in output xml
    description: "A humble Astronaut’s guide to the stars",
    xmlns: {
      media: "http://search.yahoo.com/mrss/",
    },
    // Pull in your project "site" from the endpoint context
    // https://docs.astro.build/en/reference/api-reference/#site
    site: site ?? "",
    // Array of `<item>`s in output xml
    // See "Generating items" section for examples using content collections and glob imports
    items: items,
    // (optional) inject custom xml
    customData: `<language>es-ES</language>`,
  });
};
