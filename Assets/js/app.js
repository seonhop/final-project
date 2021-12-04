// import {Ripple} from './ripple.js';
// import {Dot} from './dot.js';
// import {collide} from '/Assets/js/utils.js'

function distance(x1, y1, x2, y2) {
    const x = x2 - x1;
    const y = y2 - y1; 
    return Math.sqrt(x * x + y * y);
}

function collide(x1, y1, x2, y2, radius) {
    if (distance(x1, y1, x2, y2) <= radius) {
        return true;
    } else {
        return false;
    }
}

const PI2 = Math.PI * 2;
const BOUNCE = 0.82;

class Dot {
    constructor(x, y, radius, pixelSize, red, green, blue) {
        this.x = x;
        this.y = y;
        this.targetRadius = radius;
        this.radius = 0;
        this.radiusV = 0;
        this.radius = radius;
        this.pixelSize = pixelSize;
        this.pixelSizeHalf = pixelSize / 2;
        this.red = red;
        this.green = green;
        this.blue = blue;
    }

    animate(ctx) {
        ctx.beginPath();
        ctx.fillStyle = '#000';
        ctx.fillRect(
            this.x - this.pixelSizeHalf,
            this.y - this.pixelSizeHalf,
            this.pixelSize, this.pixelSize
        );

        const accel = (this.targetRadius - this.radius) / 2;
        this.radiusV += accel;
        this.radiusV *= BOUNCE;
        this.radius += this.radiusV;

        ctx.beginPath();
        ctx.fillStyle = `rgb(${this.red}, ${this.green}, ${this.blue})`;
        // ctx.rect(this.x, this.y, this.radius*2, this.radius*2);
        ctx.arc(this.x, this.y, this.radius, 0, PI2, false);
        ctx.fill();
    }

    reset() {
        this.radius = 0;
        this.radiusV = 0;

        
    }
}

class Ripple {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.radius = 0;
        this.maxRadius = 0;
        this.speed = 10;
    }

    resize(stageWidth, stageHeight) {
        this.stageWidth = stageWidth;
        this.stageHeight = stageHeight;
    }

    start(x, y) {
        this.x = x;
        this.y = y;
        this.radius = 0;
        this.maxRadius = this.getMax(x, y);

    }

    animate() {
        if (this.radius < this.maxRadius) {
            this.radius += this.speed;
        }
    }

    getMax(x, y) {
        const c1 = distance(0, 0, x, y);
        const c2 = distance(this.stageWidth, 0, x, y);
        const c3 = distance(0, this.stageHeight, x, y);
        const c4 = distance(this.stageWidth, this.stageHeight, x, y);
        return Math.max(c1, c2, c3, c4);
    }
}

class App {
    constructor(imgDataURL) {
        document.getElementById('home-body').remove();
        this.canvas = document.createElement('canvas');
        document.body.appendChild(this.canvas);
        this.ctx = this.canvas.getContext('2d');

        this.tmpCanvas = document.createElement('canvas');
        this.tmpCtx = this.tmpCanvas.getContext('2d');

        this.pixelRatio = window.devicePixelRatio > 1 ? 2 : 1;

        this.ripple = new Ripple();

        window.addEventListener('resize', this.resize.bind(this), false);
        this.resize();

        // this.radius = 3;
        // this.pixelSize = 6;

        this.radius = 22;
        this.pixelSize = this.radius*2;


        // this.radius = 4;
        // this.pixelSize = 8;
        this.dots = [];


        this.isLoaded = false;
        this.imgPos = {
            x: 0,
            y: 0,
            width: 0,
            height: 0,
        };
        
        // const imgDataURL = localStorage.getItem("image_file");

        // if(imgDataURL) {
        //     console.log(imgDataURL);
        //     console.log(typeof(imgDataURL));
        // }
        this.image = new Image();
        this.image.src = imgDataURL;
        // this.image.src = 'bladerunner.jpg';
        // this.image = imgDataURL;
        this.image.onload = () => {
            this.isLoaded = true; 
            this.drawImage();
        }

        window.requestAnimationFrame(this.animate.bind(this));

        this.canvas.addEventListener('click', this.onClick.bind(this), false);
        this.resizeDots();
    }

    resizeDots() {
        document.addEventListener('keydown', (event) => {
            if(event.key == "=" && this.radius < 21){
                console.log("resizing dots", this.radius);
                console.log("resizing dots", this.pixelSize);
                this.radius += 1;
                this.pixelSize = this.radius *2;
            }
            if(event.key == "-" && this.radius > 3) {
                console.log("resizing dots", this.radius);
                console.log("resizing dots", this.pixelSize);

                this.radius -= 1;
                this.pixelSize = this.radius *2;

            }
        });
    }

