var unzip = new JSZip();
var reader = new FileReader();
var fileNames;
var fileNamesTree;
var imageStyles = {
    background: '#000000',
    foreground: '#00FA00',
    withDashes: true,
    withSizes: true,
    fontSize: 16,
    lineHeight: 22,
    watermarkEnabled: true
};

var watermarkText = 'Generated by `foldertotree.cc`';

var body = document.getElementsByTagName('body')[0];
body.addEventListener('keyup', function(e) {
    e.which === 13 && generateFromGithub();
});
var loading = document.getElementById('loading');

function openSelectFile() {
    document.getElementById('my-awesome-dropzone').click();
}

function initDownload() {
    loading.style.display = 'block';
    var canvas = document.getElementById('tree-canvas');
    var imageData = canvas.toDataURL();
    var button = document.getElementById('download-button');
    button.setAttribute('href', imageData);

    button.click();
}

function retry() {
    document.getElementById('zone').style.display = 'inline-block';
    document.getElementById('tree-canvas').remove();
    document.getElementById('settings').style.display = 'none';
    var layout = document.getElementById("layout");
    layout.classList.add("flex");
}

function generateFromGithub() {
    loading.style.display = 'block';
    var githubUrl = 'https://cors-anywhere.herokuapp.com/'; 
    githubUrl += document.getElementById('github-url').value;
    githubUrl += '/archive/master.zip';
    // TODO add githubUrl validation;

    JSZipUtils.getBinaryContent(githubUrl, function(err, data) {
        if (err) {
            throw err; // or handle err
        }

        unzip
            .loadAsync(data)
            .then(function(data2) {
                processFile(data2);
            });
    });
}

function isRoot(fileName) {
    return fileName.slice(-1) === '/' && fileName.split('/').length === 2;
}

function toTree(fileNameList, files) {
    var tree = new Tree();
    tree._root = { value: fileNameList[0].replace('/', ''),  metadata: { isFolder: true }, children: [] };

    fileNameList.forEach(file => {
        var filePaths = file.split('/').filter(path => !!path);
        var isFolder = file.endsWith('/');
        var size = files[file]._data.uncompressedSize;
        var nestLevel = filePaths.length - 1;

        if (!isRoot(file)) {
            tree.add(filePaths[filePaths.length - 1], { isFolder, size, nestLevel }, filePaths[filePaths.length - 2]);
        }
    });

    return tree;
}

function processFile(zip) {
    fileNames = Object.keys(zip.files);
    fileNamesTree = toTree(fileNames, zip.files);

    canvasHeight = fileNames.length * +imageStyles.lineHeight + 50;
    var canvasElement = document.createElement('canvas');

    canvasElement.setAttribute('id', 'tree-canvas');
    document.getElementById('generated-tree').appendChild(canvasElement);
    document.getElementById('zone').style.display = 'none';

    var layout = document.getElementById("layout");
    layout.classList.remove("flex");
    document.getElementById("settings").style.display = "block";

    drawTree();
}

function drawTree() {
    var topShift = 30 - +imageStyles.lineHeight;
    var canvas = document.getElementById('tree-canvas');
    canvas.width = 582;
    canvas.height = canvasHeight;

    var context = canvas.getContext("2d");
    context.imageSmoothingEnabled = true;
    context.webkitImageSmoothingEnabled = true;
    context.mozImageSmoothingEnabled = true;

    context.fillStyle = imageStyles.background;
    context.fillRect(0, 0, canvas.width, canvasHeight);

    const drawFilePath = (branch) => {
        context.beginPath();
        context.fillStyle = imageStyles.foreground;
        context.font =  imageStyles.fontSize + "px Arial, Helvetica, sans-serif";

        var nestLevel = branch.metadata && branch.metadata.nestLevel || 0;
        var fileName = branch.value;
        var leftShift = 25 + nestLevel * 25;
        topShift += +imageStyles.lineHeight;

        if (imageStyles.withDashes) {
            fileName = `${'-'.repeat(4 * nestLevel)} ${branch.value}`;
            leftShift = 30;

            if (nestLevel === 0) {
                leftShift -= 5;
            }
        }

        if (branch.metadata && branch.metadata.isFolder) {
            fileName += ' /';
        }

        if (imageStyles.withSizes && branch.metadata && branch.metadata.size) {
            var fileSize = (branch.metadata.size / 1000).toFixed(2);
            fileName += ` (~${ fileSize } kb)`;
        }

        context.fillText(fileName, leftShift, topShift);
    }

    const traverseFilesTree = (branch) => {
        drawFilePath(branch);
        if (branch.children.length) {
            branch.children.forEach(chiildBranch => {
                traverseFilesTree(chiildBranch);
            });
        }
    };

    traverseFilesTree(fileNamesTree._root, 0);

    if (imageStyles.watermarkEnabled) {
        context.font =  "12px Arial, Helvetica, sans-serif";
        context.fillText(watermarkText, canvas.width - 180, canvasHeight - 15);
    }
    loading.style.display = 'none';
}

function changeSetting(key, value) {
    imageStyles[key] = value;

    canvasHeight = fileNames.length * +imageStyles.lineHeight + 30;
    var canvas = document.getElementById('tree-canvas');
    canvas.height = canvasHeight;

    drawTree();
}

function readFile(file) {
    reader.readAsBinaryString(file);

    reader.onload = function(file) {
        unzip
            .loadAsync(file.target.result)
            .then(function (zip) {
                processFile(zip);
            });
    };
}

function switchTab(elem) {
    document
        .querySelectorAll('.tabs .tab.active')
        .forEach(tab => tab.classList.remove('active'));
    elem.classList.add('active');
}

Dropzone.options.myAwesomeDropzone = {
    paramName: "file",
    maxFiles: 1,
    maxFilesize: 2,
    accept: function(file, done) {
        if (file.name.endsWith(".zip")) {
            done();
            readFile(file);
            this.removeFile(file);
            return;
        } else {
            done("Only .zip files accepted.");
        }
    },
    init: function() {
        this.on("addedfile", function() {
            if (this.files[1] != null){
                this.removeFile(this.files[0]);
            }
        });
        this.on("error", function(file, message, xhr) {
            if (this.files[1] != null){
                this.removeFile(this.files[0]);
            }
        });
    }
};
