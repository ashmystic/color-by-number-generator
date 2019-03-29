var app;

window.onload = function() {

	app = new Color_By_Number_App();
	app.initialize();
	app.redraw();

};

window.onresize = function() {
	app.redraw();
}
/*
	Constructor
*/
function Color_By_Number_App () {

	/*
		Data
	*/
	this.DEBUG = false;

	this.inputContext = document.getElementById("inputCanvas").getContext("2d");
	this.previewContext = document.getElementById("outputCanvas").getContext("2d");
	this.colorSwatchContext = document.getElementById("colorSwatchCanvas").getContext("2d");

	this.inputFileName = "";
	this.image = document.getElementById("image");

	this.drawingWidth = 0;
	this.drawingHeight = 0;

	this.numberCells = 40;
	this.numberCellsX = 0;
	this.numberCellsY = 0;
	this.cellLength = 0;

	this.numberColors = 7;

	this.uniqueColorsArray = null;

	// this.colorTolerance = 0x000512;
	this.colorTolerance = 1;

	this.previewModeColor = true;

	/*
		UI
	*/
	this.inputFileUpload = document.getElementById("inputFileUpload");
	this.imagePreviews = document.getElementsByClassName("imagePreview");


	// Slider to control number of cells
	this.inputFieldNumberCells = $("#inputFieldNumberCells");
	this.sliderNumberCells = $("#sliderNumberCells");
	this.numberCellsMin = 10;
	this.numberCellsMax = 80;
	this.numberCellsStep = 5;

	// Slider to control number of colors
	this.inputFieldNumberColors = $("#inputFieldNumberColors");
	this.sliderNumberColors = $("#sliderNumberColors");
	this.numberColorsMin = 2;
	this.numberColorsMax = 9;
	this.numberColorsStep = 1;

	// Slider to control color tolerance
	this.inputFieldColorTolerance = $("#inputFieldColorTolerance");
	this.sliderColorTolerance = $("#sliderColorTolerance");
	// this.colorToleranceMin = 0x000000;
	// this.colorToleranceMax = 0x065536;
	// this.colorToleranceStep = 0x000064;
	this.colorToleranceMin = 1;
	this.colorToleranceMax = 10;
	this.colorToleranceStep = 1;
	this.colorToleranceUIRatio = 50000;

	// Checkbox to toggle preview color
	this.checkboxPreviewMode = document.getElementById("checkboxPreviewMode");

	// Buttons to export image
	this.inputButtonSaveImage = $("#inputButtonSaveImage");
	this.inputButtonGeneratePDF = $("#inputButtonGeneratePDF");

	this.initGUI();
}