    resize() {
        this.stageWidth = document.body.clientWidth;
        this.stageHeight = document.body.clientHeight;

        this.canvas.width = this.stageWidth * this.pixelRatio;
        this.canvas.height = this.stageHeight * this.pixelRatio;

        this.ctx.scale(this.pixelRatio, this.pixelRatio);

        this.tmpCanvas.width = this.stageWidth;
        this.tmpCanvas.height = this.stageHeight;

        this.ripple.resize(this.stageWidth, this.stageHeight);

        if (this.isLoaded) {
            this.drawImage();
        }
    }

    drawImage() {
        const stageRatio = this.stageWidth / this.stageHeight;
        const imgRatio = this.image.width / this.image.height;

        this.imgPos.width = this.stageWidth;
        this.imgPos.height = this.stageHeight;

        if (imgRatio > stageRatio) {
            this.imgPos.width = Math.round(
                this.image.width * (this.stageHeight / this.image.height)
            );
            this.imgPos.x = Math.round(
                (this.stageWidth - this.imgPos.width) / 2
            );
        } else {
            this.imgPos.height = Math.round(
                this.image.height * (this.stageWidth / this.image.width)
            );
            this.imgPos.y = Math.round(
                (this.stageHeight - this.imgPos.height) / 2
            );
        }


        this.ctx.drawImage(
            this.image,
            0, 0,
            this.image.width, this.image.height, 
            this.imgPos.x, this.imgPos.y,
            this.imgPos.width, this.imgPos.height,
        );

        this.tmpCtx.drawImage(
            this.image,
            0, 0,
            this.image.width, this.image.height, 
            this.imgPos.x, this.imgPos.y,
            this.imgPos.width, this.imgPos.height,
        );

        this.imgData = this.tmpCtx.getImageData(0, 0, this.stageWidth, this.stageHeight);

        this.drawDots(this.pixelSize);

    }

    drawDots(pixelSize) {
        this.dots = [];

        this.columns = Math.ceil(this.stageWidth / this.pixelSize);
        this.rows = Math.ceil(this.stageHeight / this.pixelSize);

        for (let i = 0; i < this.rows; i++) {
            // const y = (i + 0.5) * this.pixelSize;
            // const y = i * this.radius;
            const y = i * pixelSize;
            // const y = i + 0.5;
            const pixelY = Math.max(Math.min(y, this.stageHeight), 0);

            for (let j = 0; j < this.columns; j ++) {
                // const x = (j + 0.5) * this.pixelSize;
                const x = j * pixelSize;
                // const x = j * this.pixelSize;
                // const x = j + 0.5
                const pixelX = Math.max(Math.min(x, this.stageWidth), 0);

                const pixelIndex = (pixelX + pixelY * this.stageWidth) * 4;
                const red = this.imgData.data[pixelIndex + 0];
                const green = this.imgData.data[pixelIndex + 1];
                const blue = this.imgData.data[pixelIndex + 2];

                const dot = new Dot(
                    x, y, 
                    this.radius,
                    this.pixelSize,
                    red, green, blue
                );

                this.dots.push(dot);

            }

        }

    }


    animate() {
        window.requestAnimationFrame(this.animate.bind(this));

        this.ripple.animate();

        for (let i =0; i < this.dots.length; i++) {
            const dot = this.dots[i];
            if(collide(
                dot.x, dot.y,
                this.ripple.x, this.ripple.y,
                this.ripple.radius
            )) {
                dot.animate(this.ctx);
            }
        }

    }

    onClick(e) {
        this.ctx.clearRect(0, 0, this.stageWidth, this.stageHeight);
        console.log(this.radius);
        this.drawDots(this.pixelSize);

        for (let i = 0; i < this.dots.length; i++) {
            this.dots[i].reset();
        }

        this.ctx.drawImage(
            this.image,
            0, 0,
            this.image.width, this.image.height, 
            this.imgPos.x, this.imgPos.y,
            this.imgPos.width, this.imgPos.height,
        );

        this.ripple.start(e.offsetX, e.offsetY);
    }
}


window.onload = () => {
    const fileSelector = document.getElementById('file-selector');
    fileSelector.addEventListener('change', (event) => {
        var imgDataURL = URL.createObjectURL(event.target.files[0]);
        new App(imgDataURL);

    });
}

    


