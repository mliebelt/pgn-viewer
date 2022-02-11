/**
 * Setup taken from https://www.linkedin.com/pulse/including-custom-typescript-declaration-files-mochajs-dave-schinkel/
 */
require('ts-node').register({
    project: './tsconfig.json',
})
console.log("Have read: compiler.ts")