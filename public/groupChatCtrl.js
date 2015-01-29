var app=angular.module("myModule",[]);
app.controller('groupChatController',function($scope){

    $scope.groupName="";
    $scope.userName="";
    $scope.message="";
    $scope.showModal = true;
    $scope.showModal1=false;
    $scope.UserGroup=[];

    $scope.getName=function(grpName){

        $scope.groupName=grpName;
        $scope.showModal=false;
        $scope.showModal1=true;
    };

    $scope.getUserName=function(username){
        $scope.userName=username;
        var usrName={"Name":$scope.userName};
        $scope.UserGroup.push(usrName);
        $scope.showModal1=false;

    };

    $scope.sendMessage=function(){

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
            });

            $(element).on('hidden.bs.modal', function(){
                scope.$apply(function(){
                    scope.$parent[attrs.visible] = false;
                });
            });
        }
    };
});