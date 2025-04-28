# group-names-scraper
node-js application to scrape magma code from groupnames and output into usable JSON format.

to run this script, use: 
```
node index.js 
```

And output will be found in repository's output folder. As required, you can tweak settings inside src/index.js to grab
groups up to order 120, 250, or 500. JSON output is in form: 

```
{name, group order, glforder, array of 2d arrays}
```