/**
 * Created by su on 2017/10/12.
 */
//注册模块
const registerApp = angular.module('registerApp', []);
registerApp.controller('registerController', ($scope, $http) => {
    $scope.formData = {};
    $scope.postForm = () => {
        //发送一个POST请求, 用来提交用户注册的信息
        $http({
            method: 'POST',//发送的方式
            url: '/register',//发送的地址
            data: $.param($scope.formData),//发送的数据
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(data => {
            //成功之后调用的代码
            if(data.data == 'success') {
                $('.alert-success').removeClass('hide');
                $('input[type=submit]').attr('disabled', 'disabled');
                let num = 5;
                setInterval(function () {
                    if(num >= 0) {
                        num --;
                        $('.alert-success span').html(num);
                    }
                }, 1000)
                setTimeout(function () {
                    $('.alert-success').addClass('hide');
                    window.location.href = '/login';
                    $('input[type=submit]').removeAttr('disabled');
                }, 5000);
            }
            else {
                console.log(data.data)
                $scope.error = data.data;
                $('.alert-danger').stop(true, false).fadeIn();
                setTimeout(function () {
                    $('.alert-danger').fadeOut();
                }, 1000)
            }
        }).catch(err => {
            console.log(err);//失败以后调用的代码
        })
    }
})
//创建一个登录模块
const loginApp = angular.module('loginApp',[]);
loginApp.controller('loginController',($scope,$http)=>{
    $scope.formData = {};
    //提交用户的登录信息
    $scope.postForm = ()=>{
        $http({
            method:'POST',
            url:'/login',
            data:$.param($scope.formData),
            headers:{'Content-Type':'application/x-www-form-urlencoded'}
        }).then(data => {
            if(data.data == 'success') {
                window.location.href = '/index';
            }
            else {
                $scope.error = data.data;
                $('.login-failed div').stop(true, false).fadeIn();
                setTimeout(function () {
                    $('.login-failed div').fadeOut();
                }, 1000);
            }
        }).catch(err => {
            // console.log(data);

        })
    }
})
//设置模块
const settingApp = angular.module('settingApp', []);
settingApp.controller('settingController', ($scope, $http) => {
    $scope.formData = {
        motto: $('textarea[name=motto]').html(),
        avatar: $('input[name=avatar]').attr('target')
    }
    $("#avatar").fileinput({
        overwriteInitial: true,
        uploadUrl:'/updateImage',
        maxFileSize: 3000,
        showClose: false,
        showCaption: false,
        showBrowse: false,
        browseOnZoneClick: true,
        removeLabel:'',
        removeIcon:'<i class="glyphicon glyphicon-remove"></i>',
        removeClass:'btn btn-danger',
        removeTitle:"取消或重置更改",
        uploadLabel:'',
        uploadClass:'btn btn-success',
        uploadIcon:'<i class="glyphicon glyphicon-arrow-up"></i>',
        msgErrorClass:'alert alert-block alert-danger',
        elErrorContainer:'kv-avatar-errors-2',
        layoutTemplates:{main2:'{preview}' + '{browse}'},
        language: "zh",
        allowedFileExtensions: ["jpg", "png", "gif", "jpeg"],
        defaultPreviewContent:'<img src="' + $('#avatar').attr('target') + '">'
    }).on('fileuploaded',function(event,data,previewId,index){
        console.log(data.response.url.replace('public',''));
        $scope.formData.avatar = data.response.url.replace('public','');
    });
    $scope.postForm = () => {
        $http({
            method: 'POST',
            url: '/updateUser/' + $('form').attr('id'),
            data: $.param($scope.formData),
            headers:{'Content-Type':'application/x-www-form-urlencoded'}
        }).then(data => {
            if(data.data == 'success') {
                window.location.reload();
            }
            else {
                alert(data.data);
            }
        }).catch(err => {
            console.log(err);
        })
    }
})

//新建问题
const createApp = angular.module('createApp', []);
createApp.controller('createController', ($scope, $http) => {
    $scope.isLegal = false
    // 开启markdown
    const simplemde = new SimpleMDE({
        element: $("#question")[0] ,
        status:false,
        styleSelectedText:false,
    });
    //内容验证
    simplemde.codemirror.on('change', function () {
        if(simplemde.value().replace(/\s+/g, '').length >= 10 ) {
            $scope.isLegal = true;
            //传播一下
            $scope.$apply();
            $('.markdown-info').addClass('hide');
        }
        else if(simplemde.value().replace(/\s+/g, '').length < 10 ) {
            $scope.isLegal = false;
            $scope.$apply();
            $('.markdown-info').removeClass('hide');
        }
    })
    $scope.formData = {
        category: 'ask'
    };
    $scope.postForm = () => {
        //首先拿到问题的内容
        $scope.formData.content = simplemde.value();
        //发送
        $http({
            method: 'POST',
            url: '/question/create',
            data: $.param($scope.formData),
            headers:{'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(data => {
            if(typeof data.data === 'object') {
                window.location.href = data.data.url;
            }
            else {
                $scope.error = data.data;
                $('#errorbox').fadeIn();
                setTimeout(function () {
                    $('#errorbox').fadeOut();
                }, 1000)
            }
        }).catch(error => {
            console.log(error);
        })
    }
})

//消息通知
const messageApp = angular.module('messageApp', []);
messageApp.controller('messageController', ($scope, $http) => {
    $scope.formData = {};
    $scope.allRead = () => {
        $http({
            method: 'GET',
            url: '/updateAllMessage'
        }).then(data => {
            if(data.data == 'success') {
                $('.read-item').fadeOut('slow');
            }
            else {
                console.log(data);
            }
        }).catch(err => {
            console.log(err);
        })
    }
    $scope.readOne = (index) => {
        let messageId = $('.read-item').eq(index).attr('message-id');
        $http({
            method: 'GET',
            url: `/updateMessage/${messageId}`
        }).then(data => {
            if(data.data == 'success') {
                $('.read-item').eq(index).fadeOut('slow');
            }
            else {
                console.log(data);
            }
        }).catch(err => {
            console.log(err);
        })
    }
})

//问题详情
const questionApp = angular.module('questionApp', []);
questionApp.controller('questionController', ($scope, $http) => {
    // 开启markdown
    const simplemde = new SimpleMDE({
        element: $("#question")[0] ,
        status:false,
        styleSelectedText:false,
    });
    $(function () {
        $('#reply-button').attr('disabled', true);
        simplemde.codemirror.on('change', function () {
            if(simplemde.value().replace(/\s+/, '').length > 0) {
                $('#reply-button').removeAttr('disabled');
            }
            else {
                $('#reply-button').attr('disabled', true);
            }
        })
    })
    $scope.postForm = (event) => {
        //要发送的地址
        let url = $('#reply_form').attr('target');
        let content = simplemde.value();
        //要发送的数据
        $http({
            method: 'POST',
            url: url,
            data: $.param({content:content}),
            headers:{'Content-Type': 'application/x-www-form-urlencoded'}
        }).then(data => {
            if(data.data.message == 'success') {
                window.location.reload();
            }
            else {
                alert(data.data);
            }
        }).catch(err => {
            console.log(err);
        })
    }
})

//编辑问题
const editApp = angular.module('editApp', []);
editApp.controller('editController', ($scope, $http) => {
    $scope.isLegal = false
    const simplemde = new SimpleMDE({
        element: $("#question")[0] ,
        status:false,
        styleSelectedText:false,
    });
    let content = $('#question').attr('value');
    simplemde.value(content);
    //内容验证
    simplemde.codemirror.on('change', function () {
        if(simplemde.value().replace(/\s+/g, '').length >= 10 ) {
            $scope.isLegal = true;
            //传播一下
            $scope.$apply();
            $('.markdown-info').addClass('hide');
        }
        else if(simplemde.value().replace(/\s+/g, '').length < 10 ) {
            $scope.isLegal = false;
            $scope.$apply();
            $('.markdown-info').removeClass('hide');
        }
    })
    $scope.formData = {
        category: $('.selected').attr('catagory'),
        title: $('input[name=title]').val()
    };
    $scope.postForm = () => {
        //首先拿到问题的内容
        $scope.formData.content = simplemde.value();
        let questionUser = $('main').attr('questionUser');
        let userId = $('main').attr('userId');
        console.log(questionUser, userId);
        if(questionUser == userId) {
            //发送
            $http({
                method: 'POST',
                url: `/question/${$('main').attr('id')}/edit`,
                data: $.param($scope.formData),
                headers:{'Content-Type': 'application/x-www-form-urlencoded'}
            }).then(data => {
                if(typeof data.data === 'object') {
                    window.location.href = data.data.url;
                }
                else {
                    $scope.error = data.data;
                    $('#errorbox').fadeIn();
                    setTimeout(function () {
                        $('#errorbox').fadeOut();
                    }, 1000)
                }
            }).catch(error => {
                console.log(error);
            })
        }
        else {
            alert('您没有权限修改该文章!')
        }
    }
})