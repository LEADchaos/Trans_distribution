//拍照上传功能
//对接html中的气罐卸车按钮
var head_pho = document.getElementById('photograph-unload');
var toast = new auiToast({})
mui.plusReady(function() {
	// 文件路径  
	var filepath;
	head_pho.addEventListener('tap', function() {
		if (mui.os.plus) {
			var a = [{
				title: '拍照'
			}];
			plus.nativeUI.actionSheet({
				title: '',
				cancel: '取消',
				buttons: a
			}, function(b) {
				switch (b.index) {
					case 0:
						break;
					case 1:
						//拍照功能  
						getImages();
						break;
					default:
						break;
				}
			}, false);
		}
	});

	//拍照功能  
	function getImages() {
		var mobileCamera = plus.camera.getCamera();
		mobileCamera.captureImage(function(e) {
			plus.io.resolveLocalFileSystemURL(e, function(entry) {
				var path = entry.toLocalURL() + '?version=' + new Date().getTime();
				var dstname = "_downloads/" + getUid() + ".jpg"; //设置压缩后图片的路径    
				compressImage(path, dstname, 0);
			}, function(err) {
				console.log("读取拍照文件错误");
			});
		}, function(e) {
			console.log("er", err);
		}, function() {
			filename: '_doc/head.png';
		});
	}


	// 产生一个随机数    
	function getUid() {
		return Math.floor(Math.random() * 100000000 + 10000000).toString();
	}

	//上传气瓶卸车的记录
	function unload_Record(bottleid) {
		// 传入的参数为气瓶编号
		var unloadcoordInfo;
		if (localStorage.getItem('coordInfo') != null) {
			coordInfo = localStorage.getItem('coordInfo')
			unloadcoordInfo = JSON.parse(coordInfo)
			console.log(coordInfo)
		} else {
			toast.fail({
				title: "获取位置信息失败，请开启位置权限",
				duration: 2000
			});
			return;
		}
		// 气瓶编号
		url = host + '/updateState' + '?_=' + Date.parse(new Date());
		mydata = {
			'bottleid': bottleid,
		}
		mydata = Object.assign(mydata, unloadcoordInfo)
		console.log(JSON.stringify(mydata))
		$.ajax({
			type: 'POST',
			url: url,
			data: mydata,
			cache: false,
			async: false, // true（异步）, false（同步）
			success: function(result) {
				if (result.code == 1 || result.code == '1') {
					// 请求成功
					console.log("ajax请求成功" + result.msg);

					toast.success({
						title: "" + result.msg,
						duration: 2000
					});
					getInfo();
				} else {
					toast.fail({
						title: result.msg,
						duration: 2000
					});
				}
			},
			error: function(XMLHttpRequest, textStatus, errorThrown) {
				console.log("ajax请求失败" + textStatus);

				toast.fail({
					title: "提交失败",
					duration: 2000
				});
			}
		})
	}


	// 上传图片进行识别操作  
	function upload() {
		var task = plus.uploader.createUpload('http://8.130.182.184:15010/apis/lpg/cloud/recognize_decode', {
				//var task = plus.uploader.createUpload('https://httpbin.org/post', {  
				method: "POST"
			},
			function(t, status) { //上传完成    
				if (status == 200) {
					console.log(t.responseText);
					var code = JSON.parse(t.responseText)['code'];
					var msg = JSON.parse(t.responseText)['msg'];
					var lpgCode = JSON.parse(t.responseText)['data']['lpgObj']['lpgCode'];
					if (code == 200) {
						// 识别正常，
						console.log("响应码：" + msg);
						if(lpgCode != ""){
							toast.success({
								title: "" + msg,
								duration: 2000
							});
							var orgCode = JSON.parse(t.responseText)['data']['lpgObj']['orgCode'];
							var validTime = JSON.parse(t.responseText)['data']['lpgObj']['validTime'];
							unload_Record(lpgCode);
						}else{
							toast.success({
								title: "识别失败！",
								duration: 2000
							});
						}
					} else if (code = 500) {
						// 识别异常
						console.log("响应码：" + msg);

						toast.success({
							title: "" + msg,
							duration: 2000
						});
					}

				} else {
					console.log("上传失败：" + status);
				}
			});
		token = '91210103079149042Q1'
		task.addData('orgCode', token);
		task.addFile(filepath, {
			key: "codeImage"
		});
		task.start();
	}

	// 进行图片压缩  
	function compressImage(src, dstname, rotate) {
		plus.zip.compressImage({
				src: src,
				dst: dstname,
				overwrite: true,
				quality: 20,
				rotate: rotate
			},
			function(event) {
				console.log("Compress success:" + event.target);
				filepath = event.target;
				upload();
			},
			function(error) {
				console.log(error);
			});
	}
})