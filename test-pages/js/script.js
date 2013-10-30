/* jshint es5: false, quotmark: false, unused: true */
/* global $ */

'use strict';

$(document).ready(function(){
  $("#i_am_a_textbox").focus(function(){$(this).val("");})
    .blur(function(){$(this).val("i has no focus");});


  window.resetFeedback = function() {
    $(".jumpOkButton").css("display", "none");
    $("form#jumpContact").css("display", "block");
    $(".formMessage").css("display", "none");
    $("#comments").attr("value", "");
    $("#comments").trigger("focus");
  };
  window.setupJumpFeedback = function(){
    $("#jumpContact input[type=submit]").button();
    $("form#jumpContact").submit(function() {
      $("#comments").trigger("focus");
      return false;
    });
  };
});
