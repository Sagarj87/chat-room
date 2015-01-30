var app=angular.module("myModule",[]);
app.controller('chatRoomController',function($scope,$http) {

    $scope.rooms = [];
    $scope.isEmpty = true;

    $scope.getActiveRooms = function(){
        $http.get('/rooms/fetch' ).
            success(function(data, status, headers, config) {
                // this callback will be called asynchronously
                // when the response is available
                //$scope.initSocket();
                if(data && data.length > 0 ) {
                    $scope.rooms = data;
                    $scope.isEmpty = false;
                }
                else {
                    $scope.notify = "There are no chat rooms available";
                    $scope.isEmpty = true;
                }

            }).
            error(function(data, status, headers, config) {
                // called asynchronously if an error occurs
                // or server returns response with an error status.
                console.log(status);
            });
    };

    $scope.initSocket = function() {
        $scope.socket = io('http://10.204.249.42/chatroom');
        $scope.socket.on('connect', function(){


            console.log('Connected to room chatroom');
        });
        $scope.socket.on('newRoom', function(data){
            $scope.$apply(function(){
                $scope.rooms = data;
            });
        });
    };

    $scope.getActiveRooms();
    $scope.initSocket();
});