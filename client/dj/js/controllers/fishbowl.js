"use strict";

var fishbowlModule = angular.module("wizbif.fishbowl", [
	"wizbif.alert",
	"wizbif.database"
]);

fishbowlModule.controller("FishbowlAppCtrl", ["$scope", "$location", "db", "alert", function($scope, $location, db, alert) {
	$scope.info = {
		missed: true
	};
	$scope.app = {};

	$scope.submit = function(app) {
		db.Fishbowl.submitApp(app).then(function() {
			$location.url("/");
			alert.success("Fishbowl app submitted.");
		}, function(res) {
			alert.error(res.data || res.statusText);
		});
	};

	// initialize
	db.Fishbowl.getInfo().then(function(info) {
		$scope.info = info;
		$scope.info.missed = (info.deadline < Date.now());
	});
}]);

fishbowlModule.controller("FishbowlLogCtrl", ["$scope", "$uibModal", "alert", "db", function($scope, $uibModal, alert, db) {
	//$scope.fishbowl_log_types = db.getDefs("fishbowl_log_types");
	$scope.fishbowl_log_types = [ //temporary hardcode - start
        { typeID: 1, type: "Sport" },
        { typeID: 2, type: "Commitee Meeting" },
        { typeID: 3, type: "Loadin/Loadout" } // end
    ];

	$scope.fishbowl_log = [];

	var getFishbowlLog = function() {
		db.Fishbowl.getLog().then(function(fishbowl_log) {
			$scope.fishbowl_log = fishbowl_log;
		});
	};

	// $scope.addItem = function() {
	// 	$uibModal
	// 		.open({
	// 			templateUrl: "views/fishbowl_log_item.html",
	// 			controller: "FishbowlLogItemCtrl"
	// 		}).result
	// 		.then(getFishbowlLog);
	// };
	
	$scope.addItem = function() {
		$uibModal.open({
			templateUrl: "views/fishbowl_log_item.html",
			controller: "FishbowlLogItemCtrl",
			resolve: {
				item: function() {
					return {}; // Pass an empty object for new entry
				}
			}
		}).result.then(getFishbowlLog);
	};

	$scope.deleteItem = function(fishbowl_logID) {
		db.Fishbowl.deleteLogItem(fishbowl_logID)
			.then(function() {
				alert.success("Fishbowl item deleted.");
				getFishbowlLog();
			}, function(res) {
				alert.error(res.data || res.statusText);
			});
	};

	// NEW CODE
	$scope.editItem = function(fishbowl_logID) {
		var itemToEdit = $scope.fishbowl_log.find(item => item.fishbowl_logID === fishbowl_logID);
	
		$uibModal.open({
			templateUrl: "views/fishbowl_log_item.html",
			controller: "FishbowlLogItemCtrl",
			resolve: {
				item: function() {
					return angular.copy(itemToEdit); // Send a copy to avoid modifying the original before saving
				}
			}
		}).result.then(function(updatedItem) {
			getFishbowlLog(); // Refresh list after updating
		});
	};
	
	// END NEW CODE

	// initialize
	getFishbowlLog();
}]);

// ORIGINAL CODE

// fishbowlModule.controller("FishbowlLogItemCtrl", ["$scope", "db", "alert", function($scope, db, alert) {
// 	//$scope.fishbowl_log_types = db.getDefs("fishbowl_log_types");
// 	$scope.fishbowl_log_types = [
//         { typeID: 1, type: "Sport" },
//         { typeID: 2, type: "Commitee Meeting" },
//         { typeID: 3, type: "Loadin/Loadout" }
//     ];

// 	$scope.item = {};

// 	$scope.submit = function(item) {
// 		db.Fishbowl.submitLog(item).then(function() {
// 			alert.success("Fishbowl item submitted.");
// 			$scope.$close();
// 		}, function(res) {
// 			alert.error(res.data || res.statusText);
// 		});
// 	};
// }]);


fishbowlModule.controller("FishbowlLogItemCtrl", ["$scope", "db", "$http", "alert", "item", function($scope, db, $http, alert, item) {
    //$scope.fishbowl_log_types = db.getDefs("fishbowl_log_types");
	$scope.fishbowl_log_types = [
        { typeID: 1, type: "Sport" },
        { typeID: 2, type: "Commitee Meeting" },
        { typeID: 3, type: "Loadin/Loadout" }
    ];
    
    $scope.item = item || {}; // Use the provided item if editing, or an empty object for a new entry

    $scope.submit = function(item) {
        // Determine if it's a new entry or an edit by checking for fishbowl_logID
        var httpMethod = item.fishbowl_logID ? "PUT" : "POST";
        
        $http({
            method: httpMethod,
            url: "fishbowl/fishbowl_log.php",
            data: item
        }).then(function() {
            alert.success("Fishbowl item " + (httpMethod === "PUT" ? "updated." : "submitted."));
            $scope.$close(item); // Close modal and pass the item back
        }, function(res) {
            alert.error(res.data || res.statusText);
        });
    };
}]);

