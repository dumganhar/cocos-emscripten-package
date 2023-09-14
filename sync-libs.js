const fs = require('fs')
const https = require('https');
const Downloader = require("nodejs-file-downloader");
const unzip = require('unzip');
const path = require('path');


const configJsonStr = fs.readFileSync('config.json');

console.log(`configJsonStr: ${configJsonStr}`);

const configObj = JSON.parse(configJsonStr);

async function downloadFile(url, directory) {
	console.info(`==> Download: ${url} to ${directory}`);
	const downloader = new Downloader({
    url: url,
    directory: directory,
    onProgress: function (percentage, chunk, remainingSize) {
      // console.log("% ", percentage);
    },
  });

  await downloader.download();
}

async function unzipFile(zipPath, directory) {
	console.log(`unzipFile:${zipPath} to ${directory}`);
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
		await downloadFile(lib.url, `downloaded`).then(()=>{
			unzipFile(`downloaded/${fileName}`, `libs`);
		}).catch(()=>{
			process.exit(1);
		});
	}
}

main();
