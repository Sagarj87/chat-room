var app=angular.module("myModule",[]);
app.controller('groupChatController',function($scope, $location,$http){

    $scope.roomName="";
    $scope.userName="";
    $scope.message="";
    $scope.socket = {};
    $scope.users = [];
    var urlParts = $location.absUrl().split('/');
    var grpName = urlParts[urlParts.length-1];

    if(!grpName) {
        $scope.showModal = true;
        $scope.showModal1=false;
    }else {
        $scope.roomName=grpName;
        $scope.showModal = false;
        $scope.showModal1=true;
    }


    $scope.UserGroup=[];

    $scope.getName=function(grpName) {
        $scope.roomName = grpName;
        $scope.showModal = false;
        $scope.showModal1 = true;
    };

    $scope.getUserName=function(username){
        $scope.userName=username;
        $scope.showModal1=false;

        if( $scope.roomName &&  $scope.userName){
            $scope.initiate();
        }else {
            alert("Please provide roomName and userName");
            window.location.reload("/");
        }
    };

    $scope.sendMessage=function(){
        // tell server to execute 'message' and send along one parameter
        $scope.socket.emit('message', { roomName :  $scope.roomName, userName :  $scope.userName , message :  $scope.message});
        $scope.message = "";
        $('#data').focus();
    };

    $scope.leaveRoom = function(){
        window.location.replace("/chatroom");
    };

    $scope.initiate = function(){
             var url =   '/' + $scope.roomName + '/joinRoom/' + $scope.userName;
            $http.post(url ).
                success(function(data, status, headers, config) {
                    // this callback will be called asynchronously
                    // when the response is available
                    $scope.initSocket();

                }).
                error(function(data, status, headers, config) {
                    // called asynchronously if an error occurs
                    // or server returns response with an error status.
                });

    };

    $scope.initSocket = function(){
        $scope.socket = io('http://10.204.249.42/'+$scope.roomName);

        $scope.socket.on('connect', function(){

            // call the server-side function 'addUser' and send one parameter (value of prompt)
            $scope.socket.emit('addUser', { userName : $scope.userName, roomName : $scope.roomName });
            console.log('Connected to room',$scope.roomName);
        });

        // listener, whenever the server emits 'updatechat', this updates the chat body
        $scope.socket.on('welcome', function (username, data) {
            if(username === $scope.userName)
                $('#conversation').append('<b>SERVER :</b> ' + data + '<br>');
        });

        // listener, whenever the server emits 'updatechat', this updates the chat body
        $scope.socket.on('flood', function (username, data) {
            $('#conversation').append('<b>'+username + ':</b> ' + data + '<br>');
        });

        // listener, whenever the server emits 'updateUsers', this updates the username list
        $scope.socket.on('updateUsers', function(data) {
            console.log(data);
            $scope.$apply(function(){
                $scope.users = data;
            });
        });


        $scope.socket.on('resumeChat', function(_userName,conversationHistory) {
            if(_userName === $scope.userName)
                $.each(conversationHistory, function(index,data) {
                    $('#conversation').append('<b>'+ data.userName + ':</b> ' + data.message + '<br>');
                });
        });


        $scope.socket.on('disconnected', function() {
            console.log('disconnect');
        });

        $scope.socket.on('typing', function(userName) {
            $("#conversation span#"+userName).remove();
            if(userName !== $scope.userName){
                $("#conversation").append('<span id="'+userName+'" class="typing"><b>'+userName+' :</b>typing ...<br></span>');
            }
        });
    };

    // when the client hits ENTER on their keyboard
    $('#data').keypress(function(e) {
        if(e.which == 13) {
            $(this).blur();
            $('#datasend').click();
        }else{
            $scope.socket.emit('typing', $scope.userName );
        }
    });

    setInterval(function(){
        $("#conversation span.typing").remove();
    },2000);

    $(window).on('beforeunload', function(){
        return 'Are you sure you want to leave the room ?';
    });

    $(window).on('unload', function(){
        $scope.socket.emit('leave', { roomName : $scope.roomName, userName : $scope.userName });
        alert( "Handler for .unload() called." );
    });

    $("#conversation").append('<span class="typing"></span>');

});



app.directive('ngEnter', function () {
    return function (scope, element, attrs) {
        element.bind("keydown keypress", function (event) {

            if(event.which === 13) {
                scope.$apply(function (){
                    scope.$eval(attrs.ngEnter);
                });
                event.preventDefault();
            }
        });
    };
});

app.directive('modal', function () {
    return {
        templateUrl : '/static/templates/nameModal.htm',
        restrict: 'E',
        transclude: true,
        replace:true,
        scope:true,
        link: function postLink(scope, element, attrs) {
            scope.title = attrs.title;

            scope.$watch(attrs.visible, function(value){
                if(value == true)
                    $(element).modal('show');
                else
                    $(element).modal('hide');
            });

            $(element).on('shown.bs.modal', function(){

                scope.$apply(function(){
                    scope.$parent[attrs.visible] = true;

                });
                $('#roomName').focus();
            });

            $(element).on('hidden.bs.modal', function(){
                scope.$apply(function(){
                    scope.$parent[attrs.visible] = false;
                });
            });
        }
    };
});

app.directive('modal1', function () {
    return {
        templateUrl : '/static/templates/name.htm',
        restrict: 'E',
        transclude: true,
        replace:true,
        scope:true,
        link: function postLink(scope, element, attrs) {
            scope.title = attrs.title;

            scope.$watch(attrs.visible, function(value){
                if(value == true)
                    $(element).modal('show');
                else
                    $(element).modal('hide');
            });

            $(element).on('shown.bs.modal', function(){
                scope.$apply(function(){
                    scope.$parent[attrs.visible] = true;

                });
                $('#userName').focus();
            });

            $(element).on('hidden.bs.modal', function(){
                scope.$apply(function(){
                    scope.$parent[attrs.visible] = false;
                });
            });
        }
    };
});

