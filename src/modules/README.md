# Steps to publish intensity plot modules as an npm package

1. [Create an npm account](https://www.npmjs.com/signup)

1. Log in to npm

```script
npm adduser
npm login
```

1. Publish the package (as specified in package.json)

```script
npm publish
# for scoped package, make it public
npm public --access=public
```

1. Install npm package

```script
npm install musat-intensity-plot --save
```
