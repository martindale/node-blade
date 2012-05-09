var blade = require('../lib/blade'),
	util = require('util'),
	fs = require('fs'),
	path = require('path'),
	locals = require('./locals'),
	child_process = require('child_process');

locals.includeSource = true;

var files = fs.readdirSync(__dirname + "/templates");
console.log("----Rendering and testing templates...");
var done = 0, failed = 0, total = 0;
for(var i in files)
	if(path.extname(files[i]) == ".blade")
		(function(filename) {
			total++;
			var inPath = __dirname + "/templates/" + filename;
			var outPath = __dirname + "/output/" + path.basename(filename, ".blade") + ".html";
			blade.renderFile(inPath, locals, function(err, html, info) {
				if(err) throw err;
				if(path.existsSync(outPath) )
				{
					var compare = child_process.spawn('diff', ['-', outPath]);
					var diff = "";
					compare.stdout.on('data', function(chunk) {
						diff += chunk;
					});
					compare.on('exit', function(code) {
						if(diff != "")
						{
							failed++;
							console.log("----Test failed for file:", filename, "\nDiff:\n", diff);
						}
						else
							console.log("----Test passed for file:", filename);
						allDone();
					});
					compare.stdin.write(html);
					compare.stdin.end();
				}
				else
				{
					fs.writeFileSync(outPath, html);
					console.log("Review output for file:", filename,
						"\nTemplate:\n" + info.source,
						"\nHTML:\n" + html);
					console.log("-----------------------------------------------");
					allDone();
				}
			});
		})(files[i]);
	else allDone();
function allDone() {
	if(++done == files.length)
	{
		console.log("-----------------------------------------------");
		console.log("Done - " + (done-failed-1) + " of " + total + " tests passed");
	}
}