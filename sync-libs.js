const fs = require('fs')
const https = require('https');
const Downloader = require("nodejs-file-downloader");
const unzip = require('unzip');
const path = require('path');


const configJsonStr = fs.readFileSync('config.json');

console.log(`configJsonStr: ${configJsonStr}`);

const configObj = JSON.parse(configJsonStr);





// async function downloadFile(url, dest) {
// 	return new Promise((resolve, reject)=>{
// 		var stream = fs.createWriteStream(dest);

// 		console.log(`Downloading ${url} to ${dest}`);
// 		var request = https.get(url, function(response) {
// 			response.pipe(stream);

// 			stream.on('finish', function() {
// 				stream.close(()=>{
// 					console.log(`Finish ${url}`);
// 					resolve();
// 				});  // close() is async, call cb after close completes.
// 			});
// 		}).on('error', (err) => {
// 			reject();
// 		});
// 	});

// };

let succeedCount = 0;

async function downloadFile(url, directory) {
	console.info(`==> Download: ${url} to ${directory}`);
	const downloader = new Downloader({
    url: url,
    directory: directory,
    onProgress: function (percentage, chunk, remainingSize) {
      // console.log("% ", percentage);
    },
  });

  try {
    await downloader.download();
    succeedCount++;
  } catch (error) {
    console.error(error);
  }
}

async function unzipFile(zipPath, directory) {
	fs.createReadStream(zipPath).pipe(unzip.Extract({ path: directory }));
}

function removeFilesInDirectory(dir, ext) {
	fs.readdirSync(dir).forEach((f) => {
		let needRemove = false;

		if (ext && ext.length > 0) {
			if (path.extname(f) === ext) {
				needRemove = true;
			}
		} else {
			needRemove = true;
		}

		if (needRemove) {
			fs.rmSync(`${dir}/${f}`);
		}
	});
}


async function main() {
	removeFilesInDirectory('downloaded', '.zip');
	removeFilesInDirectory('libs', '.a');

	for (const lib of configObj.libs) {
		const fileName = path.basename(lib.url);
		await downloadFile(lib.url, `downloaded`).then((err)=>{
			console.log(err);
			unzipFile(`downloaded/${fileName}`, `libs`);
		});
	}

}

main();
