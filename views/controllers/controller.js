var myApp = angular.module('myApp', []);
myApp.controller('AppCtrl', ['$scope', '$http', function($scope, $http) {
    console.log("Hello World from controller");

var refresh = function() {
  $http.get('/itemlist').success(function(response) {
    console.log("I got the data I requested");
    $scope.itemlist = response;
    $scope.item = "";
  });
};
  $scope.addItem = function() {
  console.log($scope.item);
  $http.post('/itemlist', $scope.item).success(function(response) {
    console.log(response);
    refresh();
  });
};
$scope.removeItem = function(id) {
  console.log("remove"+id);
  $http.delete('/itemlist/' + id).success(function(response) {
    refresh();
  });
  };
var selection=[];
$scope.isSelected = function(id) {
  console.log("Selected"+id);
  selection.push(id);
  };
  
  $scope.onSubmit = function(){
    $scope.selectedRows= selection;
  }
$scope.editItem = function(id) {
  console.log("edit"+id);
  $http.get('/itemlist/'+id).success(function(response) {
    $scope.item = response;
  });
};
$scope.update = function() {
  console.log($scope.item._id);
  $http.put('/itemlist/' + $scope.item._id, $scope.item).success(function(response) {
    refresh();
  })
};
 $scope.selectedRow = null;  // initialize our variable to null
  $scope.setClickedRow = function(index){  //function that sets the value of selectedRow to current index
     $scope.selectedRow = index;
  } 
     refresh();
    }]);