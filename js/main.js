var app = angular.module( 'resourcesApp', [] );

app.controller( 'MainCtrl', function( $scope, $http ) {
  $scope.entries = [];
  $scope.resourceKeywords = [];
  $scope.researchKeywords = [];
  $scope.agencies = [];
  $scope.countries = [];

  // Get all the data from the Google Spreadsheet
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://spreadsheets.google.com/feeds/list/0Ar0WryGXky8cdG1mdnVUeGhjU040RjVWRko5YWkzWnc/od6/public/values?alt=json');
  xhr.onload = function() {
    var o = JSON.parse(this.responseText);
    console.log(o);
    $scope.safeApply(function() {
      $scope.entries = createNiceArray(o.feed.entry);
    });
  };
  xhr.send();

  var createNiceArray = function (arr) {
    var newArr = [];
    for (var i = 0; i < arr.length; i++) {
      var p = {
        url: arr[i].gsx$whatistheurloftheresourceyouaresharing.$t,
        resourceName: arr[i].gsx$whatisthenameoftheresourceyouareproviding.$t,
        agencyName: arr[i].gsx$whatfederalagencyhousesthisresource.$t,
        description: arr[i]['gsx$pleasewriteashortdescriptionofthisresource.'].$t,
        countries: arr[i]['gsx$pleaseindicatetowhichcountriesorregionsthisresourcemayspecificallyapplypleaseseparatebycommas.'].$t,
        researchKeywords: arr[i]['gsx$pleaseindicatekeywords-separatedbycommas-thatbestdescribethisresourcebyresearchfield.'].$t,
        resourceKeywords: arr[i]['gsx$pleaseindicatekeywords-separatedbycommas-thatbestdescribethisresourcebyfunction.'].$t
      };
      newArr.push(p);

      // Get uniques
      getUniques($scope.resourceKeywords, p.resourceKeywords);
      getUniques($scope.researchKeywords, p.researchKeywords);
      getUniques($scope.agencies, p.agencyName);
      getUniques($scope.countries, p.countries);
    }

    // Sort arrays
    $scope.resourceKeywords.sort(alphaSort());
    $scope.researchKeywords.sort(alphaSort());
    $scope.agencies.sort(alphaSort());
    $scope.countries.sort(alphaSort());

    return newArr;
  };

  var alphaSort = function (a, b) {
    if(a < b) return -1;
    if(a > b) return 1;
    return 0;
  };

  var getUniques = function (finalArr, toAdd) {
    if (toAdd) {
      toAdd = toAdd.split(',');
    } else {
      return;
    }
    for (var i = 0; i < toAdd.length; i++) {
      var testWord = toAdd[i].trim().toLowerCase();
      if (finalArr.indexOf(testWord) === -1) {
        finalArr.push(testWord);
      }
    }
  };

  

  $scope.safeApply = function(fn) {
    var phase = this.$root.$$phase;
    if(phase === '$apply' || phase === '$digest') {
      if(fn && (typeof(fn) === 'function')) {
        fn();
      }
    } else {
      this.$apply(fn);
    }
  };
});