var unzip = new JSZip();
var reader = new FileReader();

function openSelectFile() {
    document.getElementById('my-awesome-dropzone').click();
}

function retry() {
    document.getElementById('zone').style.display = 'inline-block';
    document.getElementById('tree-canvas').remove();
    document.getElementById('settings').style.display = 'none';
}

function generateFromGithub() {
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

function toTree(filesList) {
    var tree = [];

    filesList.forEach(file => {
        // var isFolder = file.endsWith('/');  Might be useful later
        var filePaths = file.split('/').filter(path => !!path);

        tree.push({
            path: filePaths[filePaths.length - 1],
            nestLevel: filePaths.length - 1
        });
    });

    return tree;
}

function processFile(zip) {
    var fileNames = Object.keys(zip.files);
    var fileNamesTree = toTree(fileNames);

    var height = fileNames.length * 30 + 50;
    var canvasElement = document.createElement('canvas');

    canvasElement.setAttribute('id', 'tree-canvas');
    document.getElementById('generated-tree').appendChild(canvasElement);
    document.getElementById('zone').style.display = 'none';

    var content = document.getElementById("content");
    content.classList.remove("flex");
    document.getElementById("settings").style.display = "block";

    var canvas = document.getElementById('tree-canvas');
    canvas.width = 582;
    canvas.height = height;

    var context = canvas.getContext("2d");
    context.imageSmoothingEnabled = true;
    context.webkitImageSmoothingEnabled = true;
    context.mozImageSmoothingEnabled = true;

    context.fillRect(0, 0, canvas.width, height);

    fileNamesTree.forEach(function (filename, index) {
        context.beginPath();
        context.fillStyle = "#00FA00";
        context.font = "20px Arial, Helvetica, sans-serif";
        context.fillText(filename.path, 25 + filename.nestLevel *  20, 32 * index + 30);
    });
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

Dropzone.options.myAwesomeDropzone = {
    paramName: "file",
    maxFiles: 1,
    maxFilesize: 2,
    accept: function(file, done) {
        if (file.name.endsWith(".zip")) {
            done();
            readFile(file);
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