
//실행
$(document).ready(function(){
  //요소 위치 이동 + 토글 기능
//    removeClass();
//  changePosition();
  repeat();


});

function repeat()  {
  // $(".item.one")
  // .animate({height:'toggle'},200);
  // .animate({height:'toggle'},200, removeClass());

  $(".cast_flash.clfix .cntt .first_child a")
  .animate({height:'toggle'},2000,
    function(){
      removeClass();
      changePosition();
      $(".cast_flash.clfix .cntt .first_child a")
      .animate({height:'toggle'},2000,
        function(){
          removeClass();
        //  changePosition();
          $(".cast_flash.clfix .cntt .first_child a")
          .animate({height:'toggle'},2000,
            function(){
              removeClass();
              changePosition();
              addClass();
              toggleShow();
              repeat();
            })
        })
    })

  // $(".cast_flash.clfix .cntt .first_child a")
  // .animate({height:'toggle'},1500,
  //   function(){
  //     removeClass();
  //   //  toggleHide();
  //    //toggleShow();
  //     toggleShow();
  //   //  changePosition();
  //     //removeClass();
  //     changePosition();
  //   //  removeClass();
  //   //  changePosition();
  //     //addClass();
  //   //  toggleShow();
  //     repeat();
  //   })


}

//hovering으로 작업


// 모든 토글을 show로 변경
function toggleShow() {
   $li = $(".cntt li");
  if($li.is(':hidden')) {
    $(".cntt li").show();
  }
}

// 모든 토글을 hide로 변경
function toggleHide() {
   $li = $(".cntt li");
  if($li.is(':hidden')) {
    $(".cntt li").hide();
  }
  else {
    $(".cntt li").show();
  }
}

//item one클래스가 1~3 순으로 바뀜
function removeClass() {
  if(".cast_flash.clfix .cntt .first_child") {
    $(".cast_flash.clfix .cntt .first_child").next().addClass("first_child")
    .siblings().removeClass("first_child");
  }
}

//class 추가
function addClass() {
  if(".cast_flash.clfix .cntt .first_child") {
    $(".cast_flash.clfix .cntt .first_child").prev().prev().addClass("first_child")
    .siblings().removeClass("first_child");
    }
}

//위치 변경
 function changePosition() {
     $(".cast_flash.clfix .cntt .first_child").prependTo(".cast_flash.clfix .cntt ul");
  }
