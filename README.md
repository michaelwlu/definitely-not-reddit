<img src="./readme/banner-thin.png" alt="Definitely Not Reddit">

# Definitely Not Reddit

Visit: [definitelynotreddit.michaelwenlu.com](https://definitelynotreddit.michaelwenlu.com)

---

## Description

This is my Reddit clone coding project that began with Ben Awad's epic [14-hour YouTube tutorial](https://youtu.be/I6ypD7qv3Z8) and evolved with more functionalities over time. It allows users to create posts, upvote/downvote, and comment, and it supports text and content (image, video, links) posts.

## Demo

#### Sign Up

<img src="./readme/sign-up.gif?raw=true" width="600px" alt="Sign Up">

#### Create Post

<img src="./readme/create-post.gif?raw=true" width="600px" alt="Create Post">

#### Leave Comment

<img src="./readme/leave-comment.gif?raw=true" width="600px" alt="Leave Comment">

## Versions

v1.4 Refactor application for link data storage

v1.3 Add support for image, video, and link posts

v1.2 Add comments functionality

v1.1 Redesign with responsive layouts

v1.0 Deploy site with base functionality (user accounts, text posts)

## Technologies

**General**

- [TypeScript](https://www.typescriptlang.org/)
- [GraphQL](https://graphql.org/)

**Front End**

- [Next.js](https://nextjs.org/)
- [Apollo Client](https://www.apollographql.com/docs/react/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Formik](https://formik.org/)
- [Yup](https://www.npmjs.com/package/yup)

**Back End**

- [Node.js](https://nodejs.org/en/) / [Express](https://expressjs.com/)
- [Apollo Server](https://www.apollographql.com/docs/apollo-server/getting-started/)
- [TypeORM](https://typeorm.io/#/)
- [TypeGraphQL](https://typegraphql.com/)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)
- [Nodemailer](https://nodemailer.com/about/)
- [Axios](https://www.npmjs.com/package/axios)

**Deployment**

- [Vercel](https://vercel.com/docs)
- [DigitalOcean](https://www.digitalocean.com/)
- [Docker](https://www.docker.com/) / [Dokku](http://dokku.viewdocs.io/dokku/)

## Development Challenges

#### Link Preview Generation

This was a doozy of a process. I had wanted to add support for content posts in order to expand the usability of the site and allow users to embed images, gifs, videos, and links in their posts.

For the first three items, the process was simple enough: URLs within the post body would be parsed and categorized, then rendered accordingly as an image or video tag or handled by [ReactPlayer](https://www.npmjs.com/package/react-player), which supports YouTube, Vimeo, Twitch, etc.

As for web page links, my intention was to display a card preview, similar to the format on Facebook and Twitter feeds. This required obtaining meta tags data. The first method I found was a package called [link-preview-generator](https://www.npmjs.com/package/link-preview-generator). Because it uses Puppeteer to scrape said page, the implementation had to be server-side.

In retrospect, it was an obvious mistake to place the meta data retrieval process at time of post read instead of post creation. I wanted to avoid refactoring the database to store link information, relying instead on live scraping everytime a user accessed the site. Always having up-to-date meta information is cool, but the modest server resources made this design absolutely unsustainable. Server load frequently throttled, and repeated scraping was sometimes detected and blocked by website defenses.

Several other issues arose, including configuring Puppeteer to run properly inside a Docker container. While debugging this, I experimented with two other meta data services ([URL Meta](https://urlmeta.org/) and [LinkPreview](https://www.linkpreview.net/)) and ultimately added them as backup processes for redundancy.

Eventually, I bit the bullet and refactored the database and the link preview generation procedure to retrieve and store meta data at time of post creation, though not before encountering another bewildering problem.

#### Self-Scraping Loop

When I had successfully gotten Puppeteer to work, I deployed the site and created a post announcing the new features and demoing the link preview functionality. In that post, the site I featured was Definitely Not Reddit itself.

Upon the next deployment, everything went bonkers. The web component crashed immediately and error logs showed recurring and unhandled GET requests. The server virtual machine spiked to maximum CPU and memory utilization and locked up with runtime errors.

After much headache, I realized that the problem was the self-scraping loop caused by the post I made. As the front end was being deployed, Next.js's server-side rendering would attempt to retrieve the very meta data of the site still being deployed. This would cause runaway processes on the back end as scraping repeatedly failed. The result was a total system meltdown.

My solution was to add a loophole on the front end, where a link preview request of the site itself would be intercepted and redirected to the readily available meta tags in the website code. Eventually, this patch was rendered unnecessary by the process refactoring, but it was—suffice it to say—a memorable and challenging problem to overcome.

## License

MIT © 2020 Michael W. Lu