Color_By_Number_App.prototype = {

	constructor: Color_By_Number_App,

	initialize: function() {
		this.log('initialize');

		this.uniqueColorsArray = new Array();
	},

	initGUI: function() {

		var app = this;
		
		/*
			UI to upload file
		*/
		this.inputFileUpload.addEventListener('change', function(event) {
	        if(event.target.files[0]) {
			    var app = this;

				app.initialize();
				app.inputFileName = event.target.files[0].name.substr(0, event.target.files[0].name.indexOf("."));
			    var url = URL.createObjectURL(event.target.files[0]);
			    app.image = new Image();
			    app.image.onload = function() {
			    	Array.prototype.forEach.call(app.imagePreviews, function(el) {
			 		   	el.style.display = "block";
					});
			    	app.loadImage(app.image, app.inputContext);
			    	app.redraw();
			    }
		    	app.image.src = url;
		    }
	    }.bind(this), false);

		/*
			UI to control number of cells
		*/
		this.sliderNumberCells.slider({
			range: "min",
			min: this.numberCellsMin,
			max: this.numberCellsMax,
			value: this.numberCells,
			step: this.numberCellsStep,
			slide: function( event, ui ) {
				app.numberCells = ui.value;
				app.inputFieldNumberCells.val(app.numberCells);
				app.redraw();
		  }
		});

		this.inputFieldNumberCells.attr('min', this.numberCellsMin);
		this.inputFieldNumberCells.attr('max', this.numberCellsMax);
		this.inputFieldNumberCells.attr('step', this.numberCellsStep);
		this.inputFieldNumberCells.val(this.numberCells);
		this.inputFieldNumberCells.change(function () {
			app.numberCells = this.value;
			app.sliderNumberCells.slider("value", app.numberCells);
			app.redraw();
		});

		/*
			UI to control number of colors
		*/
		this.sliderNumberColors.slider({
			range: "min",
			min: this.numberColorsMin,
			max: this.numberColorsMax,
			value: this.numberColors,
			step: this.numberColorsStep,
			slide: function( event, ui ) {
				app.numberColors = ui.value;
				app.inputFieldNumberColors.val(app.numberColors);
				app.redraw();
		  }
		});

		this.inputFieldNumberColors.attr('min', this.numberColorsMin);
		this.inputFieldNumberColors.attr('max', this.numberColorsMax);
		this.inputFieldNumberColors.attr('step', this.numberColorsStep);
		this.inputFieldNumberColors.val(this.numberColors);
		this.inputFieldNumberColors.change(function () {
			app.numberColors = this.value;
			app.sliderNumberColors.slider("value", app.numberColors);
			app.redraw();
		});

		/*
			UI to control color tolerance
		*/
		this.sliderColorTolerance.slider({
			range: "min",
			min: this.colorToleranceMin,
			max: this.colorToleranceMax,
			value: Math.ceil(this.colorTolerance),
			step: this.colorToleranceStep,
			slide: function( event, ui ) {
				app.inputFieldColorTolerance.val(ui.value);
				app.colorTolerance = ui.value;
				app.log(app.colorTolerance, app.toHexColor(app.colorTolerance, false));
				app.redraw();
		  }
		});

		this.inputFieldColorTolerance.attr('min', this.ColorToleranceMin);
		this.inputFieldColorTolerance.attr('max', this.ColorToleranceMax);
		this.inputFieldColorTolerance.attr('step', this.colorToleranceStep);
		this.inputFieldColorTolerance.val(Math.ceil(this.colorTolerance));
		this.inputFieldColorTolerance.change(function () {
			app.sliderColorTolerance.slider("value", this.value);
			app.colorTolerance = this.value;
			app.redraw();
		});

		/*
			UI to toggle color
		*/
		this.checkboxPreviewMode.checked = this.previewModeColor;
		this.checkboxPreviewMode.addEventListener('click', function(event) {
			app.setPreviewMode(event.target.checked);
	    } );

		const fileName = "color-by-number_"+app.inputFileName+"_s"+app.numberCells+"_n"+app.numberColors+"_c"+app.colorTolerance;
		/*
			UI to save image
		*/
		this.inputButtonSaveImage.button();
		this.inputButtonSaveImage.click( function( event ) {
	      	app.setPreviewMode(true, 1000);
			const image = app.previewContext.canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
			window.location.href=image;
	    } );

	    this.inputButtonGeneratePDF.button();
		this.inputButtonGeneratePDF.click( function( event ) {
			if(app.uniqueColorsArray.length > 0) {
				app.generatePDF(app.previewContext, app.colorSwatchContext, fileName+".pdf");
			} else {
				alert('Upload an image file first!');
			}
	    });
	},

	setPreviewMode: function(modeColor, width) {
		this.log('previewModeColor',modeColor);
		this.previewModeColor = modeColor;
		this.checkboxPreviewMode.checked = this.previewModeColor;
		this.redraw(width);
	},

	setDrawingWidth: function(width) {
		if(width) {
			this.drawingWidth = width;
		} else if(window.innerWidth > 720) {
			this.drawingWidth = window.innerWidth-500;
		} else {
			this.drawingWidth = window.innerWidth-50;
		}
	},

	/*
		Scale and draw input image
	*/	
	loadImage: function(image, context) {
		var aspectRatio = image.width / image.height;

	  	context.canvas.width = image.width = 100;
	  	context.canvas.height = image.height = context.canvas.width / aspectRatio;
	  	this.log('InputDimensions', context.canvas.width + ', ' + context.canvas.height);
	  	context.drawImage(image, 0, 0, context.canvas.width, context.canvas.height);
	},

	pdfPrintFooter: function(pdf, x, y) {
		pdf.setFontSize(14);
		pdf.setFont('Times');
		pdf.setTextColor('#434343');
		pdf.text('Created by Mystery Mosaic Color-By-Number Generator @ ASHMYSTIC.COM', x, y);
	},

	generatePDF: function(previewContext, colorSwatchContext, fileNameString) {

		const margin = 20;

		const colorSwatchAspectRatio = colorSwatchContext.canvas.width / colorSwatchContext.canvas.height;
		const imgAspectRatio = previewContext.canvas.width / previewContext.canvas.height;
	
		const orientationPortrait = imgAspectRatio <= 1;

		// A4 dimensions: 595 x 842 pt = 8.27 × 11.69 inch @ 72 DPI
		const docWidth = (orientationPortrait ? 595 : 842);
		const docLength = (orientationPortrait ? 842 : 595);

		const docAspectRatio = docWidth / docLength;

		var imgWidth, imgHeight;
		if(imgAspectRatio > docAspectRatio) {
			imgWidth = docWidth - 2*margin;
			imgHeight = imgWidth / imgAspectRatio;
		} else {
			imgHeight = (docLength - 2*margin) / (1 + (imgAspectRatio / colorSwatchAspectRatio));
			imgWidth = imgHeight * imgAspectRatio;
		}

		var pdf = new jsPDF({
			unit: 'pt',
			orientation: (orientationPortrait ? 'portrait' : 'landscape')
		})

		/*
			Page 1
		*/
		// Print number grid
		this.setPreviewMode(false, 1000);
		const previewGridData = previewContext.canvas.toDataURL("image/jpeg", 1.0);
		pdf.addImage(previewGridData, 'JPEG', margin, margin, imgWidth, imgHeight);

		// Print color swatch key
		const colorSwatchData = colorSwatchContext.canvas.toDataURL("image/jpeg", 1.0);
		const colorSwatchHeight = (imgWidth / colorSwatchAspectRatio) / 2;
		pdf.addImage(colorSwatchData, 'JPEG', margin, margin+imgHeight, imgWidth, colorSwatchHeight);

		// Print footer text
		this.pdfPrintFooter(pdf, margin, docLength - margin);

		/*
			Page 2
		*/
		// Print preview
		pdf.addPage();
		pdf.setPage(2);
		this.setPreviewMode(true, 1000);
		const previewColorData = previewContext.canvas.toDataURL("image/jpeg", 1.0);
		pdf.addImage(previewColorData, 'JPEG', margin, margin, 300, 300 / imgAspectRatio);

		// Print footer text
		this.pdfPrintFooter(pdf, margin, docLength - margin);

		pdf.save(fileNameString);

		// Revert size
		this.setPreviewMode(true);
	},

	redraw: function(width) {
		this.log('redraw');
		this.setDrawingWidth(width);
		this.uniqueColorsArray = new Array();

		if(this.image.src) {
			this.log('found image');
			var aspectRatio = this.image.width / this.image.height;

		  	if(aspectRatio > 1) {
		  		this.numberCellsY = this.numberCells;
		  		this.numberCellsX = Math.ceil(this.numberCellsY * aspectRatio);
		  	} else {
		  		this.numberCellsX = this.numberCells;
		  		this.numberCellsY = Math.ceil(this.numberCellsX / aspectRatio);
		  	}

		  	this.cellLength = Math.floor(this.drawingWidth / this.numberCellsX);

		  	this.previewContext.canvas.width = this.cellLength * this.numberCellsX;
		  	this.previewContext.canvas.height = this.cellLength * this.numberCellsY;

		  	this.log('NumberCells', this.numberCellsX + ', ' + this.numberCellsY);
			this.drawImage(this.image, this.inputContext, this.previewContext, this.previewModeColor);


			this.drawColorSwatches(this.colorSwatchContext, this.uniqueColorsArray);
		}
	},

	drawImage: function(image, inputContext, previewContext, previewModeColor) {
		this.log('drawImage');

	  	/*
	  		Generate and draw output image
	  	*/
	  	var data = this.getImageData(image, inputContext, true);
	  	var initialFrequencyMap = data[0];
	  	var grid = data[1];

	  	var initialFrequencyMapSorted = new Map([...initialFrequencyMap.entries()].sort());

	//  	this.log('initialFrequencyMapSorted',initialFrequencyMapSorted);

	  	var data = this.getMaps(initialFrequencyMapSorted, this.numberColors);
	  	var frequencyMap = data[0];
	  	var toleranceMap = data[1];
	  	

	  	previewContext.clearRect(0, 0, previewContext.canvas.width, previewContext.canvas.height);
		previewContext.fillStyle = '#EDEDED';
		previewContext.fillRect(0, 0, previewContext.canvas.width, previewContext.canvas.height);
	  	for(var x = 0; x < this.numberCellsX ; x++) {
	  		for(var y = 0; y < this.numberCellsY ; y++) {

	  			grid[x][y] = frequencyMap.get(toleranceMap.get(grid[x][y]));

	  			if(previewModeColor) {
	  				previewContext.fillStyle = '#'+grid[x][y];
		  			previewContext.fillRect(x*this.cellLength, y*this.cellLength, this.cellLength, this.cellLength);
	  			} else {
	  				previewContext.fillStyle = '#FFFFFF';
		  			previewContext.fillRect(x*this.cellLength, y*this.cellLength, this.cellLength, this.cellLength);
		  			
	  				previewContext.strokeStyle = '#000000';
	  				previewContext.strokeRect(x*this.cellLength, y*this.cellLength, this.cellLength, this.cellLength);

		  			var number = this.getColorNumber(grid[x][y], this.uniqueColorsArray);
		  			const fontSize = this.cellLength / 1.5;
		  			previewContext.font = fontSize+"px Arial";
		  			previewContext.fillStyle = '#434343';
					previewContext.fillText(number, x*this.cellLength+this.cellLength/2-previewContext.measureText(number).width/2, y*this.cellLength+2*this.cellLength/3);
		  		}
	  		}
	  	}
	},

	drawColorSwatches: function(context, colorsArray) {
		this.log('colorsArray', colorsArray);

		const maxSwatchRadius = 20;
		const yPos = maxSwatchRadius*2;
		const swatchRadius = Math.min(maxSwatchRadius, (context.canvas.width / colorsArray.length) * (2/5));

		context.canvas.width = this.drawingWidth;
		context.canvas.height = maxSwatchRadius*5;

		context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		context.fillStyle = '#FFFFFF';
		context.fillRect(0, 0, context.canvas.width, context.canvas.height);

		for(var x = 0; x < colorsArray.length; x++) {
			const xPos = swatchRadius* (4/3) + x*(5/2)*swatchRadius;
			context.beginPath();
			context.arc(xPos, yPos, swatchRadius, 0, 2 * Math.PI);
			context.fillStyle = '#'+colorsArray[x];
			context.fill();
			context.strokeStyle = "#5e5e5e"
			context.stroke();
			context.closePath();

			var number = this.getColorNumber(colorsArray[x], colorsArray);
  			const fontSize = swatchRadius;
  			context.font = fontSize+"px Arial";
  			context.fillStyle = '#434343';
			context.fillText(number, xPos - context.measureText(number).width/2, yPos*2);
		}
	},

	getImageData: function(image, inputContext, getHues) {
		var frequencyMap = new Map();

		var grid = [];
		var xStep = inputContext.canvas.width / this.numberCellsX;
		var yStep = inputContext.canvas.height / this.numberCellsY;
	  	for(var x = 0; x < this.numberCellsX; x++) {
	  		grid.push(new Array());
	  		for(var y = 0; y < this.numberCellsY; y++) {
	  			var imageData = inputContext.getImageData(x*xStep, y*yStep, 1, 1);
	  		//	this.log(imageData);

	  			var dataHex = this.rgbToHex(imageData.data, false);

	  			grid[x].push(dataHex);
	  			var count = frequencyMap.get(dataHex);
	  			if(count) {
	  				count++;
	  			} else {
	  				count = 1;
	  			}
	  			frequencyMap.set(dataHex, count);
	  		}
	  	}
	  	this.log('frequencyMap', frequencyMap);
	  	this.log('grid', grid);
	  	return [frequencyMap, grid];
	},

	getToleranceMap: function(mapArr, tolerance) {
		
		var toleranceMap = new Map();
		var toleranceFrequencyMapArray = [];
		var i = 0;

		// mapArr = [[150, 5],[148,2],[120,1],[56,6],[54,3],[50,1],[48,4]];
		this.log('mapArr',mapArr);
		this.log('mapArr.length',mapArr.length);

		while(i < mapArr.length) {
			// TODO fix algorithm
			var entry = mapArr[i];
			// this.log('entry',entry);
			toleranceMap.set(entry[0], entry[0]);

			if(i < mapArr.length - 1) {
				var nextEntry = mapArr[i+1];
				// this.log('nextEntry 1',nextEntry);

				var color1 = '0x'+nextEntry[0];
				var color2 = '0x'+entry[0];
							while((i < mapArr.length - 1) && (Math.abs('0x'+(color1-color2).toString(16)) < this.colorTolerance*this.colorToleranceUIRatio)) {
					// console.log('color diff: ' + color1 + ' - ' + color2 + ' = ' + (color1-color2) + ', < tolerance? ' + ('0x'+(color1-color2).toString(16) < this.colorTolerance));
					// console.log('color diff: ' + color1 + ' - ' + color2 + ' = ' + Math.abs('0x'+(color1-color2).toString(16)) + ' < ' + this.colorTolerance);
					entry = [entry[0], entry[1]+nextEntry[1]];
					// this.log('newEntry',entry);
					toleranceMap.set(nextEntry[0], entry[0]);
					i++;
					if(i < mapArr.length - 1) {
						nextEntry = mapArr[i+1];
						// this.log('nextEntry 2',nextEntry);
						color1 = '0x'+nextEntry[0];
						color2 = '0x'+entry[0];
					}
				}
			}
			toleranceFrequencyMapArray.push(entry);
			i++;
		}
		this.log('toleranceMap',toleranceMap)
		this.log('toleranceFrequencyMapArray',toleranceFrequencyMapArray);
		return [toleranceMap, toleranceFrequencyMapArray];
	},

	getMaps: function(map, numberColors) {
		
		var data = this.getToleranceMap(Array.from(map));
		var toleranceMap = data[0];
		var toleranceFrequencyMapArray = data[1];

		var step = Math.floor(toleranceFrequencyMapArray.length / numberColors);
		this.log('toleranceFrequencyMapArray.length',toleranceFrequencyMapArray.length);
		this.log('step',step);
		var frequencyMap = new Map();

		// this.log('toleranceFrequencyMapArray', toleranceFrequencyMapArray);

		/*
			Get map of values
		*/
		for(var x = 0; x < toleranceFrequencyMapArray.length - 1; x+= step) {

			var highestFrequency = toleranceFrequencyMapArray[x];

			for(var i = 1; i < step; i++) {
				if(toleranceFrequencyMapArray[x+i] && toleranceFrequencyMapArray[x+i][1] > highestFrequency[1]) {
					highestFrequency = toleranceFrequencyMapArray[x+i];
				}
			}
			this.log('highestFrequency',highestFrequency);
			this.uniqueColorsArray.push(highestFrequency[0]);
			for(var i2 = 0; i2 < step; i2++) {
				if(toleranceFrequencyMapArray[x+i2]) {
					frequencyMap.set(toleranceFrequencyMapArray[x+i2][0], highestFrequency[0]);
				}
			}
		}
		this.log('frequencyMap', frequencyMap);
		this.log('toleranceMap', toleranceMap);
		return [frequencyMap, toleranceMap];
	},

	getColorNumber: function(color, uniqueColorsArray) {
		return uniqueColorsArray.indexOf(color)+1;
	},

	log: function(title, data) {
		if(this.DEBUG) {	
			console.log(title + ': ');

			if(data)
				console.log(data);
		}
	},

	addAndSort: function(array, value) {
	    array.push(value);
	    i = array.length - 1;
	    item = array[i];
	    while (i > 0 && item < array[i-1]) {
	        array[i] = array[i-1];
	        i -= 1;
	    }
	    array[i] = item;
	    return array;
	},

	toHexColor: function ( d, hashTag ) {
       var c = Number(d).toString(16);
       return hashTag ? '#':'' + ( "000000".substr( 0, 6 - c.length ) + c );
    },

    componentToHex: function (c) {
	    var hex = Number(c).toString(16);
	    return hex.length == 1 ? "0" + hex : hex;
	},
 	rgbToHex: function (rgbArr, hashTag) {
 		var r = rgbArr[0];
	    var g = rgbArr[1];
	    var b = rgbArr[2];
	    return hashTag ? '#':'' + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
	},

	rgbToHsl: function(rgbArr){
	    var r1 = rgbArr[0] / 255;
	    var g1 = rgbArr[1] / 255;
	    var b1 = rgbArr[2] / 255;
	 
	    var maxColor = Math.max(r1,g1,b1);
	    var minColor = Math.min(r1,g1,b1);
	    //Calculate L:
	    var L = (maxColor + minColor) / 2 ;
	    var S = 0;
	    var H = 0;
	    if(maxColor != minColor){
	        //Calculate S:
	        if(L < 0.5){
	            S = (maxColor - minColor) / (maxColor + minColor);
	        }else{
	            S = (maxColor - minColor) / (2.0 - maxColor - minColor);
	        }
	        //Calculate H:
	        if(r1 == maxColor){
	            H = (g1-b1) / (maxColor - minColor);
	        }else if(g1 == maxColor){
	            H = 2.0 + (b1 - r1) / (maxColor - minColor);
	        }else{
	            H = 4.0 + (r1 - g1) / (maxColor - minColor);
	        }
	    }
	 
	    L = L * 100;
	    S = S * 100;
	    H = H * 60;
	    if(H<0){
	        H += 360;
	    }
	    var result = [H, S, L];
	    return result;
	}

}