const fs = require('fs');
const http = require('http');
const url = require('url');
const slugify = require('slugify');
const replaceTemplate = require('./modules/replaceTemplate');

/* Template variables */
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/temp-overview.html`,
  'utf-8'
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/temp-product.html`,
  'utf-8'
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/temp-card.html`,
  'utf-8'
);

/* Global variables */
const data = fs.readFileSync(`${__dirname}/data/data.json`, 'utf-8');
const dataObj = JSON.parse(data);

/* Slugify */
// const slugs = dataObj.map(el => slugify(el.productName, { lower: true }));
// console.log(slugs);

dataObj.forEach(
  (el, i, arr) => (arr[i].slug = slugify(el.productName, { lower: true }))
);
/* For reference: the below is the same as above */
// dataObj.forEach(function(el, i, arr) {
//   arr[i].slug = slugify(el.productName, { lower: true });
// });

/* Server */
const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  /* Routing - index / overview */
  if (pathname === '/' || pathname === '/overview') {
    res.writeHead(200, {
      'Content-type': 'text-html'
    });
    const cardsHtml = dataObj.map(el => replaceTemplate(tempCard, el)).join('');
    const output = tempOverview.replace('{%product_card%}', cardsHtml);
    res.end(output);
    // } else if (pathname === '/product') {
  } else if (pathname.split('/')[1] === 'product') {
    /* Routing - Product */
    res.writeHead(200, {
      'Content-type': 'text-html'
    });

    const product = dataObj.find(el => el.slug === pathname.split('/')[2]);

    // const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);
    res.end(output);
  } else {
    /* Routing - Fallback */
    res.writeHead(400, {
      'Content-type': 'text-html'
    });
    res.end('<h1>400</h1><p>Sorry but you seem to be in the wrong place!</p>');
  }

  // res.end('This is the server being shown on screen!!');
});

server.listen(8000, '127.0.0.1', () => {
  console.log('Listening to requests on port 8000');
});
