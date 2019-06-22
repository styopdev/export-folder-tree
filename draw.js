<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Unzip</title>

    <script type="text/javascript" src="./zip.js"></script>
    <script type="text/javascript">
        var unzip = new JSZip();
        var reader = new FileReader();

        function upload ($event) {
            reader.readAsBinaryString($event.files[0]);
            reader.onload = function(file) {
                console.log(file.target.result);
                unzip
                    .loadAsync(file.target.result)
                    .then(function (zip) {
                        const fileNames = Object.keys(zip.files);

                        var height = fileNames.length * 30 + 50;
                        var canvasElement = document.createElement('canvas');

                        canvasElement.setAttribute('id', 'tree-canvas');
                        document.body.appendChild(canvasElement);

                        var canvas = document.getElementById('tree-canvas'); 
                        canvas.width = 400;
                        canvas.height = height;
                        var context = canvas.getContext("2d");
                        context.imageSmoothingEnabled = true;
                        context.webkitImageSmoothingEnabled = true;
                        context.mozImageSmoothingEnabled = true;

                        context.fillRect(0, 0, canvas.width, height);

                        fileNames.forEach(function (filename, index) {
                            context.beginPath();
                            context.fillStyle = "#00FA00";
                            context.font = "20px Arial, Helvetica, sans-serif";
                            context.fillText(filename, 25, 32 * index + 30);
                        })
                    });
            };
        }
    </script>
</head>
<body>
    <form action="">
        Zip upload <input type="file" onchange="upload(this)">
    </form>
</body>
</html>
