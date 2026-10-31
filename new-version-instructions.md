# Farazv remake

- https://farazv.sk

- this repository contains website of our parish 
- the backend is strapi headless cms with admin panel 
- frontend is old gatsby js

- I want to do a new version of this website 

Here are key points in new version: 

1. I want to use the latest nextjs and deploy it on my private vercel account 
2. The whole thing was overengineered - strapi contains entities for each page and each component but that is completely useless - the only parts that are truly dynamic on the web is - weekly announcements - uploaded weekly and posts section
3. Most of the pages in new version can be just static content - either directly in JSX or in some const - I would mind even the first simplest approach 
4. we want to completely remove existing admin and most of the models we had 
5. we want to create new fully custom made admin for uploading weekly announcements, posts, articles (maybe some other, ask me if you think sth is worth it)
6. weekly announcements and aritcles can be simplified, for example we don't need db table for priests, authors of articles etc


Design: 
- we want to keep same or similar design in the first iteration 
- you can do some improvements in first iteration, but keep general vibe 
- you can analyze live page on farazv.sk for understanding the design, pages and components we have 
- important are images that we use in our design, from our church, it makes the design specific and gives visitors familiar church feel 
- images are all stored in cloudnary - can we keep using them this way ?
- we will probably experiment a bit with it - se develop in such way that this will be possible

Code quality and structure; 
- I want to make sure this is a well maintainable codebase for humans and AI and in development I want you to take time and tokens on reviewing it and making sure it is well maintainable 
- try to keep it very simple, not overengineered 
- create new website under a new folder, then we will reverse it at the end and store the old one as reference 
- project will be meant as open source and open for collaboration from people in our parish, or for cloning from other parishes - we can note that in footer somewhere and code it with this in mind 


Workflow
- I want to have a initial discovery / analysis /planning phase 
- then i want codex to work autonomously for hours to make that migration and creating new version
- it can be incremental - we can do it in for example 4 parts while I check after finishing each one 

Weekly announcements section: 
- mass times are same each week - user should not prefill it all the time
- we have PDFs with announcements - we will implemment later a workflow where user just uploads it, it is parsed automatically into the form, and user just confirms those changes

Posts: 
- most of the posts are actually just posters - just below hero create a "Vyvseka" section which is customized just for posters, they can be either just pictures or be a links to somewehre (posters are a poitrait A4 sometimes can be probably also landscape )

- then there are some posts that also have description and should open to separate page - we could have some other layout maybe for those? 

Hero slider: 
- hero slider is imporant part - as many people will visit the website just to see who and when has mass and also the liturgy of the day is a good thing for visitors


Pages: 
- this page doesn't have to be in the top navigation: https://farazv.sk/birmovanci - just keep it under "sviatosti" 

