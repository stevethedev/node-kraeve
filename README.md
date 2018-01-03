# Kraeve

Kraeve (pronounced "Crave") is an NPM module that solves the problem of ugly or
complicated ```require()``` paths in deeply nested or highly structured node
projects. When developing a Node application (or library), every file in the
project must be aware of the location of all of its dependencies.

Given a project, named ```"my-project"```, you may have a folder structure that
looks something like this:

```
./my-project/tests/database/models/article.js
./my-project/lib/database/models/article.js
./my-project/lib/database/models/category.js
```

**Require Article from the Category Model**
```javascript
const Article = require('./article');
```

**Require Article from the Article Test**
```javascript
const Article = require('../../../../lib/database/models/article');
```

This is inconvenient, difficult to keep track of, and closely ties your
application's code to the folder structure. If you are ever forced to
restructure your application, updating the relative paths becomes a chore as
you are forced to rebuild the relative paths for your application.

With Kraeve, ```require()``` treats your application as if it were a module:

**Require Article from Any Location**
```javascript
const Article = require('my-project/lib/database/models/article');
```

## Global Without Collisions
Kraeve works on the top-level folder for an application, so it can be installed
as a dependency without breaking other projects. If your project is included as
a module another application, Node will find it in the ```node_modules```
folder, anyway. Plus, there's no configuration so you don't need to worry about
other projects overwriting your dependencies!

## Installing

You can start benefiting from Kraeve in three steps:

1. Create a ```package.json```. You probably already have this, but make sure
    your project doesn't have the same name as any of your dependencies!
```bash
npm init
```

2. Install Kraeve with NPM Package Manager:
```bash
npm install --save kraeve
```

3. Include Kraeve early in your program's entry-point:
```javascript
require('kraeve');
```

And that's it! Kraeve is now installed on your project!

## License

Kraeve is open-source software licensed under the [MIT License](LICENSE)
