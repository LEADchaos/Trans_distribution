(function($, owner) {
	
	//上传账号密码进行验证
	function upload(account) {
		// 传入的参数为account账户名为手机号
		// var loadcoordInfo;
		// if (localStorage.getItem('coordInfo') != null) {
		// 	coordInfo = localStorage.getItem('coordInfo')
		// 	loadcoordInfo = JSON.parse(coordInfo)
		// } else {
		// 	toast.fail({
		// 		title: "获取位置信息失败，请开启位置权限",
		// 		duration: 2000
		// 	});
		// 	return;
		// }
		url = 'http://114.115.156.201:8087/drivercar/selectByphone';
		mydata = {
			'id': account
		}
		//mydata = Object.assign(mydata, loadcoordInfo)
		mydata = Object.assign(mydata)
		console.log(JSON.stringify(mydata))
		$.ajax({
			type: 'GET',
			url: url,
			data: mydata,
			cache: false,
			async: false, // true（异步）, false（同步）
			success: function(result) {
				console.log(result)
				if (result.code == 1 || result.code == '1') {
					// 请求成功
					localStorage.setItem('user',JSON.stringify(result));
					console.log("ajax请求成功" + localStorage.getItem('user'));
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
	
	
	/**
	 * 用户登录
	 **/
	owner.login = function(loginInfo, callback) {
		callback = callback || $.noop;
		loginInfo = loginInfo || {};
		loginInfo.account = loginInfo.account || '';
		loginInfo.password = loginInfo.password || '';
		if (loginInfo.account.length < 1) {
			return callback('请输入账号');
		}
		if (loginInfo.password.length < 1) {
			return callback('请输入密码');
		}
		upload(loginInfo.account);
		var uaccount = JSON.parse(localStorage.getItem('user'))['msg']['driverphone'];
		var upassword = JSON.parse(localStorage.getItem('user'))['msg']['driverpsw'];
		console.log("account:"+ uaccount);
		var users = JSON.parse(localStorage.getItem('$users') || '[]');
		users.push({
			account: uaccount,
			password: upassword
		});
		var authed = users.some(function(user) {
			return loginInfo.account == user.account && loginInfo.password == user.password;
		});
		if (authed) {
			return owner.createState(loginInfo.account, callback);
		} else {
			return callback('用户名或密码错误');
		}
	};

	owner.createState = function(account, callback) {
		var drivercarno = JSON.parse(localStorage.getItem('user'))['msg']['drivercarno'];
		localStorage.setItem('drivercarno',drivercarno);
		var drivername = JSON.parse(localStorage.getItem('user'))['msg']['drivername'];
		localStorage.setItem('drivername',drivername);
		var drivertel = JSON.parse(localStorage.getItem('user'))['msg']['driverphone'];
		localStorage.setItem('drivertel',drivertel);
		
		var state = owner.getState();
		state.account = account;
		state.token = "token123456789";
		owner.setState(state);
		return callback();
	};

	/**
	 * 新用户注册
	 **/
	owner.reg = function(regInfo, callback) {
		callback = callback || $.noop;
		regInfo = regInfo || {};
		regInfo.account = regInfo.account || '';
		regInfo.password = regInfo.password || '';
		if (regInfo.account.length < 5) {
			return callback('用户名最短需要 5 个字符');
		}
		if (regInfo.password.length < 6) {
			return callback('密码最短需要 6 个字符');
		}
		if (!checkEmail(regInfo.email)) {
			return callback('邮箱地址不合法');
		}
		var users = JSON.parse(localStorage.getItem('$users') || '[]');
		users.push(regInfo);
		localStorage.setItem('$users', JSON.stringify(users));
		return callback();
	};

	/**
	 * 获取当前状态
	 **/
	owner.getState = function() {
		var stateText = localStorage.getItem('$state') || "{}";
		try {
			return JSON.parse(stateText);
		} catch (e) {
			return {};
		}
	};

	/**
	 * 设置当前状态
	 **/
	owner.setState = function(state) {
		state = state || {};
		localStorage.setItem('$state', JSON.stringify(state));
	};

	var checkEmail = function(email) {
		email = email || '';
		return (email.length > 3 && email.indexOf('@') > -1);
	};

	/**
	 * 找回密码
	 **/
	owner.forgetPassword = function(email, callback) {
		callback = callback || $.noop;
		if (!checkEmail(email)) {
			return callback('邮箱地址不合法');
		}
		return callback(null, '新的随机密码已经发送到您的邮箱，请查收邮件。');
	};

	/**
	 * 获取应用本地配置
	 **/
	owner.setSettings = function(settings) {
		settings = settings || {};
		localStorage.setItem('$settings', JSON.stringify(settings));
	}

	/**
	 * 设置应用本地配置
	 **/
	owner.getSettings = function() {
		var settingsText = localStorage.getItem('$settings') || "{}";
		try {
			return JSON.parse(settingsText);
		} catch (e) {
			return {};
		}
	}

}(mui, window.app = {}));