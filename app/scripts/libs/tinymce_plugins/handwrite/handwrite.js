tinymce.PluginManager.add('handwrite', function(editor) {
	var settings = editor.settings;

	editor.addCommand('handwrite', function() {
		var HandWrite,
			$mask,
			pluginProp = {id:"instructureHandWrite",name:"instructure_handWrite"},

			sketchSetting = {  
					sketchType:"handWrite",
					id:"",
					lineW : 10,
					canvasW : $(window).width() <= 1024 ? 700 : 1000,
					canvasH : 240,
					color : {hex:"000000",rgb:[0,0,0]},
					tools : {type:"line",src:""},
					appName : "sketch_app",
					appTitle : "写字板"
			};

		if( HandWrite == undefined ) {
				sketchSetting.id = editor.id;
				initial();
		}
				HandWrite.set("id",editor.id);

		//$("#ipadScale").attr("content","user-scalable=no");
		HandWrite.App.dialog({
			width: sketchSetting.canvasW + 70,
			minHeight: sketchSetting.canvasH,
			title:sketchSetting.appTitle,
			dialogClass: sketchSetting.sketchType,
			"resizable": false,
			modal: true,
			close: function() {
				HandWrite.reset();
			}
		});

		function initial(){
				var Write = Sketcher.extend({
						writeState : {},

						onCanvasMouseDown : function () {
								var self = this;
								var  flag = self.defaults.sketchType
								return function(event) {

										//  right mouse is forbidden
										if( event.button == 2 )return false;   

										// ***** added
										self.writeState = true;
										clearTimeout(self.timeOut_mouseUp);     

										self.lines.push([]);

										// unbind the event if in ie, when drawing out the canvas to select the text out of canvas, than back in canvas drawing the line always drawing
										// if ( $.browser.msie ){self.canvas.off( self.mouseMoveEvent + '.' + flag);}

										// move event bind to document, so mouse move out and in the canvas , the lines would not mess up
										$(document).on( self.mouseMoveEvent + '.' + flag, self.onCanvasMouseMove() );
										$(document).on( self.mouseUpEvent + '.' + flag, self.onCanvasMouseUp() );

										self.updateMousePosition( event );
										//self.renderFunction( event );           // click drawing
										return false;      //**** ie & chrome bug, stop the mouse selecting the outer text
								}

						},

						onCanvasMouseUp : function (event) {
								var self = this;
								var  flag = self.defaults.sketchType
								return function(event) {

										// ****** added
										if( !self.writeState ) return;
										self.timeOut_mouseUp = setTimeout(function(){

												if( !self.writeState ) return;

														self.saveImg();
														self.reset();

										},700);

										$(document).off( self.mouseMoveEvent + '.' + flag );
										$(document).off( self.mouseUpEvent + '.' + flag );

								}

						},

						reset : function () {
								this.writeState = false;
								clearTimeout(this.timeOut_mouseUp);
								this.lines = [];
								this.clear();
								this.writingEdge = {leftTop:{x:9999,y:9999},rightBottom:{x:0,y:0}};
						},

						saveImg : function () {
								var self = this;
								//****** rewrite character and get the new data
								var writeW = this.writingEdge.rightBottom.x - this.writingEdge.leftTop.x;
								var writeH = this.get("canvasH");
								var cropLeft = this.writingEdge.leftTop.x - this.canvas.offset().left;
								var $copyCanvas = $("<canvas></canvas>").attr({
										width: writeW/7 + 1,
										height: writeH/7 + 1
								});
								var copyCanvasContext = $copyCanvas.get(0).getContext("2d");
								copyCanvasContext.strokeStyle = "#000000";
								copyCanvasContext.lineWidth = 1.2;
								$.each(self.lines, function(i){
										$.each(self.lines[i], function(k,value){
												if( k == 0 ){
														copyCanvasContext.beginPath();

														copyCanvasContext.moveTo( ( value[0]-cropLeft )/7, ( value[1] ) /7 );
												}else{
														copyCanvasContext.lineTo( ( value[0] - cropLeft )/7, ( value[1] )/7 );
														if( k == ( self.lines[i].length - 1 ) ){
																copyCanvasContext.stroke();
														}
												}
										});
								});
								var copyCanvasData = $copyCanvas.get(0).toDataURL();
								// end

								//****** insert image
								var $div = $("<div></div>"),
										$img = $("<img/>").attr("src",copyCanvasData).addClass(this.get("sketchType"));
								$div.append($img);
								_.defer(function(){
									editor.execCommand('mceInsertContent', false, $div.html());
								});
								// end

						}

				});

				HandWrite = new Write(sketchSetting);

				//****** add  buttonSet

				//var $scale = $('<meta id="ipadScale" name="viewport" content="user-scalable=no" />').prependTo("head");
				var buttonSet = $("<div class='buttons-set'></div>");

				var $undo = $("<span class='btn-undo'>撤销</span>")
						.bind("mousedown",function(){
								tinymce.activeEditor.undoManager.undo();
						}).appendTo(buttonSet);
						
				var $redo = $("<span class='btn-redo'>redo</span>")
						.bind("mousedown",function(){
								tinymce.activeEditor.undoManager.redo();
						}).appendTo(buttonSet);

				/*var $return = $("<span href='#' class='btn btn-success'><i class='ico-white ico-arrow-left'></i>换行</span>")
						.click(function(){
								var $editor = $("#" + editor.id);
								//tinyMCE.activeEditor.selection.select(tinyMCE.activeEditor.dom.select('p')[0]);
							 $editor.editorBox('insert_code', "<br/>");
						}).appendTo(buttonSet);*/

				/*var $close = $("<a href='#' class='btn-close'>关闭</a>")
						.click(function(e){
								e.preventDefault();
								HandWrite.App.hide();
								$mask.hide();
								$("#ipadScale").attr("content","user-scalable=yes");
						}).appendTo(buttonSet);*/

				HandWrite.App.prepend(buttonSet);
				// end

				/*tinymce.activeEditor.dom.addClass(tinymce.activeEditor.dom.select('p'), 'someclass');
				editor.onUndo.add(function(ed, level) { console.log('Undo was performed: ' + level.content); });*/
				
				

				//****** choose brush
				HandWrite.brushSize = {width:9,height:9,step:1};
				$(".big_brush").trigger("click");
				// end

		}


	});

	editor.addButton('handwrite', {
		// text : 'handwrite',
		title : '写字板',
		cmd : 'handwrite'
	});

	editor.addMenuItem('handwrite', {
		text : 'handwrite',
		cmd : 'handwrite',
		context: 'view'
	});
});


