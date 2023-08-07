//拍照上传功能
//对接html中的photo按钮
var head_pho = document.getElementById('photograph-identify');
var toast = new auiToast({});
mui.plusReady(function() {
	// 文件路径  
	var filepath;
	head_pho.addEventListener('tap', function() {
		if (mui.os.plus) {
			var a = [{
				title: '拍照'
				//}
				//, {  
				//    title: '从手机相册中获取'  
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
						//拍照  
						getImages();
						break;
						//case 2:  
						//打开相册  
						//    galleryImages();  
						//    break;  
					default:
						break;
				}
			}, false);
		}
	});

	//拍照  
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

	//从本地相册选择  
	function galleryImages() {
		plus.gallery.pick(function(a) {
			plus.io.resolveLocalFileSystemURL(a, function(entry) {
				plus.io.resolveLocalFileSystemURL('_doc/', function(root) {
					root.getFile('head.png', {}, function(file) {
						//文件已经存在  
						file.remove(function() {
							console.log("文件移除成功");
							entry.copyTo(root, 'head.png', function(e) {
								var path = e.fullPath +
									'?version=' + new Date()
									.getTime();

								var dstname = "_downloads/" +
									getUid() +
									".jpg"; //设置压缩后图片的路径    
								compressImage(path, dstname,
									270);
							}, function(err) {
								console.log("copy image fail: ",
									err);
							});
						}, function(err) {
							console.log("删除图片失败：（" + JSON.stringify(
								err) + ")");
						});
					}, function(err) {
						//打开文件失败  
						entry.copyTo(root, 'head.png', function(e) {
							var path = e.fullPath + '?version=' +
								new Date().getTime();
							uploadHeadImg(path);
						}, function(err) {
							console.log("上传图片失败：（" + JSON.stringify(
								err) + ")");
						});
					});
				}, function(e) {
					console.log("读取文件夹失败：（" + JSON.stringify(err) + ")");
				});
			});
		}, function(err) {
			console.log("读取拍照文件失败: ", err);
		}, {
			filter: 'image'
		});
	}


	// 产生一个随机数    
	function getUid() {
		return Math.floor(Math.random() * 100000000 + 10000000).toString();
	}
	
	
	//上传气瓶装车的记录
	function upload_Record(bottleid) {
		// 传入的参数为气瓶编号
		// 气瓶编号   运输车牌号和运输人
		var loadcoordInfo;
		var drivercarno = JSON.stringify(localStorage.getItem('drivercarno'));
		var drivername = JSON.stringify(localStorage.getItem('drivername'));
		var telephone = JSON.parse(localStorage.getItem('drivertel'))
		drivername = drivername.trim();
		drivercarno = drivercarno.trim();
		console.log(drivercarno+drivername+telephone);
		if (localStorage.getItem('coordInfo') != null) {
			coordInfo = localStorage.getItem('coordInfo')
			loadcoordInfo = JSON.parse(coordInfo)
		} else {
			toast.fail({
				title: "获取位置信息失败，请开启位置权限",
				duration: 2000
			});
			return;
		}
		url = host + '/insertState' + '?_=' + Date.parse(new Date());
		mydata = {
			'bottleid': bottleid,
			'transstaff': drivername,
			'carid': drivercarno,
			'tel': telephone
		}
		mydata = Object.assign(mydata, loadcoordInfo)
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
	
	// 上传图片操作  
	function upload() {
		var task = plus.uploader.createUpload('http://8.130.182.184:15010/apis/lpg/cloud/recognize_decode', {
				//var task = plus.uploader.createUpload('https://httpbin.org/post', {  
				method: "POST"
			},
			function(t, status) { //上传完成    
				if (status == 200) {
					console.log(t.responseText);
					//imgdiv.innerHTML = '<img id="userImg" src="' + t.responseText + '"/>';  
					var code = JSON.parse(t.responseText)['code'];
					var msg = JSON.parse(t.responseText)['msg'];
					//var orgCode = JSON.parse(t.responseText['data']['lpgObj']['orgCode']);
					//console.log("Jason:"+orgCode);
					//console.log(lpgObj);
					//JSON.parse(t.responseText,getorgCode);
					//console.log(lpgCode);
					//console.log(orgCode);  
					if (code == 200) {
						// 识别正常
						var lpgCode = JSON.parse(t.responseText)['data']['lpgObj']['lpgCode'];
						console.log("响应码：" + msg );
						if (lpgCode != "") {
							toast.success({
								title: "" + msg,
								duration: 2000
							});
							var orgCode = JSON.parse(t.responseText)['data']['lpgObj']['orgCode'];
							var validTime = JSON.parse(t.responseText)['data']['lpgObj']['validTime'];
							upload_Record(lpgCode);
						} else {
							toast.success({
								title: "识别失败！",
								duration: 2000
							});
							console.log("上车气瓶编码为空！");
						}
						// var keyCount = localStorage.length;
						// var newKey = `lpgCode${keyCount + 1}`;
						// localStorage.setItem(newKey, lpgCode);
						// console.log("lpgCode" + (keyCount + 1) + ":" + localStorage.getItem(newKey));
						// localStorage.setItem('$orgCode', orgCode);
						// console.log("orgCode:" + orgCode);
						// console.log("validTime:" + validTime);
						// console.log("lpgCode:" + lpgCode);
					} else if (code = 500) {
						// 识别异常
						console.log("响应码：" + msg);
						toast.success({
							title: "识别失败",
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