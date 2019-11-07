const electron = require('electron');
const {Tray, Menu} = require('electron');
const {shell} = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const windowStateKeeper = require('electron-window-state');
const { globalShortcut } = require("electron");
const fs = require('fs');

const CHILD_PADDING = 100;

let mainWindow, settingWindow;

function createWindow () {

	let mainWindowState = windowStateKeeper({
		defaultWidth: 500,
		defaultHeight: 80
	});

	mainWindow = new BrowserWindow({
		skipTaskbar: false,
	//	resizable: false,
		'x': mainWindowState.x,
		'y': mainWindowState.y,
		'width': 500, 
		'height': 80,
		//'height': mainWindowState.height,
		 frame:false,
		 alwaysOnTop: true,
//		 resizable: false,
		  transparent: true
		//  titleBarStyle: 'hidden'
		// titleBarStyle: 'hiddenInset' 
	});

	console.log("--"+ mainWindowState.width);
	console.log("--"+ mainWindowState.height);
	console.log("--"+ mainWindowState.x);
	console.log("--"+ mainWindowState.y);


  	mainWindowState.manage(mainWindow);

  	mainWindow.loadURL('file://' + __dirname + '/app/settings.html');
  	//mainWindow.loadURL('file://' + __dirname + '/app/index.html');

  	mainWindow.setMenu(null);
		mainWindow.setMenuBarVisibility(false);	
  // Open the DevTools.
  	mainWindow.webContents.openDevTools(); 

		mainWindow.on('closed', function () {
		mainWindowState.saveState(mainWindow);
		mainWindow = null;

	});

}



const toggleWindow = () => {
    mainWindow.isVisible() ? mainWindow.hide() : showWindow();
}
const showWindow = () => {
    const position = getWindowPosition();
    mainWindow.setPosition(position.x, position.y, false);
    mainWindow.show();
}
const getWindowPosition = () => {
    const windowBounds = mainWindow.getBounds();
    const trayBounds = trayIcon.getBounds();
    
    // Center window horizontally below the tray icon
    const x = Math.round(trayBounds.x + (trayBounds.width / 2) - (windowBounds.width / 2))
    // Position window 4 pixels vertically below the tray icon
    const y = Math.round(trayBounds.y + trayBounds.height + 4)
    return {x: x, y: y}
}
const createTray = () => {
	trayIcon  = new Tray(__dirname + '/build/icons/icon16.png');
	//tray.setTitle('hello world');
	const trayMenuTemplate = [
		{
		   label: 'Hamonikr-finder',
		   //enabled: false
			click: function (){
				toggleWindow();
		   }
		},
		
		{
		   label: 'Settings',
		   click: function () {
			  console.log("Clicked on settings");
			  settingWindow.show();
			  console.log("Clicked on settings222");
		   }
		},
		
		{
		   label: 'Help',
		   click: function () {
			  console.log("Clicked on Help")
		   }
		},
		{ label: 'Quit', click: () => { app.quit(); } }
	 ]
	 
	 let trayMenu = Menu.buildFromTemplate(trayMenuTemplate)
	 trayIcon.setContextMenu(trayMenu)
}
let trayIcon  = null;
app.on('ready', () => {
	createTray();
	  
	globalShortcut.register('alt+f4', function() {
		console.log('You fired ctrl+alt+j !!!');
	});
	setTimeout(createWindow, 500)
	//createWindow();
 	//mainWindow.setSize(450,60);
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
	   mainWindow.setSize(500,70);
	 //  mainWindow.hide();
    app.quit();
  }
});

app.on('activate', function () {
	console.log("activate==="+ mainWindow);
  if (mainWindow === null) {
    createWindow();
  }
});



const {ipcMain} = require('electron')
ipcMain.on('resize-me-please', (event, arg) => {
	if(arg == "initLayer"){
		mainWindow.setResizable(true);
		mainWindow.setSize(500,80);
		//setTimeout(testB, 500);
	}else if( arg == "viewLayer"){

			//setTimeout(testA, 500);
  		mainWindow.setSize(550, 540);
		 // esRequest();
	}else{
		//setTimeout(testC, 500);
		createWindow();
		mainWindow.setSize(500,80);
	}		
})
function testA(){
mainWindow.setSize(550, 540);
}
function testB(){
mainWindow.setResizable(true);
    mainWindow.setSize(500,80);
}

function testC(){
createWindow();
    mainWindow.setSize(500,80);
}
ipcMain.on('openFile', (event, path) => {
  console.log("main.js=-====" + path);
//  shell.showItemInFolder(path);
  shell.openItem(path);

});


ipcMain.on('openConfigFile', (event, path) => { 
	var osType = require('os');
  	var filepath  = osType.homedir() + '/.config/hamonikr_finder/finder_config';

	fs.readFile(filepath, 'utf-8', (err, data) => { 
		if(err){ 
			console.log("An error ocurred reading the file :" + err.message);
			return 
		}else{
			console.log("data==="+ data);
			
			var settingData_arr = data.split('\n');
			// for(var i=0; i<settingData_arr.length ;++i){
			// 	console.log(i+'=====' + settingData_arr[i]);
			// }
			// console.log("settingData_arr==="+ settingData_arr);
			event.sender.send('settingData_arr', data);

			console.log("uuid info success");
		}
	});
});

ipcMain.on('save-dir-path', (event, arg) => {
	
	console.log("save-dir-path----"+ arg);		
	FnChk_settingsFile();
	console.log("1111");

	setTimeout(create_settingFile, 600, arg);
	console.log("22222");
	setTimeout(watcherCall, 600, '');
	console.log("3333");

})


function watcherCall(){

	const request=require('request');
	request('http://127.0.0.1:3001/watcher',function(error, response, body){
  	if(!error&&response.statusCode==200) {
    	console.log(body);
   	}else{
    	console.log("error----" + error);
    }
	});

	//var unirest = require('unirest');

	//unirest.post('http://127.0.0.1:3001/watcher')
	//	.header('Accept', 'application/json')
////		.send({ "id": searchTextStr })
	//	.send()
	//	.end(function (response) {
	//	console.log(response.body);
	//});
}

function create_settingFile(arg){

  var osType = require('os');
  var fileDir  = osType.homedir() + '/.config/hamonikr_finder/finder_config';

	console.log("====filepath==="+ fileDir);
  fs.writeFile(fileDir, arg, (err) => {
    if(err){
      console.log("//== save-dir-path() error  "+ err.message);
    }
  });
}

function FnChk_settingsFile(){

	var osType = require('os');
	var dirpath = osType.homedir() + '/.config/hamonikr_finder/';
	
	try{
		 fs.lstatSync(dirpath).isDirectory();
	}catch(e){
	   // Handle error
	   if(e.code == 'ENOENT'){
		   console.log("//==mkdir directory");

			var exec = require('child_process').exec;
			exec(" mkdir "+dirpath,
				function (err, stdout, stderr) {
					console.log('//==stdout: ' + stdout);
					console.log('//==stderr: ' + stderr);
					if (err !== null) {
						console.log('//== mkdir error: ' + err);
					}
			});
	   }
	}
}


