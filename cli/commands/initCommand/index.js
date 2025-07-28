const { initAndroid } = require('./initAndroid');
const { initIos } = require('./initIos');
const { program } = require('commander');

program
    .command('init')
    .description('Initialize CodePush project')
    .action(async () => {
        console.log('Start initializing CodePush...');
        await initAndroid();
        await initIos();
        console.log('CodePush has been successfully initialized.');
    });

