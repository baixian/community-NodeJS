/**
 * Created by su on 2017/10/12.
 */
$(function () {
    let num1 = 1;
    $('.pageButton').eq(num1 - 1).addClass('active');
    $('.pageButton').on('click', function () {
        $('.read-list').addClass('hide');
        num1 = ($(this).html() - 1) * 5 + 1;
        $(this).addClass('active').siblings().removeClass('active');
        loop();
    });
    function loop() {
        $('.read-list').each(function () {
            let num2 = $(this).attr('i')
            if(num2 >= num1 && num2 < +num1 + 5) {
                $(this).removeClass('hide');
            }
        })
    }
    loop();

    // 二级回复显示隐藏特效
    $(document).on("click", ".reply", function() {
        var reply_id = $(this).closest('.comment-body-list').attr('id');
        $(this).parent().siblings('.small-comment-body').toggleClass('hide').find('.falseDiv').focus();
        $.ajax({
            beforeSend: function () {
                //显示所有的二级回复以及表单
                // content = $(this).html();
                // $(this).html('收起评论');
                off = false;
            },
            type: 'GET',
            url: `/${reply_id}/showComments`
        }).done(result => {
            $(this).parent().siblings('.small-comment-body').find('.loading').addClass('hide');
            $(this).parent().siblings('.small-comment-body').find('.comment-body-list').remove().end().find('.towComment').append(result);
        }).fail(err => {
            console.log(err);
        })
    })
    //二级回复输入框表单显示隐藏
    $(document).on("click", ".twoReply", function (event) {
        var userName = $(this).parent().siblings('.comment-author').html();
        $(this).parents('.meta').siblings('form').removeClass('hide').find('.falseDiv').attr('placeholder', `回复${userName}`).focus().end().end().addClass('hide');
        $(this).parents('.small-comment-body .comment-body-list').siblings('li').find('form').addClass('hide').end().find('.meta').removeClass('hide');
    })
    //点击取消按钮隐藏输入框
    $(document).on('click', '.reply-somebody-cancel', function (event) {
        event.preventDefault();
        $(this).parent().addClass('hide').siblings('.meta').removeClass('hide');
    })
    //输入框获取焦点时隐藏其他输入框
    $(document).on('focus', '.falseDiv-two', function () {
        $(this).parent().siblings('ul').find('form').addClass('hide').siblings('.meta').removeClass('hide');
    })
    //监听表单的keyup事件, 如果为空, 发表按钮无法点击
    $(document).on("keyup", ".falseDiv", function (event) {
        if($(this).html().replace(/[&nbsp;\s+]/g, '').length <= 0) {
            $(this).siblings('.commentBtn2').attr('disabled', 'true');
        }
        else {
            $(this).siblings('.commentBtn2').removeAttr('disabled')
        }
    })
    //针对某个人进行回复
    $(document).on('click', '.commentBtn2', function (event) {
        event.preventDefault();
        var content = $(this).siblings('.falseDiv').html();
        var regex1 = new RegExp('<div>','g');
        var regex2 = new RegExp('</div>','g');
        content = content.replace(regex1,'<p>').replace(regex2,'</p>');
        var reply_id = $(this).siblings('input[name=reply_id]').val();
        var comment_target_id = $(this).siblings('input[name=comment_target_id]').val();
        var data = {
            content,
            reply_id,
            comment_target_id
        }
        $.ajax({
            type: 'POST',
            url: $(this).parent().attr('action'),
            data:$.param(data),
            headers:{'Content-Type':'application/x-www-form-urlencoded'}
        }).done(result => {
            $(this).parent().addClass('hide').siblings('.meta').removeClass('hide');
            $('.towComment').append(result);
        }).fail(err => {
            console.log(err);
        })
    })

    //显示所有回复分页
    $('#showReply').on('click', function () {
        let id = $('#showReply').attr('target');
        $.ajax({
            method: 'GET',
            url: `/question/${id}/showReply`
        }).then(data => {
            $('#reply-all-list').html(data);
            twoReply();
            $('#showReply').addClass('hide');
            $('.small-comment-body .pageBtn:first-of-type').addClass('active');
        }).fail(err => {
            console.log(err);
        })
    })
    function twoReply() {
        //内容验证
        $('textarea.markdown_comments').each(function(index,value){
            var targetBtn = $(this).siblings('input[type=submit]');
            var editor = new SimpleMDE({
                element:value,
                status:false,
                toolbar: false
            })
            var $el = $(this);
            editor.render(this);
            //绑定editor
            $(this).data('editor', editor);
            editor.codemirror.on('change', function (event) {
                if(editor.value().replace(/[ ]+/g, '').length < 0.5) {
                    targetBtn.attr('disabled', 'true');
                }
                else {
                    targetBtn.removeAttr('disabled')
                }
            })
            //点击评论按钮提交表单数据以及评论内容
            targetBtn.click(function (event) {
                event.preventDefault();
                //1.回复的内容
                var form = $(this).closest('form');
                var content = editor.value();
                //2.一级回复的ID以及对应回复的人
                var reply_id = form.find('input[name=reply_id]').val();
                var comment_target_id = form.find('input[name=comment_target_id]').val();
                //数据整合成一个对象
                var data = {
                    content,
                    reply_id,
                    comment_target_id
                };
                $.ajax({
                    type: 'POST',//发送ajax的方式, GET请求基本上用来获取数据, POST提交数据
                    url: form.attr('action'),
                    data: $.param(data),
                    headers:{'Content-Type': 'application/x-www-form-urlencoded'}
                }).done(result => {
                    $('.towComment').append(result);
                    editor.value('');
                }).fail(err => {
                    console.log(err);
                })
            })
            editor.toolbar = false;
        })
    }
    twoReply();

    //二级回复分页
    $('.small-comment-body .pageBtn:first-of-type').addClass('active');
    $(document).on('click', '.small-comment-body .pageBtn', function () {
        var page = $(this).text();
        var reply_id = $(this).closest('.comment-body-list').attr('id');
        $(this).addClass('active').siblings().removeClass('active')
        $.ajax({
            type: 'GET',
            url: `/comments/${reply_id}/${page}`
        }).done(result => {
            console.log($(this).siblings('.towComment'))
            $(this).closest('.small-comment-body').find('.comment-body-list').remove();
            $(this).closest('.small-comment-body').find('.towComment').append(result);
        }).fail(err => {
            console.log(err);
        })
    })

    //删除文章
    $('.deleteQuestion').click(function () {
        if(confirm('您确定要删除吗?')) {
            var question_id = $(this).attr('questionId');
            $.ajax({
                type: 'GET',
                url: `/question/${question_id}/delete`
            }).done(result => {
                if(result == 'success') {
                    alert('删除成功');
                    window.location.href = '/index';
                }
                else {
                    alert('对不起! 您没有权限删除该文章!');
                }
            }).fail(err => {
                console.log(err);
            })
        }
    })

    //首页的分页
    $('.index-btn').click(function () {
        var page = $(this).html();
        $.ajax({
            type: 'GET',
            url: `/index/${page}`
        }).done(result => {
            $('.index-question').empty().append(result);
            $(this).addClass('active').siblings().removeClass('active');
        }).fail(err => {
            console.log(err);
        })
    })
    //路由种类的的分页
    $(document).on('click','.create-btn button',function () {
        var page = $(this).html();
        var category = $(this).attr('name');
        $.ajax({
            type: 'GET',
            url: `/index/questions/${category}/${page}`
        }).done(result => {
            $(this).closest('.index-question').find('li').remove();
            $(this).closest('.index-question').prepend(result);
        }).fail(err => {
            console.log(err);
        })
    })
    //首页分类
    $('.index-title li').click(function () {
        var category = $(this).attr('category');
        $.ajax({
            type: 'GET',
            url: `/index/questions/${category}`
        }).done(result => {
            $('.index-question').empty().append(result);
        }).fail(err => {
            console.log(err);
        })
    })
    //首页的分页
    $('.users-btn').click(function () {
        var page = $(this).html();
        $.ajax({
            type: 'GET',
            url: `/users/${page}`
        }).done(result => {
            $('.users-body').empty().append(result);
            $(this).addClass('active').siblings().removeClass('active');
        }).fail(err => {
            console.log(err);
        })
    })
    
    //一级回复点赞
    $(document).on('click', '.one-like', function () {
        var userId = $(this).closest('.comment-body-list').attr('userId');
        if(userId) {
            var replyUser = $(this).closest('.comment-body-list').attr('id');
            var replyId = $(this).closest('.comment-body-list').attr('replyId');
            var data = {
                replyId
            }
            $.ajax({
                type: 'GET',
                url: `/reply/like/${replyUser}`,
                data: $.param(data)
            }).done(result => {
                $(this).html(result);
            }).fail(err => {
                console.log(err);
            })
        }
        else {
            alert('请先登录!')
        }
    })
    //一级回复踩
    $(document).on('click', '.one-unlike', function () {
        var userId = $(this).closest('.comment-body-list').attr('userId');
        if(userId) {
            var replyUser = $(this).closest('.comment-body-list').attr('id');
            var replyId = $(this).closest('.comment-body-list').attr('replyId');
            var data = {
                replyId
            }
            $.ajax({
                type: 'GET',
                url: `/reply/unlike/${replyUser}`,
                data: $.param(data)
            }).done(result => {
                $(this).html(result);
            }).fail(err => {
                console.log(err);
            })
        }
        else {
            alert('请先登录!')
        }
    })
    //二级回复点赞
    $(document).on('click', '.two-like', function () {
        var userId = $(this).closest('.comment-body-list').attr('userId');
        if(userId) {
            var commentUser = $(this).closest('.comment-body-list').attr('id');
            var commentId = $(this).closest('.comment-body-list').attr('commentId');
            var data = {
                commentId
            }
            $.ajax({
                type: 'GET',
                url: `/comment/like/${commentUser}`,
                data: $.param(data)
            }).done(result => {
                $(this).html(result);
            }).fail(err => {
                console.log(err);
            })
        }
        else {
            alert('请先登录!')
        }
    })
    //二级回复踩
    $(document).on('click', '.two-unlike', function () {
        var userId = $(this).closest('.comment-body-list').attr('userId');
        if(userId) {
            var commentUser = $(this).closest('.comment-body-list').attr('id');
            var commentId = $(this).closest('.comment-body-list').attr('commentId');
            var data = {
                commentId
            }
            $.ajax({
                type: 'GET',
                url: `/comment/unlike/${commentUser}`,
                data: $.param(data)
            }).done(result => {
                $(this).html(result);
            }).fail(err => {
                console.log(err);
            })
        }
        else {
            alert('请先登录!')
        }
    })
    //关注用户
    $(document).on('click', '.users-follow-btn', function () {
        var target_id = $(this).attr('id');
        $.ajax({
            type: 'GET',
            url: `/follow/user/${target_id}`
        }).done(result => {
            if(result == 'follow') {
                $(this).find('.text').html('取消关注');
            }
            else if(result == 'unfollow') {
                $(this).find('.text').html('关注');
            }
            else if(result == 'err') {
                alert('不能关注自己!');
            }
            else {
                alert('请先登录!')
            }
        }).fail(err => {
            console.log(err);
        })
    })
    //关注问题
    $(document).on('click', '.detail-follow-btn', function () {
        var target_id = $(this).attr('id');
        var questionAuthor = $(this).attr('questionAuthor');
        var data = {
            questionAuthor
        }
        // console.log(questionAuthor);
        $.ajax({
            type: 'GET',
            url: `/follow/question/${target_id}`,
            data: $.param(data)
        }).done(result => {
            if(result == 'follow') {
                $(this).find('.text').text('取消关注');
            }
            else if(result == 'repeat') {
                alert('不能关注自己的文章!');
            }
            else {
                $(this).find('.text').text('关注');
            }
        }).fail(err => {
            console.log(err);
        })
    })
    //更多关注人页面
    $('.followMore').click(function () {
        var name = $(this).closest('.plate').attr('id');
        $.ajax({
            type: 'GET',
            url: `/user/${name}/follow`
        }).done(result => {
            $(this).siblings('.modal').find('.myFollows-list').html(result);
        }).fail(err => {
            console.log(err);
        })
    })
    $('.beFollowMore').click(function () {
        var name = $(this).closest('.plate').attr('id');
        $.ajax({
            type: 'GET',
            url: `/user/${name}/beFollowed`
        }).done(result => {
            $(this).siblings('.modal').find('.myFollows-list').html(result);
        }).fail(err => {
            console.log(err);
        })
    })
})