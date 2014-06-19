tinymce.PluginManager.add('uploadimage', function(editor) {
	var settings = editor.settings;
	var $box;

	var initted = false;

	function imageUploaded() {
		var content = "Image has bean uploaded";
		dialogMessage(content);

	}

	function validateImage(imageVal) {
		var content, flag;
		flag = true;
		content = 'Please confirm your image is not empty';
		if (imageVal === '') {
			flag = false;
		} else if (!(/\.(?:png|jpg|jpeg|bmp|gif)$/i.test(imageVal))) {
			content = 'Please confirm your image type is correct';
			flag = false;
		}
		if (!flag) {
			dialogMessage(content);
		}
		return flag;
	}

	function dialogMessage(content){
		$('<div>' + content + '</div>').dialog({
			open: function( event, ui ) {
				$dialog = $(this);
				var closeDialog = function(){ 
					$dialog.remove() 
				};
				var t = setTimeout(closeDialog, 1500);
			}
		});
	}

	function initShared () {
		var token = $("#ajax_authenticity_token").text();
		var url = '/courses/' + 1 + '/student_files';

		$box = $("<form id='background_image_uploader' action=" + url + " method='POST' enctype='multipart/form-data' >" +
				"<table>" +
				"<tr>" +
				"<td>" +
				"选择图片" +
				"</td>" +
				"<td>" +
				"<input id='background_bg_image' name='attachment[uploaded_data]' type='file'>" +
				"</td>" +
				"</tr>" +
				"<tr>" +
				"<td>" +
				"</td>" +
				"<td>" +
				"</td>" +
				"</tr>" +
				"</table>" +
				"</form>").hide();

		$('body').append($box);

		var $textUploading = $("<span>上传中...</span>");
		var $inputFile = $box.find("#background_bg_image");
		var $confirm = $box.find(".confirm");

		// use delegate pattern to fix in quiz page bug
		$('#background_image_uploader').on('change', '#background_bg_image', function(){
			$box.submit()
		});
		
		$box.on('submit', function(e) {
			e.preventDefault();
			$(this).ajaxSubmit({
				clearForm: true,
				dataType: 'json',

				// add token to header
				headers: {
					'X-CSRF-Token': token
				},
				beforeSubmit: function() {
					var imageValidated = validateImage( $inputFile.val() );
					if(imageValidated) $confirm.hide().after($textUploading);
					return imageValidated;
				},
				success: function(data) {
					var $img = "<img src=" + data.url + ">"
						$div = $("<div></div>");
					$div.append($img);
					_.defer(function(){
						editor.execCommand('mceInsertContent', false, $div.html());
					});
					$confirm.show();
					$textUploading.remove();
					imageUploaded();
				}
			});


		});

		$box.dialog({
			autoOpen: false,
			width: 425,
			title: "uploadimage",
			modal: true,
			dialogClass: "instructure_upload_image"
		});
		initted = true;
	}

	editor.addCommand('uploadimage', function() {
		var thisEditor = $('#' + editor.id);
		if (!initted) initShared();
		$editor = thisEditor; // set shared $editor so images are pasted into the correct editor
		$box.dialog('open');
	});

	editor.addButton('uploadimage', {
		// text : 'uploadimage',
		title : '上传图片',
		cmd : 'uploadimage'
	});

	editor.addMenuItem('uploadimage', {
		text : 'uploadimage',
		cmd : 'uploadimage',
		context: 'view'
	});
});



