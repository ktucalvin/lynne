find . -not -path "*./node_modules*" -name "*.test.js" | while read line ; do mocha $line ; done
